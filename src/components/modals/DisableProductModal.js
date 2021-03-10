import { Text, View } from 'native-base';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import React, {  useState } from 'react';
import Animated from 'react-native-reanimated';
import styles from '../../screens/userRegister/UserRegisterStyles';
import commonStyles from '../../styles/styles';
import { TextInput } from 'react-native-gesture-handler';
import DefaultBtn from '../buttons/DefaultBtn';
import { postRequest } from '../../services/api';
import CustomToast from '../toast/CustomToast';
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
        postRequest('Api/Vendor/Pitstop/PitstopItem/Update', {
            "pitstopItemID": state.item.itemID,
            "price": state.item.price,
            "availablityStatus": state.item.availabilityStatus === 'Available' ? 1 : state.item.availabilityStatus === 'Out Of Stock' ? 2 : 3
        }, {}, props.dispatch, (res) => {
            // props.dispatch(closeModalAction());
            props.onSave();
        }, (err) => {
            debugger;
            if(err) CustomToast.error('Something went wrong!');
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
                        <View style={{ height: 40, top: 5, flexWrap: 'wrap',zIndex:1000, overflow: 'hidden', borderRadius: 5, borderWidth: 0.5, borderColor: '#7359BE', width: '90%', marginHorizontal: 20 }}>
                            {
                                ['Available', 'Out Of Stock', 'Discontinued'].map((it, i) => {
                                    return <View key={i} style={{ width: '33.33%', borderRadius: 5, height: '100%', backgroundColor: state.item.availabilityStatus === it ? '#7359BE' : 'white' }} >
                                        <TouchableOpacity style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => setState(pre => ({ ...pre, item: { ...pre.item, availabilityStatus: it } }))}>
                                            <Text style={[commonStyles.fontStyles(16, state.item.availabilityStatus === it ? props.activeTheme.white : props.activeTheme.black, 1)]}>{it}</Text>
                                        </TouchableOpacity>
                                    </View>
                                })
                            }
                            {/* <View
                                style={{ width: '33.33%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#7359BE' }}
                            >
                                <Text style={[commonStyles.fontStyles(16, props.activeTheme.white, 1)]}>Available</Text>
                            </View>
                            <View
                                style={{ width: '33.33%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Text style={[commonStyles.fontStyles(16, props.activeTheme.black, 1)]}>Out of stock</Text>
                            </View>
                            <View
                                style={{ width: '33.33%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Text style={[commonStyles.fontStyles(16, props.activeTheme.black, 1)]}>Discontinue</Text>
                            </View> */}
                            {/* <Text style={styles.catpion(props.activeTheme)}>Change Item Status</Text> */}
                        </View>
                        <View style={{ paddingHorizontal: 15, width: '100%', flex: 1 }}>
                            <ScrollView style={{ marginBottom: 15 }}>
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
                                    {/* <TouchableOpacity > */}
                                    <Text style={{ maxWidth: '95%', minWidth: '90%' }}>{state.brand.brandName}</Text>
                                    {/* </TouchableOpacity> */}
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
                                    {/* <TouchableOpacity onPress={() => onDropdownClick()} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                    <Text>{state.selectedDropdown !== '' ? state.selectedDropdown : 'Choose Status'}</Text>
                                </TouchableOpacity> */}
                                    <Text style={{ maxWidth: '95%', minWidth: '90%' }}>{state.product.productName}</Text>
                                </View>
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
                                    {/* <TouchableOpacity onPress={() => onDropdownClick()} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                    <Text>{state.selectedDropdown !== '' ? state.selectedDropdown : 'Choose Status'}</Text>
                                </TouchableOpacity> */}
                                    <Text style={{ maxWidth: '95%', minWidth: '90%' }}>{state.item.itemName}</Text>
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
                                    {/* <TouchableOpacity onPress={() => onDropdownClick()} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                    <Text>{state.selectedDropdown !== '' ? state.selectedDropdown : 'Choose Status'}</Text>
                                </TouchableOpacity> */}
                                    <TextInput keyboardType='numeric' style={{ maxWidth: '95%', minWidth: '90%' }} value={state.item.price.toString()} onChangeText={(val) => setState(pre => ({ ...pre, item: { ...pre.item, price: val.includes(' ')||val.includes('-')?pre.item.price:val } }))} />
                                </View>
                                {state.item.attributes && state.item.attributes.length > 0 ?
                                    state.item.attributes.filter(it => it.attributeName !== 'Quantity').map((it, i) => {
                                        return <View key={i}>
                                            <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                                {it.type}
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
                                                <Text style={{ maxWidth: '95%', minWidth: '90%' }}>{it.attributeName}</Text>
                                            </View>
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