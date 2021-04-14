import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, StyleSheet, Alert, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import commonStyles from '../../styles/styles';
import CustomToast from '../../components/toast/CustomToast';
import { connect } from 'react-redux';
import { HeaderApp } from '../../components/header/CustomHeader';
import { debounce } from 'debounce';
import reAssign from '../../assets/svgIcons/common/reAssign.svg';
import commonIcons from '../../assets/svgIcons/common/common';
import { getRequest, postRequest } from '../../services/api';
import SharedFooter from '../../components/footer/SharedFooter';
import { renderPictureResizeable } from '../../utils/sharedActions';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SvgXml } from 'react-native-svg';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
import { CheckBox } from 'native-base';
import { OPEN_MODAL } from '../../redux/actions/types';
function ResOrderDetails(props) {
    const { navigation, userObj, activeTheme } = props;
    const data = navigation.dangerouslyGetState()?.routes?.filter(item => item.name === 'ResOrderDetails')[0]?.params?.item;
    const [state, setState] = useState({
        "loader": false,
        orderList: [],
        totalAmount: 0,
        joviJobID: 0,
        orderObj: data && data.item && data.item.orderNo ? data?.item : 0,
        focusedItem: null,
    });
    const changeStatusItem = (item) => {
        if (item.pitstopDealID > 0) {
            outOfStock(item);
            return;
        }
        item = {
            ...item,
            jobItemStatus: item.jobItemStatus === 1 ? 2 : 1, jobItemStatusStr: item.jobItemStatusStr === 'Available' ? 'Out Of Stock' : 'Available'
        }
        confirmOrder(item);
    }
    const outOfStock = (item) => {
        let payload = {
            "jobItemID": item.jobItemID,
            "jobItemStatus": item.jobItemStatus === 1 ? 2 : 1,
        }
        postRequest('Api/Vendor/Restaurant/JobDeal/Update', payload, {}, props.dispatch, (res) => {
            if (res.data.statusCode === 200) {
                CustomToast.success('Order Updated');
                getData();
            }
        }, (err) => { if (err) { console.log(err); CustomToast.error('Something went wrong!') } }, '');
    }
    const confirmOrder = (latestArr = false, isConfirmed = false, replacedItem = false) => {
       if(isConfirmed ===true){
        props.dispatch({
            type: OPEN_MODAL,
            payload: {
                visible: false,
                transparent: true,
                okHandler: null,
                onRequestCloseHandler: null,
                ModalContent: null,
                orderRecievedCheck: null,
                notificationModalVisible: true,
                notificationModalContent: {  },
                vendorSkipped: true,
                qrCodeFlag:true,
                qrCodeValue:'Hello Rider',
                modalContentNotification: null,
                modalFlex: null,
                modalHeightDefault: null,
                modelViewPadding: 35,
                fadeAreaViewFlex: 1,
                fadeAreaViewStyle: {},
                imageViewState: {},
            }
        });
       }else{
           let payloadArr = latestArr !== false && isConfirmed === false ? {
               "jobItemID": latestArr.jobItemID,
               "name": latestArr.jobItemName,
               "jobItemStatus": latestArr.jobItemStatus,
               "quantity": latestArr.quantity,
               "price": latestArr.price,
               // "joviJobID": item.joviJobID,
               "pitstopItemID": latestArr.pitstopItemID
           }
               :
               null;
           console.log('Order Request: ', { jobItemListViewModel: payloadArr, replaceJobItemID: replacedItem !== false ? replacedItem.id : 0, replaceJobItemName: replacedItem !== false ? replacedItem.name : null, joviJobID: state.joviJobID, isConfirmed })
   
   
           postRequest('Api/Vendor/Pitstop/JobItemsList/Update', { jobItemListViewModel: payloadArr, replacedJobItemID: isConfirmed === false && replacedItem !== false ? replacedItem.id : 0, replacedJobItemName: isConfirmed === false && replacedItem !== false ? replacedItem.name : null, joviJobID: state.joviJobID, isConfirmed }, {}, props.dispatch, (res) => {
               if (res.data.statusCode === 200) {
                   if (isConfirmed === true) {
                       navigation.goBack();
                       CustomToast.success('Order Confirmed');
                   } else {
                       CustomToast.success('Order Updated');
                       getData();
                   }
               }
           }, (err) => { if (err) { console.log(err); CustomToast.error('Something went wrong!') } }, '');
       }
    }
    const getData = (keywords = false) => {
        console.log('URL', `Api/Vendor/Order/Details/${state.orderObj.orderNo !== 0 ? state.orderObj.orderNo : data.item.orderNo}/${props.user.pitstopID}`)
        getRequest(`Api/Vendor/RestaurantOrder/Details/${state.orderObj.orderNo !== 0 ? state.orderObj.orderNo : data.item.orderNo}/${props.user.pitstopID}`, {
            // "pageNumber": 1,
            // "itemsPerPage": 2,
            // "isPagination": false,
            // "isAscending": true,
            // "pitstopProductID":changeProduct!==false?changeProduct.productID:state.selectedProduct!==0?state.selectedProduct.productID:data.item.productID
        }
            , props.dispatch, (res) => {
                console.log('Order Details Request:', res)
                if (res.data.statusCode === 200) {
                    setState(prevState => ({
                        ...prevState,
                        orderList: res.data.vendorRestaurantOrderDetailsVM.itemsList,
                        joviJobID: res.data.vendorRestaurantOrderDetailsVM.joviJobID,
                        totalAmount: res.data.vendorRestaurantOrderDetailsVM.totalAmount
                    }))
                } else {
                    CustomToast.error("Not Found");
                    setState(prevState => ({
                        ...prevState,
                        orderList: [],
                        totalAmount: 0
                    }))
                }
            }, (err) => {
                console.log('err:  ------->', err)
                debugger;
                if (err) CustomToast.error("Something went wrong");
            }, '');
    }
    useEffect(useCallback(() => {
        getData();

        return () => {
            setState({
                ...state,
                orderList: [],
                paginationInfo: {}
            });
        };
    }, []), []);
    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
            <HeaderApp
                caption={'Order No: ' + state.orderObj.orderNo}
                // caption={props.user?.vendorPitstopDetailsList?.companyName}
                commonStyles={commonStyles}
                state={state}
                screenProps={{ ...props }}
                user={props.user}
                noSearch={true}
                activeTheme={activeTheme}
            />
            <View style={{ flex: 1, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }} onPress={() => { }}>Order List</Text>
                    <Text style={{ marginRight: 14 }}>Total: {state.orderList.length < 1 ? '0' : state.orderList.length < 10 ? '0' + state.orderList.length : state.orderList.length}</Text>
                </View>
                <FlatList
                    data={[...state.orderList]}
                    keyExtractor={(item, index) => item.jobItemID.toString()}
                    renderItem={({ item, i }) => {
                        return <Swipeable
                            key={i}
                            renderRightActions={() => {
                                return (state.orderObj.orderStatus === 1 && item.jobItemStatus !== 4 ?
                                    <View style={{ height: 110, justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => changeStatusItem(item)} style={{ marginRight: 10, elevation: 0 }}>
                                            <SvgXml xml={commonIcons.discontinueIcon()} height={25} width={25} />
                                        </TouchableOpacity>
                                    </View>
                                    :
                                    <View></View>
                                );
                            }}
                        >
                            <View style={{ flex: 1, backgroundColor: '#fff', height: state.focusedItem !== null && state.focusedItem.jobItemID === item.jobItemID ? 270 : 110, borderColor: props.activeTheme.borderColor, borderWidth: 0.5, borderRadius: 15, marginVertical: 5, marginHorizontal: 5, overflow: 'hidden' }}>
                                <View style={{ ...stylesOrder.homeTab({ activeTheme: props.activeTheme, height: 110 }) }}>
                                    {item.jobItemStatusStr === 'Out Of Stock' && <TouchableOpacity onPress={() => setState(pre => ({ ...pre, focusedItem: pre.focusedItem !== null && state.focusedItem.jobItemID === item.jobItemID ? null : { ...item, index: i } }))} style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 901, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ ...commonStyles.fontStyles(22, props.activeTheme.white, 4) }}>Out Of Stock</Text>
                                    </TouchableOpacity>}
                                    <View style={{ ...stylesOrder.homeTabView }}>
                                        <ImageBackground
                                            resizeMode='stretch'
                                            source={item.jobItemImagesList && item.jobItemImagesList.length > 0 ? { uri: renderPictureResizeable(item.jobItemImagesList[0].joviImage, 190, props.user.tokenObj && props.user.tokenObj.token.authToken) } : ''}
                                            style={{ ...stylesOrder.homeTabImage }}
                                        />
                                    </View>
                                    <View style={stylesOrder.homeTabText}>
                                        <TouchableOpacity style={{ flex: 0.9 }} onPress={() => setState(pre => ({ ...pre, focusedItem: pre.focusedItem !== null && state.focusedItem.jobItemID === item.jobItemID ? null : { ...item, index: i } }))}>
                                            <Text style={{ flex: 2, ...stylesOrder.homeTabBrandName, maxWidth: 255, ...commonStyles.fontStyles(14, props.activeTheme.black, 3, '300') }}>{item.jobItemName}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, ...stylesOrder.homeTabDesc(props) }}>{item?.attributeDataVMList?.filter(it => it.attributeTypeName !== 'Quantity').map((it, j) => {
                                                return <Text key={j + state.orderList.length}>{it.productAttrName + "  "}</Text>
                                            })}</View>
                                            <Text style={{ flex: 1, ...stylesOrder.homeTabDesc(props) }}>Rs. {item.price}</Text>
                                        </TouchableOpacity>

                                    </View>
                                    <View style={{ flexDirection: 'row', alignSelf: 'center', marginRight: 19, justifyContent: 'space-around', alignItems: 'center', backgroundColor: props.activeTheme.lightGrey, borderRadius: 20, width: 25, height: 25 }}>
                                        {
                                            <Text style={{}}>{item.quantity}</Text>
                                        }
                                    </View>
                                </View>
                                {state.focusedItem !== null && state.focusedItem.jobItemID === item.jobItemID &&
                                    <ScrollView style={{ height: 20, marginHorizontal: 5 }}>
                                        <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4) }}>
                                            Description
                                        </Text>
                                        <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 3) }}>
                                            {item.description}
                                        </Text>
                                        {item.jobDealOptionList && item.jobDealOptionList.length > 0 && <><Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4) }}>
                                            Selected
                                        </Text>
                                            {item.jobDealOptionList?.map((itemOptions, j) => {
                                                return <View key={j} style={stylesOrder.checkboxContainer}>
                                                    <CheckBox
                                                        checked={true}
                                                        onPress={() => { }}
                                                        style={stylesOrder.checkbox}
                                                        color={props.activeTheme.default}
                                                    />
                                                    <Text style={stylesOrder.label}>{itemOptions.itemName}</Text>
                                                </View>
                                            })}</>}
                                        {item.jobItemOptionList && item.jobItemOptionList.length > 0 && <><Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4) }}>
                                            Selected
                                        </Text>
                                            {item.jobItemOptionList?.map((itemOptions, j) => {
                                                return <View key={j} style={stylesOrder.checkboxContainer}>
                                                    <CheckBox
                                                        checked={true}
                                                        onPress={() => { }}
                                                        style={stylesOrder.checkbox}
                                                        color={props.activeTheme.default}
                                                    />
                                                    <Text style={stylesOrder.label}>{itemOptions.productAttributeName}</Text>
                                                </View>
                                            })}</>}
                                        {item.specialInstructions && item.specialInstructions !== '' ? <><Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4) }}>Special Description</Text>
Î                                            <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 3) }}>
                                                {item.specialInstructions}
                                            </Text>
                                        </>
                                            :
                                            <></>
                                        }
                                    </ScrollView>
                                }
                            </View>
                        </Swipeable>
                    }}
                />
                <View style={{ width: '100%', height: 40, justifyContent: 'space-between', padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white' }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.black, 4) }}>Total</Text>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.black, 4) }}>PKR {state.totalAmount}</Text>

                </View>
                <View style={{ width: '100%', height: 60, flexDirection: 'row' }}>
                    <TouchableOpacity style={{ width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fc3f93' }} onPress={() => { navigation?.navigate('ContactUsPage') }}>
                        <Text style={{ ...commonStyles.fontStyles(17, props.activeTheme.white, 3) }}>Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={state.orderObj.orderStatus === 1 ? 0 : 1} style={{ width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: state.orderObj.orderStatus === 1 ? props.activeTheme.default : props.activeTheme.grey }} onPress={state.orderObj.orderStatus !== 1 ? () => confirmOrder(false, true) : () => { }}>
                        <Text style={{ ...commonStyles.fontStyles(17, props.activeTheme.white, 3) }}>Pass to Rider</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}
const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer
    }
};
const stylesOrder = StyleSheet.create({
    homeTab: props => { return { height: props.height, ...commonStyles.shadowStyles(null, null, null, null, 0.3), backgroundColor: '#fff', flexDirection: 'row' } },
    // homeTabView: { flex: 0.38, paddingTop: 5, overflow: 'hidden', borderRadius: 10 },
    // homeTabImage: {
    //     flex: 1,
    //     top: 1,
    //     marginLeft: 10,
    //     width: '90%',
    //     "height": "90%",
    // },
    homeTabView: { flex: 0.38, margin: 7, overflow: 'hidden', borderRadius: 15 },
    homeTabImage: {
        flex: 1,
        // top: 1,
        // marginLeft: 10,
        width: '100%',
        borderRadius: 15,
        "height": "100%",
    },
    label: {
        margin: 8,
    },
    checkboxContainer: {
        width: '100%', flexDirection: 'row'
    },
    checkbox: {
        alignSelf: "center",
        color: '#7359BE',
        borderColor: '#7359BE',
        borderRadius: 12, margin: 8
    },
    homeTabText: { flex: 0.8, alignSelf: 'flex-start', borderRadius: 25, left: 20, top: 5 },
    homeTabBrandName: { marginTop: 0 },
    homeTabDesc: (props) => { return { ...commonStyles.fontStyles(12, props.activeTheme.black, 1, '300'), padding: 2 } },
    homeTabCounter: (props) => { return { flex: 0.1, width: 5, height: 27, margin: 3, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: props.activeTheme.background } },
    productListContainer: { paddingBottom: 20, justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'wrap' },
    productTab: { height: 180, borderColor: '#929293', backgroundColor: 'white', justifyContent: 'center', alignItems: "center", borderWidth: 0.5, borderRadius: 15, width: '40%', margin: 15 },
    productImageContainer: { flex: 2, width: '100%', justifyContent: 'center', alignItems: 'center' },
    productImage: {
        width: '90%',
        marginLeft: 17,
        zIndex: 900,
        "height": "90%",
    },
    productName: { flex: 1, justifyContent: 'space-between', paddingLeft: 8, paddingRight: 8, alignItems: 'center', width: '100%', flexDirection: 'row', flexWrap: 'wrap' },
    counter: (props) => { return { position: 'absolute', top: 5, right: 10, zIndex: 999, width: 20, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: props.activeTheme.background } }


});
export default connect(mapStateToProps)(ResOrderDetails);