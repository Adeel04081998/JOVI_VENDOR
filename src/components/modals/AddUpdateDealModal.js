import { CheckBox, Picker, Text, View } from 'native-base';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, TouchableOpacity, Keyboard, ImageBackground } from 'react-native';
import React, { useEffect, useState } from 'react';
import Animated, { set } from 'react-native-reanimated';
import styles from '../../screens/userRegister/UserRegisterStyles';
import commonStyles from '../../styles/styles';
import DefaultBtn from '../buttons/DefaultBtn';
import { getRequest, postRequest } from '../../services/api';
import CustomToast from '../toast/CustomToast';
import { TextInput } from 'react-native-gesture-handler';
import modalCam from '../../assets/profile/camera.svg'
import { camelToTitleCase, renderPicture } from '../../utils/sharedActions';
import { UPDATE_MODAL_HEIGHT } from '../../redux/actions/types';
import { connect } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { sharedImagePickerHandler } from '../../utils/sharedActions';
import { closeModalAction } from '../../redux/actions/modal';
import { CustomInput } from '../SharedComponents';
const AddUpdateDealModal = (props) => {
    const { dispatch, updateDeal } = props;
    // console.log(item)
    let currentDate = (new Date().getDay() < 10 ? '0' + new Date().getDay() : new Date().getDay().toString()) + '/' + (new Date().getMonth() < 10 ? '0' + new Date().getMonth() : new Date().getMonth().toString()) + '/' + (new Date().getFullYear()) + ' 00:00';
    const [state, setState] = useState({
        showDropdown: false,
        deal: updateDeal !== null ? { ...updateDeal, inActiveIndex: updateDeal.isActive === true ? 0 : 1 } : {
            title: '',
            price: '0',
            dealImagesList: {},
            startDate: '',
            pitstopDealID: 0,
            type: '',
            inActive: true,
            inActiveIndex: 0,
            dealOptionsList: [],
            description: '',
            endDate: '',
            categories: []
        },
        productList: [],
        picturePicked: false,
        filter: '',
        dealTypes: [],
        selectedProduct: {},
        showDropdown: '',
        mode: '',
        selectedDate: '',
    })
    console.log("Date: ", (currentDate.split(' ')[1] || "HH:MM").split(":")[0])
    const onDropdownClick = (dropdownTitle) => {
        setState(pre => ({ ...pre, showDropdown: pre.showDropdown !== '' ? '' : dropdownTitle }));
    }
    const saveDate = () => {
        setState(pre => ({
            ...pre, deal: {
                ...pre.deal,
                [pre.mode]: pre.selectedDate,
            },
            mode: '',
            selectedDate: '',
        }));
        dispatch({ type: UPDATE_MODAL_HEIGHT, payload: false });
    }
    const onDateChange = (val, index) => {
        let selectedVal = state.selectedDate.split('/');
        selectedVal[index] = val;
        setState(pre => ({ ...pre, selectedDate: selectedVal.join('/') }));
    }
    const onTimeChange = (val, index) => {
        let selectedVal = state.selectedDate?.split(' ');
        let selectedTime = selectedVal[1]?.split(':');
        selectedTime[index] = val;
        selectedVal[1] = selectedTime.join(':');
        console.log('Test:', selectedVal, selectedVal.join(' '))
        setState(pre => ({ ...pre, selectedDate: selectedVal.join(' ') }));
    }
    const setDatePickerState = (varName) => {
        setState(pre => ({ ...pre, selectedDate: pre.deal[varName] === '' ? currentDate : pre.deal[varName], mode: varName }));
        dispatch({ type: UPDATE_MODAL_HEIGHT, payload: Dimensions.get('window').height * 0.5 });
    }
    const updateDealOptions = (item, firstIndex, secondIndex) => {
        let newState = state;
        newState.deal.dealOptionsList[firstIndex].dealOptionItemsList.splice(secondIndex, 1);
        setState({ ...newState });
    }
    const onChangeDealProduct = (val, index, key) => {
        let dealCategory = state.deal.dealOptionsList;
        dealCategory[index][key] = val;
        setState(pre => ({ ...pre, deal: { ...pre.deal, dealOptionsList: dealCategory } }));
    }
    const addNewCategory = () => {
        setState(pre => ({
            ...pre, deal: {
                ...pre.deal,
                dealOptionsList: [...pre.deal.dealOptionsList, {
                    "dealOptionID": 0,
                    "dealOptionDescription": "",
                    "quantity": 1,
                    "isChoosed": false,
                    "dealOptionItemsList": []
                }]
            }
        }))
    }
    const addProductInCategory = () => {
        let arr = state.deal.dealOptionsList;
        let updatedArr = [...arr[state.selectedProduct.category.catIndex].dealOptionItemsList, {
            addOnPrice: 0,
            dealOptionItemID: 0,
            dealOptionItemOptionReqList: state.selectedProduct.product.dealOptionItemOptionReqList,
            pitstopItemID: state.selectedProduct.product.pitstopItemID,
            pitstopItemName: state.selectedProduct.product.productName
        }]
        arr[state.selectedProduct.category.catIndex].dealOptionItemsList = updatedArr;
        setState(pre => ({
            ...pre,
            mode: '',
            deal: {
                ...pre.deal,
                dealOptionsList: arr
            }
        }))
    }
    const changeAttribute = (e, i, j) => {
        let selectedP = state.selectedProduct.product;
        let obj = selectedP.attributeTypeGroupedList[i].productAttributeList[j];
        let updateArr = selectedP.attributeTypeGroupedList;
        updateArr[i].productAttributeList[j].isActive = !updateArr[i].productAttributeList[j].isActive;
        selectedP = {
            ...selectedP, attributeTypeGroupedList: updateArr, dealOptionItemOptionReqList: selectedP?.dealOptionItemOptionReqList?.filter(it => it.itemOptionID === obj.itemOptionID)?.length > 0 ? selectedP?.dealOptionItemOptionReqList?.filter(it => it.itemOptionID !== obj.itemOptionID) : [...selectedP.dealOptionItemOptionReqList, {
                dealOptionItemOptionID: 0,
                itemOptionID: obj.itemOptionID
            }]
        }
        setState(pre => ({ ...pre, selectedProduct: { ...pre.selectedProduct, product: selectedP } }));

    }
    const getDealCategories = () => {
        getRequest('Api/Vendor/Deals/Categories/list', {}, props.dispatch, (res) => {
            console.log('Deal Categories ---------------------> ', res.data)
            setState(pre => ({
                ...pre,
                dealTypes: res.data.dealsCategories.dealsCategoriesDataVM.map(it => { return { ...it, text: it.name, value: it.categoryID } }),
            }))
        }, (err) => {
            if (err) CustomToast.error('Something went wrong');
        }, '')
    }
    const getRestaurantProducts = () => {

        postRequest('Api/Vendor/Restaurant/Product/List', {
            "pageNumber": 1,
            "itemsPerPage": 10,
            "isAscending": true,
            "pitstopID": props.user.pitstopID,
            "genericSearch": "",
            "isPagination": false
        }, {}, props.dispatch, (res) => {
            console.log('Restaurant Products ---------------------> ', res.data)
            setState(pre => ({
                ...pre,
                productList: res.data.getRestauranProductListViewModel?.productData.map(it => { return { ...it, text: it.productName, value: it.productID } }),
            }))
        }, (err) => {
            if (err) CustomToast.error('Something went wrong');
        }, '')
    }
    const getPicture = (picData) => {
        // debugger; 
        setState(pre => ({
            ...pre, picturePicked: true, deal: {
                ...pre.deal,
                dealImagesList: [{
                    joviImage: picData.uri,
                    fileObj: picData,
                    joviImageID: pre.deal.dealImagesList?.length > 0 ? pre.deal.dealImagesList[0].joviImageID : 0,
                    joviImageThumbnail: picData.uri
                }]
            }
        }))
    }
    const takePictureHandler = async (takePick) => {
        if (!takePick) return;
        else {
            try {
                await sharedImagePickerHandler(() => { }, picData => getPicture(picData))
            } catch (error) {
            }
        }
    };
    useEffect(() => {
        getDealCategories();
        getRestaurantProducts();
        return () => {
            setState({
                showDropdown: false,
                deal: {
                    title: '',
                    price: '0',
                    dealImagesList: {},
                    startDate: '',
                    type: '',
                    description: '',
                    endDate: '',
                    availabilityStatus: 'Available',
                    categories: []
                },
                productList: [],
                filter: '',
                dealTypes: [],
                selectedProduct: {},
                showDropdown: '',
                mode: '',
                selectedDate: 'DD/MM/YYYY',
            })
        };
    }, []);
    const onSave = () => {
        let check = false;
        if (state.deal.title === '' || state.deal.startDate === '' || state.deal.endDate === '' || state.deal.description === '' || state.deal.price === 0 || state.deal.dealImagesList.length < 1) {
            check = true;
        }
        let formData = new FormData();
        formData.append('CategoryID', state.deal.categoryID);
        formData.append('PitstopDealID', state.deal.pitstopDealID);
        // formData.append('PitstopDealID', state.pitstopDealID);
        formData.append('PitstopID', props.user.pitstopID);
        formData.append('DealName', state.deal.title);
        formData.append('StartDate', state.deal.pitstopDealID === 0 ? state.deal.startDate + ' 00:10' : state.deal.startDate);
        formData.append('EndDate', state.deal.pitstopDealID === 0 ? state.deal.endDate + ' 23:50' : state.deal.endDate);
        formData.append('Description', state.deal.description);
        formData.append('DealPrice', state.deal.price);
        formData.append('IsActive', state.deal.inActiveIndex === 0 ? true : false);
        formData.append(
            'DealImageList[0].joviImageID',
            state.deal.dealImagesList?.length > 0 && state.deal.dealImagesList[0]?.joviImageID ? state.deal.dealImagesList[0].joviImageID : 0
        );
        formData.append('DealImageList[0].joviImage', state.picturePicked === true ? {
            uri: state.deal.dealImagesList[0].fileObj.uri,
            name: state.deal.dealImagesList[0].fileObj.uri.split('/').pop(),
            type: state.deal.dealImagesList[0].fileObj.type
            // type: 'image/jpg'
        } : state.deal.dealImagesList[0]?.joviImage);
        state.deal.dealOptionsList?.map((obj, i) => {
            formData.append(`DealOptionsList[${i}].dealOptionID`, obj.dealOptionID);
            if (obj.dealOptionDescription === '' || obj.quantity === '' || obj.dealOptionItemsList?.length < 1) {
                check = true;
            }
            formData.append(`DealOptionsList[${i}].dealOptionDescription`, obj.dealOptionDescription);
            formData.append(`DealOptionsList[${i}].quantity`, obj.quantity);
            obj.dealOptionItemsList?.map((secondObj, j) => {
                formData.append(
                    `DealOptionsList[${i}].dealOptionItemsList[${j}].dealOptionItemID`,
                    secondObj.dealOptionItemID
                );
                formData.append(
                    `DealOptionsList[${i}].dealOptionItemsList[${j}].pitstopItemID`,
                    secondObj.pitstopItemID
                );
                // formData.append(`DealOptionsList[${i}].dealOptionItemsList[${j}].addOnPrice`, secondObj.addOnPrice);
                secondObj.dealOptionItemOptionReqList?.map((thirdObj, k) => {
                    formData.append(
                        `DealOptionsList[${i}].dealOptionItemsList[${j}].dealOptionItemOptionReqList[${k}].dealOptionItemOptionID`,
                        thirdObj.dealOptionItemOptionID
                    );
                    // formData.append(
                    //  `DealOptionsList${i}.dealOptionItemsList[${j}].dealOptionItemOptionReqList[${k}].dealOptionItemID`
                    // );
                    formData.append(
                        `DealOptionsList[${i}].dealOptionItemsList[${j}].dealOptionItemOptionReqList[${k}].itemOptionID`,
                        thirdObj.itemOptionID
                    );
                });
            });
        });
        if (check === true) {
            CustomToast.error('Please Fill All Details')
        } else {
            postRequest('Api/Vendor/Restaurant/AddUpdateDeal', formData, {}, props.dispatch, (res) => {
                if (state.pitstopDealID !== 0) {
                    CustomToast.error('Deal Update Successfully')
                } else {
                    CustomToast.error('Deal Added Successfully')
                }
                props.dispatch(closeModalAction());
                props.onSave();
            }, (err) => {
                if (err) CustomToast.error('Something went wrong!');
            }, '');

        }
    }
    const renderSelectionList = (options, onChange, filter = false) => {
        // let data = [{ text: 'Activate', value: 'Activated' }, { text: 'Deactivate', value: 'Deactivated' }];
        let optionsFilter = filter !== false ? options.filter(item => { return item.text.toLowerCase().includes(filter.toLowerCase()) }) : options;
        if (optionsFilter?.length < 1) {
            return <TouchableOpacity onPress={() => { setState(prevState => ({ ...prevState, showDropdown: '' })); }} style={{
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
        return optionsFilter?.map((r, i) => (
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
                borderBottomWidth: i === (options?.length - 1) ? 0 : 1,

            }}>
                <Text style={{ paddingLeft: 10, color: props.activeTheme.default }}>{r.text}</Text>
            </TouchableOpacity>
        ));
    }
    return (
        <View style={{ ...StyleSheet.absoluteFill }}>

            {state.mode === '' ? <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ ...styles.tempContainer(props.activeTheme) }}>
                <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                    <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                        <View style={{ paddingHorizontal: 15, width: '100%', flex: 1 }}>
                            <Text style={{ ...commonStyles.fontStyles(undefined, props.activeTheme.default, 1, 'bold') }}>{"*Please Contact Your Account Manager For Update"}</Text>
                            {/* <Text style={{ margin: 15, ...commonStyles.fontStyles(18, props.activeTheme.black, 5), alignSelf: 'flex-start' }, styles.catpion(props.activeTheme)}>Create a Deal</Text> */}
                            <ScrollView style={{ marginBottom: 15 }}>
                                <View style={{ paddingHorizontal: 7, width: '100%', height: '100%' }}>
                                    <CustomInput
                                        value={state?.deal?.categoryName?.toString()}
                                        label={'Deal Category'}
                                        activeTheme={props.activeTheme}
                                        onlyText={props?.user?.canUpdatePrices === true ? false : true}
                                        parentViewStyle={{ paddingLeft: 0 }}
                                        inputViewStyle={{ width: '100%' }}
                                        onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: 'deal_type', deal: { ...pre.deal, categoryName: val } }))}
                                        inputProps={{ placeholder: 'Deal Category', onBlur: () => onDropdownClick(''), onFocus: () => onDropdownClick('deal_type') }}
                                    />
                                    {/* <TextInput value={state.deal.categoryName} style={{ width: '100%' }} placeholder={'Choose Deal Type'} onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: 'deal_type', deal: { ...pre.deal, categoryName: val } }))} /> */}
                                    {state.showDropdown === 'deal_type' ? <ScrollView nestedScrollEnabled onScrollEndDrag={(e) => {
                                    }} style={{
                                        marginHorizontal: 10, width: '95%', height: 80, borderColor: props.activeTheme.lightGrey,
                                        borderWidth: 1,
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10, position: 'absolute', marginTop: 80, backgroundColor: 'white', zIndex: 1000, paddingHorizontal: 3
                                    }} keyboardShouldPersistTaps="always">
                                        {renderSelectionList(state?.dealTypes, (e) => { Keyboard.dismiss(); setState(prevState => ({ ...prevState, deal: { ...prevState.deal, categoryName: e.text, categoryID: e.value } })); }, state.deal.categoryName)}
                                    </ScrollView>
                                        :
                                        null
                                    }
                                    <CustomInput
                                        value={state?.deal?.title.toString()}
                                        label={'Deal Name'}
                                        activeTheme={props.activeTheme}
                                        onlyText={props?.user?.canUpdatePrices === true ? false : true}
                                        parentViewStyle={{ paddingLeft: 0 }}
                                        inputViewStyle={{ width: '100%' }}
                                        onChangeText={(val) => setState(pre => ({ ...pre, deal: { ...pre.deal, title: val } }))}
                                        inputProps={{ placeholder: 'Create a Deal' }}
                                    />
                                    {/* <TextInput value={state.deal.title} style={{ width: '100%' }} placeholder={'Create a Deal'} onChangeText={(val) => setState(pre => ({ ...pre, deal: { ...pre.deal, title: val } }))} /> */}
                                    <CustomInput
                                        value={state?.deal?.price.toString()}
                                        label={'Price'}
                                        activeTheme={props.activeTheme}
                                        onlyText={props?.user?.canUpdatePrices === true ? false : true}
                                        inputProps={{ keyboardType: 'numeric' }}
                                        parentViewStyle={{ paddingLeft: 0 }}
                                        onChangeText={(val) => setState(pre => ({ ...pre, deal: { ...pre.deal, price: val } }))}
                                        inputViewStyle={{ width: '100%' }}
                                    />

                                    <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                        Status
                                    </Text>
                                    {
                                        ['Available', 'Unavailable'].map((item, i) => {
                                            return <TouchableOpacity key={i} style={{ flexDirection: 'row' }} onPress={() => setState(pre => ({ ...pre, deal: { ...pre.deal, inActiveIndex: i } }))}>
                                                <CheckBox
                                                    checked={state.deal.inActiveIndex === i}
                                                    onPress={() => setState(pre => ({ ...pre, deal: { ...pre.deal, inActiveIndex: i } }))}
                                                    style={{
                                                        alignSelf: "center",
                                                        color: '#7359BE',
                                                        borderColor: '#7359BE',
                                                        borderRadius: 12, margin: 8
                                                    }}
                                                    color={props.activeTheme.default}
                                                />
                                                <Text style={{ margin: 8 }}>{item}</Text>
                                            </TouchableOpacity>
                                        })
                                    }
                                    <View style={{ width: '100%', flexDirection: 'row' }}>
                                        <View style={{ width: '50%' }}>
                                            <CustomInput
                                                value={state?.deal?.startDate?.toString()}
                                                label={'Start Date'}
                                                activeTheme={props.activeTheme}
                                                onlyText={true}
                                                parentViewStyle={{marginLeft:-10}}
                                                textProps={{ onPress: props?.user?.canUpdatePrices === true ? () => setDatePickerState('startDate') : () => { } }}
                                                inputViewStyle={{ width: '100%' }}
                                                textStyle={{ ...commonStyles.fontStyles(13, props.activeTheme.grey, 3) }}
                                            />
                                        </View>
                                        <View style={{ width: '50%' }}>
                                            <CustomInput
                                                value={state?.deal?.endDate?.toString()}
                                                label={'End Date'}
                                                activeTheme={props.activeTheme}
                                                onlyText={true}
                                                textProps={{ onPress: props?.user?.canUpdatePrices === true ? () => setDatePickerState('endDate') : () => { } }}
                                                inputViewStyle={{ width: '100%' }}
                                                textStyle={{ ...commonStyles.fontStyles(13, props.activeTheme.grey, 3) }}
                                            />
                                        </View>
                                    </View>
                                    <CustomInput
                                        value={state?.deal?.description?.toString()}
                                        label={'Description'}
                                        activeTheme={props.activeTheme}
                                        onlyText={props?.user?.canUpdatePrices === true ? false : true}
                                        inputProps={{ multiline: true, numberOfLines: 5, placeholder: 'Description' }}
                                        parentViewStyle={{ paddingLeft: 0 }}
                                        onChangeText={(val) => setState(pre => ({ ...pre, deal: { ...pre.deal, description: val } }))}
                                        inputViewStyle={{ width: '100%', height: 100 }}
                                    />
                                    <ImageBackground source={state.deal.dealImagesList && state.deal.dealImagesList.length > 0 ? { uri: state.picturePicked === true ? state.deal.dealImagesList[0].joviImage : renderPicture(state.deal.dealImagesList[0].joviImage) } : ''} resizeMode='stretch' style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 10, overflow: 'hidden', marginVertical: 10, height: 220 }}>
                                        {props?.user?.canUpdatePrices === true ? <TouchableOpacity onPress={() => takePictureHandler(true)}>
                                            <SvgXml xml={modalCam} height={40} width={40} style={{ alignSelf: 'flex-end', marginHorizontal: 10 }} />
                                        </TouchableOpacity> : <></>}
                                    </ImageBackground>
                                    {props?.user?.canUpdatePrices === true ? <TouchableOpacity style={{ width: '100%', marginVertical: 10, borderRadius: 7, justifyContent: 'center', alignItems: 'center', backgroundColor: props.activeTheme.default, height: 40 }} onPress={() => addNewCategory()}>
                                        <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.white, 4) }}>+ Create New</Text>
                                    </TouchableOpacity> : <></>}
                                    {
                                        state.deal?.dealOptionsList?.map((item, i) => {
                                            return <View key={i} style={{ marginVertical: 5, paddingBottom: state.showDropdown !== '' && i === state.deal.dealOptionsList?.length - 1 ? 70 : 0, }}>
                                                <View style={{ height: 30, borderRadius: 7, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 10, backgroundColor: props.activeTheme.default }}>
                                                    <Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.white, 3) }}>Category {i + 1}</Text>
                                                    {props?.user?.canUpdatePrices === true ? <Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.white, 3) }} onPress={() => setState(pre => ({ ...pre, deal: { ...pre.deal, dealOptionsList: pre.deal.dealOptionsList.filter((it, j) => j !== i) } }))}>X</Text> : <></>}
                                                </View>
                                                <CustomInput
                                                    value={item?.dealOptionDescription?.toString()}
                                                    label={'Category Name'}
                                                    activeTheme={props.activeTheme}
                                                    onlyText={props?.user?.canUpdatePrices === true ? false : true}
                                                    inputProps={{ placeholder: 'Category Name' }}
                                                    parentViewStyle={{ paddingLeft: 0 }}
                                                    onChangeText={(val) => onChangeDealProduct(val, i, 'dealOptionDescription')}
                                                    inputViewStyle={{ width: '100%' }}
                                                />
                                                <CustomInput
                                                    value={item?.quantity?.toString()}
                                                    label={'Quantity'}
                                                    activeTheme={props.activeTheme}
                                                    onlyText={props?.user?.canUpdatePrices === true ? false : true}
                                                    inputProps={{ keyboardType: 'numeric', placeholder: 'Quantity' }}
                                                    parentViewStyle={{ paddingLeft: 0 }}
                                                    onChangeText={(val) => onChangeDealProduct(val, i, 'quantity')}
                                                    inputViewStyle={{ width: '100%' }}
                                                />
                                                {props?.user?.canUpdatePrices === true ? <CustomInput
                                                    value={state?.filter?.toString()}
                                                    label={'Product Name'}
                                                    activeTheme={props.activeTheme}
                                                    onlyText={false}
                                                    inputProps={{ placeholder: 'Product Name', onFocus: () => onDropdownClick('product-' + i) }}
                                                    parentViewStyle={{ paddingLeft: 0 }}
                                                    onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'product-' + i, filter: val }))}
                                                    inputViewStyle={{ width: '100%' }}
                                                /> : <></>}
                                                {state.showDropdown === 'product-' + i ? <ScrollView nestedScrollEnabled onScrollEndDrag={(e) => {
                                                }} style={{
                                                    marginHorizontal: 10, width: '95%', height: 80, borderColor: props.activeTheme.lightGrey,
                                                    borderWidth: 1,
                                                    borderBottomLeftRadius: 10,
                                                    borderBottomRightRadius: 10, position: 'absolute', marginTop: 270, backgroundColor: 'white', zIndex: 1000, paddingHorizontal: 3
                                                }} keyboardShouldPersistTaps="always">
                                                    {renderSelectionList(state.productList, (e) => { Keyboard.dismiss(); setState(prevState => ({ ...prevState, filter: '', mode: 'select_attributes', selectedProduct: { product: { ...e, dealOptionItemOptionReqList: [] }, category: { ...item, catIndex: i } } })); }, state.filter)}
                                                </ScrollView>
                                                    :
                                                    null
                                                }
                                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                                    Add Products(s)
                                                </Text>
                                                <ScrollView nestedScrollEnabled style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', height: 180, padding: 5, borderColor: '#929293', borderWidth: 0.5, borderRadius: 7 }}>
                                                    {
                                                        item.dealOptionItemsList.map((dealOption, j) => {
                                                            return <View key={j} style={{ height: 40, justifyContent: 'center', paddingTop: 4, width: 230, margin: 5, marginTop: 10, borderColor: '#929293', borderWidth: 0.5, borderRadius: 7 }}>
                                                                <Text style={[commonStyles.fontStyles(15, props.activeTheme.white, 1), { backgroundColor: 'black', marginLeft: 5, paddingTop: 2, width: '75%', position: 'absolute', top: -10, paddingLeft: 3, height: 25 }]}>{dealOption.pitstopItemName}</Text>
                                                                <Text style={[commonStyles.fontStyles(13, props.activeTheme.black, 1), { marginLeft: 5 }]}>Rs:{dealOption.addOnPrice}</Text>
                                                                {props?.user?.canUpdatePrices === true ? <Text style={{ position: 'absolute', top: 1, right: 2 }} onPress={() => updateDealOptions(dealOption, i, j)}>X</Text> : <></>}
                                                            </View>
                                                        })
                                                    }
                                                </ScrollView>
                                            </View>
                                        })
                                    }
                                </View>
                            </ScrollView>
                        </View>
                        <DefaultBtn
                            title="Save & continue"
                            disabled={false}
                            backgroundColor={props.activeTheme.default}
                            onPress={() => onSave()}
                        />
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
                :
                state.mode === 'select_attributes' ?
                    <>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ ...styles.tempContainer(props.activeTheme) }}>
                            <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                                <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                                    <View style={{ paddingHorizontal: 15, width: '100%', flex: 1 }}>
                                        <Text style={{ margin: 15, ...commonStyles.fontStyles(18, props.activeTheme.black, 5), alignSelf: 'flex-start' }, styles.catpion(props.activeTheme)}>Select Attributes</Text>
                                        <ScrollView style={{ marginBottom: 25 }}>
                                            {state.selectedProduct?.product.attributeTypeGroupedList?.length > 0 ? state.selectedProduct?.product.attributeTypeGroupedList?.map((item, j) => {
                                                return <View key={j} style={{ width: '100%' }}><View style={{ width: '100%', marginVertical: 10, borderRadius: 7, justifyContent: 'center', alignItems: 'center', backgroundColor: props.activeTheme.default, height: 40 }}>
                                                    <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.white, 4) }}>{item.attributeTypeName}</Text>
                                                </View>
                                                    <View style={{ paddingHorizontal: 7, width: '100%', height: '100%' }}>
                                                        {
                                                            item.productAttributeList.map((it, i) => {
                                                                return <View key={i} style={stylesHome.checkboxContainer}>
                                                                    <CheckBox
                                                                        checked={it.isActive ? true : false}
                                                                        onPress={(e) => changeAttribute(e, j, i)}
                                                                        style={stylesHome.checkbox}
                                                                        color={props.activeTheme.default}
                                                                    />
                                                                    <Text style={stylesHome.label}>{it.attributeName}</Text>
                                                                </View>
                                                            })
                                                        }
                                                    </View>
                                                </View>
                                            })
                                                :
                                                <View>
                                                    <Text style={{ ...commonStyles.fontStyles(13, props.activeTheme.black, 3) }}>No Attributes Available</Text>
                                                </View>
                                            }
                                        </ScrollView>
                                    </View>
                                    <View style={{ position: 'absolute', bottom: 0, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                        <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: props.activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => { setState(pre => ({ ...pre, mode: '' })) }}>
                                            <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CANCEL</Text>
                                        </TouchableOpacity>


                                        <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center' }} onPress={() => addProductInCategory()}>
                                            <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CONTINUE{/*SAVE */}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Animated.View>
                        </KeyboardAvoidingView>
                    </>
                    :
                    <>
                        <KeyboardAvoidingView style={{ ...stylesHome.wrapper }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? null : null}>
                            <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Set {camelToTitleCase(state.mode)}</Text>

                            <View style={{ width: '100%', flexDirection: 'row' }}>
                                <Text style={{ ...stylesHome.caption, paddingLeft: 20, width: '33.3%', left: 0, color: '#000' }}>Day</Text>
                                <Text style={{ ...stylesHome.caption, paddingLeft: 17, width: '33.3%', left: 0, color: '#000' }}>Month</Text>
                                <Text style={{ ...stylesHome.caption, paddingLeft: 17, width: '33.3%', left: 0, color: '#000' }}>Year</Text>
                            </View>
                            <View style={{ marginTop: 2, paddingLeft: 20, paddingRight: 20, flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                                <Picker
                                    accessibilityLabel={"day"}
                                    style={{ zIndex: 500, width: 70 }}
                                    mode="dialog" // "dialog" || "dropdown"
                                    // prompt="Select Hours"
                                    selectedValue={state.selectedDate !== '' ? state.selectedDate.split("/")[0] : (new Date().getDay() < 10 ? '0' + new Date().getDay() : new Date().getDay().toString())}
                                    onValueChange={(value, i) => onDateChange(value, 0)}
                                >
                                    {
                                        Array.from(Array(32), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                            .filter(it => it !== '00').map((item, i) => (
                                                <Picker.Item key={i} label={item} value={item} />
                                            ))
                                    }
                                </Picker>
                                <Picker
                                    accessibilityLabel={"month"}
                                    style={{ zIndex: 500, width: 70 }}
                                    mode="dialog" // "dialog" || "dropdown"
                                    // prompt="Select Minutes"
                                    selectedValue={state.selectedDate !== '' ? state.selectedDate.split("/")[1] : (new Date().getMonth() < 10 ? '0' + new Date().getMonth() : new Date().getMonth().toString())}
                                    // selectedValue={(state.selectedDate || "DD/MM/YYYY").split("/")[1]}
                                    onValueChange={(value, i) => onDateChange(value, 1)}
                                >
                                    {
                                        Array.from(Array(13), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                            .filter(it => it !== '00').map((item, i) => (
                                                <Picker.Item key={i} label={item} value={item} />
                                            ))
                                    }
                                </Picker>
                                <Picker
                                    accessibilityLabel={"year"}
                                    style={{ zIndex: 500, width: 70 }}
                                    mode="dialog" // "dialog" || "dropdown"
                                    // prompt="Select Minutes"
                                    selectedValue={state.selectedDate !== '' ? state.selectedDate.split("/")[2] : (new Date().getFullYear().toString())}
                                    // selectedValue={(state.selectedDate || "DD/MM/YYYY").split("/")[2]}
                                    onValueChange={(value, i) => onDateChange(value, 2)}
                                >
                                    {
                                        Array.from(Array(15), (item, i) => ((i + (new Date().getFullYear())).toString()))
                                            .map((item, i) => (
                                                <Picker.Item key={i} label={item} value={item} />
                                            ))
                                    }
                                </Picker>
                            </View>
                            <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Set Time</Text>

                            <View style={{ width: '100%', flexDirection: 'row' }}>
                                <Text style={{ ...stylesHome.caption, paddingLeft: 20, width: '50%', left: 0, color: '#000' }}>Hour</Text>
                                <Text style={{ ...stylesHome.caption, paddingLeft: 17, width: '50%', left: 0, color: '#000' }}>Minutes</Text>
                            </View>
                            <View style={{ marginTop: 2, paddingLeft: 20, paddingRight: 20, marginBottom: 60, flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                                <Picker
                                    accessibilityLabel={"hours"}
                                    style={{ zIndex: 500, width: 115 }}
                                    mode="dialog" // "dialog" || "dropdown"
                                    // prompt="Select Hours"
                                    selectedValue={(state.selectedDate.split(' ')[1] || "HH:MM").split(":")[0]}
                                    onValueChange={(value, i) => onTimeChange(value, 0)}
                                >
                                    {
                                        Array.from(Array(24), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                            .map((item, i) => (
                                                <Picker.Item key={i} label={item} value={item} />
                                            ))
                                    }
                                </Picker>

                                <Text style={{ ...stylesHome.caption, left: 0, top: 2.5, color: "#000", fontWeight: "bold" }}>:</Text>

                                <Picker
                                    accessibilityLabel={"minutes"}
                                    style={{ zIndex: 500, width: 115 }}
                                    mode="dialog" // "dialog" || "dropdown"
                                    // prompt="Select Minutes"
                                    selectedValue={(state.selectedDate.split(' ')[1] || "HH:MM").split(":")[1]}
                                    onValueChange={(value, i) => onTimeChange(value, 1)}
                                >
                                    {
                                        Array.from(Array(60), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                            .map((item, i) => (
                                                <Picker.Item key={i} label={item} value={item} />
                                            ))
                                    }
                                </Picker>
                            </View>
                            <View style={{ position: 'absolute', bottom: 0, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: props.activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => { dispatch({ type: UPDATE_MODAL_HEIGHT, payload: false }); setState(pre => ({ ...pre, mode: '' })) }}>
                                    <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CANCEL</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center' }} onPress={() => saveDate()}>
                                    <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CONTINUE{/*SAVE */}</Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </>
            }
        </View>
    );
}
const stylesHome = StyleSheet.create({
    label: {
        margin: 8,
    },
    checkboxContainer: {
        width: 120, flexDirection: 'row'
    },
    checkbox: {
        alignSelf: "center",
        color: '#7359BE',
        borderColor: '#7359BE',
        borderRadius: 12, margin: 8
    },
    wrapper: {
        // alignItems: 'flex-start',
        flexDirection: 'column',
        backgroundColor: '#fff',
        width: '100%', //'85%'
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        // position: 'absolute',
        bottom: 0,
        height: '100%',
        justifyContent: 'center',
        alignSelf: 'center',
        zIndex: 5,
        shadowColor: '#000',
        // paddingLeft: 15,
        // paddingRight: 15,
        paddingTop: 15,
        paddingBottom: 0, //15
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    caption: {
        position: "relative",
        left: 10,
        fontSize: 15,
        color: '#7359BE',
        marginVertical: 10,
    },

});

export default connect()(AddUpdateDealModal);