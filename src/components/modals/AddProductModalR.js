import { Picker, Text, View } from 'native-base';
import colors from "../../styles/colors";
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Keyboard,Dimensions } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import styles from '../../screens/userRegister/UserRegisterStyles';
import { sharedKeyboardDismissHandler } from '../../utils/sharedActions';
import CustomAndroidPickerItem from '../dropdowns/picker.android';
import { favHomeIcon } from '../../assets/svgIcons/customerorder/customerorder'
import { SvgXml } from 'react-native-svg';
import commonStyles from '../../styles/styles';
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DefaultBtn from '../buttons/DefaultBtn';
import { closeModalAction } from '../../redux/actions/modal';
import { postRequest } from '../../services/api';
import Items from '../../screens/Items/Items';
const AddProductModalR = (props) => {
    const [state, setState] = useState({
        showDropdown: '',
        // selectedDropdown: props.product.active === true ? 'Activated' : 'Deactivated',
        addedItems: [],
        filter:'',
        itemsPerPage: 0,
        paginationInfo: {},
        // brandList: brandList?brandList.map(item=>{return{...item,text:item.brandName,value:item.brandID}}):[],
        productList: [],
    })
    // const [horizontalScrollState, setHorizontalScrollState] = useState({
    //     lastOffset: 0
    // });
    const onDropdownClick = (dropdownTitle) => {
        setState(prevState => ({ ...prevState, itemsPerPage: 0,  showDropdown: prevState.showDropdown !== '' ? '' : dropdownTitle }));
        // setHorizontalScrollState({
        //     lastOffset: 0
        // });
    }
   
    const onSave = () => {
        postRequest('api/Vendor/Pitstop/PitstopItemList/AddOrUpdate',{
            "productID": state.product.productID,
            "itemIDs": state.item.map(item=>{return item.itemID})
          },{},props.dispatch,(res)=>{
            //   console.log('On Assign Brand:',res,state.item.map(item=>{return item.itemID}),state.product);
              if(props.onSave)
              {
                props.onSave();
              }
              props.dispatch(closeModalAction());
        },(err)=>{},'');
    }
    const renderSelectionList = (options, onChange, filter = false) => {
        // let data = [{ text: 'Activate', value: 'Activated' }, { text: 'Deactivate', value: 'Deactivated' }];
        let optionsFilter = filter !== false ? options.filter(item => { return item.text.toLowerCase().includes(filter.toLowerCase()) }) : options;
        if(optionsFilter.length<1){
            return <TouchableOpacity onPress={() => { setState(prevState => ({ ...prevState, showDropdown: '' }));}} style={{
                borderBottomColor: props.activeTheme.lightGrey,
                height: 40,
                justifyContent: "space-between",
                backgroundColor: 'white',
                zIndex: 999,
                borderColor: props.activeTheme.lightGrey,
                // borderWidth: 1,
                // borderBottomLeftRadius: 10,
                // borderBottomRightRadius: 10,
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
                // borderWidth: 1,
                // borderBottomLeftRadius: 10,
                // borderBottomRightRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: i === (options.length - 1) ? 0 : 1,

            }}>
                <Text style={{ paddingLeft: 10, color: props.activeTheme.default }}>{r.text}</Text>
            </TouchableOpacity>
        ));
    }
    const checkValidation = () =>{
        let check = false;
        if(Items){
            check = true;
        }
        return check;
    }
    const getData = () => {
        postRequest('Api/Vendor/Pitstop/ProductGeneric/List', {
            "pageNumber": 1,
            "itemsPerPage": state.itemsPerPage + 10,
            "isAscending": true,
            "brandID": brand ? brand.brandID : state.brand.brandID,
            "isPagination": false,
            "productType": 1,
            "genericSearch": ""
        }, {}
            , props.dispatch, (res) => {
                console.log('Product Request:', res)
                if(res.data.statusCode === 200){
                    setState(prevState => ({
                        ...prevState,
                        itemsPerPage: prevState.itemsPerPage + 10,
                        productList: res.data.getProductListViewModel?.productData?.map(item => { return { ...item, value: item.productID, text: item.productName } }),
                        paginationInfo: res.data.getProductListViewModel?.paginationInfo
                    }));
                }
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '',false);
    }
    useEffect(useCallback(() => {
            // getData();
        return () => {
            setState({
                ...state,
                productList: []
            })
        };
    }, []), []);
    return (
        // <View style={{flex:1}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ ...styles.tempContainer(props.activeTheme) }} keyboardVerticalOffset={-550}>
                <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                    <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                        <Text style={styles.catpion(props.activeTheme),{alignSelf:'center'}}>Add Product</Text>
                        <ScrollView style={{ flex:1, marginBottom: 30 }} keyboardShouldPersistTaps="always">
                            <View style={{ paddingHorizontal: 7, width: '100%', height: '100%' }}>
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Product Name
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
                                    <TouchableOpacity onPress={ () => onDropdownClick('product')} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                        <TextInput value={state.filter} placeholder={'Choose Product'}  onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'product', filter:val }))} />
                                        {/* <Text>{state.brand.text ? state.brand.text : 'Choose Brand'}</Text> */}
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown === 'product' ? <ScrollView nestedScrollEnabled onScrollEndDrag={(e) => {
                                }} style={{
                                    marginHorizontal: 15, width: '95%', height: 130, borderColor: props.activeTheme.lightGrey,
                                    borderWidth: 1,
                                    borderBottomLeftRadius: 10,
                                    borderBottomRightRadius: 10, position: 'absolute', marginTop: 80, backgroundColor: 'white', zIndex: 1000, paddingHorizontal: 3
                                }} keyboardShouldPersistTaps="always">
                                    {renderSelectionList(state.productList, (e) => {Keyboard.dismiss(); setState(prevState => ({ ...prevState, addedItems:[...prevState.addedItems,e]}));},state.filter)}
                                </ScrollView>
                                    :
                                    null
                                }
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Add Product(s)
                                </Text>
                                <ScrollView nestedScrollEnabled style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', height: 180, padding: 5, borderColor: '#929293', borderWidth: 0.5, borderRadius: 7 }}>
                                    {
                                        // state.addedItems.map((item, i) => {
                                        //     return <View key={i} style={{ height: 40, justifyContent: 'center', paddingTop: 4, width: 230, margin: 5, marginTop: 10, borderColor: '#929293', borderWidth: 0.5, borderRadius: 7 }}>
                                        //         <Text style={[commonStyles.fontStyles(15, props.activeTheme.white, 1), { backgroundColor: 'black', marginLeft: 5, paddingTop: 2, width: '75%', position: 'absolute', top: -10, paddingLeft: 3, height: 25 }]}>{item.text}</Text>
                                        //         <Text style={[commonStyles.fontStyles(13, props.activeTheme.black, 1), { marginLeft: 5 }]}>Rs: {item.price}</Text>
                                        //         <Text style={{ position: 'absolute', top: 1, right: 2 }} onPress={() => setState(pre => ({ ...pre, item: pre.item.filter(it => it.itemID !== item.itemID) }))}>X</Text>
                                        //     </View>
                                        // })
                                    }
                                </ScrollView>
                            </View>
                        </ScrollView>
                        <DefaultBtn
                            title="Save"
                            disabled={checkValidation()?true:false}
                            backgroundColor={checkValidation()?props.activeTheme.grey:props.activeTheme.default}
                            onPress={() => onSave()}
                        />
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        // </View>
    );
}

export default AddProductModalR;