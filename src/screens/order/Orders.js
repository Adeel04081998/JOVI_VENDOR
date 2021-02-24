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
function Orders(props) {
    const { navigation, userObj, activeTheme } = props;
    const [state, setState] = useState({
        "loader": false,
        orderList: [],
        orderListTemp: [],
        paginationInfo: {}
    });
    const getData = (keywords = false) => {
        getRequest('/api/Vendor/OrdersSummary', {}
            , props.dispatch, (res) => {
                console.log('Order Request:', res)
                if (res.data.statusCode === 200) {
                    setState(prevState => ({
                        ...prevState,
                        orderList: res.data.vendorOrdersViewModel.ordersDataList.sort((a,b)=>{if(a['orderStatus']<b['orderStatus']){return -1;}else if(a['orderStatus']>b['orderStatus']){return 1;}else{return 0; }}),
                        orderListTemp: res.data.vendorOrdersViewModel.ordersDataList.sort((a,b)=>{if(a['orderStatus']<b['orderStatus']){return -1;}else if(a['orderStatus']>b['orderStatus']){return 1;}else{return 0; }}),
                        paginationInfo: res.data?.pitstopBrands?.paginations
                    }))
                } else {
                    CustomToast.error("Not Found");
                    setState(prevState => ({
                        ...prevState,
                        orderList: []
                    }))
                }
            }, (err) => {
                if(err.response.data.statusCode===404) CustomToast.error("No Orders Found")
                else if (err) CustomToast.error("Something went wrong");
            }, '');
    }
    const searchOrder = (val) => {
        setState(pre=>({...pre,
            orderList:val===''?pre.orderListTemp:pre.orderListTemp.filter(it=>it.orderNo.toString().includes(val)),
        }))
    }
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
    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
            <HeaderApp
                caption={props.user?.pitstopName}
                commonStyles={commonStyles}
                state={state}
                user={props.user}
                onChangeText={(val) => searchOrder(val)}
                screenProps={{...props}}
                activeTheme={activeTheme}
            />
            <View style={{ flex: 1, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }} onPress={() => { }}>Orders</Text>
                    <Text style={{ marginRight: 14 }}>Total {state.orderList.length}</Text>
                </View>
                <ScrollView contentContainerStyle={{ ...stylesOrder.productListContainer, marginLeft: 10, marginRight: 10 }} onTouchEnd={() => {
                    if (state.isSmModalOpen) showHideModal(false, 1);
                }}>
                    {
                        // [{ orderNo: '12312', orderItems: '05', },{ orderNo: '12312', orderItems: '05', },{ orderNo: '12312', orderItems: '05', },{ orderNo: '12312', orderItems: '05', },{ orderNo: '12312', orderItems: '05', },{ orderNo: '12312', orderItems: '05', },{ orderNo: '12312', orderItems: '05', },{ orderNo: '12312', orderItems: '05', },{ orderNo: '12312', orderItems: '05', }].map((item, i) => {
                        state.orderList.length < 1 ?
                            <View style={{ flex: 1, height: 100, justifyContent: 'center', alignItems: 'center' }}>
                                <Text>No Orders Found</Text>
                            </View>
                            :
                            state.orderList.map((item, i) => {
                                return <View key={i} style={{ ...stylesOrder.productTab,borderWidth:item.orderStatus===1?2:0.5,borderColor:item.orderStatus===1?props.activeTheme.default:'#929293'}}>
                                    <TouchableOpacity style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => navigation.navigate('OrderDetails',{key:'orderDetails',item:{item}})}>
                                        {/* {item.active === true && <View style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 901 }}></View>} */}
                                        <View style={{ ...stylesOrder.productImageContainer, borderColor: props.activeTheme.default, borderWidth: 2, borderRadius: 200, margin: 10, width: '70%', height: '40%' }}>
                                            <Text style={{ ...commonStyles.fontStyles(22, props.activeTheme.default, 10) }}>{item.noOfItems}</Text>
                                        </View>
                                        <View style={{ ...stylesOrder.productName }}>
                                            <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4) }}>Order No: </Text><Text>{item.orderNo}</Text>
                                            <Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.black, 4) }}>Total Price: </Text><Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.black, 3) }}>Rs.{item.totalPrice}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            })
                    }

                </ScrollView>
            </View>
            <SharedFooter activeTheme={activeTheme} activeTab={1} mainDrawerComponentProps={props} drawerProps={props.navigation.drawerProps} onPress={() => { }} />
        </View>
    )
}
const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer
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
export default connect(mapStateToProps)(Orders);