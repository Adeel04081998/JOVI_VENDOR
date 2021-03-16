import { CheckBox, Picker, Text, View } from 'native-base';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Keyboard, Dimensions } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Animated from 'react-native-reanimated';
import styles from '../../screens/userRegister/UserRegisterStyles';
import CustomToast from '../../components/toast/CustomToast';
import commonStyles from '../../styles/styles';
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DefaultBtn from '../buttons/DefaultBtn';
import { closeModalAction } from '../../redux/actions/modal';
import { postRequest } from '../../services/api';
const AddProductModalR = (props) => {
    const [state, setState] = useState({
        showDropdown: '',
        // selectedDropdown: props.product.active === true ? 'Activated' : 'Deactivated',
        addedItems: [],
        filter: '',
        itemsPerPage: 0,
        mode: '',
        paginationInfo: {},
        selectedProduct: {},
        // brandList: brandList?brandList.map(item=>{return{...item,text:item.brandName,value:item.brandID}}):[],
        productList: [],
    })
    // const [horizontalScrollState, setHorizontalScrollState] = useState({
    //     lastOffset: 0
    // });
    const onDropdownClick = (dropdownTitle) => {
        setState(prevState => ({ ...prevState, itemsPerPage: 0, showDropdown: prevState.showDropdown !== '' ? '' : dropdownTitle }));
        // setHorizontalScrollState({
        //     lastOffset: 0
        // });
    }
    const onTimeChange = (val, index,key) => {
        let selectedTime = state.selectedProduct[key].split(':');
        selectedTime[index] = val;
        setState(pre => ({ ...pre, selectedProduct: {...pre.selectedProduct,[key]:selectedTime.join(':')}}));
    }
    const changeAttribute = (e, i, j, varName) => {
        let selectedP = state.selectedProduct;
        if (varName === 'isActive') {
            selectedP.attributeTypeGroupedList[i].productAttributeList[j].isActive = !selectedP.attributeTypeGroupedList[i].productAttributeList[j].isActive;
        } else {
            selectedP.attributeTypeGroupedList[i].productAttributeList[j][varName] = e;

        }
        setState(pre => ({ ...pre, selectedProduct: selectedP }));

    }
    const onSave = () => {
        console.log(state.addedItems)
        let payload = {
            "genericProductList": state.addedItems.map(it => {
                let attrList = [];
                it.attributeTypeGroupedList?.map(itt => {
                    itt.productAttributeList.map(attr => {
                        attrList.push({
                            addOnPrice: attr.price,
                            isActive: attr.isActive,
                            productAttributeID: attr.attributeID
                        })
                    })
                });
                return {
                    "genericProductID": it.genericProductID,
                    "baseprice": it.basePrice,
                    "preparationTime": it.preparationTime,
                    "availableStartTime": it.availableStartTime,
                    "availableEndTime": it.availableEndTime,
                    "productAttributes": attrList
                }
            }),
            "pitstopID": props.user.pitstopID
        }
        console.log('Assign Product: ', payload);
        postRequest('Api/Vendor/Restaurant/AssignPitstopProduct', payload, {}, props.dispatch, (res) => {
            //   console.log('On Assign Brand:',res,state.item.map(item=>{return item.itemID}),state.product);
            CustomToast.success("Product Successfully Assigned");
            if (props.onSave) {
                props.onSave();
            }
            props.dispatch(closeModalAction());
        }, (err) => {
            if (err.statusCode === 404) CustomToast.error(err.message);
            else if (err) CustomToast.error("Something went wrong!");
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
    const checkValidation = () => {
        let check = false;
        if (state.addedItems.length < 1) {
            check = true;
        }
        return check;
    }
    const getData = () => {
        postRequest('Api/Vendor/Restaurant/Get/GenericProductListVendor',
            // postRequest('Api/Vendor/Pitstop/ProductGeneric/List',
            {
                // "pageNumber": 1,
                // "itemsPerPage": 10,
                // "isAscending": true,
                // "isPagination": false,
                // "productType": 2,
                "genericSearch": ""
            }, {}
            , props.dispatch, (res) => {
                console.log('Product Request:', res)
                if (res.data.statusCode === 200) {
                    setState(prevState => ({
                        ...prevState,
                        itemsPerPage: prevState.itemsPerPage + 10,
                        productList: res.data.vendorGenericProductVMList?.map(item => { return { ...item, value: item.genericProductID, text: item.genericProductName } }),
                        // productList: res.data.getProductListViewModel?.productData?.map(item => { return { ...item, value: item.productID, text: item.productName } }),
                        // paginationInfo: res.data.getProductListViewModel?.paginationInfo
                    }));
                }
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '', false);
    }
    useEffect(useCallback(() => {
        getData();
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

            {state.mode === '' ? <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                    <Text style={styles.catpion(props.activeTheme), { alignSelf: 'center' }}>Add Product</Text>
                    <ScrollView style={{ flex: 1, marginBottom: 30 }} keyboardShouldPersistTaps="always">
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
                                <TouchableOpacity onPress={() => onDropdownClick('product')} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                    <TextInput value={state.filter} placeholder={'Choose Product'} onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'product', filter: val }))} />
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
                                {renderSelectionList(state.productList, (e) => { Keyboard.dismiss(); setState(prevState => ({ ...prevState, filter: '', selectedProduct: {...e,preparationTime:'00:00',availableStartTime:'00:00',availableEndTime:'00:00'}, mode: 'select-attr' })); }, state.filter)}
                                {/* {renderSelectionList(state.productList, (e) => { Keyboard.dismiss(); setState(prevState => ({ ...prevState, filter: '', addedItems: prevState.addedItems.filter(item => item.productID === e.productID).length < 1 ? [...prevState.addedItems, e] : prevState.addedItems })); }, state.filter)} */}
                            </ScrollView>
                                :
                                null
                            }
                            <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                Add Product(s)
                                </Text>
                            <ScrollView nestedScrollEnabled style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', height: 180, padding: 5, borderColor: '#929293', borderWidth: 0.5, borderRadius: 7 }}>
                                {
                                    state.addedItems.map((item, i) => {
                                        return <View key={i} style={{ height: 40, justifyContent: 'center', paddingTop: 4, width: 230, margin: 5, marginTop: 10, borderColor: '#929293', borderWidth: 0.5, borderRadius: 7 }}>
                                            <Text style={[commonStyles.fontStyles(15, props.activeTheme.white, 1), { backgroundColor: 'black', marginLeft: 5, paddingTop: 2, width: '75%', position: 'absolute', top: -10, paddingLeft: 3, height: 25 }]}>{item.genericProductName}</Text>
                                            <Text style={[commonStyles.fontStyles(13, props.activeTheme.black, 1), { marginLeft: 5 }]}>{item.categoryName}</Text>
                                            <Text style={{ position: 'absolute', top: 1, right: 2 }} onPress={() => setState(pre => ({ ...pre, addedItems: pre.addedItems.filter(it => it.genericProductID !== item.genericProductID) }))}>X</Text>
                                        </View>
                                    })
                                }
                            </ScrollView>
                        </View>
                    </ScrollView>
                    <DefaultBtn
                        title="Save"
                        disabled={checkValidation() ? true : false}
                        backgroundColor={checkValidation() ? props.activeTheme.grey : props.activeTheme.default}
                        onPress={() => onSave()}
                    />
                </View>
            </Animated.View>
                :
                <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                    <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                        <Text style={styles.catpion(props.activeTheme), { alignSelf: 'center' }}>Select Attributes</Text>
                        <ScrollView style={{ flex: 1, marginBottom: 60, width: '100%' }} keyboardShouldPersistTaps="always">
                            <View style={{ paddingHorizontal: 7, width: '100%', height: '100%' }}>
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Base Price
                                </Text>
                                <View style={{
                                    paddingHorizontal: 8,
                                    paddingHorizontal: 8,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: 'rgba(0,0,0,0.1)',
                                    backgroundColor: 'transparent',
                                    height: 40,
                                    width: '100%',
                                    justifyContent: "space-between",
                                    alignItems: 'center',
                                    flexDirection: 'row'
                                }}>
                                    <TextInput keyboardType='numeric' style={{}} onChangeText={(val) => { setState(pre => ({ ...pre, selectedProduct: { ...pre.selectedProduct, basePrice: val } })) }} value={state.selectedProduct.basePrice.toString()} />
                                </View>
                                <>
                                    <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Set Preparation Time</Text>
                                    <View style={{ width: '100%', flexDirection: 'row' }}>
                                        <Text style={{ ...stylesHome.caption, paddingLeft: 20, width: '50%', left: 0, color: '#000' }}>Hour</Text>
                                        <Text style={{ ...stylesHome.caption, paddingLeft: 17, width: '50%', left: 0, color: '#000' }}>Minutes</Text>
                                    </View>
                                    <View style={{ marginTop: 2, paddingLeft: 20, paddingRight: 20,flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                                        <Picker
                                            accessibilityLabel={"hours"}
                                            style={{ zIndex: 500, width: 115 }}
                                            mode="dialog" // "dialog" || "dropdown"
                                            // prompt="Select Hours"
                                            selectedValue={(state.selectedProduct.preparationTime || "HH:MM").split(":")[0]}
                                            onValueChange={(value, i) => onTimeChange(value, 0,'preparationTime')}
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
                                            selectedValue={(state.selectedProduct.preparationTime || "HH:MM").split(":")[1]}
                                            onValueChange={(value, i) => onTimeChange(value, 1,'preparationTime')}
                                        >
                                            {
                                                Array.from(Array(60), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                                    .map((item, i) => (
                                                        <Picker.Item key={i} label={item} value={item} />
                                                    ))
                                            }
                                        </Picker>
                                    </View>
                                </>
                                <>
                                    <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Set Available Time</Text>
                                    <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4), left: 10 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Start Time</Text>
                                    <View style={{ width: '100%', flexDirection: 'row' }}>
                                        <Text style={{ ...stylesHome.caption, paddingLeft: 20, width: '50%', left: 0, color: '#000' }}>Hour</Text>
                                        <Text style={{ ...stylesHome.caption, paddingLeft: 17, width: '50%', left: 0, color: '#000' }}>Minutes</Text>
                                    </View>
                                    <View style={{ marginTop: 2, paddingLeft: 20, paddingRight: 20,flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                                        <Picker
                                            accessibilityLabel={"hours"}
                                            style={{ zIndex: 500, width: 115 }}
                                            mode="dialog" // "dialog" || "dropdown"
                                            selectedValue={(state.selectedProduct.availableStartTime || "HH:MM").split(":")[0]}
                                            onValueChange={(value, i) => onTimeChange(value, 0,'availableStartTime')}
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
                                            selectedValue={(state.selectedProduct.availableStartTime || "HH:MM").split(":")[1]}
                                            onValueChange={(value, i) => onTimeChange(value, 1,'availableStartTime')}
                                        >
                                            {
                                                Array.from(Array(60), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                                    .map((item, i) => (
                                                        <Picker.Item key={i} label={item} value={item} />
                                                    ))
                                            }
                                        </Picker>
                                    </View>
                                </>
                                <>
                                    <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4), left: 10 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>End Time</Text>
                                    <View style={{ width: '100%', flexDirection: 'row' }}>
                                        <Text style={{ ...stylesHome.caption, paddingLeft: 20, width: '50%', left: 0, color: '#000' }}>Hour</Text>
                                        <Text style={{ ...stylesHome.caption, paddingLeft: 17, width: '50%', left: 0, color: '#000' }}>Minutes</Text>
                                    </View>
                                    <View style={{ marginTop: 2, paddingLeft: 20, paddingRight: 20, flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                                        <Picker
                                            accessibilityLabel={"hours"}
                                            style={{ zIndex: 500, width: 115 }}
                                            mode="dialog" // "dialog" || "dropdown"
                                            // prompt="Select Hours"
                                            selectedValue={(state.selectedProduct.availableEndTime || "HH:MM").split(":")[0]}
                                            onValueChange={(value, i) => onTimeChange(value, 0,'availableEndTime')}
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
                                            selectedValue={(state.selectedProduct.availableEndTime || "HH:MM").split(":")[1]}
                                            onValueChange={(value, i) => onTimeChange(value, 1,'availableEndTime')}
                                        >
                                            {
                                                Array.from(Array(60), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                                                    .map((item, i) => (
                                                        <Picker.Item key={i} label={item} value={item} />
                                                    ))
                                            }
                                        </Picker>
                                    </View>
                                </>
                                {
                                    state.selectedProduct.attributeTypeGroupedList.map((item, i) => {
                                        return <View key={i} style={{ width: '100%' }}>
                                            <View style={{ width: '100%', marginVertical: 10, borderRadius: 7, justifyContent: 'center', alignItems: 'center', backgroundColor: props.activeTheme.default, height: 40 }} onPress={() => setState(pre => ({ ...pre, deal: { ...pre.deal, categories: [...pre.deal.categories, pre.deal.categories.length + 1] } }))}>
                                                <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.white, 4) }}>{item.attributeTypeName}</Text>
                                            </View>
                                            {item.productAttributeList.map((it, j) => {
                                                return <View key={j + i + state.selectedProduct.attributeTypeGroupedList.length} style={{ flex: 1, marginVertical: 5, justifyContent: 'space-between', flexDirection: 'row' }}>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <CheckBox
                                                            checked={it.isActive ? it.isActive : false}
                                                            onPress={(e) => changeAttribute(e, i, j, 'isActive')}
                                                            style={{
                                                                alignSelf: "center",
                                                                color: '#7359BE',
                                                                borderColor: '#7359BE',
                                                                borderRadius: 12, margin: 8
                                                            }}
                                                            color={props.activeTheme.default}
                                                        />
                                                        <Text style={{ margin: 8 }}>{it.attributeName}</Text>
                                                    </View>
                                                    <View style={{
                                                        paddingHorizontal: 8,
                                                        paddingHorizontal: 8,
                                                        borderWidth: 1,
                                                        borderRadius: 5,
                                                        borderColor: 'rgba(0,0,0,0.1)',
                                                        backgroundColor: 'transparent',
                                                        height: 40,
                                                        width: 190,
                                                        justifyContent: "space-between",
                                                        alignItems: 'center',
                                                        flexDirection: 'row'
                                                    }}>
                                                        <TextInput keyboardType='numeric' style={{}} onChangeText={val => changeAttribute(val, i, j, 'price')} value={it.price.toString()} />
                                                    </View>
                                                </View>
                                            })}
                                        </View>
                                    })
                                }
                            </View>
                        </ScrollView>
                        <View style={{ position: 'absolute', bottom: 0, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                            <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: props.activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => { setState(pre => ({ ...pre, mode: '' })) }}>
                                <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CANCEL</Text>
                            </TouchableOpacity>


                            <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center' }} onPress={() => { setState(pre => ({ ...pre, mode: '', filter: '', selectedProduct: {}, addedItems: pre.addedItems.filter(item => item.genericProductID === pre.selectedProduct.genericProductID).length < 1 ? [...pre.addedItems, pre.selectedProduct] : pre.addedItems })) }}>
                                <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CONTINUE{/*SAVE */}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            }
        </KeyboardAvoidingView>
        // </View>
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
export default AddProductModalR;