import React, { useState, useCallback } from 'react';
import { Text, ImageBackground, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { renderPicture} from "../../utils/sharedActions";
import {  postRequest } from '../../services/api';
import { HeaderApp } from '../../components/header/CustomHeader';
import commonStyles, { tabStyles } from '../../styles/styles';
import CustomToast from '../../components/toast/CustomToast';
import { useFocusEffect } from '@react-navigation/native';
import SharedFooter from '../../components/footer/SharedFooter';
import dummy from '../../assets/card-image.png';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
import blockSvg from '../../assets/svgIcons/common/block.svg';
import AddProductModalR from '../../components/modals/AddProductModalR';
import UpdateR_Product from '../../components/modals/UpdateR_ProductModal';

function RestaurantProducts(props) {
    const { navigation, activeTheme } = props;
    const data = navigation.dangerouslyGetState()?.routes?.filter(item => item?.name === 'ProductsRes')[0]?.params?.item;
    const [state, setState] = useState({
        productList: [],
        productListTemp: [],
        subCatObj: data,
    })
    const updateRestaurantProduct = (product) => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <UpdateR_Product product={product} {...props} onSave={() => { getData() }} />
            ),
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }
    const addProductModalF = () => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <AddProductModalR {...props} onSave={() => { getData() }} />
            ),
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }
    const getData = (keywords = false) => {
        postRequest('Api/Vendor/Restaurant/ProductByCategory/list', {
            "pitstopID": props.user.pitstopID,
            "categoryID": data.categoryID
        }, {}
            , props.dispatch, (res) => {
                console.log('Restaurant Product Request:', res)
                if (res.data.statusCode === 200) {
                    setState(prevState => ({
                        ...prevState,
                        productList: res.data.productsByCategory,
                        productListTemp: res.data.productsByCategory,
                    }))
                } else {
                    CustomToast.error("Not Found");
                    setState(prevState => ({
                        ...prevState,
                        productList: []
                    }))
                }
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '');
    }
    const searchProduct = (val) => {
        // getData(val);
        setState(pre => ({
            ...pre,
            productList: val === '' ? pre.productListTemp : pre.productListTemp.filter(item => { return item.productName.toLowerCase().includes(val.toLowerCase()) })
        }));
    }
    useFocusEffect(useCallback(() => {
        getData();
        return () => {
            setState({
                ...state,
                productList: [],
                subCatObj: {}
            })
            // backHandler.remove();

        };
    }, []), []);
    const onFooterItemPressed = async (pressedTab, index) => {
        if (pressedTab.title === 'Add') {
            addProductModalF();
        } else if (pressedTab.title === 'Orders') {
            navigation.navigate("Orders", {});

        }
        else {
        }

    };
    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
            <HeaderApp
                caption={data?.name}
                commonStyles={commonStyles}
                state={state}
                user={props.user}
                onChangeText={searchProduct}
                activeTheme={activeTheme}
                screenProps={{ ...props }}
            />
            <View style={{ flex: 1, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }}>Product List</Text>
                    <Text style={{ marginRight: 14 }}>Total: {state.productList.length < 1 ? '0' : state.productList.length < 10 ? '0' + state.productList.length : state.productList.length}</Text>
                </View>
                <ScrollView style={{ flex: 1, marginHorizontal: 8 }} >
                    {/* <View style={{ flex: 1, marginHorizontal: 12, marginBottom: 35 }}> */}
                    {state.productList.length > 0 ?
                        state.productList.map((item, i) => {
                            return <View key={i} style={{ ...tabStyles.tabContainer(props.activeTheme,null,null,null,null,0.3) }} >
                                {item.availabilityStatusStr === 'Out Of Stock' && <TouchableOpacity onPress={()=>updateRestaurantProduct(item)} style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 901 }}></TouchableOpacity>}
                                {item.availabilityStatusStr === 'Discontinued' && <TouchableOpacity onPress={()=>updateRestaurantProduct(item)} style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 901, justifyContent: 'center', alignItems: 'center' }}>
                                    <SvgXml xml={blockSvg} height={'60%'} width={'60%'} />
                                </TouchableOpacity>}
                                <View style={{ ...tabStyles.imageTabContainer }}>
                                    <ImageBackground
                                        resizeMode='stretch'
                                        source={item.productImageList && item.productImageList.length > 0 ? { uri: renderPicture(item.productImageList[0].joviImageThumbnail) } : dummy}
                                        style={{ ...tabStyles.imageTab }}
                                    />
                                </View>
                                <TouchableOpacity style={tabStyles.tabText} onPress={() => updateRestaurantProduct(item)}>
                                    <View style={{ flex: 0.9 }}>
                                        <Text style={{...tabStyles.tabTitle(18, props.activeTheme.black, 1, '300')}}>{item?.productName}</Text>
                                        <Text style={{ ...tabStyles.tabDescription(10, props.activeTheme.black, 1, '300') }}>{item?.description?.toLocaleUpperCase()}</Text>
                                        <Text style={{ ...tabStyles.tabDescription(12, props.activeTheme.black, 4) }}>Rs.{item?.basePrice}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        })
                        :
                        <View style={{ flex: 1, height: 100, justifyContent: 'center', alignItems: 'center' }}>
                            <Text>No Products Found</Text>
                        </View>
                    }
                </ScrollView>
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
export default connect(mapStateToProps)(RestaurantProducts);

