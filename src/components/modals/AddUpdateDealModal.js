import { CheckBox, Picker, Text, View } from 'native-base';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, TouchableOpacity, Keyboard } from 'react-native';
import React, { useEffect, useState } from 'react';
import Animated, { set } from 'react-native-reanimated';
import styles from '../../screens/userRegister/UserRegisterStyles';
import commonStyles from '../../styles/styles';
import DefaultBtn from '../buttons/DefaultBtn';
import { getRequest, postRequest } from '../../services/api';
import CustomToast from '../toast/CustomToast';
import { TextInput } from 'react-native-gesture-handler';
import { camelToTitleCase } from '../../utils/sharedActions';
import { UPDATE_MODAL_HEIGHT } from '../../redux/actions/types';
import { connect } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
const AddUpdateDealModal = (props) => {
    const { dispatch, updateDeal } = props;
    // console.log(item)
    const [state, setState] = useState({
        showDropdown: false,
        deal: updateDeal!==null ? {...updateDeal,inActiveIndex:updateDeal.inActive === false?0:1} : {
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
    const onDropdownClick = (dropdownTitle) => {
        setState(pre => ({ ...pre, showDropdown: pre.showDropdown !== '' ? '' : dropdownTitle }));
    }
    const getPitstopProducts = () => {

    }
    const saveDate = () => {
        setState(pre => ({
            ...pre, deal: {
                ...pre.deal,
                [pre.mode]: pre.selectedDate,
            },
            mode: '',
            selectedDate: 'DD/MM/YYYY',
        }));
        dispatch({ type: UPDATE_MODAL_HEIGHT, payload: false });
    }
    const onDateChange = (val, index) => {
        let selectedVal = state.selectedDate.split('/');
        selectedVal[index] = val;
        setState(pre => ({ ...pre, selectedDate: selectedVal.join('/') }));
    }
    const setDatePickerState = (varName) => {
        setState(pre => ({ ...pre, selectedDate: pre.deal[varName], mode: varName }));
        dispatch({ type: UPDATE_MODAL_HEIGHT, payload: Dimensions.get('window').height * 0.3 });
    }
    const updateDealOptions = (item,firstIndex,secondIndex) => {
        let newState = state;
        newState.deal.dealOptionsList[firstIndex].dealOptionItemsList.splice(secondIndex,1);
        setState({...newState});
    }
    const onChangeDealProduct = (val,index,key) => {
        let dealCategory = state.deal.dealOptionsList;
        dealCategory[index][key] = val;
        setState(pre=>({...pre,deal:{...pre.deal,dealOptionsList:dealCategory}}));
    }
    const addNewCategory = () => {
        setState(pre => ({ ...pre, deal: { ...pre.deal,
             dealOptionsList: [...pre.deal.dealOptionsList,  {
                "dealOptionID": 0,
                "dealOptionDescription": "",
                "quantity": 1,
                "isChoosed": false,
                "dealOptionItemsList": []
              }] }}))
    }
    const getDealCategories = () => {
        getRequest('Api/Vendor/Deals/Categories/list',{},props.dispatch,(res)=>{
            console.log('Deal Categories ---------------------> ',res.data)
            setState(pre=>({...pre,
                dealTypes:res.data.dealsCategories.dealsCategoriesDataVM.map(it=>{return {...it,text:it.name,value:it.categoryID}}),
            }))
        },(err)=>{
            if(err)CustomToast.error('Something went wrong');
        },'')
    }
    useFocusEffect(()=>{
        getDealCategories();
        return()=>{
            setState({
                showDropdown: false,
                deal:{
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
    },[]);
    const onSave = () => {
        let formData = new FormData();
        formData.append('CategoryID', state.deal.type);
        formData.append('PitstopDealID', 0);
        // formData.append('PitstopDealID', state.pitstopDealID);
        formData.append('PitstopID', props.user.pitstopID);
        formData.append('DealName', state.deal.title);
        formData.append('StartDate', state.deal.startDate);
        formData.append('EndDate', state.deal.endDate);
        formData.append('Description', state.deal.description);
        formData.append('DealPrice', state.deal.price);
        formData.append(
            'DealImageList[0].joviImageID',
            state.deal.dealImagesList.joviImageID ? state.deal.dealImagesList.joviImageID : 0
        );
        formData.append('DealImageList[0].joviImage', state.deal.dealImagesList.joviImage);
        state.deal.categories.map((obj, i) => {
            formData.append(`DealOptionsList[${i}].dealOptionID`, obj.dealOptionID);
            formData.append(`DealOptionsList[${i}].dealOptionDescription`, obj.dealOptionDescription);
            formData.append(`DealOptionsList[${i}].quantity`, obj.quantity);
            obj.dealOptionItemsList.map((secondObj, j) => {
                formData.append(
                    `DealOptionsList[${i}].dealOptionItemsList[${j}].dealOptionItemID`,
                    secondObj.dealOptionItemID
                );
                formData.append(
                    `DealOptionsList[${i}].dealOptionItemsList[${j}].pitstopItemID`,
                    secondObj.pitstopItemID
                );
                // formData.append(`DealOptionsList[${i}].dealOptionItemsList[${j}].addOnPrice`, secondObj.addOnPrice);
                secondObj.dealOptionItemOptionReqList.map((thirdObj, k) => {
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
        postRequest('Api/Vendor/Pitstop/PitstopItem/Update', {
            "pitstopItemID": state.item.itemID,
            "price": state.item.price,
            "availablityStatus": state.item.availabilityStatus === 'Available' ? 1 : state.item.availabilityStatus === 'Out Of Stock' ? 2 : 3
        }, {}, props.dispatch, (res) => {
            // props.dispatch(closeModalAction());
            props.onSave();
        }, (err) => {
            debugger;
            if (err) CustomToast.error('Something went wrong!');
        }, '');
    }
    const renderSelectionList = (options, onChange, filter = false) => {
        // let data = [{ text: 'Activate', value: 'Activated' }, { text: 'Deactivate', value: 'Deactivated' }];
        let optionsFilter = filter !== false ? options.filter(item => { return item.text.toLowerCase().includes(filter.toLowerCase()) }) : options;
        if (optionsFilter.length < 1) {
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
    return (
        <View style={{ ...StyleSheet.absoluteFill }}>

            {state.mode === '' ? <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ ...styles.tempContainer(props.activeTheme) }}>
                <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                    <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                        <View style={{ height: 40, top: 5, flexWrap: 'wrap', overflow: 'hidden', borderRadius: 5, borderWidth: 0.5, borderColor: '#7359BE', width: '90%', marginHorizontal: 20 }}>
                            {
                                ['Available', 'Unavailable'].map((it, i) => {
                                    return <View key={i} style={{ width: '50%', borderRadius: 5, height: '100%', backgroundColor: state.deal.inActiveIndex === i? '#7359BE' : 'white' }} >
                                        <TouchableOpacity style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => setState(pre => ({ ...pre, deal: { ...pre.deal, inActiveIndex: i } }))}>
                                            <Text style={[commonStyles.fontStyles(16, state.deal.inActiveIndex === i ? props.activeTheme.white : props.activeTheme.black, 1)]}>{it}</Text>
                                        </TouchableOpacity>
                                    </View>
                                })
                            }
                        </View>
                        <View style={{ paddingHorizontal: 15, width: '100%', flex: 1 }}>
                            <Text style={{ margin: 15, ...commonStyles.fontStyles(18, props.activeTheme.black, 5), alignSelf: 'flex-start' }, styles.catpion(props.activeTheme)}>Create a Deal</Text>
                            <ScrollView style={{ marginBottom: 15 }}>
                                <View style={{ paddingHorizontal: 7, width: '100%', height: '100%' }}>
                                    <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                        Deal Category
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
                                        {/* <TouchableOpacity onPress={() => onDropdownClick('product')} style={{ maxWidth: '95%', minWidth: '90%' }}> */}
                                        <TextInput value={state.deal.categoryName} placeholder={'Choose Deal Type'} onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: 'deal_type', deal: { ...pre.deal, categoryName: val } }))} />
                                        {/* </TouchableOpacity> */}
                                    </View>
                                    {state.showDropdown === 'deal_type' ? <ScrollView nestedScrollEnabled onScrollEndDrag={(e) => {
                                    }} style={{
                                        marginHorizontal: 10, width: '95%', height: 80, borderColor: props.activeTheme.lightGrey,
                                        borderWidth: 1,
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10, position: 'absolute', marginTop: 80, backgroundColor: 'white', zIndex: 1000, paddingHorizontal: 3
                                    }} keyboardShouldPersistTaps="always">
                                        {renderSelectionList(state?.dealTypes, (e) => { Keyboard.dismiss(); setState(prevState => ({ ...prevState,deal:{...prevState.deal,categoryName:e.text,categoryID:e.value} })); }, state.deal.categoryName)}
                                    </ScrollView>
                                        :
                                        null
                                    }
                                    <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                        Deal Name
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
                                        {/* <TouchableOpacity onPress={() => onDropdownClick('product')} style={{ maxWidth: '95%', minWidth: '90%' }}> */}
                                        <TextInput value={state.deal.title} placeholder={'Create a Deal'} onChangeText={(val) => setState(pre => ({ ...pre, deal: { ...pre.deal, title: val } }))} />
                                        {/* </TouchableOpacity> */}
                                    </View>
                                    <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
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
                                        {/* <TouchableOpacity onPress={() => onDropdownClick('product')} style={{ maxWidth: '95%', minWidth: '90%' }}> */}
                                        <TextInput value={state.deal.price.toString()} placeholder={'Price'} onChangeText={(val) => setState(pre => ({ ...pre, deal: { ...pre.deal, price: val } }))} />
                                        {/* </TouchableOpacity> */}
                                    </View>
                                    <View style={{ width: '100%', flexDirection: 'row' }}>
                                        <View style={{ width: '50%' }}>
                                            <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                                Start Date
                                        </Text>
                                            <View style={{
                                                paddingHorizontal: 12,
                                                borderWidth: 1,
                                                borderRadius: 5,
                                                borderColor: 'rgba(0,0,0,0.1)',
                                                backgroundColor: 'transparent',
                                                height: 40,
                                                width: '96%',
                                                justifyContent: "space-between",
                                                alignItems: 'center',
                                                flexDirection: 'row'
                                            }}>
                                                <Text style={{ ...commonStyles.fontStyles(13, props.activeTheme.grey, 3) }} onPress={() => setDatePickerState('startDate')}>{state.deal.startDate ? state.deal.startDate : 'Start Date'}</Text>
                                                {/* <TextInput value={state.deal} placeholder={'Date From'} onChangeText={(val) => setState(pre => ({ ...pre, deal: { title: val } }))} /> */}
                                            </View>

                                        </View>
                                        <View style={{ width: '50%' }}>
                                            <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                                End Date
                                        </Text>
                                            <View style={{
                                                paddingHorizontal: 12,
                                                borderWidth: 1,
                                                borderRadius: 5,
                                                borderColor: 'rgba(0,0,0,0.1)',
                                                backgroundColor: 'transparent',
                                                width: '100%',
                                                height: 40,
                                                justifyContent: "space-between",
                                                alignItems: 'center',
                                                flexDirection: 'row'
                                            }}>
                                                <Text style={{ ...commonStyles.fontStyles(13, props.activeTheme.grey, 3) }} onPress={() => setDatePickerState('endDate')}>{state.deal.endDate ? state.deal.endDate : 'End Date'}</Text>
                                                {/* // <TextInput value={state.deal} placeholder={'Date To'} onChangeText={(val) => setState(pre => ({ ...pre, deal: { title: val } }))} /> */}
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                        Description
                                </Text>
                                    <View style={{
                                        paddingHorizontal: 12,
                                        borderWidth: 1,
                                        borderRadius: 5,
                                        borderColor: 'rgba(0,0,0,0.1)',
                                        backgroundColor: 'transparent',
                                        height: 100,
                                        justifyContent: 'flex-start',
                                        alignContent:'flex-start',
                                        alignItems: 'flex-start',
                                        flexDirection: 'row'
                                    }}>
                                        {/* <TouchableOpacity onPress={() => onDropdownClick('product')} style={{ maxWidth: '95%', minWidth: '90%' }}> */}
                                        <TextInput value={state.deal.description} multiline={true} numberOfLines={5} placeholder={'Description'} onChangeText={(val) => setState(pre => ({ ...pre, deal: { ...pre.deal, description: val } }))} />
                                        {/* </TouchableOpacity> */}
                                    </View>
                                    <TouchableOpacity style={{ width: '100%', marginVertical: 10, borderRadius: 7, justifyContent: 'center', alignItems: 'center', backgroundColor: props.activeTheme.default, height: 40 }} onPress={() => addNewCategory()}>
                                        <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.white, 4) }}>+ Create New</Text>
                                    </TouchableOpacity>
                                    {
                                        state.deal?.dealOptionsList?.map((item, i) => {
                                            return <View key={i} style={{ marginVertical: 5, paddingBottom: state.showDropdown !== '' && i === state.deal.categories.length - 1 ? 70 : 0, }}>
                                                <View style={{ height: 30, borderRadius: 7, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 10, backgroundColor: props.activeTheme.default }}>
                                                    <Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.white, 3) }}>Category {i + 1}</Text>
                                                    <Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.white, 3) }} onPress={() => setState(pre => ({ ...pre, deal: { ...pre.deal, dealOptionsList: pre.deal.dealOptionsList.filter((it, j) => j !== i) } }))}>X</Text>
                                                </View>
                                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                                    Category Name
                                                </Text>
                                                <View style={{
                                                    paddingHorizontal: 12,
                                                    borderWidth: 1,
                                                    borderRadius: 5,
                                                    borderColor: 'rgba(0,0,0,0.1)',
                                                    backgroundColor: 'transparent',
                                                    height: 40, marginVertical: 5,
                                                    justifyContent: "space-between",
                                                    alignItems: 'center',
                                                    flexDirection: 'row'
                                                }}>
                                                    <TextInput placeholder={'Enter Category Name'} onChangeText={(val)=>onChangeDealProduct(val,i,'dealOptionDescription')} value={item.dealOptionDescription} />
                                                    {/* <Text>{i}</Text> */}
                                                </View>
                                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                                {/* <Text onPress={() => setState(pre => ({ ...pre, mode: 'select_attributes' }))} style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}> */}
                                                    Quantity
                                                </Text>
                                                <View style={{
                                                    paddingHorizontal: 12,
                                                    borderWidth: 1,
                                                    borderRadius: 5,
                                                    borderColor: 'rgba(0,0,0,0.1)',
                                                    backgroundColor: 'transparent',
                                                    height: 40, marginVertical: 5,
                                                    justifyContent: "space-between",
                                                    alignItems: 'center',
                                                    flexDirection: 'row'
                                                }}>
                                                    <TextInput keyboardType={'numeric'} placeholder={'Enter Quantity'} onChangeText={(val)=>onChangeDealProduct(val,i,'quantity')} value={item.quantity.toString()} />
                                                    {/* <Text>{i}</Text> */}
                                                </View>
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
                                                    <TouchableOpacity onPress={() => onDropdownClick('product')} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                                        <TextInput value={state.filter} placeholder={'Choose Product'} onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'product-' + i, filter: val }))} />
                                                        {/* <Text>{state.brand.text ? state.brand.text : 'Choose Brand'}</Text> */}
                                                    </TouchableOpacity>
                                                </View>
                                                {state.showDropdown === 'product-' + i ? <ScrollView nestedScrollEnabled onScrollEndDrag={(e) => {
                                                }} style={{
                                                    marginHorizontal: 10, width: '95%', height: 80, borderColor: props.activeTheme.lightGrey,
                                                    borderWidth: 1,
                                                    borderBottomLeftRadius: 10,
                                                    borderBottomRightRadius: 10, position: 'absolute', marginTop: 290, backgroundColor: 'white', zIndex: 1000, paddingHorizontal: 3
                                                }} keyboardShouldPersistTaps="always">
                                                    {renderSelectionList(state.productList, (e) => { Keyboard.dismiss(); setState(prevState => ({ ...prevState, })); }, state.filter)}
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
                                                                <Text style={{ position: 'absolute', top: 1, right: 2 }} onPress={() =>updateDealOptions(dealOption,i,j)}>X</Text>
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
                                        <ScrollView style={{ marginBottom: 15 }}>
                                            <View style={{ paddingHorizontal: 7, width: '100%', height: '100%' }}>
                                                {
                                                    ['ab', 'asd'].map((it, i) => {
                                                        return <View key={i} style={stylesHome.checkboxContainer}>
                                                            <CheckBox
                                                                // checked={state.workingDays[i]}
                                                                onPress={() => { }}
                                                                style={stylesHome.checkbox}
                                                                color={props.activeTheme.default}
                                                            />
                                                            <Text style={stylesHome.label}>{it}</Text>
                                                        </View>
                                                    })
                                                }
                                            </View>
                                        </ScrollView>
                                    </View>
                                    <View style={{ position: 'absolute', bottom: 0, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                        <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: props.activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => { setState(pre => ({ ...pre, mode: '' })) }}>
                                            <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CANCEL</Text>
                                        </TouchableOpacity>


                                        <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center' }} onPress={() => { }}>
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
                            <View style={{ marginTop: 2, paddingLeft: 20, paddingRight: 20, marginBottom: 60, flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                                <Picker
                                    accessibilityLabel={"day"}
                                    style={{ zIndex: 500, width: 70 }}
                                    mode="dialog" // "dialog" || "dropdown"
                                    // prompt="Select Hours"
                                    selectedValue={(state.selectedDate || "DD/MM/YYYY").split("/")[0]}
                                    onValueChange={(value, i) => onDateChange(value, 0)}
                                >
                                    {
                                        Array.from(Array(32), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                            .filter(it => it !== '00').map((item, i) => (
                                                <Picker.Item key={i} label={item} value={item} />
                                            ))
                                    }
                                </Picker>

                                {/* <Text style={{ ...stylesHome.caption, left: 0, top: 2.5, color: "#000", fontWeight: "bold" }}>/</Text> */}

                                <Picker
                                    accessibilityLabel={"month"}
                                    style={{ zIndex: 500, width: 70 }}
                                    mode="dialog" // "dialog" || "dropdown"
                                    // prompt="Select Minutes"
                                    selectedValue={(state.selectedDate || "DD/MM/YYYY").split("/")[1]}
                                    onValueChange={(value, i) => onDateChange(value, 1)}
                                >
                                    {
                                        Array.from(Array(13), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                            .filter(it => it !== '00').map((item, i) => (
                                                <Picker.Item key={i} label={item} value={item} />
                                            ))
                                    }
                                </Picker>

                                {/* <Text style={{ ...stylesHome.caption, left: 0, top: 2.5, color: "#000", fontWeight: "bold" }}>/</Text> */}

                                <Picker
                                    accessibilityLabel={"year"}
                                    style={{ zIndex: 500, width: 70 }}
                                    mode="dialog" // "dialog" || "dropdown"
                                    // prompt="Select Minutes"
                                    selectedValue={(state.selectedDate || "DD/MM/YYYY").split("/")[2]}
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