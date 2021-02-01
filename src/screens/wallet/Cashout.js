import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, ImageBackground } from 'react-native';
import commonStyles from '../../styles/styles';
import { SvgXml } from "react-native-svg";
import { getRequest, postRequest } from '../../services/api';
import { openModalAction, closeModalAction } from '../../redux/actions/modal';
import plateformSpecific from '../../utils/plateformSpecific';
import { ScrollView } from 'react-native-gesture-handler';
import CustomToast from '../../components/toast/CustomToast';
import { getHubConnectionInstance, sahredAddRecieptLines, sharedCommasAmountConveter, sharedOpenModal } from '../../utils/sharedActions';
import { userAction } from '../../redux/actions/user';
import { CONSTANTLATDELTA, CONSTANTLONGDELTA } from '../../config/config';
import { doneIcon } from "../../assets/svgIcons/customerorder/customerorder";
import allocatingRiderIcon from "../../assets/allocating-rider.gif";
import AsyncStorage from '@react-native-community/async-storage';
import errorIcon from '../../assets/svgIcons/rider/errorIcon.svg';
import DefaultBtn from '../../components/buttons/DefaultBtn';
import { CommonRiderAllocation } from '../../components/SharedComponents';
import { useFocusEffect } from '@react-navigation/native';


export default function Cashout(props) {
    // console.log("Cashout.Props:", props);
    // console.log('Cashout.navState :', props.navigation.dangerouslyGetState());
    let parentIndex = props.navigation.dangerouslyGetState().index,
        nestingIndex = props.navigation.dangerouslyGetState().routes[parentIndex].state.index,
        parentRoute = props.navigation.dangerouslyGetState().routes[parentIndex].state.routes[nestingIndex],
        // currentRoute = parentRoute?.params?.data || {};
        currentRoute = parentRoute?.params || {};
    // console.log("currentRoute", currentRoute);
    const createMsg = args => `Maximum amount you can enter for cashout order is PKR. ${sharedCommasAmountConveter(args.maxAmount)} after deducting PKR. ${sharedCommasAmountConveter(args.serviceCharges)} of service charges`

    let initState = {
        "riderNotFoundIterator": 0,
        "typedAmount": "",
        "isFocused": false,
        "showModal": true,
        "cashoutInfoMsg": "",
        "cashoutMaxAmount": 0,
        "cashoutPayload": {
            "orderTypeID": 3,
            "cashOutAmount": 0,
            "title": "",
            "latitude": null,
            "longitude": null,
            "latitudeDelta": CONSTANTLATDELTA,
            "longitudeDelta": CONSTANTLONGDELTA,
            "addressID": 0,
            "chargeType": 1,
            "cashoutImage": null
        }

    };
    const scrollRef = useRef(null);
    const MINIMUM_AMOUNT = 200;
    const [state, setState] = useState(initState);
    const openRiderModal = args => {
        let modalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: () => { },
            ModalContent: <CommonRiderAllocation {...props} orderInfo={args.createUpdateOrderVM} backScreen="home" />,
            modalFlex: 1.5,
            modelViewPadding: 0,
            // modalHeight={state.modalState.title === "Complaint" ? Dimensions.get('window').height * 0.3 : Dimensions.get('window').height * 0.4}
            // modalHeight: Dimensions.get('window').height * 0.3,
            // fadeAreaViewFlex: plateformSpecific(1, 0.6)
        };
        props.dispatch(openModalAction(modalComponent));
    };
    const addPitstop = () => {
        if (state.typedAmount < MINIMUM_AMOUNT) return CustomToast.success(`Cashout amount must be greater than or equal to ${MINIMUM_AMOUNT}`);
        postRequest("/api/Order/CahOut/AddOrUpdateCashOut", { ...state.cashoutPayload, cashOutAmount: state.typedAmount }, {}, props.dispatch, res => {
            if (res.data.statusCode === 200) {
                console.log("Response here---- :", res)
                setState(initState);
                CustomToast.success(res.data.message);
                getRequest('/api/Payment/Wallet/Balance',
                    {},
                    props.dispatch,
                    walletRes => {
                        if (walletRes.data.statusCode === 200) {
                            props.setUserWallet(walletRes.data.userBalance);
                            props.dispatch(userAction({ ...props.user, balance: walletRes.data.userBalance }));
                            openRiderModal({ createUpdateOrderVM: res.data.createUpdateOrderVM });
                        }
                    },
                    walletErr => {
                        // props.dispatch(closeModalAction());
                        CustomToast.error('Erro accured during getting user balance');
                        console.log("Erro During Getting user balance after cashout :", walletErr);
                    },
                    "",
                )
            }
        },
            err => {
                console.log("Error During Cashout Request :", err);
                if (err.errors.Wallet) CustomToast.error(err.errors.Wallet[0]);
                else if (err.errors.Error) CustomToast.error(err.errors.Error[0]);
            },
            "",
            true);
    };
    const backScreenCallBack = data => {
        // if (!data || data === null || data === undefined) return;
        // // problem is here now
        // calculateSeriveCharge(data);
        // setState(prevState => ({
        //     ...prevState,
        //     cashoutPayload: {
        //         ...prevState.cashoutPayload,
        //         addressID: data.addressID ? data.addressID : null,
        //         title: data.title,
        //         latitude: data.latitude,
        //         longitude: data.longitude,
        //         latitudeDelta: data.latitudeDelta ? data.latitudeDelta : state.cashoutPayload.latitudeDelta,
        //         longitudeDelta: data.longitudeDelta ? data.longitudeDelta : state.cashoutPayload.longitudeDelta,
        //         cashoutImage: data.cashoutImage || null
        //     }
        // }))

    };
    const selectLocation = () => {
        props.navigation.navigate("wallet_container", {
            screen: "select_dropof_location", data: props?.cashoutPayload || state.cashoutPayload, cb: data => backScreenCallBack(data)
        });
    };
    const calculateSeriveCharge = payload => {
        postRequest('/api/Order/GetServiceCharge',
            {
                "title": payload.title,
                "latitude": payload.latitude,
                "latitudeDelta": payload.latitudeDelta,
                "longitude": payload.longitude,
                "longitudeDelta": payload.latitudeDelta,
                "addressID": payload.addressID,
                "addressType": null
            },
            {},
            props.dispatch,
            res => {
                if (res.data.statusCode === 200) {
                    // let totalAmount = parseInt(state.typedAmount) + res.data.serviceChargeAmount;
                    // payloadRef.current = { ...state.cashoutPayload, addressID: state.cashoutPayload.addressID > 0 ? state.cashoutPayload.addressID : null, cashOutAmount: state.typedAmount };
                    setState(prevState => ({
                        ...prevState,
                        cashoutMaxAmount: res.data.maxAmountViewmodel.maxAmount,
                        cashoutInfoMsg: createMsg({ maxAmount: res.data.maxAmountViewmodel.maxAmount, serviceCharges: res.data.maxAmountViewmodel.serviceCharge || 0 }),
                        typedAmount: 0,
                        cashoutPayload: {
                            ...prevState.cashoutPayload,
                            cashOutAmount: 0
                        }
                    }));
                }
            },
            err => {
                console.log(err)
            },
            "",
        )
    };
    useEffect(() => {
        if (currentRoute?.doServerStuff) {
            // console.log('currentRoute?.doServerStuff :', currentRoute?.doServerStuff);
            // if (!currentRoute?.doServerStuff || currentRoute?.doServerStuff === null || currentRoute?.doServerStuff === undefined) return;
            calculateSeriveCharge(currentRoute?.doServerStuff);
            setState(prevState => ({
                ...prevState,
                cashoutPayload: {
                    ...prevState.cashoutPayload,
                    addressID: currentRoute?.doServerStuff.addressID ? currentRoute?.doServerStuff.addressID : null,
                    title: currentRoute?.doServerStuff.title,
                    latitude: currentRoute?.doServerStuff.latitude,
                    longitude: currentRoute?.doServerStuff.longitude,
                    latitudeDelta: currentRoute?.doServerStuff.latitudeDelta ? currentRoute?.doServerStuff.latitudeDelta : state.cashoutPayload.latitudeDelta,
                    longitudeDelta: currentRoute?.doServerStuff.longitudeDelta ? currentRoute?.doServerStuff.longitudeDelta : state.cashoutPayload.longitudeDelta,
                    cashoutImage: currentRoute?.doServerStuff.cashoutImage || null
                }
            }))
        }
        // return () => {
        //     console.log('Cashout cleared----');
        //     setState(pre => ({ ...pre, cashoutPayload: initState.cashoutPayload }));
        // }
    }, [currentRoute?.doServerStuff]);
    // useFocusEffect(() => {
    //     return () => {
    //         console.log('Cashout cleared----');
    //         setState(initState);
    //     }
    // }, [])
    // console.log('Cashout.State :', state);
    return (
        <View style={{
            // height: Platform.select({ ios: props.stackState.keypaidOpen ? Dimensions.get('window').height * 0.5 * 0.7 : undefined, android: undefined }),
            // flex: Platform.select({ ios: props.stackState.keypaidOpen ? 0 : 1, android: 1 }),
            flex: 1,
            backgroundColor: props.activeTheme.white,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            elevation: 3
        }}>
            <ScrollView ref={scrollRef}>
                <View style={{ padding: 15 }}>
                    <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1, "100"), { paddingBottom: 5, left: 5 }]}>
                        {"Enter drop off location"}
                    </Text>
                    <View style={{
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: 'rgba(0,0,0,0.1)',
                        // this
                        backgroundColor: (props.user.balance <= 0 || props.totalOrdersLength >= 3) ? props.activeTheme.disabledFieldColor : 'transparent',
                        // backgroundColor: 'transparent',
                        minHeight: 60,
                        justifyContent: "space-between",
                        alignItems: 'center',
                        flexDirection: 'row'
                    }}>
                        <TouchableOpacity
                            onPress={selectLocation}
                            style={{ width: '100%' }}
                            // this
                            disabled={(props.user.balance <= 0 || props.totalOrdersLength >= 3) ? true : false}

                        >
                            <Text style={{
                                // margin: 24,
                                // textAlign: 'center',
                                fontSize: 14,
                                justifyContent: "flex-start",
                                opacity: state.cashoutPayload.title ? 1 : 0.4,

                            }}>{state.cashoutPayload.title || "Location here..."}</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={gotoMapLocationPicker}>
                            <Image style={{ marginLeft: 5 }} height={25} width={25} source={locationIcon} />
                        </TouchableOpacity> */}

                    </View>
                </View>
                {
                    state.cashoutMaxAmount > 0 ?
                        <View style={{ paddingHorizontal: 15, bottom: 10 }}>
                            <View style={{ paddingBottom: 5 }}>
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1, "100"), { left: 5 }]}>
                                    {"Enter amount"}
                                </Text>
                            </View>
                            <TextInput
                                value={state.typedAmount.toString()}
                                style={{
                                    width: '100%',
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    // this
                                    backgroundColor: props.totalOrdersLength >= 3 ? props.activeTheme.disabledFieldColor : 'transparent',
                                    // backgroundColor: props.activeTheme.disabledFieldColor,
                                    borderColor: state.isFocused ? props.activeTheme.default : props.activeTheme.borderColor,
                                    paddingVertical: 0,
                                    height: 60,
                                    marginBottom: 10,
                                    paddingHorizontal: 10,
                                }}
                                returnKeyType="next"
                                keyboardType="numeric"
                                placeholder="Enter amount"

                                onFocus={() => {
                                    scrollRef.current.scrollToEnd({ animated: true });
                                    setState(pre => ({ ...pre, isFocused: true }));

                                }}
                                onBlur={() => setState(pre => ({ ...pre, isFocused: false }))}
                                onChangeText={val => {
                                    // if (parseInt(val) > 0 && parseInt(val) < 100) return CustomToast.error("Entered amount cannot be less than 100", Platform.select({ ios: 'top', android: 'bottom' }));
                                    if (parseInt(val) > state.cashoutMaxAmount) return CustomToast.error("Entered amount cannot be greater than maximum allowed amount", Platform.select({ ios: 'top', android: 'bottom' }));
                                    else setState(prevState => ({
                                        ...prevState,
                                        typedAmount: val ? parseInt(val) : "",
                                    }))
                                }}
                                // this
                                editable={props.totalOrdersLength >= 3 ? false : true}
                            // editable={true}

                            />
                        </View>
                        : null
                }
                {
                    state.cashoutInfoMsg ?
                        <View style={{ marginHorizontal: 10 }}>
                            <Text style={{ ...commonStyles.fontStyles(15, props.activeTheme.black, 2), padding: 10, textAlign: 'justify' }}>{state.cashoutInfoMsg}</Text>
                        </View>
                        : null
                }
                {
                    props.user.balance <= 0 ?
                        <View style={{ marginHorizontal: 10 }}>
                            <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.validationRed, 2), padding: 10, textAlign: 'center' }}>{"You cannot create order due to insufficient balance"}</Text>
                        </View>
                        : null
                }
                {
                    props.totalOrdersLength >= 3 ?
                        <View style={{ paddingTop: 10 }}>
                            <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.validationRed, 3), textAlign: 'center' }}>{
                                'Cannot create new order! You have reached the maximum allowed limit of orders (3)'}
                            </Text>
                        </View>
                        : null
                }
            </ScrollView>
            <View style={{ justifyContent: 'flex-end' }}>
                <DefaultBtn
                    title="Submit"
                    // this
                    disabled={state.cashoutPayload.title.length && state.typedAmount > 0 ? false : true}
                    // disabled={false}
                    // this
                    backgroundColor={(state.cashoutPayload.title.length && state.typedAmount > 0) ? props.activeTheme.default : props.activeTheme.lightGrey}
                    // backgroundColor={props.activeTheme.default}
                    onPress={addPitstop}
                />
            </View>
        </View>
    )
}





