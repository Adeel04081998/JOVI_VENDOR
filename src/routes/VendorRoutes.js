import React, { useEffect, useState } from 'react';
import { ImageBackground, View, Platform, Keyboard, BackHandler, StatusBar, Text } from 'react-native';
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
import { setIsForceTurnOnLocDialogVisible, setIsForcePermissionLocDialogVisible, sharedHubConnectionInitiator, sharedHubConnectionStopper, statusBarHandler, sharedGetNotificationsHandler } from '../utils/sharedActions';
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
import { createDrawerNavigator } from '@react-navigation/drawer';


// import jwt_decode from 'jwt-decode';
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const VendorRoutes = (props) => {
    // console.log("[RootStack] Props :", props);
    // const _navigationStateObj = NavigationService._navigatorRef;

    const { theme, dispatch } = props;
    let activeTheme = theme.lightMode ? theme.lightTheme : theme.darkTheme;

    const handleBackButtonPressed = bool => {
        props.navigatorPros.navigation.goBack();
        // sharedConfirmationAlert("Confirm!", "Do you want to exit the app?", () => BackHandler.exitApp(), () => console.log('Cancel Pressed'));
        return true;
    };
    useEffect(() => {
        // console.log("[RootStack] Props :", props);
        // const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackButtonPressed);
        return()=>{
            // backHandler.addEventListener("hardwareBackPress",()=>{});
            // backHandler.remove();
        };
        // const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackButtonPressed);
        return () => {
            console.log('RootStack State Clearing...');
        }
    }, []);
    return (
        <Drawer.Navigator
        initialRouteName={"home" }
        
        >

            <Drawer.Screen name={'home'}  children={drawerProps =><Stack.Navigator initialRouteName={'homee'} mode="card" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="homee" drawerProps={drawerProps} children={navigatorPros => <Home {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
                <Stack.Screen name="Products"   drawerProps={drawerProps} children={navigatorPros => <Products {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
                <Stack.Screen name="Exceptions"  drawerProps={drawerProps} children={navigatorPros => <View><Text>error</Text></View>} />
            </Stack.Navigator>} />
        </Drawer.Navigator>
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

export default connect(mapStateToProps)(VendorRoutes);