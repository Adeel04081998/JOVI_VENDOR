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
import CustomToast from '../../components/toast/CustomToast';
import { closeModalAction } from '../../redux/actions/modal';
import { postRequest } from '../../services/api';
const ReplaceOrderItem = (props) => {
    console.log('Replace:',props.itemReplace)
    const [state, setState] = useState({
        showDropdown: '',
        // selectedDropdown: props.product.active === true ? 'Activated' : 'Deactivated',
        brand:'',
        product:'',
        item: '',
        brandList: [],
        paginationInfo: {},
        // brandList: brandList?brandList.map(item=>{return{...item,text:item.brandName,value:item.brandID}}):[],
        productList: [],
        itemsList: [],
    })
    const onDropdownClick = (dropdownTitle) => {
        setState(prevState => ({ ...prevState, itemsPerPage: 0,  showDropdown: prevState.showDropdown !== '' ? '' : dropdownTitle }));
    }
    const onChangeHandler = (e) => {
        let value = e.target.value;
        setState(prevState => ({
            ...prevState,
            description: value
        }))
    }
    const onSave = () => {
        if(props.onSave){
            props.onSave(state.item);
        }
        props.dispatch(closeModalAction());
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
        if(state.brand === ''||state.product === '' ||state.item === ''){
            check = true;
        }
        return check;
    }
    const getData = () => {
        postRequest('/Api/Vendor/Pitstop/ItemsByCategory/list', {
            "categoryID":props.itemReplace.categoryID,
          }, {}
            , props.dispatch, (res) => {
                console.log('Related Brand Request:', res)
                setState(prevState => ({
                    ...prevState,
                    brandList: res.data.itemsByCategory.brandsWithProducts.map(item => { return { ...item, text: item.brandName, value: item.brandID,productWithItems:item.productWithItems?item.productWithItems.map(it=>{return{...it,text:it.productName,value:it.productID,itemsList:it.itemsList?it.itemsList.map(itt=>{return{...itt,value:itt.itemID,text:itt.itemName}}):[]}}):[] } }),
                }))
            }, (err) => {
                console.log(err)
                if(err.statusCode===404) CustomToast.error("No Related Brands Found")
                else if (err) CustomToast.error("Something went wrong");
            }, '',false);
    }
    useEffect(useCallback(() => {
        getData();
        return () => {
            setState({
                ...state,
                brandList: []
            })
        };
    }, []), []);
    return (
        // <View style={{flex:1}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ ...styles.tempContainer(props.activeTheme) }} keyboardVerticalOffset={-550}>
                <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                    <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                        <Text style={styles.catpion(props.activeTheme),{alignSelf:'center'}}>Replace: {props.itemReplace.jobItemName}</Text>
                        <ScrollView style={{ flex:1, marginBottom: 30 }} keyboardShouldPersistTaps="always">
                            <View style={{ paddingHorizontal: 7,paddingBottom:state.showDropdown === 'items'?130:0, width: '100%', height: '100%' }}>
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Brand Name
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
                                    <TouchableOpacity onPress={ () => onDropdownClick('brand')} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                    <TextInput value={state.brand.text !== '' ? state.brand.text : ''} placeholder={'Choose Brand'}  onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'brand',product:val===''?'':pre.product,item:val===''?'':pre.item, brand:{...pre.brand,text:val} }))} />

                                        {/* <Text>{state.brand.text ? state.brand.text : 'Choose Brand'}</Text> */}
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown === 'brand' ? <ScrollView nestedScrollEnabled style={{
                                    marginHorizontal: 15, width: '95%', height: 130, borderColor: props.activeTheme.lightGrey,
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
                                    {renderSelectionList(state.brandList, (e) => {Keyboard.dismiss(); setState(prevState => ({ ...prevState, brand: e,product:'',item:'',itemName:'' })); },state.brand.text)}

                                    {/* </View> */}
                                </ScrollView>
                                    :
                                    null
                                }
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
                                        <Text>{state.product.text ? state.product.text : 'Choose Product'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown === 'product' ? <ScrollView nestedScrollEnabled style={{
                                    marginHorizontal: 15, width: '95%', position: 'absolute', marginTop: 160, backgroundColor: 'white', zIndex: 999, paddingHorizontal: 3
                                }} keyboardShouldPersistTaps="always">
                                    <View style={{
                                        // marginHorizontal: 5,
                                        // marginBottom: 210,
                                        // width: '83%',
                                        // elevation: 0.5,
                                        borderColor: props.activeTheme.lightGrey,
                                        borderWidth: 1,
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10
                                    }} >
                                        {renderSelectionList(state.brand.productWithItems?state.brand.productWithItems:[], (e) => { setState(prevState => ({ ...prevState, product: e,item:'' }));  })}

                                    </View>
                                </ScrollView>
                                    :
                                    null
                                }
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Item
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
                                        {/* <Text>{state.itemName !=='' ? state.itemName : 'Choose Items'}</Text> */}
                                        <TextInput value={state.item.itemName !== '' ? state.item.itemName : ''} placeholder={'Choose Item'} editable={state.product!==''}  onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'items', item:{...pre.item,itemName:val} }))} />
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown === 'items' ? <ScrollView nestedScrollEnabled style={{
                                    marginHorizontal: 15, width: '95%', position: 'absolute', marginTop: 240, backgroundColor: 'white', zIndex: 999, paddingHorizontal: 3
                                }} keyboardShouldPersistTaps="always">
                                    <View style={{
                                        borderColor: props.activeTheme.lightGrey,
                                        borderWidth: 1,
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10
                                    }} >
                                        {renderSelectionList(state.product.itemsList?state.product.itemsList:[], (e) => { setState(pre => ({ ...pre, item: e })) }, state.item.itemName)}

                                    </View>
                                </ScrollView>
                                    :
                                    null
                                }
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

export default ReplaceOrderItem;