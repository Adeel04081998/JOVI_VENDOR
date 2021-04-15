import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, Alert, TouchableOpacity,StyleSheet, ScrollView, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { renderPicture, renderPictureResizeable } from "../../utils/sharedActions";
import { getRequest, postRequest } from '../../services/api';
import { HeaderApp } from '../../components/header/CustomHeader';
import commonStyles from '../../styles/styles';
import CustomToast from '../../components/toast/CustomToast';
import SharedFooter from '../../components/footer/SharedFooter';
import dummy from '../../assets/pictureNotAvailable.jpeg';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
import AddBrandModal from '../../components/modals/AddBrandModal';
function Products(props) {
    const { navigation, activeTheme } = props;
    const data = navigation.dangerouslyGetState()?.routes?.filter(item => item.name === 'Products')[0]?.params?.item;
    // console.log('Data:', data)
    const [state, setState] = useState({
        brandData: data.data?data.data:[],
        productData: data.item.brandProducts ? data.item.brandProducts : [],
        productDataTemp: data.item.brandProducts ? data.item.brandProducts : [],
        selectedBrand: data.item,
    })
    const addBrandModal = () => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <AddBrandModal onSave={()=>getData()} brandObj={state.selectedBrand} type={2} {...props} />
            ),
            // modalFlex: 0,
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }
    const onProductSearch = (val) => {
        setState(pre => ({
            ...pre,
            productData: val === '' ? pre.productDataTemp : pre.productDataTemp.filter(item => { return item.productName.toLowerCase().includes(val.toLowerCase()) })
        }))
    }
    const getData = (keywords = false) => {

        postRequest('Api/Vendor/Pitstop/BrandsList', {
            "itemsPerPage": state.itemsPerPage,
            "pageNumber": 1,
            "isPagination": false,
            "searchKeyWords": keywords !== false ? keywords : "",
        }, {}
            , props.dispatch, (res) => {
                console.log('Brand Request:', res)
                if (res.data.statusCode === 200) {
                    setState(prevState => ({
                        ...prevState,
                        brandData: res.data.pitstopBrands.pitstopBrandsList,
                        productData: res.data.pitstopBrands.pitstopBrandsList.filter(item=>item.brandID === data.item.brandID)[0]?.brandProducts,
                        productDataTemp: res.data.pitstopBrands.pitstopBrandsList.filter(item=>item.brandID === data.item.brandID)[0]?.brandProducts,

                    }))
                } else {
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
    useEffect(useCallback(() => {
        getData();
        return () => {
            setState({
                brandData: [],
                productData: [],
                selectedBrand: {},
            })
        };
    }, []), []);

    const onSelectBrand = (item) => {
        setState(prevState => ({
            ...prevState,
            selectedBrand: item,
            productData: item.brandProducts,
            productDataTemp: item.brandProducts
        }));
    }
    const onFooterItemPressed = async (pressedTab, index) => {
        if (pressedTab.title === 'Add') {
            addBrandModal();
        }
        else if(pressedTab.title === 'Orders'){
            navigation.navigate("Orders",{});

        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
            <HeaderApp
                caption={state.selectedBrand.brandName}
                commonStyles={commonStyles}
                state={state}
                user={props.user}
                screenProps={{...props}}
                activeTheme={activeTheme}
                onChangeText={onProductSearch}
            />
            <View style={{ flex: 1, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }}>Product List</Text>
                    <Text style={{ marginRight: 14 }}>Total: {state.productData.length<1?'0':state.productData.length<10?'0'+state.productData.length:state.productData.length}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <ScrollView horizontal contentContainerStyle={{paddingHorizontal: 5, flexDirection: 'row' }}>
                        {
                            state.brandData.map((item, i) => {
                                return <View key={i} style={{...styleProduct.brandContainer}} >
                                    <TouchableOpacity style={{...styleProduct.brandImageContainer}} onPress={() => onSelectBrand(item)}>
                                        <View style={{...styleProduct.brandImageContainerView}}>
                                            <ImageBackground
                                                resizeMode="stretch"
                                                source={item.brandImages && item.brandImages.length > 0 ? { uri: renderPicture(item.brandImages[0].joviImageThumbnail,190, props.user.tokenObj && props.user.tokenObj.token.authToken) } : ''}
                                                style={{...styleProduct.brandImage}}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            })
                        }
                    </ScrollView>
                </View>
                <View style={{ flex: 3, marginHorizontal: 12, marginBottom: 15 }}>
                    <ScrollView contentContainerStyle={{...styleProduct.productListContainer}}>
                        {state.productData.length < 1 ?
                            <View style={{ flex: 1, height: 100, justifyContent: 'center', alignItems: 'center' }}>
                                <Text>No Products Found</Text>
                            </View>
                            :
                            state.productData.map((item, i) => {
                                return <View key={i} style={{...styleProduct.productTab}}>
                                    <TouchableOpacity style={{ width: '100%',padding:10, height: '100%' }} onPress={() => navigation.navigate('Items', { key: 'items', item: { item, data: state.productData, brandObj: state.selectedBrand } })}>
                                        <View style={{...styleProduct.productImageContainer}}>
                                            <ImageBackground
                                                resizeMode="stretch"
                                                source={item.productImages && item.productImages.length > 0 ? { uri: renderPicture(item.productImages[0].joviImageThumbnail,190, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                                style={{...styleProduct.productImage}}
                                            />
                                        </View>
                                            <View style={{...styleProduct.counter(props)}}>
                                                <Text style={{ color: 'white' }}>{item.noOfItems}</Text>
                                            </View>
                                        <View style={{...styleProduct.productName}}><Text style={{...commonStyles.fontStyles(12,props.activeTheme.black,3)}}>{item.productName}</Text></View>
                                    </TouchableOpacity>
                                </View>
                            })
                        }
                    </ScrollView>
                </View>
            </View>
            {props.stackState.keypaidOpen===false&&<SharedFooter activeTheme={activeTheme} activeTab={null} mainDrawerComponentProps={props} drawerProps={props.navigation.drawerProps} onPress={onFooterItemPressed} />}
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
export default connect(mapStateToProps)(Products);