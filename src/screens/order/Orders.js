import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, StyleSheet, Alert, TouchableOpacity, ScrollView, Dimensions, BackHandler } from 'react-native';
import commonStyles from '../../styles/styles';
import CustomToast from '../../components/toast/CustomToast';
import { connect } from 'react-redux';
import { HeaderApp } from '../../components/header/CustomHeader';
import { debounce } from 'debounce';
import { useFocusEffect } from '@react-navigation/native';
import { getRequest, postRequest } from '../../services/api';
import SharedFooter from '../../components/footer/SharedFooter';
import { openModalAction } from '../../redux/actions/modal';
import AddBrandModal from '../../components/modals/AddBrandModal';
import AddProductModalR from '../../components/modals/AddProductModalR';
import plateformSpecific from '../../utils/plateformSpecific';
function Orders(props) {
    const { navigation, modalState, userObj, activeTheme } = props;
    const [state, setState] = useState({
        "loader": false,
        orderList: [],
        orderListTemp: [],
        activeTab: 'Active',
        itemsPerPage: 10,
        paginationInfo: { totalItems: 0 }
    });
    const addBrandProductModal = () => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                props.user.pitstopType === 4 ?
                    <AddProductModalR {...props} onSave={() => { }} />
                    :
                    <AddBrandModal type={1} {...props} onSave={() => { }} />
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
    const getData = (keywords = false, itemsPerPageNew = false,newTab = false) => {
        postRequest('/api/Vendor/OrdersSummary', {
            "pageNumber": 1,
            "itemsPerPage": itemsPerPageNew !== false ? itemsPerPageNew : state.itemsPerPage,
            'genericSearch': keywords !== false ? keywords : '',
            'isLive':newTab!==false?(newTab === 'Active'?true:false):(state.activeTab==='Active'?true:false)
        }, {}
            , props.dispatch, (res) => {
                console.log('Order Request:', res)
                if (res.data.statusCode === 200) {
                    setState(prevState => ({
                        ...prevState,
                        itemsPerPage: itemsPerPageNew !== false ? itemsPerPageNew : prevState.itemsPerPage,
                        orderList: res.data.vendorOrdersViewModel.ordersDataList.sort((a, b) => { if (a['orderNo'] < b['orderNo']) { return 1; } else if (a['orderNo'] > b['orderNo']) { return -1; } else { return 0; } }).sort((a, b) => { if (a['orderStatus'] < b['orderStatus']) { return -1; } else if (a['orderStatus'] > b['orderStatus']) { return 1; } else { return 0; } }),
                        orderListTemp: res.data.vendorOrdersViewModel.ordersDataList.sort((a, b) => { if (a['orderNo'] < b['orderNo']) { return 1; } else if (a['orderNo'] > b['orderNo']) { return -1; } else { return 0; } }).sort((a, b) => { if (a['orderStatus'] < b['orderStatus']) { return -1; } else if (a['orderStatus'] > b['orderStatus']) { return 1; } else { return 0; } }),
                        paginationInfo: res.data?.vendorOrdersViewModel?.paginationInfo
                    }))
                } else {
                    CustomToast.error("Not Found");
                    setState(prevState => ({
                        ...prevState,
                        orderList: []
                    }))
                }
            }, (err) => {
                if (err.statusCode === 404){ CustomToast.error("No Orders Found");setState(pre=>({...pre,itemsPerPage:10,orderList:[],orderListTemp:[],paginationInfo:{totalItems: 0}}))}
                else if (err) CustomToast.error("Something went wrong");
            }, '');
    }
    const searchOrder = debounce((val) => {
        getData(val, false);
    }, 900)
    const onFooterItemPressed = async (pressedTab, index) => {
        if (pressedTab.title === 'Add') {
            addBrandProductModal();
        }
    };
    useFocusEffect(useCallback(() => {
        getData();
        return () => {
            setState({
                ...state,
                orderList: [],
                paginationInfo: {}
            });
        };
    }, []), []);
    useEffect(() => {
        if (modalState.orderRecievedCheck !== null) {
            getData();
        }
    }, [modalState.orderRecievedCheck])
    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
            <HeaderApp
                caption={props.user?.pitstopName}
                commonStyles={commonStyles}
                state={state}
                user={props.user}
                onChangeText={(val) => searchOrder(val)}
                screenProps={{ ...props }}
                activeTheme={activeTheme}
            />
            <View style={{ zIndex: 1, flex: 1, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }} onPress={() => { }}>Orders</Text>
                    <Text style={{ marginRight: 14 }}>Total: {state.paginationInfo.totalItems < 1 ? '0' : state.paginationInfo.totalItems < 10 ? '0' + state.paginationInfo.totalItems : state.paginationInfo.totalItems}</Text>
                </View>
                <View style={{ width: '100%', flexDirection: 'row', height: 30, marginVertical: 10 }}>
                    {
                        ['Active', 'History'].map((item, i) => {
                            return <TouchableOpacity onPress={()=>{getData(false,false,item);setState(pre=>({...pre,itemsPerPage:10, activeTab:item}))}} key={i} style={{ width: '50%', borderBottomColor:state.activeTab === item?props.activeTheme.default:props.activeTheme.grey, borderBottomWidth: 1, alignItems: 'center', height:state.activeTab === item?'90%':'100%' }}>
                                <Text style={{fontWeight:'bold', color:state.activeTab === item?props.activeTheme.default:props.activeTheme.grey}}>{item}</Text>
                            </TouchableOpacity>
                        })
                    }
                    {/* <View style={{ width: '50%', borderBottomColor: 'red', borderBottomWidth: 1, alignItems: 'center', height: '100%' }}>
                        <Text>Active</Text>
                    </View>
                    <View style={{ width: '50%', alignItems: 'center', borderBottomWidth: 1, height: '100%' }}>
                        <Text>Recent</Text>
                    </View> */}
                </View>
                <ScrollView contentContainerStyle={{ ...stylesOrder.productListContainer, marginLeft: 10, marginRight: 10 }}
                    onScroll={(e) => {
                        let paddingToBottom = 10;
                        paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                        if (e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom) {
                            // make something...
                            if (state.itemsPerPage < state.paginationInfo.totalItems) {
                                getData(false, state.itemsPerPage + 10);
                            }
                        }
                    }
                    }
                >
                    {
                        state.orderList.length < 1 ?
                            <View style={{ flex: 1, height: 100, justifyContent: 'center', alignItems: 'center' }}>
                                <Text>No Orders Found</Text>
                            </View>
                            :
                            state.orderList.map((item, i) => {
                                return <View key={i} style={{ ...stylesOrder.productTab, borderWidth: item.orderStatus === 1 ? 2 : 0.5, borderColor: item.orderStatus === 1 ? props.activeTheme.default : '#929293' }}>
                                    <TouchableOpacity style={{ width: '100%', flexDirection: 'row', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={props.user.pitstopType === 4 ? () => navigation.navigate('ResOrderDetails', { key: 'resOrderDetails', item: { item } }) : () => navigation.navigate('OrderDetails', { key: 'orderDetails', item: { item } })}>
                                        {/* {item.active === true && <View style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 901 }}></View>} */}
                                        <View style={{ ...stylesOrder.productImageContainer, backgroundColor: item.orderStatus === 3 ? props.activeTheme.lightGrey : item.isVendorConfirmed === true && item.orderStatus === 1 ? '#ff8c00' : item.orderStatus === 1 ? props.activeTheme.defaultLight : 'white', borderColor: props.activeTheme.default, borderWidth: 2, borderRadius: 200, width: 70, height: 75 }}>
                                            <Text style={{ ...commonStyles.fontStyles(22, item.orderStatus === 1 ? props.activeTheme.white : props.activeTheme.default, 10) }}>{item.orderNo}</Text>
                                        </View>
                                        <View style={{ ...stylesOrder.productName }}>
                                            <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4) }}>Total Price: </Text><Text>{item.totalPrice}</Text>
                                            <Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.black, 4) }}>No of Items: </Text><Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.black, 3) }}>{item.noOfItems}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            })
                    }

                </ScrollView>
            </View>
            {props.stackState.keypaidOpen === false && <SharedFooter activeTheme={activeTheme} activeTab={1} mainDrawerComponentProps={props} drawerProps={props.navigation.drawerProps} onPress={onFooterItemPressed} />}
        </View>
    )
}
const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer,
        modalState: store.modalReducer,

    }
};
const stylesOrder = StyleSheet.create({
    homeTab: { height: 110, ...commonStyles.shadowStyles(null, null, null, null, 0.3), backgroundColor: '#fff', borderColor: '#929293', borderWidth: 0.5, borderRadius: 15, flexDirection: 'row', marginVertical: 5 },
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
    homeTabCounter: (props) => { return { flex: 0.1, width: 5, height: 27, margin: 3, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: props.activeTheme.background } },
    productListContainer: { paddingBottom: 20, justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'wrap' },
    // productTab: { height: 180, borderColor: '#929293', backgroundColor: 'white', justifyContent: 'center', alignItems: "center", borderWidth: 0.5, borderRadius: 15, width: '40%', margin: 15 },
    productTab: { height: 100, marginVertical: 5, borderColor: '#929293', backgroundColor: 'white', justifyContent: 'center', alignItems: "center", borderWidth: 0.5, borderRadius: 15, width: '100%' },
    productImageContainer: { flex: 1, marginHorizontal: 5, width: '100%', height: 20, justifyContent: 'center', alignItems: 'center' },
    productImage: {
        width: '90%',
        marginLeft: 17,
        zIndex: 900,
        "height": "90%",
    },
    productName: { flex: 4, justifyContent: 'space-between', paddingLeft: 8, paddingRight: 8, alignItems: 'flex-start', width: '100%', flexDirection: 'column', },
    counter: (props) => { return { position: 'absolute', top: 5, right: 10, zIndex: 999, width: 20, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: props.activeTheme.background } }


});
export default connect(mapStateToProps)(Orders);