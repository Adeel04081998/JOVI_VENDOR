import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground,StyleSheet, View, Alert, TouchableOpacity, ScrollView, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { renderPicture, renderPictureResizeable, sharedConfirmationAlert} from "../../utils/sharedActions";
import {  getRequest, postRequest } from '../../services/api';
import { HeaderApp } from '../../components/header/CustomHeader';
import commonStyles from '../../styles/styles';
import CustomToast from '../../components/toast/CustomToast';
import { useFocusEffect } from '@react-navigation/native';
import SharedFooter from '../../components/footer/SharedFooter';
// import dummy from '../../assets/card-image.png';
import dummy from '../../assets/card-image.png';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
import AddBrandModal from '../../components/modals/AddBrandModal';
import { debounce } from 'debounce';
import AddProductModalR from '../../components/modals/AddProductModalR';
import AddUpdateDealModal from '../../components/modals/AddUpdateDealModal';
function RestaurantDeals(props) {
    const { navigation, userObj, activeTheme } = props;
    const data = navigation.dangerouslyGetState()?.routes?.filter(item => item.name === 'RestaurantDeals')[0]?.params?.item;
    const [state, setState] = useState({
        dealsList: [],
        subCategoryObj:data
    })
    const addProductModalF = (deal=null) => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <AddUpdateDealModal updateDeal={deal}  {...props} onSave={()=>{getData()}} />
                // <AddProductModalR {...props} onSave={()=>{getData()}} />
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
    const getData = (keywords=false) => {

        postRequest('Api/Vendor/Restaurant/Deals/List',{
            "pageNumber": 1,
            "itemsPerPage": 1000,
            "isAscending": true,
            "pitstopID": props.user.pitstopID,
            "categoryID": data.categoryID
          },{}
        , props.dispatch, (res) => {
            console.log('Restaurant Product Request:', res)
            if(res.data.statusCode === 200){
                setState(prevState => ({
                    ...prevState,
                    dealsList: res.data.pitstopDealsListViewModel.data,
                    paginationInfo:res.data.pitstopDealsListViewModel.paginationInfo
                }))
            }else{
                CustomToast.error("Not Found");
                setState(prevState => ({
                    ...prevState,
                    dealsList: []
                }))
            }
        }, (err) => {
            if (err) CustomToast.error("Something went wrong");
        }, '');
    }
    const searchBrand = debounce((val) => {
        // getData(val);
    },900)
    useFocusEffect(useCallback(() => {
        getData();
        return () => {
            setState({
                ...state,
                dealsList:[]
            })
        };
    }, []), []);
    const onFooterItemPressed = async (pressedTab, index) => {
        if(pressedTab.title==='Add'){
            addProductModalF();
        }else if(pressedTab.title === 'Orders'){
            navigation.navigate("Orders",{});
        }
         else{
        }
    }; 
    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>


            <HeaderApp
                caption={'Deals'}
                commonStyles={commonStyles}
                state={state}
                user={props.user}
                onChangeText={searchBrand}
                activeTheme={activeTheme}
                screenProps={{...props}}
            />

            <View style={{ flex: 1, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }} >{state.subCategoryObj.name}</Text>
                    <Text style={{ marginRight: 14 }}>Total: {state.dealsList.length < 1 ? '0' : state.dealsList.length < 10 ? '0' + state.dealsList.length : state.dealsList.length}</Text>
                </View>
                <ScrollView style={{ flex: 1,marginHorizontal:8 }} >
                    {/* <View style={{ flex: 1, marginHorizontal: 12, marginBottom: 35 }}> */}
                        {state.dealsList.length>0&&
                            state.dealsList.map((item, i) => {
                                return <View key={i} style={{...stylesHome.homeTab({activeTheme:props.activeTheme})}}>
                                    <View style={{...stylesHome.homeTabView}}>
                                        <ImageBackground
                                            resizeMode='stretch'
                                            source={item.dealImagesList&&item.dealImagesList.length>0?{uri:renderPicture(item.dealImagesList[0].joviImageThumbnail)}:dummy}
                                            // source={item.brandImages && item.brandImages.length > 0 ? { uri: renderPicture(item.brandImages[0].joviImage, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                            style={{...stylesHome.homeTabImage}}
                                        />
                                    </View>
                                    <TouchableOpacity style={stylesHome.homeTabText} onPress={()=>addProductModalF(item)}>
                                        <View style={{ flex: 0.9 }}>
                                            <Text style={{...stylesHome.homeTabBrandName, ...commonStyles.fontStyles(18, props.activeTheme.black, 1, '300')}}>{item.title}</Text>
                                            <Text style={{...stylesHome.homeTabDesc(props)}}>{item.description}</Text>
                                            <Text style={{...stylesHome.homeTabDesc(props,12,4)}}>Rs.{item.price}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    {/* <View style={{...stylesHome.homeTabCounter(props)}}>
                                        <Text style={{ color: 'white' }}>{item.noOfProducts}</Text>
                                    </View> */}
                                </View>
                            })
                        }
                </ScrollView>
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
const stylesHome = StyleSheet.create({
    homeTab:props=>{return { height: 130, ...commonStyles.shadowStyles(null, null, null, null, 0.3), backgroundColor: '#fff', borderColor: props.activeTheme.borderColor, borderWidth: 0.5, borderRadius: 15, flexDirection: 'row', marginVertical: 5 }},
    homeTabView:{ flex: 0.38,margin:7, overflow: 'hidden', borderRadius: 15 },
    homeTabImage:{
        flex: 1,
        // top: 1,
        // marginLeft: 10,
        width: '100%',
        borderRadius:15,
        "height": "100%",
    },
    // homeTabView:{ flex: 0.38,paddingTop:5, overflow: 'hidden', borderRadius: 10 },
    // homeTabImage:{
    //     flex: 1,
    //     top: 1,
    //     marginLeft: 10,
    //     width: '90%',
    //     "height": "90%",
    // },
    homeTabText:{ flex: 0.8, alignSelf: 'flex-start', borderRadius: 25, left: 20, top: 5 },
    homeTabBrandName:{ marginTop: 0},
    homeTabDesc:(props,fSize=10,fWeight=1)=>{return{ maxWidth: '90%', ...commonStyles.fontStyles(fSize, props.activeTheme.black, fWeight, '300'), padding: 2} },
    homeTabCounter:(props)=>{return { flex: 0.1, width: 5, height: 27, margin: 3, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: props.activeTheme.background }}

});
export default connect(mapStateToProps)(RestaurantDeals);

