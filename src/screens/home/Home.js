import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, TouchableOpacity, ScrollView, Dimensions, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import {  renderPictureResizeable } from "../../utils/sharedActions";
import { getRequest, postRequest } from '../../services/api';
import  { HeaderApp } from '../../components/header/CustomHeader';
import commonStyles, { tabStyles } from '../../styles/styles';
import CustomToast from '../../components/toast/CustomToast';
import { useFocusEffect } from '@react-navigation/native';
import SharedFooter from '../../components/footer/SharedFooter';
import dummy from '../../assets/card-image.png';
// import dummy from '../../assets/bike.png';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
import AddBrandModal from '../../components/modals/AddBrandModal';
import { debounce } from 'debounce';
function Home(props) {
    const { navigation, activeTheme } = props;
    // console.log(navigation)
    const [state, setState] = useState({
        brandData: [],
        paginationInfo:{totalItems:0},
    })
    const addBrandModal = () => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <AddBrandModal type={1} {...props} onSave={()=>{getData()}} brandList={state.brandData} />
            ),
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    }
    // const handleBackButtonPressed = bool => {
    //     sharedConfirmationAlert("Confirm!", "Do you want to exit the app?", () => BackHandler.exitApp(), () => console.log('Cancel Pressed'));
    //     return true;
    // };
    const getData = (keywords=false) => {
        postRequest('Api/Vendor/Pitstop/BrandsList', {
            "itemsPerPage": 50,
            "pageNumber": 1,
            "isPagination": true,
            "searchKeyWords":keywords!==false?keywords: "",
          },{}
        , props.dispatch, (res) => {
            console.log('Brand Request:', res)
            if(res.data.statusCode === 200){
                setState(prevState => ({
                    ...prevState,
                    brandData: res.data.pitstopBrands.pitstopBrandsList,
                    paginationInfo:res.data.pitstopBrands.paginations,
                }));
            }else{
                CustomToast.error("No Brands Found");
                setState(prevState => ({
                    ...prevState,
                    brandData: []
                }));
            }
        }, (err) => {
            // if(err.statusCode === 404) CustomToast.error(err.message)
            if (err) CustomToast.error("Something went wrong");
        }, '');
    }
    const searchBrand = debounce((val) => {
        getData(val);
    },900)
    useFocusEffect(useCallback(() => {
        getData();
        return () => {
            setState({
                ...state,
                brandData:[]
            })
        };
    }, []), []);
    const onBrandPress = (item) => {navigation.navigate('Products',{key:'products',item:{item}})}
    const onFooterItemPressed = async (pressedTab, index) => {
        if(pressedTab.title==='Add'){
            addBrandModal();
        }else if(pressedTab.title === 'Orders'){
            navigation.navigate("Orders",{});
        }
    }; 
    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
            <HeaderApp
                caption={props.user?.pitstopName}
                commonStyles={commonStyles}
                state={state}
                user={props.user}
                onChangeText={searchBrand}
                activeTheme={activeTheme}
                screenProps={{...props}}
                noBackButton={true}
            />
            <View style={{zIndex:1, flex: 1, marginTop: 30 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }}>Brands List</Text>
                    <Text style={{ marginRight: 14 }}>Total: {state.paginationInfo?.totalItems<1?'0':state.paginationInfo?.totalItems<10?'0'+state.paginationInfo?.totalItems:state.paginationInfo?.totalItems}</Text>
                </View>
                <ScrollView style={{ flex: 1,marginHorizontal:8 }} >
                        {state.brandData.length>0?
                            state.brandData.map((item, i) => {
                                return <View key={i} style={{...tabStyles.tabContainer(props.activeTheme,null,null,null,null,0.3)}}>
                                    <View style={{...tabStyles.imageTabContainer}}>
                                        <ImageBackground
                                            resizeMode='stretch'
                                            source={item.brandImages && item.brandImages.length > 0 ? { uri: renderPictureResizeable(item.brandImages[0].joviImage,190, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                            style={{...tabStyles.imageTab}}
                                        />
                                    </View>
                                    <TouchableOpacity style={tabStyles.tabTextContainer} onPress={()=>onBrandPress(item)}>
                                        <View style={{ flex: 0.9 }}>
                                            <Text style={{...tabStyles.tabTitle(18, props.activeTheme.black, 1, '300')}}>{item.brandName}</Text>
                                            <Text style={{...tabStyles.tabDescription(10, props.activeTheme.black, 1, '300')}}>{item.brandDescription.toLocaleUpperCase()}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{...tabStyles.tabCounter(props)}}>
                                        <Text style={{ color: 'white' }}>{item.noOfProducts}</Text>
                                    </View>
                                </View>
                            })
                            :
                            <View style={{flex:1,height:100,justifyContent:'center',alignItems:'center'}}>
                                <Text>No Brands Found</Text>
                            </View>
                        }
                </ScrollView>
            </View>
            {props.stackState.keypaidOpen===false&&<SharedFooter onHome={true} activeTheme={activeTheme} activeTab={null} mainDrawerComponentProps={props} drawerProps={props.navigation.drawerProps} onPress={onFooterItemPressed} />}
        </View>
    )
}
const mapStateToProps = (store) => {
    return {
        userObj: store.userReducer
    }
};
export default connect(mapStateToProps)(Home);