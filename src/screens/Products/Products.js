import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, Alert, TouchableOpacity, ScrollView, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { hybridLocationPermission, navigateWithResetScreen, renderPicture, sharedCommasAmountConveter, sharedConfirmationAlert, sharedGetUserCartHandler } from "../../utils/sharedActions";
import AsyncStorage from '@react-native-community/async-storage';
import { calculateTimeDifference } from "../../utils/sharedActions";
import { getRequest, postRequest } from '../../services/api';
import { DEVICE_WIN_HEIGHT, DEVICE_WIN_WIDTH, EMPTY_PROFILE_URL } from '../../config/config';
import commonIcons from '../../assets/svgIcons/common/common';
import CustomHeader, { HeaderApp } from '../../components/header/CustomHeader';
import commonStyles from '../../styles/styles';
import CircularProgress from '../../components/progress';
import CustomToast from '../../components/toast/CustomToast';
import { useFocusEffect } from '@react-navigation/native';
import Notifications from '../../components/notifications/Notifications';
import RatingsModal from '../../components/modals/RatingsModal';
import { sharedOpenModal } from '../../utils/sharedActions';
import { getHubConnectionInstance } from '../../utils/sharedActions';
import { setFooterTabsAction } from '../../redux/actions/sharedReduxActions';
import LinearGradient from 'react-native-linear-gradient';
import SharedFooter from '../../components/footer/SharedFooter';
// import dummy from '../../assets/card-image.png';
import dummy from '../../assets/bike.png';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
import AddBrandModal from '../../components/modals/AddBrandModal';
function Products(props) {
    const { navigation, userObj, activeTheme } = props;
    const [state, setState] = useState({
        "isImgLoad": false,
        brandData: [],
        "contentView": {
            "height": 0,
            "width": 0
        },
        "activeSlide": 0,
        "isSmModalOpen": false,
        // modal types = {
        //     type: 1,
        //     name: 'tasks',
        //     type: 2,
        //     name: 'notifications'
        // }
        "modalType": 1,
        "openOrderDetails": {
            "noOfOrders": 0,
            "openOrderList": [
                {
                    "orderID": null,
                    "orderType": null,
                    "joviType": null,
                    "completedJobPercetage": null
                }
            ]
        },
        "finalDestObj": null
    })
    const addBrandModal = () => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <AddBrandModal {...props} />
            ),
            // modalFlex: 0,
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }

    let valueFromCustomerOrderScreen = navigation.dangerouslyGetState()?.routes?.[0]?.state?.routes[0]?.params?.valueToHomeScreen;
    valueFromCustomerOrderScreen = (typeof (valueFromCustomerOrderScreen) === "number") ? valueFromCustomerOrderScreen : null;


    useFocusEffect(
        useCallback(() => {
            const handleFocusOnMenu = async () => {
                const finalDestination = await AsyncStorage.getItem("customerOrder_finalDestination");
                getRequest("/api/Dashboard/GetOpenOrderDetails/List",
                    {},
                    props.dispatch,
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

                            setState(prevState => ({
                                ...prevState,
                                openOrderDetails: openOrderDetails,
                                finalDestObj: finalDestination ? JSON.parse(finalDestination)?.[0] : null
                            }));
                        };
                        handleCase();
                    },
                    err => {
                        if (err) CustomToast.error("Something went wrong");
                        setState(prevState => ({
                            ...prevState,
                            finalDestObj: finalDestination ? JSON.parse(finalDestination)?.[0] : null
                        }));
                    },
                    ""
                );
            };
            // sharedGetNotificationsHandler(postRequest, 1, 20, true, props.dispatch);
            handleFocusOnMenu();
        }, []),
        [valueFromCustomerOrderScreen]
    );


    const handleBackButtonPressed = bool => {
        sharedConfirmationAlert("Confirm!", "Do you want to exit the app?", () => BackHandler.exitApp(), () => console.log('Cancel Pressed'));
        return true;
    };
    useEffect(useCallback(() => {
        // const permissions = async () => await askForWholeAppPermissions();
        const getData = () => {

            postRequest('api/Admin/Pitstop/BrandGeneric/List', {
                "pageNumber": 1,
                "itemsPerPage": 20,
                "isAscending": true,
                "brandType": 1,
                "isPagination": false,
                "genericSearch": ""
            }, {}, props.dispatch, (res) => {
                console.log('Brand Request:', res)
                setState(prevState => ({
                    ...prevState,
                    brandData: res.data.genericBrandListViewModels.brandData
                }))
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '');
        }
        getData();
        const locationHandler = async () => {
            sharedGetUserCartHandler(getRequest, false, 0);
            // openSettings();
            await hybridLocationPermission();
        }
        locationHandler();
        // const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackButtonPressed);
        return () => {
            // backHandler.remove();

        };
    }, []), []);

    const showHideModal = (bool, modalType) => setState(prevState => ({ ...prevState, isSmModalOpen: bool, modalType }));

    const onFooterItemPressed = async (pressedTab, index) => {
        if(pressedTab.title==='Add Brand'){
            addBrandModal();
        }
        // if (!pressedTab.pitstopOrCheckOutItemType) {
        //     props.dispatch(setFooterTabsAction({ pressedTab: { ...pressedTab, index, from: "home" } }));
        //     navigateWithResetScreen(null, [{ name: 'customer_cart_home', params: { screen: 'customer_cart' } }]);
        // } else {
        //     const confirmFinalDestCallback = (origin) => {
        //         props.dispatch(setFooterTabsAction({ pressedTab: { ...pressedTab, index } }));
        //         navigateWithResetScreen(null, [{ name: 'super_market_home', params: { screen: 'dashboard' } }]);
        //     };
        //     const cancelFinalDestCallback = (origin) => {
        //         navigateWithResetScreen(null, [{ name: 'home', params: {} }]);
        //     };

        //     const finalDestination = await AsyncStorage.getItem("customerOrder_finalDestination");
        //     if (finalDestination) {
        //         confirmFinalDestCallback(pressedTab.title);
        //     }
        //     else {
        //         navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: null, selectDestination: true, fromHome: true, homeFooterHandler: { name: pressedTab.title, confirmFinalDestCallback, cancelFinalDestCallback } });
        //     }
        // }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>


            <HeaderApp
                caption={'Punjab Cash and Carry'}
                commonStyles={commonStyles}
                state={state}
                activeTheme={activeTheme}
            />

            <View style={{ flex: 1, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }}>Products</Text>
                    <Text style={{ marginRight: 14 }}>Total 1042</Text>
                </View>
                <ScrollView style={{ flex: 1 }} onTouchEnd={() => {
                    if (state.isSmModalOpen) showHideModal(false, 1);
                }}>
                    <View style={{ flex: 1, marginHorizontal: 12, marginBottom: 35 }}>
                            
                            <View style={{flex:1,height:100,justifyContent:'center',alignItems:'center'}}>
                                <Text>No Products Found</Text>
                            </View>
                        {/* {
                            [{ title: 'Pearl', desc: 'A brand is a name, term, design, symbol or any other feature that identifies one seller\'s good or service', image: '' }, { title: 'Lipton', desc: 'A brand is a name, term, design, symbol or any other feature that identifies one seller\'s good or service', image: '' }, { title: 'Lux', desc: 'A brand is a name, term, design, symbol or any other feature that identifies one seller\'s good or service', image: '' }, { title: 'Dettol', desc: 'A brand is a name, term, design, symbol or any other feature that identifies one seller\'s good or service', image: '' }, { title: 'Life Bouy', desc: 'A brand is a name, term, design, symbol or any other feature that identifies one seller\'s good or service', image: '' }, { title: 'Dell', desc: 'A brand is a name, term, design, symbol or any other feature that identifies one seller\'s good or service', image: '' }].map((item, i) => {
                                return <View key={i} style={{ height: 110, ...commonStyles.shadowStyles(null, null, null, null, 0.3), backgroundColor: '#fff',borderColor:'#929293',borderWidth:0.5,borderRadius:15, flexDirection: 'row', marginVertical: 5 }}>
                                   <View style={{ flex: 0.38, overflow: 'hidden', borderRadius: 10 }}>
                                        <ImageBackground
                                            resizeMode="contain"
                                            source={dummy}
                                            style={{
                                                flex: 1,
                                                top: 1
                                            }}
                                        />
                                    </View>
                                    <TouchableOpacity style={{flex:0.8, alignSelf: 'flex-start', borderRadius: 25, left: 20, top: 5 }} onPress={() => addBrandModal()}>
                                        <View style={{ flex: 0.9 }}>
                                            <Text style={{ marginTop:0,...commonStyles.fontStyles(18, props.activeTheme.black, 1, '300')}}>{item.title}</Text>
                                            <Text style={{  maxWidth:'90%',...commonStyles.fontStyles(10, props.activeTheme.black, 1, '300'), padding: 2 }}>{item.desc.toLocaleUpperCase()}</Text>
                                        </View>
                                    </TouchableOpacity>
                                <View style={{flex:0.1,width:5,height:30,margin:3,justifyContent:'center',alignItems:'center',borderColor:activeTheme.background,borderWidth:1,borderRadius:90,backgroundColor:activeTheme.background}}>
                                    <Text style={{color:'white'}}>{i}</Text>
                                </View>
                                    

                                </View>
                            })
                        } */}


                    </View>
                </ScrollView>
            </View>
            <SharedFooter activeTheme={activeTheme} activeTab={null} mainDrawerComponentProps={props} drawerProps={props.navigation.drawerProps} onPress={onFooterItemPressed} />
        </View>
    )
}

const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer
    }
};

export default connect(mapStateToProps)(Products);



                // {/* Carousal Start */}
                // <View style={[menuStyles.carouselView]}>
                //     <CustomCarousel
                //         data={data}
                //         _onSnapToItemHandler={_onSnapToItemHandler}
                //         carouselRef={carouselRef}
                //         _renderItem={({ item, index }) => {
                //             return <ReacImage resizeMode="cover" source={item.slider} style={{
                //                 "backgroundColor": 'transparent',
                //                 "opacity": 0.6,
                //                 "height": 170,
                //                 "width": '100%',
                //             }} key={index} />
                //         }}
                //         winWidth={370}
                //     />
                //     <View style={{ height: '100%', width: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'column', position: 'absolute' }}>
                //         <View style={{ height: 20, width: 100, borderWidth: 0.1, borderColor: '#FFFFFF', borderRadius: 20, backgroundColor: '#FFFFFF', opacity: 0.6, marginBottom: 3 }}>
                //             <CustomPagination
                //                 dotsLength={data.length}
                //                 activeSlide={activeSlide}
                //                 paginationRef={paginationRef}
                //                 carouselRef={carouselRef}

                //             />
                //         </View>
                //     </View>
                // </View>
                // {/* Carousal End */}
                // <View style={menuStyles.contentView} onTouchEnd={() => {
                //     if (state.isSmModalOpen) showHideModal(false, 1);
                //     else fillPredefinedPlacesAndProceedToOrderBooking(false);
                // }}>
                //     <View style={{ flex: 1, flexDirection: 'row' }}>
                //         <View style={{ position: 'absolute', top: 30, marginHorizontal: 10 }}>
                //             <Text style={menuStyles.contentText}>Buy anything anywhere</Text>
                //             <TouchableOpacity hitSlop={{ top: 50 }} style={{
                //                 top: 10, height: 50, width: 100, backgroundColor: '#FFFFFF', borderRadius: 5, borderWidth: 0.2, borderColor: '#7359BE', flexDirection: 'row', justifyContent: "space-around", alignItems: 'center', shadowColor: "#000",
                //                 elevation: 3,
                //                 shadowOffset: {
                //                     width: 0,
                //                     height: 2,
                //                 },
                //                 shadowOpacity: 0.25,
                //                 shadowRadius: 3.84,
                //             }}>
                //                 <Text style={menuStyles.btnText}> Jovi</Text>
                //                 <SvgXml xml={svgIcons.arrowRight} height={25} width={25} />
                //             </TouchableOpacity>
                //         </View>
                //         <View style={{
                //             flex: 1
                //         }}>
                //             <ReacImage source={require('../../assets/Menu/maskGroup17.png')} resizeMode="cover" style={{ backgroundColor: 'transparent', width: DEVICE_SCREEN_WIDTH * 0.9, height: DEVICE_SCREEN_WIDTH * 0.5 * 1.76 }} />
                //         </View>
                //     </View>
                // </View>
                // {/* Footer start */}
                // <View style={[menuStyles.footerWrapper]}>
                //     {
                //         (BOTTOM_TABS || []).map((rec, i) => i <= 2 ? (
                //             <TouchableOpacity onPress={() => onFooterItemPressed(rec, i)} style={{ ...menuStyles.footerTabs, marginLeft: 0, position: 'relative', bottom: 50, justifyContent: "space-around", alignItems: 'center', flexDirection: 'column' }} key={i}>
                //                 <SvgXml xml={footerTabItems[i].img} style={{}} />
                //                 <Text style={menuStyles.thinText}>{rec.description}</Text>
                //                 <Text style={menuStyles.mainText}>{i === 0 ? 2 : i === 2 ? 14 : 0 + ' stores'}</Text>
                //             </TouchableOpacity>

                //         ) : null)
                //     }

                // </View>
                // {/* Footer end */}
