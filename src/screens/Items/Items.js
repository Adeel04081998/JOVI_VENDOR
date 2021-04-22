import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, Alert, TouchableOpacity, ScrollView,StyleSheet, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { renderPicture } from "../../utils/sharedActions";
import AsyncStorage from '@react-native-community/async-storage';
import { getRequest, postRequest } from '../../services/api';
import { HeaderApp } from '../../components/header/CustomHeader';
import commonStyles from '../../styles/styles';
import CustomToast from '../../components/toast/CustomToast';
import SharedFooter from '../../components/footer/SharedFooter';
import dummy from '../../assets/pictureNotAvailable.jpeg';
import blockSvg from '../../assets/svgIcons/common/block.svg';
import plateformSpecific from '../../utils/plateformSpecific';
import { closeModalAction, openModalAction } from '../../redux/actions/modal';
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
        selectedProduct: data.item ? data.item : 0,
        itemsData: []
    })
    const setChangedStatus = (obj) => {
        let tempArr = state.itemsData.map((item) => {
            if (item.itemID === obj.itemID) {
                return { ...obj };
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
                <DisableProductModal onSave={() => { getData(); props.dispatch(closeModalAction()) }} dispatch={props.dispatch} brandObj={state.brandData} productObj={state.selectedProduct} item={item} {...props} />
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
                <AddBrandModal type={3} onSave={() => getData()} productObj={{ ...state.selectedProduct, productID: state.selectedProduct.genricProductID }} brandObj={state.brandData} {...props} />
            ),
            // modalFlex: 0,
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }
    const onItemSearch = (val) => {
        setState(pre => ({
            ...pre,
            itemsData: val === '' ? pre.itemsDataTemp : pre.itemsDataTemp.filter(item => { return item.itemName.toLowerCase().includes(val.toLowerCase()) })
        }))
    }
    const getData = (changeProduct = false) => {
        // postRequest('Api/Vendor/Pitstop/GetItemsByProducts/List', {
        getRequest(`Api/Vendor/Pitstop/ItemsByProductId/${changeProduct !== false ? changeProduct.productID : state.selectedProduct !== 0 ? state.selectedProduct.productID : data.item.productID}`, {
            // "pageNumber": 1,
            // "itemsPerPage": 2,
            // "isPagination": false,
            // "isAscending": true,
            // "pitstopProductID":changeProduct!==false?changeProduct.productID:state.selectedProduct!==0?state.selectedProduct.productID:data.item.productID
        }
            , props.dispatch, (res) => {
                console.log('Product Items Request:', res)
                if (res.data.statusCode === 200) {
                    setState(prevState => ({
                        ...prevState,
                        itemsData: res.data.productItems?.productItemsList,
                        itemsDataTemp: res.data.productItems?.productItemsList
                    }));
                }
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '');
    }
    useEffect(useCallback(() => {

        getData();
        return () => {
            // backHandler.remove();
        };
    }, []), []);

    const onSelectProduct = (item) => {
        setState(prevState => ({
            ...prevState,
            selectedProduct: item
        }));
        getData(item);
    }
    const onFooterItemPressed = async (pressedTab, index) => {
        if (pressedTab.title === 'Add') {
            addBrandModal();
            // navigateWithResetScreen(null,[{name:'homee', params: {}}]);
        } else if (pressedTab.title === 'Orders') {
            navigation.navigate("Orders", {});

        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>


            <HeaderApp
                caption={state.selectedProduct.productName}
                commonStyles={commonStyles}
                user={props.user}
                state={state}
                onChangeText={onItemSearch}
                activeTheme={activeTheme}
                screenProps={{ ...props }}
            />

            <View style={{ flex: 1, marginTop: 30 }}>
                {/* <Text style={{ ...commonStyles.fontStyles(20, props.activeTheme.background, 4), marginLeft: 20}}>{data.brandName}</Text> */}
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }}>Items List</Text>
                    <Text style={{ marginRight: 14 }}>Total: {state.itemsData.length < 1 ? '0' : state.itemsData.length < 10 ? '0' + state.itemsData.length : state.itemsData.length}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <ScrollView horizontal contentContainerStyle={{ height: 160, paddingLeft: 10, flexDirection: 'row' }}>
                        {
                            state.productData.map((item, i) => {
                                return <View key={i} style={{ width: 150, height: 120, justifyContent: 'center', alignItems: 'center' }} >
                                    <TouchableOpacity style={{ width: '100%', height: '70%', paddingHorizontal: 10, }} onPress={() => onSelectProduct(item)}>
                                        <View style={{ backgroundColor: 'white', borderColor: '#929293', overflow: 'hidden', justifyContent: 'center', alignItems: "center", borderRadius: 15, height: '100%' }}>
                                            <ImageBackground
                                                resizeMode="center"
                                                source={item.productImages && item.productImages.length > 0 ? { uri: renderPicture(item.productImages[0].joviImageThumbnail, 190, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                                style={{
                                                    // flex: 1,
                                                    // top: 1,
                                                    // borderRadius:15,
                                                    width: '100%',
                                                    "height": "100%",
                                                }}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>

                            })
                        }
                    </ScrollView>
                </View>
                <View style={{ flex: 3, marginHorizontal: 12, marginBottom: 35 }}>
                    <ScrollView contentContainerStyle={{ marginTop: 20, paddingLeft: 15, paddingBottom: 20, justifyContent: 'flex-start', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {state.itemsData.length < 1 ?
                            <View style={{ flex: 1, height: 100, justifyContent: 'center', alignItems: 'center' }}>
                                <Text>No Items Found</Text>
                            </View>
                            :
                            state.itemsData.map((item, i) => {
                                return <View key={i} style={{...styleProduct.productTab}}>
                                <TouchableOpacity style={{ width: '100%',padding:10, height: '100%' }} onPress={() => disableEnableProduct(item)}>
                                {item.availabilityStatus === 'Out Of Stock' && <View style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 901 }}></View>}
                                        {item.availabilityStatus === 'Discontinued' && <View style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 901, justifyContent: 'center', alignItems: 'center' }}>
                                            <SvgXml xml={blockSvg} height={'60%'} width={'60%'} />
                                        </View>}
                                    <View style={{...styleProduct.productImageContainer}}>
                                        <ImageBackground
                                                resizeMode="stretch"
                                                source={item.itemImages && item.itemImages.length > 0 ? { uri: renderPicture(item.itemImages[0].joviImageThumbnail, 190, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                            style={{...styleProduct.productImage}}
                                        />
                                    </View>
                                    <View style={{...styleProduct.productName}}><Text style={{...commonStyles.fontStyles(12,props.activeTheme.black,3)}}>{item.itemName}</Text></View>
                                </TouchableOpacity>
                            </View>
                            })
                        }
                    </ScrollView>
                </View>
            </View>
            {props.stackState.keypaidOpen === false && <SharedFooter activeTheme={activeTheme} activeTab={null} mainDrawerComponentProps={props} drawerProps={props.navigation.drawerProps} onPress={onFooterItemPressed} />}
        </View>
    )
}
const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer
    }
};
const styleProduct = StyleSheet.create({
    brandContainer:{ width: 150, height: 120, justifyContent: 'center', alignItems: 'center' },
    brandImageContainer:{ width: '100%', height: '70%',paddingHorizontal:10, },
    brandImageContainerView:{ backgroundColor: 'white', borderColor: '#929293', overflow: 'hidden',justifyContent: 'center', alignItems: "center", borderRadius: 15,height:'100%' },
    brandImage:{
        // flex: 1,
        // top: 1,
        // borderRadius:15,
        width: '100%',
        "height": "100%",
    },
    productListContainer:{ paddingBottom: 20, justifyContent: 'flex-start', flexDirection: 'row', flexWrap: 'wrap' },
    productTab:{ height: 200, borderColor: '#929293', backgroundColor: 'white', borderWidth: 0.5, borderRadius: 15, width: '40%', margin: 15 },
    productImageContainer:{ height:'60%' ,width: '100%',borderRadius:15,overflow:'hidden'},
    productImage:{
        width: '100%',
        // marginLeft: 17,
        // zIndex: 900,
        borderRadius:15,
        "height": "100%",
    },
    productName:{ flex: 2,maxWidth:'100%',paddingHorizontal:5, justifyContent: 'center', alignItems: 'center' },
    counter:(props) =>{return { position: 'absolute', top: 5, right: 10, zIndex: 999, width: 20, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: props.activeTheme.background }}

})
export default connect(mapStateToProps)(Items);