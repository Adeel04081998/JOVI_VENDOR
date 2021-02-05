import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, Alert, TouchableOpacity, ScrollView, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { renderPicture } from "../../utils/sharedActions";
import AsyncStorage from '@react-native-community/async-storage';
import { getRequest, postRequest } from '../../services/api';
import { HeaderApp } from '../../components/header/CustomHeader';
import commonStyles from '../../styles/styles';
import CustomToast from '../../components/toast/CustomToast';
import SharedFooter from '../../components/footer/SharedFooter';
import dummy from '../../assets/bike.png';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
import AddBrandModal from '../../components/modals/AddBrandModal';
import { CheckBox } from 'native-base';
import DisableProductModal from '../../components/modals/DisableProductModal';
function Items(props) {
    const { navigation, userObj, activeTheme } = props;
    // console.log(navigation.dangerouslyGetState());
    const data = navigation.dangerouslyGetState()?.routes?.filter(item => item.name === 'Items')[0]?.params?.item;
    console.log('Data Items:', data)
    const [state, setState] = useState({
        brandData: data.brandObj,
        productData: data.data,
        selectedProduct: data.item,
        itemsData: []
    })
    const setChangedStatus = (obj) => {
        let tempArr = state.itemsData.map((item) => {
            if (item.productID === obj.productID) {
                return { ...item, active: obj.active };
            } else {
                return item;
            }
        });
        setState(prevState => ({
            ...prevState, itemsData: tempArr
        }))
    }
    const disableEnableProduct = (item) => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <DisableProductModal onSaveStatus={(obj) => setChangedStatus(obj)} dispatch={props.dispatch} product={item} {...props} />
            ),
            // modalFlex: 0,
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }
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
    useEffect(useCallback(() => {
        const getData = () => {
            postRequest('api/Admin/Pitstop/ProductGeneric/List', {
                "pageNumber": 1,
                "itemsPerPage": 20,
                "isAscending": true,
                // "brandID": state.selectedBrand.brandID,
                "isPagination": false,
                "productType": 1,
                "genericSearch": ""
            }, {}, props.dispatch, (res) => {
                console.log('Product Request:', res);
                let check = false;
                setState(prevState => ({
                    ...prevState,
                    itemsData: res.data.getProductListViewModel.productData.map((item) => { check = !check; return { ...item, active: check } })
                }))
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '');
        }
        getData();
        return () => {
            // backHandler.remove();
        };
    }, []), []);

    const onSelectProduct = (item) => {
        setState(prevState => ({
            ...prevState,
            selectedProduct: item
        }))
    }
    const onFooterItemPressed = async (pressedTab, index) => {
        if (pressedTab.title === 'Add Brand') {
            addBrandModal();
            // navigateWithResetScreen(null,[{name:'homee', params: {}}]);
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
                caption={state.selectedProduct.productName}
                commonStyles={commonStyles}
                state={state}
                activeTheme={activeTheme}
            />

            <View style={{ flex: 1, marginTop: 30 }}>
                {/* <Text style={{ ...commonStyles.fontStyles(20, props.activeTheme.background, 4), marginLeft: 20}}>{data.brandName}</Text> */}
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }} onPress={() => { navigation.goBack('Products') }}>Choose Product</Text>
                    <Text style={{ marginRight: 14 }}>Total 1042</Text>
                </View>
                <View style={{ flex: 1, marginHorizontal: 12, marginBottom: 35 }}>
                    <ScrollView horizontal contentContainerStyle={{ height: 160, flexDirection: 'row' }}>
                        {
                            state.productData.map((item, i) => {
                                return <View key={i} style={{ width: 150, height: 120, justifyContent: 'center', alignItems: 'center' }} >
                                    <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={() => onSelectProduct(item)}>
                                        <View style={{ backgroundColor: 'white', width: '85%', borderColor: '#929293', justifyContent: 'center', alignItems: "center", borderWidth: 0.5, borderRadius: 15, height: '80%' }}>
                                            <ImageBackground
                                                resizeMode="center"
                                                source={item.productImagesList && item.productImagesList.length > 0 ? { uri: renderPicture(item.productImagesList[0].joviImage, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                                style={{
                                                    flex: 1,
                                                    top: 1,
                                                    marginLeft: 10,
                                                    width: '90%',
                                                    marginTop: 5,
                                                    // "backgroundColor": 'transparent',
                                                    // "opacity": 0.6,
                                                    "height": "90%",
                                                    // "width": '100%',
                                                }}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>

                            })
                        }
                    </ScrollView>
                    <ScrollView contentContainerStyle={{ marginTop: 20, paddingBottom: 20, justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {
                            state.itemsData.map((item, i) => {
                                return <View key={i} style={{ height: 150, borderColor: '#929293', backgroundColor: 'white', justifyContent: 'center', alignItems: "center", borderWidth: 0.5, borderRadius: 15, width: '40%', margin: 15 }}>
                                    <TouchableOpacity style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: "center" }} onPress={() => disableEnableProduct(item)}>
                                        {item.active === false && <View style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 901 }}></View>}
                                        <View style={{ flex: 3, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <ImageBackground
                                                resizeMode="center"
                                                source={item.productImagesList && item.productImagesList.length > 0 ? { uri: renderPicture(item.productImagesList[0].joviImage, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                                style={{
                                                    width: '90%',
                                                    marginLeft: 17,
                                                    zIndex: 900,
                                                    "height": "90%",
                                                }}
                                            />
                                            {/* <CheckBox checked={item.active} color={activeTheme.background} onPress={()=>disableEnableProduct(item)} style={{ position: 'absolute', borderColor: '#929293', borderRadius: 5, zIndex: 999, top: 5, left: 10 }} /> */}
                                            <View style={{ position: 'absolute', top: 5, right: 10, zIndex: 999, width: 20, justifyContent: 'center', alignItems: 'center', borderColor: activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: activeTheme.background }}>
                                                <Text style={{ color: 'white' }}>{i + 1}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1 }}><Text>{item.productName}</Text></View>
                                    </TouchableOpacity>
                                </View>
                            })
                        }
                    </ScrollView>
                </View>
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
export default connect(mapStateToProps)(Items);