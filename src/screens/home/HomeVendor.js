import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { hybridLocationPermission, navigateWithResetScreen, renderPicture, sharedCommasAmountConveter, sharedGetUserCartHandler } from "../../utils/sharedActions";
import AsyncStorage from '@react-native-community/async-storage';
import { calculateTimeDifference } from "../../utils/sharedActions";
import { getRequest } from '../../services/api';
import { DEVICE_WIN_HEIGHT, DEVICE_WIN_WIDTH, EMPTY_PROFILE_URL } from '../../config/config';
import commonIcons from '../../assets/svgIcons/common/common';
import CustomHeader from '../../components/header/CustomHeader';
import commonStyles from '../../styles/styles';
import CircularProgress from '../../components/progress';
import CustomToast from '../../components/toast/CustomToast';
import { useFocusEffect } from '@react-navigation/native';
import Notifications from '../../components/notifications/Notifications';
import RatingsModal from '../../components/modals/RatingsModal';
import { sharedOpenModal } from '../../utils/sharedActions';
import { getHubConnectionInstance } from '../../utils/sharedActions';
import { setFooterTabsAction } from '../../redux/actions/sharedReduxActions';
import LinearGradient from 'react-native-linear-gradient';
import SharedFooter from '../../components/footer/SharedFooter';


function HomeVendor(props) {
    // console.log('Home.Props :', props);
    const { navigation, userObj, activeTheme } = props;
    // console.log(userObj);

    const [state, setState] = useState({
        "isImgLoad": false,
        "contentView": {
            "height": 0,
            "width": 0
        },
        "activeSlide": 0,
        "isSmModalOpen":false,
        // modal types = {
        //     type: 1,
        //     name: 'tasks',
        //     type: 2,
        //     name: 'notifications'
        // }
        "modalType": 1,
        "openOrderDetails": {
            "noOfOrders": 0,
            "openOrderList": [
                {
                    "orderID": null,
                    "orderType": null,
                    "joviType": null,
                    "completedJobPercetage": null
                }
            ]
        },
        "finalDestObj": null
    })

    const fillPredefinedPlacesAndProceedToOrderBooking = async (isFinalDestSelected) => {
        // TODO: count needs to reverted below (to '3')
        if (!isFinalDestSelected && state?.openOrderDetails?.noOfOrders >= 999999999) {
            Alert.alert("Cannot create new order", "You have reached the maximum allowed limit of orders (3)");
            return;
        }

        const predefinedPlaces = await AsyncStorage.getItem("customerOrder_predefinedPlaces");
        if (predefinedPlaces) {
            goToOrderBooking(isFinalDestSelected);
        }
        else {
            getRequest(
                '/api/Order/GetAddress',
                {},
                props.dispatch,
                async (response) => {
                    let recievedAddresses = ((response && response.data && response.data.addresses) || []);//.slice(0, 15);
                    recievedAddresses = recievedAddresses.map((item, i) => ({
                        addressID: item.addressID,
                        description: item.title,
                        geometry: {
                            location: {
                                lat: parseFloat(item.latitude),
                                lng: parseFloat(item.longitude)
                            }
                        },
                        isFavourite: item.isFavourite ? item.isFavourite : false,
                        addressType: item.addressType ? item.addressType : null,
                        addressTypeStr: item.addressTypeStr ? item.addressTypeStr : null,
                    }));

                    await AsyncStorage.setItem("customerOrder_predefinedPlaces", JSON.stringify(recievedAddresses));
                    goToOrderBooking(isFinalDestSelected);
                },
                (error) => {
                    console.log(((error?.response) ? error.response : {}), error);
                    goToOrderBooking(isFinalDestSelected);
                },
                ''
            );
        }
    };

    const goToOrderBooking = async (isFinalDestSelected) => {
        if (isFinalDestSelected) {
            navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: null, selectDestination: true, fromHome: true, homeFooterHandler: {} });
        }
        else if (!state.finalDestObj) {
            navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: null, selectDestination: true, fromHome: true, homeFooterHandler: {} });
            // Alert.alert(
            //     'Final Destination is required',
            //     'You need to set Final Destination before placing an order! It will be used in all of your orders! Do you want to set it now?',
            //     [
            //         {
            //             text: 'No',
            //             onPress: () => { },
            //             style: 'cancel'
            //         },
            //         {
            //             text: 'Yes',
            //             onPress: async () => {
            //                 navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: null, selectDestination: true, fromHome: true, homeFooterHandler: {} });
            //             }
            //         }
            //     ],
            //     { cancelable: true }
            // );
        }
        else {
            const lastOrderTime = await AsyncStorage.getItem("customerOrder_lastOrderTime");
            const currentTime = new Date().getTime().toString();

            if (lastOrderTime && calculateTimeDifference(currentTime, lastOrderTime, "hours") < 24) {

                const dontAskBeforeReloadingOrder = await AsyncStorage.getItem("customerOrder_dontAskBeforeReloadingOrder");
                if (dontAskBeforeReloadingOrder) {
                    navigation.navigate("customer_order", { fetchPreviousOrder: true, openOrderID: null, selectDestination: false, fromHome: true, homeFooterHandler: {} });
                }
                else {
                    Alert.alert(
                        'Confirmation',
                        'Unconfirmed orders are saved for 24 hours! Do you want to re-open your existing order or a new one?',
                        [
                            {
                                text: 'Existing',
                                onPress: async () => {
                                    await AsyncStorage.setItem("customerOrder_dontAskBeforeReloadingOrder", "true");
                                    navigation.navigate("customer_order", { fetchPreviousOrder: true, openOrderID: null, selectDestination: false, fromHome: true, homeFooterHandler: {} });
                                },
                                style: 'cancel'
                            },
                            {
                                text: 'New',
                                onPress: async () => {
                                    await AsyncStorage.setItem("customerOrder_dontAskBeforeReloadingOrder", "true");
                                    navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: null, selectDestination: false, fromHome: true, homeFooterHandler: {} });
                                }
                            }
                        ],
                        { cancelable: true }
                    );
                }
            }
            else {
                navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: null, selectDestination: false, fromHome: true, homeFooterHandler: {} });
            }
        }
    };


    let data = {
        carousalImg: require('../../assets/slider-1.png'),
        promoData: [{ title: 'Create 3 pitstop and', des: 'win exciting prizes', btnTxt: 'Order now', img: require('../../assets/card-image.png') }, { title: 'Create 3 pitstop and', des: 'win exciting prizes', btnTxt: 'Order now', img: require('../../assets/card-image.png') }, { title: 'Create 3 pitstop and', des: 'win exciting prizes', btnTxt: 'Order now', img: require('../../assets/card-image.png') }, { title: 'Create 3 pitstop and', des: 'win exciting prizes', btnTxt: 'Order now', img: require('../../assets/card-image.png') }, { title: 'Create 3 pitstop and', des: 'win exciting prizes', btnTxt: 'Order now', img: require('../../assets/card-image.png') }, { title: 'Create 3 pitstop and', des: 'win exciting prizes', btnTxt: 'Order now', img: require('../../assets/card-image.png') },]
    };

    let valueFromCustomerOrderScreen = navigation.dangerouslyGetState()?.routes?.[0]?.state?.routes[0]?.params?.valueToHomeScreen;
    valueFromCustomerOrderScreen = (typeof (valueFromCustomerOrderScreen) === "number") ? valueFromCustomerOrderScreen : null;
    const renderTasksView = () => (
        state.openOrderDetails.openOrderList.map((item, i) => (
            <TouchableOpacity key={i} style={{ margin: 2, height: 50 }} onPress={() => {
                navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: item?.orderID, selectDestination: false, fromHome: true, homeFooterHandler: {} });
                showHideModal(false, "tasks");
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4), paddingLeft: 10 }}>{item.joviType === 1 ? "Jovi" : item.joviType === 2 ? "Restaurant" : item.joviType === 3 ? "Pharmacy" : "SuperMarket"}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4) }}>{item.completedJobPercetage.toString()}%</Text>
                        <CircularProgress size={40} text={null} progressPercent={item.completedJobPercetage} strokeWidth={7} pgColor={item.completedJobPercetage >= 100 ? props.activeTheme.default : "#74B570"} />
                    </View>
                </View>
            </TouchableOpacity>
        )));
    const renderNotificationsView = () => (
        <Notifications {...props}
            onPress={data => {
                showHideModal(false, "tasks");
                // console.log("parseInt(data) :", data)
                // for order history details
                // navigation.navigate("orders_stack", {
                //     screen: 'order_history_details', params: {
                //         dataParams: {
                //             jobCategory: 4,
                //             orderID: 853
                //         }, parentScreenState: {
                //             activeTab: 1
                //         }
                //     }
                // }
                // )
                if (data.entityType === "Complaint") {
                    sharedOpenModal({
                        dispatch: props.dispatch, visible: true, transparent: true, modalHeight: 250, modelViewPadding: 0,
                        ModalContent: <RatingsModal {...props} targetRecord={data} activeTheme={props.activeTheme} />, okHandler: () => { }, onRequestCloseHandler: () => { }, androidKeyboardExtraOffset: 0
                    })
                }
            }} />
    );

    useFocusEffect(
        useCallback(() => {
            const handleFocusOnMenu = async () => {
                const finalDestination = await AsyncStorage.getItem("customerOrder_finalDestination");
                getRequest("/api/Dashboard/GetOpenOrderDetails/List",
                    {},
                    props.dispatch,
                    res => {
                        const handleCase = async () => {
                            let tempArr = res.data.getOpenOrderDetails.openOrderList.length > 3 ?
                                res.data.getOpenOrderDetails.openOrderList.slice(res.data.getOpenOrderDetails.openOrderList.length - 3, res.data.getOpenOrderDetails.openOrderList.length)
                                :
                                res.data.getOpenOrderDetails.openOrderList;

                            let openOrderDetails = {
                                noOfOrders: tempArr.length,
                                openOrderList: tempArr
                            };

                            await AsyncStorage.setItem("home_tasksData", JSON.stringify(openOrderDetails));

                            setState(prevState => ({
                                ...prevState,
                                openOrderDetails: openOrderDetails,
                                finalDestObj: finalDestination ? JSON.parse(finalDestination)?.[0] : null
                            }));
                        };
                        handleCase();
                    },
                    err => {
                        if (err) CustomToast.error("Something went wrong");
                        setState(prevState => ({
                            ...prevState,
                            finalDestObj: finalDestination ? JSON.parse(finalDestination)?.[0] : null
                        }));
                    },
                    ""
                );
            };
            // sharedGetNotificationsHandler(postRequest, 1, 20, true, props.dispatch);
            handleFocusOnMenu();
        }, []),
        [valueFromCustomerOrderScreen]
    );

    useEffect(() => {
        getHubConnectionInstance("OrderCancelled")?.on("OrderCancelled", (responseStr, orderId) => {
            console.log(`RECEIVED -> 'OrderCancelled' :`, [responseStr, orderId]);

            const arrayOfOpenOrders = state?.openOrderDetails?.openOrderList;
            if (arrayOfOpenOrders && Array.isArray(arrayOfOpenOrders)) {
                const searchedOrder = arrayOfOpenOrders.filter((item) => orderId === item.orderID);
                if (searchedOrder && searchedOrder.length > 0) {
                    CustomToast.success("Your order was Cancelled by Rider!");
                    navigateWithResetScreen(0, [{ name: 'home', params: { valueToHomeScreen: new Date().getTime() } }]);
                }
            }
        });

        getHubConnectionInstance("OrderFinished")?.on("OrderFinished", (orderId) => {
            console.log(`RECEIVED -> 'OrderFinished' :`, [orderId]);

            const arrayOfOpenOrders = state?.openOrderDetails?.openOrderList;
            if (arrayOfOpenOrders && Array.isArray(arrayOfOpenOrders)) {
                const searchedOrder = arrayOfOpenOrders.filter((item) => orderId === item.orderID);
                if (searchedOrder && searchedOrder.length > 0) {
                    CustomToast.success("Your order was Finalized by Rider!");
                    navigateWithResetScreen(0, [{ name: 'home', params: { valueToHomeScreen: new Date().getTime() } }]);
                }
            }
        });
    }, [state]);

    useEffect(useCallback(() => {
        // const permissions = async () => await askForWholeAppPermissions();
        const locationHandler = async () => {
            sharedGetUserCartHandler(getRequest, false, 0);
            await hybridLocationPermission();
        }
        locationHandler();
    }, []), []);

    const showHideModal = (bool, modalType) => setState(prevState => ({ ...prevState, isSmModalOpen: bool, modalType }));

    const onFooterItemPressed = async (pressedTab, index) => {
        if (!pressedTab.pitstopOrCheckOutItemType) {
            props.dispatch(setFooterTabsAction({ pressedTab: { ...pressedTab, index, from: "home" } }));
            navigateWithResetScreen(null, [{ name: 'customer_cart_home', params: { screen: 'customer_cart' } }]);
        } else {
            const confirmFinalDestCallback = (origin) => {
                props.dispatch(setFooterTabsAction({ pressedTab: { ...pressedTab, index } }));
                navigateWithResetScreen(null, [{ name: 'super_market_home', params: { screen: 'dashboard' } }]);
            };
            const cancelFinalDestCallback = (origin) => {
                navigateWithResetScreen(null, [{ name: 'home', params: {} }]);
            };

            const finalDestination = await AsyncStorage.getItem("customerOrder_finalDestination");
            if (finalDestination) {
                confirmFinalDestCallback(pressedTab.title);
            }
            else {
                navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: null, selectDestination: true, fromHome: true, homeFooterHandler: { name: pressedTab.title, confirmFinalDestCallback, cancelFinalDestCallback } });
            }
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <CustomHeader
                leftIconHandsler={'toggle'}
                finalDestinationView={{
                    visible: (userObj?.firstName && state.finalDestObj?.title) ? true : false,
                    sticky: true,
                    onPressHandler: () => {
                        fillPredefinedPlacesAndProceedToOrderBooking(true);
                    },
                    userName: (userObj?.firstName) ? userObj.firstName : "",
                    finalDestObj: state.finalDestObj
                }}
                rightIconHandler={() => {
                    if (!userObj.appNotifications.getNotificationLogViewModel.data.length) return;
                    else showHideModal((state.modalType !== 1 && state.isSmModalOpen) ? false : true, 2)
                }}
                navigation={props.drawerProps.navigation}
                leftIcon={commonIcons.menueIcon(props.activeTheme)}
                // BodyComponent={() => (state.isSmModalOpen ? <ModalView {...state} /> : <BodyContent {...state} />)}
                BodyComponent={() => <View />}
                rightIcon={false}
                activeTheme={props.activeTheme}
                imgObject={{
                    imgSrc: userObj && userObj.picture ? userObj.isLocalChange ? userObj.picture : renderPicture(userObj.picture, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken)) : EMPTY_PROFILE_URL,
                    loaderBool: state.isImgLoad,
                    loaderCb: bool => setState(pre => ({ ...pre, isImgLoad: bool })),
                    imgStyles: { marginRight: 2, height: 32, width: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
                    title: state.openOrderDetails.noOfOrders >= 1 ? state.openOrderDetails.noOfOrders + ' Task' + (state.openOrderDetails.noOfOrders === 1 ? "" : "s") : null,
                    dropDownPress: () => showHideModal((state.modalType === 1 && state.isSmModalOpen) ? false : true, 1),
                    notificationsLength: userObj.appNotifications?.getNotificationLogViewModel?.data.filter(n => n.isRead === false).length
                }}
            />
            {
                state.isSmModalOpen ?
                    <View style={{
                        overflow: 'hidden',
                        height: 'auto',
                        maxHeight: state.modalType === 1 ? 170 : DEVICE_WIN_HEIGHT * 0.45,
                        width: state.modalType === 1 ? 220 : DEVICE_WIN_WIDTH * 0.8,
                        borderRadius: 10,
                        elevation: 2, shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84, borderWidth: 0.5, borderColor: props.activeTheme.lightGrey, backgroundColor: props.activeTheme.white, position: 'absolute',
                        zIndex: 999,
                        right: 13,
                        top: 75,
                        // bottom: 0,
                    }}>

                        {
                            state.modalType === 1 ?
                                renderTasksView()
                                :
                                renderNotificationsView()
                        }
                    </View>
                    : null
            }
            <LinearGradient
                style={{ height: 50, marginHorizontal: 12, margin: 5, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                colors={['#8168C9', '#413465']}
                onTouchEnd={() => {
                    if (state.isSmModalOpen) showHideModal(false, 1);
                }}
            >
                <Text style={{ ...commonStyles.fontStyles(20, props.activeTheme.white, 4), left: 20, flex: 0.7, }}>Vendors</Text>
                <TouchableOpacity style={{ flex: 0.15, alignItems: 'center', zIndex: 1 }} onPress={() => { }}>
                    <LinearGradient
                        colors={['#8168C9', '#413465']}
                        style={{
                            // left: 20,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 10,
                            height: 70,
                            width: 70,
                            borderRadius: 35,
                            // backgroundColor: "#8168C9",
                            borderColor: '#fff',
                            borderWidth: 0.5,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <SvgXml xml={commonIcons.footerJovi()} height={42} width={42} />
                    </LinearGradient>
                </TouchableOpacity>
                {/* <View style={{ alignItems: 'center', justifyContent: 'center', right: 10, flex: 0.8 }}>
                    <Text style={commonStyles.fontStyles(12, props.activeTheme.white, 4)}>YOUR BALANCE</Text>
                    <Text style={commonStyles.fontStyles(12, props.activeTheme.white, 4)}>RS {sharedCommasAmountConveter(userObj.balance)}</Text>
                </View> */}
            </LinearGradient>
            <TouchableOpacity style={{ flex: 1, margin: 12 }} activeOpacity={state.isSmModalOpen ? 1 : 0.5} onPress={() => {
                alert('Vendors')
                // if (state.isSmModalOpen) showHideModal(false, 1)
                // else fillPredefinedPlacesAndProceedToOrderBooking(false)
            }}>
                <ImageBackground
                    resizeMode="stretch"
                    source={data.carousalImg}
                    style={{ flex: 1 }}
                />
            </TouchableOpacity>
            <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.black, 4), marginLeft: 20 }}>Items</Text>
            <ScrollView style={{ flex: 1 }} onTouchEnd={() => {
                if (state.isSmModalOpen) showHideModal(false, 1);
            }}>
                <View style={{ flex: 1, marginHorizontal: 12, marginBottom: 35 }}>
                    {data.promoData.map((P, idx) => (
                        <View key={idx} style={{ height: 110, ...commonStyles.shadowStyles(null, null, null, null, 0.3), backgroundColor: '#fff', ...commonStyles.borderedViewStyles(10, 0, "#000"), flexDirection: 'row', marginVertical: 5 }}>
                            <View style={{ flex: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 1, '300'), padding: 2 }}>{P.title}</Text>
                                <Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.default, 1, '300'), padding: 2 }}>{P.des.toLocaleUpperCase()}</Text>
                                <TouchableOpacity style={{ alignSelf: 'flex-start', borderRadius: 25, padding: 7, justifyContent: 'center', alignItems: 'center', backgroundColor: activeTheme.default, left: 20, top: 5 }}>
                                    <Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.white, 4) }}>{P.btnTxt}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 2, overflow: 'hidden', borderRadius: 10 }}>
                                <ImageBackground
                                    resizeMode="cover"
                                    source={P.img}
                                    style={{
                                        flex: 1,
                                        top: 1
                                        // height: 'auto'
                                        // width: '100%',
                                        // "backgroundColor": 'transparent',
                                        // "opacity": 0.6,
                                        // "height": 170,
                                        // "width": '100%',
                                    }}
                                />
                            </View>

                        </View>
                    ))}

                </View>
            </ScrollView>
            {/* <SharedFooter activeTheme={activeTheme} activeTab={null} mainDrawerComponentProps={props} drawerProps={props.navigation.drawerProps} onPress={onFooterItemPressed} /> */}
        </View>
    )
}

const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer
    }
};

export default connect(mapStateToProps)(HomeVendor);



                // {/* Carousal Start */}
                // <View style={[menuStyles.carouselView]}>
                //     <CustomCarousel
                //         data={data}
                //         _onSnapToItemHandler={_onSnapToItemHandler}
                //         carouselRef={carouselRef}
                //         _renderItem={({ item, index }) => {
                //             return <ReacImage resizeMode="cover" source={item.slider} style={{
                //                 "backgroundColor": 'transparent',
                //                 "opacity": 0.6,
                //                 "height": 170,
                //                 "width": '100%',
                //             }} key={index} />
                //         }}
                //         winWidth={370}
                //     />
                //     <View style={{ height: '100%', width: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'column', position: 'absolute' }}>
                //         <View style={{ height: 20, width: 100, borderWidth: 0.1, borderColor: '#FFFFFF', borderRadius: 20, backgroundColor: '#FFFFFF', opacity: 0.6, marginBottom: 3 }}>
                //             <CustomPagination
                //                 dotsLength={data.length}
                //                 activeSlide={activeSlide}
                //                 paginationRef={paginationRef}
                //                 carouselRef={carouselRef}

                //             />
                //         </View>
                //     </View>
                // </View>
                // {/* Carousal End */}
                // <View style={menuStyles.contentView} onTouchEnd={() => {
                //     if (state.isSmModalOpen) showHideModal(false, 1);
                //     else fillPredefinedPlacesAndProceedToOrderBooking(false);
                // }}>
                //     <View style={{ flex: 1, flexDirection: 'row' }}>
                //         <View style={{ position: 'absolute', top: 30, marginHorizontal: 10 }}>
                //             <Text style={menuStyles.contentText}>Buy anything anywhere</Text>
                //             <TouchableOpacity hitSlop={{ top: 50 }} style={{
                //                 top: 10, height: 50, width: 100, backgroundColor: '#FFFFFF', borderRadius: 5, borderWidth: 0.2, borderColor: '#7359BE', flexDirection: 'row', justifyContent: "space-around", alignItems: 'center', shadowColor: "#000",
                //                 elevation: 3,
                //                 shadowOffset: {
                //                     width: 0,
                //                     height: 2,
                //                 },
                //                 shadowOpacity: 0.25,
                //                 shadowRadius: 3.84,
                //             }}>
                //                 <Text style={menuStyles.btnText}> Jovi</Text>
                //                 <SvgXml xml={svgIcons.arrowRight} height={25} width={25} />
                //             </TouchableOpacity>
                //         </View>
                //         <View style={{
                //             flex: 1
                //         }}>
                //             <ReacImage source={require('../../assets/Menu/maskGroup17.png')} resizeMode="cover" style={{ backgroundColor: 'transparent', width: DEVICE_SCREEN_WIDTH * 0.9, height: DEVICE_SCREEN_WIDTH * 0.5 * 1.76 }} />
                //         </View>
                //     </View>
                // </View>
                // {/* Footer start */}
                // <View style={[menuStyles.footerWrapper]}>
                //     {
                //         (BOTTOM_TABS || []).map((rec, i) => i <= 2 ? (
                //             <TouchableOpacity onPress={() => onFooterItemPressed(rec, i)} style={{ ...menuStyles.footerTabs, marginLeft: 0, position: 'relative', bottom: 50, justifyContent: "space-around", alignItems: 'center', flexDirection: 'column' }} key={i}>
                //                 <SvgXml xml={footerTabItems[i].img} style={{}} />
                //                 <Text style={menuStyles.thinText}>{rec.description}</Text>
                //                 <Text style={menuStyles.mainText}>{i === 0 ? 2 : i === 2 ? 14 : 0 + ' stores'}</Text>
                //             </TouchableOpacity>

                //         ) : null)
                //     }

                // </View>
                // {/* Footer end */}
