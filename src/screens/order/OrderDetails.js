import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, StyleSheet, Alert, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import commonStyles, { tabStyles } from '../../styles/styles';
import CustomToast from '../../components/toast/CustomToast';
import { connect } from 'react-redux';
import { HeaderApp } from '../../components/header/CustomHeader';
import { debounce } from 'debounce';
import reAssign from '../../assets/svgIcons/common/reAssign.svg';
import commonIcons from '../../assets/svgIcons/common/common';
import { getRequest, postRequest } from '../../services/api';
import SharedFooter from '../../components/footer/SharedFooter';
import { getHubConnectionInstance, renderPictureResizeable } from '../../utils/sharedActions';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SvgXml } from 'react-native-svg';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import ReplaceOrderItem from '../../components/modals/ReplaceOrderItem';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
import { OPEN_MODAL } from '../../redux/actions/types';
function OrderDetails(props) {
    const { navigation, userObj, activeTheme } = props;
    const data = navigation.dangerouslyGetState()?.routes?.filter(item => item.name === 'OrderDetails')[0]?.params?.item;
    const [state, setState] = useState({
        "loader": false,
        orderList: [],
        totalAmount: 0,
        joviJobID: 0,
        orderObj: data && data.item && data.item.orderNo ? data?.item : 0,
    });
    const counterChange = (item, index) => {
        if (index === 0 && item.quantity - 1 === 0) return;
        if (index !== 0 && (item.quantity + 1) > item.actualQuantity) {
            return;
        }
        item = {
            ...item,
            quantity: index === 0 ? (item.quantity < 1 ? 0 : item.quantity - 1) : item.quantity + 1
        }
        // let newArr = state.orderList.map(it => {
        //     if (it.jobItemID === item.jobItemID) {
        //         return item;
        //     } else {
        //         return it;
        //     }
        // })
        // setState(pre => ({ ...pre, orderList: newArr }));
        confirmOrder(item);
    }
    const changeStatusItem = (item) => {
        item = {
            ...item,
            jobItemStatus: item.jobItemStatus === 1 ? 2 : 1, jobItemStatusStr: item.jobItemStatusStr === 'Available' ? 'Out Of Stock' : 'Available'
        }
        // let arr = state.orderList.map(it => {
        //     if (it.jobItemID === item.jobItemID) {
        //         return { ...item,};
        //     } else {
        //         return it;
        //     }
        // });
        // setState(pre => ({
        //     ...pre,
        //     orderList: arr
        // }));
        confirmOrder(item);
    }
    const confirmOrder = (latestArr = false, isConfirmed = false, replacedItem = false) => {
        if (isConfirmed === true) {
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
                    notificationModalContent: {},
                    vendorSkipped: true,
                    qrCodeFlag: true,
                    qrCodeValue: state.joviJobID.toString() ?? '0000',
                    modalContentNotification: null,
                    modalFlex: null,
                    modalHeightDefault: null,
                    modelViewPadding: 35,
                    fadeAreaViewFlex: 1,
                    fadeAreaViewStyle: {},
                    imageViewState: {},
                }
            });
        } else {
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
    const confirmOrderOld = (latestArr = false, isConfirmed = false, replacedItem = false) => {
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
    const itemReplaceSuccess = (prevItem, replacedItem) => {
        // let newArr = state.orderList.map(it => {
        //     if (it.jobItemID === prevItem.jobItemID) {
        //         return { ...it, jobItemStatus: 4 };
        //     } else {
        //         return { ...it };
        //     }
        // });
        let newObj = {
            jobItemID: 0,
            jobItemName: replacedItem.itemName,
            jobItemStatus: 1,
            quantity: prevItem.quantity,
            price: replacedItem.price,
            joviJobID: prevItem.joviJobID,
            "pitstopItemID": replacedItem.itemID
        }
        // newArr = [...newArr, newObj];
        confirmOrder(newObj, false, { id: prevItem.jobItemID, name: prevItem.jobItemName });
    }
    const replaceItem = (item) => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <ReplaceOrderItem itemReplace={item} {...props} onSave={(replacedItem) => itemReplaceSuccess(item, replacedItem)} />
            ),
            modalHeight: Dimensions.get('window').height * 0.65,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }
    const disableQuantityCounter = (item, idx) => {
        let color = item.quantity === (item.actualQuantity) && idx === 2 ? props.activeTheme.gray : (item.quantity - 1 === 0 && idx === 0) ? props.activeTheme.gray : '#fff';
        return color;
    }
    const getData = (keywords = false) => {
        console.log('URL', `Api/Vendor/Order/Details/${state.orderObj.orderNo !== 0 ? state.orderObj.orderNo : data.item.orderNo}/${props.user.pitstopID}`)
        getRequest(`Api/Vendor/Order/Details/${state.orderObj.orderNo !== 0 ? state.orderObj.orderNo : data.item.orderNo}/${props.user.pitstopID}`, {
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
                        orderList: res.data.vendorOrderDetailsVM.itemsList,
                        joviJobID: res.data.vendorOrderDetailsVM.joviJobID,
                        totalAmount: res.data.vendorOrderDetailsVM.totalAmount
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
                if (err) CustomToast.error("Something went wrong");
            }, '');
    }
    useEffect(useCallback(() => {
        getData();
        getHubConnectionInstance('VendorJobCompleted')?.on('VendorJobCompleted', (orderId, orderMsg) => {
            if(data?.item?.orderNo === orderId){
                navigation.goBack();
            }
            console.log('---------------------------> On Vendor Job Complete Signal R: ', orderId, orderMsg);
            props.dispatch({
                type: OPEN_MODAL,
                payload: {
                    visible: false,
                    transparent: true,
                    okHandler: null,
                    onRequestCloseHandler: null,
                    ModalContent: null,
                    orderRecievedCheck: new Date().getTime(),
                    notificationModalVisible: true,
                    notificationModalContent: { orderId, orderMsg },
                    vendorSkipped: true,
                    modalContentNotification: null,
                    modalFlex: null,
                    modalHeightDefault: null,
                    modelViewPadding: 35,
                    fadeAreaViewFlex: 1,
                    fadeAreaViewStyle: {},
                    imageViewState: {},
                }
            });
        });
        return () => {
            setState({
                ...state,
                orderList: [],
                paginationInfo: {}
            });
            getHubConnectionInstance('VendorJobCompleted')?.on('VendorJobCompleted', (orderId, orderMsg) => {
                console.log('---------------------------> On Vendor Job Complete Signal R: ', orderId, orderMsg);
                props.dispatch({
                    type: OPEN_MODAL,
                    payload: {
                        visible: false,
                        transparent: true,
                        okHandler: null,
                        onRequestCloseHandler: null,
                        ModalContent: null,
                        orderRecievedCheck: new Date().getTime(),
                        notificationModalVisible: true,
                        notificationModalContent: { orderId, orderMsg },
                        vendorSkipped: true,
                        modalContentNotification: null,
                        modalFlex: null,
                        modalHeightDefault: null,
                        modelViewPadding: 35,
                        fadeAreaViewFlex: 1,
                        fadeAreaViewStyle: {},
                        imageViewState: {},
                    }
                });
            });
        };
    }, []), []);
    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
            <HeaderApp
                caption={'Order No: ' + state.orderObj.orderNo}
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
                                        {props.user.pitstopType !== 4 && <TouchableOpacity onPress={() => replaceItem(item)} style={{ marginRight: 2, width: 40, elevation: 0 }}>
                                            <SvgXml xml={commonIcons.replaceIcon()} height={25} width={35} />
                                        </TouchableOpacity>}
                                    </View>
                                    :
                                    <View></View>
                                );
                            }}
                        >
                            <View style={{ ...tabStyles.tabContainer(props.activeTheme, null, null, null, null, 0.3), margin: 5 }}>
                                {item.jobItemStatusStr === 'Out Of Stock' && <View style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 901, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ ...commonStyles.fontStyles(22, props.activeTheme.white, 4) }}>Out Of Stock</Text>
                                </View>}
                                {item.jobItemStatus === 4 && <View style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 901, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ ...commonStyles.fontStyles(22, props.activeTheme.white, 4) }}>Replaced</Text>
                                </View>}
                                <View style={{ ...tabStyles.imageTabContainer }}>
                                    <ImageBackground
                                        resizeMode='stretch'
                                        source={item.jobItemImageList && item.jobItemImageList.length > 0 ? { uri: renderPictureResizeable(item.jobItemImageList[0], 190, props.user.tokenObj && props.user.tokenObj.token.authToken) } : ''}
                                        style={{ ...tabStyles.imageTab }}
                                    />
                                </View>
                                <View style={tabStyles.tabTextContainer}>
                                    <View style={{ flex: 0.9 }}>
                                        <Text style={{ flex: 2, ...tabStyles.tabTitle(14, props.activeTheme.black, 3, '300'), maxWidth: 255 }}>{item.brandName+' '+item.jobItemName}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, ...tabStyles.tabDescription(12, props.activeTheme.black, 1, '300') }}>{item.attributeDataVMList.filter(it => it.attributeTypeName !== 'Quantity').map((it, j) => {
                                            if (it.attributeTypeName === 'Color') {
                                                return <View key={j + state.orderList.length} style={{ backgroundColor: it.productAttrName.toLowerCase(), height: 13, width: 13, borderRadius: 10, marginRight: 5 }}></View>
                                            }
                                            return <Text key={j + state.orderList.length}>{it.productAttrName + "  "}</Text>
                                        })}</View>
                                        <Text style={{ flex: 1, ...tabStyles.tabDescription(12, props.activeTheme.black, 1, '300') }}>Rs. {item.price}</Text>
                                    </View>
                                </View>
                                {state.orderObj.orderStatus === 1 ? <View style={{ flexDirection: 'row',left:25, alignSelf: 'center', justifyContent: 'space-around', alignItems: 'center', backgroundColor: props.activeTheme.lightGrey, borderRadius: 20, width: 70, height: 25 }}>
                                    {
                                        ['-', item.quantity, '+'].map((btn, idx) => idx === 1 ? <Text key={idx} style={{}}>{btn}</Text> : <TouchableOpacity key={idx} style={{ backgroundColor: disableQuantityCounter(item, idx), height: 22, width: 22, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} onPress={() => counterChange(item, idx)}>
                                            <Text style={{}}>{btn}</Text>
                                        </TouchableOpacity>)
                                    }
                                </View>
                                    : <View style={{ flexDirection: 'row', alignSelf: 'center', marginRight: 0, justifyContent: 'space-around', alignItems: 'center', backgroundColor: props.activeTheme.lightGrey, borderRadius: 20, width: 25, height: 25 }}>
                                        {
                                            <Text>{item.quantity}</Text>
                                        }
                                    </View>
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
                    <TouchableOpacity activeOpacity={state.orderObj.orderStatus === 1 ? 0 : 1} style={{ width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: state.orderObj.orderStatus === 1 ? props.activeTheme.default : props.activeTheme.grey }} onPress={state.orderObj.orderStatus === 1 ? (props?.user?.scanningQRRequired === true ? () => confirmOrder(false, true) : () => confirmOrderOld(false, true)) : () => { }}>
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
export default connect(mapStateToProps)(OrderDetails);