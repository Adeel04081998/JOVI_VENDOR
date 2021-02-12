import React, { Fragment, useState } from 'react';
import { View, Image, Text, ImageBackground } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import styles from './styles';
import selectedStar from '../assets/selected-star.png';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { renderPicture, setFloatingAmountOnServer, sharedIsRiderApproved, sharedlogoutUser } from '../utils/sharedActions';
import { DEVICE_SCREEN_HEIGHT, EMPTY_PROFILE_URL, isJoviCustomerApp } from '../config/config';
import Spinner from 'react-native-spinkit';
import waitIcon from '../assets/svgIcons/rider/waitIcon.svg';
import errorIcon from '../assets/svgIcons/rider/errorIcon.svg';
import { SvgXml } from 'react-native-svg';
import { postRequest } from '../services/api';
import { userAction } from '../redux/actions/user';
import CustomTabs from '../components/tabs/Tab';
import commonStyles from '../styles/styles';
import AsyncStorage from '@react-native-community/async-storage';
function DrawerContent(props) {
    // console.log("DrawerContent.Props :", props);

    let initState = {
        "isLoading": true,
        "childItems": [],
        "childeItemIndex": null,
        "activeLanguageTab": 0

    };
    const [state, setState] = useState(initState);

    // console.log("DrawerContent.Props :", props.U);
    let menuItems = isJoviCustomerApp ?
        [{ name: "Home", route: 'home' }, { name: "My Orders", route: 'orders_stack' }, { name: "Wallet", route: 'wallet_container' }, { name: "Goody Bag", route: 'goody_bag_container' }, { name: "My Addresses", route: 'addresses_container' }, { name: "Assistance", route: 'complaints_feedback_container' }, { name: "Help", route: 'help_faq_stack' }, { name: "Logout", route: null }]
        :
        // [{ name: "Home", route: 'rider_docs_stack', childItems: [] }, { name: "Documents", route: 'documents_stack', childItems: [{ name: "Update Vehicle Info", route: 'update_vehicle_info' }, { name: "Update ID Card", route: 'update_id_card' }, { name: "Update License", route: 'update_license' }] }, { name: "Logout", route: 'Login', childItems: [] }];
        sharedIsRiderApproved(props?.U) ?
            [{ name: "Home", route: 'rider_order_stack', childItems: [] }, { name: "Promotions", route: 'rider_promotions_stack', childItems: [] }, { name: "Documents", route: 'rider_docs_approved_stack', childItems: [] }, { name: "Booking History", route: 'orders_stack', childItems: [] }, { name: "Earnings", route: 'rider_earnings_stack', childItems: [] }, { name: "How it works", route: 'rider_how_it_works_stack', childItems: [] }, { name: "Contact Us", route: 'rider_contact_stack', childItems: [] }, { name: "Go Offline", route: null, childItems: [], hidden: (props?.U?.isActive && !props?.U?.orderID ? false : true) }, { name: "Logout", route: null, childItems: [], hidden: (!props?.U?.orderID ? false : true) }]
            :
            [{ name: "Home", route: 'rider_docs_stack', childItems: [] }, { name: "Logout", route: null, childItems: [] }]

    // let footerItems = isJoviCustomerApp ? [{ name: "Settings", route: 'settings_container' }, { name: 'Legal', route: 'legal_stack' }] : [{ name: 'Legal', route: 'legal_stack' }]
    let footerItems = [{ name: "Settings", route: 'settings_container' }, { name: 'Legal', route: 'legal_stack' }]
    const routesHandler = (row, index) => {
        if (row.name === "Logout") {
            return (
                (isJoviCustomerApp) ?
                    sharedlogoutUser(props.navigation, postRequest, props.dispatch, props?.U, false)
                    :
                    (props?.U?.isActive) ?
                        setRiderStatusAsOffline(() => sharedlogoutUser(props.navigation, postRequest, props.dispatch, props?.U, false))
                        :
                        sharedlogoutUser(props.navigation, postRequest, props.dispatch, props?.U, false)
            );
        }
        else if (row.name === "Go Offline") {
            return (
                setRiderStatusAsOffline(() => props.navigation.reset({ routes: [{ name: 'rider_order_stack', params: {} }] }))
            );
        }
        else if (row.childItems?.length) {
            setState(pre => {
                if (pre.childeItemIndex === index && pre.childItems.length) return { ...pre, childItems: [], childeItemIndex: null }
                else return { ...pre, childItems: row.childItems, childeItemIndex: index }
            });
        }
        // else props.navigation.navigate(row.route);
        else props.navigation.reset({ routes: [{ name: row.route }] });
    };
    const renderChildItems = () => {
        return state.childItems.map((childMenu, k) => (
            <View style={{ left: 10 }} key={k}>
                <DrawerItem label={childMenu.name} inactiveTintColor="#fff" style={styles.drawerContentItems} onPress={() => { }} />
            </View>
        ))
    };
    const renderProfileView = () => {
        if (!isJoviCustomerApp) {
            if (props.U.picStatus === 3 || props.U.picStatus === 0) {
                return <ImageBackground source={{ uri: props.U && props.U.isLocalChange ? props.U.picture : props.U && props.U.picture !== undefined ? renderPicture(props.U.picture, props.U.tokenObj && props.U.tokenObj.token.authToken) : EMPTY_PROFILE_URL }} style={{ ...styles.headerImage, justifyContent: "center", alignItems: "center" }} borderRadius={25} resizeMode="cover" onLoadStart={() => setState(prevState => ({ ...prevState, isLoading: true }))} onLoadEnd={() => setState(prevState => ({ ...prevState, isLoading: false }))}>
                    <Spinner isVisible={state.isLoading} size={30} type="Circle" color={props.activeTheme.white} />
                </ImageBackground>
            } else {
                return <ImageBackground source={{ uri: props.U && props.U.isLocalChange ? props.U.picture : props.U && props.U.picture !== undefined ? renderPicture(props.U.picture, props.U.tokenObj && props.U.tokenObj.token.authToken) : EMPTY_PROFILE_URL }} style={{ ...styles.headerImage, justifyContent: "center", alignItems: "center" }} borderRadius={25} resizeMode="cover" onLoadStart={() => setState(prevState => ({ ...prevState, isLoading: true }))} onLoadEnd={() => setState(prevState => ({ ...prevState, isLoading: false }))}>
                    <SvgXml xml={props.U.picStatus === 1 ? waitIcon : errorIcon} height={20} width={20} />
                </ImageBackground>

            }
        } else {
            return <ImageBackground source={{ uri: props.U && props.U.isLocalChange ? props.U.picture : props.U && props.U.picture !== undefined ? renderPicture(props.U.picture, props.U.tokenObj && props.U.tokenObj.token.authToken) : EMPTY_PROFILE_URL }} style={{ ...styles.headerImage, justifyContent: "center", alignItems: "center" }} borderRadius={25} resizeMode="cover" onLoadStart={() => setState(prevState => ({ ...prevState, isLoading: true }))} onLoadEnd={() => setState(prevState => ({ ...prevState, isLoading: false }))}>
                <Spinner isVisible={state.isLoading} size={30} type="Circle" color={props.activeTheme.white} />
            </ImageBackground>
        };
    };
    // console.log('DEVICE_SCREEN_HEIGHT :', DEVICE_SCREEN_HEIGHT)

    const setRiderStatusAsOffline = (next) => {
        // props?.U?.userID &&
            // postRequest(
            //     'api/User/Rider/ChangeOnlineStatus',
            //     {
            //         "riderID": props.U.userID,
            //         "activate": false
            //     },
            //     null,
            //     props.dispatch,
            //     (response) => {
            //         setFloatingAmountOnServer(0, postRequest, props.dispatch, () => {
            //             props.dispatch(userAction({ ...props.U, isActive: false, floatingAmount: 0 }));
            //             next && next();
            //         });
            //     },
            //     (error) => {
            //         console.log(((error?.response) ? error.response : {}), error);
            //     },
            //     true
            // );
    };


    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
            {/* <DrawerItemList {...state}> */}
            <View style={{ ...styles.headerView, bottom: 15 }}>
                <TouchableOpacity onPress={() => props.navigation.navigate("profile_container")}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <DrawerItem style={{ maxWidth: 60 }} label={() => renderProfileView()} />

                        <View style={{ top: 0 }}>
                            <Text style={{ color: '#fff' }}>{`${props.U && props.U.firstName} ${props.U && props.U.lastName} `}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: '#fff' }}>{props.U && props.U.rating + '.0'} </Text>
                                <Image source={selectedStar} style={{ height: 15, width: 15, left: 5 }} />
                            </View>
                        </View>

                    </View>
                </TouchableOpacity>
                {
                    isJoviCustomerApp ? null :
                        <View style={{
                            maxWidth: 100,
                            left: 5,
                            bottom: 5
                        }}>
                            <CustomTabs
                                tabsArr={['ENG', 'URDU']}
                                activeTheme={props.activeTheme}
                                activeTab={state.activeLanguageTab}
                                tabHandler={tabIndex => setState(pre => ({ ...pre, activeLanguageTab: tabIndex }))}
                                tabsContainerStyles={{ top: 0, minHeight: 30, margin: 5, borderRadius: 20 }}
                                tabsViewStyles={{ borderRadius: 20 }}
                                tabTextStyles={{ fontSize: 11, fontFamily: commonStyles.fontStyles(undefined, undefined, 1).fontFamily, activeTextColor: props.activeTheme.white, inActiveTextColor: props.activeTheme.default }}
                            />
                        </View>
                }
            </View>
            <View style={styles.contentView}>
                {
                    (menuItems || []).map((m, i) => (
                        <Fragment key={i}>
                            <DrawerItem label={m.name} inactiveTintColor="#fff" style={{ ...styles.drawerContentItems, height: DEVICE_SCREEN_HEIGHT <= 640 ? 35 : 40, justifyContent: 'center', display: (m.hidden ? "none" : "flex") }} onPress={() => routesHandler(m, i)} />
                            {
                                (state.childItems.length > 0 && m.childItems.length > 0 && state.childeItemIndex === i) ? renderChildItems() : null
                            }
                        </Fragment>
                    ))
                }
            </View>
            <View style={styles.drawerFooterView}>
                {
                    (footerItems || []).map((f, i) => <DrawerItem label={f.name} inactiveTintColor="#fff" key={i} style={styles.drawerFooterItems} onPress={() => routesHandler(f)} />)
                }
            </View>
            {/* </DrawerItemList> */}
        </DrawerContentScrollView >
    )
};
const mapStateToProps = (store) => {
    return {
        U: store.userReducer
    }
};
export default connect(mapStateToProps)(DrawerContent);
