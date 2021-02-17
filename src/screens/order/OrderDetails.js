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
import AddBrandModal from '../../components/modals/AddBrandModal';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
function OrderDetails(props) {
    const { navigation, userObj, activeTheme } = props;
    const data = navigation.dangerouslyGetState()?.routes?.filter(item => item.name === 'OrderDetails')[0]?.params?.item;
    const [state, setState] = useState({
        "loader": false,
        orderList: [],
        totalAmount:0,
        orderObj: data && data.item && data.item.orderNo ? data?.item : 0,
    });
    const counterChange = (item,index) => {
        if(index!==0&&(item.quantity + 1)>item.quantityBackup){
            return;
        }
        item = {...item,
            quantity: index === 0 ? (item.quantity < 1 ? 0 : item.quantity - 1) : item.quantity + 1
        }
        let newArr = state.orderList.map(it=>{
            if(it.jobItemID === item.jobItemID){
                return item;
            }else{
                return it;
            }
        })
        setState(pre => ({ ...pre, orderList:newArr}));
        confirmOrder(newArr);
    }
    const changeStatusItem = (item) => {
        let arr = state.orderList.map(it => {
            if (it.jobItemID === item.jobItemID) {
                return { ...it, jobItemStatus: it.jobItemStatus === 1 ? 2 : 1, jobItemStatusStr: it.jobItemStatusStr === 'Available' ? 'Out Of Stock' : 'Available' };
            } else {
                return it;
            }
        });
        setState(pre => ({
            ...pre,
            orderList: arr
        }));
        confirmOrder(arr);
    }
    const confirmOrder = (latestArr = false,isConfirmed=false) => {
        let payloadArr = (latestArr !== false ? latestArr : state.orderList).map(item => {
            return {
                "jobItemID": item.jobItemID,
                "name": item.jobItemName,
                "jobItemStatus": item.jobItemStatus,
                "quantity": item.quantity,
                "price": item.price,
                "joviJobID": item.joviJobID,
                "pitstopItemID": item.pitstopItemID
            }
        });
        console.log(payloadArr)
        postRequest('Api/Vendor/Pitstop/JobItemsList/Update', { jobItemListViewModel: payloadArr,isConfirmed }, {}, props.dispatch, (res) => {
            if (res.data.statusCode === 200) {
                CustomToast.success('Order Updated');
                if(isConfirmed === true){
                    navigation.goBack();
                }
                // getData();
            }
        }, (err) => { if (err) {console.log(err); CustomToast.error('Something went wrong!')} }, '');
    }
    const replaceItem = (item) => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <AddBrandModal itemReplace={item} type={1} {...props} onSave={() => { getData() }} />
            ),
            // modalFlex: 0,
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }
    const getData = (keywords = false) => {
        getRequest(`Api/Vendor/Order/Details/${state.orderObj.orderNo !== 0 ? state.orderObj.orderNo : data.item.orderNo}`, {
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
                        orderList: res.data.vendorOrderDetailsVM.itemsList.map(it=>{return{...it,quantityBackup:it.quantity}}),
                        totalAmount:res.data.vendorOrderDetailsVM.totalAmount
                    }))
                } else {
                    CustomToast.error("Not Found");
                    setState(prevState => ({
                        ...prevState,
                        orderList: [],
                        totalAmount:0
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
                    <Text style={{ marginRight: 14 }}>Total {state.orderList.length}</Text>
                </View>
                <FlatList
                    data={[...state.orderList]}
                    keyExtractor={(item, index) => item.jobItemID.toString()}
                    renderItem={({ item, i }) => {
                        return <Swipeable
                            key={i}
                            renderRightActions={() => {
                                return (
                                    <View style={{ height: 110, justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => replaceItem(item)} style={{ marginRight: 2, width: 40, elevation: 0 }}>
                                            <SvgXml xml={commonIcons.replaceIcon()} height={25} width={35} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => changeStatusItem(item)} style={{ marginRight: 10, elevation: 0 }}>
                                            <SvgXml xml={commonIcons.outOfStock()} height={25} width={25} />
                                        </TouchableOpacity>
                                    </View>
                                );
                            }}
                        >
                            <View style={{ ...stylesOrder.homeTab({activeTheme:props.activeTheme}), margin: 5 }}>
                                {item.jobItemStatusStr === 'Out Of Stock' && <View style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 901, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ ...commonStyles.fontStyles(22, props.activeTheme.white, 4) }}>Out Of Stock</Text>
                                </View>}
                                <View style={{ ...stylesOrder.homeTabView }}>
                                    <ImageBackground
                                        resizeMode='stretch'
                                        source={item.jobItemImageList && item.jobItemImageList.length > 0 ? { uri: renderPictureResizeable(item.jobItemImageList[0], 190, props.user.tokenObj && props.user.tokenObj.token.authToken) } : ''}
                                        // source={item.brandImages && item.brandImages.length > 0 ? { uri: renderPicture(item.brandImages[0].joviImage, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                        style={{ ...stylesOrder.homeTabImage }}
                                    />
                                </View>
                                <View style={stylesOrder.homeTabText}>
                                    <View style={{ flex: 0.9 }}>
                                        <Text style={{ ...stylesOrder.homeTabBrandName, maxWidth: 255, ...commonStyles.fontStyles(16, props.activeTheme.black, 3, '300') }}>{item.jobItemName}</Text>
                                        <View style={{flexDirection:'row', ...stylesOrder.homeTabDesc(props) }}>{item.attributeDataVMList.filter(it => it.attributeTypeName !== 'Quantity').map(it => {if(it.attributeTypeName==='Color'){return <View key={i} style={{justifyContent:'center',marginHorizontal:5,paddingTop:3}}><View style={{backgroundColor:it.productAttrName.toLowerCase(),height:13,width:13,borderRadius:10}}></View><Text>{' '}</Text></View>} return <Text>{it.productAttrName + "  "}</Text> })}</View>
                                        <Text style={{ ...stylesOrder.homeTabDesc(props) }}>Rs. {item.price}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignSelf: 'center', marginRight: 19, justifyContent: 'space-around', alignItems: 'center', backgroundColor: props.activeTheme.lightGrey, borderRadius: 20, width: 70, height: 25 }}>
                                    {
                                        ['-', item.quantity, '+'].map((btn, idx) => idx === 1 ? <Text key={idx} style={{}}>{btn}</Text> : <TouchableOpacity key={idx} style={{ backgroundColor: '#fff', height: 22, width: 22, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} onPress={() => counterChange(item,idx)}>
                                            <Text style={{}}>{btn}</Text>
                                        </TouchableOpacity>)
                                    }
                                </View>
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
                    <TouchableOpacity style={{ width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: props.activeTheme.default }} onPress={() => confirmOrder(false,true)}>
                        <Text style={{ ...commonStyles.fontStyles(17, props.activeTheme.white, 3) }}>Confirm</Text>
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
    homeTab:props=> {return{ height: 110, ...commonStyles.shadowStyles(null, null, null, null, 0.3), backgroundColor: '#fff', borderColor: props.activeTheme.borderColor, borderWidth: 0.5, borderRadius: 15, flexDirection: 'row', marginVertical: 5 }},
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
export default connect(mapStateToProps)(OrderDetails);