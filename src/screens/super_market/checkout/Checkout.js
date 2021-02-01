import React, { Fragment, useState, useEffect, useCallback, createRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, Switch, TextInput, KeyboardAvoidingView } from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';
import commonSvgIcons from '../../../assets/svgIcons/common/common';
import DefaultBtn from '../../../components/buttons/DefaultBtn';
import commonStyles from '../../../styles/styles';
import { SvgXml } from 'react-native-svg';
import { navigateWithResetScreen, renderPicture, sharedOpenModal } from '../../../utils/sharedActions';
import { DEVICE_SCREEN_WIDTH, DEVICE_WIN_HEIGHT, DEVICE_WIN_WIDTH } from '../../../config/config';
import { postRequest } from '../../../services/api';
import SmallLoader from '../../../components/loader/SmallLoader';
import { closeModalAction } from '../../../redux/actions/modal';
import CustomToast from '../../../components/toast/CustomToast';
import { CommonRiderAllocation, TempRiderAllocationModalUI } from '../../../components/SharedComponents';


export const OrderSummaryPopup = propsFromParent => {
    console.log("OrderSummaryPopup.propsFromParent :", propsFromParent);
    return <View style={{ flex: 1 }}>
        <View style={{ flex: 1, width: DEVICE_SCREEN_WIDTH, padding: 10 }}>
            <SvgXml xml={commonSvgIcons.super_order_question_mark()} height={50} width={50} style={{ alignSelf: 'center' }} />
            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                <Text style={{ ...commonStyles.fontStyles(18, undefined, 4), paddingVertical: 10 }}>Summary</Text>
                <View style={{ paddingVertical: 5 }}>
                    {[{ title: 'Products', rs: propsFromParent.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.totalProducts }, { title: 'Service charges', rs: propsFromParent.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.shippingCharges }].map((l, k) => (
                        <View key={k}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ ...commonStyles.fontStyles(16, undefined, 1) }}>{l.title}</Text>
                                <Text style={{ ...commonStyles.fontStyles(16, undefined, 1) }}>Rs. {l.rs}</Text>
                            </View>
                            <View style={{ borderBottomColor: propsFromParent.activeTheme.lightGrey, borderBottomWidth: 0.5, marginVertical: 10 }} />
                        </View>
                    ))}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ ...commonStyles.fontStyles(16, undefined, 4) }}>{"Total"}</Text>
                    <Text style={{ ...commonStyles.fontStyles(16, undefined, 4) }}>Rs. {propsFromParent.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.totalProducts + propsFromParent.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.shippingCharges}</Text>
                </View>
            </View>
        </View>
        <DefaultBtn title={'Confirm Order'} onPress={propsFromParent.onConfirmPress} />
    </View>
};

export const PromosPopup = props => {
    const propsFromParent = { ...props };
    const initState = {
        "showLoader": true,
        "promos": [],
        "pressedPromo": props?.selectedPromo ?? null,
        "typedPromo": props?.selectedPromo?.promotionCode ?? "",
        "promoLoader": false,
        "promoValidityObj": {
            "promoMsg": null,
            "statusCode": null
        }
    };
    const promosScrollRef = createRef(null);
    const [popupState, setPopupState] = useState(initState);
    // console.log("popupState", popupState);
    const selectUnselectPromo = (pressedPromo, idx, findFromArr) => {
        if (findFromArr) {
            popupState.promos.map((item, index) => {
                if (pressedPromo.promotionCode === item.promotionCode) {
                    let sortedPromos = [{ ...pressedPromo, promoId: 0 }, ...popupState.promos].filter((x, i) => {
                        if (i === 0) return x;
                        if (x.promotionCode !== pressedPromo.promotionCode) return x;
                    });
                    // console.log('sortedPromos :', sortedPromos);
                    setPopupState(pre => ({
                        ...pre,
                        promoValidityObj: initState.promoValidityObj,
                        pressedPromo: { ...pressedPromo, promoId: 0 },
                        typedPromo: pressedPromo.promotionCode,
                        promos: sortedPromos
                    }));
                    promosScrollRef?.current.scrollTo({ x: 0, y: 0, animated: true });
                }
            });

        }
        else setPopupState(pre => ({ ...pre, pressedPromo: { ...pressedPromo, promoId: idx }, typedPromo: pressedPromo.promotionCode }));
    };
    const _onSuccess = response => {
        console.log("_onSuccess :", response)
        if (response.data.statusCode === 200) setPopupState(pre => ({ ...pre, showLoader: false, promos: response.data.promos }));
        else if (response.data.statusCode === 404) setPopupState(pre => ({ ...pre, showLoader: false, promos: [] }));
    };
    const _onError = error => {
        console.log("_onError :", error)
        setPopupState(pre => ({ ...pre, showLoader: false }));
    };
    const onChangeText = value => {
        if (!value) return setPopupState(pre => ({ ...pre, pressedPromo: null, typedPromo: "", promoValidityObj: initState.promoValidityObj }));
        let findPromo = popupState.promos.find(item => item.promotionCode === value.toLocaleUpperCase())
        if (findPromo) selectUnselectPromo(findPromo, popupState.pressedPromo?.promoId, true);
        else setPopupState(pre => ({
            ...pre,
            pressedPromo: pre.pressedPromo,
            typedPromo: value,
            promoValidityObj: initState.promoValidityObj
        }));
    };
    const checkPromoValidity = () => {
        setPopupState(pre => ({ ...pre, promoLoader: true }));
        postRequest(`/api/SuperMarket/CheckPromoCode/${popupState.typedPromo}`,
            {},
            {},
            propsFromParent.mainDrawerComponentProps.dispatch,
            res => {
                console.log("checkPromoValidity res :", res);
                setPopupState(pre => ({ ...pre, promoLoader: false, promoValidityObj: { promoMsg: res.data.statusCode === 200 ? "Valid code" : "Invalid Code", statusCode: res.data.statusCode } }));
            },
            err => {
                if (err) {
                    console.log('checkPromoValidity.err :', err);
                    setPopupState(pre => ({ ...pre, promoLoader: false, promoValidityObj: { promoMsg: err.statusCode === 417 ? "Invalid Code" : "", statusCode: err.statusCode || 417 } }));
                }
            },
            '',
            false
        );
    };
    useEffect(useCallback(() => {
        postRequest(
            `/api/Order/Promotion/List`,
            {},
            {},
            propsFromParent.mainDrawerComponentProps.dispatch,
            res => _onSuccess(res),
            err => _onError(err),
            "",
            false
        )
    }), [])
    return <View style={{ flex: 1, width: DEVICE_SCREEN_WIDTH }}>
        <View style={{ flex: 1, padding: 10 }} behavior="position">
            <TouchableOpacity style={{ alignSelf: 'flex-end', paddingHorizontal: 10 }} onPress={() => props.onPromoAction(popupState.pressedPromo)}>
                <SvgXml xml={`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <g id="close" transform="translate(0.034 0.033)">
    <g id="Group_1191" data-name="Group 1191" transform="translate(-0.034 -0.033)">
      <path id="Path_1705" data-name="Path 1705" d="M22.219,19.971,39.55,2.677a1.56,1.56,0,0,0-2.206-2.2L20.013,17.754,2.683.474a1.561,1.561,0,1,0-2.209,2.2L17.791,19.971.474,37.265a1.561,1.561,0,1,0,2.209,2.2L20.013,22.175,37.344,39.469a1.561,1.561,0,0,0,2.207-2.2Z" transform="translate(0.034 0.033)" fill="#7359be"/>
    </g>
  </g>
</svg>
`} height={15} width={15} />
            </TouchableOpacity>
            <View style={{
                marginVertical: 15,
                marginHorizontal: 5,
                flexDirection: 'row',
                borderRadius: 5,
                elevation: 0.5
            }}>
                <TextInput maxLength={8} autoCapitalize={"characters"} value={popupState?.typedPromo ?? ""} style={{ flex: 1, height: 50, paddingHorizontal: 10 }} placeholder="Add promo code" onChangeText={onChangeText} />
                <TouchableOpacity onPress={checkPromoValidity}>
                    <View style={{ height: 50, width: 50, borderRadius: 5, backgroundColor: propsFromParent.activeTheme.default, justifyContent: 'center', alignItems: 'center' }}>
                        {
                            popupState.promoLoader ? <SmallLoader isActivityIndicator={true} size="small" color="#fff" />
                                :
                                <Text style={{ ...commonStyles.fontStyles(15, '#fff', 1) }}>Get</Text>
                        }
                    </View>
                </TouchableOpacity>
            </View>
            {
                popupState.promoValidityObj.promoMsg ?
                    <Text style={{ ...commonStyles.fontStyles(15, popupState.promoValidityObj.statusCode === 200 ? "#008000" : propsFromParent.activeTheme.validationRed, 1), textAlign: 'center' }}>{popupState.promoValidityObj.promoMsg}</Text>
                    : null
            }
            {popupState.showLoader ?
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <SmallLoader isActivityIndicator={true} size={"large"} />
                </View>
                :
                <ScrollView keyboardShouldPersistTaps="always" ref={promosScrollRef}>
                    {
                        popupState.promos.map((P, key) => (
                            <TouchableOpacity key={key} style={{ margin: 7 }} onPress={() => selectUnselectPromo(P, key)}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ ...commonStyles.fontStyles(15, propsFromParent.activeTheme.grey, 1) }}>{P.promotionCode.toLocaleUpperCase()}</Text>
                                    {
                                        popupState.typedPromo.length < 8 ?
                                            <View />
                                            :
                                            // P.selected ? <SvgXml xml={commonSvgIcons.tickIcon()} height={15} width={15} />
                                            (popupState.typedPromo === popupState.pressedPromo?.promotionCode && key === popupState.pressedPromo?.promoId) ? <SvgXml xml={commonSvgIcons.tickIcon()} height={15} width={15} />
                                                :
                                                <View />
                                    }
                                </View>
                                <Text style={{ ...commonStyles.fontStyles(15, undefined, 1), paddingVertical: 5 }}>{P.description}</Text>
                                <View style={{ borderBottomColor: propsFromParent.activeTheme.lightGrey, borderBottomWidth: 1, paddingVertical: 3 }} />
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            }
        </View>
        <DefaultBtn
            title="Apply"
            disabled={popupState.promoValidityObj.statusCode === 200 ? false : true}
            backgroundColor={popupState.promoValidityObj.statusCode === 200 ? null : propsFromParent.activeTheme.lightGrey}
            onPress={() => props.onPromoAction(popupState.pressedPromo)}
        />
    </View>
};

export default props => {
    let initStat = {
        "showPaymentMethods": false,
        "isJoviWalletSelected": true,
        "selectedPromo": null,
        "productNotFoundQ": 1,
        "googleMapsDistanceTimeVM": {
            "distance": 0,
            "distanceStr": "",
            "timeStr": "",
            "time": 0
        },
    };
    const [state, setState] = useState(initStat);
    const checkOutItemType = props.mainDrawerComponentProps.footerNavReducer.pressedTab?.pitstopOrCheckOutItemType ?? 1
    console.log("Checkout.Props :", props);
    // if (props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM) {
    // }
    // console.log("Checkout.state :", state);

    const onPromoAction = selectedPromo => {
        props.mainDrawerComponentProps.dispatch(closeModalAction());
        setState(pre => ({ ...pre, selectedPromo }));
    };



    const createUpdateOrder = () => {
        let pitstopItemsList = [];
        for (let j = 0; j < props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].checkOutItemsListVM.length; j++) {
            pitstopItemsList.push({
                "pitstopItemID": props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].checkOutItemsListVM[j].pitstopItemID,
                "pitstopItemName": props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].checkOutItemsListVM[j].productItemName,
                "quantity": props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].checkOutItemsListVM[j].quantity,
                "prescriptionImage": props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].checkOutItemsListVM[j]?.prescriptionImage ?? "",
                "prescriptionDesc": props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].checkOutItemsListVM[j]?.prescriptionDesc ?? "",
            });
        };
        // console.log("pitstopItemsList :", pitstopItemsList);
        let payload = {
            "userID": "",
            "orderID": 0,
            "promotionCode": state.selectedPromo?.promotionCode ?? "",
            "orderType": 2,
            "joviType": 4,
            "finalPitstop": {
                // ...props?.mainDrawerComponentProps.user.finalDestination,
                "addressID": props.mainDrawerComponentProps.user.finalDestination?.addressID ?? 0,
                "addressLine1": props.mainDrawerComponentProps.user.finalDestination?.title ?? "",
                "addressType": props.mainDrawerComponentProps.user.finalDestination?.addressType ?? 0,
                "isFavorite": props.mainDrawerComponentProps.user.finalDestination?.isFavorite ?? false,
                "latitude": props.mainDrawerComponentProps.user?.finalDestination?.latitude ?? "",
                "latitudeDelta": props.mainDrawerComponentProps.user?.finalDestination?.latitudeDelta ?? "",
                "longitude": props.mainDrawerComponentProps.user?.finalDestination?.longitude ?? "",
                "longitudeDelta": props.mainDrawerComponentProps.user?.finalDestination?.longitudeDelta ?? "",
            },
            "pitstopsList": [
                {
                    "pitstopID": props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].checkOutItemsListVM[0].pitstopID,
                    "pitstopItemsList": pitstopItemsList
                }

            ],
            "paymentMethod": state.isJoviWalletSelected ? 1 : 2,
            "productNotFoundQ": state.productNotFoundQ,
            "distance": state.googleMapsDistanceTimeVM.distance,
            "time": state.googleMapsDistanceTimeVM.time,
            "checkOutItemType": checkOutItemType
        };
        postRequest(`/api/SuperMarket/AddUpdateOrder`,
            payload,
            {},
            props.mainDrawerComponentProps.dispatch,
            res => {
                console.log("createUpdateOrder res :", res);
                if (res.data.statusCode === 200) {
                    // Temp Demo case
                    sharedOpenModal({
                        dispatch: props.mainDrawerComponentProps.dispatch,
                        visible: true,
                        modalFlex: 1.5,
                        transparent: true,
                        modalHeight: 0,
                        modelViewPadding: 0,
                        ModalContent: <TempRiderAllocationModalUI />,
                        okHandler: null,
                        onRequestCloseHandler: null,
                        androidKeyboardExtraOffset: 0
                    })
                    setTimeout(() => {
                        props.mainDrawerComponentProps.dispatch(closeModalAction());
                        navigateWithResetScreen(null, [{ name: 'super_market_home' }]);
                    }, 8000);

                    // Tempprary Case

                    // CustomToast.success('Your Order placed');
                    // props.mainDrawerComponentProps.dispatch(closeModalAction());
                    // navigateWithResetScreen(null, [{ name: 'super_market_home' }]);

                    // Real Case

                    // sharedOpenModal({
                    //     dispatch: props.mainDrawerComponentProps.dispatch,
                    //     visible: true,
                    //     modalFlex: 1.5,
                    //     transparent: true,
                    //     modalHeight: 0,
                    //     modelViewPadding: 0,
                    //     ModalContent: <CommonRiderAllocation {...props} orderInfo={{ orderID: res.data.orderID }} backScreen="super_market_home" />,
                    //     okHandler: null,
                    //     onRequestCloseHandler: null,
                    //     androidKeyboardExtraOffset: 0
                    // })
                }
            },
            err => {
                if (err) {
                    console.log('createUpdateOrder.err :', err);
                    CustomToast.error("Something went wrong");
                };
            },
            '',
            true
        );



        // Form data flow


        // let formData = new FormData();
        // for (let index = 0; index < Object.keys(payload).length; index++) {
        //     formData.append(Object.keys(payload)[index], payload[Object.keys(payload)[index]])
        // }
        // // console.log("formData :", formData);
        // postRequest(`/api/SuperMarket/AddUpdateOrder`,
        //     formData,
        //     { headers: { 'content-type': 'multipart/form-data' } },
        //     props.mainDrawerComponentProps.dispatch,
        //     res => {
        //         if (res) {
        //             console.log("createUpdateOrder res :", res);
        //         }
        //     },
        //     err => {
        //         if (err) {
        //             console.log('createUpdateOrder.err :', err);
        //             // CustomToast.error();
        //         }
        //     },
        //     '',
        //     true
        // );
    };
    useEffect(() => {
        let pitstopsList = [...props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM].splice(1).map(p => p.smLatLng)
        postRequest(`/api/SuperMarket/GetTimeofDelivery`,
            {
                "startPitstop": props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].smLatLng,
                "pitstopsList": [
                    ...pitstopsList,
                    props.mainDrawerComponentProps.user?.finalDestination?.latitude.toString() + "," + props.mainDrawerComponentProps.user?.finalDestination?.longitude.toString(),
                ]
            },
            {},
            props.mainDrawerComponentProps.dispatch,
            res => {
                console.log("googleMapsDistanceTimeVM res :", res);
                if (res.data.statusCode === 200) setState(pre => ({ ...pre, googleMapsDistanceTimeVM: res.data.googleMapsDistanceTimeVM }));

            },
            err => {
                if (err) {
                    console.log('googleMapsDistanceTimeVM.err :', err);
                    // CustomToast.error();
                }
            },
            '',
            true
        );
        return () => {

        }
    }, []);
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader
                leftIconHandler={() => props?.mainDrawerComponentProps?.navigation?.navigate("customer_cart")}
                rightIconHandler={null}
                navigation={props.mainDrawerComponentProps.navigation}
                leftIcon={commonSvgIcons.headerBackIcon()}
                bodyContent={"CHECKOUT"}
                rightIcon={null}
                activeTheme={props.activeTheme}
            />
            <ScrollView style={{ flex: 1, paddingHorizontal: 15 }}>
                <View style={{ paddingVertical: 5 }}>
                    <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), margin: 5 }}>What do we do if we dont find your product?</Text>
                    <View style={{ ...commonStyles.shadowStyles(null, null, null, 5), ...commonStyles.borderedViewStyles(7), backgroundColor: '#fff' }}>
                        {['Replace it with a similar one(price/characteristics) without asking you', 'Ask you when we are choosing your products'].map((x, key) => (
                            <Fragment key={key}>
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }} onPress={() => setState(pre => ({ ...pre, productNotFoundQ: key + 1 }))}>
                                    {
                                        (key + 1) === state.productNotFoundQ ?
                                            <View style={{ ...commonStyles.borderedViewStyles(10, 0.5, props.activeTheme.default), height: 15, width: 15, alignItems: 'center', justifyContent: 'center' }}>
                                                <View style={{ ...commonStyles.borderedViewStyles(10, 0.5), height: 8, width: 8, margin: 3, backgroundColor: props.activeTheme.default }} />
                                            </View>
                                            :
                                            <View style={{ ...commonStyles.borderedViewStyles(10, 0.5, props.activeTheme.default), height: 15, width: 15 }} />
                                    }
                                    <Text style={{ ...commonStyles.fontStyles(undefined, undefined, 1), paddingHorizontal: 10 }}>{x}</Text>
                                </TouchableOpacity>
                                {
                                    key === 0 ? <View style={{ borderBottomColor: props.activeTheme.lightGrey, borderBottomWidth: 0.5 }} /> : null
                                }
                            </Fragment>
                        ))}

                    </View>
                </View>

                <View style={{}}>
                    <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), margin: 5 }}>Checkout</Text>
                    <View style={{ ...commonStyles.shadowStyles(null, null, null, 5), ...commonStyles.borderedViewStyles(7), backgroundColor: '#fff' }}>
                        {[{ icon: commonSvgIcons.super_pinIcon(), txt: props.mainDrawerComponentProps.user?.finalDestination?.title, upperCase: true }, { icon: commonSvgIcons.super_clock(), txt: `Time of delivery, ${state.googleMapsDistanceTimeVM.timeStr}`, upperCase: false }].map((x, key) => (
                            <Fragment key={key}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                                    <SvgXml xml={x.icon} height={20} width={20} />
                                    <Text style={{ ...commonStyles.fontStyles(undefined, undefined, 1), paddingHorizontal: 10 }}>{x.txt}</Text>
                                </View>
                                {
                                    key === 0 ? <View style={{ borderBottomColor: props.activeTheme.lightGrey, borderBottomWidth: 0.5 }} /> : null
                                }
                            </Fragment>
                        ))}
                    </View>

                </View>

                <View style={{ paddingVertical: 10 }}>
                    <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => setState(pre => ({ ...pre, showPaymentMethods: !pre.showPaymentMethods }))}>
                        <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), marginLeft: 10 }}>Payment method</Text>
                        <SvgXml xml={state.showPaymentMethods ? commonSvgIcons.super_arrow_down() : commonSvgIcons.super_tag_next()} height={25} width={25} />
                    </TouchableOpacity>
                    {
                        state.showPaymentMethods ? <Fragment>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 }}>
                                <View style={{ marginLeft: 10, }}>
                                    <Text style={{ ...commonStyles.fontStyles(16, undefined, 4) }}>
                                        {`Wallet ( ${props?.mainDrawerComponentProps?.user?.balance} )`}
                                    </Text>
                                    <Text style={{ ...commonStyles.fontStyles(14, undefined, 2), paddingVertical: 3 }}>
                                        Use jovi wallet first
                            </Text>
                                </View>
                                <Switch
                                    trackColor={{ false: "#767577", true: props.activeTheme.switchActiveColor }}
                                    thumbColor={"#fff"}
                                    ios_backgroundColor="#767577"
                                    onValueChange={val => setState(pre => ({ ...pre, isJoviWalletSelected: val }))}
                                    value={state.isJoviWalletSelected}
                                />
                            </View>
                            {[
                                {
                                    title: 'Topup', icon: commonSvgIcons.super_tag_next(), onPress: () => props?.mainDrawerComponentProps?.navigation?.navigate("wallet_container", {
                                        screen: "wallet_child_container",
                                        backScreenObject: {
                                            container: "customer_cart_home",
                                            screen: "customer_checkout"
                                        },
                                        fromParamsState: {
                                            cash: {
                                                activeBox: 1
                                            }
                                        }
                                    })
                                },
                                { title: 'Cash on delivery', icon: null, onPress: () => { } }
                            ].map((z, j) => (
                                <TouchableOpacity key={j} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 }} onPress={z.onPress}>
                                    <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), marginLeft: 10 }}>{z.title}</Text>
                                    {
                                        z.icon === null ?
                                            <View style={{ ...commonStyles.borderedViewStyles(10, 0.5, props.activeTheme.default), height: 15, width: 15, alignItems: 'center', justifyContent: 'center' }}>
                                                <View style={{ ...commonStyles.borderedViewStyles(10, 0.5), height: 8, width: 8, margin: 3, backgroundColor: props.activeTheme.default }} />
                                            </View>
                                            :
                                            <SvgXml xml={z.icon} height={20} width={20} />

                                    }
                                </TouchableOpacity>
                            ))}
                        </Fragment>
                            :
                            null
                    }

                </View>
                <TouchableOpacity style={{ paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => sharedOpenModal({
                    dispatch: props.mainDrawerComponentProps.dispatch, visible: true, transparent: true, modalHeight: DEVICE_WIN_HEIGHT * 0.5, modelViewPadding: 0, ModalContent: <PromosPopup {...props} onPromoAction={onPromoAction} selectedPromo={state.selectedPromo} />, okHandler: () => { }, onRequestCloseHandler: null, androidKeyboardExtraOffset: 0
                })}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <SvgXml xml={commonSvgIcons.super_tag()} height={20} width={20} />
                        <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), marginLeft: 10 }}>{state.selectedPromo?.promotionCode ?? "Add promo code"} </Text>
                    </View>
                    <SvgXml xml={commonSvgIcons.super_tag_next()} height={25} width={25} />
                </TouchableOpacity>
                <View style={{ flex: 1, ...commonStyles.shadowStyles(null, null, null, 5), ...commonStyles.borderedViewStyles(7), backgroundColor: '#fff', marginBottom: 10 }}>
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1 }}>
                            {
                                // ([...props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM, ...props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM, ...props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM] || []).map((S, index) => (
                                (props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM || []).map((S, index) => (
                                    <View key={index}>
                                        <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), padding: 7, paddingLeft: 13 }}>{S.smName}</Text>
                                        <View style={{ borderTopColor: props.activeTheme.lightGrey, borderTopWidth: 0.5 }} />
                                        {
                                            S.checkOutItemsListVM.map((P, j) => (
                                                <View key={j}>

                                                    <View style={{ backgroundColor: '#fff', height: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <View style={{ borderRadius: 7, height: 50, width: 50, overflow: 'hidden' }}>
                                                                <ImageBackground resizeMode="cover" source={{ uri: renderPicture(P.productImages[0], props?.mainDrawerComponentProps?.user?.tokenObj?.token?.authToken) }} style={[{ flex: 1 }]} />
                                                            </View>
                                                            <View style={{ justifyContent: 'space-between' }}>
                                                                <Text style={{ ...commonStyles.fontStyles(15, props.activeTheme.default, 4), paddingLeft: 7 }}>
                                                                    {P.productItemName}
                                                                </Text>
                                                                <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.grey, 3), paddingLeft: 7 }}>
                                                                    {P.productAttribute}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View style={{ justifyContent: 'space-between' }}>
                                                            <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.default, 4), paddingLeft: 7 }}>
                                                                Rs. {P.price}
                                                            </Text>

                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: props.activeTheme.lightGrey, borderRadius: 20, width: 70, height: 25, top: 10 }}>
                                                                <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.default, 4), paddingLeft: 7 }}>
                                                                    Qty. {P.quantity}
                                                                </Text>
                                                                {/* {['-', P.quantity, '+'].map((btn, idx) => idx === 1 ? <Text key={idx} style={{}}>{btn}</Text> : 
                                                                <TouchableOpacity key={idx} style={{ backgroundColor: '#fff', height: 20, width: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }} disabled>
                                                                    <Text style={{}}>{btn}</Text>

                                                                </TouchableOpacity>)} */}
                                                            </View>
                                                        </View>
                                                    </View>
                                                    <View style={{ borderBottomColor: props.activeTheme.lightGrey, borderBottomWidth: 0.5 }} />
                                                    {/* {j === (S.checkOutItemsListVM.length - 1) ? null : <View style={{ borderBottomColor: props.activeTheme.lightGrey, borderBottomWidth: 0.5 }} />} */}

                                                </View>
                                            ))
                                        }

                                    </View>
                                ))
                            }
                        </ScrollView>
                        <View style={{ margin: 5 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ ...commonStyles.fontStyles(15, props.activeTheme.grey, 4), margin: 5, opacity: 0.7 }}>Shipping Charges</Text>
                                <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.grey, 4), opacity: 0.7 }}>
                                    Rs. {props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.shippingCharges}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ ...commonStyles.fontStyles(15, undefined, 4), margin: 5 }}>Total</Text>
                                <Text style={{ ...commonStyles.fontStyles(16, undefined, 4) }}>
                                    {/* Note this is temporary removed of delivery charges needs to be removed in future */}
Rs. {props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.totalProducts + props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.shippingCharges}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <DefaultBtn
                title={"Place Order"}
                onPress={() => sharedOpenModal({ dispatch: props.mainDrawerComponentProps.dispatch, visible: true, transparent: true, modalHeight: DEVICE_WIN_HEIGHT * 0.45, modelViewPadding: 0, ModalContent: <OrderSummaryPopup {...props} onConfirmPress={createUpdateOrder} />, okHandler: () => { }, onRequestCloseHandler: null, androidKeyboardExtraOffset: 0 })}
            />
        </View>
    )
};
