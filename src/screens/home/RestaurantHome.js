import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, StyleSheet, View, Alert, TouchableOpacity, ScrollView, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { renderPictureResizeable, sharedConfirmationAlert } from "../../utils/sharedActions";
import { getRequest, postRequest } from '../../services/api';
import { HeaderApp } from '../../components/header/CustomHeader';
import commonStyles from '../../styles/styles';
import CustomToast from '../../components/toast/CustomToast';
import { useFocusEffect } from '@react-navigation/native';
import SharedFooter from '../../components/footer/SharedFooter';
// import dummy from '../../assets/card-image.png';
import dummy from '../../assets/bike.png';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
import AddBrandModal from '../../components/modals/AddBrandModal';
import { debounce } from 'debounce';
import AddProductModalR from '../../components/modals/AddProductModalR';
import AddUpdateDealModal from '../../components/modals/AddUpdateDealModal';
import common from '../../assets/svgIcons/common/common';

function RestaurantHome(props) {
    const { navigation, userObj, activeTheme } = props;
    console.log(navigation)
    const [state, setState] = useState({
        "isImgLoad": false,
        categoryData: [],
        dealObj:{},
        focusedField: null,
        paginationInfo: {},
    })
    const addProductModalF = () => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <AddUpdateDealModal {...props} onSave={() => { getData() }} />
                // <AddProductModalR {...props} onSave={()=>{getData()}} />
            ),
            // modalFlex: 0,
            // modalHeight: Dimensions.get('window').height * 0.85,
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }
    const getData = (keywords = false) => {
        console.log('Restaurant Payload:', {
            "pitstopID": props.user.pitstopID
        }, props.user)
        postRequest('Api/Vendor/Restaurant/PitstopProductsAndDeals/List', {
            "pitstopID": props.user.pitstopID
        }, {}
            , props.dispatch, (res) => {
                console.log('Restaurant Product Request:', res)
                if (res.data.statusCode === 200) {
                    setState(prevState => ({
                        ...prevState,
                        categoryData: res.data.productAndDealsViewModel.productsDealsCategories,
                        dealObj: res.data.productAndDealsViewModel.productsDealsCategories.filter(it=>it.categoryID===0)[0]
                        // paginationInfo:res.data.pitstopBrands.paginations
                    }))
                } else {
                    CustomToast.error("Not Found");
                    setState(prevState => ({
                        ...prevState,
                        categoryData: []
                    }))
                }
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '');
    }
    const searchBrand = debounce((val) => {
        // getData(val);
    }, 900)
    useFocusEffect(useCallback(() => {
        if (props.user.pitstopID !== 0) {
            getData();
        }
    }, [props.user]), [props.user]);

    const showHideModal = (bool, modalType) => setState(prevState => ({ ...prevState, isSmModalOpen: bool, modalType }));
    const onBrandPress = (item) => { getData(); navigation.navigate('Products', { key: 'products', item: { item } }) }
    const onFooterItemPressed = async (pressedTab, index) => {
        if (pressedTab.title === 'Add') {
            addProductModalF();
        } else if (pressedTab.title === 'Orders') {
            navigation.navigate("Orders", {});

        }
        else {
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
                screenProps={{ ...props }}
                noBackButton={true}
            />

            <View style={{ flex: 1, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }}>Menu</Text>
                    <Text style={{ marginRight: 14 }}>Total {state.categoryData.length}</Text>
                </View>
                <ScrollView style={{ flex: 1, marginHorizontal: 8 }} onTouchEnd={() => {
                    if (state.isSmModalOpen) showHideModal(false, 1);
                }}>
                    <View style={{ ...stylesHome.homeTab({ activeTheme: props.activeTheme }) }}>
                        <View style={{ ...stylesHome.homeTabView }}>
                            <SvgXml
                                fill={props.activeTheme.default}
                                xml={common.joviDeal()}
                                width={'100%'}
                                height={'100%'}
                            />
                        </View>
                        <TouchableOpacity style={stylesHome.homeTabText} onPress={() => navigation.navigate('RestaurantDeals')}>
                            <View style={{ flex: 0.9 }}>
                                <Text style={{ ...stylesHome.homeTabBrandName, ...commonStyles.fontStyles(18, props.activeTheme.black, 1, '300') }}>Deals</Text>
                                <Text style={{ ...stylesHome.homeTabDesc(props) }}>{'Deal of the day'.toLocaleUpperCase()}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ ...stylesHome.homeTabCounter(props) }}>
                            <Text style={{ color: 'white' }}>{state.dealObj.noOfDeals}</Text>
                        </View>
                    </View>
                    {/* <View style={{ flex: 1, marginHorizontal: 12, marginBottom: 35 }}> */}
                    {state.categoryData.length > 0 &&
                        state.categoryData.filter(it => it.categoryName !== '').map((item, i) => {
                            return <View key={i} style={{ justifyContent: 'center' }}>
                                <View style={{ ...stylesHome.homeTab({ activeTheme: props.activeTheme }) }}>
                                    <View style={{ ...stylesHome.homeTabView }}>
                                        <SvgXml
                                            fill={props.activeTheme.default}
                                            xml={item.categoryImage}
                                            width={'100%'}
                                            height={'100%'}
                                        />
                                        {/* <ImageBackground
                                            resizeMode='stretch'
                                            source={item.brandImages && item.brandImages.length > 0 ? { uri: renderPictureResizeable(item.brandImages[0].joviImage,190, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                            // source={item.brandImages && item.brandImages.length > 0 ? { uri: renderPicture(item.brandImages[0].joviImage, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                            style={{...stylesHome.homeTabImage}}
                                        /> */}
                                    </View>
                                    <TouchableOpacity style={stylesHome.homeTabText} onPress={() => setState(pre => ({ ...pre, focusedField: pre.focusedField !== null && pre.focusedField === i ? null : i }))}>
                                        <View style={{ flex: 0.9 }}>
                                            <Text style={{ ...stylesHome.homeTabBrandName, ...commonStyles.fontStyles(18, props.activeTheme.black, 1, '300') }}>{item.categoryName}</Text>
                                            {/* <Text style={{...stylesHome.homeTabDesc(props)}}>{item.brandDescription.toLocaleUpperCase()}</Text> */}
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ ...stylesHome.homeTabCounter(props) }}>
                                        <Text style={{ color: 'white' }}>{item.noOfProducts}</Text>
                                    </View>
                                </View>
                                {
                                    state.focusedField === i &&
                                    item.restaurantProducts.map((it, j) => {
                                        return <View key={j + i + i} >
                                            <TouchableOpacity style={{ width: '100%', borderRadius: 15, margin: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'flex-start', padding: 10 }}>

                                                <Text>{it.productName}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    })
                                }
                            </View>
                        })
                    }
                </ScrollView>
            </View>
            {props.stackState.keypaidOpen===false&&<SharedFooter onHome={true} activeTheme={activeTheme} activeTab={null} mainDrawerComponentProps={props} drawerProps={props.navigation.drawerProps} onPress={onFooterItemPressed} />}
        </View>
    )
}

const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer
    }
};
const stylesHome = StyleSheet.create({
    homeTab: props => { return { height: 110, ...commonStyles.shadowStyles(null, null, null, null, 0.3), backgroundColor: '#fff', borderColor: props.activeTheme.borderColor, borderWidth: 0.5, borderRadius: 15, flexDirection: 'row', marginVertical: 5 } },
    homeTabView: { flex: 0.38, paddingTop: 5, overflow: 'hidden', borderRadius: 10 },
    homeTabImage: {
        flex: 1,
        top: 1,
        marginLeft: 10,
        width: '90%',
        "height": "90%",
    },
    homeTabText: { flex: 0.8, alignSelf: 'flex-start', borderRadius: 25, left: 20, top: 5 },
    homeTabBrandName: { marginTop: 0 },
    homeTabDesc: (props) => { return { maxWidth: '90%', ...commonStyles.fontStyles(10, props.activeTheme.black, 1, '300'), padding: 2 } },
    homeTabCounter: (props) => { return { flex: 0.1, width: 5, height: 27, margin: 3, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: props.activeTheme.background } }

});
export default connect(mapStateToProps)(RestaurantHome);

