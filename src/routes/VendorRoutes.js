import React, { useEffect, useState } from 'react';
import { ImageBackground, View, Platform, Keyboard, BackHandler, StatusBar, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';
import Home from '../screens/home/Home';
import Products from '../screens/Products/Products';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Items from '../screens/Items/Items';
import Orders from '../screens/order/Orders';
import OrderDetails from '../screens/order/OrderDetails';
import ContactUsPage from '../screens/contactUs/ContactUs';
import RestaurantHome from '../screens/home/RestaurantHome';
import RestaurantDeals from '../screens/Products/RestaurantDeals';
import RestaurantProducts from '../screens/Products/RestaurantProducts';
import ResOrderDetails from '../screens/order/ResOrderDetails';
import crossIcon from "../assets/svgIcons/common/cross-new.svg";
import CustomHeader from '../components/header/CustomHeader';
import CustomWebView from '../components/webView';
import { fcmService } from '../services/FCMServices';
import { localNotificationService } from '../services/LocalNotificationServices';
import Legal from '../screens/legal/Legal';
import { sharedSendFCMTokenToServer } from '../utils/sharedActions';
import { postRequest } from '../services/api';

// import jwt_decode from 'jwt-decode';
// const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const VendorRoutes = (props) => {
    console.log("[RootStack] Props :", props.stackState.initRouteSub);
    console.log(props.navigatorPros.navigation.dangerouslyGetState());
    let state = props.navigatorPros.navigation.dangerouslyGetState();

    let routeBase = state.routes[0]?.params?.loginCheck === true ? (state.routes[0]?.params?.pitstopType === 4 ? 'homeRes' : 'home') : props.stackState.initRouteSub === null ? props.user.pitstopType === 4 ? 'homeRes' : 'home' : props.stackState.initRouteSub;
    // const _navigationStateObj = NavigationService._navigatorRef;

    const { theme, dispatch } = props;
    let activeTheme = theme.lightMode ? theme.lightTheme : theme.darkTheme;
    const WebViewStack = props => {
        console.log("WebViewStack.Props :", props);
        let currentRoute = props?.drawerProps?.route;
        console.log("WebViewStack.currentRoute", currentRoute);
        useEffect(() => {
        }, []);
        return (
            <View style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={currentRoute?.params?.backScreenObject ? () => props.navigation.navigate(currentRoute?.params?.backScreenObject?.container, { screen: currentRoute?.params?.backScreenObject?.screen }) : () => props.drawerProps.navigation.goBack()}
                    rightIconHandler={null}
                    navigation={props.navigation}
                    leftIcon={crossIcon}
                    BodyComponent={() => <View />}
                    rightIcon={null}
                    activeTheme={props.activeTheme}
                    height={15}
                    width={15}
                />
                <View style={{ flex: 1 }}>
                    <CustomWebView {...props} activeTheme={props.activeTheme} html={currentRoute?.params.html} uri={currentRoute?.params.uri} screenStyles={currentRoute?.params.screenStyles || {}} />
                </View>
            </View>
        );
    };
    const handleBackButtonPressed = bool => {
        props.navigatorPros.navigation.goBack();
        // sharedConfirmationAlert("Confirm!", "Do you want to exit the app?", () => BackHandler.exitApp(), () => console.log('Cancel Pressed'));
        return true;
    };
    // this._unsubscribeSiFocus = props.navigatorPros.navigation.addListener('focus', e => {
    //     console.warn('focus signIn');
    //     BackHandler.addEventListener('hardwareBackPress', handleBackButtonPressed);
    // });
    // this._unsubscribeSiBlur = props.navigatorPros.navigation.addListener('blur', e => {
    //     console.warn('blur signIn');
    //     BackHandler.removeEventListener(
    //         'hardwareBackPress',
    //         handleBackButtonPressed,
    //     );
    // });
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
                localNotificationService.createChannel();
            };
            function onNotification(notify) {
                // console.log("onNotification.notify -> ", notify)
                console.log("MainDrawer.Props :", props);
                // debugger;
                // notify?.android?.setsound('my_sound.mp3');

                // if(notify.notification){

                // }else{
                //     notify={
                //         ...notify,
                //         notification:{
                //             ...notify,
                //             // sound:'android.resource://com.jovivendors/raw/my_sound.mp3',
                //             // soundName:'android.resource://com.jovivendors/raw/my_sound.mp3'
                //         }
                //     }
                // }
                console.log("onNotification.notify -> ", notify)
                localNotificationService.showNotification(10, notify.notification.title, notify.notification.body, notify, {
                    soundName: Platform.select({ android: "my_sound.mp3", ios: "default" }),
                            sound:'android.resource://com.jovivendors/raw/my_sound.mp3',
                            playSound: true,
                    userInteraction: true,
                },
                    // actions array
                    []
                )
            };
            function onOpenNotification(notify) {
                console.log("onOpenNotification.notify -> ", notify)
                if(notify && notify.title){
                    if(notify.title.toString().toLowerCase().includes('recieved')){
                        props.navigatorPros.navigation?.navigate('Orders');
                    }
                }
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
    // useEffect(() => {
    //     // console.log("[RootStack] Props :", props);
    //     // const backHandler = 
    //     // const backHandler = BackHandler.removeEventListener("hardwareBackPress", ()=>{});
    //     return () => {
    //         // backHandler.addEventListener("hardwareBackPress",()=>{});
    //         // _unsubscribeSiFocus();
    //         // _unsubscribeSiBlur();
    //         // BackHandler.removeEventListener('hardwareBackPress', handleBackButtonPressed);
    //         // backHandler.remove();
    //     };
    // }, []);
    return (
        <Stack.Navigator initialRouteName={routeBase} mode="card" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" children={navigatorPros => <Home {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="homeRes" children={navigatorPros => <RestaurantHome {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="Products" children={navigatorPros => <Products {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="ProductsRes" children={navigatorPros => <RestaurantProducts {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="RestaurantDeals" children={navigatorPros => <RestaurantDeals {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="Items" children={navigatorPros => <Items {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="Orders" children={navigatorPros => <Orders {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="OrderDetails" children={navigatorPros => <OrderDetails {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="ResOrderDetails" children={navigatorPros => <ResOrderDetails {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="ContactUsPage" children={navigatorPros => <ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><ContactUsPage {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} /></ImageBackground>} />
            <Stack.Screen name="Legal" children={navigatorPros => <Legal {...navigatorPros} stackState={state} {...props} activeTheme={activeTheme} />} />
            <Stack.Screen name="web_view_container" children={navigatorPros => <WebViewStack drawerProps={navigatorPros} activeTheme={activeTheme} {...props} stackState={state} />} />
            <Stack.Screen name="Exceptions" children={navigatorPros => <View><Text>error</Text></View>} />
        </Stack.Navigator>
    )
};
// <Drawer.Navigator
// initialRouteName={"home" }

// >

//     <Drawer.Screen name={'home'}  children={drawerProps =><Stack.Navigator initialRouteName={'homee'} mode="card" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="homee" drawerProps={drawerProps} children={navigatorPros => <Home {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
//         <Stack.Screen name="Products"   drawerProps={drawerProps} children={navigatorPros => <Products {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
//         <Stack.Screen name="Items"   drawerProps={drawerProps} children={navigatorPros => <Items {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
//         <Stack.Screen name="Orders"   drawerProps={drawerProps} children={navigatorPros => <Orders {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
//         <Stack.Screen name="OrderDetails"   drawerProps={drawerProps} children={navigatorPros => <OrderDetails {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
//         <Stack.Screen name="ContactUsPage"   drawerProps={drawerProps} children={navigatorPros => <ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><ContactUsPage {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} /></ImageBackground>} />
//         <Stack.Screen name="Exceptions"  drawerProps={drawerProps} children={navigatorPros => <View><Text>error</Text></View>} />
//     </Stack.Navigator>} />
// </Drawer.Navigator>
const mapStateToProps = (store) => {
    return {
        theme: store.themeReducer,
        user: store.userReducer,
        enums: store.enumsReducer,
        footerNavReducer: store.footerNavReducer,
    }
};

export default connect(mapStateToProps)(VendorRoutes);