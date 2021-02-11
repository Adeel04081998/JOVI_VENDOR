import React from 'react';
import { PermissionsAndroid, Keyboard, Platform, View, Text, Alert, Dimensions, PixelRatio, StatusBar, Share } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import ImagePicker from 'react-native-image-picker';
import NavigationService from '../routes/NavigationService';
import { openModalAction } from '../redux/actions/modal';
import Animated, { cos, Easing } from 'react-native-reanimated';
import AsyncStorage from '@react-native-community/async-storage';
import Clipboard from '@react-native-community/clipboard';
import CustomToast from '../components/toast/CustomToast';
import { BASE_URL, BOTTOM_TABS, CONSTANTLATDELTA, CONSTANTLONGDELTA, IMAGE_NOT_AVAILABLE_URL, isJoviCustomerApp } from '../config/config';
import ImageEditor from "@react-native-community/image-editor";
import { CommonActions } from '@react-navigation/native';
import { GET_SET_ENUMS_ACTION, LOGOUT_ACTION } from '../redux/actions/types';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import RNLocation from 'react-native-location';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { cartAction, notifyAction } from '../redux/actions/user';
import moment from 'moment';
import store from '../redux/store';
import DeviceInfo from 'react-native-device-info';
const { timing } = Animated;

// <Apis Handlers>

export const sharedSendFCMTokenToServer = (postRequest, FcmToken) => {
    postRequest(
        `/api/Common/FireBase/AddLog`,
        {
            "userID": "",
            "deviceToken": FcmToken
        },
        {},
        store.dispatch,
        res => {
            if (res.data.statusCode === 200) {
                console.log("sharedSendFCMTokenToServer.success :", res)
            };
        },
        err => {
            if (err) {
                console.log("sharedSendFCMTokenToServer.error :", err)
            }
        },
        "",
        false
    )
};
export const sharedGetCustomerAddressesHandler = (getRequest, onSuccess, onError) => {
    getRequest(
        '/api/SuperMarket/Order/GetAddress',
        {},
        store.dispatch,
        response => {
            console.log("sharedGetCustomerAddressesHandler.res :", response);
            onSuccess && onSuccess(response);
        }
        ,
        (error) => {
            console.log("sharedGetCustomerAddressesHandler.error :", error);
            onError && onError(error)
        },
        '',
        true,
        false
    );
};

export const sharedAddReivewToItemHandler = (postRequest, showLoader, args) => {
    postRequest(
        `/api/SuperMarket/ItemReview/AddOrUpdate`,
        {
            "rating": args.rating,
            "description": args.description,
            "pitstopItemID": args.pitstopItemID,
            "orderID": args.orderID
        },
        {},
        store.dispatch,
        res => {
            if (res.data.statusCode === 200) {
                CustomToast.success('Review added');
            };
        },
        err => {
            if (err) CustomToast.error('Something went wrong');
        },
        "",
        showLoader
    )
};

export const sharedGetUserCartHandler = (getRequest, loading, checkOutItemType) => {
    getRequest(`/api/SuperMarket/CheckOutItemsByUserID/0`, {}, store.dispatch, res => {
        if (res.data.statusCode === 200) store.dispatch(cartAction({ "checkoutItemsVMList": res.data.checkoutItemsVMList }));
        else if (res.data.statusCode === 404) store.dispatch(cartAction({
            "checkoutItemsVMList": {
                "pitstopCheckoutItemsListVM": [],
                "shippingCharges": null,
                "total": null,
            },
        }));
    }, err => {
        if (err) CustomToast.error('Something went wrong');
    },
        '',
        true,
        loading);
};

export const sharedClearCartHandler = (postRequest, showToast, showLoader, checkOutItemType, backScreenIndex) => {
    postRequest(
        `/api/SuperMarket/EmptyCartByUserID/0`,
        {},
        {},
        store.dispatch,
        res => {
            if (res.data.statusCode === 200) {
                store.dispatch(cartAction({
                    "checkoutItemsVMList": {
                        "pitstopCheckoutItemsListVM": [],
                        "shippingCharges": null,
                        "total": null,
                    },
                }));
            };
            navigateWithResetScreen(null, [{ name: BOTTOM_TABS[backScreenIndex].route.container }]);
            if (showToast) CustomToast.success('Cart cleared');
        },
        err => {
            if (err) CustomToast.error('Something went wrong');
        },
        "",
        showLoader
    )
};

export const sharedAddItemToFavouritesHandler = (postRequest, payload, onSuccess, onError) => {
    postRequest(
        `/api/SuperMarket/Product/AddFavorite`,
        payload,
        {},
        store.dispatch,
        res => onSuccess(res),
        err => {
            if (err) {
                CustomToast.error('Something went wrong');
                onError(err)
            }
            // console.log(err)
        },
        '',
        false)
};
export const sharedGetEnumsHandler = getRequest => {
    getRequest(
        `/api/Common/Enums`,
        {},
        store.dispatch,
        res => {
            console.log("[sharedGetEnumsHandler].res :", res);
            store.dispatch({ type: GET_SET_ENUMS_ACTION, payload: res.data.enums });
        },
        err => {
            if (err) {
                console.log('Error occured during getting enums')
                // CustomToast.error('Something went wrong');
            }
            // console.log(err)
        },
        '',
        false)
};

// </Apis Handlers>

export const sharedTotalCartItems = () => {
    // console.log("store.getState() :", store.getState().userReducer);
    let cartSupermarkets = [],
        cartProducts = [];
    store?.getState()?.userReducer?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM.map((S, index) => {
        cartSupermarkets.push(S)
        S.checkOutItemsListVM.map((P, k) => {
            // console.log("k", k);
            cartProducts.push(P);
        })
    });
    return {
        cartSupermarkets,
        cartProducts,
    }
};

export const openShareClients = async args => {
    try {
        let result = await Share.share({ title: args?.title ?? 'Share with', message: args?.message ?? "", url: args?.url ?? "", });
        if (result.action === Share.sharedAction) {
            if (result.activityType) {
                console.log("result.activityType :", result.activityType)
                // shared with activity type of result.activityType
            } else {
                console.log("Shared :")
                // shared
            }
        } else if (result.action === Share.dismissedAction) {
            console.log("Share.dismissedAction :")
            // dismissed
        }
    } catch (error) {
        console.log('error :', error);

    }
}
export const getScreenNavState = navigation => {
    const _firstIndex = navigation.dangerouslyGetState().index,
        _secondIndex = navigation.dangerouslyGetState().routes[_firstIndex].state.index,
        _currentStack = navigation.dangerouslyGetState().routes[_firstIndex].state.routes[_secondIndex],
        _currentScreen = _currentStack.state.routes[_currentStack.state.index];
    return _currentScreen;
};

export const sharedTimeStampsHandler = (dateTime, dateFormate) => moment(moment(dateTime, dateFormate).toDate()).fromNow();

export const sharedGetNotificationsHandler = (postRequest, pageNumber, itemsPerPage, isAscending, dispatch, onSuccess, onError) => {
    postRequest(
        `/api/Notification/AlertNotificationLog/List`,
        {
            "userID": null,
            "pageNumber": pageNumber || 1,
            "itemsPerPage": itemsPerPage || 20,
            "isAscending": isAscending,
        },
        {},
        dispatch,
        res => {
            console.log('[sharedGetNotificationsHandler] Resonse :', res.data)
            if (res && res.data.statusCode === 200) {
                dispatch(notifyAction(res.data))
                onSuccess && onSuccess(res)
            }
        },
        err => {
            if (err) {
                CustomToast.error('Something went wrong');
                onError && onError(err)
            }
            // console.log(err)
        },
        '',
        false)
};

var hubConnection = null;
export const sharedHubConnectionInitiator = async (postRequest) => {
    // let reconnectArray = Array.from(Array(100), (item, j) => (j + 1) * 15000);
    const deviceMAC = await DeviceInfo.getMacAddress();
    const User = JSON.parse(await AsyncStorage.getItem('User'));

    hubConnection = new HubConnectionBuilder()
        .withUrl(`${BASE_URL}/notificationHub?access_token=${User.token.authToken}&hwi=${deviceMAC}`)
        .configureLogging(LogLevel.None)
        // .withAutomaticReconnect(reconnectArray)  
        .build();
    // hubConnection.keepAliveIntervalInMilliseconds = 1000;
    // hubConnection.serverTimeoutInMilliseconds = 100000;
    async function start() {
        try {
            if (hubConnection?.state !== HubConnectionState.Connected) {
                console.log("Starting SignalR...");
                await hubConnection.start();
                console.log("SignalR Connected!");

                // Attaching SignalR Event Handlers when SignalR is Connected...

                if (isJoviCustomerApp) {
                    attachSignalRRatingPopupHandler();
                }
                else {
                    attachSignalRLogoutHandler(postRequest);
                    attachSignalRIncomingOrderHandler();
                }
            }
        } catch (err) {
            console.log("Error during signalR connectivity:", err);
            setTimeout(start, 2000);
        }
    };
    if (hubConnection) {
        hubConnection.closedCallbacks = [];
        hubConnection.onclose(start);
    }
    start();

    // await hubConnection.start().then(() => console.log('SignalR Connection established!!!')).catch(err => console.log('Error during signalR connectivity :', err))
    // hubConnection.onclose(err => {
    //     // if (err) console.log("hubConnection.onClose called with error :", err)
    //     console.log("hubConnection.onClose called and new connection establishing....")
    //     setTimeout(async () => await hubConnection.start().then(() => console.log('SignalR Connection established!!!')).catch(err => console.log('Error during signalR start run!! :', err)), 5000)
    // });
    // hubConnection.onreconnecting(err => console.log("hubConnection.onreconnecting called with error :", err));
    // hubConnection.onreconnected(conn => console.log("hubConnection.onreconnected called with connection ID :", conn));
};

export const sharedHubConnectionStopper = async () => {
    if (hubConnection) {
        hubConnection.closedCallbacks = [];
        hubConnection.onclose(() => { });
        await hubConnection.stop();
    }
};

export const getHubConnectionInstance = (clearEvent) => {
    if (hubConnection?.state === HubConnectionState.Connected) {
        if (clearEvent) {
            delete hubConnection.methods[clearEvent.toLowerCase()];
        }
        return hubConnection;
    }
    else {
        return null;
    }
};


const configureAppLocation = () => {
    RNLocation.configure({
        // distanceFilter: 10, // Meters
        desiredAccuracy: {
            android: "balancedPowerAccuracy"
        },
        androidProvider: "auto",
        interval: 2000, // Milliseconds
        fastestInterval: 2500, // Milliseconds
        maxWaitTime: 2000, // Milliseconds
    });
};

export const getAppLocationInstance = (clearEvent) => {
    configureAppLocation();

    if (clearEvent) {
        RNLocation._eventEmitter._subscriber._subscriptionsForType.locationUpdated = [];
        RNLocation._nativeInterface.stopUpdatingLocation();
        // console.log(RNLocation);
        // console.log(RNLocation._eventEmitter._subscriber._subscriptionsForType);
        if (unsubscribeFromLocationUpdates) {
            unsubscribeFromLocationUpdates();
            setUnsubscribeFromLocationUpdates(null);
        }
    }
    return RNLocation;
};

var unsubscribeFromLocationUpdates = null;
export const setUnsubscribeFromLocationUpdates = (handler) => {
    unsubscribeFromLocationUpdates = handler;
};

var lastRecordedLocation = null
export const setLastRecordedLocation = (obj) => {
    lastRecordedLocation = { ...obj };
};

export const getLastRecordedLocation = () => {
    return lastRecordedLocation;
};


const configureBackgroundLocation = () => {
    BackgroundGeolocation.configure({
        desiredAccuracy: BackgroundGeolocation.MEDIUM_ACCURACY,
        // distanceFilter: 10, // Meters
        // stationaryRadius: 10, // "DISTANCE_FILTER_PROVIDER"
        notificationsEnabled: true,
        notificationTitle: "Background Tracking",
        notificationText: "Location tracking enabled in background",
        notificationIconColor: "#7359be", // "#6a33ea",
        debug: false,
        startOnBoot: false,
        stopOnTerminate: true,
        locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
        interval: 2000, // "DISTANCE_FILTER_PROVIDER" | "RAW_PROVIDER"
        fastestInterval: 2500, // "ACTIVITY_PROVIDER"
        activitiesInterval: 2500, // "ACTIVITY_PROVIDER"
        stopOnStillActivity: false, // "ACTIVITY_PROVIDER"
        startForeground: false,
        // url: 'An API URL here gets hit with location data',
        // httpHeaders: {
        //     'X-FOO': 'bar',
        //     'Authorization': "Bearer " + ""
        // },
        // postTemplate: {
        //     lat: '@latitude',
        //     lon: '@longitude',
        //     foo: 'bar'
        // }
    });
};

export const handleBackgroundLocationForRider = (isActive, locationUpdateListener, attachLocationUpdateListener) => {
    configureBackgroundLocation();

    BackgroundGeolocation.checkStatus(status => {

        if (status.isRunning && !isActive) {
            BackgroundGeolocation.deleteAllLocations();

            BackgroundGeolocation.stop();
        }

        if (!status.isRunning && isActive) {
            BackgroundGeolocation.deleteAllLocations();
            BackgroundGeolocation.removeAllListeners();

            if (attachLocationUpdateListener) {
                BackgroundGeolocation.on('location', (location) => {

                    BackgroundGeolocation.startTask(taskKey => {
                        locationUpdateListener(location);
                        BackgroundGeolocation.endTask(taskKey);
                    });
                });
            }
            // BackgroundGeolocation.on('background', () => {
            //     console.log('[INFO] App is in Background');
            // });
            // BackgroundGeolocation.on('foreground', () => {
            //     console.log('[INFO] App is in Foreground');
            // });
            BackgroundGeolocation.on('start', () => {
                console.log('[INFO] BackgroundGeolocation Service has been Started');
            });
            BackgroundGeolocation.on('stop', () => {
                console.log('[INFO] BackgroundGeolocation Service has been Stopped');
            });

            BackgroundGeolocation.start();
        }
    });
};


export const navigationHandler = (routeName, params) => {
    NavigationService.navigate(routeName, params);
};
export const navigateWithResetScreen = (index, routes) => {
    NavigationService._navigatorRef.current?.dispatch(CommonActions.reset({ index, routes }));
    // NavigationService._navigatorRef.current.reset({ index, routes });
};
export const openDrawerHandler = () => {
    NavigationService.drawerOpen();
};

var isForcePermissionLocDialogVisible = false;
export const setIsForcePermissionLocDialogVisible = (val) => {
    isForcePermissionLocDialogVisible = val;
};
export const getIsForcePermissionLocDialogVisible = () => {
    return isForcePermissionLocDialogVisible;
};

var isForceTurnOnLocDialogVisible = false;
export const setIsForceTurnOnLocDialogVisible = (val) => {
    isForceTurnOnLocDialogVisible = val;
};
export const getIsForceTurnOnLocDialogVisible = () => {
    return isForceTurnOnLocDialogVisible;
};

export const clearCustomerOrderStorage = async () => {
    await AsyncStorage.removeItem("customerOrder_lastOrderTime");
    await AsyncStorage.removeItem("customerOrder_lastOrder");
    await AsyncStorage.removeItem("customerOrder_predefinedPlaces");
    await AsyncStorage.removeItem("customerOrder_dontAskBeforeReloadingOrder");
    await AsyncStorage.removeItem("isFirstLoad");
};

export const clearCustomerOrderFinalDestination = async () => {
    await AsyncStorage.removeItem("customerOrder_finalDestination");
};

export const clearRiderOrderStorage = async () => {
};

export const sharedAnimationHandler = (animationRef, toValue, duration) => {
    timing(animationRef, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.ease),
        // useNativeDriver: false
    }).start();
}
export const sharedKeyboardDismissHandler = () => {
    Keyboard.dismiss();
};
export const handleDeniedPermission = (msgHeader = "", msgText = "", cb) => {
    Alert.alert(
        msgHeader,
        msgText,
        [
            {
                text: 'Cancel',
                onPress: () => {
                    cb && cb(false);
                },
                style: 'cancel'
            },
            {
                text: 'Settings',
                onPress: () => {
                    openSettings();
                }
            }
        ],
        { cancelable: false }
    );
};

export const attachSignalRLogoutHandler = (postRequest) => {
    getHubConnectionInstance("Logout")?.on("Logout", () => {
        console.log(`RECEIVED -> 'Logout'`);

        const dispatch = store.dispatch;
        const navigation = NavigationService?._navigatorRef?.current;
        const userObj = store?.getState()?.userReducer;

        if (userObj && navigation) {
            sharedlogoutUser(navigation, postRequest, dispatch, userObj, true);
        }
    });
};

export const attachSignalRIncomingOrderHandler = () => {
    getHubConnectionInstance("AllocationRequest")?.on("AllocationRequest", (orderID) => {
        console.log(`RECEIVED -> 'AllocationRequest': `, [orderID]);

        const dispatch = store.dispatch;
        const navigation = NavigationService?._navigatorRef?.current;
        const userObj = store?.getState()?.userReducer;

        if (userObj && navigation) {
            dispatch(
                openModalAction(
                    {
                        orderID: orderID,
                        navigation: navigation,
                        dispatch: dispatch,
                        userObj: userObj,
                        visible: true,
                        transparent: true,
                        okHandler: () => { },
                        onRequestCloseHandler: () => { },
                        modalHeight: 250,
                        modelViewPadding: 0,
                        androidKeyboardExtraOffset: 0,
                        ModalContent: {
                            name: "incoming_job_modal",
                            data: {}
                        },
                    }
                )
            );
        }
    });
};

export const sharedIsRiderApproved = (userObj = {}) => {
    return (
        userObj.riderStatus === 4 ?
            true
            :
            false
    );
};

export const attachSignalRRatingPopupHandler = () => {
    getHubConnectionInstance("ComplaintRatingReminder")?.on("ComplaintRatingReminder", (userID, complaintID, randomNumber) => {
        console.log(`[SignalR].on(ComplaintRatingReminder).data -> `, "userID", userID, "complaintID", complaintID, "randomNumber", randomNumber);
        store.dispatch(openModalAction(
            {
                dispatch: store.dispatch, visible: true, transparent: true, modalHeight: 250, modelViewPadding: 0,
                ModalContent: {
                    name: "ratings_pop_up",
                    data: {
                        userID,
                        complaintID,
                        fromSignalR: true
                    }
                },
                okHandler: () => { }, onRequestCloseHandler: () => { }, androidKeyboardExtraOffset: 0
            }
        ));
    });
};

export const sharedImagePickerHandler = async (cb, next) => {
    try {
        if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
            if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                handleDeniedPermission('Camera permission is not granted!', 'If you want to use Camera, then go to Settings and allow Camera permission!', cb);
                return;
            }
        }
        // More info on all the options is below in the API Reference... just some common use cases shown here
        const options = {
            // customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
            title: 'Upload Photo',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            quality: 0.5,
            maxWidth: 1000
        };

        /**
         * The first arg is the options object for customization (it can also be null or omitted for default options),
         * The second arg is the callback which sends object: response (more info in the API Reference)
         */
        ImagePicker.showImagePicker(options, response => {
            // console.log('Response = ', response);
            if (response.didCancel) {
                cb();
                console.log('User cancelled image picker');
            } else if (response.error) {
                cb();
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                cb();
                console.log('User tapped custom button: ', response.customButton);
            } else {
                console.log(response);
                next(response);
                // return response;
                // cb(response)
            }
        });
    } catch (error) {
        console.log('Catch error :', error)
    }
};

const cameraResponseHandler = (response, cb, next) => {
    if (response.didCancel) {
        cb();
        console.log('User cancelled image picker');
    } else if (response.error) {
        cb();
        console.log('ImagePicker Error: ', response.error);
    } else if (response.customButton) {
        cb();
        console.log('User tapped custom button: ', response.customButton);
    } else {
        console.log(response);
        next(response);
    }
}


export const sharedLounchCameraOrGallary = async (pressType, cb, next) => {
    // debugger;
    try {
        if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
            if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                handleDeniedPermission('Camera permission is not granted!', 'If you want to use Camera, then go to Settings and allow Camera permission!', cb);
                return;
            }
        }
        const options = {
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            quality: 0.5,
            maxWidth: 1000
        };
        if (pressType === 1) {
            ImagePicker.launchCamera(options, response => {
                cameraResponseHandler(response, cb, next)
            });
        } else {
            ImagePicker.launchImageLibrary(options, response => {
                cameraResponseHandler(response, cb, next)
            });
        }
    } catch (error) {
        console.log('Catch error :', error)
    }
}
export const hybridLocationPermission = async (cb) => {
    // try {
    if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
            handleDeniedPermission('Location permission is not granted!', 'Please allow Location permission by visiting the Settings.');
            return;
        }
        else if (result === PermissionsAndroid.RESULTS.GRANTED) {
            cb && cb();
        }
    }
    else if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
        if (result !== RESULTS.GRANTED) {
            handleDeniedPermission('Location permission is not granted!', 'Please allow Location permission by visiting the Settings.');
            return;
        }
        else if (result === RESULTS.GRANTED) {
            cb && cb();
        }
    }
    // } catch (error) {
    //     console.log('Catch error :', error)
    // }
};

export const askForAudioRecordPermission = async (cb) => {
    try {
        if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);

            if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                handleDeniedPermission('Microphone permission is not granted!', 'If you want to send Voice Messages, then go to Settings and allow Microphone permission.', cb);
                return;
            }
            else {
                cb && cb(true);
                return;
            }
        }
        else if (Platform.OS === 'ios') {
            const result = await request(PERMISSIONS.IOS.MICROPHONE);

            if (result !== RESULTS.GRANTED) {
                handleDeniedPermission('Microphone permission is not granted!', 'If you want to send Voice Messages, then go to Settings and allow Microphone permission.');
                return;
            }
            else {
                cb && cb(true);
                return;
            }
        }
    } catch (error) {
        console.log('Catch error :', error)
    }
};
export const askForWholeAppPermissions = async () => {
    await sharedImagePickerHandler(() => { });
    await hybridLocationPermission();
    await askForAudioRecordPermission(() => { });
};

export const sharedOpenModal = modalProps => modalProps.dispatch(openModalAction({ ...modalProps }));

export const getParamFromNavigation = (navigation, paramKey, index) => {
    // console.log(navigation.dangerouslyGetState());
    let navigationState = null;
    let getNavigationState = navigation.dangerouslyGetState();
    navigationState = getNavigationState.routes[(getNavigationState && typeof (getNavigationState.index) === "number") ? getNavigationState.index : index] && getNavigationState.routes[(getNavigationState && typeof (getNavigationState.index) === "number") ? getNavigationState.index : index].params && getNavigationState.routes[(getNavigationState && typeof (getNavigationState.index) === "number") ? getNavigationState.index : index].params[paramKey];
    if (navigationState && navigationState !== null) return navigationState;
    else return {}
    // console.log(navigationState);
    // return JSON.parse(navigationState);
};
export const sharedCountDownInterval = (duration, setState) => {
    var timer = duration, minutes, seconds;
    let intervalID = setInterval(function () {
        // console.log('Interval Ran----');
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        setState(prevState => ({ ...prevState, intervalStoped: false, mins: minutes, sec: seconds }));
        if (--timer < 0) {
            clearInterval(intervalID);
            console.log('Interval Stoped----');
            setState(prevState => ({ ...prevState, intervalStoped: true }));
            return;
        }
    }, 1000);
    setState(prevState => ({ ...prevState, intervalId: intervalID }));
};
export const recordsNotExistUI = (message, bg, justify, align, padding, margHor, key) => {
    return <View key={Math.random()} style={{ flex: 0, backgroundColor: bg ? bg : '#F9F8F8', justifyContent: justify ? justify : 'center', alignItems: align ? align : 'center', paddingVertical: padding ? padding : 10, marginHorizontal: margHor ? margHor : 0 }}>
        <Text>{message}</Text>
    </View>
};
export const sharedGetLoggedInUser = async () => {
    let user = await AsyncStorage.getItem('User');
    try {
        if (user) return user;
        else return false;
    } catch (error) {
        console.log("sharedGetLoggedInUser.Catch_Error :", error)
    }
    // console.log('sharedGetLoggedInUser :', JSON.parse(user))
};
export const sharedCopyTextToClipboard = (text, position) => {
    // Alert.alert('Text Copied')
    Clipboard.setString(text);
    CustomToast.success('Text copied', position);
};
export const sharedGetTextFromClipboard = async () => {
    let text = await Clipboard.getString();
    Alert.alert(text)
};
export const renderPicture = (picturePath, token) => {

    // console.log("picturePath :", picturePath);
    // 'Temp live/2/2020/8/21/jovipng_113.png
    return `${BASE_URL}/api/Common/S3File/${encodeURIComponent(picturePath)}?access_token=${token}`;

};
export const renderPictureResizeable = (picturePath,size, token) => {

    // console.log("picturePath :", picturePath);
    // 'Temp live/2/2020/8/21/jovipng_113.png
    return `${BASE_URL}/api/Common/S3File/${size}/${encodeURIComponent(picturePath)}?access_token=${token}`;

};
export const sharedlogoutUser = async (navigation, postRequest, dispatch, userObj, isAutomatedLogout) => {
    userObj?.tokenObj?.refreshToken &&
        postRequest(
            '/api/User/logout',
            {
                "refreshToken": userObj.tokenObj.refreshToken,
                "isAutomatedLogout": isAutomatedLogout,
                "userID": userObj?.userID
            },
            null,
            dispatch,
            (response) => {
                setFloatingAmountOnServer(0, postRequest, dispatch, async () => {
                    sharedHubConnectionStopper();
                    await AsyncStorage.removeItem("User");
                    navigation.reset({ routes: [{ name: 'Login', params: 'logout' }] });
                    // navigation.reset({ routes: [{ name: 'OTP', params: 'logout' }] });
                });
            },
            (error) => {
                console.log(((error?.response) ? error.response : {}), error);
            },
            true
        );
};
export const sahredConvertIntoSubstrings = (text, textLenght, startValue, endValue) => {
    // console.log(text.length)
    if (text.length > textLenght) return text.substring(startValue, endValue) + "...";
    else return text;
};
export const sharedCropImageHandler = async doc => {
    try {
        let url = await ImageEditor.cropImage(doc.orderImage, {
            offset: { x: 50, y: 50 },
            size: { width: 500, height: 500 },
            // resizeMode: "contain"
        })
        return url;
        // return url
    } catch (error) {
        console.log("error during image cropping", error);

    }
};

export const sahredAddRecieptLines = (recieptSign, loopEndValue) => {
    let arr = [];
    for (let index = 0; index < loopEndValue; index++) {
        arr.push(recieptSign)
    }
    return arr;
};

export const sharedCommasAmountConveter = amount => {
    if (!amount || amount === undefined || amount === null) return 0;
    else return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
export const sharedStartingRegionPK = {
    latitude: 25.96146850382255,
    latitudeDelta: 24.20619842968337,
    longitude: 69.89856876432896,
    longitudeDelta: 15.910217463970177
};
export const sharedAnimateToCurrentLocation = (mapRef, callback, options) => {
    // console.log('mapRef :', mapRef)
    navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
        mapRef.current && mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: CONSTANTLATDELTA,
            longitudeDelta: CONSTANTLONGDELTA
        });
    }, (error) => {
        console.log("Problem--- :", error);
        mapRef.current.animateToRegion(sharedStartingRegionPK);
        CustomToast.error("Location Unavailable!" + "\n" + "Location is either turned off or not responding!", null, 'long')
        // Alert.alert("Location Unavailable!", "Location is either turned off or not responding!");
    }, {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 200000,
        maximumAge: options?.maximumAge ?? 100000
    });
    if (callback) callback();
};

export const sharedValidateAllProperties = (obj, ignoredItemsArr) => {
    ignoredItemsArr.forEach(e => delete obj[e]);
    let isValid = false;
    // console.log(obj);
    for (var key in obj) {
        if ((obj[key] !== null && obj[key] !== undefined && obj[key] !== "")) isValid = true;
        else isValid = false;
    }
    // console.log(isValid);
    return isValid;
};
export const sharedObjectComparison = (obj1, obj2, ignoredPropsFromArr) => {
    // console.log(obj1, obj2, ignoredPropsFromArr);
    if (!Object.keys(obj1).length || !Object.keys(obj2).length) return false;
    ignoredPropsFromArr.forEach(e => delete obj1[e]);
    ignoredPropsFromArr.forEach(e => delete obj2[e]);
    for (var p in obj1) {
        if (obj1.hasOwnProperty(p)) {
            if (obj1[p] !== obj2[p]) {
                return false;
            }
        }
    }
    for (var p in obj2) {
        if (obj2.hasOwnProperty(p)) {
            if (obj1[p] !== obj2[p]) {
                return false;
            }
        }
    }
    return true;
};
export const sharedTakeMapSnapshot = async (mapRef, format, quality, result) => {
    try {
        let mapImageBase64 = await mapRef.current.takeSnapshot({
            format: format ? format : "jpg",      // "png" | "jpg"
            quality: quality ? quality : 0.3,       // (0.1 - 1)
            result: result ? result : "base64",    // "file" | "base64"
            // width: Dimensions.get('window').width,
            // height: Dimensions.get('window').height
        });
        // console.log("data:image/jpg;base64," + mapImageBase64);
        return mapImageBase64;
    } catch (error) {
        return error;
    }
};

export function setFloatingAmountOnServer(amount, postRequest, dispatch, cbSuccess, cbError) {
    postRequest(
        `/api/Menu/Rider/AddUpdateFloatingAmount?FloatingAmount=${amount}`,
        {},
        null,
        dispatch,
        (response) => {
            cbSuccess && cbSuccess();
        },
        (error) => {
            console.log(((error?.response) ? error.response : {}), error);
            cbError && cbError();
        },
        true
    );
};

export const sharedConfirmationAlert = (msgHeader, msgText, okHandler, cancelHandler, leftActionText, rightActionText, cancelable = true) => {
    let actionsArray = [
        {
            text: rightActionText || 'Ok',
            onPress: okHandler,
        },
    ];
    if (leftActionText === null) actionsArray = actionsArray;
    else
        actionsArray.unshift({
            text: leftActionText || 'Cancel',
            onPress: cancelHandler,
            style: 'cancel',
        });
    Alert.alert(
        msgHeader,
        msgText,
        actionsArray,
        { cancelable }
    );
};

export function getPixelSize(pixels) {
    return Platform.select({
        ios: pixels,
        android: PixelRatio.getPixelSizeForLayoutSize(pixels)
    });
};

export function statusBarHandler() {
    if (Platform.OS === 'ios') return;
    else {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setBarStyle('dark-content');
    }
};

export function calculateTimeDifference(timeStamp1, timeStamp2, output) {
    var difference = timeStamp1 - timeStamp2;

    var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
    difference -= daysDifference * 1000 * 60 * 60 * 24

    var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
    difference -= hoursDifference * 1000 * 60 * 60

    var minutesDifference = Math.floor(difference / 1000 / 60);
    difference -= minutesDifference * 1000 * 60

    var secondsDifference = Math.floor(difference / 1000);

    if (output === "days") return daysDifference;
    else if (output === "hours") return hoursDifference;
    else if (output === "minutes") return minutesDifference;
    else if (output === "seconds") return secondsDifference;
    else return { daysDifference, hoursDifference, minutesDifference, secondsDifference };
};
