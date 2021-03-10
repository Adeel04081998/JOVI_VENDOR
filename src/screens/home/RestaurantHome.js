import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, StyleSheet, View, Alert, TouchableOpacity, ScrollView, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { renderPictureResizeable, sharedConfirmationAlert } from "../../utils/sharedActions";
import { getRequest, postRequest } from '../../services/api';
import { HeaderApp } from '../../components/header/CustomHeader';
import commonStyles, { tabStyles } from '../../styles/styles';
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
import UpdateR_Product from '../../components/modals/UpdateR_ProductModal';

function RestaurantHome(props) {
    const { navigation, userObj, activeTheme } = props;
    console.log(navigation)
    const [state, setState] = useState({
        "isImgLoad": false,
        categoryData: [],
        dealObj: {
        },
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
                // <UpdateR_Product {...props} onSave={() => { getData() }} />
                // <AddUpdateDealModal {...props} onSave={() => { getData() }} />
                <AddProductModalR {...props} onSave={() => { getData() }} />
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
        postRequest('Api/Vendor/Restaurant/GetRestaurantCategory', {
            "isAscending": true,
            "categoryType": 2,
            "isPagination": false,
            "pitstopID": props.user.pitstopID,
            "pageNumber": 0,
            "itemsPerPage": 0,
            "genericSearch": ""
        }, {}
            , props.dispatch, (res) => {
                console.log('Restaurant Product Request:', res)
                if (res.data.statusCode === 200) {
                    setState(prevState => ({
                        ...prevState,
                        categoryData: res.data.restaurantCategoryVMList.categoryViewModelList.filter(it => it.name !== 'Deals'),
                        categoryDataTemp: res.data.restaurantCategoryVMList.categoryViewModelList.filter(it => it.name !== 'Deals'),
                        dealObj: res.data.restaurantCategoryVMList.categoryViewModelList.filter(it => it.name === 'Deals')[0]
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
        setState(pre => ({
            ...pre,
            categoryData: val === '' ? pre.categoryDataTemp : pre.categoryDataTemp.filter(item => { return item.name.toLowerCase().includes(val.toLowerCase()) })
        }))
    }, 100)
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
            <View style={{ flex: 1,zIndex:88, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }}>Menu</Text>
                    <Text style={{ marginRight: 14 }}>Total: {state.categoryData.length < 1 ? '0' : state.categoryData.length < 10 ? '0' + state.categoryData.length : state.categoryData.length}</Text>
                </View>
                <ScrollView style={{ flex: 1, marginHorizontal: 8 }} onTouchEnd={() => {
                    if (state.isSmModalOpen) showHideModal(false, 1);
                }}>
                    <View style={{ ...tabStyles.tabContainer(props.activeTheme,null,null,null,null,0.3)}}>
                        <View style={{ ...tabStyles.imageTabContainer }}>
                            <SvgXml
                                fill={props.activeTheme.default}
                                xml={state.dealObj.categoryImage ?? common.joviDeal()}
                                // xml={common.joviDeal()}
                                width={'100%'}
                                height={'100%'}
                            />
                        </View>
                        <TouchableOpacity style={tabStyles.tabTextContainer} onPress={() => setState(pre => ({ ...pre, focusedField: 'deals' }))} >
                            <View style={{ flex: 0.9 }}>
                                <Text style={{ ...tabStyles.tabTitle(18, props.activeTheme.black, 1, '300')}}>{state.dealObj?.name}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{...tabStyles.tabCounter(props)}}>
                            <Text style={{ color: 'white' }}>{state.dealObj?.subCategoryCount}</Text>
                        </View>
                    </View>
                    {
                        state.focusedField === 'deals' && state.dealObj.subCategories &&
                        state.dealObj.subCategories?.map((it, j) => {
                            return <View key={j} style={{ marginHorizontal: 5 }}>
                                <TouchableOpacity onPress={() => navigation.navigate('RestaurantDeals', { key: 'RestaurantDeals', item: it })} style={{ width: '100%', borderRadius: 15, borderColor: props.activeTheme.default, borderWidth: 0.5, marginVertical: 3, backgroundColor: 'white',flexDirection:'row', justifyContent: 'flex-start', alignItems: 'flex-start', padding: 10 }}>
                                    <SvgXml
                                        fill={props.activeTheme.default}
                                        xml={it.categoryImage}
                                        width={20}
                                        style={{ marginRight: 10 }}
                                        height={20}
                                    />
                                    <Text>{it.name}</Text>
                                </TouchableOpacity>
                            </View>
                        })
                    }
                    {/* <View style={{ flex: 1, marginHorizontal: 12, marginBottom: 35 }}> */}
                    {state.categoryData.length > 0 &&
                        state.categoryData.filter(it => it.name !== "Deals").map((item, i) => {
                            return <View key={i} style={{ justifyContent: 'center' }}>
                                <View style={{ ...tabStyles.tabContainer(props.activeTheme,null,null,null,null,0.3) }}>
                                    <View style={{ ...tabStyles.imageTabContainer }}>
                                        <SvgXml
                                            fill={props.activeTheme.default}
                                            xml={item.categoryImage}
                                            width={'100%'}
                                            height={'100%'}
                                        />
                                    </View>
                                    <TouchableOpacity style={tabStyles.tabTextContainer} onPress={() => setState(pre => ({ ...pre, focusedField: pre.focusedField !== null && pre.focusedField === i ? null : i }))}>
                                        <View style={{ flex: 0.9 }}>
                                            <Text style={{ ...tabStyles.tabTitle(18, props.activeTheme.black, 1, '300')}}>{item.name}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ ...tabStyles.tabCounter(props) }}>
                                        <Text style={{ color: 'white' }}>{item.subCategoryCount}</Text>
                                    </View>
                                </View>
                                {
                                    state.focusedField === i &&
                                    item.subCategories?.map((it, j) => {
                                        return <View key={j + i + i} style={{ marginHorizontal: 5 }}>
                                            <TouchableOpacity onPress={() => navigation.navigate('ProductsRes', { key: 'ProductsRes', item: it })} style={{ width: '100%', borderRadius: 15, borderColor: props.activeTheme.default, borderWidth: 0.5, marginVertical: 3, backgroundColor: 'white',flexDirection:'row', justifyContent: 'flex-start', alignItems: 'flex-start', padding: 10 }}>
                                                <SvgXml
                                                    fill={props.activeTheme.default}
                                                    xml={it.categoryImage}
                                                    width={20}
                                                    style={{ marginRight: 10 }}
                                                    height={20}
                                                />
                                                <Text>{it.name}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    })
                                }
                            </View>
                        })
                    }
                </ScrollView>
            </View>
            {props.stackState.keypaidOpen === false && <SharedFooter onHome={true} activeTheme={activeTheme} activeTab={null} mainDrawerComponentProps={props} drawerProps={props.navigation.drawerProps} onPress={onFooterItemPressed} />}
        </View>
    )
}

const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer
    }
};
export default connect(mapStateToProps)(RestaurantHome);

