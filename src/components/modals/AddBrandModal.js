import { Picker, Text, View } from 'native-base';
import colors from "../../styles/colors";
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
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
const AddBrandModal = (props) => {
    const {brandList} = props;
    const [state, setState] = useState({
        showDropdown: '',
        // selectedDropdown: props.product.active === true ? 'Activated' : 'Deactivated',
        brand: '',
        product: '',
        itemName: '',
        addedItems: [],
        itemSize: '',
        itemColor: '',
        itemFitting: '',
        itemPrice: '',
        brandList: brandList?brandList.map(item=>{return{...item,text:item.brandName,value:item.brandID}}):[],
        productList: [],
        itemsList: [],
    })
    const onDropdownClick = (dropdownTitle) => {
        setState(prevState => ({ ...prevState, showDropdown:prevState.showDropdown!==''?'': dropdownTitle }));
    }
    const onChangeHandler = (e) => {
        let value = e.target.value;
        setState(prevState => ({
            ...prevState,
            description: value
        }))
    }
    const onSave = () => {
        props.onSaveStatus({ productID: props.product.productID, active: state.selectedDropdown === 'Activated' ? true : false, description: state.description });
        props.dispatch(closeModalAction());
    }
    const renderSelectionList = (options, onChange,) => {
        // let data = [{ text: 'Activate', value: 'Activated' }, { text: 'Deactivate', value: 'Deactivated' }];
        return options.map((r, i) => (
            <TouchableOpacity onPress={() => { setState(prevState => ({ ...prevState, showDropdown: '' })); onChange(r) }} key={i} style={{
                borderBottomColor: props.activeTheme.lightGrey,
                height: 40,
                justifyContent: "space-between",
                backgroundColor:'white',
                zIndex:999,
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

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ ...styles.tempContainer(props.activeTheme) }}>
                <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                    <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                        <Text style={styles.catpion(props.activeTheme)}>Add Brand</Text>
                        <ScrollView  style={{ flex: 1,marginBottom:30 }} keyboardShouldPersistTaps="always">
                            <View style={{ paddingHorizontal: 7, width: '100%', flex: 1 }}>
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
                                    <TouchableOpacity onPress={() => onDropdownClick('brand')} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                        <Text>{state.brand !== '' ? state.brand : 'Choose Brand'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown === 'brand' ? <ScrollView nestedScrollEnabled style={{
                                    marginHorizontal: 15, width: '95%',height:200, borderColor: props.activeTheme.lightGrey,
                                    borderWidth: 1,
                                    borderBottomLeftRadius: 10,
                                    borderBottomRightRadius: 10, position: 'absolute', marginTop: 80,backgroundColor:'white', zIndex: 1000, paddingHorizontal: 3
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
                                        {renderSelectionList(state.brandList, (e) => { setState(prevState=>({...prevState,brand:e.text}))})}

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
                                    <TouchableOpacity onPress={() => onDropdownClick('product')} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                        <Text>{state.product !== '' ? state.product : 'Choose Product'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown==='product' ? <ScrollView nestedScrollEnabled style={{
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
                                        {/* {renderSelectionList()} */}

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
                                        <Text>{state.itemName !== '' ? state.itemName : 'Choose Items'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown ? <ScrollView nestedScrollEnabled style={{
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
                                        {/* {renderSelectionList()} */}

                                    </View>
                                </ScrollView>
                                    :
                                    null
                                }
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Add Items
                            </Text>
                                <TextInput
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
                                />
                            <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                Size
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
                                    <Text>{state.itemSize !== '' ? state.itemSize : 'Choose Item Size'}</Text>
                                </TouchableOpacity>
                            </View>
                            {state.showDropdown ? <ScrollView nestedScrollEnabled style={{
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
                                    {/* {renderSelectionList()} */}

                                </View>
                            </ScrollView>
                                :
                                null
                            }
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
                                    <Text>{state.itemName !== '' ? state.itemName : 'Choose Color'}</Text>
                                </TouchableOpacity>
                            </View>
                            {state.showDropdown ? <ScrollView nestedScrollEnabled style={{
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
                                    {/* {renderSelectionList()} */}

                                </View>
                            </ScrollView>
                                :
                                null
                            }
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
                            </View>
                            {state.showDropdown ? <ScrollView nestedScrollEnabled style={{
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
                                    {/* {renderSelectionList()} */}

                                </View>
                            </ScrollView>
                                :
                                null
                            }
                            </View>
                        </ScrollView>
                        <DefaultBtn
                            title="Save and continue"
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

export default AddBrandModal;