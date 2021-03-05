import React, { useEffect, useState } from 'react';
import { ImageBackground, View, Platform, Keyboard, BackHandler, StatusBar, Text ,Dimensions} from 'react-native';
import OtpScreen from '../screens/otpScreen/Otp';
import OtpCode from '../screens/otpScreen/OtpCode';
import UserRegister from '../screens/userRegister/UserRegister';
import SignIn from '../screens/userRegister/SignInContainer';
import IntroScreen from '../screens/intro/Intro';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';
import EmailOtpVerify from '../screens/otpScreen/EmailOtpVerify';
import ResetPassword from '../screens/userRegister/ResetPassword';
import MainDrawer from './navigations';
import { setIsForceTurnOnLocDialogVisible, setIsForcePermissionLocDialogVisible, sharedHubConnectionInitiator, sharedHubConnectionStopper, statusBarHandler, sharedGetNotificationsHandler, sharedSendFCMTokenToServer } from '../utils/sharedActions';
import AsyncStorage from '@react-native-community/async-storage';
import { getRequest, postRequest } from '../services/api';
import { userAction } from '../redux/actions/user';
import { MODES, APP_MODE } from '../config/config';
import Config from 'react-native-config';
import { sharedConfirmationAlert } from '../utils/sharedActions';
import CustomToast from '../components/toast/CustomToast';
import { closeModalAction } from '../redux/actions/modal';
import Home from '../screens/home/Home';
import Products from '../screens/Products/Products';
import VendorRoutes from './VendorRoutes';
import { UPDATE_MODAL_HEIGHT } from '../redux/actions/types';
import { fcmService } from '../services/FCMServices';
import { localNotificationService } from '../services/LocalNotificationServices';

// import jwt_decode from 'jwt-decode';
const Stack = createStackNavigator();
const RootStack = (props) => {
    // console.log("[RootStack] Props :", props);
    // const _navigationStateObj = NavigationService._navigatorRef;

    const { theme, dispatch } = props;
    let activeTheme = theme.lightMode ? theme.lightTheme : theme.darkTheme;
    let initialState = { keypaidOpen: false, loggedInUser: null,initRouteSub:null, initRoute: null, notchedScreen: StatusBar.currentHeight > 24 ? true : false }
    const [state, setState] = useState(initialState);
    const _keyboardShowDetecter = (keyboardState) => setState(prevState => ({ ...prevState, keypaidOpen: true }));
    const _keyboardHideDetecter = (keyboardState) => setState(prevState => ({ ...prevState, keypaidOpen: false }));
    const _keyboardShowHideDetecter = boolean => {setState(prevState => ({ ...prevState, keypaidOpen: boolean }));if(boolean === true){dispatch({type:UPDATE_MODAL_HEIGHT,payload:Dimensions.get('window').height * 0.5});}else{dispatch({type:UPDATE_MODAL_HEIGHT,payload:false});}}

    const handleBackButtonPressed = bool => {
        sharedConfirmationAlert("Confirm!", "Do you want to exit the app?", () => BackHandler.exitApp(), () => console.log('Cancel Pressed'));
        return true;
    };
    useEffect(() => {
        // console.log("[RootStack] Props :", props);
        // console.log("[_navigationStateObj] :", props);
        statusBarHandler();
        const getSetUserAsync = async () => {
            const User = JSON.parse(await AsyncStorage.getItem('User'));
            const checkIntroScreenView = await AsyncStorage.getItem("intro_screen_viewed");
            const appTutorialsEnabled = JSON.parse(await AsyncStorage.getItem("appTutorialsEnabled"));
            const appearOnTop = JSON.parse(await AsyncStorage.getItem("appearOnTop"));
            if (!User) {
                // For Demo
                // return setState({ ...state, loggedInUser: null, initRoute: checkIntroScreenView == 'true' ? "OTP" : "Introduction" });

                // For Dev and release
                if (Config.BUILD_TYPE === "debug" || Platform.OS === 'ios') {
                    return setState({ ...state, loggedInUser: null, initRoute: "Login" });
                } else {
                    return setState({ ...state, loggedInUser: null, initRoute: "Login" });
                    // return setState({ ...state, loggedInUser: null, initRoute: checkIntroScreenView == 'true' ? "OTP" : "Introduction" });
                }
            } else {
                console.log("user token obj :", User)
                getRequest(`/api/Vendor/Details`,
                // getRequest(`/api/User/Details`,
                    { "Authorization": "Bearer " + User.token.authToken },
                    dispatch,
                    async res => {
                        console.log('Res Details:',res,User);
                        setState({ ...state, loggedInUser: { ...res.data.userDetails, userID: User.token.id, tokenObj: User }, initRoute: 'Dashboard',initRouteSub:res.data.userDetails.pitstopType===4?'homeRes':'home' });
                        dispatch(userAction({ ...props.user, ...res.data.userDetails, userID: User.token.id, tokenObj: User, appTutorialsEnabled, appearOnTop }));
                        // sharedGetNotificationsHandler(postRequest, 1, 20, true, dispatch);
                        sharedHubConnectionInitiator(postRequest);
                    },
                    err => {
                        console.log("Problem is here--- :", JSON.stringify(err))
                        if (err) CustomToast.error("Something went wrong!")
                        setState({...state,initRoute:"Exceptions",initRouteSub:'home'})
                        // Commented line were creating an ambigous behaviour when logged in user open app after a while 
                        // if (err) setState({ ...state, loggedInUser: null, initRoute: "Login" });
                    },
                    '',
                    true,
                );
            }
        };
        getSetUserAsync();
        Keyboard.addListener('keyboardDidShow', () => _keyboardShowHideDetecter(true));
        Keyboard.addListener('keyboardDidHide', () => _keyboardShowHideDetecter(false));
        // const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackButtonPressed);
        return () => {
            console.log('RootStack State Clearing...');
            dispatch(closeModalAction());
            sharedHubConnectionStopper();
            setIsForcePermissionLocDialogVisible(false);
            setIsForceTurnOnLocDialogVisible(false);
            // backHandler.remove();
            Keyboard.removeListener('keyboardDidShow', _keyboardShowDetecter);
            Keyboard.removeListener('keyboardDidHide', _keyboardHideDetecter);
            console.log('RootStack State Cleared!');
        }
    }, []);
    useEffect(() => {
        // console.log("MainDrawer.useEffect -> push notification effect ran---");
        // console.log("MainDrawer.Props :", props);
        if (Platform.OS === 'android') {
            fcmService.registerAppWithFCM();
            fcmService.register(onRegister, onNotification, onOpenNotification)
            localNotificationService.configure(onOpenNotification, onAction, onRegistrationError);
            function onRegister(token) {
                console.log('[navigations.js] onRegister token :', token);
                sharedSendFCMTokenToServer(postRequest, token);
            };
            function onNotification(notify) {
                console.log("onNotification.notify -> ", notify)
                console.log("MainDrawer.Props :", props);
                localNotificationService.showNotification(0, notify.title, notify.body, notify, {
                    // soundName: "my_sound.mp3",
                    // playSound: true,
                    userInteraction: true,
                },
                    // actions array
                    []
                )
            };
            function onOpenNotification(notify) {
                console.log("onOpenNotification.notify -> ", notify)
                // if(notify.title && notify.title.toLowerCase().includes('recieved')){
                //     props.navigation.navigate('Orders');
                // }
                // console.log("MainDrawer.Props :", props);
                // if (notify.body) Alert.alert("Open Notification: ", notify.body);
            };
            function onAction(notification) {
                console.log("[navigations] ACTION:", notification.action);
                console.log("[navigations] NOTIFICATION:", notification);
            };
            function onRegistrationError(err) {
                console.error("[navigations] onRegistrationError :", err.message, err);
            };
            return () => {
                console.log('[MainDrawer] cleared!!');
                localNotificationService.unRegister();
                fcmService.unRegister();
            }
        }

    }, [])
    // console.log("myhubConnection :", myhubConnection);
    // console.log('RootStack.state :', state);
    return state.initRoute && (
        (APP_MODE === MODES.CUSTOMER) ?
            <Stack.Navigator initialRouteName={state.initRoute} mode="card" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Introduction" children={navigatorPros => <View style={{ flex: 1 }}><ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><IntroScreen {...state} {...navigatorPros} {...props} activeTheme={activeTheme} /></ImageBackground></View>} />
                <Stack.Screen name="OTP" children={navigatorPros => <OtpScreen {...state}  {...navigatorPros} {...props} activeTheme={activeTheme} behavior={Platform.OS === 'ios' ? 'padding' : null} />} />
                <Stack.Screen name="Code" children={navigatorPros => <OtpCode {...state} {...navigatorPros} {...props} activeTheme={activeTheme} behavior={Platform.OS === 'ios' ? 'padding' : null} />} />
                <Stack.Screen name="Email_Otp_verify" children={navigatorPros => <EmailOtpVerify {...state} {...navigatorPros} {...props} activeTheme={activeTheme} behavior={Platform.OS === 'ios' ? 'padding' : null} />} />
                <Stack.Screen name="Reset_Password" children={navigatorPros => <View style={{ flex: 1 }}><ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><ResetPassword {...state} {...navigatorPros} {...props} activeTheme={activeTheme} behavior={Platform.OS === 'ios' ? 'padding' : null} /></ImageBackground></View>} />
                {/* <Stack.Screen name="Registration" children={navigatorPros => <View style={{ flex: 1 }}><ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><UserRegister {...state} {...navigatorPros} {...props} activeTheme={activeTheme} behavior={Platform.OS === 'ios' ? 'padding' : null} /></ImageBackground></View>} /> */}
                <Stack.Screen name="Login" children={navigatorPros => <View style={{ flex: 1 }}><ImageBackground source={require('../assets/signInRess.png')} style={{ flex: 1,paddingBottom:30 }} resizeMode={'stretch'}><SignIn {...state}  {...state}{...navigatorPros} activeTheme={activeTheme} {...props} behavior={Platform.OS === 'ios' ? 'padding' : null} /></ImageBackground></View>} />
                {/* <Stack.Screen name="Login" children={navigatorPros => <View style={{ flex: 1 }}><SignIn {...state}  {...state}{...navigatorPros} activeTheme={activeTheme} {...props} behavior={Platform.OS === 'ios' ? 'padding' : null} /></View>} /> */}
                <Stack.Screen name="ExistLogin" children={navigatorPros => <View style={{ flex: 1 }}><ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><SignIn {...state} {...navigatorPros} activeTheme={activeTheme} {...props} behavior={Platform.OS === 'ios' ? 'padding' : null} /></ImageBackground></View>} />
                {/* <Stack.Screen name="Dashboard" children={navigatorPros => <MainDrawer {...navigatorPros} stackState={state} {...props} activeTheme={activeTheme} />} /> */}
                <Stack.Screen name="Dashboard" children={navigatorPros => <VendorRoutes navigatorPros={navigatorPros} stackState={state} {...props} activeTheme={activeTheme} />} />
                {/* <Stack.Screen name="Dashboard" children={navigatorPros => <Home {...navigatorPros} stackState={state} {...props} activeTheme={activeTheme} />} /> */}
                {/* <Stack.Screen name="Products" children={navigatorPros => <Products {...navigatorPros} stackState={state} {...props} activeTheme={activeTheme} />} /> */}
                <Stack.Screen name="Exceptions" children={navigatorPros => <View><Text>error</Text></View>} />
            </Stack.Navigator>
            :
            <Stack.Navigator initialRouteName={state.initRoute} mode="card" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Introduction" children={navigatorPros => <View style={{ flex: 1 }}><ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><IntroScreen {...state} {...navigatorPros} {...props} activeTheme={activeTheme} /></ImageBackground></View>} />
                <Stack.Screen name="OTP" children={navigatorPros => <OtpScreen {...state}  {...navigatorPros} {...props} activeTheme={activeTheme} behavior={Platform.OS === 'ios' ? 'padding' : null} />} />
                <Stack.Screen name="Code" children={navigatorPros => <OtpCode {...state} {...navigatorPros} {...props} activeTheme={activeTheme} behavior={Platform.OS === 'ios' ? 'padding' : null} />} />
                <Stack.Screen name="Email_Otp_verify" children={navigatorPros => <EmailOtpVerify {...state} {...navigatorPros} {...props} activeTheme={activeTheme} behavior={Platform.OS === 'ios' ? 'padding' : null} />} />
                <Stack.Screen name="Reset_Password" children={navigatorPros => <View style={{ flex: 1 }}><ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><ResetPassword {...state} {...navigatorPros} {...props} activeTheme={activeTheme} behavior={Platform.OS === 'ios' ? 'padding' : null} /></ImageBackground></View>} />
                <Stack.Screen name="Registration" children={navigatorPros => <View style={{ flex: 1 }}><ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><UserRegister {...state} {...navigatorPros} {...props} activeTheme={activeTheme} behavior={Platform.OS === 'ios' ? 'padding' : null} /></ImageBackground></View>} />
                <Stack.Screen name="Login" children={navigatorPros => <View style={{ flex: 1 }}><ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><SignIn {...state}  {...state}{...navigatorPros} activeTheme={activeTheme} {...props} behavior={Platform.OS === 'ios' ? 'padding' : null} /></ImageBackground></View>} />
                <Stack.Screen name="ExistLogin" children={navigatorPros => <View style={{ flex: 1 }}><ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><SignIn {...state} {...navigatorPros} activeTheme={activeTheme} {...props} behavior={Platform.OS === 'ios' ? 'padding' : null} /></ImageBackground></View>} />
                <Stack.Screen name="Dashboard" children={navigatorPros => <MainDrawer  {...navigatorPros} stackState={state}  {...props} activeTheme={activeTheme} />} />
            </Stack.Navigator>
    )
};
const mapStateToProps = (store) => {
    return {
        theme: store.themeReducer,
        user: store.userReducer,
        enums: store.enumsReducer,
        footerNavReducer: store.footerNavReducer,
    }
};

export default connect(mapStateToProps)(RootStack);