import { CheckBox, Picker, Text, View } from 'native-base';
import colors from "../../styles/colors";
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Keyboard, Dimensions, ImageBackground } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { set } from 'react-native-reanimated';
import styles from '../../screens/userRegister/UserRegisterStyles';
import { renderPictureResizeable, sharedKeyboardDismissHandler, sharedlogoutUser } from '../../utils/sharedActions';
import CustomAndroidPickerItem from '../dropdowns/picker.android';
import { favHomeIcon } from '../../assets/svgIcons/customerorder/customerorder'
import { SvgXml } from 'react-native-svg';
import commonStyles from '../../styles/styles';
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DefaultBtn from '../buttons/DefaultBtn';
import { closeModalAction } from '../../redux/actions/modal';
import { postRequest } from '../../services/api';
import CustomToast from '../../components/toast/CustomToast';
import dummy from '../../assets/bike.png';
import common from '../../assets/svgIcons/common/common';
import { userAction } from '../../redux/actions/user';
const ProfileModal = (props) => {
    console.log('USer:', props.user)
    let weekArr = [false, false, false, false, false, false, false];
    props.user?.daysOfTheWeek?.map(it=>{
        weekArr[it] = true;
    });
    const [state, setState] = useState({
        showDropdown: false,
        pickTime: false,
        selectedValue: null,
        timePickMode: null,
        openingTime: props.user.openingTime.split(':')[0]+':'+props.user.openingTime.split(':')[1],
        active:props.user.pitstopStatus===1?true:false,
        closingTime: props.user.closingTime.split(':')[0]+':'+props.user.closingTime.split(':')[1],
        workingDays: weekArr,
        vendorList: props?.user?.vendorPitstopDetailsList?.map(item => { return { ...item, text: item.personName } }),
        vendor: props?.user?.vendorPitstopDetailsList[0],
    })
    const onDropdownClick = () => {
        setState(prevState => ({ ...prevState, showDropdown: !prevState.showDropdown }));
    }
    const onSave = () => {
        postRequest('Api/Vendor/Pitstop/Timings/Update', {
            "openingTime": state.openingTime,
            "closingTime": state.closingTime,
            "daysOfWeek": state.workingDays.map((it,i)=>{if(it===true){return i}}).filter(it=>it!==undefined),
            "pitstopStatus": state.active===true?1:2,
          }, {}, props.dispatch, (res) => {
            if (props.onSave) {
                props.onSave();
            }
            props.dispatch(userAction({ ...props.user,pitstopStatusDesc:state.active===true?"Activated":"Deactivated",pitstopStatus:state.active===true?1:2,closingTime:state.closingTime,openingTime:state.openingTime,daysOfTheWeek: state.workingDays.map((it,i)=>{if(it===true){return i}}).filter(it=>it!==undefined)}));
            CustomToast.success('Profile updated successfully')
            props.dispatch(closeModalAction());
        }, (err) => {CustomToast.error('Something went wrong!'); }, '');
    }
    const onTimeChange = (val, index) => {
        let selectedVal = state.selectedValue.split(':');
        selectedVal[index] = val;
        setState(pre => ({ ...pre, selectedValue: selectedVal.join(':') }));
    }
    const setWorkingDay = (i) => {
        let wrkingD = state.workingDays;
        wrkingD[i] = !wrkingD[i];
        console.log(wrkingD)
        setState(pre => ({
            ...pre,
            workingDays: wrkingD
        }));
    }
    const saveTime = () => {
        setState(pre => ({
            ...pre,
            [pre.timePickMode]: pre.selectedValue,
            selectedValue: null,
            pickTime: false,
            timePickMode: null
        }));
    }
    const renderSelectionList = (options, onChange, filter = false) => {
        let optionsFilter = filter !== false ? options.filter(item => { return item.text.toLowerCase().includes(filter.toLowerCase()) }) : options;
        if (optionsFilter.length < 1) {
            return <TouchableOpacity onPress={() => { setState(prevState => ({ ...prevState, showDropdown: '' })); }} style={{
                borderBottomColor: props.activeTheme.lightGrey,
                height: 40,
                justifyContent: "space-between",
                backgroundColor: 'white',
                zIndex: 999,
                borderColor: props.activeTheme.lightGrey,
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
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: i === (options.length - 1) ? 0 : 1,

            }}>
                <Text style={{ paddingLeft: 10, color: props.activeTheme.default }}>{r.text}</Text>
            </TouchableOpacity>
        ));
    }
    const getData = () => {
        postRequest('Api/Vendor/Pitstop/BrandGeneric/List', {
            "pageNumber": 1,
            "itemsPerPage": state.itemsPerPage + 10,
            "isAscending": true,
            "brandType": 1,
            "isPagination": true,
            "genericSearch": ""
        }, {}
            , props.dispatch, (res) => {
                console.log('Generic Brand Request:', res)
                setState(prevState => ({
                    ...prevState,
                    itemsPerPage: prevState.itemsPerPage + 10,
                    brandList: res.data.genericBrandListViewModels.brandData.sort((a, b) => { if (a['brandName'] < b['brandName']) { return -1; } else if (a['brandName'] > b['brandName']) { return 1; } else { return 0; } }).map(item => { return { ...item, text: item.brandName, value: item.brandID } }),
                    paginationInfo: res.data.genericBrandListViewModels.paginationInfo
                }))
            }, (err) => {
                if (err) CustomToast.error("Something went wrong");
            }, '', false);
    }
    useEffect(useCallback(() => {
        // getData();
        return () => {
            setState({
                ...state,
            })
        };
    }, []), []);
    return (
        <View style={{ ...StyleSheet.absoluteFill }}>
            {state.pickTime === false ?
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ ...styles.tempContainer(props.activeTheme) }} keyboardVerticalOffset={-550}>
                    <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                        <View style={{ flex: 1, ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                            <View style={{ justifyContent: 'space-between', width: '100%', paddingHorizontal: 10, flexDirection: 'row' }}>
                                <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.default, 3) }}>Profile</Text>
                                <View style={{backgroundColor:props.activeTheme.warning,padding:5,borderRadius:5}}><Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.white, 3) }} onPress={() => { props.dispatch(closeModalAction()); sharedlogoutUser(props.navigation, postRequest, props.dispatch, props.user, false) }}>Logout</Text></View>

                            </View>
                            {/* <Text style={styles.catpion(props.activeTheme),{width:50,alignSelf:'flex-start'}}>Profile</Text> */}
                            {/* <Text style={{alignSelf:'flex-end'}}>Logout</Text> */}
                            {/* <ScrollView style={{ flex: 1, marginBottom: 30 }} keyboardShouldPersistTaps="always"> */}
                            <View style={{ paddingHorizontal: 7, width: '100%', flex: 1 }}>
                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                    Name
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
                                        {/* <TextInput value={state.brand.text !== '' ? state.brand.text : ''} placeholder={'Choose Brand'}  onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'brand', brand:{...pre.brand,text:val} }))} /> */}

                                        <Text>{state.vendor.name ? state.vendor.name : 'Choose Vendor'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {state.showDropdown === true ? <ScrollView nestedScrollEnabled style={{
                                    marginHorizontal: 15, width: '95%', borderColor: props.activeTheme.lightGrey,
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
                                    {renderSelectionList(state.vendorList, (e) => { Keyboard.dismiss(); setState(prevState => ({ ...prevState, vendor: e })); })}

                                    {/* </View> */}
                                </ScrollView>
                                    :
                                    null
                                }
                            </View>
                            <View style={{ flex: 5, margin: 8, width: '95%' }}>
                                <View style={{ flex: 7, marginBottom: 20, backgroundColor: '#F5F6FA', borderColor: '#929293', borderWidth: 0.5, borderRadius: 15, marginTop: 20, width: '100%' }}>
                                    <View style={{ height: '42%', flexDirection: 'row', padding: 20, flex: 1, borderBottomWidth: 1, borderBottomColor: '#929293' }}>
                                        <View style={{ flex: 0.62, marginLeft: 20, marginVertical: 5, justifyContent: 'center' }}>
                                            <Text>{state.vendor.personName}</Text>
                                            <Text>{state.vendor.email}</Text>
                                            <Text>{state.vendor.contactNo}</Text>
                                        </View>
                                        <TouchableOpacity style={{ flex: 0.38 }} onPress={() => setState(pre => ({ ...pre, active: !pre.active }))}>
                                            <View style={{ flex: 1, ...stylesHome.homeTabView, backgroundColor: state.active ? props.activeTheme.default : props.activeTheme.warning, marginVertical: 1, marginHorizontal: 15 }}>
                                                <SvgXml xml={common.open_close(state.active === true ? 'Opened' : 'Closed')} height={'100%'} width={'100%'} viewBox="0 0 41 41" />
                                                {/* <ImageBackground
                                            resizeMode='stretch'
                                            source={ {uri:common.open_close()}}
                                            // source={item.brandImages && item.brandImages.length > 0 ? { uri: renderPicture(item.brandImages[0].joviImage, props.user.tokenObj && props.user.tokenObj.token.authToken) } : dummy}
                                            style={{ ...stylesHome.homeTabImage }}
                                        /> */}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ height: '42%', justifyContent: 'center', alignItems: 'center', paddingLeft: 8, flex: 3, flexDirection: 'row' }}>
                                        <View style={{ flex: 1, height: '60%' }}>
                                            <TouchableOpacity style={{ flex: 1 }} onPress={() => setState(pre => ({ ...pre, selectedValue: pre.openingTime, timePickMode: 'openingTime', pickTime: true }))}>
                                                <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.black, 4) }}>Opening</Text>
                                                <View style={{ height: '80%', justifyContent: 'center', alignItems: 'center', width: '90%', margin: 5, backgroundColor: props.activeTheme.default, borderColor: '#929293', borderWidth: 0.5, borderRadius: 15 }}><Text style={{ ...commonStyles.fontStyles(20, props.activeTheme.white, 4) }}>{state.openingTime}</Text></View>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flex: 1, height: '60%' }}>
                                            <TouchableOpacity style={{ flex: 1 }} onPress={() => setState(pre => ({ ...pre, selectedValue: pre.closingTime, timePickMode: 'closingTime', pickTime: true }))}>
                                                <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.black, 4) }}>Closing</Text>
                                                <View style={{ height: '80%', justifyContent: 'center', alignItems: 'center', width: '90%', margin: 5, backgroundColor: props.activeTheme.default, borderColor: '#929293', borderWidth: 0.5, borderRadius: 15 }}><Text style={{ ...commonStyles.fontStyles(20, props.activeTheme.white, 4) }}>{state.closingTime}</Text></View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                </View>
                                <Text style={{ marginVertical: 8, marginLeft: 8, ...commonStyles.fontStyles(18, props.activeTheme.black, 4) }}>Working Days:</Text>
                                <View style={{ flex: 2, width: '100%', flexDirection: 'row', flexWrap: 'nowrap' }}>

                                    {/* {
                                            ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((item, i) => {
                                                return <View key={i} style={stylesHome.checkboxContainer}>
                                                    <CheckBox
                                                        checked={state.workingDays[i]}
                                                        onPress={() => setWorkingDay(i)}
                                                        style={stylesHome.checkbox}
                                                        color={props.activeTheme.default}
                                                    />
                                                    <Text style={stylesHome.label}>{item}</Text>
                                                </View>
                                            })
                                        } */}
                                    {
                                        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((item, i) => {
                                            return <View key={i} style={{ backgroundColor: state.workingDays[i] ? props.activeTheme.default : 'white', borderRadius: 5, justifyContent: 'center', alignItems: 'center',height:50, flex:1, margin: 4 }}>
                                                <Text style={{ ...commonStyles.fontStyles(14, state.workingDays[i] ? 'white' : 'black', 3) }} onPress={() => setWorkingDay(i)}>{item}</Text>
                                            </View>
                                        })
                                    }
                                </View>
                            </View>
                            {/* </ScrollView> */}
                            <DefaultBtn
                                title="Save"
                                // disabled={checkValidation()?true:false}
                                backgroundColor={props.activeTheme.default}
                                onPress={() => onSave()}
                            />
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
                :
                <>
                    <KeyboardAvoidingView style={{ ...stylesHome.wrapper }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? null : null}>
                        <Text style={{ ...stylesHome.caption, left: 7 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Set Time</Text>


                        <View style={{ marginTop: 35, paddingLeft: 20, paddingRight: 20, marginBottom: 30, flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                            <Picker
                                accessibilityLabel={"hours"}
                                style={{ zIndex: 500, width: 115 }}
                                mode="dialog" // "dialog" || "dropdown"
                                // prompt="Select Hours"
                                selectedValue={(state.selectedValue || "HH:MM").split(":")[0]}
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
                                selectedValue={(state.selectedValue || "HH:MM").split(":")[1]}
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
                            <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: props.activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => setState(pre => ({ ...pre, pickTime: false }))}>
                                <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CANCEL</Text>
                            </TouchableOpacity>


                            <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center' }} onPress={() => saveTime()}>
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
    homeTab: { height: 110, ...commonStyles.shadowStyles(null, null, null, null, 0.3), backgroundColor: '#fff', borderColor: '#929293', borderWidth: 0.5, borderRadius: 15, flexDirection: 'row', marginVertical: 5 },
    homeTabView: { paddingTop: 5, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: 10 },
    homeTabImage: {
        flex: 1,
        top: 1,
        marginLeft: 10,
        width: '90%',
        "height": "90%",
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
    label: {
        margin: 8,
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
    homeTabText: { flex: 0.8, alignSelf: 'flex-start', borderRadius: 25, left: 20, top: 5 },
    homeTabBrandName: { marginTop: 0 },
    homeTabDesc: (props) => { return { maxWidth: '90%', ...commonStyles.fontStyles(10, props.activeTheme.black, 1, '300'), padding: 2 } },
    homeTabCounter: (props) => { return { flex: 0.1, width: 5, height: 27, margin: 3, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 90, backgroundColor: props.activeTheme.background } }

});
export default ProfileModal;