import { CheckBox, Text, View } from 'native-base';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Animated from 'react-native-reanimated';
import styles from '../../screens/userRegister/UserRegisterStyles';
import commonStyles from '../../styles/styles';
import { TextInput } from 'react-native-gesture-handler';
import DefaultBtn from '../buttons/DefaultBtn';
import { postRequest } from '../../services/api';
import CustomToast from '../toast/CustomToast';
import { closeModalAction } from '../../redux/actions/modal';
const UpdateR_Product = (props) => {
    const {product} = props;
    console.log(props)
    const [state, setState] = useState({
        showDropdown: false,
        product: product?{...product}:{},
    })
    // const onDropdownClick = (dropdownTitle) => {
    //     setState(pre => ({ ...pre, showDropdown: pre.showDropdown !== '' ? '' : dropdownTitle }));
    // }
    // const onChangeHandler = (e) => {
    //     let value = e.target.value;
    //     setState(prevState => ({
    //         ...prevState,
    //         description: value
    //     }))
    // }
    const changeAttribute = (e, i, j, varName) => {
        let selectedP = state.product;
        if (varName === 'isActive') {
            selectedP.itemGroupedOptions[i].itemOptions[j].isActive = !selectedP.itemGroupedOptions[i].itemOptions[j].isActive;
        } else {
            selectedP.itemGroupedOptions[i].itemOptions[j][varName] = e;

        }
        setState(pre => ({ ...pre, product: selectedP }));

    }
    const onSave = () => {
        let attributes = [];
        state.product.itemGroupedOptions?.map(itt=>{
            itt.itemOptions.map(attr=>{
                attributes.push({
                    "itemOptionID": attr.itemOptionID,
                    "productAttributeID": attr.attributeID,
                    "addOnPrice": attr.price,
                    "isActive": attr.isActive
                  })
            })
        });
        console.log('Update Product:',attributes)
        postRequest('Api/Vendor/Pitstop/PitstopItem/Update', {
            "pitstopItemID": state.product.pitstopItemID,
            "price": state.product.basePrice,
            "availablityStatus": state.product.availabilityStatusStr === 'Available' ? 1 : state.product.availabilityStatusStr === 'Out Of Stock' ? 2 : 3,
            "itemOptions":attributes
        }, {}, props.dispatch, (res) => {
            CustomToast.success("Product Successfully Updated");
            props.onSave();
            props.dispatch(closeModalAction());
        }, (err) => {
            debugger;
            if (err) CustomToast.error('Something went wrong!');
        }, '');
    }
    // const renderSelectionList = () => {
    //     let data = [{ text: 'Activate', value: 'Activated' }, { text: 'Deactivate', value: 'Deactivated' }];
    //     return data.map((r, i) => (
    //         <TouchableOpacity onPress={() => { setState(prevState => ({ ...prevState, selectedDropdown: r.value, showDropdown: !prevState.showDropdown })) }} key={i} style={{
    //             borderBottomColor: props.activeTheme.lightGrey,
    //             height: 40,
    //             justifyContent: "space-between",
    //             flexDirection: 'row',
    //             alignItems: 'center',
    //             borderBottomWidth: i === (data.length - 1) ? 0 : 1,

    //         }}>
    //             <Text style={{ paddingLeft: 10, color: props.activeTheme.default }}>{r.text}</Text>
    //         </TouchableOpacity>
    //     ));
    // }
    return (
        <View style={{ ...StyleSheet.absoluteFill }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ ...styles.tempContainer(props.activeTheme) }}>
                <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                    <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                        <View style={{ height: 40,zIndex:1000, top: 5, flexWrap: 'wrap', overflow: 'hidden', borderRadius: 5, borderWidth: 0.5, borderColor: '#7359BE', width: '90%', marginHorizontal: 20 }}>
                            {
                                ['Available', 'Out Of Stock', 'Discontinued'].map((it, i) => {
                                    return <View key={i} style={{ width: '33.33%', borderRadius: 5, height: '100%', backgroundColor: state.product.availabilityStatusStr === it ? '#7359BE' : 'white' }} >
                                        <TouchableOpacity style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => setState(pre => ({ ...pre, product: { ...pre.product, availabilityStatusStr: it } }))}>
                                            <Text style={[commonStyles.fontStyles(16, state.product.availabilityStatusStr === it ? props.activeTheme.white : props.activeTheme.black, 1)]}>{it}</Text>
                                        </TouchableOpacity>
                                    </View>
                                })
                            }
                        </View>
                        <View style={{ paddingHorizontal: 15, width: '100%', flex: 1 }}>
                            <ScrollView style={{ marginBottom: 15 }}>
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
                                    {/* <TouchableOpacity > */}
                                    <Text style={{ maxWidth: '95%', minWidth: '90%' }}>{state.product.productName}</Text>
                                    {/* </TouchableOpacity> */}
                                </View>
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Category
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
                                    {/* <TouchableOpacity onPress={() => onDropdownClick()} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                    <Text>{state.selectedDropdown !== '' ? state.selectedDropdown : 'Choose Status'}</Text>
                                </TouchableOpacity> */}
                                    <Text style={{ maxWidth: '95%', minWidth: '90%' }}>{state.product.categoryName}</Text>
                                </View>
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Base Price
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
                                    {/* <TouchableOpacity onPress={() => onDropdownClick()} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                    <Text>{state.selectedDropdown !== '' ? state.selectedDropdown : 'Choose Status'}</Text>
                                </TouchableOpacity> */}
                                    <TextInput keyboardType='numeric' style={{ maxWidth: '95%', minWidth: '90%' }} value={state.product.basePrice?.toString()} onChangeText={(val) => setState(pre => ({ ...pre, product: { ...pre.product, basePrice: val.includes(' ')||val.includes('-')?pre.product.basePrice:val } }))} />
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
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'row'
                                    }}>
                                        {/* <TextInput value={state.product.description} multiline={true} numberOfLines={5} placeholder={'Description'} onChangeText={(val) => setState(pre => ({ ...pre,product:{...pre.product,description:val} }))} /> */}
                                        <Text>{state.product.description}</Text>
                                    </View>
                                {state.product.itemGroupedOptions && state.product.itemGroupedOptions.length > 0 ?
                                    state.product.itemGroupedOptions.map((it, i) => {
                                        return <View key={i} style={{ marginVertical: 5, paddingBottom: 0, }}>
                                            <View style={{ width: '100%', marginVertical: 10, borderRadius: 7, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 10, backgroundColor: props.activeTheme.default, height: 40 }} >
                                                <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.white, 4) }}>{it.attributeTypeName}</Text>
                                                {/* <Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.white, 3) }} onPress={() => setState(pre => ({ ...pre, }))}>X</Text> */}
                                            </View>
                                           {it.itemOptions.map((itemOptions,j)=>{
                                               return  <View key={j+i} style={{ flex: 1, marginVertical: 5, justifyContent: 'space-between', flexDirection: 'row' }}>
                                               <View style={{ flexDirection: 'row' }}>
                                                   <CheckBox
                                                       checked={itemOptions.isActive ? itemOptions.isActive : false}
                                                       onPress={(e) => changeAttribute(e, i, j, 'isActive')}
                                                       style={{
                                                           alignSelf: "center",
                                                           color: '#7359BE',
                                                           borderColor: '#7359BE',
                                                           borderRadius: 12, margin: 8
                                                       }}
                                                       color={props.activeTheme.default}
                                                   />
                                                   <Text style={{ margin: 8 }}>{itemOptions.attributeName}</Text>
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
                                                   <TextInput keyboardType='numeric' style={{}} onChangeText={val => changeAttribute(val, i, j, 'price')} value={itemOptions.price?.toString()} />
                                               </View>
                                           </View>
                                           })}
                                        </View>
                                    })
                                    :
                                    <></>
                                }
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
        </View>
    );
}

export default UpdateR_Product;