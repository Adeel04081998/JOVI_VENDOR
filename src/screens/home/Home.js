import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground,StyleSheet, View, Alert, TouchableOpacity, ScrollView, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { hybridLocationPermission, navigateWithResetScreen, renderPicture, renderPictureResizeable, sharedCommasAmountConveter, sharedConfirmationAlert, sharedGetUserCartHandler, sharedlogoutUser } from "../../utils/sharedActions";
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
import { debounce } from 'debounce';
function Home(props) {
    const { navigation, userObj, activeTheme } = props;
    console.log(navigation)
    const [state, setState] = useState({
        "isImgLoad": false,
        brandData: [],
        "contentView": {
            "height": 0,
            "width": 0
        },
        paginationInfo:{},
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
                <AddBrandModal type={1} {...props} onSave={()=>{getData()}} brandList={state.brandData} />
            ),
            // modalFlex: 0,
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }


    const handleBackButtonPressed = bool => {
        sharedConfirmationAlert("Confirm!", "Do you want to exit the app?", () => BackHandler.exitApp(), () => console.log('Cancel Pressed'));
        return true;
    };
    const getData = (keywords=false) => {

        postRequest('Api/Vendor/Pitstop/BrandsList', {
            "itemsPerPage": 50,
            // "itemsPerPage": state.itemsPerPage,
            "pageNumber": 1,
            "isPagination": true,
            "searchKeyWords":keywords!==false?keywords: "",
          },{}
        , props.dispatch, (res) => {
            console.log('Brand Request:', res)
            if(res.data.statusCode === 200){
                setState(prevState => ({
                    ...prevState,
                    brandData: res.data.pitstopBrands.pitstopBrandsList,
                    paginationInfo:res.data.pitstopBrands.paginations
                }))
            }else{
                CustomToast.error("Not Found");
                setState(prevState => ({
                    ...prevState,
                    brandData: []
                }))
            }
        }, (err) => {
            if (err) CustomToast.error("Something went wrong");
        }, '');
    }
    const searchBrand = debounce((val) => {
        getData(val);
    },900)
    useEffect(useCallback(() => {
        // const permissions = async () => await askForWholeAppPermissions();
        
        getData();
        // const locationHandler = async () => {
        //     sharedGetUserCartHandler(getRequest, false, 0);
        //     // openSettings();
        //     await hybridLocationPermission();
        // }
        // locationHandler();
        // const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackButtonPressed);
        return () => {
            setState({
                ...state,
                brandData:[]
            })
            // backHandler.remove();

        };
    }, []), []);

    const showHideModal = (bool, modalType) => setState(prevState => ({ ...prevState, isSmModalOpen: bool, modalType }));
    const onBrandPress = (item) => {getData();navigation.navigate('Products',{key:'products',item:{item}})}
    const onFooterItemPressed = async (pressedTab, index) => {
        if(pressedTab.title==='Add Brand'){
            addBrandModal();
        }else if(pressedTab.title === 'Orders'){
            navigation.navigate("Orders",{});

        }
         else{
            // navigateWithResetScreen(null, [{ name: 'Products', params: { screen: 'dashboard' } }]);
            // navigation.navigate("Products",{});
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
                caption={props.user?.pitstopName}
                commonStyles={commonStyles}
                state={state}
                user={props.user}
                onChangeText={searchBrand}
                activeTheme={activeTheme}
                screenProps={{...props}}
            />

            <View style={{ flex: 1, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }} onPress={()=>navigation.navigate('Orders')}>Brands</Text>
                    <Text style={{ marginRight: 14 }}>Total {state.paginationInfo?.totalItems}</Text>
                </View>
                <ScrollView style={{ flex: 1,marginHorizontal:8 }} onTouchEnd={() => {
                    if (state.isSmModalOpen) showHideModal(false, 1);
                }}>
                    {/* <View style={{ flex: 1, marginHorizontal: 12, marginBottom: 35 }}> */}
                        {state.brandData.length>0?
                            state.brandData.map((item, i) => {
                                return <View key={i} style={{...stylesHome.homeTab({activeTheme:props.activeTheme})}}>
                                    <View style={{...stylesHome.homeTabView}}>
                                        <ImageBackground
                                            resizeMode='stretch'
                                            source={item.brandImages && item.brandImages.length > 0 ? { uri: renderPictureResizeable(item.brandImages[0].joviImage,190, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                            // source={item.brandImages && item.brandImages.length > 0 ? { uri: renderPicture(item.brandImages[0].joviImage, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                            style={{...stylesHome.homeTabImage}}
                                        />
                                    </View>
                                    <TouchableOpacity style={stylesHome.homeTabText} onPress={()=>onBrandPress(item)}>
                                        <View style={{ flex: 0.9 }}>
                                            <Text style={{...stylesHome.homeTabBrandName, ...commonStyles.fontStyles(18, props.activeTheme.black, 1, '300')}}>{item.brandName}</Text>
                                            <Text style={{...stylesHome.homeTabDesc(props)}}>{item.brandDescription.toLocaleUpperCase()}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{...stylesHome.homeTabCounter(props)}}>
                                        <Text style={{ color: 'white' }}>{item.noOfProducts}</Text>
                                    </View>
                                </View>
                            })
                            :
                            <View style={{flex:1,height:100,justifyContent:'center',alignItems:'center'}}>
                                <Text>No Brands Found</Text>
                            </View>
                        }
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
const stylesHome = StyleSheet.create({
    homeTab:props=>{return { height: 110, ...commonStyles.shadowStyles(null, null, null, null, 0.3), backgroundColor: '#fff', borderColor: props.activeTheme.borderColor, borderWidth: 0.5, borderRadius: 15, flexDirection: 'row', marginVertical: 5 }},
    homeTabView:{ flex: 0.38,paddingTop:5, overflow: 'hidden', borderRadius: 10 },
    homeTabImage:{
        flex: 1,
        top: 1,
        marginLeft: 10,
        width: '90%',
        "height": "90%",
    },
    homeTabText:{ flex: 0.8, alignSelf: 'flex-start', borderRadius: 25, left: 20, top: 5 },
    homeTabBrandName:{ marginTop: 0},
    homeTabDesc:(props)=>{return{ maxWidth: '90%', ...commonStyles.fontStyles(10, props.activeTheme.black, 1, '300'), padding: 2} },
    homeTabCounter:(props)=>{return { flex: 0.1, width: 5, height: 27, margin: 3, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: props.activeTheme.background }}

});
export default connect(mapStateToProps)(Home);

