import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, View, Image, Platform, TouchableOpacity, TouchableHighlight, Text, Alert, Dimensions, Switch, FlatList, BackHandler, Keyboard, Picker, ScrollView, KeyboardAvoidingView, AppState, ImageBackground, DeviceEventEmitter } from "react-native";
import MapRider from "./MapRider";
import { connect } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useBackHandler } from '@react-native-community/hooks';
import LocationSearch from "../../customerorder/LocationSearch";
import plateformSpecific from '../../../utils/plateformSpecific';
import { getHubConnectionInstance, navigationHandler, getParamFromNavigation, navigateWithResetScreen, clearRiderOrderStorage, sharedImagePickerHandler, askForAudioRecordPermission, renderPicture, setIsForcePermissionLocDialogVisible, getIsForcePermissionLocDialogVisible, setIsForceTurnOnLocDialogVisible, getIsForceTurnOnLocDialogVisible, setFloatingAmountOnServer } from "../../../utils/sharedActions";
import { SvgXml } from "react-native-svg";
import moment from 'moment';
import pitstopCircle from "../../../assets/svgIcons/customerorder/pitstop-circle.svg";
// import paymentPitstopCircle from "../../../assets/svgIcons/customerorder/paymentpitstop-circle.svg";
import pitstopFieldCircle from "../../../assets/svgIcons/customerorder/pitstopfield-circle.svg";
import menuIcon from "../../../assets/svgIcons/common/menu-stripes.svg";
import crossIcon from "../../../assets/svgIcons/common/cross-new.svg";
import approvedIcon from '../../../assets/svgIcons/rider/approvedIcon.svg';
import { EMPTY_PROFILE_URL } from "../../../config/config";
import houseIcon from "../../../assets/svgIcons/customerorder/house-ico.svg";
import locateMeIcon from "../../../assets/svgIcons/customerorder/locate-ico.svg";
import dropIcon from '../../../assets/svgIcons/common/drop-down-arrow.svg';
import threeDotsIcon from '../../../assets/svgIcons/common/three-dots.svg';
import { TextInput, TouchableWithoutFeedback, RectButton } from "react-native-gesture-handler";
import { clockIcon, backIcon, doneIcon, collapseIcon, expandIcon, favHomeIcon, favWorkIcon, /* favOtherIcon, */ favFriendsIcon, favFamilyIcon, upDownArrowsIcon } from "../../../assets/svgIcons/customerorder/customerorder";
import { tabBike, tabBikeSelected, tabHome, tabHomeSelected, tabLocation, tabLocationSelected, tabDetails, tabDetailsSelected, ratingStar, cameraIcon, sendIcon, recordIcon, playIcon, pauseIcon } from "../../../assets/svgIcons/customerorder/riderallocated";
import { goOnlineIcon, chatDisabledIcon, chatEnabledIcon, amountFieldIcon } from "../../../assets/svgIcons/riderorder/riderorder";
import allocatingRiderIcon from "../../../assets/allocating-rider.gif";
import CommonIcons from "../../../assets/svgIcons/common/common";
import RangeSlider from 'rn-range-slider';
import AsyncStorage from '@react-native-community/async-storage';
import Swipeable from "react-native-gesture-handler/Swipeable";
import DraggableFlatList from "react-native-draggable-flatlist";
import BottomAlignedModal from '../../../components/modals/BottomAlignedModal';
import { getRequest, postRequest } from '../../../services/api';
import CustomToast from "../../../components/toast/CustomToast";
import Spinner from 'react-native-spinkit';
import { Player, Recorder } from '@react-native-community/audio-toolkit';
import ImageView from "react-native-image-viewing";
import commonStyles from '../../../styles/styles';
import CircularProgress from '../../../components/progress';
import { Stopwatch, Timer } from 'react-native-stopwatch-timer';
import { styles } from "../../customerorder/CustomerOrder";
import { userAction } from "../../../redux/actions/user";
import NetInfo from "@react-native-community/netinfo";
import { openSettings } from "react-native-permissions";
import DeviceSettings from "react-native-device-settings";
import RNSettings from 'react-native-settings';
import CustomAlert from 'react-native-awesome-alerts';
import { BarChart } from "react-native-chart-kit";


function RiderOrder({ navigation, route, userObj }) {

    // console.log(userObj);
    // console.log(userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken);

    const dispatch = (route && route.params && route.params.dispatch) || null;
    const activeTheme = (route && route.params && route.params.activeTheme) || {};

    const mapRef = React.createRef();
    const riderTimerRef = useRef(null);
    const forceTurnOnLocDialogRef = React.createRef();
    const forcePermissionLocDialogRef = React.createRef();
    const lastActiveStateTimeRef = useRef(new Date().getTime());
    const orderAllocatedScrollRef = useRef(null);
    const scrollToEndNextRef = useRef(false);

    const chatMessagesListRef = useRef(null);
    const recorderRef = useRef(null);
    const recordTimeRef = useRef(null);
    const playerRefsObj = useRef({});

    const initState = {
        mode: "riderHome", // "noInternet" | "riderHome" | "orderAllocated"
        previousMode: null,

        pitstops: [{ isDone: false, details: {} }],
        // pitstops: [{ "latitude": 33.66762528579429, "latitudeDelta": 0.0122, "longitude": 73.08455044403672, "longitudeDelta": 0.006244549763033177, "title": "Islamabad Expressway, I-8, Islamabad, Islamabad Capital Territory, Pakistan", "isDone": false, "details": { "description": "", "buyForMe": false, "estTime": "00:03", "fullData": { "title": "Islamabad Expressway, I-8, Islamabad, Islamabad Capital Territory, Pakistan", "description": "", "latitude": 33.66762528579429, "latitudeDelta": 0.0122, "longitude": 73.08455044403672, "longitudeDelta": 0.006244549763033177, "addressID": 1702, "buyForMe": false, "jobAmountType": 1, "jobAmountTypeDescrp": "Paid", "jobAmount": 0, "estimateTime": "00:03", "jobStartTime": "2021-01-26T13:33:24.4934544", "jobEndTime": "2021-01-26T13:36:55.9114758", "joviJobID": 1842 } }, "addressID": 1702, "jobID": 1842, "timeStart": "2021-01-26T13:33:24.4934544", "timeEnd": "2021-01-26T13:36:55.9114758" }, { "latitude": 33.67245167054564, "latitudeDelta": 0.0122, "longitude": 73.07172344997525, "longitudeDelta": 0.006244549763033177, "title": "253 Street 62, I-8/3 I 8/3 I-8, Islamabad, Islamabad Capital Territory, Pakistan", "isDone": false, "details": { "description": "", "buyForMe": false, "estTime": "00:02", "fullData": { "title": "253 Street 62, I-8/3 I 8/3 I-8, Islamabad, Islamabad Capital Territory, Pakistan", "description": "", "latitude": 33.67245167054564, "latitudeDelta": 0.0122, "longitude": 73.07172344997525, "longitudeDelta": 0.006244549763033177, "addressID": 1703, "buyForMe": false, "jobAmountType": 1, "jobAmountTypeDescrp": "Paid", "jobAmount": 0, "estimateTime": "00:02", "jobStartTime": "2021-01-26T13:36:55.9143294", "jobEndTime": "2021-01-26T13:39:16.3734504", "joviJobID": 1843 } }, "addressID": 1703, "jobID": 1843, "timeStart": "2021-01-26T13:36:55.9143294", "timeEnd": "2021-01-26T13:39:16.3734504" }, { "latitude": 33.66978424447597, "latitudeDelta": 0.0122, "longitude": 73.0917769856751, "longitudeDelta": 0.006244549763033177, "title": "Murree Rd, Islamabad, Islamabad Capital Territory, Pakistan", "isDone": false, "details": { "description": "", "buyForMe": false, "estTime": "00:00", "fullData": { "title": "Murree Rd, Islamabad, Islamabad Capital Territory, Pakistan", "description": "", "latitude": 33.66978424447597, "latitudeDelta": 0.0122, "longitude": 73.0917769856751, "longitudeDelta": 0.006244549763033177, "addressID": 1704, "buyForMe": false, "jobAmountType": 1, "jobAmountTypeDescrp": "Paid", "jobAmount": 0, "estimateTime": "00:00", "jobStartTime": "2021-01-26T13:39:16.375434", "jobEndTime": "2021-01-26T13:39:32.6323565", "joviJobID": 1844 } }, "addressID": 1704, "jobID": 1844, "timeStart": "2021-01-26T13:39:16.375434", "timeEnd": "2021-01-26T13:39:32.6323565" }],

        keyboardShown: false,

        timeAtFirstLoadAfterLoc: null, // null

        loadedProfilePic: false,

        promoCodeApplied: "",

        riderHomeCollapsed: true,
        orderAllocatedCollapsed: true, // true

        mainAmount: userObj.floatingAmount ? userObj.floatingAmount.toString() : "",
        mainAmountEdit: "",
        mainAmountError: "",
        mainAmountModalVisible: false,
        mainAmountModalOrigin: "header",

        // ---------------------------------------------------------------------------------------------

        orderID: null, // null
        customerInfoLoaded: false, // false
        loadOrderNextForOnce: false,


        customerData: {}, // { name: "Mudassir Malik", userID: "7b8dd207-e0e2-4978-9069-28408be2d7e6", rating: 0, image: "live/Customer/2021/1/15/image-1b7a72d9-cdeb-49fd-b7b1-df5748fdf1ab_1040.jpg" },

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


        activePitstopIndex: 0, // 0
        jobAmountBoxValue: null,
        jobAmountCollected: "",
        jobAmountPaid: "",

        isOrderCompleted: false, // false
        receiptVisible: false, // false
        receiptData: null,
        finalAmountBoxValue: ""
    };

    const [state, setState] = useState(initState);

    // EOS: End Of State

    useEffect(() => {
        if (state.timeAtFirstLoadAfterLoc) {
            if (state.mode === "orderAllocated" && !state.customerInfoLoaded) {
                fetchCustomerInfo();
            }

            if (state.mode === "orderAllocated" && state.loadOrderNextForOnce) {
                fetchAndLoadOrder();
            }

            if (state.mode === "orderAllocated" && state.receiptVisible && state.receiptData === null) {
                fetchAndLoadReceipt();
            }

            if ((state.jobAmountCollected || state.jobAmountPaid) && scrollToEndNextRef.current === true) {
                orderAllocatedScrollRef.current.scrollToEnd({ animated: true });
                scrollToEndNextRef.current = false;
            }

            getHubConnectionInstance("Message")?.on("Message", (text, receiverId, senderId, messageId, orderId, filePath, timeStamp) => {
                console.log(`RECEIVED -> 'Message' :`, [text, receiverId, senderId, messageId, orderId, filePath, timeStamp]);

                if (receiverId === userObj?.userID && senderId === state.customerData?.userID && state.mode === "orderAllocated" && orderId === state.orderID) {
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
        }
    }, [state.timeAtFirstLoadAfterLoc, state]);


    useEffect(() => {
        if (state.timeAtFirstLoadAfterLoc) {
            const loadRiderOrder = async () => {
                const orderIDToOpen = (typeof (getParamFromNavigation(navigation, "openOrderID")) === "number") ? getParamFromNavigation(navigation, "openOrderID") : userObj?.orderID;

                if (orderIDToOpen) {
                    // console.log("loadRiderOrder", orderIDToOpen, userObj);
                    setState({
                        ...initState,
                        timeAtFirstLoadAfterLoc: state.timeAtFirstLoadAfterLoc,
                        mode: "orderAllocated",
                        loadedProfilePic: state.loadedProfilePic,
                        orderID: orderIDToOpen,
                    });
                }
            };
            loadRiderOrder();

            Keyboard.addListener("keyboardDidShow", () => { setState((prevState) => (prevState.mode === "orderAllocated" && prevState.customerInfoLoaded && prevState.keyboardShown === false) ? ({ ...prevState, keyboardShown: true }) : prevState) });
            Keyboard.addListener("keyboardDidHide", () => { setState((prevState) => (prevState.mode === "orderAllocated" && prevState.customerInfoLoaded && prevState.keyboardShown === true) ? ({ ...prevState, keyboardShown: false }) : prevState) });
        }
    }, [state.timeAtFirstLoadAfterLoc, route]);


    useFocusEffect(() => {
        const handleFocusEffect = async () => {
            await AsyncStorage.setItem("riderOrder_focused", "true");
        };
        handleFocusEffect();

        const handleFocusEffectCleanup = async () => {
            await AsyncStorage.setItem("riderOrder_focused", "false");
        };
        return handleFocusEffectCleanup;
    }, []);


    useEffect(() => {
        if (state.loadedProfilePic) {
            handleForcingRiderForLocation("useEffect");
            AppState.addEventListener("change", riderOrderAppStateListener);
        }
    }, [state.loadedProfilePic]);


    useEffect(() => {
        setIsForcePermissionLocDialogVisible(false);
        setIsForceTurnOnLocDialogVisible(false);

        return () => {
            AppState.removeEventListener("change", riderOrderAppStateListener);
        };
    }, []);

    console.log("-");
    console.log('RIDER_ORDER STATE :', state);



    const constantLatDelta = 0.0122;
    const constantLongDelta = (Dimensions.get("window").width / Dimensions.get("window").height) * 0.0122;
    const constantMinMainAmount = 200;
    const constantMaxMainAmount = 10000;
    const dateObj = new Date();
    const activePitstop = state.pitstops[state.activePitstopIndex];
    const dottedLineStr = Array.from(Array(300), (item, j) => "-").join("");

    // BackHandler.addEventListener('hardwareBackPress', async () => {
    useBackHandler(async () => {
        const isRiderOrderFocused = await AsyncStorage.getItem("riderOrder_focused");
        if (isRiderOrderFocused !== "true") return true;

        return true;
    });

    const notifyOfFirstLoadAfterLocation = () => {
        setState((prevState) => ({
            ...prevState,
            timeAtFirstLoadAfterLoc: new Date().getTime()
        }));
    };

    NetInfo.addEventListener(internetStateObj => {
        if (!internetStateObj.isConnected && state.previousMode === null) {
            setState((prevState) => (prevState.previousMode === null) ? ({ ...prevState, mode: "noInternet", previousMode: prevState.mode }) : prevState);
        }
        else if (internetStateObj.isConnected && state.previousMode !== null) {
            setState((prevState) => (prevState.previousMode !== null) ? ({ ...prevState, mode: state.previousMode, previousMode: null }) : prevState);
        }
    });

    DeviceEventEmitter.addListener(RNSettings.GPS_PROVIDER_EVENT, (event) => {
        if (event[RNSettings.LOCATION_SETTING] === RNSettings.DISABLED) {
            if (!getIsForceTurnOnLocDialogVisible() && forceTurnOnLocDialogRef.current) {
                setIsForceTurnOnLocDialogVisible(true);
                forceTurnOnLocDialogRef.current._springShow();
            }
        }
        else if (event[RNSettings.LOCATION_SETTING] === RNSettings.ENABLED) {
            if (getIsForceTurnOnLocDialogVisible() && forceTurnOnLocDialogRef.current) {
                setIsForceTurnOnLocDialogVisible(false);
                forceTurnOnLocDialogRef.current._springHide();
            }
        }
    });

    const riderOrderAppStateListener = (appStateNow) => {
        if (appStateNow === "active" && forcePermissionLocDialogRef.current && forceTurnOnLocDialogRef.current) {
            let currentTime = new Date().getTime();
            if (currentTime - lastActiveStateTimeRef.current > 400) {
                handleForcingRiderForLocation("appActive");
            }
            lastActiveStateTimeRef.current = currentTime;
        }
    };

    const handleForcingRiderForLocation = (from) => {
        checkLocation(
            () => {
                // console.log("Location Checks Passed - handleForcingRiderForLocation");
                setIsForcePermissionLocDialogVisible(false);
                forcePermissionLocDialogRef.current && forcePermissionLocDialogRef.current._springHide();

                setIsForceTurnOnLocDialogVisible(false);
                forcePermissionLocDialogRef.current && forceTurnOnLocDialogRef.current._springHide();
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    if (!getIsForcePermissionLocDialogVisible() && forcePermissionLocDialogRef.current) {
                        // console.log("Error 1 - handleForcingRiderForLocation:", error.message);
                        setIsForcePermissionLocDialogVisible(true);
                        forcePermissionLocDialogRef.current._springShow();
                    }
                }
                else {
                    // console.log("Error 2 - handleForcingRiderForLocation:", error.message);
                    if (forcePermissionLocDialogRef.current) {
                        setIsForcePermissionLocDialogVisible(false);
                        forcePermissionLocDialogRef.current._springHide();
                    }


                    if (error.code === error.POSITION_UNAVAILABLE) {
                        if (!getIsForceTurnOnLocDialogVisible() && forceTurnOnLocDialogRef.current) {
                            // console.log("Error 3 - handleForcingRiderForLocation:", error.message);
                            setIsForceTurnOnLocDialogVisible(true);
                            forceTurnOnLocDialogRef.current._springShow();
                        }
                    }
                    else {
                        if (forceTurnOnLocDialogRef.current) {
                            // console.log("Error 4 - handleForcingRiderForLocation:", error.message);
                            setIsForceTurnOnLocDialogVisible(false);
                            forceTurnOnLocDialogRef.current._springHide();
                        }
                    }
                }
            }
        );
    };

    const leftIconHandler = () => {
        navigation.toggleDrawer();
    };

    const setMode = (mode) => {
        setState((prevState) => ({
            ...prevState,
            mode: mode,
            previousMode: prevState.mode,
        }));
    };

    const checkLocation = (cbSuccess, cbError) => {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            cbSuccess && cbSuccess();
        }, (error) => {
            cbError && cbError(error);
        }, {
            timeout: 3000,
            // enableHighAccuracy: true,
            // maximumAge: 1000,
        });
    };

    const animateToCurrentLocation = (cb) => {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            mapRef.current && mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: constantLatDelta,
                longitudeDelta: constantLongDelta
            });
            cb && cb();
        }, (error) => {
            cb && cb();
            // Alert.alert("Location Unavailable!", "Location is either turned off or not responding!");
        }, {
            timeout: 3000,
            // enableHighAccuracy: true,
            // maximumAge: 1000,
        });
    };

    const fetchCustomerInfo = () => {
        getRequest(
            'api/Order/GetUserByOrder/' + state.orderID,
            {},
            dispatch,
            (response) => {
                setState((prevState) => ({
                    ...prevState,
                    customerInfoLoaded: true,
                    loadOrderNextForOnce: true,
                    customerData: response.data.userDetail ? { ...response.data.userDetail } : {},
                    chatLoadedImages: []
                }));
            },
            (error) => {
                console.log(((error?.response) ? error.response : {}), error);
                CustomToast.error('An Error Occcurred!');
            },
            '',
            false
        );
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
                    isOrderCompleted: (activePitstopIndexToSet === fetchedPitstopsList.length)
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
                    // console.log(response.data.chatList);
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
        sharedImagePickerHandler(() => setState(prevState => ({ ...prevState, isLoading: false })), picData => sendMessageToCustomer(picData, null));
    };

    const sendMessageToCustomer = (picData = null, voiceData = null) => {
        let formData = new FormData();
        formData.append("OrderID", state.orderID);
        formData.append("ReceiverID", state.customerData.userID);

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

    const onOpenMainAmountModal = (origin) => {
        setState((prevState) => ({ ...prevState, mainAmountEdit: (prevState.mainAmount ? prevState.mainAmount.toString() : ""), mainAmountModalVisible: true, mainAmountModalOrigin: origin }))
    };

    const onCloseMainAmountModal = () => {
        setState((prevState) => ({ ...prevState, mainAmountEdit: "", mainAmountError: "", mainAmountModalVisible: false, mainAmountModalOrigin: "header" }))
    };

    const onChangeMainAmount = (value) => {
        setState((prevState) => ({
            ...prevState,
            mainAmountEdit: (parseInt(value) && !value.match(/(\s|\.|\,|\-)/gi)) ? parseInt(value).toString() : value,
            mainAmountError: (value.match(/\d/gi)?.length === value.length) ?
                (value <= constantMaxMainAmount) ?
                    (value >= constantMinMainAmount) ?
                        ""
                        :
                        `Minimum allowed value is ${constantMinMainAmount}`
                    :
                    `Maximum limit is ${(constantMaxMainAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                :
                "Not a valid number"
        }));
    };

    const onSetMainAmount = () => {
        setFloatingAmountOnServer(state.mainAmountEdit, postRequest, dispatch, () => {
            if (state.mainAmountModalOrigin === "header") {
                dispatch(userAction({ ...userObj, floatingAmount: state.mainAmountEdit }));
                setState((prevState) => ({ ...prevState, mainAmount: state.mainAmountEdit, mainAmountEdit: "", mainAmountError: "", mainAmountModalVisible: false, mainAmountModalOrigin: "header" }));
            }
            else if (state.mainAmountModalOrigin === "golive") {
                setRiderStatusAsOnline(() => {
                    dispatch(userAction({ ...userObj, isActive: true, floatingAmount: state.mainAmountEdit }));
                    setState((prevState) => ({ ...prevState, mainAmount: state.mainAmountEdit, mainAmountEdit: "", mainAmountError: "", mainAmountModalVisible: false, mainAmountModalOrigin: "header" }));
                });
            }
        });
    };

    const onGoLiveIconPressed = () => {
        if (userObj?.userID) {
            animateToCurrentLocation();
            onOpenMainAmountModal("golive");
        }
    };

    const setRiderStatusAsOnline = (cb) => {
        postRequest(
            'api/User/Rider/ChangeOnlineStatus',
            {
                "riderID": userObj?.userID,
                "activate": true
            },
            null,
            dispatch,
            (response) => {
                cb && cb();
            },
            (error) => {
                console.log(((error?.response) ? error.response : {}), error);
                Alert.alert("Error occurred while going Online!");
            },
            true
        );
    };

    const onJobAmountSubmitted = (type) => {
        if (state.jobAmountBoxValue && (parseInt(state.jobAmountBoxValue) && !state.jobAmountBoxValue.match(/(\s|\.|\,|\-)/gi))) {
            scrollToEndNextRef.current = true;
            setState((prevState) => ({
                ...prevState,
                jobAmountBoxValue: null,
                jobAmountCollected: (type === "2") ? parseInt(state.jobAmountBoxValue) : prevState.jobAmountCollected,
                jobAmountPaid: (type === "1") ? parseInt(state.jobAmountBoxValue) : prevState.jobAmountPaid
            }));
        }
        else {
            Alert.alert("Invalid Amount", `The amount entered as ${(type === "1" ? "Paid" : "Collected")} was not valid!`);
        }
    };

    const removeOrderFromRider = () => {
        animateToCurrentLocation(() => {
            dispatch(userAction({ ...userObj, orderID: 0 }));
            setState({
                ...initState,
                timeAtFirstLoadAfterLoc: state.timeAtFirstLoadAfterLoc,
                mode: "riderHome",
                loadedProfilePic: state.loadedProfilePic,
                orderID: null
            });
        });
    };

    const onOrderCancelledByRider = () => {
        const proceed = () => {
            postRequest(
                'api/Order/OrderCancellation',
                {
                    "cancelReason": "Tyre is punctured",
                    "orderTransRsnID": 0,
                    "orderID": state.orderID
                },
                null,
                dispatch,
                (response) => {
                    removeOrderFromRider();
                },
                (error) => {
                    console.log(((error?.response) ? error.response : {}), error);
                    Alert.alert("Error occurred while Cancelling order!");
                },
                true
            );
        };

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
                        proceed();
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const onCompletePitstopAndGoToNextPitstop = (isFinalPitstop) => {
        const proceed = () => {
            postRequest(
                '/api/Order/JoviJob',
                {
                    "orderID": state.orderID,
                    "joviJobID": activePitstop.jobID,
                    "collectedAmount": state.jobAmountCollected,
                    "paidAmount": state.jobAmountPaid,
                    "riderID": userObj?.userID
                },
                null,
                dispatch,
                (response) => {
                    setState((prevState) => ({
                        ...prevState,
                        activePitstopIndex: prevState.activePitstopIndex + 1,
                        jobAmountBoxValue: null,
                        jobAmountCollected: "",
                        jobAmountPaid: "",
                        isOrderCompleted: isFinalPitstop
                    }));
                },
                (error) => {
                    console.log(((error?.response) ? error.response : {}), error);
                    Alert.alert("Error occurred while Completing the job!");
                },
                true
            );
        };

        Alert.alert(
            'Are you sure?',
            `This will mark the ${!isFinalPitstop ? "current" : "final"} pitstop as Completed by sending following information about the ${!isFinalPitstop ? "current" : "final"} pitstop:\n\n` +
            `Amount Collected:\nRs. ${state.jobAmountCollected ? state.jobAmountCollected.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0"}\n\n` +
            `Amount Paid:\nRs. ${state.jobAmountPaid ? state.jobAmountPaid.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0"}`,
            [
                {
                    text: 'No',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        proceed();
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const fetchAndLoadReceipt = () => {
        getRequest(
            'api/Order/Rider/OrderReceipt/' + state.orderID,
            {},
            dispatch,
            (response) => {
                // console.log("Receipt Data:", response?.data?.recieptViewModel);
                setState((prevState) => ({
                    ...prevState,
                    receiptData: response?.data?.recieptViewModel
                }));
            },
            (error) => {
                console.log(((error?.response) ? error.response : {}), error);
                CustomToast.error('An Error Occcurred!');
            },
            ''
        );
    };

    const onCloseOrderAndGoToRiderHome = () => {
        const proceed = () => {
            postRequest(
                'api/Order/BillAdjustment',
                {
                    "orderID": state.orderID,
                    "enteredAmount": state.finalAmountBoxValue ? parseInt(state.finalAmountBoxValue) : 0,
                },
                null,
                dispatch,
                (response) => {
                    removeOrderFromRider();
                },
                (error) => {
                    console.log(((error?.response) ? error.response : {}), error);
                    Alert.alert("Error occurred while Closing the order!");
                },
                true
            );
        };

        if ((state.finalAmountBoxValue === "") || (parseInt(state.finalAmountBoxValue) && !state.finalAmountBoxValue.match(/(\s|\.|\,|\-)/gi))) {
            Alert.alert(
                'Are you sure?',
                `This will mark this order as Closed by sending following information about the order:\n\n` +
                `Amount Received / Refunded:\nRs. ${state.finalAmountBoxValue ? parseInt(state.finalAmountBoxValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0"}`,
                [
                    {
                        text: 'No',
                        onPress: () => { },
                        style: 'cancel'
                    },
                    {
                        text: 'Yes',
                        onPress: () => {
                            proceed();
                        }
                    }
                ],
                { cancelable: true }
            );
        }
        else {
            Alert.alert("Invalid Amount", `The amount entered as Received / Refunded was not valid!`);
        }
    };


    //EOF: End Of Functions


    return (
        <View style={styles.container}>


            <MapRider
                mapRef={mapRef}
                pitstops={state.pitstops}
                mode={state.mode}
                notifyOfFirstLoadAfterLocation={notifyOfFirstLoadAfterLocation}
                userObj={userObj}
                orderID={state.orderID}
                activePitstopIndex={state.activePitstopIndex}
                handlePressOnMap={() => {
                    if (state.mode === "noInternet") {
                        DeviceSettings.wifi();
                    }
                    else if (state.mode === "riderHome") {
                        if (!state.riderHomeCollapsed) {
                            Keyboard.dismiss();
                            setState((prevState) => ({
                                ...prevState,
                                riderHomeCollapsed: true
                            }));
                        }
                    }
                    else if (state.mode === "orderAllocated") {
                        if (!state.orderAllocatedCollapsed && !state.chatVisible) {
                            Keyboard.dismiss();
                            setState((prevState) => ({
                                ...prevState,
                                orderAllocatedCollapsed: true
                            }));
                        }
                        else if (state.chatVisible) {
                            Keyboard.dismiss();
                            setState((prevState) => ({
                                ...prevState,
                                chatVisible: false
                            }));
                        }
                    }
                }}
                orderAllocatedCollapsed={state.orderAllocatedCollapsed}
                chatVisible={state.chatVisible}
                constantLatDelta={constantLatDelta}
                constantLongDelta={constantLongDelta}
            />


            {/* M# 0 */}
            {state.mode === "noInternet" &&
                <>
                    <View style={{ position: "absolute", left: "16.5%", top: 110 - 20, flexDirection: "row", justifyContent: "center" }}>
                        <TouchableOpacity disabled={false} onPress={() => { DeviceSettings.wifi() }} style={{ ...styles.caption, marginVertical: 0, marginBottom: 10 }}>
                            <View style={{ backgroundColor: "#596066", width: 245, height: 40, borderRadius: 15, elevation: 15 }}>
                                <Text style={{ color: "#fff", fontSize: 15, alignSelf: "center", top: 9 }}>{`Please connect your internet!`}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </>
            }


            {/* M# 1 */}
            {state.mode === "riderHome" &&
                <>
                    <TouchableOpacity onPress={leftIconHandler} style={{ position: "absolute", left: "4%", top: 41, zIndex: 6 }}>
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={styles.svgTag} xml={menuIcon} height={21} width={21} />
                        </View>
                    </TouchableOpacity>

                    <View style={{ position: "absolute", left: "31%", top: 110 - 20, flexDirection: "row", justifyContent: "center" }}>
                        <TouchableOpacity disabled={true} onPress={() => { }} style={{ ...styles.caption, marginVertical: 0, marginBottom: 10 }}>
                            <View style={{ backgroundColor: (userObj.isActive ? "#6f8960" : "#596066"), width: 130, height: 40, borderRadius: 15, elevation: 15 }}>
                                <Text style={{ color: "#fff", fontSize: 15, alignSelf: "center", top: 9 }}>{`You are ${userObj.isActive ? "Online" : "Offline"}`}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => animateToCurrentLocation()} style={{ bottom: state.riderHomeCollapsed ? (55 + 3) : (55 + 3 + 185), position: "absolute", left: "3%", zIndex: 6 }} >
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={{ ...styles.svgTag, marginTop: 1.5 }} xml={locateMeIcon} height={18} width={18} />
                        </View>
                    </TouchableOpacity>

                    {!userObj.isActive &&
                        <TouchableOpacity onPress={() => onGoLiveIconPressed()} style={{ bottom: state.riderHomeCollapsed ? (55 + 34) : (55 + 34 + 185), position: "absolute", left: "45.3%", zIndex: 6 }} >
                            <View style={{ ...styles.headerLeftIconView, elevation: 0, backgroundColor: "transparent" }} >
                                <SvgXml style={{ ...styles.svgTag, marginTop: 1.5 }} xml={goOnlineIcon()} height={88} width={88} />
                            </View>
                        </TouchableOpacity>
                    }

                    <KeyboardAvoidingView style={{ ...styles.wrapper }} onTouchEnd={(state.riderHomeCollapsed && !state.mainAmountModalVisible) ? () => setState((prevState) => ({ ...prevState, riderHomeCollapsed: false })) : null}>

                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ ...styles.caption, fontSize: 17, left: 0, marginVertical: 10, top: -13, flexGrow: 4 }}>History of your tasks</Text>
                            <TouchableOpacity style={{ top: state.riderHomeCollapsed ? -8 : -5, width: 35 }} onPress={() => {
                                Keyboard.dismiss();
                                setState((prevState) => ({
                                    ...prevState,
                                    riderHomeCollapsed: !prevState.riderHomeCollapsed
                                }));
                            }}>
                                <SvgXml xml={state.riderHomeCollapsed ? expandIcon() : collapseIcon()} width={20} height={30} style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', top: -13, marginBottom: state.riderHomeCollapsed ? -10 : 5 }}>
                            <View style={{ height: state.riderHomeCollapsed ? 0 : 170 }}>
                                <Text>History will be shown here...</Text>
                            </View>
                        </View>

                        {state.mainAmountModalVisible &&
                            <BottomAlignedModal
                                visible={true}
                                transparent={true}
                                onRequestCloseHandler={() => onCloseMainAmountModal()}
                                modalFlex={2.5}
                                modalHeight={249 - 45}
                                modelViewPadding={35}
                                androidKeyboardExtraOffset={35}
                                ModalContent={
                                    <>
                                        <View style={{ width: "100%" }}>
                                            <TouchableOpacity onPress={() => onCloseMainAmountModal()} style={{ width: 25, height: 25, left: 30, top: -20, alignSelf: "flex-end" }}>
                                                <SvgXml xml={crossIcon} height={14} width={14} />
                                            </TouchableOpacity>

                                            <Text style={{ ...styles.caption, fontSize: 17, left: -15, marginVertical: 0, marginBottom: 5, top: -48 }}>Please enter an amount</Text>

                                            <View style={{ flexDirection: "row", height: 35, top: -23, width: "100%", alignItems: "center", alignSelf: "center", justifyContent: "center" }}>
                                                <TextInput
                                                    autoFocus
                                                    multiline={false}
                                                    returnKeyType="done"
                                                    keyboardType="number-pad"
                                                    maxLength={5}
                                                    onSubmitEditing={() => Keyboard.dismiss()}
                                                    placeholder="Enter amount"
                                                    value={state.mainAmountEdit}
                                                    style={{ borderRadius: 25, height: 45, paddingLeft: 15, paddingRight: 15, width: Dimensions.get("window").width - 50, borderColor: state.mainAmountError ? activeTheme.validationRed : "#E5E5E5", borderWidth: 1 }}
                                                    onChangeText={(value) => onChangeMainAmount(value)}
                                                />

                                                <TouchableOpacity disabled={(state.mainAmountError || !state.mainAmountEdit)} onPress={() => onSetMainAmount()} style={{ position: "absolute", width: 36, height: 36, right: -5, top: -0.8, alignSelf: "flex-end" }}>
                                                    <SvgXml xml={amountFieldIcon()} height={36} width={36} style={{ opacity: (state.mainAmountError || !state.mainAmountEdit) ? 0.6 : 1 }} />
                                                </TouchableOpacity>
                                            </View>

                                            <Text style={{ ...styles.caption, fontSize: 14, color: activeTheme.validationRed, left: 0, alignSelf: "center", marginTop: 2, marginBottom: 5, top: -18 }}>{state.mainAmountError}</Text>

                                        </View>

                                        <TouchableOpacity
                                            disabled={true}
                                            onPress={() => { }}
                                            style={{ ...styles.appButtonContainer, width: Dimensions.get("window").width, position: "absolute", alignSelf: "center", bottom: 0, opacity: 0.5 }}
                                        >
                                            <Text style={styles.appButtonText}>Transfer</Text>
                                        </TouchableOpacity>
                                    </>
                                }
                            />
                        }

                    </KeyboardAvoidingView>
                </>
            }


            {/* M# 2 */}
            {state.mode === "orderAllocated" &&
                <>
                    <TouchableOpacity onPress={leftIconHandler} style={{ position: "absolute", left: "4%", top: 41, zIndex: 6 }}>
                        <View style={styles.headerLeftIconView} >
                            <SvgXml style={styles.svgTag} xml={menuIcon} height={21} width={21} />
                        </View>
                    </TouchableOpacity>

                    <View style={{ position: "absolute", left: "31%", top: 110 - 20, flexDirection: "row", justifyContent: "center" }}>
                        <TouchableOpacity disabled={true} onPress={() => { }} style={{ ...styles.caption, marginVertical: 0, marginBottom: 10 }}>
                            <View style={{ backgroundColor: (userObj.isActive ? "#6f8960" : "#596066"), width: 130, height: 40, borderRadius: 15, elevation: 15 }}>
                                <Text style={{ color: "#fff", fontSize: 15, alignSelf: "center", top: 9 }}>{`You are ${userObj.isActive ? "Online" : "Offline"}`}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView style={{ ...styles.wrapper }} behavior={null} onTouchStart={null}>

                        {state.customerInfoLoaded &&
                            <>
                                {!state.chatVisible &&
                                    <TouchableOpacity
                                        style={{ position: "absolute", flexDirection: "row", top: 3, height: 34, width: 70, alignSelf: "center", justifyContent: "center", zIndex: 1 }}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            setState((prevState) => ({ ...prevState, orderAllocatedCollapsed: !prevState.orderAllocatedCollapsed }));
                                        }}
                                    >
                                        <View style={{ height: 9, width: 45, backgroundColor: activeTheme.default, borderRadius: 10 }}></View>
                                    </TouchableOpacity>
                                }

                                <View style={{ width: "100%", flexDirection: "row", alignItems: "center", alignSelf: "center", justifyContent: "flex-start", top: (!state.chatVisible ? 3 : 0), borderTopLeftRadius: 10, borderTopRightRadius: 15, paddingBottom: (state.chatVisible ? 16 : 3) }}>
                                    <Image resizeMode="cover" source={(state.customerData.image ? { uri: renderPicture(state.customerData.image, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken)) } : { uri: EMPTY_PROFILE_URL })} style={{ flexGrow: 0, width: 51, height: 51, borderRadius: 125 }} />
                                    <View style={{ flexGrow: 5, left: 5 }}>
                                        <Text style={{ ...styles.caption, fontSize: 15, color: '#7359be', left: 0, marginVertical: 0, fontWeight: "bold" }}>{state.customerData.name}</Text>
                                        <View>
                                            <View style={{ flexDirection: "row", height: 20, width: 50, alignItems: "center", backgroundColor: "#b1b1b1", borderRadius: 10 }}>
                                                <Text style={{ ...styles.caption, fontSize: 13, color: '#fff', left: 8, marginVertical: 0 }}>{state.customerData.rating}</Text>
                                                <SvgXml xml={ratingStar()} width={12} height={12} style={{ marginLeft: 12 }} />
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ flexGrow: 0.5, right: 8 }}>
                                        <Text style={{ ...styles.caption, alignSelf: "flex-end", fontSize: 15, color: '#7359be', left: 0, marginVertical: 0, fontWeight: "bold" }}>{state.customerData.registerationNo}</Text>
                                        <Text style={{ ...styles.caption, alignSelf: "flex-end", fontSize: 13, color: '#000', left: 0, marginVertical: 0 }}>{state.customerData.model}</Text>
                                    </View>
                                    {state.chatVisible &&
                                        <TouchableOpacity
                                            style={{ width: 40, height: 28 }}
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
                                            <SvgXml xml={crossIcon /* collapseIcon() */} width={20} height={16 /* 30 */} style={{ marginLeft: 8 }} />
                                        </TouchableOpacity>
                                    }
                                </View>

                                {state.chatVisible &&
                                    <ScrollView
                                        ref={chatMessagesListRef}
                                        style={{ width: "100%", paddingLeft: 10, paddingRight: 10, height: (Dimensions.get("window").height - (state.keyboardShown ? 590 + (0) - 55 : 340 - 55)) /* (state.keyboardShown ? 165 - 65 : 365) */ /* (Dimensions.get("window").height * (state.keyboardShown ? 0.3 : 0.6)) */ }}
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
                                                        (state.customerData.image ?
                                                            {
                                                                uri: renderPicture(state.customerData.image, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
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
                                        showSoftInputOnFocus={state.chatVisible /* true */}
                                        editable={true}
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
                                                <TouchableOpacity onPress={() => sendMessageToCustomer()} style={{ flexGrow: 0.2 }}>
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
                                                                    sendMessageToCustomer(null, {
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


                                {!state.chatVisible &&
                                    <View style={{ width: "100%", maxHeight: (Dimensions.get("window").height - (state.keyboardShown ? 590 + (0) - 115 : 340 - 115 + (state.orderAllocatedCollapsed ? 268 : 0))) }}>
                                        {state.customerInfoLoaded && state.pitstops[0].latitude &&
                                            <>
                                                <View style={{
                                                    borderWidth: 1.001, borderColor: "#E5E5E5", width: "100%",
                                                    borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0
                                                }} />

                                                <View style={{ marginTop: -2 }}>
                                                    <BarChart
                                                        activeBarIndex={state.activePitstopIndex}
                                                        activeBarColor={activeTheme.default}
                                                        inactiveBarColor={state.isOrderCompleted ? activeTheme.default : "#ccc"}
                                                        ref={null}
                                                        onDataPointClick={() => { }}
                                                        style={{
                                                            paddingRight: 0,
                                                            paddingTop: 5,
                                                            marginTop: 0
                                                        }}
                                                        data={{
                                                            labels: state.pitstops.map((item) => ""),
                                                            datasets: [
                                                                {
                                                                    data: state.pitstops.map((item) => 10)
                                                                }
                                                            ]
                                                        }}
                                                        width={40 * state.pitstops.length}
                                                        height={58}
                                                        showBarTops={false}
                                                        withInnerLines={false}
                                                        showValuesOnTopOfBars={false}
                                                        withVerticalLabels={true}
                                                        withHorizontalLabels={true}
                                                        fromZero={true}
                                                        chartConfig={{
                                                            barRadius: 5,
                                                            barPercentage: 0.8,
                                                            backgroundColor: "#f00",
                                                            backgroundGradientFrom: "#fff",
                                                            backgroundGradientTo: "#fff",
                                                            color: (opacity = 1) => activeTheme.default,
                                                            labelColor: (opacity = 1) => activeTheme.default,
                                                            style: { borderRadius: 16 },
                                                            propsForDots: { r: "6", strokeWidth: "10" }
                                                        }}
                                                        verticalLabelRotation={0}
                                                    />
                                                </View>

                                                <View style={{
                                                    borderWidth: 1.001, borderColor: "#E5E5E5", width: "100%",
                                                    marginTop: -2, marginBottom: 8,
                                                    borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0
                                                }} />
                                            </>
                                        }

                                        <ScrollView ref={orderAllocatedScrollRef} style={{ width: "100%" }} keyboardShouldPersistTaps="always">
                                            {(!state.orderAllocatedCollapsed) ?
                                                (!state.isOrderCompleted) ?
                                                    <>
                                                        <View style={{ flexDirection: "row" }}>
                                                            <SvgXml xml={pitstopCircle} key={"ico-" + state.activePitstopIndex} style={{ marginTop: 1.5 }} />
                                                            <Text style={{ ...styles.caption, color: '#000', marginVertical: -2.5 }}>{"PitStop " + (state.activePitstopIndex + 1)}</Text>
                                                        </View>

                                                        <Text style={{ ...styles.caption, color: '#9f9f9f', fontSize: 14, marginTop: 2, marginLeft: 15, width: Dimensions.get("window").width * 0.78, marginVertical: 7 }}>{activePitstop.title}</Text>

                                                        <View style={{
                                                            borderWidth: 1.001, borderColor: "#E5E5E5", width: "100%",
                                                            borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0
                                                        }} />

                                                        <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", paddingVertical: 3 }}>
                                                            <Text style={{ ...styles.caption, color: '#000', fontSize: 14, fontWeight: "bold", marginTop: 4, left: 0, marginVertical: 0 }}>Buy For Me:</Text>
                                                            <Switch
                                                                disabled={true}
                                                                trackColor={{ false: "#767577", true: "#46e54b" }}
                                                                thumbColor={"#fff"}
                                                                style={{ left: (activePitstop.details && activePitstop.details.buyForMe ? -1.5 : 6) }}
                                                                ios_backgroundColor="#767577"
                                                                value={activePitstop.details && activePitstop.details.buyForMe}
                                                            />
                                                        </View>

                                                        <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", paddingVertical: 7, borderTopColor: "#E5E5E5", borderBottomColor: "#fff", borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1 }}>
                                                            <Text style={{ ...styles.caption, color: '#000', fontSize: 14, fontWeight: "bold", marginTop: 0, left: 0, marginVertical: 0 }}>Estimated Amount:</Text>
                                                            <Text style={{ ...styles.caption, color: '#000', fontSize: 14, left: -7, marginVertical: 0 }}>
                                                                Rs. {(activePitstop.details.estCost) ? activePitstop.details.estCost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0"}
                                                            </Text>
                                                        </View>

                                                        <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", paddingVertical: 7, borderTopColor: "#E5E5E5", borderBottomColor: "#fff", borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1 }}>
                                                            <Text style={{ ...styles.caption, color: '#000', fontSize: 14, fontWeight: "bold", marginTop: 0, left: 0, marginVertical: 0 }}>Estimated Time:</Text>
                                                            <Text style={{ ...styles.caption, color: '#000', fontSize: 14, left: -7, marginVertical: 0 }}>
                                                                {activePitstop.details && activePitstop.details.estTime}
                                                            </Text>
                                                        </View>

                                                        <View style={{ flexDirection: "column", width: "100%", justifyContent: "space-between", paddingBottom: 3, borderTopColor: "#E5E5E5", borderBottomColor: "#E5E5E5", borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1 }}>
                                                            <Text style={{ ...styles.caption, color: '#000', fontSize: 14, fontWeight: "bold", marginTop: 0, paddingTop: 6, left: 0, marginVertical: 0 }}>Description:</Text>
                                                            <Text style={{ ...styles.caption, color: '#000', fontSize: 14, left: 0, marginTop: 1, marginBottom: 6 }}>
                                                                {/* {"asdj asljdh \naisdoi aishdia sas da sda sd asd \nasd as da sda sd asd asd as da\nsd a s d  as d asd as da sd as da sd asd a sd asd\n\n\n\n∂di ais d a sd as doa sdo aosdasd asd a sdlasl d alsdla sdasd\ng\ng"} */}
                                                                {/* {"test test"} */}
                                                                {activePitstop.details && activePitstop.details.description}
                                                            </Text>
                                                        </View>

                                                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 8 }}>
                                                            <TextInput
                                                                multiline={false}
                                                                returnKeyType="done"
                                                                keyboardType="number-pad"
                                                                maxLength={7}
                                                                onSubmitEditing={() => Keyboard.dismiss()}
                                                                placeholder="Enter amount"
                                                                value={state.jobAmountBoxValue}
                                                                style={{ flexGrow: 50, width: 50, color: "#000", borderRadius: 20, height: state.chatVisible ? null : 40, maxHeight: 73, marginLeft: 0, marginRight: 10, paddingLeft: 15, paddingRight: 15, borderColor: "#E5E5E5", borderWidth: 1, paddingTop: 8, paddingBottom: 9 }}
                                                                onChangeText={(value) => setState((prevState) => ({ ...prevState, jobAmountBoxValue: value }))}
                                                            />

                                                            <View style={{ flexDirection: "row", opacity: (state.jobAmountBoxValue) ? 1 : 0.5 }}>
                                                                <TouchableOpacity
                                                                    disabled={(state.jobAmountBoxValue) ? false : true}
                                                                    onPress={() => onJobAmountSubmitted("2")}
                                                                    style={{ ...styles.appButtonContainer, elevation: 0, paddingVertical: 10, paddingHorizontal: 10, width: 75, borderTopLeftRadius: 18, borderBottomLeftRadius: 18, position: "relative", alignSelf: "center", bottom: 0, backgroundColor: activeTheme.default }}
                                                                >
                                                                    <Text style={{ ...styles.appButtonText, fontSize: 11 }}>Collected</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    disabled={(state.jobAmountBoxValue) ? false : true}
                                                                    onPress={() => onJobAmountSubmitted("1")}
                                                                    style={{ ...styles.appButtonContainer, elevation: 0, paddingVertical: 10, paddingHorizontal: 10, marginLeft: 0.4, width: 58, borderTopRightRadius: 18, borderBottomRightRadius: 18, position: "relative", alignSelf: "center", bottom: 0, backgroundColor: activeTheme.default }}
                                                                >
                                                                    <Text style={{ ...styles.appButtonText, fontSize: 11, left: -2 }}>Paid</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>

                                                        <View style={{ flexDirection: "row", paddingVertical: 6, width: "100%", justifyContent: (state.jobAmountCollected && state.jobAmountPaid ? "space-between" : "center"), display: (state.jobAmountCollected || state.jobAmountPaid ? "flex" : "none") }}>
                                                            <Text style={{ ...styles.caption, display: (state.jobAmountCollected ? "flex" : "none"), color: '#000', fontWeight: "bold", alignSelf: "center", fontSize: 14.5, left: 0, marginLeft: 2, marginTop: 0, marginBottom: 6 }}>
                                                                {`Rs. ${state.jobAmountCollected.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Collected`}
                                                            </Text>
                                                            <Text style={{ ...styles.caption, display: (state.jobAmountCollected && state.jobAmountPaid ? "flex" : "none"), color: '#E5E5E5', fontWeight: "bold", alignSelf: "center", fontSize: 14.5, left: 0, marginTop: 0, marginBottom: 6 }}>
                                                                {"|"}
                                                            </Text>
                                                            <Text style={{ ...styles.caption, display: (state.jobAmountPaid ? "flex" : "none"), color: '#000', fontWeight: "bold", alignSelf: "center", fontSize: 14.5, left: 0, marginRight: 5, marginTop: 0, marginBottom: 6 }}>
                                                                {`Rs. ${state.jobAmountPaid.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Paid`}
                                                            </Text>
                                                        </View>

                                                        <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", paddingTop: 7, paddingBottom: 7, marginBottom: 3, borderTopColor: "#E5E5E5", borderBottomColor: "#E5E5E5", borderLeftColor: "#fff", borderRightColor: "#fff", borderWidth: 1 }}>
                                                            <Text style={{ ...styles.caption, color: '#000', fontSize: 14, fontWeight: "normal", marginTop: 3, left: 0, marginVertical: 0 }}>{"Cancel Order"}</Text>
                                                            <TouchableOpacity
                                                                onPress={() => onOrderCancelledByRider()}
                                                                style={{ ...styles.appButtonContainer, elevation: 0, paddingVertical: 3, paddingHorizontal: 5, left: 0.2, width: 58, borderRadius: 18, position: "relative", alignSelf: "center", bottom: 0, backgroundColor: "#fc3f93" }}
                                                            >
                                                                <Text style={{ ...styles.appButtonText, fontSize: 15, fontWeight: "bold", left: -2, top: -2 }}>{"x"}</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </>
                                                    :
                                                    <>
                                                        {(!state.receiptVisible) ?
                                                            state.pitstops.map((item, index) => (
                                                                <View key={index}>
                                                                    <View style={{ flexDirection: "row" }}>
                                                                        <View style={{ flexDirection: "row" }}>
                                                                            <SvgXml xml={pitstopCircle} key={"ico-" + index} style={{ marginTop: 1.5 }} />
                                                                            <Text style={{ ...styles.caption, color: '#000', marginVertical: -2.5 }}>{"PitStop " + (index + 1)}</Text>
                                                                        </View>
                                                                        <SvgXml style={{ position: "absolute", right: 0 }} xml={approvedIcon} height={30} width={30} />
                                                                    </View>

                                                                    <Text style={{ ...styles.caption, color: '#9f9f9f', fontSize: 14, marginTop: 2, marginLeft: 15, width: Dimensions.get("window").width * 0.78, marginVertical: 7 }}>{item.title}</Text>

                                                                    <View style={{
                                                                        borderWidth: 1.001, borderColor: "#E5E5E5", width: "100%",
                                                                        marginBottom: 8,
                                                                        borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0
                                                                    }} />
                                                                </View>
                                                            ))
                                                            :
                                                            state.receiptData && (
                                                                <>
                                                                    <View style={{ overflow: "hidden", height: 12, marginBottom: 0, marginTop: -10, width: "100%" }}><Text style={{ color: "#8c8c8c", fontSize: 15, letterSpacing: 0 }}>{dottedLineStr}</Text></View>

                                                                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 4.7 }}>
                                                                        <Text style={{ ...styles.caption, left: 0, color: '#4d4d4d', fontWeight: "bold", marginVertical: 0 }}>{`*** ${state.receiptData?.title.toUpperCase()} ***`}</Text>
                                                                    </View>

                                                                    <View style={{ overflow: "hidden", height: 12, marginBottom: 0, marginTop: -4, width: "100%" }}><Text style={{ color: "#8c8c8c", fontSize: 15, letterSpacing: 0 }}>{dottedLineStr}</Text></View>

                                                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4.7 }}>
                                                                        <Text style={{ ...styles.caption, left: 0, color: '#4d4d4d', fontWeight: "bold", marginVertical: 0 }}>{state.receiptData?.date.toUpperCase()}</Text>
                                                                        <Text style={{ ...styles.caption, left: 0, color: '#4d4d4d', fontWeight: "bold", marginVertical: 0 }}>{state.receiptData?.time.toUpperCase()}</Text>
                                                                    </View>

                                                                    <View style={{ overflow: "hidden", height: 12, marginBottom: 0, marginTop: -4, width: "100%" }}><Text style={{ color: "#8c8c8c", fontSize: 15, letterSpacing: 0 }}>{dottedLineStr}</Text></View>

                                                                    {state.receiptData?.billItems.map((item, index) => (
                                                                        <View key={index} style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4.7 }}>
                                                                            <Text style={{ ...styles.caption, fontSize: 14, left: 0, color: '#4d4d4d', fontWeight: "normal", marginVertical: 0 }}>{item.description}</Text>
                                                                            <Text style={{ ...styles.caption, fontSize: 14, left: 0, color: '#4d4d4d', fontWeight: "normal", marginVertical: 0 }}>{"Rs. " + item.amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                                                                        </View>
                                                                    ))}

                                                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4.7 }}>
                                                                        <Text style={{ ...styles.caption, fontSize: 14, left: 0, color: '#4d4d4d', fontWeight: "normal", marginVertical: 0 }}>{"Service Charges"}</Text>
                                                                        <Text style={{ ...styles.caption, fontSize: 14, left: 0, color: '#4d4d4d', fontWeight: "normal", marginVertical: 0 }}>{"Rs. " + state.receiptData?.serviceCharges?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                                                                    </View>

                                                                    <View style={{ overflow: "hidden", height: 12, marginBottom: 0, marginTop: -4, width: "100%" }}><Text style={{ color: "#8c8c8c", fontSize: 15, letterSpacing: 0 }}>{dottedLineStr}</Text></View>

                                                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4.7 }}>
                                                                        <Text style={{ ...styles.caption, fontSize: 14, left: 0, color: '#4d4d4d', fontWeight: "normal", marginVertical: 0 }}>{"Total Bill"}</Text>
                                                                        <Text style={{ ...styles.caption, fontSize: 14, left: 0, color: '#4d4d4d', fontWeight: "normal", marginVertical: 0 }}>{"Rs. " + state.receiptData?.totalAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                                                                    </View>

                                                                    <View style={{ overflow: "hidden", height: 12, marginBottom: 0, marginTop: -4, width: "100%" }}><Text style={{ color: "#8c8c8c", fontSize: 15, letterSpacing: 0 }}>{dottedLineStr}</Text></View>

                                                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4.7 }}>
                                                                        <Text style={{ ...styles.caption, fontSize: 14, left: 0, color: '#4d4d4d', fontWeight: "normal", marginVertical: 0 }}>{"Amount Payable"}</Text>
                                                                        <Text style={{ ...styles.caption, fontSize: 14, left: 0, color: '#4d4d4d', fontWeight: "normal", marginVertical: 0 }}>{"Rs. " + state.receiptData?.amountPayable?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                                                                    </View>

                                                                    <View style={{ overflow: "hidden", height: 12, marginBottom: 4, marginTop: -4, width: "100%" }}><Text style={{ color: "#8c8c8c", fontSize: 15, letterSpacing: 0 }}>{dottedLineStr}</Text></View>

                                                                    <View style={{ flexDirection: "row", marginVertical: 8 }}>
                                                                        <TextInput
                                                                            multiline={false}
                                                                            returnKeyType="done"
                                                                            keyboardType="number-pad"
                                                                            maxLength={7}
                                                                            onSubmitEditing={() => Keyboard.dismiss()}
                                                                            placeholder="Enter Received / Refunded amount"
                                                                            value={state.finalAmountBoxValue}
                                                                            style={{ flexGrow: 50, width: 50, color: "#000", borderRadius: 20, height: state.chatVisible ? null : 40, maxHeight: 73, marginLeft: 0, marginRight: 10, paddingLeft: 15, paddingRight: 15, borderColor: "#E5E5E5", borderWidth: 1, paddingTop: 8, paddingBottom: 9 }}
                                                                            onChangeText={(value) => setState((prevState) => ({ ...prevState, finalAmountBoxValue: value }))}
                                                                        />
                                                                    </View>
                                                                </>
                                                            )
                                                        }
                                                    </>
                                                :
                                                <></>
                                            }
                                        </ScrollView>

                                        <View style={{ width: "100%", flexDirection: "column", marginTop: 5, display: (state.orderAllocatedCollapsed ? "none" : "flex") }}>
                                            {(state.activePitstopIndex < state.pitstops.length - 1) ?
                                                <TouchableOpacity
                                                    onPress={() => onCompletePitstopAndGoToNextPitstop(false)}
                                                    style={{ ...styles.appButtonContainer, elevation: 0, width: Dimensions.get("window").width, position: "relative", alignSelf: "center", bottom: 0, backgroundColor: activeTheme.default }}
                                                >
                                                    <Text style={styles.appButtonText}>Next Pitstop</Text>
                                                </TouchableOpacity>
                                                :
                                                (!state.isOrderCompleted) ?
                                                    <TouchableOpacity
                                                        onPress={() => onCompletePitstopAndGoToNextPitstop(true)}
                                                        style={{ ...styles.appButtonContainer, elevation: 0, width: Dimensions.get("window").width, position: "relative", alignSelf: "center", bottom: 0, backgroundColor: activeTheme.default }}
                                                    >
                                                        <Text style={styles.appButtonText}>Complete Order</Text>
                                                    </TouchableOpacity>
                                                    :
                                                    (!state.receiptVisible) ?
                                                        <TouchableOpacity
                                                            onPress={() => setState((prevState) => ({ ...prevState, receiptVisible: true }))}
                                                            style={{ ...styles.appButtonContainer, elevation: 0, width: Dimensions.get("window").width, position: "relative", alignSelf: "center", bottom: 0, backgroundColor: activeTheme.default }}
                                                        >
                                                            <Text style={styles.appButtonText}>Done</Text>
                                                        </TouchableOpacity>
                                                        :
                                                        <TouchableOpacity
                                                            onPress={() => onCloseOrderAndGoToRiderHome()}
                                                            style={{ ...styles.appButtonContainer, elevation: 0, width: Dimensions.get("window").width, position: "relative", alignSelf: "center", bottom: 0, backgroundColor: activeTheme.default }}
                                                        >
                                                            <Text style={styles.appButtonText}>Close Order</Text>
                                                        </TouchableOpacity>
                                            }
                                        </View>
                                    </View>
                                }
                            </>
                        }

                    </KeyboardAvoidingView>
                </>
            }


            {/* ----------------------------------------------------------------------------------------------------------- */}
            {/* ----------------------------------------------------------------------------------------------------------- */}


            <>
                {state.mode !== "noInternet" &&
                    <>
                        <View style={{ position: "absolute", right: (Dimensions.get("window").width / 2) - 37.5 + (Dimensions.get("window").width < 385 ? 20 : 0), top: 41.5, zIndex: 6, backgroundColor: activeTheme.default, width: 75, borderRadius: 85, elevation: 25, height: 37, borderWidth: 1, borderStyle: "solid", borderColor: "#F0F0F0", flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TouchableOpacity disabled={true} style={{ width: 94, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => { }}>
                                <Text ref={riderTimerRef} style={{ color: activeTheme.white, paddingLeft: 9, marginRight: 4 }}>{"00:00:00"}</Text>
                            </TouchableOpacity>
                        </View>


                        <View style={{ position: "absolute", right: 14, top: 41.5, zIndex: 6, backgroundColor: activeTheme.default, width: 136, borderRadius: 85, elevation: 25, height: 37, borderWidth: 1, borderStyle: "solid", borderColor: "#F0F0F0", flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TouchableOpacity disabled={state.mode === "orderAllocated"} style={{ width: 94, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => onOpenMainAmountModal("header")}>
                                <Text style={{ color: activeTheme.white, paddingLeft: 10, marginRight: 4 }}>{(state.mainAmount) ? "Rs. " + state.mainAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "Rs. 0"}</Text>
                                <SvgXml xml={dropIcon} height={15} width={15} />
                            </TouchableOpacity>
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


                        {state.mode === "orderAllocated" &&
                            <TouchableOpacity onPress={() => { }} style={{ bottom: state.riderHomeCollapsed ? (55 + 5) : (55 + 5 + 185), position: "absolute", left: "87.3%", zIndex: 0 }} >
                                <View style={{ ...styles.headerLeftIconView, elevation: 0, backgroundColor: "transparent" }} >
                                    <SvgXml style={{ ...styles.svgTag, marginTop: 1.5 }} xml={chatDisabledIcon()} height={55} width={55} />
                                </View>
                            </TouchableOpacity>
                        }
                    </>
                }

                <View>
                    <CustomAlert
                        key={"forceTurnOnLocDialog"}
                        ref={forceTurnOnLocDialogRef}
                        show={false}
                        useNativeDriver={true}
                        showProgress={false}
                        title="Location Unavailable!"
                        message="To continue, you need to turn on your device's Location by visiting the Settings."
                        closeOnTouchOutside={false}
                        closeOnHardwareBackPress={false}
                        showCancelButton={false}
                        showConfirmButton={true}
                        cancelText="CANCEL"
                        confirmText="SETTINGS"
                        titleStyle={{ paddingHorizontal: 0, top: -5, color: "#000", fontSize: 18, fontWeight: "700" }}
                        contentContainerStyle={{ color: "#000", maxWidth: "87%" }}
                        contentStyle={{ justifyContent: 'flex-start', alignItems: "flex-start", padding: 10 }}
                        messageStyle={{ color: "#000", fontSize: 15 }}
                        actionContainerStyle={{ justifyContent: "flex-end" }}
                        confirmButtonStyle={{ backgroundColor: "transparent" }}
                        confirmButtonTextStyle={{ color: "#000", fontSize: 14, fontWeight: "700" }}
                        onCancelPressed={() => { }}
                        onConfirmPressed={() => { RNSettings.openSetting(RNSettings.ACTION_LOCATION_SOURCE_SETTINGS) }}
                    />
                </View>

                <View>
                    <CustomAlert
                        key={"forcePermissionLocDialog"}
                        ref={forcePermissionLocDialogRef}
                        show={false}
                        useNativeDriver={true}
                        showProgress={false}
                        title="Location permission is not granted!"
                        message="To continue, you need to allow Location permission by visiting the Settings."
                        closeOnTouchOutside={false}
                        closeOnHardwareBackPress={false}
                        showCancelButton={false}
                        showConfirmButton={true}
                        cancelText="CANCEL"
                        confirmText="SETTINGS"
                        titleStyle={{ paddingHorizontal: 0, top: -5, color: "#000", fontSize: 18, fontWeight: "700" }}
                        contentContainerStyle={{ color: "#000", maxWidth: "87%" }}
                        contentStyle={{ justifyContent: 'flex-start', alignItems: "flex-start", padding: 10 }}
                        messageStyle={{ color: "#000", fontSize: 15 }}
                        actionContainerStyle={{ justifyContent: "flex-end" }}
                        confirmButtonStyle={{ backgroundColor: "transparent" }}
                        confirmButtonTextStyle={{ color: "#000", fontSize: 14, fontWeight: "700" }}
                        onCancelPressed={() => { }}
                        onConfirmPressed={() => { openSettings() }}
                    />
                </View>
            </>


        </View >
    );
};

const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer
    }
};

export default connect(mapStateToProps)(RiderOrder);
