import { Picker, Text, View } from 'native-base';
import colors from "../../styles/colors";
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Keyboard, Dimensions, ImageBackground } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import styles from '../../screens/userRegister/UserRegisterStyles';
import { renderPictureResizeable, sharedKeyboardDismissHandler } from '../../utils/sharedActions';
import CustomAndroidPickerItem from '../dropdowns/picker.android';
import { favHomeIcon } from '../../assets/svgIcons/customerorder/customerorder'
import { SvgXml } from 'react-native-svg';
import commonStyles from '../../styles/styles';
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DefaultBtn from '../buttons/DefaultBtn';
import { closeModalAction } from '../../redux/actions/modal';
import { postRequest } from '../../services/api';
import dummy from '../../assets/bike.png';
const ProfileModal = (props) => {
    console.log('USer:', props.user)
    const [state, setState] = useState({
        showDropdown: '',
        vendorList:props?.user?.vendorPitstopDetailsList.map(item=>{return{...item,text:item.personName}}),
        vendor:props?.user?.vendorPitstopDetailsList[0],
    })
    const onDropdownClick = () => {
        setState(prevState => ({ ...prevState, showDropdown: prevState.showDropdown !== false ? false : true }));
    }
    const onSave = () => {
        postRequest('api/Vendor/Pitstop/PitstopItemList/AddOrUpdate', {
            "productID": state.product.productID,
            "itemIDs": state.item.map(item => { return item.itemID })
        }, {}, props.dispatch, (res) => {
            if (props.onSave) {
                props.onSave();
            }
            props.dispatch(closeModalAction());
        }, (err) => { }, '');
    }
    const renderSelectionList = (options, onChange, filter = false) => {
        let optionsFilter = filter !== false ? options.filter(item => { return item.text.toLowerCase().includes(filter.toLowerCase()) }) : options;
        if (optionsFilter.length < 1) {
            return <TouchableOpacity onPress={() => { setState(prevState => ({ ...prevState, showDropdown: '' })); }} style={{
                borderBottomColor: props.activeTheme.lightGrey,
                height: 40,
                justifyContent: "space-between",
                backgroundColor: 'white',
                zIndex: 999,
                borderColor: props.activeTheme.lightGrey,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 0,

            }}>
                <Text style={{ paddingLeft: 10, color: props.activeTheme.default }}>No Data Found</Text>
            </TouchableOpacity>
        }
        return optionsFilter.map((r, i) => (
            <TouchableOpacity onPress={() => { setState(prevState => ({ ...prevState, showDropdown: '' })); onChange(r) }} key={i} style={{
                borderBottomColor: props.activeTheme.lightGrey,
                height: 40,
                justifyContent: "space-between",
                backgroundColor: 'white',
                zIndex: 999,
                borderColor: props.activeTheme.lightGrey,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: i === (options.length - 1) ? 0 : 1,

            }}>
                <Text style={{ paddingLeft: 10, color: props.activeTheme.default }}>{r.text}</Text>
            </TouchableOpacity>
        ));
    }
    const getData = () => {
        postRequest('Api/Vendor/Pitstop/BrandGeneric/List', {
            "pageNumber": 1,
            "itemsPerPage": state.itemsPerPage + 10,
            "isAscending": true,
            "brandType": 1,
            "isPagination": true,
            "genericSearch": ""
        }, {}
            , props.dispatch, (res) => {
                console.log('Generic Brand Request:', res)
                setState(prevState => ({
                    ...prevState,
                    itemsPerPage: prevState.itemsPerPage + 10,
                    brandList: res.data.genericBrandListViewModels.brandData.sort((a, b) => { if (a['brandName'] < b['brandName']) { return -1; } else if (a['brandName'] > b['brandName']) { return 1; } else { return 0; } }).map(item => { return { ...item, text: item.brandName, value: item.brandID } }),
                    paginationInfo: res.data.genericBrandListViewModels.paginationInfo
                }))
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '', false);
    }
    useEffect(useCallback(() => {
        // getData();
        return () => {
            setState({
                ...state,
            })
        };
    }, []), []);
    return (
        <View style={{ ...StyleSheet.absoluteFill }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ ...styles.tempContainer(props.activeTheme) }} keyboardVerticalOffset={-550}>
                <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                    <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                        <Text style={styles.catpion(props.activeTheme)}>Profile</Text>
                        <ScrollView style={{ flex: 1, marginBottom: 30 }} keyboardShouldPersistTaps="always">
                            <View style={{ paddingHorizontal: 7, width: '100%', height: '100%' }}>
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Name
                                </Text>
                                <View style={{
                                    paddingHorizontal: 12,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: 'rgba(0,0,0,0.1)',
                                    backgroundColor: 'transparent',
                                    height: 40,
                                    justifyContent: "space-between",
                                    alignItems: 'center',
                                    flexDirection: 'row'
                                }}>
                                    <TouchableOpacity onPress={() => onDropdownClick()} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                        {/* <TextInput value={state.brand.text !== '' ? state.brand.text : ''} placeholder={'Choose Brand'}  onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'brand', brand:{...pre.brand,text:val} }))} /> */}

                                        <Text>{state.vendor.name ? state.vendor.name : 'Choose Vendor'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown === true ? <ScrollView nestedScrollEnabled style={{
                                    marginHorizontal: 15, width: '95%', borderColor: props.activeTheme.lightGrey,
                                    borderWidth: 1,
                                    borderBottomLeftRadius: 10,
                                    borderBottomRightRadius: 10, position: 'absolute', marginTop: 80, backgroundColor: 'white', zIndex: 1000, paddingHorizontal: 3
                                }} keyboardShouldPersistTaps="always">
                                    {/* <View style={{
                                        // marginHorizontal: 5,
                                        // marginBottom: 210,
                                        // width: '83%',
                                        // elevation: 0.5,
                                        borderColor: props.activeTheme.lightGrey,
                                        borderWidth: 1,
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10
                                    }} > */}
                                    {renderSelectionList(state.vendorList, (e) => {Keyboard.dismiss(); setState(prevState => ({ ...prevState, vendor: e }));})}

                                    {/* </View> */}
                                </ScrollView>
                                    :
                                    null
                                }
                                <View style={{ height: 280, backgroundColor: '#F5F6FA', borderColor: '#929293', borderWidth: 0.5, borderRadius: 15, marginTop: 20, width: '100%' }}>
                                    <View style={{ height: '45%',flexDirection:'row',flex:1, borderBottomWidth: 1, borderBottomColor: '#929293' }}>
                                        
                                        <View style={{flex:0.62,marginLeft:20,justifyContent:'center'}}>
                                            <Text>{state.vendor.personName}</Text>
                                            <Text>{state.vendor.email}</Text>
                                            <Text>{state.vendor.contactNo}</Text>
                                        </View>
                                        <View style={{ ...stylesHome.homeTabView,margin:20 }}>
                                            <ImageBackground
                                                resizeMode='stretch'
                                                source={props.user.picture?{uri:renderPictureResizeable(props.user.picture,190, props.user.tokenObj && props.user.tokenObj.token.authToken)}:dummy}
                                                // source={item.brandImages && item.brandImages.length > 0 ? { uri: renderPicture(item.brandImages[0].joviImage, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                                style={{ ...stylesHome.homeTabImage }}
                                            />
                                        </View>
                                    </View>
                                        <View style={{height:'45%',backgroundColor:'red'}}>

                                        </View>
                                </View>
                            </View>
                        </ScrollView>
                        <DefaultBtn
                            title="Save"
                            // disabled={checkValidation()?true:false}
                            backgroundColor={props.activeTheme.default}
                            onPress={() => onSave()}
                        />
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}
const stylesHome = StyleSheet.create({
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
    homeTabCounter: (props) => { return { flex: 0.1, width: 5, height: 27, margin: 3, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: props.activeTheme.background } }

});
export default ProfileModal;