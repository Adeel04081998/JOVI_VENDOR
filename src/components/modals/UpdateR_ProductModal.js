import { CheckBox, Picker, Text, View } from 'native-base';
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
import { CustomInput, TimePicker12,TimePicker24 } from '../SharedComponents';
import { convert24To12Hour, convertTime12to24, error400, handleTimeChange, priceValidation } from '../../utils/sharedActions';
const UpdateR_Product = (props) => {
    let { product } = props;
    if(product.startTime||product.endTime||product.estimateTime){
        product = {...product,
        startTime: convert24To12Hour(product.startTime).time,
        endTime: convert24To12Hour(product.endTime).time,
        // estimateTime: convert24To12Hour(product.estimateTime).time,
        }
    }
    const [state, setState] = useState({
        showDropdown: false,
        product: product ? { endTime: '', startTime: '', estimateTime: '', ...product } : {},
        // product: product ? { ...product,estimateTime:'00:00',startTime:'00:00',endTime:'00:00' } : {},
    })
    // const onDropdownClick = (dropdownTitle) => {
    //     setState(pre => ({ ...pre, showDropdown: pre.showDropdown !== '' ? '' : dropdownTitle }));
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
    const onTimeChange = (val, index, key) => {
        setState(pre => ({ ...pre, product: { ...pre.product, [key]: handleTimeChange(val, state.product[key], index,key === 'estimateTime'?true:false) } }));
    }
    const onSave = () => {
        if (state.product.basePrice === '' || parseInt(state.product.basePrice) === 0) {
            CustomToast.error('Price can\'t be empty or zero');
            return;
        }
        let attributes = [];
        state.product.itemGroupedOptions?.map(itt => {
            itt.itemOptions.map(attr => {
                attributes.push({
                    "itemOptionID": attr.itemOptionID,
                    "productAttributeID": attr.attributeID,
                    "addOnPrice": attr.price === '' ? 0 : attr.price,
                    "isActive": attr.isActive
                })
            })
        });
        console.log('Update Product:', state.product)
        postRequest('Api/Vendor/Pitstop/PitstopItem/Update', {
            "pitstopItemID": state.product.pitstopItemID,
            "price": state.product.basePrice === '' ? 0 : state.product.basePrice,
            "estimateTime": state.product.estimateTime,
            // "estimateTime": convertTime12to24(state.product.estimateTime),
            "startTime": convertTime12to24(state.product.startTime),
            "endTime":convertTime12to24(state.product.endTime),
            "availablityStatus": state.product.availabilityStatusStr === 'Available' ? 1 : state.product.availabilityStatusStr === 'Out Of Stock' ? 2 : 3,
            "itemOptions": attributes
        }, {}, props.dispatch, (res) => {
            CustomToast.success("Product Successfully Updated");
            props.onSave();
            props.dispatch(closeModalAction());
        }, (err) => {
            if (err.status === 400) error400(err)
            else CustomToast.error('Something went wrong!');
        }, '', false, true);
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
                        {/* <View style={{ height: 40, zIndex: 1000, top: 5, flexWrap: 'wrap', overflow: 'hidden', borderRadius: 5, borderWidth: 0.5, borderColor: '#7359BE', width: '90%', marginHorizontal: 20 }}>
                            {
                                ['Available', 'Out Of Stock', 'Discontinued'].map((it, i) => {
                                    return <View key={i} style={{ width: '33.33%', borderRadius: 5, height: '100%', backgroundColor: state.product.availabilityStatusStr === it ? '#7359BE' : 'white' }} >
                                        <TouchableOpacity style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => setState(pre => ({ ...pre, product: { ...pre.product, availabilityStatusStr: it } }))}>
                                            <Text style={[commonStyles.fontStyles(16, state.product.availabilityStatusStr === it ? props.activeTheme.white : props.activeTheme.black, 1)]}>{it}</Text>
                                        </TouchableOpacity>
                                    </View>
                                })
                            }
                        </View> */}
                        <View style={{ paddingHorizontal: 15, width: '100%', flex: 1 }}>
                            {props?.user?.canUpdatePrices !== true ? <Text style={{ ...commonStyles.fontStyles(undefined, props.activeTheme.default, 1, 'bold') }}>{"*Please Contact Your Account Manager For Update"}</Text> : <></>}
                            <ScrollView style={{ marginBottom: 15 }}>
                                <CustomInput
                                    value={state.product.productName}
                                    label={'Product Name'}
                                    activeTheme={props.activeTheme}
                                    onlyText={true}
                                    parentViewStyle={{ paddingLeft: 0 }}
                                    inputViewStyle={{ width: '100%' }}
                                />
                                <CustomInput
                                    value={state.product.categoryName}
                                    label={'Category'}
                                    activeTheme={props.activeTheme}
                                    onlyText={true}
                                    parentViewStyle={{ paddingLeft: 0 }}
                                    inputViewStyle={{ width: '100%' }}
                                />
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Status
                            </Text>
                                {
                                    ['Available', 'Out Of Stock', 'Discontinued'].map((item, i) => {
                                        return <TouchableOpacity key={i} style={{ flexDirection: 'row' }} onPress={() => setState(pre => ({ ...pre, product: { ...pre.product, availabilityStatusStr: item } }))}>
                                            <CheckBox
                                                checked={state.product.availabilityStatusStr === item}
                                                onPress={() => setState(pre => ({ ...pre, product: { ...pre.product, availabilityStatusStr: item } }))}
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
                                <CustomInput
                                    value={state?.product?.basePrice?.toString()}
                                    label={'Base Price'}
                                    activeTheme={props.activeTheme}
                                    onlyText={props?.user?.canUpdatePrices === true ? false : true}
                                    parentViewStyle={{ paddingLeft: 0 }}
                                    inputViewStyle={{ width: '100%' }}
                                    inputProps={{ keyboardType: 'numeric' }}
                                    onChangeText={(val) => setState(pre => ({ ...pre, product: { ...pre.product, basePrice: !priceValidation(val) ? pre.product.basePrice : val } }))}
                                />
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
                                <>
                                    <TimePicker24
                                        activeTheme={props.activeTheme}
                                        time={state.product.estimateTime}
                                        title={'Set Preparation Time'}
                                        noButtons={true}
                                        onTimeChange={(val, index) => onTimeChange(val, index, 'estimateTime')}
                                    />
                                </>
                                <>
                                    <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Set Available Time</Text>
                                    <TimePicker12
                                        activeTheme={props.activeTheme}
                                        time={state.product.startTime}
                                        title={'Start Time'}
                                        noButtons={true}
                                        onTimeChange={(val, index) => onTimeChange(val, index, 'startTime')}
                                    />
                                </>
                                <>
                                    <TimePicker12
                                        activeTheme={props.activeTheme}
                                        time={state.product.endTime}
                                        title={'End Time'}
                                        noButtons={true}
                                        onTimeChange={(val, index) => onTimeChange(val, index, 'endTime')}
                                    />
                                </>
                                {state.product.itemGroupedOptions && state.product.itemGroupedOptions.length > 0 ?
                                    state.product.itemGroupedOptions.map((it, i) => {
                                        return <View key={i} style={{ marginVertical: 5, paddingBottom: 0, }}>
                                            <View style={{ width: '100%', marginVertical: 10, borderRadius: 7, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 10, backgroundColor: props.activeTheme.default, height: 40 }} >
                                                <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.white, 4) }}>{it.attributeTypeName}</Text>
                                                {/* <Text style={{ ...commonStyles.fontStyles(12, props.activeTheme.white, 3) }} onPress={() => setState(pre => ({ ...pre, }))}>X</Text> */}
                                            </View>
                                            {it.itemOptions.map((itemOptions, j) => {
                                                return <View key={j + i} style={{ flex: 1, marginVertical: 5, justifyContent: 'space-between', flexDirection: 'row' }}>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <CheckBox
                                                            checked={itemOptions.isActive ? itemOptions.isActive : false}
                                                            onPress={props?.user?.canUpdatePrices === true ? (e) => changeAttribute(e, i, j, 'isActive') : () => { }}
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
                                                        {props?.user?.canUpdatePrices === true ?
                                                            <TextInput keyboardType='numeric' style={{}} onChangeText={val => priceValidation(val) ? changeAttribute(val, i, j, 'price') : () => { }} value={itemOptions.price?.toString()} />
                                                            :
                                                            <Text>{itemOptions.price?.toString()}</Text>
                                                        }
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
export default UpdateR_Product;