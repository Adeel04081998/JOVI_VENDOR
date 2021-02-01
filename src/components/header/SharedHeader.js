import React, { Fragment, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CustomHeader from '../../components/header/CustomHeader';
import commonIcons from '../../assets/svgIcons/common/common';
import { BOTTOM_TABS, DEVICE_WIN_HEIGHT, DEVICE_WIN_WIDTH, EMPTY_PROFILE_URL } from '../../config/config';
import { navigateWithResetScreen, renderPicture, sharedOpenModal } from '../../utils/sharedActions';
import Notifications from '../notifications/Notifications';
import CircularProgress from '../progress';
import RatingsModal from '../modals/RatingsModal';
import AsyncStorage from '@react-native-community/async-storage';
import commonStyles from '../../styles/styles';
import { getRequest } from '../../services/api';

export default function SharedHeader(prs) {
    // console.log('SharedHeader :', prs)
    const { leftIconHandler, userObj, drawerProps, activeTheme, mainDrawerComponentProps, showLeftBackBtn, activeBottomTab } = prs;
    const initState = {
        'isSmModalOpen': false,
        'modalType': 0,
        'isImgLoad': false,
        "myTasks": {
            "noOfOrders": 0,
            "openOrderList": []
        },
        "finalDestination": null
    };
    const [state, setState] = useState(initState);
    // console.log('[SharedHeader].state :', state);
    useEffect(useCallback(() => {
        const getTasksData = async () => {
            const finalDestination = JSON.parse(await AsyncStorage.getItem("customerOrder_finalDestination"))[0];
            const myTasks = JSON.parse(await AsyncStorage.getItem("home_tasksData"));
            setState(pre => ({ ...pre, finalDestination, myTasks: { ...myTasks } }));
        };
        getTasksData();
    }), []);
    const showHideModal = (bool, modalType) => setState(prevState => ({ ...prevState, isSmModalOpen: bool, modalType }));
    const renderTasksView = () => (
        state.myTasks.openOrderList.map((item, i) => (
            <TouchableOpacity key={i} style={{ margin: 2, height: 50 }} onPress={() => {
                showHideModal(false, "tasks");
                drawerProps.navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: item?.orderID, selectDestination: false, fromHome: true, homeFooterHandler: {} });
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ ...commonStyles.fontStyles(14, activeTheme.black, 4), paddingLeft: 10 }}>{item.joviType === 1 ? "Jovi" : item.joviType === 2 ? "Restaurant" : item.joviType === 3 ? "Pharmacy" : "SuperMarket"}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Text style={{ ...commonStyles.fontStyles(14, activeTheme.black, 4) }}>{item.completedJobPercetage.toString()}%</Text>
                        <CircularProgress size={40} text={null} progressPercent={item.completedJobPercetage} strokeWidth={7} pgColor={item.completedJobPercetage >= 100 ? activeTheme.default : "#74B570"} />
                    </View>
                </View>
            </TouchableOpacity>
        )));
    const renderNotificationsView = () => (
        <Notifications
            {...prs}
            user={userObj}
            onPress={data => {
                console.log("parseInt(data.entityID) :", data)
                showHideModal(false, "tasks");
                if (data.entityType === "Complaint") {
                    sharedOpenModal({
                        dispatch: mainDrawerComponentProps.dispatch, visible: true, transparent: true, modalHeight: 250, modelViewPadding: 0,
                        ModalContent: <RatingsModal {...mainDrawerComponentProps} {...prs} targetRecord={data}
                            activeTheme={activeTheme}
                        />, okHandler: () => { }, onRequestCloseHandler: () => { }, androidKeyboardExtraOffset: 0
                    })
                }
            }} />
    );
    const fillPredefinedPlacesAndProceedToOrderBooking = async () => {
        const predefinedPlaces = await AsyncStorage.getItem("customerOrder_predefinedPlaces");
        if (predefinedPlaces) goToOrderBooking();
        else {
            getRequest(
                '/api/Order/GetAddress',
                {},
                mainDrawerComponentProps.dispatch,
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
                    goToOrderBooking();
                },
                (error) => {
                    console.log('[Super market home].fillPredefinedPlacesAndProceedToOrderBooking().error :', error);
                    goToOrderBooking();
                },
                '',
                true,
                false
            );
        }
    };
    const goToOrderBooking = () => {
        const name = "Groceries";

        const confirmFinalDestCallback = (origin) => {
            navigateWithResetScreen(null, [{ name: BOTTOM_TABS[activeBottomTab].route.container, params: { screen: BOTTOM_TABS[activeBottomTab].route.screen } }])
        };
        const cancelFinalDestCallback = (origin) => {
            navigateWithResetScreen(null, [{ name: BOTTOM_TABS[activeBottomTab].route.container, params: { screen: BOTTOM_TABS[activeBottomTab].route.screen } }])
        };

        drawerProps.navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: null, selectDestination: true, fromHome: true, homeFooterHandler: { name, confirmFinalDestCallback, cancelFinalDestCallback } });
    };
    return (
        <Fragment>
            <CustomHeader
                leftIconHandler={leftIconHandler || 'toggle'}
                finalDestinationView={{
                    visible: state?.finalDestination ?? false,
                    onPressHandler: fillPredefinedPlacesAndProceedToOrderBooking,
                    finalDestObj: state?.finalDestination,
                    userName: userObj?.firstName ?? "",
                    sticky: true

                }}
                rightIconHandler={() => {
                    if (!userObj.appNotifications.getNotificationLogViewModel.data.length) return;
                    else showHideModal((state.modalType !== 1 && state.isSmModalOpen) ? false : true, 2)
                }}
                navigation={drawerProps.navigation}
                leftIcon={showLeftBackBtn ? commonIcons.backIcon(activeTheme) : commonIcons.menueIcon(activeTheme)}
                BodyComponent={() => <View />}
                rightIcon={true}
                activeTheme={activeTheme}
                imgObject={{
                    imgSrc: userObj && userObj.picture ? userObj.isLocalChange ? userObj.picture : renderPicture(userObj.picture, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken)) : EMPTY_PROFILE_URL,
                    loaderBool: state.isImgLoad,
                    loaderCb: bool => setState(pre => ({ ...pre, isImgLoad: bool })),
                    imgStyles: { marginRight: 2, height: 32, width: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
                    title: state.myTasks.noOfOrders >= 1 ? state.myTasks.noOfOrders + ' Task' + (state.myTasks.noOfOrders === 1 ? "" : "s") : null,
                    dropDownPress: () => showHideModal((state.modalType === 1 && state.isSmModalOpen) ? false : true, 1),
                    notificationsLength: userObj.appNotifications?.getNotificationLogViewModel.data.filter(n => n.isRead === false).length
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
                        shadowRadius: 3.84, borderWidth: 0.5, borderColor: activeTheme.lightGrey, backgroundColor: activeTheme.white, position: 'absolute',
                        zIndex: 999,
                        right: 13,
                        top: 75,
                    }}>
                        {
                            state.modalType === 1 ?
                                renderTasksView()
                                : renderNotificationsView()

                        }
                    </View>
                    : null
            }
        </Fragment >
    )
}
