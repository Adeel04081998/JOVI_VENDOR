import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Image, Platform, TouchableOpacity, TouchableHighlight, Text, Alert, Dimensions, Switch, FlatList, BackHandler, Keyboard, Picker, ScrollView, KeyboardAvoidingView, AppState, ImageBackground } from "react-native";
import MapCustomer from "./MapCustomer";
import { connect } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useBackHandler } from '@react-native-community/hooks';
import LocationSearch from "./LocationSearch";
import plateformSpecific from '../../utils/plateformSpecific';
import { navigationHandler, getParamFromNavigation, navigateWithResetScreen, clearCustomerOrderStorage, sharedImagePickerHandler, askForAudioRecordPermission, renderPicture, getHubConnectionInstance, calculateTimeDifference } from "../../utils/sharedActions";
import { SvgXml } from "react-native-svg";
import moment from 'moment';
import pitstopCircle from "../../assets/svgIcons/customerorder/pitstop-circle.svg";
// import paymentPitstopCircle from "../../assets/svgIcons/customerorder/paymentpitstop-circle.svg";
import pitstopFieldCircle from "../../assets/svgIcons/customerorder/pitstopfield-circle.svg";
import menuIcon from "../../assets/svgIcons/common/menu-stripes.svg";
import crossIcon from "../../assets/svgIcons/common/cross-new.svg";
import { EMPTY_PROFILE_URL } from "../../config/config";
import houseIcon from "../../assets/svgIcons/customerorder/house-ico.svg";
import locateMeIcon from "../../assets/svgIcons/customerorder/locate-ico.svg";
import dropIcon from '../../assets/svgIcons/common/drop-down-arrow.svg';
import threeDotsIcon from '../../assets/svgIcons/common/three-dots.svg';
import errorIcon from '../../assets/svgIcons/rider/errorIcon.svg';
import topNoRiderFound from '../../assets/svgIcons/rider/topNoRiderFound.svg';
import retryNoRiderFound from '../../assets/svgIcons/rider/retryNoRiderFound.svg';
import cancelNoRiderFound from '../../assets/svgIcons/rider/cancelNoRiderFound.svg';
import { TextInput, TouchableWithoutFeedback, RectButton } from "react-native-gesture-handler";
import { clockIcon, backIcon, doneIcon, collapseIcon, expandIcon, favHomeIcon, favWorkIcon, /* favOtherIcon, */ favFriendsIcon, favFamilyIcon, upDownArrowsIcon } from "../../assets/svgIcons/customerorder/customerorder";
import { tabBike, tabBikeSelected, tabHome, tabHomeSelected, tabLocation, tabLocationSelected, tabDetails, tabDetailsSelected, ratingStar, cameraIcon, sendIcon, recordIcon, playIcon, pauseIcon } from "../../assets/svgIcons/customerorder/riderallocated";
import allocatingRiderIcon from "../../assets/allocating-rider.gif";
import CommonIcons from "../../assets/svgIcons/common/common";
import RangeSlider from 'rn-range-slider';
import AsyncStorage from '@react-native-community/async-storage';
import Swipeable from "react-native-gesture-handler/Swipeable";
import DraggableFlatList from "react-native-draggable-flatlist";
import BottomAlignedModal from '../../components/modals/BottomAlignedModal';
import { getRequest, postRequest } from '../../services/api';
import CustomToast from "../../components/toast/CustomToast";
import Spinner from 'react-native-spinkit';
import { Player, Recorder } from '@react-native-community/audio-toolkit';
import ImageView from "react-native-image-viewing";
import commonStyles from '../../styles/styles';
import CircularProgress from '../../components/progress';
import { Stopwatch, Timer } from 'react-native-stopwatch-timer';


function CustomerOrder({ navigation, route, userObj }) {

    // console.log(userObj);
    // console.log(userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken);

    const dispatch = (route && route.params && route.params.dispatch) || null;
    const activeTheme = (route && route.params && route.params.activeTheme) || {};

    const mapRef = React.createRef();
    // const swipableRefsInDragList = [];
    const swipableBottomActionRef = useRef(null);
    const pitstopsListRef = useRef(null);
    // const paymentPitstopsListRef = useRef(null);
    const retriedRequestTimeRef = useRef(new Date().getTime());

    const chatMessagesListRef = useRef(null);
    const recorderRef = useRef(null);
    const recordTimeRef = useRef(null);
    const playerRefsObj = useRef({});

    const initState = {
        mode: "pitstopDetails", // "pitstops" | "pinRegion" | "enterPitstop" | "pitstopDetails" | "pickTime" | "paymentPitstopSelect" | "paymentPitstopDetails" | "verifyOrder" | "orderPitstopDetails" | "riderAllocated" | "destPitstopDetails"
        previousMode: null,

        pitstops: [{ isDone: false, details: {} }],
        // pitstops: [{ "latitude": 33.64363527649992, "longitude": 73.06866740807891, "latitudeDelta": 0.0122, "longitudeDelta": 0.0068625000000000005, "title": "NA 60A, 7th Rd, Satellite Town, Rawalpindi, Punjab, Pakistan", "isDone": false, "details": { "buyForMe": true, "estCost": 0, "description": "Go there!" } }, { "latitude": 33.64363527649992, "longitude": 73.06866740807891, "latitudeDelta": 0.0122, "longitudeDelta": 0.0068625000000000005, "title": "Home", "isDone": false, "details": { "buyForMe": true, "estCost": 0, "description": "Go there!" } }, { "latitude": 33.65824972968349, "longitude": 73.07553118094802, "latitudeDelta": 0.0122, "longitudeDelta": 0.0068625000000000005, "title": "655 Service Rd South I 8, I-8/4 I 8/4 I-8, Islamabad, Islamabad Capital Territory, Pakistan", "isDone": false, "details": { "buyForMe": true, "estCost": 0, "estTime": "08:00", "description": "Reach here! Reach here! Reach here! Reach here! Reach here! Reach here!" } }],
        previousPitstops: null,

        pinRegion: null,

        focusedFieldIndex: 0,

        dftDetails: null, // { description: "", buyForMe: false, estTime: "HH:MM", estCost: 0 },

        isNew: true,

        loadedProfilePic: false,

        infoModalVisibleIndex: -1,

        promoModalVisible: false,
        promoCodesList: null,
        promoCodeSelected: "",
        promoCodeApplied: "",

        allocatingRiderModalVisible: false,
        allocatingRiderRetryString: "",

        isChanged_pitstopDetails: false,
        // isChanged_paymentPitstopSelect: false,

        isAdded_pitstop: false,
        // isAdded_responsiblePitstop: false,

        orderVerifyCollapsed: false,
        actionButtonsIndex: -1,

        keyboardShown: false,

        setFavModalVisible: false,
        favTypeSelected: -1,
        // favOtherValue: "",

        finalDestPreviousScreen: "",
        finalDestPreviousState: null,
        finalDestObj: null,
        // finalDestObj: { "latitude": 33.63369422234826, "longitude": 73.0682479776442, "latitudeDelta": 0.0122, "longitudeDelta": 0.0068625000000000005, "title": "Ali Mirza Barlas Rd, B-Block Block B Satellite Town, Rawalpindi, Punjab, Pakistan", "isDone": false, "details": {}, "isDestinationPitstop": true },
        isFinalDestOpened: false,

        tasksModalVisible: false,
        tasksData: null,

        // ---------------------------------------------------------------------------------------------

        orderID: null,
        orderRequestTime: null,
        riderAllocatedTabIndex: -1,
        loadOrderNextForOnce: false,
        isOrderOpenedFromHome: false,


        riderData: {}, // { image: "", userID: null, name: "Ahmed", rating: "4.8", registerationNo: "RIN-10-5912", model: "Red Pak Hero PH-70" },

        chatVisible: false,
        chatTyping: false,
        chatBoxValue: "",
        chatLoadedImages: [],
        chatViewingImageIndex: -1,
        chatAllowRecording: false,
        chatRecording: false,
        chatPlayingVoice: false,
        chatPlayingVoiceIndex: -1,
        chatMessages: [], // [{ message: "Hi how r u", picture: null, loadPicture: false, voice: null, loadVoice: false, type: "received", timeStamp: "26/08/2020 14:51" }]

        riderLocation: null, // { "latitude": 33.674608300630005, "longitude": 73.07020666077733, "latitudeDelta": 0.0122, "longitudeDelta": 0.0068625000000000005, "rotation": 0 }

        activePitstopIndex: 0,
        isOrderClosed: false
    };

    const [state, setState] = useState(initState);

    // EOS: End Of State

    useEffect(() => {
        if (state.mode === "riderAllocated" && state.riderAllocatedTabIndex === -1) {
            onChangeTab(0, true);
        }

        if (state.mode === "riderAllocated" && state.loadOrderNextForOnce) {
            fetchAndLoadOrder();
        }

        getHubConnectionInstance("RiderFound")?.on("RiderFound", (orderId) => {
            console.log(`RECEIVED -> 'RiderFound': `, [orderId]);

            if (state.allocatingRiderModalVisible && orderId === state.orderID) {
                getRequest("/api/Dashboard/GetOpenOrderDetails/List",
                    {},
                    dispatch,
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

                            if (state.orderID) {
                                navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: state.orderID, selectDestination: false, fromHome: false, homeFooterHandler: {} });
                            }
                        };
                        handleCase();
                    },
                    err => { },
                    ""
                );
            }
        });

        getHubConnectionInstance("NoRiderFound")?.on("NoRiderFound", (responseStr, orderId) => {
            console.log(`RECEIVED -> 'NoRiderFound': `, [responseStr, orderId]);

            const currentTime = new Date().getTime();
            const timeWhenOrderWasRequested = (state.orderRequestTime) ? state.orderRequestTime : currentTime;
            const timeDifferenceTillNow_sinceOrderRequested = calculateTimeDifference(currentTime, timeWhenOrderWasRequested, "minutes");

            console.log("-> timeWhenOrderWasRequested: ", timeWhenOrderWasRequested);
            console.log("-> timeDifferenceTillNow_sinceOrderRequested: ", timeDifferenceTillNow_sinceOrderRequested + " minute(s)");

            if (timeWhenOrderWasRequested && timeDifferenceTillNow_sinceOrderRequested < 1) {

                const timeWhenAutoRetriedRequest = retriedRequestTimeRef.current;
                const timeDifferenceTillNow_sinceAutoRetriedRequest = currentTime - timeWhenAutoRetriedRequest;

                // console.log("&");
                // console.log("-> timeWhenAutoRetriedRequest: ", timeWhenAutoRetriedRequest.toString());
                // console.log("-> timeDifferenceTillNow_sinceAutoRetriedRequest: ", timeDifferenceTillNow_sinceAutoRetriedRequest + " millisecond(s)");

                if (timeDifferenceTillNow_sinceAutoRetriedRequest < 900) {
                    console.log("-> Waiting for 6 seconds before initiating a new Auto Retry Order Request, without this it will create a loop of 'NoRiderFound'!")

                    setTimeout(() => {
                        const currentTime = new Date().getTime();

                        CustomToast.success("Trying to find a rider! Please wait...");
                        console.log("-> Auto Retrying Order Request!");
                        retriedRequestTimeRef.current = currentTime;
                        retryOrderRequest(true, (state.orderID || orderId));
                    }, 6000);
                }
                else {
                    CustomToast.success("Trying to find a rider! Please wait...");
                    console.log("-> Auto Retrying Order Request!");
                    retriedRequestTimeRef.current = currentTime;
                    retryOrderRequest(true, (state.orderID || orderId));
                }
            }
            else {
                console.log("-> Ask user to do retry Manually, waiting time is over!");
                setState((prevState) => ({
                    ...prevState,
                    allocatingRiderRetryString: responseStr,
                    orderRequestTime: null
                }));
            }
        });

        getHubConnectionInstance("RealtimeCoordinates")?.on("RealtimeCoordinates", (latitude, latitudeDelta, longitude, longitudeDelta, rotation, orderId, riderId) => {
            console.log(`RECEIVED -> 'RealtimeCoordinates' :`, [latitude, latitudeDelta, longitude, longitudeDelta, rotation, orderId, riderId]);

            if (riderId === state.riderData?.userID && orderId === state.orderID) {
                const locObj = {
                    latitude: parseFloat(latitude),
                    latitudeDelta: parseFloat(latitudeDelta),
                    longitude: parseFloat(longitude),
                    longitudeDelta: parseFloat(longitudeDelta),
                    rotation: parseFloat(rotation)
                };

                if (locObj.latitude) {
                    setState((prevState) => ({ ...prevState, riderLocation: { ...locObj } }));
                }
                else {
                    // setState((prevState) => ({ ...prevState, riderLocation: null }));
                }
            }
        });

        getHubConnectionInstance("Message")?.on("Message", (text, receiverId, senderId, messageId, orderId, filePath, timeStamp) => {
            console.log(`RECEIVED -> 'Message' :`, [text, receiverId, senderId, messageId, orderId, filePath, timeStamp]);

            if (receiverId === userObj?.userID && senderId === state.riderData?.userID && state.mode === "riderAllocated" && orderId === state.orderID) {
                if (state.chatVisible) {
                    console.log("Appropriate Message! Appending it to the loaded chat list!");
                    setState((prevState) => ({
                        ...prevState,
                        chatMessages: [
                            ...prevState.chatMessages,
                            {
                                message: text,
                                picture: (filePath && filePath.endsWith(".mp4") === false) ? filePath : null,
                                loadPicture: (filePath && filePath.endsWith(".mp4") === false) ? true : false,
                                voice: (filePath && filePath.endsWith(".mp4") === true) ? filePath : null,
                                loadVoice: (filePath && filePath.endsWith(".mp4") === true) ? true : false,
                                type: "received",
                                timeStamp: timeStamp
                            }
                        ]
                    }));
                }
            }
        });

        getHubConnectionInstance("OrderCancelled")?.on("OrderCancelled", (responseStr, orderId) => {
            console.log(`RECEIVED -> 'OrderCancelled' :`, [responseStr, orderId]);

            if (state.mode === "riderAllocated" && orderId === state.orderID) {
                CustomToast.success("Your order was Cancelled by Rider!");
                goToHome(false, { valueToHomeScreen: new Date().getTime() }, false);
            }
        });

        getHubConnectionInstance("JobCompleted")?.on("JobCompleted", (isOrderClosed, jobId, orderId, timeEnd = "TODO") => {
            console.log(`RECEIVED -> 'JobCompleted' :`, [isOrderClosed, jobId, orderId, timeEnd]);

            if (state.mode === "riderAllocated" && orderId === state.orderID) {
                let indexOfPitstopDone = 0;
                setState((prevState) => {
                    let updatedPitstops = JSON.parse(JSON.stringify(prevState.pitstops));
                    for (let i = 0; i < updatedPitstops.length; i++) {
                        if(jobId === updatedPitstops[i].jobID){
                            updatedPitstops[i].timeEnd = timeEnd;
                            indexOfPitstopDone = i;
                        }
                    }
                    return {
                        ...prevState,
                        pitstops: updatedPitstops
                    }
                });

                if (!isOrderClosed) {
                    CustomToast.success(`PitStop ${indexOfPitstopDone + 1} was Completed by Rider!`);
                }
                else {
                    CustomToast.success("Final PitStop was Completed by Rider!");
                }
            }
        });

        getHubConnectionInstance("OrderFinished")?.on("OrderFinished", (orderId) => {
            console.log(`RECEIVED -> 'OrderFinished' :`, [orderId]);

            if (state.mode === "riderAllocated" && orderId === state.orderID) {
                CustomToast.success("Your order was Finalized by Rider!");
                goToHome(false, { valueToHomeScreen: new Date().getTime() }, false);
            }
        });

        saveStateToStorage();
    }, [state]);


    useEffect(() => {
        const loadCustomerOrder = async () => {
            const orderIDToOpen = getParamFromNavigation(navigation, "openOrderID");
            const selectDestination = getParamFromNavigation(navigation, "selectDestination");
            const fromHome = getParamFromNavigation(navigation, "fromHome");
            const homeFooterHandler = getParamFromNavigation(navigation, "homeFooterHandler"); // homeFooterHandler = { name: string, confirmFinalDestCallback: function, cancelFinalDestCallback: function }

            const navFromHome = typeof (fromHome) === "boolean" && fromHome;

            const tasksData = await AsyncStorage.getItem("home_tasksData");

            if (typeof (orderIDToOpen) === "number") {
                setState({
                    ...initState,
                    mode: "riderAllocated",
                    loadedProfilePic: state.loadedProfilePic,
                    orderID: orderIDToOpen,
                    isOrderOpenedFromHome: navFromHome,
                    tasksData: tasksData ? JSON.parse(tasksData) : null
                });
            }

            else if (typeof (selectDestination) === "boolean" && selectDestination) {
                const finalDestination = await AsyncStorage.getItem("customerOrder_finalDestination");

                if (homeFooterHandler.name) {
                    setState({
                        ...initState,
                        mode: "destPitstopDetails",
                        pitstops: finalDestination ? JSON.parse(finalDestination) : JSON.parse(JSON.stringify(initState.pitstops)),
                        dftDetails: finalDestination ? { description: JSON.parse(finalDestination)?.[0]?.details?.description } : null,
                        isFinalDestOpened: true,
                        tasksData: tasksData ? JSON.parse(tasksData) : null,
                        homeFooterHandler: { ...homeFooterHandler }
                    });
                }
                else {
                    setState({
                        ...initState,
                        mode: "destPitstopDetails",
                        pitstops: finalDestination ? JSON.parse(finalDestination) : JSON.parse(JSON.stringify(initState.pitstops)),
                        dftDetails: finalDestination ? { description: JSON.parse(finalDestination)?.[0]?.details?.description } : null,
                        // finalDestPreviousScreen: (navFromHome) ? "HomeScreen" : state.mode,
                        // finalDestPreviousState: (navFromHome) ? null : { ...state, orderVerifyCollapsed: true, actionButtonsIndex: -1, allocatingRiderRetryString: "", orderRequestTime: null },
                        finalDestPreviousScreen: (navFromHome || !state.pitstops[0].latitude) ? "HomeScreen" : state.mode,
                        finalDestPreviousState: (navFromHome || !state.pitstops[0].latitude) ?
                            null
                            :
                            {
                                ...state,
                                mode: (state.mode === "verifyOrder") ? "verifyOrder" : "pitstops",
                                previousMode: null,
                                pitstops: state.pitstops.filter(item => item.latitude), // .map(item => ({ ...item, isPaymentPitstop: state.mode === "verifyOrder" ? item.isPaymentPitstop : false })),
                                dftDetails: null,
                                isChanged_pitstopDetails: false,
                                // isChanged_paymentPitstopSelect: (state.mode === "verifyOrder") ? true : false,
                                orderVerifyCollapsed: true,
                                actionButtonsIndex: -1,
                                tasksModalVisible: false,
                                allocatingRiderRetryString: "",
                                orderRequestTime: null
                            },
                        isFinalDestOpened: true,
                        tasksData: tasksData ? JSON.parse(tasksData) : null
                    });
                }
            }

            else {
                const finalDestination = await AsyncStorage.getItem("customerOrder_finalDestination");
                const lastOrder = await AsyncStorage.getItem("customerOrder_lastOrder");

                if (lastOrder) {
                    await AsyncStorage.removeItem("customerOrder_lastOrderTime");
                    await AsyncStorage.removeItem("customerOrder_lastOrder");

                    if (getParamFromNavigation(navigation, "fetchPreviousOrder") === true) {
                        setState({ ...JSON.parse(lastOrder), finalDestObj: JSON.parse(finalDestination)?.[0], tasksData: tasksData ? JSON.parse(tasksData) : null });
                    }
                    else {
                        setState((prevState) => ({
                            ...prevState,
                            finalDestObj: JSON.parse(finalDestination)?.[0],
                            tasksData: tasksData ? JSON.parse(tasksData) : null
                        }));
                    }
                }
                else {
                    setState((prevState) => ({
                        ...prevState,
                        finalDestObj: JSON.parse(finalDestination)?.[0],
                        tasksData: tasksData ? JSON.parse(tasksData) : null
                    }));
                }
            }
        };
        loadCustomerOrder();

        Keyboard.addListener("keyboardDidShow", () => { setState((prevState) => (((prevState.mode === "riderAllocated" && prevState.riderAllocatedTabIndex === 0) || (prevState.setFavModalVisible)) && prevState.keyboardShown === false) ? ({ ...prevState, keyboardShown: true }) : prevState) });
        Keyboard.addListener("keyboardDidHide", () => { setState((prevState) => (((prevState.mode === "riderAllocated" && prevState.riderAllocatedTabIndex === 0) || (prevState.setFavModalVisible)) && prevState.keyboardShown === true) ? ({ ...prevState, keyboardShown: false }) : prevState) });
    }, [route]);


    useFocusEffect(() => {
        const handleFocusEffect = async () => {
            await AsyncStorage.setItem("customerOrder_focused", "true");
        };
        handleFocusEffect();

        const handleFocusEffectCleanup = async () => {
            await AsyncStorage.setItem("customerOrder_focused", "false");
        };
        return handleFocusEffectCleanup;
    }, []);

    console.log("-");
    console.log('CUSTOMER_ORDER STATE :', state);



    const constantLatDelta = 0.0122;
    const constantLongDelta = (Dimensions.get("window").width / Dimensions.get("window").height) * 0.0122;
    const dateObj = new Date();
    const numberOfOrdersToShow = (state.tasksData?.noOfOrders ? (state.tasksData.noOfOrders - (state.mode === "riderAllocated" ? 1 : 0)) : 0);

    // BackHandler.addEventListener('hardwareBackPress', async () => {
    useBackHandler(async () => {
        const isCustomerOrderFocused = await AsyncStorage.getItem("customerOrder_focused");
        if (isCustomerOrderFocused !== "true") return true;

        if (state.mode === "pitstops") {
            goToHome(true, {}, true);
        }
        else if (state.mode === "pinRegion" || state.mode === "enterPitstop") {
            setMode(state.previousMode, state.focusedFieldIndex);
        }
        else if (state.mode === "pitstopDetails" || /* state.mode === "paymentPitstopDetails" || */ state.mode === "orderPitstopDetails" || state.mode === "destPitstopDetails") {
            onBackFromPitstopDetails();
        }
        else if (state.mode === "pickTime") {
            onEstTimeDecided("cancel");
        }
        // else if (state.mode === "paymentPitstopSelect") {
        //     onBackFromPaymentPitstop();
        // }
        else if (state.mode === "verifyOrder") {
            onBackFromVerifyOrder();
        }
        return true;
    });

    const leftIconHandler = () => {
        navigation.toggleDrawer();
    };

    const handleDismissKeyboardIOS = (event) => {
        event.persist();
        // console.log(event._targetInst.type);
        if (event._targetInst.type === "RCTMultilineTextInputView" || event._targetInst.type === "RCTSinglelineTextInputView" || (state.mode === "enterPitstop" && event._targetInst.type === "RCTImageView")) {
            //Dont Dismiss the keyboard if the target is a text field itself (to avoid keyboard's close and open fluctuation)
        }
        else if (state.mode === "riderAllocated" && state.riderAllocatedTabIndex === 0) {
            //Dont Dismiss the keyboard here also, because there is Chat in a ScrollView in this screen, in which scrolling should not close the Keyboard! P.S. the iOS handles dismissing the keyboard on a ScrollView when it is Touched
        }
        else {
            Keyboard.dismiss();
        }
    }

    const handleLocationSelected = (data, geometry, index, pinData, modifyPitstops = true, forceMode) => {

        Keyboard.dismiss();

        setState((prevState) => {

            let updatedPitstops = null;
            if (modifyPitstops) {
                updatedPitstops = JSON.parse(JSON.stringify(prevState.pitstops));
                for (let i = 0; i < updatedPitstops.length; i++) {
                    // delete updatedPitstops[i].lastChanged;
                }

                updatedPitstops[index] = {
                    latitude: geometry ? geometry.location.lat : pinData.latitude,
                    longitude: geometry ? geometry.location.lng : pinData.longitude,
                    latitudeDelta: constantLatDelta,
                    longitudeDelta: constantLongDelta,
                    title: data ? (data.name ? data.name : data.description) : pinData.title,
                    isDone: false,
                    // lastChanged: true,
                    details: updatedPitstops[index].details,
                    // isPaymentPitstop: updatedPitstops[index].isPaymentPitstop ? true : false,
                    // isResponsiblePitstop: updatedPitstops[index].isResponsiblePitstop ? true : false,
                    isDestinationPitstop: state.previousMode === "destPitstopDetails" ? true : false
                };

                if (data && data.addressID) updatedPitstops[index].addressID = data.addressID; //addressID will be available here, if it is a predefined/saved address

                if (data && data.isFavourite) {
                    updatedPitstops[index].isFavourite = data.isFavourite ? data.isFavourite : false;
                    updatedPitstops[index].addressType = data.addressType ? data.addressType : null;
                    // updatedPitstops[index].addressTypeStr = data.addressTypeStr ? data.addressTypeStr : null;
                }

                if (updatedPitstops[index].title) {
                    updatedPitstops[index].title = updatedPitstops[index].title.trim();
                }
            }

            return {
                ...prevState,
                mode: (prevState.mode === "pinRegion" || prevState.mode === "enterPitstop" || prevState.mode === "pitstops" || prevState.mode === "verifyOrder") ?
                    state.previousMode ?
                        state.previousMode
                        :
                        forceMode ? forceMode : "pitstopDetails"
                    :
                    prevState.mode,
                previousMode: null,
                pitstops: (modifyPitstops === true) ? updatedPitstops : prevState.pitstops,
                previousPitstops: modifyPitstops === false ? [...prevState.pitstops] : prevState.previousPitstops,
                pinRegion: pinData ? null : prevState.pinRegion,
                focusedFieldIndex: index,
                dftDetails: ((prevState.mode === "pinRegion" || prevState.mode === "enterPitstop" || prevState.mode === "pitstops" || prevState.mode === "verifyOrder") && prevState.dftDetails === null) ? { ...prevState.pitstops[index].details } : prevState.dftDetails,
                isChanged_pitstopDetails: (modifyPitstops === true) ? true : prevState.isChanged_pitstopDetails
            }
        });
    };

    const handleLocationAdded = () => {
        setState((prevState) => {

            let updatedPitstops = JSON.parse(JSON.stringify(prevState.pitstops));
            // for (let i = 0; i < updatedPitstops.length; i++) {
            //     delete updatedPitstops[i].lastChanged;
            // }

            updatedPitstops.push({ isDone: false, details: {} });

            return {
                ...prevState,
                mode: "pitstopDetails",
                previousMode: null,
                pitstops: updatedPitstops,
                previousPitstops: [...prevState.pitstops],
                focusedFieldIndex: updatedPitstops.length - 1,
                dftDetails: {},
                isAdded_pitstop: true
            }
        });
    };

    const deletePitstop = (index) => {
        Alert.alert(
            'Are you sure?',
            'Do you want to delete this pitstop?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        setState((prevState) => {

                            let updatedPitstops = JSON.parse(JSON.stringify(prevState.pitstops));
                            for (let i = 0; i < updatedPitstops.length; i++) {
                                // delete updatedPitstops[i].lastChanged;
                            }

                            if (updatedPitstops.length >= 2) {
                                updatedPitstops.splice(index, 1);

                                return {
                                    ...prevState,
                                    pitstops: updatedPitstops,
                                    orderVerifyCollapsed: true,
                                    actionButtonsIndex: -1,
                                    allocatingRiderRetryString: "",
                                    orderRequestTime: null
                                };
                            }
                            else {
                                clearOrderFromStorage();
                                return {
                                    ...initState,
                                    loadedProfilePic: state.loadedProfilePic,
                                    finalDestObj: prevState.finalDestObj,
                                    tasksData: state.tasksData
                                };
                            }
                        });
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const setMode = (mode, indexToSet, forcePreviousMode = null) => {
        setState((prevState) => ({
            ...prevState,
            mode: mode,
            previousMode: mode === "pinRegion" || mode === "enterPitstop" ? (forcePreviousMode ? forcePreviousMode : prevState.mode) : null,
            previousPitstops: /* mode === "paymentPitstopSelect" ? [...prevState.pitstops] : */ prevState.previousPitstops,
            pinRegion: mode === "pitstops" ? null : prevState.pinRegion,
            focusedFieldIndex: mode === "pitstops" ? null : indexToSet,
            dftDetails: mode === "pitstops" ? null : prevState.dftDetails,
            orderVerifyCollapsed: mode === "verifyOrder" ? true : prevState.orderVerifyCollapsed,
            allocatingRiderRetryString: mode === "verifyOrder" ? "" : prevState.allocatingRiderRetryString,
            actionButtonsIndex: mode === "verifyOrder" ? -1 : prevState.actionButtonsIndex
        }));
    };

    const setPinRegion = (newRegion, title) => {
        setState((prevState) => ({
            ...prevState,
            pinRegion: newRegion ? { ...newRegion, title: title } : { ...prevState.pinRegion, title: title },
        }));
    };

    const onPinLocationSelected = () => {
        handleLocationSelected(null, null, state.focusedFieldIndex, {
            latitude: state.pinRegion.latitude,
            longitude: state.pinRegion.longitude,
            title: state.pinRegion.title
        });
    };

    const goToHome = async (saveChangesToStorage, navParams = {}, clearIfNotSaved = true) => {
        if (saveChangesToStorage) {
            saveStateToStorage();
        }
        else {
            if (clearIfNotSaved) {
                clearOrderFromStorage();
            }
        }
        // navigationHandler("home", navParams);
        navigateWithResetScreen(0, [{ name: 'home', params: { ...navParams } }]);
    };

    const clearOrderFromStorage = async () => {
        await AsyncStorage.removeItem("customerOrder_lastOrderTime");
        await AsyncStorage.removeItem("customerOrder_lastOrder");
    };

    const saveStateToStorage = async () => {
        // this check does (and should) filter out all the points where the current state (existing order being created) doesn't need to be stored into AsyncStorage as cache.
        if (!state.isNew && state.orderID === null) {
            await AsyncStorage.setItem("customerOrder_lastOrderTime", dateObj.getTime().toString());
            await AsyncStorage.setItem("customerOrder_lastOrder",
                JSON.stringify({
                    ...state,
                    mode: "pitstops",
                    previousMode: null,
                    pitstops: state.pitstops.filter(item => item.latitude), // .map(item => ({ ...item, isPaymentPitstop: false })),
                    dftDetails: null,
                    isChanged_pitstopDetails: false,
                    // isChanged_paymentPitstopSelect: false,
                    orderVerifyCollapsed: true,
                    actionButtonsIndex: -1,
                    tasksModalVisible: false,
                    allocatingRiderRetryString: "",
                    orderRequestTime: null
                })
            );

            await AsyncStorage.setItem("customerOrder_dontAskBeforeReloadingOrder", "true");
        }
    };

    const animateToCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            mapRef.current && mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: constantLatDelta,
                longitudeDelta: constantLongDelta
            });
        }, (error) => {
            Alert.alert("Location Unavailable!", "Location is either turned off or not responding!");
        }, {
            timeout: 3000,
            // enableHighAccuracy: true,
            // maximumAge: 1000,
        });
    };

    const reRender = () => {
        setState((prevState) => {
            return {
                ...prevState,
            }
        });
    };

    const onChangeDetailsInput = (value, key) => {
        setState((prevState) => {
            let updatedDftDetails = { ...(prevState.dftDetails || {}) };

            updatedDftDetails[key] = value;

            if (key === "buyForMe" && !value) delete updatedDftDetails.estCost;

            return {
                ...prevState,
                dftDetails: updatedDftDetails,
                isChanged_pitstopDetails: true
            }
        });
    };

    const onCancelOrder = () => {
        Alert.alert(
            'Are you sure?',
            'Do you want to cancel this order?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        goToHome(false, {}, true);
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const onSaveDetails = () => {
        setState((prevState) => {

            let updatedPitstops = JSON.parse(JSON.stringify(prevState.pitstops));

            updatedPitstops[state.focusedFieldIndex].details = {
                ...(state.dftDetails || {})
            };

            let newMode = "";

            if (prevState.mode === "destPitstopDetails") {
                const handleCase = async () => {
                    const finalDestinationPreviouslySet = await AsyncStorage.getItem("customerOrder_finalDestination");

                    await AsyncStorage.setItem("customerOrder_finalDestination", JSON.stringify(updatedPitstops));

                    if (state.homeFooterHandler) {
                        state.homeFooterHandler.confirmFinalDestCallback(state.homeFooterHandler.name);
                    }
                    else {
                        if (state.finalDestPreviousScreen === "HomeScreen") {
                            if (!finalDestinationPreviouslySet) {
                                setState({ ...initState, loadedProfilePic: state.loadedProfilePic, finalDestObj: updatedPitstops?.[0], tasksData: state.tasksData });
                            }
                            else {
                                goToHome(false, { valueToHomeScreen: new Date().getTime() }, false);
                            }
                        }
                        else {
                            setState({ ...state.finalDestPreviousState, finalDestObj: updatedPitstops?.[0] });
                        }
                    }
                }
                handleCase();
                return prevState;
            }
            else if (prevState.mode === "pitstopDetails") {
                newMode = "pitstops";
            }
            // else if (prevState.mode === "paymentPitstopDetails") {
            //     newMode = "paymentPitstopSelect";
            // }
            else if (prevState.mode === "orderPitstopDetails") {
                newMode = "verifyOrder";
            }

            return {
                ...prevState,
                mode: newMode,
                previousMode: null,
                pitstops: updatedPitstops,
                previousPitstops: prevState.mode === "pitstopDetails" ? null : prevState.previousPitstops,
                pinRegion: null,
                // focusedFieldIndex: null,
                dftDetails: null,
                isNew: false,
                isChanged_pitstopDetails: false,
                isAdded_pitstop: newMode === "pitstops" ? prevState.isAdded_pitstop : false,
                // isAdded_responsiblePitstop: newMode === "paymentPitstopSelect" ? prevState.isAdded_responsiblePitstop : false,
                orderVerifyCollapsed: newMode === "verifyOrder" ? true : prevState.orderVerifyCollapsed,
                allocatingRiderRetryString: newMode === "verifyOrder" ? "" : prevState.allocatingRiderRetryString,
                actionButtonsIndex: newMode === "verifyOrder" ? -1 : prevState.actionButtonsIndex
            }
        });
    };

    const onBackFromPitstopDetails = () => {
        if (state.mode === "destPitstopDetails") {
            if (state.homeFooterHandler) {
                state.homeFooterHandler.cancelFinalDestCallback(state.homeFooterHandler.name);
            }
            else {
                if (state.finalDestPreviousScreen === "HomeScreen") {
                    goToHome(false, { valueToHomeScreen: new Date().getTime() }, false);
                }
                else {
                    setState({ ...state.finalDestPreviousState });
                }
            }
        }
        else if (state.isNew) {
            onCancelOrder();
        }
        else {
            const proceed = () => {
                setState(prevState => {
                    let newMode = "";
                    if (prevState.mode === "pitstopDetails") {
                        newMode = "pitstops";
                    }
                    // else if (prevState.mode === "paymentPitstopDetails") {
                    //     newMode = "paymentPitstopSelect";
                    // }
                    else if (prevState.mode === "orderPitstopDetails") {
                        newMode = "verifyOrder";
                    }
                    return {
                        ...prevState,
                        mode: newMode,
                        previousMode: null,
                        pitstops: [...prevState.previousPitstops],
                        previousPitstops: prevState.mode === "pitstopDetails" ? null : prevState.previousPitstops,
                        pinRegion: null,
                        // focusedFieldIndex: null,
                        dftDetails: null,
                        isChanged_pitstopDetails: false,
                        isAdded_pitstop: false,
                        orderVerifyCollapsed: newMode === "verifyOrder" ? true : prevState.orderVerifyCollapsed,
                        allocatingRiderRetryString: newMode === "verifyOrder" ? "" : prevState.allocatingRiderRetryString,
                        actionButtonsIndex: newMode === "verifyOrder" ? -1 : prevState.actionButtonsIndex
                    };
                });
            };

            if (state.isChanged_pitstopDetails) {
                Alert.alert(
                    'Are you sure?',
                    'Leaving this screen will discard your changes to "PitStop ' + (state.focusedFieldIndex + 1) + '"',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => { },
                            style: 'cancel'
                        },
                        {
                            text: 'Leave',
                            onPress: () => proceed()
                        }
                    ],
                    { cancelable: true }
                );
            }
            else {
                proceed();
            }

        }
    };

    // const onBackFromPaymentPitstop = () => {
    //     const proceed = () => {
    //         setState(prevState => {
    //             return {
    //                 ...prevState,
    //                 mode: "pitstops",
    //                 previousMode: null,
    //                 pitstops: [...prevState.previousPitstops],
    //                 previousPitstops: null,
    //                 pinRegion: null,
    //                 // focusedFieldIndex: null,
    //                 dftDetails: null,
    //                 isChanged_paymentPitstopSelect: false,
    //                 isAdded_responsiblePitstop: false
    //             };
    //         });
    //     };

    //     if (state.isChanged_paymentPitstopSelect) {
    //         Alert.alert(
    //             'Are you sure?',
    //             'Leaving this screen will discard your responsible pitstop!',
    //             [
    //                 {
    //                     text: 'Cancel',
    //                     onPress: () => { },
    //                     style: 'cancel'
    //                 },
    //                 {
    //                     text: 'Leave',
    //                     onPress: () => proceed()
    //                 }
    //             ],
    //             { cancelable: true }
    //         );
    //     }
    //     else {
    //         proceed();
    //     }
    // };

    const getTotalEstPriceValueAlreadyUsed = () => {
        const currentOrderValue = state.pitstops.map((p, i) => (i !== state.focusedFieldIndex ? (p?.details?.estCost || 0) : 0)).reduce((a, b) => a + b);
        const previousOrdersValue = (state.tasksData?.openOrderList?.length >= 1) ? state.tasksData.openOrderList.map((o, i) => (o?.estimatePrice || 0)).reduce((a, b) => a + b) : 0;
        return currentOrderValue + previousOrdersValue;
    }

    const onBackFromVerifyOrder = () => {
        setState(prevState => {
            return {
                ...prevState,
                // mode: "paymentPitstopSelect"
                mode: "pitstops"
            };
        });
    };

    const onEstTimePickerValueChanged = (value, index) => {
        setState((prevState) => {
            let dftDetails = { ...prevState.dftDetails };
            let estTimeArr = ((dftDetails && (dftDetails.dftEstTime || dftDetails.estTime)) || "00:00").split(":");
            estTimeArr[index] = value;
            return {
                ...prevState,
                dftDetails: {
                    ...prevState.dftDetails,
                    dftEstTime: estTimeArr.join(":")
                }
            }
        });
    };

    const onEstTimeDecided = (type) => {
        if (type === "cancel") {
            setState((prevState) => {
                let dftDetails = { ...prevState.dftDetails };
                delete dftDetails.dftEstTime;
                return {
                    ...prevState,
                    mode: "pitstopDetails",
                    previousMode: null,
                    dftDetails: dftDetails
                }
            });
        }
        else if (type === "save") {
            setState((prevState) => {
                let dftDetails = { ...prevState.dftDetails };
                dftDetails.estTime = (prevState.dftDetails && (prevState.dftDetails.dftEstTime || prevState.dftDetails.estTime)) || "00:00";
                delete dftDetails.dftEstTime;
                return {
                    ...prevState,
                    mode: "pitstopDetails",
                    previousMode: null,
                    dftDetails: dftDetails,
                    isChanged_pitstopDetails: true
                }
            });
        }
    };

    // const onSetAsPaymentPitstop = (index) => {
    //     setState((prevState) => {

    //         let updatedPitstops = JSON.parse(JSON.stringify(prevState.pitstops));
    //         for (let i = 0; i < updatedPitstops.length; i++) {
    //             if (i !== index) {
    //                 delete updatedPitstops[i].isPaymentPitstop;
    //             }
    //             // delete updatedPitstops[i].lastChanged;
    //         }

    //         updatedPitstops[index].isPaymentPitstop = updatedPitstops[index].hasOwnProperty("isPaymentPitstop") ? !updatedPitstops[index].isPaymentPitstop : true;

    //         return {
    //             ...prevState,
    //             pitstops: updatedPitstops,
    //             isChanged_paymentPitstopSelect: true
    //         }
    //     });
    // };

    // const onAddResponsiblePitstopClicked = () => {
    //     setState((prevState) => {

    //         let updatedPitstops = JSON.parse(JSON.stringify(prevState.pitstops));
    //         for (let i = 0; i < updatedPitstops.length; i++) {
    //             delete updatedPitstops[i].isPaymentPitstop;
    //         }

    //         updatedPitstops.push({ isDone: false, details: {} });

    //         updatedPitstops[updatedPitstops.length - 1].isPaymentPitstop = true;
    //         updatedPitstops[updatedPitstops.length - 1].isResponsiblePitstop = true

    //         return {
    //             ...prevState,
    //             mode: "paymentPitstopDetails",
    //             pitstops: updatedPitstops,
    //             focusedFieldIndex: updatedPitstops.length - 1,
    //             isAdded_responsiblePitstop: true
    //         }
    //     });
    // };

    const onChangePromoCode = (value) => {
        setState((prevState) => ({
            ...prevState,
            promoCodeApplied: value
        }));
    };

    const onGetPromoPressed = () => {
        postRequest(
            'api/Order/Promotion/List',
            {},
            null,
            dispatch,
            (response) => {
                let receivedPromos = ((response && response.data && response.data.promos) || []);
                if (receivedPromos.length > 0) {
                    setState((prevState) => ({
                        ...prevState,
                        promoModalVisible: true,
                        promoCodesList: receivedPromos,
                        promoCodeSelected: prevState.promoCodeApplied
                    }));
                }
                else {
                    CustomToast.error('No Promo Code Found!');
                }
            },
            (error) => {
                console.log(((error?.response) ? error.response : {}), error);
                Alert.alert("No Promo Code Found!");
            },
            true
        );
    };

    const onSelectPromoCode = (value) => {
        setState((prevState) => ({
            ...prevState,
            promoCodeSelected: value
        }));
    };

    const onApplyPromoCode = () => {
        setState((prevState) => ({
            ...prevState,
            promoModalVisible: false,
            promoCodeSelected: "",
            promoCodeApplied: prevState.promoCodeSelected
        }));
    };

    const onCloseGetPromoModal = () => {
        setState((prevState) => ({
            ...prevState,
            promoModalVisible: false,
            promoCodeSelected: ""
        }));
    };

    const onOrderPressed = () => {

        const placeOrder = async () => {
            let mapImageBase64 = await mapRef.current.takeSnapshot({
                format: "jpg",      // "png" | "jpg"
                quality: 0.3,       // (0.1 - 1)
                result: "base64",    // "file" | "base64"
                // width: 819,
                // height: 440
            });
            // mapImageBase64 = "data:image/jpg;base64," + mapImageBase64;
            console.log("data:image/jpg;base64," + mapImageBase64);

            const finalPitstops = [...state.pitstops, state.finalDestObj];

            const finalOrder = {
                "pitStopsList": finalPitstops.map((item) => ({
                    "title": item.title,
                    "description": item.details.description ? item.details.description : "",
                    "latitude": item.latitude,
                    "latitudeDelta": item.latitudeDelta,
                    "longitude": item.longitude,
                    "longitudeDelta": item.longitudeDelta,
                    "addressID": item.addressID ? item.addressID : null,
                    // "isPaymentPoint": item.isPaymentPitstop ? true : false,
                    "buyForMe": item.details.buyForMe ? true : false,
                    "estimateTime": item.details.estTime,
                    "estimatePrice": item.details.estCost,
                    "isFavourite": item.isFavourite ? item.isFavourite : false,
                    "addressType": item.addressType ? item.addressType : null,
                    // "addressTypeStr": item.addressTypeStr ? item.addressTypeStr : null,
                    "isDestinationPitstop": item.isDestinationPitstop ? item.isDestinationPitstop : false
                })),
                "promotionCode": state.promoCodeApplied,
                "orderTypeID": 2,
                "pitStopsImage": mapImageBase64,
                "joviType": 1
            };

            console.log(JSON.stringify(finalOrder));
            postRequest(
                'api/Order/CreateUpdateOrder',
                finalOrder,
                null,
                dispatch,
                async (response) => {
                    clearCustomerOrderStorage();

                    const finalDestAddressId = response?.data?.createUpdateOrderVM?.addressID;
                    if (finalDestAddressId) {
                        console.log("finalDestAddressId: ", finalDestAddressId);
                        const finalDestination = await AsyncStorage.getItem("customerOrder_finalDestination");
                        if (finalDestination) {
                            let updatedFinalDestination = JSON.parse(finalDestination);
                            updatedFinalDestination[0].addressID = finalDestAddressId;
                            await AsyncStorage.setItem("customerOrder_finalDestination", JSON.stringify(updatedFinalDestination));
                        }
                    }

                    setState((prevState) => ({
                        ...prevState,
                        allocatingRiderModalVisible: true,
                        orderID: response?.data?.createUpdateOrderVM?.orderID,
                        allocatingRiderRetryString: "",
                        orderRequestTime: new Date().getTime()
                    }));
                },
                (error) => {
                    console.log(((error?.response) ? error.response : {}), error);
                    error?.errors && Object.keys(error.errors)?.[0] && error.errors[Object.keys(error.errors)[0]]?.[0] && Alert.alert("Error", error.errors[Object.keys(error.errors)[0]][0]);
                },
                true
            );
        };

        Alert.alert(
            'Are you sure?',
            'Do you want to place this order?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        placeOrder();
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const onChangeTab = (tabIndex, loadOrderNextForOnce) => {
        if (tabIndex === 3) {
            goToHome(false, { valueToHomeScreen: new Date().getTime() }, false);
        }
        else {
            if (tabIndex === 0) {
                getRequest(
                    'api/Order/GetUserByOrder/' + state.orderID,
                    {},
                    dispatch,
                    (response) => {
                        setState((prevState) => ({
                            ...prevState,
                            riderAllocatedTabIndex: tabIndex,
                            loadOrderNextForOnce: loadOrderNextForOnce,
                            riderData: response.data.userDetail ? { ...response.data.userDetail } : {},
                            chatLoadedImages: []
                        }));
                    },
                    (error) => {
                        console.log(((error?.response) ? error.response : {}), error);
                        CustomToast.error('An Error Occcurred!');
                    },
                    '',
                    !loadOrderNextForOnce
                );
            }
            else if (tabIndex === 1) {
                setState((prevState) => ({
                    ...prevState,
                    keyboardShown: false,
                    riderAllocatedTabIndex: tabIndex,
                    chatVisible: false,
                    chatTyping: false,
                    chatBoxValue: "",
                    chatLoadedImages: [],
                    chatPlayingVoice: false,
                    chatPlayingVoiceIndex: -1
                }));
            }
            else if (tabIndex === 2) {
                setState((prevState) => ({
                    ...prevState,
                    keyboardShown: false,
                    riderAllocatedTabIndex: tabIndex,
                    chatVisible: false,
                    chatTyping: false,
                    chatBoxValue: "",
                    chatLoadedImages: [],
                    chatPlayingVoice: false,
                    chatPlayingVoiceIndex: -1
                }));
            }
        }
    };

    const fetchAndLoadOrder = () => {
        getRequest(
            'api/Order/Order/OrderDetail/' + state.orderID,
            {},
            dispatch,
            (response) => {
                let fetchedPitstopsList = [];
                let activePitstopIndexToSet = 0;
                response.data.order.pitStopsList.forEach((item, index) => {
                    let itemToPush = {
                        latitude: parseFloat(item.latitude),
                        latitudeDelta: parseFloat(item.latitudeDelta),
                        longitude: parseFloat(item.longitude),
                        longitudeDelta: parseFloat(item.longitudeDelta),
                        title: item.title,
                        isDone: false,
                        details: {
                            description: item.description,
                            buyForMe: item.buyForMe,
                            estCost: item.estimatePrice,
                            estTime: item.estimateTime,
                            fullData: { ...item } // Just For Checking in Console
                        },
                        // isPaymentPitstop: item.isPaymentPoint,
                        // isResponsiblePitstop: false,
                        addressID: item.addressID ? item.addressID : null,

                        jobID: item.joviJobID
                    };
                    if (item.jobStartTime) {
                        itemToPush.timeStart = item.jobStartTime;
                    }
                    if (item.jobEndTime) {
                        itemToPush.timeEnd = item.jobEndTime;
                        activePitstopIndexToSet += 1;
                    }

                    fetchedPitstopsList.push(itemToPush);
                });

                setState((prevState) => ({
                    ...prevState,
                    loadOrderNextForOnce: false,
                    pitstops: fetchedPitstopsList,
                    promoCodeApplied: response.data.order.promotionViews && response.data.order.promotionViews.promotionCode,
                    activePitstopIndex: activePitstopIndexToSet,
                    isOrderClosed: (activePitstopIndexToSet === fetchedPitstopsList.length)
                }));
            },
            (error) => {
                console.log(((error?.response) ? error.response : {}), error);
                CustomToast.error('An Error Occcurred!');
            },
            ''
        );
    };

    const onLoadChat = () => {
        askForAudioRecordPermission((allowRecording) => {
            getRequest(
                'api/Order/Chat/List?orderID=' + state.orderID + "&isAdminChat=" + false + "&userID=" + userObj.userID,
                {},
                dispatch,
                (response) => {
                    setState((prevState) => ({
                        ...prevState,
                        chatVisible: true,
                        chatAllowRecording: allowRecording,
                        chatMessages: response.data.chatList ?
                            response.data.chatList.map((item, index) => ({
                                message: item.message,
                                picture: item.type === 1 ? item.file : null,
                                loadPicture: item.type === 1 ? true : false,
                                voice: item.type === 2 ? item.file : null,
                                loadVoice: item.type === 2 ? true : false,
                                type: item.isReceived ? "received" : "sent",
                                timeStamp: item.timeStamp
                            }))
                            :
                            []
                    }));
                },
                (error) => {
                    console.log(((error?.response) ? error.response : {}), error);
                    CustomToast.error('An Error Occcurred!');
                },
                ''
            );
        });
    };

    const onCameraClicked = () => {
        sharedImagePickerHandler(() => setState(prevState => ({ ...prevState, isLoading: false })), picData => sendMessageToRider(picData, null));
    };

    const sendMessageToRider = (picData = null, voiceData = null) => {
        let formData = new FormData();
        formData.append("OrderID", state.orderID);
        formData.append("ReceiverID", state.riderData.userID);

        if (picData) {
            formData.append("Type", 1);
            formData.append("File", {
                uri: Platform.OS === 'android' ? picData.uri : picData.uri.replace("file://", ""),
                name: picData.uri.split('/').pop(),
                type: picData.type
            });
        }
        else if (voiceData) {
            formData.append("Type", 2);
            formData.append("File", {
                uri: Platform.OS === 'android' ? voiceData.uri : voiceData.uri.replace("file://", ""),
                name: voiceData.uri.split('/').pop(),
                type: voiceData.type
            });
        }
        else {
            formData.append("Message", state.chatBoxValue);
        }

        // let dateNow = (dateObj.getHours() > 12 ? dateObj.getHours() - 12 + ':PM' : dateObj.getHours() + ':AM').replace(":", ":" + (dateObj.getMinutes() < 10 ? ("0" + dateObj.getMinutes()) : dateObj.getMinutes()) + " ");
        // let dateNow = dateObj.toLocaleString().replace(",", "").split(":").slice(0, 2).join(":");
        let dateNow = moment().format("DD/MM/YYYY HH:mm");

        postRequest(
            'api/Order/Chat',
            formData,
            { headers: { 'content-type': 'multipart/form-data' } },
            dispatch,
            (response) => {
                Keyboard.dismiss();
                setState((prevState) => ({
                    ...prevState,
                    chatTyping: false,
                    chatBoxValue: "",
                    chatMessages: [
                        ...prevState.chatMessages,
                        {
                            message: prevState.chatBoxValue,
                            picture: picData && picData.uri,
                            loadPicture: false,
                            voice: voiceData && voiceData.uri,
                            loadVoice: false,
                            type: "sent",
                            timeStamp: dateNow,
                        }
                    ]
                }));
            },
            (error) => {
                console.log(((error?.response) ? error.response : {}), error);
                CustomToast.error('An Error Occcurred!');
            },
            true
        );
    };

    const onPlayPauseAudio = (item, index) => {
        let playerRef = null;
        if (playerRefsObj.current["player-" + index]) {
            playerRef = playerRefsObj.current["player-" + index];
        }
        else {
            playerRef = new Player(
                item.loadVoice ?
                    renderPicture(item.voice, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
                    :
                    item.voice,
                { autoDestroy: false }
            );
            playerRefsObj.current["player-" + index] = playerRef;
        }


        if (state.chatPlayingVoice === false) {
            playerRef.play().on('ended', () => {
                setState((prevState) => ({ ...prevState, chatPlayingVoice: false, chatPlayingVoiceIndex: -1 }));
            });

            setState((prevState) => ({ ...prevState, chatPlayingVoice: true, chatPlayingVoiceIndex: index }));
        }
        else {
            playerRef.stop();

            setState((prevState) => ({ ...prevState, chatPlayingVoice: false, chatPlayingVoiceIndex: -1 }));
        }
    };

    const handleSetFavClicked = () => {
        if (state.pitstops[state.focusedFieldIndex].isFavourite) {
            const handleUnsetFavourite = async () => {

                const predefinedPlaces = await AsyncStorage.getItem("customerOrder_predefinedPlaces");
                let predefinedPlacesArr = [];
                if (predefinedPlaces) {
                    predefinedPlacesArr = JSON.parse(predefinedPlaces);
                }

                if (predefinedPlacesArr.filter(itemPre => itemPre.isFavourite && state.pitstops[state.focusedFieldIndex].addressID === itemPre.addressID).length === 0) {
                    setState((prevState) => {

                        let updatedPitstops = JSON.parse(JSON.stringify(prevState.pitstops));

                        delete updatedPitstops[state.focusedFieldIndex].isFavourite;
                        delete updatedPitstops[state.focusedFieldIndex].addressType;
                        // delete updatedPitstops[state.focusedFieldIndex].addressTypeStr;

                        return {
                            ...prevState,
                            pitstops: updatedPitstops
                        }
                    });
                }
            };
            handleUnsetFavourite();
        }
        else {
            const handleOpenSetFavModal = async () => {
                const predefinedPlaces = await AsyncStorage.getItem("customerOrder_predefinedPlaces");
                let predefinedPlacesArr = [];
                if (predefinedPlaces) {
                    predefinedPlacesArr = JSON.parse(predefinedPlaces);
                }

                const existingAllFavourites = predefinedPlacesArr.filter(itemPre => itemPre.isFavourite).length;

                let arrayOfPitstopsToCheck = [];
                if (state.mode === "destPitstopDetails") {
                    if (state.homeFooterHandler) {
                        arrayOfPitstopsToCheck = arrayOfPitstopsToCheck;
                    }
                    else {
                        if (state.finalDestPreviousScreen === "HomeScreen") {
                            const lastOrder = await AsyncStorage.getItem("customerOrder_lastOrder");
                            if (lastOrder) {
                                arrayOfPitstopsToCheck = [...JSON.parse(lastOrder).pitstops, state.pitstops[0]];
                            }
                        }
                        else {
                            arrayOfPitstopsToCheck = [...state.finalDestPreviousState.pitstops, state.pitstops[0]];
                        }
                    }
                }
                else {
                    arrayOfPitstopsToCheck = [...state.pitstops, state.finalDestObj];
                }

                const selectedFromFavourites = arrayOfPitstopsToCheck.filter(item => predefinedPlacesArr.filter(itemPre => itemPre.isFavourite && item.addressID === itemPre.addressID)[0]).length;
                const addedNewAsFavourites = arrayOfPitstopsToCheck.filter(item => item.isFavourite).length - selectedFromFavourites;

                // console.log("existingAllFavourites:", existingAllFavourites, "selectedFromFavourites:", selectedFromFavourites, "addedNewAsFavourites:", addedNewAsFavourites);

                if ((existingAllFavourites + addedNewAsFavourites) >= 10) {
                    Alert.alert("Cannot mark as Favourite", "You have reached the Maximum Allowed Limit of Favourite Addresses (10)");
                }
                else {
                    setState((prevState) => ({ ...prevState, setFavModalVisible: true }));
                }
            };
            handleOpenSetFavModal();
        }
    };

    const onPressFavIcon = (favType) => {
        setState((prevState) => ({
            ...prevState,
            favTypeSelected: favType,
            // favOtherValue: (state.favTypeSelected === 1 || state.favTypeSelected === 2) ? "" : prevState.favOtherValue
        }));
    };

    const onCloseFavModal = () => {
        setState((prevState) => ({
            ...prevState,
            keyboardShown: false,
            setFavModalVisible: false,
            favTypeSelected: -1,
            // favOtherValue: ""
        }));
    };

    // const onChangeFavOtherValue = (value) => {
    //     setState((prevState) => ({
    //         ...prevState,
    //         favOtherValue: value
    //     }));
    // };

    const onSetAsFavourite = () => {
        setState((prevState) => {

            let updatedPitstops = JSON.parse(JSON.stringify(prevState.pitstops));

            updatedPitstops[state.focusedFieldIndex].isFavourite = true;
            updatedPitstops[state.focusedFieldIndex].addressType = state.favTypeSelected;
            // if (state.favTypeSelected === 3) {
            //     updatedPitstops[state.focusedFieldIndex].addressTypeStr = state.favOtherValue;
            // }

            return {
                ...prevState,
                pitstops: updatedPitstops,
                keyboardShown: false,
                setFavModalVisible: false,
                favTypeSelected: -1,
                // favOtherValue: "",
            }
        });
    };

    const showHideTasksModal = (isVisible) => {
        setState(prevState => ({
            ...prevState,
            tasksModalVisible: isVisible
        }));
    };

    const retryOrderRequest = (isAuto, orderID) => {
        getRequest(`/api/Order/Customer/SendOrderRequest?orderID=${orderID}`,
            {},
            dispatch,
            res => {
                setState((prevState) => ({
                    ...prevState,
                    allocatingRiderModalVisible: true,
                    orderID: orderID,
                    allocatingRiderRetryString: (isAuto === false) ? "" : prevState.allocatingRiderRetryString,
                    orderRequestTime: (isAuto === false) ? new Date().getTime() : prevState.orderRequestTime
                }));
            },
            err => {
                CustomToast.error("Error Occurred in Retrying Order Request");
            },
            ""
        );
    };


    //EOF: End Of Functions


    return (
        <View style={styles.container}>


            <MapCustomer
                mapRef={mapRef}
                pitstops={state.pitstops}
                mode={state.mode}
                activeTheme={activeTheme}
                pinRegion={state.pinRegion}
                setPinRegion={setPinRegion}
                handlePressOnMap={() => {
                    if (state.mode === "verifyOrder") {
                        if (!state.orderVerifyCollapsed) {
                            Keyboard.dismiss();
                            setState((prevState) => ({
                                ...prevState,
                                orderVerifyCollapsed: true,
                                actionButtonsIndex: -1,
                                allocatingRiderRetryString: "",
                                orderRequestTime: null
                            }));
                        }
                    }
                    else {
                        setMode("pinRegion", state.focusedFieldIndex, state.previousMode);
                    }
                }}
                isOrderOpenedFromHome={state.isOrderOpenedFromHome}
                orderVerifyCollapsed={state.orderVerifyCollapsed}
                finalDestObj={state.finalDestObj}
                isFinalDestOpened={state.isFinalDestOpened}
                riderLocation={state.riderLocation}
                constantLatDelta={constantLatDelta}
                constantLongDelta={constantLongDelta}
            />


            {state.mode === "pitstops" &&
                <>
                    <TouchableOpacity onPress={leftIconHandler} style={{ position: "absolute", left: "4%", top: 41, zIndex: 6 }}>
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={styles.svgTag} xml={menuIcon} height={21} width={21} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => goToHome(true, {}, true)} style={{ bottom: (state.pitstops.length > 2 ? 238.5 : 170) + 98 - (15) + (Platform.OS === "ios" ? 22 : 0), position: "absolute", left: "75%" /*"69.3%"*/, zIndex: 6 }} >
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={{ ...styles.svgTag, marginTop: 1.5 }} xml={houseIcon} height={18} width={18} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={animateToCurrentLocation} style={{ bottom: (state.pitstops.length > 2 ? 238.5 : 170) + 98 - (15) + (Platform.OS === "ios" ? 22 : 0), position: "absolute", left: "87.3%" /*"82.3%"*/, zIndex: 6 }} >
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={{ ...styles.svgTag, marginTop: 1.5 }} xml={locateMeIcon} height={18} width={18} />
                        </View>
                    </TouchableOpacity>


                    <KeyboardAvoidingView style={{ ...styles.wrapper }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? handleDismissKeyboardIOS : null}>

                        <Text style={{ ...styles.caption, fontSize: 17, left: 1, marginVertical: 5, top: -6 }}>Please add your pitstop locations</Text>

                        <View style={{ width: "100%", height: (state.pitstops.length > 2 ? 238.5 : 170) - 24 }}>
                            <FlatList
                                ref={pitstopsListRef}
                                onLayout={() => {
                                    if (state.isAdded_pitstop && state.pitstops.length > 3) {
                                        pitstopsListRef.current.scrollToEnd({ animated: true });
                                        setState((prevState) => ({
                                            ...prevState,
                                            isAdded_pitstop: false
                                        }));
                                    }
                                }}
                                data={state.pitstops}
                                renderItem={({ item, index }) => (
                                    <View key={index}>
                                        <View style={{ flexDirection: "row" }}>
                                            <SvgXml xml={pitstopCircle} key={"ico-" + index} style={{ marginTop: 1.5 }} />
                                            <Text style={{ ...styles.caption, color: '#000', marginVertical: -2.5 }}>{"PitStop " + (index + 1)}</Text>
                                        </View>
                                        <View key={"ps" + index} style={{ flexDirection: "row" }}>
                                            <SvgXml xml={pitstopFieldCircle} key={"ico-field-" + index} style={{ marginTop: 16, marginLeft: 1 }} />
                                            <LocationSearch
                                                index={index}
                                                mode={state.mode}
                                                textToShow={state.pitstops[index].latitude ? state.pitstops[index].title : ""}
                                                onLocationSelected={handleLocationSelected}
                                                handleAddPitstop={handleLocationAdded}
                                                handleDeletePitstop={deletePitstop}
                                                handlePinLocationClicked={(index) => setMode("pinRegion", index)}
                                                isLast={(state.pitstops.length - 1 === index) ? true : false}
                                                // handleInputFocused={(index) => state.pitstops[index].latitude ? handleLocationSelected(null, null, index, null, false) : setMode("enterPitstop", index)}
                                                handleInputFocused={(index) => handleLocationSelected(null, null, index, null, false)}
                                                reRender={reRender}
                                                totalPitstops={state.pitstops.length}
                                            />
                                        </View>
                                    </View>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            >
                            </FlatList>
                        </View>

                        <View style={{ width: "110%", left: -15 }}>
                            <Swipeable
                                friction={1}
                                leftThreshold={20}
                                rightThreshold={40}
                                containerStyle={{ backgroundColor: state.pitstops.length >= 2 - (1) ? "#7359be" : "#B8ABDE", marginBottom: (Platform.OS === "ios" ? 22 : 0) }}
                                onSwipeableLeftWillOpen={() => {
                                    swipableBottomActionRef.current.setNativeProps({ style: { width: (Dimensions.get("window").width * 2) / 3 } })
                                }}
                                onSwipeableWillClose={() => {
                                    swipableBottomActionRef.current.setNativeProps({ style: { width: Dimensions.get("window").width } })
                                }}
                                renderLeftActions={() => {
                                    return (
                                        <View>
                                            <TouchableOpacity onPress={() => onCancelOrder()} style={{ ...styles.appButtonContainer, width: Dimensions.get("window").width / 3, elevation: 0, backgroundColor: "#fc3f93" }}>
                                                <Text style={styles.appButtonText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }}
                            >
                                <TouchableHighlight disabled={state.pitstops.length < 2 - (1) ? true : false} ref={swipableBottomActionRef} underlayColor={"#B8ABDE"} onPress={() => setMode("verifyOrder" /* "paymentPitstopSelect" */)}
                                    style={{ ...styles.appButtonContainer, elevation: 0, backgroundColor: state.pitstops.length >= 2 - (1) ? "#7359be" : "#B8ABDE" }}
                                >
                                    <Text style={styles.appButtonText}>Continue</Text>
                                </TouchableHighlight>
                            </Swipeable>
                        </View>

                    </KeyboardAvoidingView>
                </>
            }


            {state.mode === "pinRegion" &&
                <>
                    <TouchableOpacity onPress={() => setMode(state.previousMode, state.focusedFieldIndex)} style={{ position: "absolute", left: "4%", top: 41, zIndex: 6 }}>
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={{ ...styles.svgTag, marginTop: 1 }} xml={crossIcon} height={14} width={14} />
                        </View>
                    </TouchableOpacity>

                    <Text style={{ ...styles.caption, position: "absolute", left: "35%", marginVertical: 0, top: 48, fontSize: 18 }}>
                        {/* <Text>Select Location</Text> */}
                    </Text>

                    <View style={{ ...styles.textInputLoc, position: "absolute", top: 87, alignSelf: "center" }} width={"92%"} height={"auto"} pointerEvents={"none"}>
                        <TextInput
                            multiline={true}
                            returnKeyType="default"
                            style={{ paddingTop: 10, paddingBottom: 10 }}
                            editable={true}
                            selectTextOnFocus={false}
                            caretHidden={true}
                            // defaultValue={''}
                            // selection={{ start: 0, end: 0 }}
                            value={state.pinRegion && state.pinRegion.title}
                        />
                    </View>

                    <TouchableOpacity onPress={animateToCurrentLocation} style={{ bottom: /*170 + 23*/ 76 - (15) + (Platform.OS === "ios" ? 22 : 0), position: "absolute", left: "87.3%" /*"82.3%"*/, zIndex: 6 }} >
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={{ ...styles.svgTag, marginTop: 1.5 }} xml={locateMeIcon} height={18} width={18} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={(state.pinRegion === null || (state.pinRegion && (state.pinRegion.title === "Fetching Address..." || state.pinRegion.title === "Error while Fetching Address!"))) ? true : false}
                        onPress={() => onPinLocationSelected()}
                        style={{ ...styles.appButtonContainer, position: "absolute", width: "100%"/*"77%"*/, alignSelf: "center", bottom: 15 - (15) + (Platform.OS === "ios" ? 22 : 0), opacity: (state.pinRegion === null || (state.pinRegion && (state.pinRegion.title === "Fetching Address..." || state.pinRegion.title === "Error while Fetching Address!"))) ? 0.5 : 1 }}
                    >
                        <Text style={styles.appButtonText}>Confirm Location</Text>
                    </TouchableOpacity>
                </>
            }


            {state.mode === "enterPitstop" &&
                <>
                    <TouchableOpacity onPress={() => setMode(state.previousMode, state.focusedFieldIndex)} style={{ position: "absolute", left: "4%", top: 41, zIndex: 6 }}>
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={{ ...styles.svgTag, marginTop: 1 }} xml={crossIcon} height={14} width={14} />
                        </View>
                    </TouchableOpacity>

                    <KeyboardAvoidingView style={{ ...styles.wrapper }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? handleDismissKeyboardIOS : null}>

                        <View style={{ flexDirection: "row" }}>
                            <SvgXml xml={pitstopCircle} style={{ marginTop: 1.5 }} />
                            <Text style={{ ...styles.caption, color: '#000', marginVertical: -2.5 }}>{"PitStop " + (state.focusedFieldIndex + 1)}</Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <SvgXml xml={pitstopFieldCircle} style={{ marginTop: 16, marginLeft: 1 }} />
                            <LocationSearch
                                dispatch={dispatch}
                                index={state.focusedFieldIndex}
                                mode={state.mode}
                                textToShow={state.pitstops[state.focusedFieldIndex].latitude ? state.pitstops[state.focusedFieldIndex].title : ""}
                                onLocationSelected={handleLocationSelected}
                                reRender={reRender}
                            />
                        </View>

                    </KeyboardAvoidingView>
                </>
            }


            {(state.mode === "pitstopDetails" || /* state.mode === "paymentPitstopDetails" || */ state.mode === "orderPitstopDetails" || state.mode === "destPitstopDetails") &&
                <>
                    <TouchableOpacity onPress={() => onBackFromPitstopDetails()} style={{ position: "absolute", left: "4%", top: 41, zIndex: 6 }}>
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={{ ...styles.svgTag, marginTop: 1 }} xml={crossIcon} height={14} width={14} />
                        </View>
                    </TouchableOpacity>

                    <KeyboardAvoidingView style={{ ...styles.wrapper }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? handleDismissKeyboardIOS : null}>

                        {state.mode === "destPitstopDetails" ?
                            <Text style={{ ...styles.caption, fontSize: 17, left: 1, marginVertical: 10, top: -12 }}>Please select final destination</Text>
                            :
                            <Text style={{ ...styles.caption, fontSize: 17, left: 1, marginVertical: 10, top: -12 }}>Please add your pitstop details</Text>
                        }

                        <View style={{ flexDirection: "row" }}>
                            <SvgXml xml={pitstopCircle} style={{ marginTop: 1.5 }} />
                            {state.mode === "destPitstopDetails" ?
                                <Text style={{ ...styles.caption, color: '#000', marginVertical: -2.5 }}>Destination</Text>
                                :
                                <Text style={{ ...styles.caption, color: '#000', marginVertical: -2.5 }}>{"PitStop " + (state.focusedFieldIndex + 1)}</Text>
                            }
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <SvgXml xml={pitstopFieldCircle} style={{ marginTop: 16, marginLeft: 1 }} />
                            <LocationSearch
                                index={state.focusedFieldIndex}
                                mode={state.mode}
                                textToShow={state.pitstops[state.focusedFieldIndex].latitude ? state.pitstops[state.focusedFieldIndex].title : ""}
                                onLocationSelected={handleLocationSelected}
                                handlePinLocationClicked={(index) => setMode("pinRegion", index)}
                                handleInputFocused={(index) => setMode("enterPitstop", index)}
                                reRender={reRender}
                                onSetFavClicked={handleSetFavClicked}
                                isFavourite={state.pitstops[state.focusedFieldIndex].isFavourite}
                            />
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <SvgXml xml={pitstopCircle} style={{ marginTop: 1.5 }} />
                            <Text style={{ ...styles.caption, color: '#000', marginVertical: -2.5 }}>{"Description"}</Text>
                        </View>
                        <View style={{ ...styles.textInputDesc, position: "relative", top: 3.5, left: 9.8, marginHorizontal: 10, alignSelf: "flex-start", marginBottom: (/* state.pitstops[state.focusedFieldIndex].isPaymentPitstop || */ state.mode === "destPitstopDetails") ? 15 : 5 }} width="92%" height={90}>
                            <TextInput
                                multiline={true}
                                returnKeyType="default"
                                style={{ height: (Platform.OS === "ios" ? 90 : "auto"), paddingTop: (Platform.OS === "ios" ? 10 : 5), paddingBottom: (Platform.OS === "ios" ? 10 : 5) }}
                                placeholder="1 - Description here ..."
                                maxLength={150}
                                onChangeText={(value) => onChangeDetailsInput(value, "description")}
                                defaultValue={state.dftDetails && state.dftDetails.description}
                                key={state.mode === "destPitstopDetails" ? "dest-description" : "description"}
                            />
                        </View>
                        {(/* !state.pitstops[state.focusedFieldIndex].isPaymentPitstop && */ state.mode !== "destPitstopDetails") &&
                            <>
                                <View style={{ top: 5, left: 15, flexDirection: "row", justifyContent: "space-between", width: "94%" }}>
                                    <Text style={{ ...styles.caption, left: 5, color: '#000' }}>Time Estimation</Text>

                                    <View style={{ left: 10 + (15), marginRight: -44, height: 40, color: '#000' }}>
                                        <TouchableOpacity onPress={() => setMode("pickTime", state.focusedFieldIndex)}>
                                            <Text style={{ ...styles.caption, color: '#000' }}>{state.dftDetails && state.dftDetails.estTime ? state.dftDetails.estTime : "HH:MM"}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity onPress={() => setMode("pickTime", state.focusedFieldIndex)}>
                                        <SvgXml xml={clockIcon()} style={{ marginTop: 6, marginRight: 8 }} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ top: 0, left: 15, marginBottom: 5, marginTop: Platform.OS === "ios" ? 10 : 0, flexDirection: "row", justifyContent: "space-between", height: 40, width: "94%" }}>
                                    <Text style={{ ...styles.caption, left: 5, color: '#000' }}>Buy for me</Text>

                                    <Switch
                                        trackColor={{ false: "#767577", true: "#46e54b" /* "#7359be" */ }}
                                        thumbColor={"#fff"}
                                        // style={{ alignSelf: "flex-end" }}
                                        ios_backgroundColor="#767577"
                                        onValueChange={(value) => (getTotalEstPriceValueAlreadyUsed() < 10000) ? onChangeDetailsInput(value, "buyForMe") : CustomToast.error("Maximum Cost Limit is Reached!")}
                                        value={state.dftDetails && state.dftDetails.buyForMe}
                                    />
                                </View>

                                {state.dftDetails && state.dftDetails.buyForMe &&
                                    <>
                                        <View style={{ top: 0, left: 14, flexDirection: "row", justifyContent: "space-between", width: "94%" }}>
                                            <RangeSlider
                                                style={{ width: "100%", height: 25 }}
                                                gravity={"center"}
                                                rangeEnabled={false}
                                                thumbBorderColor={"#fff"}
                                                thumbBorderWidth={0}
                                                thumbColor={"#7359be"}
                                                min={0}
                                                max={10000 - getTotalEstPriceValueAlreadyUsed()}
                                                step={50}
                                                selectionColor="#7359be"
                                                blankColor="#767577"
                                                thumbRadius={10}
                                                lineWidth={7}
                                                labelStyle="none"
                                                valueType={"number"}
                                                initialLowValue={state.dftDetails.estCost ? state.dftDetails.estCost : 0}
                                                onValueChanged={(value) => onChangeDetailsInput(value, "estCost")}
                                            />
                                        </View>

                                        <View style={{ top: 0, left: 15, flexDirection: "row", justifyContent: "space-between", width: "89%" }}>
                                            <Text style={{ ...styles.caption, left: 5, color: '#000' }}>{"PKR " + (state.dftDetails.estCost >= 1000 ? state.dftDetails.estCost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (state.dftDetails.estCost ? state.dftDetails.estCost : "0"))}</Text>

                                            <Text style={{ ...styles.caption, left: 5, color: '#000' }}>
                                                PKR {(
                                                    10000 - getTotalEstPriceValueAlreadyUsed()
                                                ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            </Text>
                                        </View>

                                    </>
                                }
                            </>
                        }

                        <View style={{ width: "110%", left: -15, marginBottom: (Platform.OS === "ios" ? 22 : 0) }}>
                            <TouchableOpacity disabled={state.pitstops[state.focusedFieldIndex].latitude ? false : true} onPress={onSaveDetails} style={{ ...styles.appButtonContainer, opacity: state.pitstops[state.focusedFieldIndex].latitude ? 1 : 0.5 }}>
                                <Text style={styles.appButtonText}>Continue{/* Save */}</Text>
                            </TouchableOpacity>
                        </View>

                        {state.setFavModalVisible &&
                            <BottomAlignedModal
                                visible={true}
                                transparent={true}
                                onRequestCloseHandler={onCloseFavModal}
                                modalFlex={1.5}
                                modalHeight={233 + (Platform.OS === "ios" && !state.keyboardShown ? 22 : 0) - 45}
                                modelViewPadding={35}
                                androidKeyboardExtraOffset={35}
                                ModalContent={
                                    <>
                                        <View style={{ width: "100%" }}>
                                            <TouchableOpacity onPress={onCloseFavModal} style={{ width: 25, height: 25, left: 30, top: -20, alignSelf: "flex-end" }}>
                                                <SvgXml xml={crossIcon} height={14} width={14} />
                                            </TouchableOpacity>

                                            <Text style={{ ...styles.caption, fontSize: 17, left: -15, marginVertical: 0, marginBottom: 5, top: -48 }}>Please select a type</Text>

                                            <View style={{ flexDirection: "row", top: -38, marginLeft: 41 - 18 }}>
                                                <View style={{ flexGrow: 1.3, flexDirection: "column" }} onTouchEnd={() => onPressFavIcon(1, "Home")}>
                                                    <SvgXml xml={favHomeIcon(state.favTypeSelected === 1 ? "#7359be" : "#646464")} width={42} height={42} />
                                                    <Text style={{ ...styles.appButtonText, color: (state.favTypeSelected === 1 ? "#7359be" : "#646464"), alignSelf: "flex-start", marginLeft: 2.5, marginTop: 4 }}>Home</Text>
                                                </View>
                                                <View style={{ flexGrow: 1.3, flexDirection: "column" }} onTouchEnd={() => onPressFavIcon(2, "Work")}>
                                                    <SvgXml xml={favWorkIcon(state.favTypeSelected === 2 ? "#7359be" : "#646464")} width={42} height={42} />
                                                    <Text style={{ ...styles.appButtonText, color: (state.favTypeSelected === 2 ? "#7359be" : "#646464"), alignSelf: "flex-start", marginLeft: 4.5, marginTop: 4 }}>Work</Text>
                                                </View>
                                                <View style={{ flexGrow: 1.3, flexDirection: "column" }} onTouchEnd={() => onPressFavIcon(3, "Friends" /* state.favOtherValue */)}>
                                                    <SvgXml xml={favFriendsIcon(state.favTypeSelected === 3 ? "#7359be" : "#646464")} width={42} height={42} />
                                                    <Text style={{ ...styles.appButtonText, color: (state.favTypeSelected === 3 ? "#7359be" : "#646464"), alignSelf: "flex-start", marginLeft: -3, marginTop: 4 }}>Friends</Text>
                                                </View>
                                                <View style={{ flexGrow: 1.3, flexDirection: "column" }} onTouchEnd={() => onPressFavIcon(4, "Family" /* state.favOtherValue */)}>
                                                    <SvgXml xml={favFamilyIcon(state.favTypeSelected === 4 ? "#7359be" : "#646464")} width={42} height={42} />
                                                    <Text style={{ ...styles.appButtonText, color: (state.favTypeSelected === 4 ? "#7359be" : "#646464"), alignSelf: "flex-start", marginLeft: 0, marginTop: 4 }}>Family</Text>
                                                </View>
                                            </View>

                                            {/* <View style={{ flexDirection: "row", height: 35, top: -23, width: "100%", alignItems: "center", alignSelf: "center", justifyContent: "center" }}>
                                                {state.favTypeSelected === 3 &&
                                                    <TextInput
                                                        multiline={false}
                                                        returnKeyType="done"
                                                        onSubmitEditing={() => Keyboard.dismiss()}
                                                        placeholder="Enter a custom type"
                                                        value={state.favOtherValue}
                                                        style={{ borderRadius: 5, height: 40, marginRight: 10, paddingLeft: 15, paddingRight: 15, width: "90%", borderColor: "#E5E5E5", borderWidth: 1 }}
                                                        onChangeText={(value) => onChangeFavOtherValue(value)}
                                                    />
                                                }
                                            </View> */}

                                        </View>

                                        <TouchableOpacity
                                            disabled={(state.favTypeSelected === -1 /* || (state.favTypeSelected === 3 && state.favOtherValue.trim() === "") */) ? true : false}
                                            onPress={() => onSetAsFavourite()}
                                            style={{ ...styles.appButtonContainer, width: Dimensions.get("window").width, position: "absolute", alignSelf: "center", bottom: (Platform.OS === "ios" && !state.keyboardShown ? 22 : 0), opacity: (state.favTypeSelected === -1 /* || (state.favTypeSelected === 3 && state.favOtherValue.trim() === "") */) ? 0.5 : 1 }}
                                        >
                                            <Text style={styles.appButtonText}>Continue{/* Save */}</Text>
                                        </TouchableOpacity>
                                    </>
                                }
                            />
                        }

                    </KeyboardAvoidingView>
                </>
            }


            {state.mode === "pickTime" &&
                <>
                    <KeyboardAvoidingView style={{ ...styles.wrapper }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? handleDismissKeyboardIOS : null}>

                        <View style={{ top: 0, left: 0, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                            <TouchableOpacity onPress={() => onEstTimeDecided("cancel")}>
                                <Text style={{ ...styles.caption, left: 0, color: '#9682ce', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CANCEL</Text>
                            </TouchableOpacity>

                            <Text style={{ ...styles.caption, left: 7 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Add Time</Text>

                            <TouchableOpacity onPress={() => onEstTimeDecided("save")}>
                                <Text style={{ ...styles.caption, left: 0, color: '#9682ce', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CONTINUE{/*SAVE */}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 35, marginBottom: 30, flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                            <Picker
                                accessibilityLabel={"hours"}
                                style={{ zIndex: 500, width: 115 }}
                                mode="dialog" // "dialog" || "dropdown"
                                // prompt="Select Hours"
                                selectedValue={((state.dftDetails && (state.dftDetails.dftEstTime || state.dftDetails.estTime)) || "HH:MM").split(":")[0]}
                                onValueChange={(value, i) => onEstTimePickerValueChanged(value, 0)}
                            >
                                {
                                    Array.from(Array(24), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                        .map((item, i) => (
                                            <Picker.Item key={i} label={item} value={item} />
                                        ))
                                }
                            </Picker>

                            <Text style={{ ...styles.caption, left: 0, top: 2.5, color: "#000", fontWeight: "bold" }}>:</Text>

                            <Picker
                                accessibilityLabel={"minutes"}
                                style={{ zIndex: 500, width: 115 }}
                                mode="dialog" // "dialog" || "dropdown"
                                // prompt="Select Minutes"
                                selectedValue={((state.dftDetails && (state.dftDetails.dftEstTime || state.dftDetails.estTime)) || "HH:MM").split(":")[1]}
                                onValueChange={(value, i) => onEstTimePickerValueChanged(value, 1)}
                            >
                                {
                                    Array.from(Array(60), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                        .map((item, i) => (
                                            <Picker.Item key={i} label={item} value={item} />
                                        ))
                                }
                            </Picker>
                        </View>

                    </KeyboardAvoidingView>
                </>
            }


            {/* {state.mode === "paymentPitstopSelect" &&
                <>
                    <TouchableOpacity onPress={leftIconHandler} style={{ position: "absolute", left: "4%", top: 41, zIndex: 6 }}>
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={styles.svgTag} xml={menuIcon} height={21} width={21} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onBackFromPaymentPitstop()} style={{ bottom: (364) + 108 - (15) + (Platform.OS === "ios" ? 22 : 0), position: "absolute", left: "87.3%", zIndex: 6 }} >
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={{ ...styles.svgTag, marginTop: 1.5 }} xml={backIcon()} height={18} width={18} />
                        </View>
                    </TouchableOpacity>

                    <KeyboardAvoidingView style={{ ...styles.wrapper }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? handleDismissKeyboardIOS : null}>

                        <Text style={{ ...styles.caption, fontSize: 17, left: 0, marginVertical: 10, top: -13 }}>Please select responsible pitstop</Text>

                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', top: -13, marginBottom: 5 }}>
                            <View style={{ height: 225 }}>
                                <FlatList
                                    ref={paymentPitstopsListRef}
                                    onLayout={() => {
                                        if (state.isAdded_responsiblePitstop) {
                                            paymentPitstopsListRef.current.scrollToEnd({ animated: true });
                                            setState((prevState) => ({
                                                ...prevState,
                                                isChanged_paymentPitstopSelect: true,
                                                isAdded_responsiblePitstop: false
                                            }));
                                        }
                                    }}
                                    data={state.pitstops}
                                    renderItem={({ item, index }) => {
                                        return (
                                            <View style={{
                                                flexDirection: "row", width: "100%", justifyContent: "space-between", backgroundColor: "#fff",
                                                borderTopColor: (index === 0 ? "#fff" : "#ccc"), borderBottomColor: "#fff",
                                                borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1, paddingVertical: 10
                                            }}>
                                                <View style={{ flexDirection: "column", width: "80%" }}>

                                                    <View style={{ flexDirection: "row" }}>
                                                        <SvgXml xml={pitstopCircle} style={{ marginTop: 1.5 }} />
                                                        <Text style={{ ...styles.caption, color: '#7359be', marginVertical: -2.5 }}>{"PitStop " + (index + 1)}</Text>
                                                    </View>

                                                    <Text style={{ ...styles.caption, color: '#000', fontSize: 13, top: 0, left: 25, marginVertical: 0 }}>{item.title}</Text>

                                                </View>
                                                <View style={{ top: -4, height: 35, width: 60 }}>
                                                    <Switch
                                                        key={index}
                                                        disabled={(state.pitstops.filter(p => p.isResponsiblePitstop).length !== 0)}
                                                        trackColor={{ false: "#767577", true: "#46e54b" }}
                                                        thumbColor={"#fff"}
                                                        ios_backgroundColor="#767577"
                                                        onValueChange={(value) => onSetAsPaymentPitstop(index)}
                                                        value={item.isPaymentPitstop}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    }}
                                    onDragEnd={({ data }) => setState((prevState) => ({
                                        ...prevState,
                                        pitstops: [...data]
                                    }))}
                                    keyExtractor={(item, index) => `draggable-${index}`}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: "column", width: "100%", alignItems: "center", height: 60, borderRadius: 0, borderTopColor: "#ccc", borderBottomColor: "#ccc", borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1 }}>
                            <Text style={{ ...styles.caption, color: '#000', fontSize: 13, top: 10, left: 0, marginVertical: 0, fontWeight: "bold" }}>TOTAL ESTIMATED AMOUNT</Text>

                            <Text style={{ ...styles.caption, color: '#000', fontSize: 13, top: 15, left: 0, marginVertical: 0, fontWeight: "bold" }}>
                                {"Rs. " + state.pitstops.map((p, i) => (p.details && p.details.estCost) || 0).reduce((a, b) => a + b).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "column", width: "100%", alignItems: "center", marginVertical: 10 }}>
                            <TouchableOpacity disabled={state.pitstops.filter(p => p.isResponsiblePitstop).length > 0 ? true : false} style={{ paddingVertical: 5, opacity: state.pitstops.filter(p => p.isResponsiblePitstop).length > 0 ? 0.5 : 1 }} onPress={() => onAddResponsiblePitstopClicked()}>
                                <Text style={{ ...styles.caption, left: 0, fontSize: 14, color: '#7359be', marginVertical: 0, fontWeight: "bold" }}>ADD RESPONSIBLE PITSTOP</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ width: "110%", left: -15 }}>
                            <Swipeable
                                friction={1}
                                leftThreshold={20}
                                rightThreshold={40}
                                containerStyle={{ backgroundColor: (state.pitstops.filter(p => p.isPaymentPitstop).length !== 0) ? "#7359be" : "#B8ABDE", marginBottom: (Platform.OS === "ios" ? 22 : 0) }}
                                onSwipeableLeftWillOpen={() => {
                                    swipableBottomActionRef.current.setNativeProps({ style: { width: (Dimensions.get("window").width * 2) / 3 } })
                                }}
                                onSwipeableWillClose={() => {
                                    swipableBottomActionRef.current.setNativeProps({ style: { width: Dimensions.get("window").width } })
                                }}
                                renderLeftActions={() => {
                                    return (
                                        <View>
                                            <TouchableOpacity onPress={() => onCancelOrder()} style={{ ...styles.appButtonContainer, width: Dimensions.get("window").width / 3, elevation: 0, backgroundColor: "#fc3f93" }}>
                                                <Text style={styles.appButtonText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }}
                            >
                                <TouchableHighlight disabled={(state.pitstops.filter(p => p.isPaymentPitstop).length !== 0) ? false : true} ref={swipableBottomActionRef} underlayColor={"#B8ABDE"} onPress={() => (state.pitstops.filter(p => p.isPaymentPitstop).length !== 0) ? setMode("verifyOrder") : Alert.alert("", "Please select a payment pitstop first!", null, { cancelable: true })}
                                    style={{ ...styles.appButtonContainer, elevation: 0, backgroundColor: (state.pitstops.filter(p => p.isPaymentPitstop).length !== 0) ? "#7359be" : "#B8ABDE" }}
                                >
                                    <Text style={styles.appButtonText}>Continue</Text>
                                </TouchableHighlight>
                            </Swipeable>
                        </View>
                    </KeyboardAvoidingView>
                </>
            } */}


            {state.mode === "verifyOrder" &&
                <>
                    <TouchableOpacity onPress={leftIconHandler} style={{ position: "absolute", left: "4%", top: 41, zIndex: 6 }}>
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={styles.svgTag} xml={menuIcon} height={21} width={21} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onBackFromVerifyOrder()} style={{ bottom: state.orderVerifyCollapsed ? (107 - 49 + (Platform.OS === "ios" ? 22 : 0)) : (414 + 129 - (15) + (Platform.OS === "ios" ? 22 : 0)), position: "absolute", left: "87.3%" /*"82.3%"*/, zIndex: 6 }} >
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={{ ...styles.svgTag, marginTop: 1.5 }} xml={backIcon()} height={18} width={18} />
                        </View>
                    </TouchableOpacity>

                    <KeyboardAvoidingView style={{ ...styles.wrapper }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? handleDismissKeyboardIOS : null} onTouchEnd={state.orderVerifyCollapsed ? (() => setState((prevState) => ({ ...prevState, orderVerifyCollapsed: false }))) : null}>

                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ ...styles.caption, fontSize: 17, left: 0, marginVertical: 10, top: -13, flexGrow: 4 }}>Verify your order</Text>
                            <TouchableOpacity style={{ top: state.orderVerifyCollapsed ? -8 : -5, width: 35 }} onPress={() => {
                                Keyboard.dismiss();
                                setState((prevState) => ({
                                    ...prevState,
                                    orderVerifyCollapsed: !prevState.orderVerifyCollapsed,
                                    actionButtonsIndex: -1
                                }));
                            }}>
                                <SvgXml xml={state.orderVerifyCollapsed ? expandIcon() : collapseIcon()} width={20} height={30} style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', top: -13, marginBottom: state.orderVerifyCollapsed ? -10 : 5 }}>
                            <View style={{ height: state.orderVerifyCollapsed ? 0 : 275 }}>
                                <DraggableFlatList
                                    data={state.pitstops}
                                    renderItem={({ item, index, drag, isActive }) => {
                                        return (
                                            // <Swipeable
                                            //     ref={ref => swipableRefsInDragList.push(ref)}
                                            //     friction={1}
                                            //     // leftThreshold={20}
                                            //     // rightThreshold={40}
                                            //     // onSwipeableRightWillOpen={() => {
                                            //     //     swipableRefsInDragList.forEach((swipableRef, i) => { if (i !== index) swipableRef.close(); });
                                            //     // }}
                                            //     renderRightActions={() => {
                                            //         return (
                                            //             <>
                                            //                 {(state.pitstops.length > 2 - (1)) ?
                                            //                     <View>
                                            //                         <TouchableOpacity onPress={() => deletePitstop(index)} style={{ ...styles.appButtonContainer, elevation: 0, backgroundColor: "#fff", height: "100%", justifyContent: "center" }}>
                                            //                             <Text style={styles.appButtonText}>
                                            //                                 <SvgXml style={styles.svgTag} xml={CommonIcons.deleteIcon("#fc3f93")} height={18} width={18} />
                                            //                             </Text>
                                            //                         </TouchableOpacity>
                                            //                     </View>
                                            //                     :
                                            //                     null
                                            //                 }
                                            //                 <View>
                                            //                     <TouchableOpacity onPress={() => handleLocationSelected(null, null, index, null, false, "orderPitstopDetails")} style={{ ...styles.appButtonContainer, elevation: 0, backgroundColor: "#fff", height: "100%", justifyContent: "center" }}>
                                            //                         <Text style={styles.appButtonText}>
                                            //                             <SvgXml style={styles.svgTag} xml={CommonIcons.editIcon("#7359be")} height={18} width={18} />
                                            //                         </Text>
                                            //                     </TouchableOpacity>
                                            //                 </View>
                                            //             </>
                                            //         );
                                            //     }}
                                            // >
                                            <TouchableHighlight /*underlayColor={"#fff"}*/ /*delayLongPress={-600}*/
                                                onPressIn={() => setState((prevState) => ({ ...prevState, actionButtonsIndex: -1 }))}
                                                // onPressIn={() => swipableRefsInDragList.forEach((swipableRef, i) => { if (i !== index) swipableRef.close(); })}
                                                onPress={() => setState((prevState) => ({ ...prevState, infoModalVisibleIndex: index }))}
                                                onLongPress={() => (isActive === false) ? drag() : null}
                                            >
                                                <View style={{
                                                    flexDirection: "row", width: "100%", justifyContent: "space-between", backgroundColor: (isActive ? "#aaa" : "#fff"),
                                                    borderTopColor: (isActive ? "#aaa" : (index === 0 ? "transparent" : "#ccc")), borderWidth: (isActive ? 2.5 : 1),
                                                    borderLeftColor: (isActive ? "#aaa" : "transparent"), borderRightColor: (isActive ? "#aaa" : "transparent"),
                                                    borderBottomColor: (isActive ? "#aaa" : "transparent"), paddingVertical: 10, elevation: (isActive ? 10 : 0)
                                                    // flexDirection: "row", width: "100%", justifyContent: "space-between", backgroundColor: isActive ? "#aaa" : "#fff",
                                                    // /*transform: [{ scale: (isActive) ? 1.12 : 1 }],*/ borderTopColor: (index === 0 ? "#fff" : "#ccc"), borderBottomColor: "#fff",
                                                    // borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1, paddingVertical: 10                                                
                                                }}>
                                                    <View style={{ width: (index === state.actionButtonsIndex ? ((state.pitstops.length > 2 - (1)) ? "68%" : "73%") : "85%") /* Dimensions.get("window").width * (index === state.actionButtonsIndex ? ((state.pitstops.length > 2 - (1)) ? 0.68 : 0.73) : 0.85) */, flexDirection: "column" }}>

                                                        <View style={{ flexDirection: "row" }}>
                                                            <SvgXml xml={/* item.isPaymentPitstop ? paymentPitstopCircle : */ pitstopCircle} style={{ marginTop: 1.5 }} />
                                                            <Text style={{ ...styles.caption, color: '#7359be', marginVertical: -2.5, opacity: (index === state.actionButtonsIndex ? 0.35 : 1) }}>{"PitStop " + (index + 1)}</Text>
                                                        </View>

                                                        <View style={{ flexDirection: "row" }}>
                                                            <SvgXml xml={upDownArrowsIcon(isActive ? "#5f308e" : "#aaa")} width={15} height={15} style={{ marginTop: 4.5, left: 0 }} />
                                                            <Text style={{ ...styles.caption, color: '#000', width: "93%", fontSize: 13, top: 0, left: 10, marginVertical: 0, opacity: (index === state.actionButtonsIndex ? 0.35 : 1) }}>{item.title}</Text>
                                                        </View>

                                                        <BottomAlignedModal
                                                            visible={(index === state.infoModalVisibleIndex) ? true : false}
                                                            transparent={true}
                                                            onRequestCloseHandler={() => setState((prevState) => ({ ...prevState, infoModalVisibleIndex: -1 }))}
                                                            modalFlex={1.8}
                                                            modelViewPadding={35}
                                                            ModalContent={
                                                                <View style={{ width: "100%" }}>
                                                                    <TouchableOpacity onPress={() => setState((prevState) => ({ ...prevState, infoModalVisibleIndex: -1 }))} style={{ width: 25, height: 25, left: 30, top: -20, alignSelf: "flex-end" }}>
                                                                        <SvgXml xml={crossIcon} height={14} width={14} />
                                                                    </TouchableOpacity>

                                                                    <View style={{ flexDirection: "row", top: -30 }}>
                                                                        <SvgXml xml={/* item.isPaymentPitstop ? paymentPitstopCircle : */ pitstopCircle} style={{ left: 0, marginTop: 1.5 }} />
                                                                        <Text style={{ ...styles.caption, fontSize: 17, color: '#7359be', marginHorizontal: 0, left: 5, marginVertical: -3.0 }}>{"PitStop " + (index + 1)}</Text>
                                                                    </View>

                                                                    <ScrollView style={{ width: "100%", top: -20 }}>
                                                                        <Text style={{ ...styles.caption, color: '#000', fontSize: 14, top: 0, left: 0, marginVertical: 8 }}>{item.title}</Text>

                                                                        <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", paddingVertical: 4, borderTopColor: "#ccc", borderBottomColor: "#fff", borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1 }}>
                                                                            <Text style={{ ...styles.caption, color: '#000', fontSize: 14, fontWeight: "bold", marginTop: 4, left: 0, marginVertical: 0 }}>Buy For Me</Text>
                                                                            <Switch
                                                                                disabled={true}
                                                                                trackColor={{ false: "#767577", true: "#46e54b" /* "#7359be" */ }}
                                                                                thumbColor={"#fff"}
                                                                                // style={{ alignSelf: "flex-end" }}
                                                                                ios_backgroundColor="#767577"
                                                                                value={item.details && item.details.buyForMe}
                                                                            />
                                                                        </View>

                                                                        {item.details && item.details.buyForMe && item.details.estCost &&
                                                                            <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", paddingVertical: 8, borderTopColor: "#ccc", borderBottomColor: "#fff", borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1 }}>
                                                                                <Text style={{ ...styles.caption, color: '#000', fontSize: 14, fontWeight: "bold", marginTop: 0, left: 0, marginVertical: 0 }}>Estimated Amount</Text>
                                                                                <Text style={{ ...styles.caption, color: '#000', fontSize: 14, left: -7, marginVertical: 0 }}>
                                                                                    Rs. {item.details.estCost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                                                </Text>
                                                                            </View>
                                                                        }

                                                                        {item.details && item.details.estTime &&
                                                                            <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", paddingVertical: 8, borderTopColor: "#ccc", borderBottomColor: "#fff", borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1 }}>
                                                                                <Text style={{ ...styles.caption, color: '#000', fontSize: 14, fontWeight: "bold", marginTop: 0, left: 0, marginVertical: 0 }}>Estimated Time</Text>
                                                                                <Text style={{ ...styles.caption, color: '#000', fontSize: 14, left: -7, marginVertical: 0 }}>
                                                                                    {item.details && item.details.estTime}
                                                                                </Text>
                                                                            </View>
                                                                        }

                                                                        {item.details && item.details.description &&
                                                                            <View style={{ flexDirection: "column", width: "100%", justifyContent: "space-between", paddingVertical: 8, borderTopColor: "#ccc", borderBottomColor: "#fff", borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1 }}>
                                                                                <Text style={{ ...styles.caption, color: '#000', fontSize: 14, fontWeight: "bold", marginTop: 0, left: 0, marginVertical: 0, left: 0, marginVertical: 0 }}>Description</Text>
                                                                                <Text style={{ ...styles.caption, color: '#000', fontSize: 14, left: 0, marginVertical: 0 }}>{item.details && item.details.description}</Text>
                                                                            </View>
                                                                        }
                                                                    </ScrollView>
                                                                </View>
                                                            }
                                                        />

                                                    </View>

                                                    <View style={{ width: "auto" /* Dimensions.get("window").width * (index === state.actionButtonsIndex ? ((state.pitstops.length > 2 - (1)) ? 0.32 : 0.14) : 0.15) */, top: 0, height: 35 }}>
                                                        {(index === state.actionButtonsIndex) ?
                                                            <View style={{ flexDirection: "row" }}>
                                                                <View>
                                                                    <TouchableOpacity onPress={() => handleLocationSelected(null, null, index, null, false, "orderPitstopDetails")} style={{ ...styles.appButtonContainer, elevation: 0, paddingHorizontal: 8, backgroundColor: "transparent", height: "100%", justifyContent: "center" }}>
                                                                        <SvgXml style={styles.svgTag} xml={CommonIcons.editIcon("#7359be")} height={18} width={18} />
                                                                    </TouchableOpacity>
                                                                </View>
                                                                {(state.pitstops.length > 2 - (1)) ?
                                                                    <View>
                                                                        <TouchableOpacity onPress={() => deletePitstop(index)} style={{ ...styles.appButtonContainer, elevation: 0, paddingHorizontal: 8, backgroundColor: "transparent", height: "100%", justifyContent: "center" }}>
                                                                            <SvgXml style={styles.svgTag} xml={CommonIcons.deleteIcon("#fc3f93")} height={18} width={18} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                    :
                                                                    null
                                                                }
                                                                <View>
                                                                    <TouchableOpacity onPress={() => setState((prevState) => ({ ...prevState, actionButtonsIndex: -1 }))} style={{ ...styles.appButtonContainer, elevation: 0, paddingHorizontal: 8, backgroundColor: "transparent", height: "100%", justifyContent: "center" }}>
                                                                        <SvgXml style={styles.svgTag} xml={crossIcon} height={14} width={14} />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                            :
                                                            <View style={{ flexDirection: "row" }}>
                                                                <View>
                                                                    <TouchableOpacity onPress={() => setState((prevState) => ({ ...prevState, actionButtonsIndex: index }))} style={{ ...styles.appButtonContainer, elevation: 0, paddingHorizontal: 8, backgroundColor: "transparent", height: "100%", justifyContent: "center" }}>
                                                                        <SvgXml style={styles.svgTag} xml={threeDotsIcon} height={18} width={18} />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                        }
                                                    </View>
                                                </View>
                                            </TouchableHighlight>
                                            // </Swipeable>
                                        );
                                    }}
                                    onDragEnd={({ data }) => setState((prevState) => ({
                                        ...prevState,
                                        pitstops: [...data]
                                    }))}
                                    keyExtractor={(item, index) => `draggable-${index}`}
                                />
                            </View>
                        </View>

                        {!state.orderVerifyCollapsed &&
                            <View style={{ flexDirection: "column", width: "100%", alignItems: "center", height: 60, borderRadius: 0, borderTopColor: "#ccc", borderBottomColor: "#ccc", borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1 }}>
                                <Text style={{ ...styles.caption, color: '#000', fontSize: 13, top: 10, left: 0, marginVertical: 0, fontWeight: "bold" }}>TOTAL ESTIMATED AMOUNT</Text>

                                <Text style={{ ...styles.caption, color: '#000', fontSize: 13, top: 15, left: 0, marginVertical: 0, fontWeight: "bold" }}>
                                    {"Rs. " + state.pitstops.map((p, i) => (p.details && p.details.estCost) || 0).reduce((a, b) => a + b).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </Text>
                            </View>
                        }

                        {!state.orderVerifyCollapsed &&
                            <View style={{ flexDirection: "row", width: "100%", alignItems: "center", alignSelf: "center", justifyContent: "center", marginVertical: 10 }}>
                                <TextInput
                                    multiline={false}
                                    returnKeyType="done"
                                    onSubmitEditing={() => Keyboard.dismiss()}
                                    placeholder="Promo Code"
                                    placeholderTextColor="#fff"
                                    value={state.promoCodeApplied}
                                    // defaultValue={state.promoCodeApplied}
                                    style={{ backgroundColor: "#4e4e4e", color: "#fff", borderRadius: 20, height: 40, marginRight: 10, paddingLeft: 15, paddingRight: 15, width: Platform.OS === "ios" ? 112 : 110 }}
                                    onChangeText={(value) => onChangePromoCode(value)}
                                />
                                <TouchableOpacity onPress={() => onGetPromoPressed()}>
                                    <Text style={{ ...styles.caption, left: 0, fontSize: 14, color: '#7359be', marginVertical: 0, fontWeight: "bold", paddingVertical: 15.5 }}>GET PROMO</Text>
                                </TouchableOpacity>
                            </View>
                        }

                        <BottomAlignedModal
                            visible={state.promoModalVisible}
                            transparent={true}
                            onRequestCloseHandler={() => onCloseGetPromoModal()}
                            modalFlex={1.5}
                            modalHeight={Dimensions.get("window").height * 0.5}
                            modelViewPadding={{ top: 35, bottom: 0, left: 25, right: 25 }}
                            ModalContent={
                                <>
                                    <View style={{ width: "100%" }}>
                                        <TouchableOpacity onPress={() => onCloseGetPromoModal()} style={{ width: 25, height: 25, left: 20, top: -20, zIndex: 500, alignSelf: "flex-end" }}>
                                            <SvgXml xml={crossIcon} height={14} width={14} />
                                        </TouchableOpacity>

                                        <Text style={{ ...styles.caption, color: '#7359be', top: -42, left: 0, fontWeight: "bold", marginVertical: 0 }}>{"Promo Codes"}</Text>

                                        <ScrollView style={{ width: "100%", top: -42, marginBottom: 60 }}>
                                            {state.promoCodesList && state.promoCodesList.map((item, index) => (
                                                <TouchableHighlight underlayColor={"#dddddd"} key={index} onPress={() => onSelectPromoCode(item.promotionCode)}>
                                                    <View style={{
                                                        flexDirection: "row", width: "100%", justifyContent: "space-between",
                                                        borderTopColor: (index === 0 ? "#fff" : "#ccc"), borderBottomColor: "#fff",
                                                        borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1, paddingVertical: 10
                                                    }}>
                                                        <View style={{ flexDirection: "column", width: "80%" }}>
                                                            <Text style={{ ...styles.caption, color: '#7359be', top: 0, left: 0, marginVertical: 0 }}>{item.promotionCode}</Text>

                                                            <Text style={{ ...styles.caption, color: '#000', fontSize: 13, top: 5, left: 0, marginVertical: 0 }}>{item.description}</Text>
                                                        </View>

                                                        <View style={{ display: (state.promoCodeSelected === item.promotionCode ? "flex" : "none"), top: 10, right: 25 }}>
                                                            <SvgXml xml={CommonIcons.tickIcon()} width={17} height={17} />
                                                        </View>
                                                    </View>
                                                </TouchableHighlight>
                                            ))}
                                        </ScrollView>
                                    </View>

                                    <TouchableOpacity
                                        disabled={(state.promoCodesList && state.promoCodesList.filter(item => item.promotionCode === state.promoCodeSelected).length === 0) ? true : false}
                                        onPress={() => onApplyPromoCode()}
                                        style={{ ...styles.appButtonContainer, marginBottom: (Platform.OS === "ios" ? 22 : 0), position: "absolute", width: Dimensions.get("window").width, alignSelf: "center", bottom: 0, opacity: (state.promoCodesList && state.promoCodesList.filter(item => item.promotionCode === state.promoCodeSelected).length === 0) ? 0.5 : 1 }}
                                    >
                                        <Text style={styles.appButtonText}>Apply</Text>
                                    </TouchableOpacity>
                                </>
                            }
                        />

                        <BottomAlignedModal
                            visible={state.allocatingRiderModalVisible}
                            transparent={true}
                            modalFlex={1.5}
                            modalHeight={237}
                            modelViewPadding={10}
                            ModalContent={
                                <>
                                    <View style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        {(state.allocatingRiderRetryString) ?
                                            <>
                                                <SvgXml xml={topNoRiderFound} height={50} width={50} />

                                                <Text style={{ ...styles.caption, color: '#000', marginTop: 10, left: 0, fontWeight: "bold", marginVertical: 0 }}>Sorry</Text>

                                                <Text style={{ ...styles.caption, color: '#000', marginTop: 10, left: 0, marginVertical: 0 }}>{state.allocatingRiderRetryString}</Text>

                                                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                                                    <TouchableOpacity style={{ ...styles.appButtonContainer, width: 60, elevation: 0, backgroundColor: "transparent" }} onPress={() => {
                                                        retriedRequestTimeRef.current = new Date().getTime();
                                                        retryOrderRequest(false, state.orderID);
                                                    }}>
                                                        <SvgXml xml={retryNoRiderFound} height={45} width={45} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={{ ...styles.appButtonContainer, width: 80, elevation: 0, backgroundColor: "transparent" }} onPress={() => {
                                                        goToHome(false, { valueToHomeScreen: new Date().getTime() }, false);
                                                    }}>
                                                        <SvgXml xml={cancelNoRiderFound} height={45} width={45} />
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                            :
                                            <>
                                                <SvgXml xml={doneIcon()} height={70} width={70} />

                                                <Text style={{ ...styles.caption, color: '#000', marginTop: 10, left: 0, fontWeight: "bold", marginVertical: 0 }}>Your Order is placed. Please wait...</Text>

                                                <Text style={{ ...styles.caption, color: '#000', marginTop: 10, left: 0, marginVertical: 0 }}>Your Jovi will be at your service shortly.</Text>

                                                <ImageBackground source={allocatingRiderIcon} style={{ marginTop: 15, resizeMode: 'contain', width: 70, height: 70 }} />
                                            </>
                                        }
                                    </View>
                                </>
                            }
                        />

                        <View style={{ width: "110%", left: -15, marginBottom: (Platform.OS === "ios" ? 22 : 0) }}>
                            {!state.orderVerifyCollapsed &&
                                <Swipeable
                                    friction={1}
                                    leftThreshold={20}
                                    rightThreshold={40}
                                    containerStyle={{ backgroundColor: "#7359bc" }}
                                    onSwipeableLeftWillOpen={() => {
                                        swipableBottomActionRef.current.setNativeProps({ style: { width: (Dimensions.get("window").width * 2) / 3 } })
                                    }}
                                    onSwipeableWillClose={() => {
                                        swipableBottomActionRef.current.setNativeProps({ style: { width: Dimensions.get("window").width } })
                                    }}
                                    renderLeftActions={() => {
                                        return (
                                            <View>
                                                <TouchableOpacity onPress={() => onCancelOrder()} style={{ ...styles.appButtonContainer, width: Dimensions.get("window").width / 3, elevation: 0, backgroundColor: "#fc3f93" }}>
                                                    <Text style={styles.appButtonText}>Cancel</Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    }}
                                >
                                    <TouchableHighlight ref={swipableBottomActionRef} underlayColor={"#B8ABDE"} onPress={() => onOrderPressed()} style={{ ...styles.appButtonContainer, elevation: 0 }}>
                                        <Text style={styles.appButtonText}>Order</Text>
                                    </TouchableHighlight>
                                </Swipeable>
                            }
                        </View>

                    </KeyboardAvoidingView>
                </>
            }


            {state.mode === "riderAllocated" &&
                <>
                    <TouchableOpacity onPress={leftIconHandler} style={{ position: "absolute", left: "4%", top: 41, zIndex: 6 }}>
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={styles.svgTag} xml={menuIcon} height={21} width={21} />
                        </View>
                    </TouchableOpacity>


                    <KeyboardAvoidingView style={{ ...styles.wrapper }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? handleDismissKeyboardIOS : null}>

                        {state.riderAllocatedTabIndex === 0 &&
                            <>
                                <View style={{ width: "100%", flexDirection: "row", alignItems: "center", alignSelf: "center", justifyContent: "flex-start", borderTopLeftRadius: 10, borderTopRightRadius: 15, paddingBottom: 16 }}>
                                    <Image resizeMode="cover" source={(state.riderData.image ? { uri: renderPicture(state.riderData.image, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken)) } : { uri: EMPTY_PROFILE_URL })} style={{ flexGrow: 0, width: 51, height: 51, borderRadius: 125 }} />
                                    <View style={{ flexGrow: 5, left: 5 }}>
                                        <Text style={{ ...styles.caption, fontSize: 15, color: '#7359be', left: 0, marginVertical: 0, fontWeight: "bold" }}>{state.riderData.name}</Text>
                                        <View>
                                            <View style={{ flexDirection: "row", height: 20, width: 50, alignItems: "center", backgroundColor: "#b1b1b1", borderRadius: 10 }}>
                                                <Text style={{ ...styles.caption, fontSize: 13, color: '#fff', left: 8, marginVertical: 0 }}>{state.riderData.rating}</Text>
                                                <SvgXml xml={ratingStar()} width={12} height={12} style={{ marginLeft: 12 }} />
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ flexGrow: 0.5, right: 8 }}>
                                        <Text style={{ ...styles.caption, alignSelf: "flex-end", fontSize: 15, color: '#7359be', left: 0, marginVertical: 0, fontWeight: "bold" }}>{state.riderData.registerationNo}</Text>
                                        <Text style={{ ...styles.caption, alignSelf: "flex-end", fontSize: 13, color: '#000', left: 0, marginVertical: 0 }}>{state.riderData.model}</Text>
                                    </View>
                                    {state.chatVisible &&
                                        <TouchableOpacity
                                            style={{ width: 40, height: 35 }}
                                            onPress={() => {
                                                Keyboard.dismiss();
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    keyboardShown: false,
                                                    chatVisible: false,
                                                    chatTyping: false,
                                                    chatBoxValue: "",
                                                    chatLoadedImages: [],
                                                    chatPlayingVoice: false,
                                                    chatPlayingVoiceIndex: -1
                                                }));
                                            }}>
                                            <SvgXml xml={collapseIcon()} width={20} height={30} style={{ marginLeft: 8 }} />
                                        </TouchableOpacity>
                                    }
                                </View>

                                {state.chatVisible &&
                                    <ScrollView
                                        ref={chatMessagesListRef}
                                        style={{ width: "100%", paddingLeft: 10, paddingRight: 10, height: (Dimensions.get("window").height - (state.keyboardShown ? 590 + (Platform.OS === "ios" ? 95 : 0) : 340)) /* (state.keyboardShown ? 165 - 65 : 365) */ /* (Dimensions.get("window").height * (state.keyboardShown ? 0.3 : 0.6)) */ }}
                                        onContentSizeChange={() => chatMessagesListRef.current.scrollToEnd({ animated: true })}
                                    >
                                        {state.chatMessages && state.chatMessages.map((item, index) => (
                                            <View key={index} style={{ flexDirection: (item.type === "received" ? "row-reverse" : "row"), marginBottom: (index === state.chatMessages.length - 1 ? 0 : 10) }}>
                                                <View style={{ flexDirection: "column", width: (Dimensions.get("window").width - 50 - 30 - 5 - 34), marginLeft: (item.type === "received" ? 0 : 34), marginRight: (item.type === "received" ? 34 : 0), alignItems: "flex-start", backgroundColor: (item.type === "received" ? "#fff" : "#f7f7f7"), padding: 7, borderRadius: 15, borderBottomLeftRadius: (item.type === "received" ? 0 : 15), borderBottomRightRadius: (item.type === "received" ? 15 : 0), borderColor: "#E5E5E5", borderWidth: 1, elevation: 0 }}>
                                                    {(item.picture) ?
                                                        <>
                                                            <View style={{ flexDirection: "row" }}>

                                                                <TouchableOpacity onPress={() => setState((prevState) => ({ ...prevState, chatViewingImageIndex: index }))} >
                                                                    <ImageBackground
                                                                        resizeMode="cover"
                                                                        style={{ height: 90, width: 90, borderRadius: 10 }}
                                                                        borderRadius={10}
                                                                        onLoadEnd={() => state.chatLoadedImages.indexOf(index) === -1 && setState((prevState) => ({ ...prevState, chatLoadedImages: [...prevState.chatLoadedImages, index] }))}
                                                                        source={{
                                                                            uri: item.loadPicture ?
                                                                                renderPicture(item.picture, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
                                                                                :
                                                                                item.picture
                                                                        }}
                                                                    >
                                                                        <Spinner isVisible={(item.loadPicture && state.chatLoadedImages.indexOf(index) === -1) ? true : false} size={40} type="Circle" color={"#7359be"} />

                                                                        <ImageView
                                                                            key={index}
                                                                            images={[{
                                                                                uri: item.loadPicture ?
                                                                                    renderPicture(item.picture, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
                                                                                    :
                                                                                    item.picture
                                                                            }]}
                                                                            imageIndex={0}
                                                                            visible={state.chatViewingImageIndex === index}
                                                                            onRequestClose={() => setState((prevState) => ({ ...prevState, chatViewingImageIndex: -1 }))}
                                                                        />
                                                                    </ImageBackground>
                                                                </TouchableOpacity>

                                                            </View>
                                                        </>
                                                        :
                                                        (item.voice) ?
                                                            <View style={{ flexDirection: "row", height: 33, width: 68, alignItems: "center", backgroundColor: "#b1b1b1", borderRadius: 10 }}>
                                                                <TouchableOpacity onPress={() => onPlayPauseAudio(item, index)}>
                                                                    <SvgXml xml={(state.chatPlayingVoice && state.chatPlayingVoiceIndex === index) ? pauseIcon() : playIcon()} width={20} height={20} style={{ marginLeft: 12, left: (state.chatPlayingVoice && state.chatPlayingVoiceIndex === index) ? -2 : 0 }} />
                                                                </TouchableOpacity>
                                                                <SvgXml xml={recordIcon()} width={12} height={12} style={{ marginLeft: 12 }} />
                                                            </View>
                                                            :
                                                            <Text style={{ ...styles.caption, fontSize: 13, color: '#000', marginVertical: 0, left: 3 }}>{item.message}</Text>
                                                    }
                                                    <Text style={{ ...styles.caption, fontSize: 12, color: "#bbb", alignSelf: (item.type === "received" ? "flex-start" : "flex-end"), marginVertical: 0, left: (item.type === "received" ? 3 : -3), marginTop: 3, fontWeight: "bold" }}>{item.timeStamp}</Text>
                                                </View>
                                                <Image
                                                    resizeMode="cover"
                                                    style={{ width: 30, height: 30, position: "absolute", bottom: 1, right: 0, borderRadius: 125 }}
                                                    source={item.type === "received" ?
                                                        (state.riderData.image ?
                                                            {
                                                                uri: renderPicture(state.riderData.image, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
                                                            }
                                                            :
                                                            {
                                                                uri: EMPTY_PROFILE_URL
                                                            }
                                                        )
                                                        :
                                                        {
                                                            uri: (userObj.picture ?
                                                                (!userObj.isLocalChange) ?
                                                                    renderPicture(userObj.picture, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
                                                                    :
                                                                    userObj.picture
                                                                :
                                                                EMPTY_PROFILE_URL
                                                            )
                                                        }
                                                    }
                                                />
                                            </View>
                                        ))}
                                    </ScrollView>
                                }

                                <View style={{ flexDirection: "row", width: "100%", alignItems: "center", alignSelf: "center", justifyContent: "center", marginVertical: 10 }}>
                                    {state.chatRecording &&
                                        <View style={{ position: "absolute", flexDirection: "row", left: 0, marginLeft: 25, alignItems: "center", alignSelf: "center", justifyContent: "center" }}>
                                            <SvgXml xml={recordIcon()} width={12} height={12} style={{ marginRight: 3 }} />
                                            <TextInput
                                                ref={recordTimeRef}
                                                multiline={false}
                                                showSoftInputOnFocus={false}
                                                editable={false}
                                                caretHidden={true}
                                                placeholder={""}
                                                style={{ width: 65, color: activeTheme.default, fontSize: 15, borderRadius: 20, height: 40, paddingRight: 15, borderColor: "transparent", borderWidth: 0, paddingTop: 8, paddingBottom: 9 }}
                                            />
                                            <Stopwatch
                                                start={true}
                                                reset={false}
                                                // startTime={200}
                                                getTime={(time) => recordTimeRef.current?.setNativeProps({ text: time.substring(time.indexOf(":") + 1, time.length) })}
                                                options={{
                                                    container: { backgroundColor: '#fff', display: "none" },
                                                    text: { fontSize: 14, color: activeTheme.default, display: "none" }
                                                }}
                                            />
                                        </View>
                                    }
                                    <TextInput
                                        multiline={state.chatVisible}
                                        returnKeyType={state.chatVisible ? "default" : "done"}
                                        onSubmitEditing={state.chatVisible ? null : () => Keyboard.dismiss()}
                                        showSoftInputOnFocus={Platform.OS === "ios" ? state.chatVisible : state.chatVisible /* true */}
                                        editable={Platform.OS === "ios" && !state.chatVisible ? false : true}
                                        onTouchStart={state.chatVisible ? () => { } : () => onLoadChat()}
                                        caretHidden={(state.chatRecording || !state.keyboardShown) /* state.chatRecording */}
                                        placeholder={state.chatVisible ? (state.chatRecording ? "" : "Chat here...") : "Tap to chat..."}
                                        placeholderTextColor="#ccc"
                                        value={state.chatBoxValue}
                                        style={{ flexGrow: 4, width: 50, color: "#000", borderRadius: 20, height: state.chatVisible ? null : 40, maxHeight: 73, marginLeft: 10, marginRight: 10, paddingLeft: 15, paddingRight: 15, borderColor: "#E5E5E5", borderWidth: 1, paddingTop: 8, paddingBottom: 9 }}
                                        onChangeText={(value) => setState((prevState) => ({ ...prevState, chatTyping: (value !== "" ? true : false), chatBoxValue: value }))}
                                    />
                                    {state.chatVisible &&
                                        <>
                                            <TouchableOpacity onPress={onCameraClicked} style={{ flexGrow: 0.2 }}>
                                                <View style={{ ...styles.headerLeftIconView, borderRadius: 20 }} >
                                                    <SvgXml style={styles.svgTag} xml={cameraIcon()} height={19} width={19} />
                                                </View>
                                            </TouchableOpacity>
                                            {state.chatTyping ?
                                                <TouchableOpacity onPress={() => sendMessageToRider()} style={{ flexGrow: 0.2 }}>
                                                    <View style={{ ...styles.headerLeftIconView, borderRadius: 20 }} >
                                                        <SvgXml style={{ ...styles.svgTag, left: 1.5 }} xml={sendIcon()} height={18} width={18} />
                                                    </View>
                                                </TouchableOpacity>
                                                :
                                                state.chatAllowRecording &&
                                                <TouchableHighlight underlayColor={"transparent"}
                                                    onPressIn={() => {
                                                        const fileName = "record-" + new Date().getTime() + ".mp4";
                                                        recorderRef.current = new Recorder(fileName).record();

                                                        setState((prevState) => ({ ...prevState, chatRecording: true }));
                                                    }}
                                                    onPressOut={(event) => {
                                                        event.persist();
                                                        recorderRef.current.stop((error) => {
                                                            if (!error) {
                                                                if (event.nativeEvent.touches.length === 0) {
                                                                    sendMessageToRider(null, {
                                                                        uri: "file://" + recorderRef.current._fsPath,
                                                                        type: "audio/mp4"
                                                                    });
                                                                }

                                                                setState((prevState) => ({ ...prevState, chatRecording: false }));
                                                            }
                                                            else {
                                                                Alert.alert("Error Occurred while Recording Audio!");
                                                                setState((prevState) => ({ ...prevState, chatRecording: false }));
                                                            }
                                                        });
                                                    }}
                                                    style={{ flexGrow: 0.2 }}
                                                >
                                                    <View style={{ ...styles.headerLeftIconView, left: state.chatRecording ? 4 : 0, width: state.chatRecording ? 60 : 38, height: state.chatRecording ? 60 : 38, backgroundColor: state.chatRecording ? "#7359be" : "#fff", borderRadius: state.chatRecording ? 30 : 20 }} >
                                                        <SvgXml style={{ ...styles.svgTag, left: 0 }} xml={recordIcon(!state.chatRecording ? "#7359be" : "#fff")} height={state.chatRecording ? 28 : 18} width={state.chatRecording ? 28 : 18} />
                                                    </View>
                                                </TouchableHighlight>
                                            }
                                        </>
                                    }
                                </View>
                            </>
                        }

                        {state.riderAllocatedTabIndex === 1 &&
                            <>
                                <View style={{ width: "100%", flexDirection: "row", alignItems: "center", alignSelf: "center", justifyContent: "flex-start", borderTopLeftRadius: 10, borderTopRightRadius: 15, paddingBottom: 16 }}>
                                    <Text style={{ ...styles.caption, fontSize: 15, color: '#7359be', left: 0, marginVertical: 0, fontWeight: "bold" }}>2nd Tab</Text>
                                </View>
                            </>
                        }

                        {state.riderAllocatedTabIndex === 2 &&
                            <>
                                <View style={{ width: "100%", flexDirection: "row", alignItems: "center", alignSelf: "center", justifyContent: "flex-start", borderTopLeftRadius: 10, borderTopRightRadius: 15, paddingBottom: 16 }}>
                                    <Text style={{ ...styles.caption, fontSize: 15, color: '#7359be', left: 0, marginVertical: 0, fontWeight: "bold" }}>3rd Tab</Text>
                                </View>
                            </>
                        }

                        <View style={{ width: "110%", left: -17, flexDirection: "row", justifyContent: "space-around", backgroundColor: "#7359be", paddingBottom: 16 }}>
                            <TouchableOpacity>
                                <View onTouchStart={() => onChangeTab(0, false)}>
                                    <SvgXml xml={state.riderAllocatedTabIndex === 0 ? tabBikeSelected() : tabBike()} width={70} height={30} style={{ marginTop: 16 }} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <View onTouchStart={() => onChangeTab(1, false)}>
                                    <SvgXml xml={state.riderAllocatedTabIndex === 1 ? tabLocationSelected() : tabLocation()} width={70} height={30} style={{ marginTop: 16 }} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <View onTouchStart={() => onChangeTab(2, false)}>
                                    <SvgXml xml={state.riderAllocatedTabIndex === 2 ? tabDetailsSelected() : tabDetails()} width={70} height={30} style={{ marginTop: 16 }} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <View onTouchEnd={() => onChangeTab(3, false)}>
                                    <SvgXml xml={state.riderAllocatedTabIndex === 3 ? tabHomeSelected() : tabHome()} width={70} height={30} style={{ marginTop: 16 }} />
                                </View>
                            </TouchableOpacity>
                        </View>

                    </KeyboardAvoidingView>
                </>
            }


            {/* --------------------------------------------------------------------------------------------- */}


            {state.mode !== "riderAllocated" && state?.finalDestObj?.title && userObj &&
                <TouchableOpacity style={{ position: "absolute", left: "15%", top: 35, zIndex: 6 }} onPress={() => {
                    navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: null, selectDestination: true, fromHome: false, homeFooterHandler: {} });
                }}>
                    <View style={{ top: (Platform.OS === "android" ? 6 : 8.5), borderRadius: 5, backgroundColor: "rgba(20, 20 , 20, 0.07)", elevation: (Dimensions.get("window").height < 767 ? 53.5 : 43) /* 43 */ }}>
                        <Text style={{ fontSize: 16, width: 130, paddingLeft: 5 }}>
                            {"Hi, "}
                            <Text style={{ color: "#7359be", fontWeight: "bold" }}>
                                {(userObj.firstName) ? (userObj.firstName.substring(0, 9) + (userObj.firstName.length > 9 ? "..." : "")) : ""}
                            </Text>
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: "bold", paddingLeft: 5 }}>
                            {state.finalDestObj.title.substring(0, 18) + (state.finalDestObj.title.length > 18 ? "..." : "")}
                        </Text>
                    </View>
                </TouchableOpacity>
            }

            <>
                <View style={{ position: "absolute", right: 14, top: 41.5, zIndex: 6, backgroundColor: (numberOfOrdersToShow > 0 ? activeTheme.default : "transparent"), width: 136, borderRadius: 85, elevation: (numberOfOrdersToShow > 0 ? 25 : 0), height: 37, borderWidth: 1, borderStyle: "solid", borderColor: (numberOfOrdersToShow > 0 ? "#F0F0F0" : "transparent"), flexDirection: 'row', justifyContent: (numberOfOrdersToShow > 0 ? 'space-between' : 'flex-end'), alignItems: 'center' }}>
                    {numberOfOrdersToShow > 0 &&
                        <TouchableOpacity style={{ width: 90, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => showHideTasksModal(!state.tasksModalVisible)}>
                            <Text style={{ color: activeTheme.white, paddingLeft: 10 }}>{numberOfOrdersToShow + " Task" + (numberOfOrdersToShow === 1 ? "" : "s")}</Text>
                            <SvgXml xml={dropIcon} height={15} width={15} />
                        </TouchableOpacity>
                    }
                    <TouchableOpacity disabled>
                        <ImageBackground
                            source={{
                                uri: (userObj.picture ?
                                    (!userObj.isLocalChange) ?
                                        renderPicture(userObj.picture, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
                                        :
                                        userObj.picture
                                    :
                                    EMPTY_PROFILE_URL
                                )
                            }}
                            resizeMode="cover"
                            style={{ marginRight: 2, height: 32, width: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
                            onLoadEnd={() => state.loadedProfilePic === false && setState(prevState => ({ ...prevState, loadedProfilePic: true }))}
                        >
                            <Spinner isVisible={!state.loadedProfilePic} size={30} type="Circle" color={activeTheme.white} />
                        </ImageBackground>

                    </TouchableOpacity>
                </View>

                {state.tasksModalVisible &&
                    <View style={{ overflow: 'hidden', maxHeight: 170, width: 200, borderRadius: 10, elevation: 15, borderWidth: 0.5, borderColor: activeTheme.lightGrey, backgroundColor: activeTheme.white, position: 'absolute', zIndex: 80, right: Platform.select({ android: 14, ios: 14 /* "4%" */ }), top: Platform.select({ android: 82, ios: 85 }), bottom: 0 }}>
                        {state.tasksData.openOrderList.map((item, i) => {
                            if (state.mode === "riderAllocated" && state.orderID === item.orderID) {
                                return null;
                            }
                            else {
                                return (
                                    <TouchableOpacity key={i} style={{ margin: 2, height: 50 }} onPress={() => {
                                        navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: item?.orderID, selectDestination: false, fromHome: false, homeFooterHandler: {} });
                                        showHideTasksModal(false);
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 999 }}>
                                            <Text style={{ ...commonStyles.fontStyles(14, activeTheme.black, 4), paddingLeft: 10 }}>{item.joviType === 1 ? "Jovi" : item.joviType === 2 ? "Restaurant" : item.joviType === 3 ? "Pharmacy" : "SuperMarket"}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                <Text style={{ ...commonStyles.fontStyles(14, activeTheme.black, 4) }}>{item.completedJobPercetage.toString()}%</Text>
                                                <CircularProgress size={40} text={null} progressPercent={item.completedJobPercetage} strokeWidth={7} pgColor={item.completedJobPercetage >= 100 ? activeTheme.default : "#74B570"} />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }
                        })}
                    </View>
                }
            </>


        </View >
    );
};

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        alignSelf: 'stretch'
    },
    wrapper: {
        alignItems: 'flex-start',
        flexDirection: 'column',
        backgroundColor: '#fff',
        width: '100%', //'85%'
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        zIndex: 5,
        shadowColor: '#000',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
        paddingBottom: 0, //15
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    appButtonContainer: {
        elevation: 8,
        backgroundColor: "#7359BE",
        borderRadius: 0, //50
        paddingVertical: 15,
        paddingHorizontal: 15,
        width: '100%',
    },
    appButtonText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        fontFamily: plateformSpecific('proxima-nova', 'Proxima Nova')
    },
    btmBg: {
        width: '100%',
        height: 100,
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        zIndex: 2
    },
    caption: {
        position: "relative",
        left: 10,
        fontSize: 15,
        color: '#7359BE',
        marginVertical: 10,
    },


    headerLeftIconView: {
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        width: 38,
        height: 38,
        borderRadius: 10,
        elevation: 4
    },
    headerRightIconView: {
        width: 40,
        elevation: 4
    },
    svgTag: {
        alignSelf: 'center'
    },


    taskView: {
        backgroundColor: "rgba(115, 89, 190, 1)",
        borderRadius: 50,
        width: '90%',
        height: 'auto',
        alignSelf: 'center',
        marginTop: 4,
        elevation: 4
    },
    textView: {
        margin: 10,
        alignSelf: 'center'
    },
    taskText: {
        color: "rgba(255, 255, 255, 1)"
    },

    textInputLoc: {
        display: 'flex',
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'rgba(0,0,0,0.1)',
        paddingVertical: 0,
        marginBottom: 0,
        paddingHorizontal: 10,
        paddingRight: 10,
        backgroundColor: "white",
        elevation: 2
    },
    textInputDesc: {
        display: 'flex',
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'rgba(0,0,0,0.1)',
        paddingVertical: 0,
        marginBottom: 5,
        paddingHorizontal: 5,
        paddingRight: 5
    }
});

const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer
    }
};

export default connect(mapStateToProps)(CustomerOrder);
