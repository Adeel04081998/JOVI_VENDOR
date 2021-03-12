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
import CustomToast from '../../components/toast/CustomToast';
import { postRequest } from '../../services/api';
import dropdownIcon from '../../assets/dropdownIcn.svg';
const AddBrandModal = (props) => {
    const { brandList,relevantProductID,type,productObj,itemReplace,brandObj } = props;
    console.log('OBJ:',brandObj)
    const [state, setState] = useState({
        showDropdown: '',
        // selectedDropdown: props.product.active === true ? 'Activated' : 'Deactivated',
        brand:brandObj?{...brandObj,text:brandObj.brandName}: '',
        product:productObj?{...productObj,text:productObj.productName}: '',
        itemName: '',
        item: [],
        addedItems: [],
        itemSize: '',
        itemColor: '',
        itemFitting: '',
        itemsPerPage: 0,
        itemPrice: '',
        brandList: [],
        paginationInfo: {},
        // brandList: brandList?brandList.map(item=>{return{...item,text:item.brandName,value:item.brandID}}):[],
        productList: [],
        itemsList: [],
    })
    const [horizontalScrollState, setHorizontalScrollState] = useState({
        lastOffset: 0
    });
    const onDropdownClick = (dropdownTitle) => {
        setState(prevState => ({ ...prevState, itemsPerPage: 0,  showDropdown: prevState.showDropdown !== '' ? '' : dropdownTitle }));
        setHorizontalScrollState({
            lastOffset: 0
        });
    }
    const onChangeHandler = (e) => {
        let value = e.target.value;
        setState(prevState => ({
            ...prevState,
            description: value
        }))
    }
    const onSave = () => {
        postRequest('api/Vendor/Pitstop/PitstopItemList/AddOrUpdate',{
            "productID": state.product.productID,
            "itemIDs": state.item.map(item=>{return item.itemID})
          },{},props.dispatch,(res)=>{
              console.log('On Assign Brand:',res,state.item.map(item=>{return item.itemID}),state.product);
              if(props.onSave)
              {
                props.onSave();
              }
              CustomToast.success('Product Assigned Successfully')
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
        if(type === 3 &&(state.brand === ''||state.product === '' ||state.item.length<1)){
            check = true;
        }else
        if(state.brand === ''||state.product === ''){
            check = true;
        }
        return check;
    }
    const getItemsAgainstProduct = (product) => {
        console.log('Before Request: -----------  ',state.product.productID,product)
        postRequest('Api/Vendor/Pitstop/GetItemsByProducts/List', {
            "pageNumber": 1,
            "itemsPerPage": 2,
            "isPagination": false,
            "isAscending": true,
            "productID": product ? product.productID : state.product.productID
        }, {}
            , props.dispatch, (res) => {
                console.log('Item Request Against Product:', res,state)
                if (res.data.statusCode === 200) {
                    setState(prevState => ({
                        ...prevState,
                        itemsPerPage: prevState.itemsPerPage + 10,
                        itemsList: res.data.getSMProductItemListVM?.itemData?.map(item => { return { ...item, value: item.itemID, text: item.itemName } }),
                        // paginationInfo: res.data.getProductListViewModel?.paginationInfo
                    }));
                }
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '',false);
    }
    const getProductAgainstBrand = (brand) => {
        postRequest('Api/Vendor/Pitstop/ProductGeneric/List', {
            "pageNumber": 1,
            "itemsPerPage": state.itemsPerPage + 10,
            "isAscending": true,
            "brandID": brand ? brand.brandID : state.brand.brandID,
            "isPagination": true,
            'relevantProductID':0,
            "productType": 1,
            "genericSearch": ""
        }, {}
            , props.dispatch, (res) => {
                console.log('Product Request Against Brand:', res)
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
    const getData = () => {
        postRequest('Api/Vendor/Pitstop/BrandGeneric/List', {
            "pageNumber": 1,
            "itemsPerPage": state.itemsPerPage + 10,
            "isAscending": true,
            "brandType": 1,
            'relevantProductID':0,
            "isPagination": false,
            // "isPagination": true,
            "genericSearch": ""
        }, {}
            , props.dispatch, (res) => {
                console.log('Generic Brand Request:', res)
                setState(prevState => ({
                    ...prevState,
                    itemsPerPage: prevState.itemsPerPage + 10,
                    brandList: res.data.genericBrandListViewModels.brandData.sort((a,b)=>{if(a['brandName']<b['brandName']){return -1;}else if(a['brandName']>b['brandName']){return 1;}else{return 0; }}).map(item => { return { ...item, text: item.brandName, value: item.brandID } }),
                    paginationInfo: res.data.genericBrandListViewModels.paginationInfo
                }))
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '',false);
    }
    useEffect(useCallback(() => {
        if(type===1){
            getData();
        }
        if(type === 2){
            getData();
            getProductAgainstBrand();
        }
        if(type === 3){
            getData();
            getProductAgainstBrand();
            getItemsAgainstProduct();
        }
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
                        <Text style={styles.catpion(props.activeTheme),{alignSelf:'center'}}>Add Brand</Text>
                        <ScrollView style={{ flex:1, marginBottom: 30 }} keyboardShouldPersistTaps="always">
                            <View style={{ paddingHorizontal: 7, width: '100%', height: '100%' }}>
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
                                    <TouchableOpacity onPress={type!==1?()=>{}: () => onDropdownClick('brand')} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                    <TextInput value={state.brand.text !== '' ? state.brand.text : ''} placeholder={'Choose Brand'}  onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'brand',product:val===''?'':pre.product,item:val===''?[]:pre.item, brand:{...pre.brand,text:val} }))} />

                                        {/* <Text>{state.brand.text ? state.brand.text : 'Choose Brand'}</Text> */}
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown === 'brand' ? <ScrollView nestedScrollEnabled onScrollEndDrag={(e) => {
                                    e.persist();
                                    // setHorizontalScrollState(pre => ({ ...pre, lastOffset: e.nativeEvent.contentOffset.y }));
                                    if (e.nativeEvent.contentOffset.y > horizontalScrollState.lastOffset) {
                                        // console.log(e.nativeEvent.contentOffset.y,horizontalScrollState.lastOffset,state.paginationInfo)
                                        // if (state.paginationInfo.itemsPerPage < state.paginationInfo.totalItems) {
                                            // getData();
                                        // }
                                    }
                                }} style={{
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
                                    {renderSelectionList(state.brandList, (e) => {Keyboard.dismiss(); setState(prevState => ({ ...prevState, brand: e,product:'',item:[],itemName:'' })); getProductAgainstBrand(e); },state.brand.text)}

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
                                    <TouchableOpacity onPress={  () => onDropdownClick('product')} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                        <Text>{state.product.text ? state.product.text : 'Choose Product'}</Text>
                                        <SvgXml
                                            fill={props.activeTheme.default}
                                            xml={dropdownIcon}
                                            width={'5%'}
                                            style={{position:'absolute',right:-10,top:-5}}
                                            height={'100%'}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown === 'product' ? <ScrollView onScrollEndDrag={(e) => {
                                    e.persist();
                                    setHorizontalScrollState(pre => ({ ...pre, lastOffset: e.nativeEvent.contentOffset.y }));
                                    if (e.nativeEvent.contentOffset.y > horizontalScrollState.lastOffset) {
                                        if (state.paginationInfo.itemsPerPage < state.paginationInfo.totalItems) {
                                            getProductAgainstBrand();
                                        }
                                    }
                                }} nestedScrollEnabled style={{
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
                                        {renderSelectionList(state.productList, (e) => { setState(prevState => ({ ...prevState, product: e })); getItemsAgainstProduct(e); })}

                                    </View>
                                </ScrollView>
                                    :
                                    null
                                }
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Items
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
                                        <TextInput value={state.itemName !== '' ? state.itemName : ''} placeholder={'Choose Item'} editable={itemReplace?state.product!==''&&state.item.length<1:state.product!==''}  onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'items', itemName: val }))} />
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown === 'items' ? <ScrollView nestedScrollEnabled style={{
                                    marginHorizontal: 15, width: '95%', position: 'absolute', marginTop: 240, backgroundColor: 'white', zIndex: 999, paddingHorizontal: 3
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
                                        {renderSelectionList(state.itemsList, (e) => { setState(pre => ({ ...pre, item: pre.item.filter(item => item.itemID === e.itemID).length < 1 ? [...pre.item, e] : pre.item, itemName: '' })) }, state.itemName)}

                                    </View>
                                </ScrollView>
                                    :
                                    null
                                }
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Add Item(s)
                                </Text>
                                <ScrollView nestedScrollEnabled style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', height: 180, padding: 5, borderColor: '#929293', borderWidth: 0.5, borderRadius: 7 }}>
                                    {
                                        state.item.map((item, i) => {
                                            return <View key={i} style={{ height: 40, justifyContent: 'center', paddingTop: 4, width: 230, margin: 5, marginTop: 10, borderColor: '#929293', borderWidth: 0.5, borderRadius: 7 }}>
                                                <Text style={[commonStyles.fontStyles(15, props.activeTheme.white, 1), { backgroundColor: 'black', marginLeft: 5, paddingTop: 2, width: '75%', position: 'absolute', top: -10, paddingLeft: 3, height: 25 }]}>{item.text}</Text>
                                                <Text style={[commonStyles.fontStyles(13, props.activeTheme.black, 1), { marginLeft: 5 }]}>Rs: {item.price}</Text>
                                                <Text style={{ position: 'absolute', top: 1, right: 2 }} onPress={() => setState(pre => ({ ...pre, item: pre.item.filter(it => it.itemID !== item.itemID) }))}>X</Text>
                                            </View>
                                        })
                                    }
                                </ScrollView>
                                {/* <TextInput
                                    multiline={true}
                                    numberOfLines={10}
                                    onChange={(e) => onChangeHandler(e)}
                                    editable
                                    style={{
                                        borderWidth: 1,
                                        maxHeight: 200,
                                        borderRadius: 5,
                                        borderColor: 'rgba(0,0,0,0.1)'
                                    }}
                                /> */}
                                {/* <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Price
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
                                        <TextInput value={state.itemPrice !== '' ? state.itemPrice : ''} placeholder={'Item Price'} onChangeText={(val)=>setState(pre =>({...pre,itemPrice:val}))}  />
                                    </TouchableOpacity>
                                </View>
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Color
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
                                        <Text>{state.itemPrice !== '' ? state.itemPrice : 'Choose Color'}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Fitting
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
                                        <Text>{state.itemName !== '' ? state.itemName : 'Choose Fitting'}</Text>
                                    </TouchableOpacity>
                                </View> */}
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

export default AddBrandModal;