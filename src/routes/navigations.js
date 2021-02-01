import React, { useEffect } from 'react';
import { Platform, Dimensions, StyleSheet, ImageBackground, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '../screens/home/Home';
import CustomerOrder from '../screens/customerorder/CustomerOrder';
import DrawerContent from './DrawerContent';
import RiderDocs from '../screens/rider/docs/RiderDocs';
import RiderOrder from '../screens/rider/riderorder/RiderOrder';
import RiderDocsApproved from '../screens/rider/docs/RiderDocsApproved';
import ComplaintsFeedback from '../screens/assistance/Complaints';
import ComplaintDetailsList from '../screens/assistance/ComplaintsDetailList';
import HelpFaqs from '../screens/help_faqs/HelpFaqs';
import FaqDetailsList from '../screens/help_faqs/FaqDetailsList';
import WalletContainer from '../screens/wallet/Container';
import SelectDropofLocation from '../screens/wallet/SelectDropofLocation';
import Legal from '../screens/legal/Legal';
import LegalDetails from '../screens/legal/LegalDetails';
import OrdersContainer from '../screens/orders/OrdersContainer';
import OrdersHistoryDetails from '../screens/orders/OrderHistoryDetails';
import { useFocusEffect } from '@react-navigation/native';
import Promotions from '../screens/goody_bag/Promotions';
import Invite from '../screens/goody_bag/Invite';
import Profile from '../screens/profile/Profile';
import MapLocationPicker from '../components/mapLocationPicker/MapLocationPicker';
import { sharedSendFCMTokenToServer, statusBarHandler } from '../utils/sharedActions';
import Animated from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import AddressesList from '../screens/addresses/AddressesList';
import AddOrEditAddress from '../screens/addresses/AddOrEditAddress';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { APP_MODE, MODES } from '../config/config';
import RiderContactUs from '../screens/rider/contact/ContactUs';
import RiderPromotions from '../screens/rider/promotions/RiderPromotions';
import RiderEarnings from '../screens/rider/earnings/Earnings';
import HowItWroks from '../screens/rider/howItWorks/HowItWroks';
import CustomWebView from '../components/webView';
import crossIcon from "../assets/svgIcons/common/cross-new.svg";
import CustomHeader from '../components/header/CustomHeader';
import { SuperMarketHome, ProductDetails } from '../screens/super_market';
import Cart from '../screens/customer_cart/Cart';
import Checkout from '../screens/super_market/checkout/Checkout';
import { localNotificationService } from '../services/LocalNotificationServices';
import { fcmService } from '../services/FCMServices';
import { postRequest } from '../services/api';
import HomeVendor from '../screens/home/HomeVendor';

// console.log('DrawerNavigationProp :', DrawerNavigationProp)
// let check = DrawerNavigationProp
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const ComplaintFeedbackStack = props => {
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="complaints_feedback">
                <Stack.Screen name="complaints_feedback" options={props.options} children={stackNavigationProps => <ComplaintsFeedback {...stackNavigationProps} {...props} drawerProps={props.drawerProps} />} />
                <Stack.Screen name={'complaint_details'} options={props.options} children={stackNavigationProps => <ComplaintDetailsList {...stackNavigationProps} {...props} drawerProps={props.drawerProps} />} />
            </Stack.Navigator>
        </Animated.View>
    )
};
const HelpFaqsStack = props => {
    // const { screenTitle } = props;
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="help_faqs" >
                <Stack.Screen name="help_faqs" options={props.options} children={helpStackProps => <HelpFaqs {...props} {...helpStackProps} drawerProps={props.drawerProps} />} />
                <Stack.Screen name={'faqs_details'} options={props.options} children={helpStackProps => <FaqDetailsList {...props} {...helpStackProps} drawerProps={props.drawerProps} />} />
            </Stack.Navigator>
        </Animated.View>
    )
};
const LegalStack = props => {
    // console.log('LegalStack :', props); 
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="legal">
                <Stack.Screen name="legal" options={props.options} children={navigationProps => <Legal {...navigationProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
                <Stack.Screen name={'legal_details'} options={props.options} children={navigationProps => <LegalDetails {...navigationProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
            </Stack.Navigator>
        </Animated.View>
    )
};
const OrdersStack = props => {
    // console.log('OrdersStack.Props :', props);
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>

            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="orders_container">
                <Stack.Screen name="orders_container" options={props.options} children={navigationProps => <OrdersContainer {...props} {...navigationProps} activeTheme={props.activeTheme} {...props.stackState} />} />
                <Stack.Screen name="order_history_details" options={props.options} children={navigationProps => <OrdersHistoryDetails {...props} {...navigationProps} {...props.stackState} activeTheme={props.activeTheme} />} />
            </Stack.Navigator>
        </Animated.View>
    )
};
const GoodyBagStack = props => {
    // console.log('OrdersStack.Props :', props);
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="promotions">
                <Stack.Screen name="promotions" options={props.options} children={navigationProps => <Promotions {...navigationProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
            </Stack.Navigator>
        </Animated.View>
    )
};
const InvitesStack = props => {
    // console.log('OrdersStack.Props :', props);
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="invites">
                <Stack.Screen name="invites" options={props.options} children={navigationProps => <Invite {...navigationProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
            </Stack.Navigator>
        </Animated.View>
    )
};
const WalletStack = props => {
    // console.log('OrdersStack.Props :', props);
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="wallet_child_container">
                <Stack.Screen name="wallet_child_container" options={props.options} children={navigationProps => <WalletContainer {...navigationProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
                <Stack.Screen name="select_dropof_location" options={props.options} children={navigationProps => <SelectDropofLocation {...navigationProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
            </Stack.Navigator>
        </Animated.View>
    )
};
const MapLocationPickerStack = props => {
    // console.log('OrdersStack.Props :', props);
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="map_location_picker">
                <Stack.Screen name="map_location_picker" options={props.options} children={navigationProps => <MapLocationPicker {...navigationProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
            </Stack.Navigator>
        </Animated.View>
    )
};
const AddressesStack = props => {
    // console.log('AddressesStack.Props :', props);
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="addresses_list">
                <Stack.Screen name="addresses_list" options={props.options} children={childProps => <AddressesList {...childProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
                <Stack.Screen name="addresses_add_update" options={props.options} children={childProps => <AddOrEditAddress {...childProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
            </Stack.Navigator>
        </Animated.View>
    )
};
const SettingsStack = props => {
    console.log('SettingsStack.Props :', props);
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="settings_child_container">
                <Stack.Screen name="settings_child_container" options={props.options} children={childProps => <SettingsScreen {...childProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
            </Stack.Navigator>
        </Animated.View>
    )
};
const HomeStack = props => {
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Home {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />
            {/* <HomeVendor {...props} /> */}
            {/* <Stack.Navigator
                initialRouteName="home"
                screenOptions={{
                    headerTransparent: true,
                    headerTitle: null,
                }}>
                <Stack.Screen name="home" options={props.options} children={childProps => <Home {...childProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
            </Stack.Navigator> */}
        </Animated.View >
    );
};
const ProfileStack = props => {
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="profile_container">
                <Stack.Screen name="profile_container" options={props.options} children={childProps => <Profile {...childProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />} />
            </Stack.Navigator>
        </Animated.View >
    );
};



// Rider Stacks

const RiderDocsStack = props => {
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="rider_docs"
            >
                <Stack.Screen name="rider_docs" component={RiderDocs} initialParams={{ dispatch: props.dispatch, activeTheme: props.activeTheme }} options={props.options} />
            </Stack.Navigator>
        </Animated.View>
    );
};
const RiderDocsApprovedStack = props => {
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="rider_docs_approved"
            >
                <Stack.Screen name="rider_docs_approved" component={RiderDocsApproved} initialParams={{ dispatch: props.dispatch, activeTheme: props.activeTheme }} options={props.options} />
            </Stack.Navigator>
        </Animated.View>
    );
};
const RiderOrderStack = props => {
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="rider_order"
            >
                <Stack.Screen name="rider_order" component={RiderOrder} initialParams={{ dispatch: props.dispatch, activeTheme: props.activeTheme }} options={props.options} />
            </Stack.Navigator>
        </Animated.View>
    );
};
const RiderContactUsStack = props => {
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="rider_contact_container"
            >
                <Stack.Screen name="rider_contact_container" options={props.options} children={childProps => <ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }} children={(<RiderContactUs {...childProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />)} />} />


            </Stack.Navigator>
        </Animated.View>
    );
};
const RiderPromotionsStack = props => {
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="rider_promotions_container"
            >
                <Stack.Screen name="rider_promotions_container" options={props.options} children={childProps => <ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }} children={(<RiderPromotions {...childProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />)} />} />


            </Stack.Navigator>
        </Animated.View>
    );
};
const RiderEarningsStack = props => {
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="rider_earnings_container"
            >
                <Stack.Screen name="rider_earnings_container" options={props.options} children={childProps => <ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }} children={(<RiderEarnings {...childProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />)} />} />


            </Stack.Navigator>
        </Animated.View>
    );
};
const RiderHowItWorksStack = props => {
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="rider_how_it_works_container"
            >
                <Stack.Screen name="rider_how_it_works_container" options={props.options} children={childProps => <ImageBackground source={require('../assets/doodle.png')} style={{ flex: 1 }} children={(<HowItWroks {...childProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} />)} />} />
            </Stack.Navigator>
        </Animated.View>
    );
};
const WebViewStack = props => {
    console.log("WebViewStack.Props :", props);
    let currentRoute = props.route.state.routes[props.route.state.index];
    console.log("WebViewStack.currentRoute", currentRoute);
    return (
        <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="web_view_container"
            >
                <Stack.Screen name="web_view_container" options={props.options} children={childProps => (
                    <View style={{ flex: 1 }}>
                        <CustomHeader
                            leftIconHandler={null}
                            rightIconHandler={currentRoute?.params?.backScreenObject ? () => props.navigation.navigate(currentRoute?.params?.backScreenObject?.container, { screen: currentRoute?.params?.backScreenObject?.screen }) : () => props.navigation.goBack()}
                            navigation={props.drawerProps.navigation}
                            leftIcon={null}
                            BodyComponent={() => <View />}
                            rightIcon={crossIcon}
                            activeTheme={props.activeTheme}
                            height={15}
                            width={15}
                        />
                        <View style={{ flex: 1 }}>
                            <CustomWebView {...childProps} {...props} drawerProps={props.drawerProps} activeTheme={props.activeTheme} html={currentRoute.params.html} uri={currentRoute.params.uri} screenStyles={currentRoute.params.screenStyles || {}} />
                        </View>
                    </View>
                )} />
            </Stack.Navigator>
        </Animated.View>
    );
};


const MainDrawer = props => {
    // console.log("MainDrawer.Props :", props);
    const { stackState, activeTheme } = props;
    let screenOpts = {
        headerShown: false,
        unmountOnBlur: true
    };
    const [progress, setProgress] = React.useState(new Animated.Value(0));
    const scale = Animated.interpolate(progress, {
        inputRange: [0, 1],
        outputRange: [1, 0.8],
    });
    const borderRadius = Animated.interpolate(progress, {
        inputRange: [0, 1],
        outputRange: [0, 12],
    });
    const animatedStyle = { borderRadius, transform: [{ scale }] };
    const bottomStacks = [
        {
            Stacks: [
                {
                    name: "dashboard", screenView: (propss) => <SuperMarketHome {...propss} />
                },
                {
                    name: "product_details", screenView: (propss) => <ProductDetails {...propss} />
                },
            ]
        },
        {
            Stacks: [
                {
                    name: "customer_cart", screenView: (propss) => <Cart {...propss} />
                },
                {
                    name: "customer_checkout", screenView: (propss) => <Checkout {...propss} />
                },
            ]
        },
    ];
    const bottomNavScreens = [
        {
            name: "super_market_home"
        },
        {
            name: "customer_cart_home"
        },
    ];
    useFocusEffect(() => {
        statusBarHandler();
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
                    soundName: "my_sound.mp3",
                    playSound: true,
                    userInteraction: true,
                },
                    // actions array
                    []
                )
            };
            function onOpenNotification(notify) {
                console.log("onOpenNotification.notify -> ", notify)
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
    const renderBottomStacks = (mainDrawerComponentProps, drawerProps, activeTheme, stackState, stackID) => {
        console.log("bottomStacksArr.mainDrawerComponentProps :", mainDrawerComponentProps)
        return <Animated.View style={StyleSheet.flatten([styles.stack, animatedStyle])}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={bottomStacks[stackID].Stacks[0].name}
            >
                {
                    bottomStacks[stackID].Stacks.map((row, componentIndex) => <Stack.Screen key={componentIndex} name={row.name} options={screenOpts} children={childProps => row.screenView({ drawerProps, mainDrawerComponentProps, activeTheme, stackState, stackID, childProps })} />)
                    // bottomStacks[stackID].Stacks.map((row, componentIndex) => <Stack.Screen key={componentIndex} name={row.name} options={screenOpts} children={childProps => (
                    //     <View style={{ flex: 1 }}>
                    //         <View style={{ backgroundColor: 'grey', height: 50 }}>
                    //             <Text>Header</Text>
                    //         </View>
                    //         <View style={{ flex: 1 }}>
                    //             {
                    //                 row.screenView({ drawerProps, mainDrawerComponentProps, activeTheme, stackState, stackID, childProps })
                    //             }
                    //         </View>
                    //     </View>
                    // )} />)

                }

            </Stack.Navigator>
        </Animated.View>
    };
    const renderBottomNavigatorScreens = (mainDrawerComponentProps, activeTheme, stackState) => bottomNavScreens.map((drawer, index) => <Drawer.Screen key={index} name={drawer.name} children={drawerProps => renderBottomStacks(mainDrawerComponentProps, drawerProps, activeTheme, stackState, index)} options={screenOpts} />)
    return (
        <LinearGradient style={{ flex: 1 }} colors={['#7359BE', '#B047E3']}>
            <Drawer.Navigator
                initialRouteName={APP_MODE === MODES.CUSTOMER ? "home" : "rider_docs_stack"}
                drawerType="slide"
                overlayColor={"transparent"}
                drawerStyle={{
                    flex: 1,
                    backgroundColor: "transparent",
                    // width: Dimensions.get('window').width * 0.5
                    width:'55%'
                }}
                contentContainerStyle={{ flex: 1 }}
                drawerContentOptions={{
                    activeBackgroundColor: 'transparent',
                    activeTintColor: 'white',
                    inactiveTintColor: 'white',
                }}
                sceneContainerStyle={{ backgroundColor: 'transparent' }}
                drawerContent={prevState => {
                    setProgress(prevState.progress);
                    return <DrawerContent {...props} navigationState={prevState} />
                }}
                openByDefault={false}
                drawerPosition="left"
                edgeWidth={100}
                screenOptions={{ swipeEnabled: true }}
            // minSwipeDistance={20}
            // hideStatusBar={true}
            // statusBarAnimation="slide"
            >

                {/* Customer Screens */}

                <Drawer.Screen name="home" children={drawerProps => <HomeStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} {...stackState} behavior={Platform.OS === 'ios' ? 'padding' : null} />} initialParams={{ dispatch: props.dispatch }} options={screenOpts} />
                <Drawer.Screen name="complaints_feedback_container" children={drawerProps => <ComplaintFeedbackStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} {...stackState} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={screenOpts} />
                <Drawer.Screen name="customer_order" component={CustomerOrder} initialParams={{ dispatch: props.dispatch, activeTheme: props.activeTheme }} options={screenOpts} />
                <Drawer.Screen name="help_faq_stack" children={drawerProps => <HelpFaqsStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={screenOpts} />
                <Drawer.Screen name="wallet_container" children={drawerProps => <WalletStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={{}} />
                <Drawer.Screen name="legal_stack" children={drawerProps => <LegalStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={screenOpts} />
                <Drawer.Screen name="orders_stack" children={drawerProps => <OrdersStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={screenOpts} />
                <Drawer.Screen name="goody_bag_container" children={drawerProps => <GoodyBagStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={screenOpts} />
                <Drawer.Screen name="invite_container" children={drawerProps => <InvitesStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={screenOpts} />
                <Drawer.Screen name="profile_container" children={drawerProps => <ProfileStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={screenOpts} />
                <Drawer.Screen name="addresses_container" children={drawerProps => <AddressesStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={{}} />
                <Drawer.Screen name="map_location_picker_container" children={drawerProps => <MapLocationPickerStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={screenOpts} />
                <Drawer.Screen name="settings_container" children={drawerProps => <SettingsStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} behavior={Platform.OS === 'ios' ? 'padding' : null} />} options={screenOpts} />

                {/* Super Market Screens */}
                {
                    renderBottomNavigatorScreens(props, activeTheme, stackState)
                }



                {/* Rider Screens */}

                <Drawer.Screen name="rider_docs_stack" children={drawerProps => <RiderDocsStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} />} options={screenOpts} />
                <Drawer.Screen name="rider_docs_approved_stack" children={drawerProps => <RiderDocsApprovedStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} />} options={screenOpts} />
                <Drawer.Screen name="rider_order_stack" children={drawerProps => <RiderOrderStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} />} options={screenOpts} />
                <Drawer.Screen name="rider_contact_stack" children={drawerProps => <RiderContactUsStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} />} options={screenOpts} />
                <Drawer.Screen name="rider_promotions_stack" children={drawerProps => <RiderPromotionsStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} />} options={screenOpts} />
                <Drawer.Screen name="rider_earnings_stack" children={drawerProps => <RiderEarningsStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} />} options={screenOpts} />
                <Drawer.Screen name="rider_how_it_works_stack" children={drawerProps => <RiderHowItWorksStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} />} options={screenOpts} />
                <Drawer.Screen name="web_view_container" children={drawerProps => <WebViewStack style={animatedStyle} drawerProps={drawerProps} activeTheme={activeTheme} {...props} stackState={stackState} options={screenOpts} />} options={screenOpts} />

            </Drawer.Navigator>
        </LinearGradient>

    );
};
const styles = StyleSheet.create({
    stack: {
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        elevation: 7,
        overflow: "hidden",

    },
});
export default MainDrawer; 
