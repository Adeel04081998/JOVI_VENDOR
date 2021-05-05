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
import { CustomInput } from '../SharedComponents';
import { error400, priceValidation } from '../../utils/sharedActions';
const DisableProductModal = (props) => {
    const { brandObj, productObj, item } = props;
    console.log(item)
    const [state, setState] = useState({
        showDropdown: false,
        brand: brandObj ? brandObj : '',
        product: productObj ? productObj : '',
        item: item ? item : '',
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
    const onSave = () => {
        if(state.item.price === null || state.item.price === undefined||parseInt(state.item.price) === 0 || state.item.price ===''){
            CustomToast.error('Price cant be empty');
        }else{
            postRequest('Api/Vendor/Pitstop/PitstopItem/Update', {
                "pitstopItemID": state.item.itemID,
                "price": state.item.price,
                "availablityStatus": state.item.availabilityStatus === 'Available' ? 1 : state.item.availabilityStatus === 'Out Of Stock' ? 2 : 3
            }, {}, props.dispatch, (res) => {
                // props.dispatch(closeModalAction());
                props.onSave();
            }, (err) => {
                if (err.status === 400) error400(err)
                else CustomToast.error('Something went wrong!');
            }, '',false,true);
        }
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
                        {/* <View style={{ height: 40, top: 5, flexWrap: 'wrap',zIndex:1000, overflow: 'hidden', borderRadius: 5, borderWidth: 0.5, borderColor: '#7359BE', width: '90%', marginHorizontal: 20 }}>
                            {
                                ['Available', 'Out Of Stock', 'Discontinued'].map((it, i) => {
                                    return <View key={i} style={{ width: '33.33%', borderRadius: 5, height: '100%', backgroundColor: state.item.availabilityStatus === it ? '#7359BE' : 'white' }} >
                                        <TouchableOpacity style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => setState(pre => ({ ...pre, item: { ...pre.item, availabilityStatus: it } }))}>
                                            <Text style={[commonStyles.fontStyles(16, state.item.availabilityStatus === it ? props.activeTheme.white : props.activeTheme.black, 1)]}>{it}</Text>
                                        </TouchableOpacity>
                                    </View>
                                })
                            }
                        </View> */}
                        <View style={{ paddingHorizontal: 15, width: '100%', flex: 1 }}>
                            {props?.user?.canUpdatePrices !== true?<Text style={{ ...commonStyles.fontStyles(undefined, props.activeTheme.default, 1, 'bold') }}>{"*Please Contact Your Account Manager For Update"}</Text>:<></>}
                            <ScrollView style={{ marginBottom: 15 }}>
                                <CustomInput
                                    value={state?.brand?.brandName}
                                    label={'Brand Name'}
                                    activeTheme={props.activeTheme}
                                    onlyText={true}
                                    parentViewStyle={{ paddingLeft: 0 }}
                                    inputViewStyle={{ width: '100%' }}
                                />
                                <CustomInput
                                    value={state?.product?.productName}
                                    label={'Product Name'}
                                    activeTheme={props.activeTheme}
                                    onlyText={true}
                                    parentViewStyle={{ paddingLeft: 0 }}
                                    inputViewStyle={{ width: '100%' }}
                                />
                                <CustomInput
                                    value={state?.item?.itemName}
                                    label={'Item'}
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
                                        return <TouchableOpacity key={i} style={{ flexDirection: 'row' }} onPress={() => setState(pre => ({ ...pre, item: { ...pre.item, availabilityStatus: item } }))}>
                                            <CheckBox
                                                checked={state.item.availabilityStatus === item}
                                                onPress={() => setState(pre => ({ ...pre, item: { ...pre.item, availabilityStatus: item } }))}
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
                                    value={state?.item?.price?.toString()}
                                    label={'Price'}
                                    activeTheme={props.activeTheme}
                                    onlyText={props?.user?.canUpdatePrices === true ? false : true}
                                    parentViewStyle={{ paddingLeft: 0 }}
                                    inputViewStyle={{ width: '100%' }}
                                    inputProps={{ keyboardType: 'numeric' }}
                                    onChangeText={(val) => setState(pre => ({ ...pre, item: { ...pre.item, price: !priceValidation(val)? pre.item.price : val } }))}
                                />
                                {state.item.attributes && state.item.attributes.length > 0 ?
                                    state.item.attributes.filter(it => it.attributeName !== 'Quantity').map((it, i) => {
                                        return <View key={i}>
                                            <CustomInput
                                                value={it?.attributeName}
                                                label={it?.type}
                                                activeTheme={props.activeTheme}
                                                onlyText={true}
                                                parentViewStyle={{ paddingLeft: 0 }}
                                                inputViewStyle={{ width: '100%' }}
                                            />
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

export default DisableProductModal;