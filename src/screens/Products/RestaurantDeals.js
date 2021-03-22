import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground,StyleSheet, View, Alert, TouchableOpacity, ScrollView, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { renderPicture, renderPictureResizeable, sharedConfirmationAlert} from "../../utils/sharedActions";
import {  getRequest, postRequest } from '../../services/api';
import { HeaderApp } from '../../components/header/CustomHeader';
import commonStyles, { tabStyles } from '../../styles/styles';
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
        dealsListTemp: [],
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
                    dealsListTemp: res.data.pitstopDealsListViewModel.data,
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
    const searchBrand = (val) => {
        // getData(val);
        setState(pre => ({
            ...pre,
            dealsList: val === '' ? pre.dealsListTemp : pre.dealsListTemp.filter(item => { return item.title.toLowerCase().includes(val.toLowerCase()) })
        }));
    }
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
                        {state.dealsList.length>0?
                            state.dealsList.map((item, i) => {
                                return <View key={i} style={{overflow:'hidden',...stylesDeals.dealTab({activeTheme:props.activeTheme})}}>
                                {item.isActive === false && <TouchableOpacity onPress={()=>addProductModalF(item)} style={{ height: '100%', width: '100%', borderWidth: 0.1, borderRadius: 15, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 901 }}></TouchableOpacity>}
                                    <View style={{...tabStyles.imageTabContainer}}>
                                        <ImageBackground
                                            resizeMode='stretch'
                                            source={item.dealImagesList&&item.dealImagesList.length>0?{uri:renderPicture(item.dealImagesList[0].joviImageThumbnail)}:dummy}
                                            style={{...tabStyles.imageTab}}
                                        />
                                    </View>
                                    <TouchableOpacity style={tabStyles.tabTextContainer} onPress={()=>addProductModalF(item)}>
                                        <View style={{ flex: 0.9 }}>
                                            <Text style={{...tabStyles.tabTitle(18, props.activeTheme.black, 1, '300')}}>{item.title}</Text>
                                            <Text style={{...stylesDeals.dealTabDesc(props)}}>{item.description}</Text>
                                            <Text style={{...stylesDeals.dealTabDesc(props,12,4)}}>Rs.{item.price}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            })
                            :
                            <View style={{flex:1,height:100,justifyContent:'center',alignItems:'center'}}>
                                <Text>No Deals Found</Text>
                            </View>
                        }
                </ScrollView>
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
const stylesDeals = StyleSheet.create({
    dealTab:props=>{return { height: 110, ...commonStyles.shadowStyles(null, null, null, null, 0.3), backgroundColor: '#fff', borderColor: props.activeTheme.borderColor, borderWidth: 0.5, borderRadius: 15, flexDirection: 'row', marginVertical: 5}},
    dealTabDesc:(props,fSize=10,fWeight=1)=>{return{ maxWidth: '90%', ...commonStyles.fontStyles(fSize, props.activeTheme.black, fWeight, '300'), padding: 2} },
});
export default connect(mapStateToProps)(RestaurantDeals);

