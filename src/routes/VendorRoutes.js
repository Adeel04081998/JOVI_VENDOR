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


// import jwt_decode from 'jwt-decode';
// const Drawer = createDrawerNavigator();
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
        // console.log("[RootStack] Props :", props);
        // const backHandler = 
        // const backHandler = BackHandler.removeEventListener("hardwareBackPress", ()=>{});
        return () => {
            // backHandler.addEventListener("hardwareBackPress",()=>{});
            // _unsubscribeSiFocus();
            // _unsubscribeSiBlur();
            // BackHandler.removeEventListener('hardwareBackPress', handleBackButtonPressed);
            // backHandler.remove();
        };
        // const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackButtonPressed);
        return () => {
            console.log('RootStack State Clearing...');
        }
    }, []);
    return (
        <Stack.Navigator initialRouteName={'home'} mode="card" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" children={navigatorPros => <Home {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="Products" children={navigatorPros => <Products {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="Items" children={navigatorPros => <Items {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="Orders" children={navigatorPros => <Orders {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="OrderDetails" children={navigatorPros => <OrderDetails {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} />} />
            <Stack.Screen name="ContactUsPage" children={navigatorPros => <ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }}><ContactUsPage {...navigatorPros} stackState={props.stackState} {...props} activeTheme={props.activeTheme} /></ImageBackground>} />
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