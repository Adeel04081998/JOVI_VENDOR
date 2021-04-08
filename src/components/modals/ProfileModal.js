import { CheckBox, Picker, Text, View } from 'native-base';
import colors from "../../styles/colors";
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Keyboard, Dimensions, ImageBackground } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { set } from 'react-native-reanimated';
import styles from '../../screens/userRegister/UserRegisterStyles';
import { renderPictureResizeable, sharedKeyboardDismissHandler, camelToTitleCase, sharedlogoutUser, error400 } from '../../utils/sharedActions';
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
import dropdownIcon from '../../assets/dropdownIcn.svg';
import correctIcon from '../../assets/svgIcons/common/correct_icon.svg';
import common from '../../assets/svgIcons/common/common';
import { userAction } from '../../redux/actions/user';
import { connect } from 'react-redux';
import { UPDATE_MODAL_HEIGHT } from '../../redux/actions/types';
import errorsUI from '../validations';
import { CustomInput } from '../SharedComponents';
const ProfileModal = (props) => {
    console.log('USer:', props.user)
    const { dispatch } = props;
    let weekArr = [false, false, false, false, false, false, false];
    props.user?.daysOfTheWeek?.map(it => {
        weekArr[it] = true;
    });
    const [state, setState] = useState({
        showDropdown: false,
        mode: false,
        selectedValue: null,
        timePickMode: null,
        openingTime: props.user.openingTime.split(':')[0] + ':' + props.user.openingTime.split(':')[1],
        active: props.user.pitstopStatus === 1 ? true : false,
        closingTime: props.user.closingTime.split(':')[0] + ':' + props.user.closingTime.split(':')[1],
        workingDays: weekArr,
        vendorList: props?.user?.vendorPitstopDetailsList?.map(item => { return { ...item, text: item.personName } }),
        vendor: props?.user?.vendorPitstopDetailsList[0],
        wallet: { balance: 0 },
        walletTransactions: [],
        walletPagination: { itemsPerPage: 50 },
        focusedField: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        validationsArr: [],
    })
    const onDropdownClick = () => {
        setState(prevState => ({ ...prevState, showDropdown: !prevState.showDropdown }));
    }
    const showResetPasswordScreen = () => {
        setState(pre => ({ ...pre, mode: 'resetPassword' }));
        // dispatch({ type: UPDATE_MODAL_HEIGHT, payload: Dimensions.get('window').height * 0.65 });
    }
    const onChangePassword = () => {
        if (state.oldPassword === '' || state.newPassword === '' || state.confirmPassword === '') {
            CustomToast.error('All Fields are Required');
        } else if (state.newPassword !== state.confirmPassword) {
            CustomToast.error('New Entered Passwords doesnt match');
        } else if (state.validationsArr.includes(false)) {
            CustomToast.error('Invalid Password');
        }
        else {
            postRequest('Api/Vendor/ResetPasswordVendor', {
                "oldPassword": state.oldPassword,
                "password": state.newPassword,
                "confirmPassword": state.confirmPassword
            }, {}, dispatch, (res) => {
                CustomToast.success(res?.data?.message);
                // dispatch({ type: UPDATE_MODAL_HEIGHT, payload: false });
                setState(pre => ({ ...pre, mode: false }))
            }, (err) => {
                if (err) {
                    CustomToast.error(err?.message)
                }
            });
        }

    }
    const checkPasswordValidation = (value) => {
        state.validationsArr[0] = value.length >= 8 && value.length <= 32 ? true : false
        state.validationsArr[1] = value.match(/[A-Z]/g) ? true : false
        state.validationsArr[2] = value.match(/[a-z]/g) ? true : false
        state.validationsArr[3] = value.match(/[0-9]/g) ? true : false
        setState(pre => ({ ...pre, newPassword: value, validationsArr: state.validationsArr }));
    }
    const onSave = (onConfirm = false) => {
        if (state.workingDays.filter(item => item === true).length < 1 && onConfirm === false) {
            setState(pre => ({ ...pre, mode: 'confirm' }));
            dispatch({ type: UPDATE_MODAL_HEIGHT, payload: Dimensions.get('window').height * 0.25 });
            return;
        }
        console.log('Profile Update Req:',{
            "openingTime": state.openingTime,
            "closingTime": state.closingTime,
            "daysOfWeek": state.workingDays.map((it, i) => { if (it === true) { return i } }).filter(it => it !== undefined),
            "pitstopStatus": state.active === true ? 1 : 4,
        });
        postRequest('Api/Vendor/Pitstop/Timings/Update', {
            "openingTime": state.openingTime,
            "closingTime": state.closingTime,
            "daysOfWeek": state.workingDays.map((it, i) => { if (it === true) { return i } }).filter(it => it !== undefined),
            "pitstopStatus": state.active === true ? 1 : 4,
        }, {}, props.dispatch, (res) => {
            if (props.onSave) {
                props.onSave();
            }
            props.dispatch(userAction({ ...props.user, pitstopStatusDesc: state.active === true ? "Activated" : "Deactivated", pitstopStatus: state.active === true ? 1 : 2, closingTime: state.closingTime, openingTime: state.openingTime, daysOfTheWeek: state.workingDays.map((it, i) => { if (it === true) { return i } }).filter(it => it !== undefined) }));
            CustomToast.success('Profile updated successfully')
            props.dispatch(closeModalAction());
        }, (err) => {
            console.log(err)
            if (err.status === 400) error400(err)
            else CustomToast.error('Something went wrong!');
        }, '');
    }
    const onTimeChange = (val, index) => {
        let selectedVal = state.selectedValue.split(':');
        selectedVal[index] = val;
        setState(pre => ({ ...pre, selectedValue: selectedVal.join(':') }));
    }
    const setWorkingDay = (i) => {
        let wrkingD = state.workingDays;
        wrkingD[i] = !wrkingD[i];
        // console.log(wrkingD)
        setState(pre => ({
            ...pre,
            workingDays: wrkingD
        }));
    }
    const saveTime = () => {
        dispatch({ type: UPDATE_MODAL_HEIGHT, payload: false });
        setState(pre => ({
            ...pre,
            [pre.timePickMode]: pre.selectedValue,
            selectedValue: null,
            mode: false,
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
    const setTimePickerState = (varName) => {
        setState(pre => ({ ...pre, selectedValue: pre[varName], timePickMode: varName, mode: true }));
        dispatch({ type: UPDATE_MODAL_HEIGHT, payload: Dimensions.get('window').height * 0.3 });
    }
    const getBalanceData = (itemPerPage = false) => {

        postRequest('Api/Vendor/WalletDetails', {
            pitstopID: props?.user?.pitstopID,
            "pageNumber": 1,
            "itemsPerPage":itemPerPage!==false?itemPerPage:state.walletPagination.itemsPerPage,
        }, {}, props.dispatch, (res) => {
            console.log('Wallet Request ------->', res)
            setState(pre => ({
                ...pre,
                wallet: res?.data?.transactions?.walletVM,
                walletTransactions: res?.data?.transactions?.walletTransactionData,
                walletPagination: res?.data?.transactions?.paginationInfo,
            }))
        }, (err) => {
            if (err.status === 400) error400(err)
            else CustomToast.error('Something went wrong!');
        });
    }
    const navigateToLegalScreen = () => {
        props.navigation.navigate('Legal');
        props.dispatch(closeModalAction());
    }
    useEffect(useCallback(() => {
        // getData();
        getBalanceData();
        return () => {
            setState({
                ...state,
                wallet: {},
                walletTransactions: [],
                walletPagination: { itemsPerPage: 10 }
            })
        };
    }, []), []);
    return (
        <View style={{ ...StyleSheet.absoluteFill }}>
            {state.mode === false ?
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ ...styles.tempContainer(props.activeTheme) }} keyboardVerticalOffset={-550}>
                    <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                        <View style={{ flex: 1, ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                            <View style={{ justifyContent: 'space-between', width: '100%', paddingHorizontal: 10, flexDirection: 'row' }}>
                                <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.default, 3) }}>Profile</Text>
                                <View style={{ backgroundColor: props.activeTheme.warning, padding: 5, borderRadius: 5 }}><Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.white, 3) }} onPress={() => { props.dispatch(closeModalAction()); sharedlogoutUser(props.navigation, postRequest, props.dispatch, props.user, false) }}>Logout</Text></View>

                            </View>
                            <TouchableOpacity style={{ justifyContent: 'space-between', width: '100%', paddingHorizontal: 10, flexDirection: 'row' }} onPress={() => setState(pre => ({ ...pre, mode: 'balance_modal' }))}>
                                <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.default, 4) }}>Balance: {state.wallet.balance}</Text>
                            </TouchableOpacity>
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
                                    <TouchableOpacity onPress={() => onDropdownClick()} style={{ maxWidth: '95%', flexDirection: 'row', minWidth: '90%' }}>
                                        {/* <TextInput value={state.brand.text !== '' ? state.brand.text : ''} placeholder={'Choose Brand'}  onChangeText={(val) => setState(pre => ({ ...pre, showDropdown: val === '' ? '' : 'brand', brand:{...pre.brand,text:val} }))} /> */}
                                        <Text>{state.vendor.name ? state.vendor.name : 'Choose Vendor'}</Text>
                                        <SvgXml
                                            fill={props.activeTheme.default}
                                            xml={dropdownIcon}
                                            width={'5%'}
                                            style={{ position: 'absolute', right: -10, top: -5 }}
                                            height={'100%'}
                                        />
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
                                            <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 3) }}>{state.vendor.personName}</Text>
                                            <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 3) }}>{state.vendor.email}</Text>
                                            <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 3) }}>{state.vendor.contactNo}</Text>
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
                                            <TouchableOpacity style={{ flex: 1 }} onPress={() => setTimePickerState('openingTime')}>
                                                <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.black, 4) }}>Opening</Text>
                                                <View style={{ height: '80%', justifyContent: 'center', alignItems: 'center', width: '90%', margin: 5, backgroundColor: props.activeTheme.default, borderColor: '#929293', borderWidth: 0.5, borderRadius: 15 }}><Text style={{ ...commonStyles.fontStyles(20, props.activeTheme.white, 4) }}>{state.openingTime}</Text></View>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flex: 1, height: '60%' }}>
                                            <TouchableOpacity style={{ flex: 1 }} onPress={() => setTimePickerState('closingTime')}>
                                                <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.black, 4) }}>Closing</Text>
                                                <View style={{ height: '80%', justifyContent: 'center', alignItems: 'center', width: '90%', margin: 5, backgroundColor: props.activeTheme.default, borderColor: '#929293', borderWidth: 0.5, borderRadius: 15 }}><Text style={{ ...commonStyles.fontStyles(20, props.activeTheme.white, 4) }}>{state.closingTime}</Text></View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                </View>
                                <Text style={{ marginVertical: 8, marginLeft: 8, ...commonStyles.fontStyles(18, props.activeTheme.black, 4) }}>Working Days:</Text>
                                <View style={{ flex: 2, width: '100%', flexDirection: 'row', flexWrap: 'nowrap' }}>
                                    {
                                        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((item, i) => {
                                            return <View key={i} style={{ backgroundColor: state.workingDays[i] ? props.activeTheme.default : 'white', borderRadius: 5, justifyContent: 'center', alignItems: 'center', height: 44, flex: 1, margin: 4 }}>
                                                <Text style={{ ...commonStyles.fontStyles(14, state.workingDays[i] ? 'white' : 'black', 3) }} onPress={() => setWorkingDay(i)}>{item}</Text>
                                            </View>
                                        })
                                    }
                                </View>
                                <View style={{ marginVertical: 13, justifyContent: 'center', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <TouchableOpacity activeOpacity={1}  >
                                        <Text style={{ color: props.activeTheme.grey, fontSize: 14 }}>
                                            <Text onPress={navigateToLegalScreen} style={stylesHome.touchableText(props.activeTheme)}> Terms & conditions </Text>
                                            and
                                            <Text onPress={navigateToLegalScreen} style={stylesHome.touchableText(props.activeTheme)}>  Privacy Policy</Text>
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {/* <TouchableOpacity onPress={showResetPasswordScreen} style={{ marginVertical: 5, justifyContent: 'center', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Text style={stylesHome.touchableText(props.activeTheme)}>Reset Password</Text>
                                </TouchableOpacity> */}
                            </View>
                            <DefaultBtn
                                title="Save"
                                backgroundColor={props.activeTheme.default}
                                onPress={() => onSave()}
                            />
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
                :
                state.mode === 'balance_modal' ?
                    <>
                        <KeyboardAvoidingView style={{ ...stylesHome.wrapperConfirmation }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? null : null}>
                            <View style={{ flex: 1, ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                                <View style={{ justifyContent: 'flex-start', width: '100%' }}>
                                    <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0 }}>Wallet</Text>
                                    <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0 }}>Balance: {state.wallet.balance}</Text>
                                </View>
                                <ScrollView style={{ flex: 1, marginBottom: 30, width: '100%' }}
                                    onScroll={(e) => {
                                        let paddingToBottom = 10;
                                        paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                                        if (e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom) {
                                            // make something...
                                            if (state.walletPagination?.itemsPerPage < state.walletPagination?.totalItems) {
                                                getBalanceData(state.walletPagination.itemsPerPage + 10);
                                            }
                                        }
                                    }
                                    }
                                >
                                    {state.walletTransactions.length < 1 ?
                                        <View style={{ flex: 1, height: 100, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text>No Wallet Transactions Found</Text>
                                        </View>
                                        :
                                        state.walletTransactions.map((item, i) => {
                                            return <View key={i} style={{ height: 90, width: '97%', marginHorizontal: 7, marginVertical: 5, borderWidth: 1, borderColor: props.activeTheme.borderColor, borderRadius: 10 }}>
                                                <View style={{ width: '100%', paddingHorizontal: 5, paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ ...commonStyles.fontStyles(15, props.activeTheme.default, 4) }}>Order No: {item.orderID}</Text>
                                                    <Text style={{ ...commonStyles.fontStyles(13, props.activeTheme.grey, 3) }}>{item.dateTime}</Text>
                                                </View>
                                                <View style={{ width: '100%', justifyContent: 'space-between', marginTop: 5, paddingHorizontal: 5, flexDirection: 'row' }}>
                                                    <View style={{ height: 40 }}>
                                                        <Text style={{ ...commonStyles.fontStyles(15, props.activeTheme.defaultLight, 4) }}>Earning</Text>
                                                        <Text style={{ ...commonStyles.fontStyles(13, props.activeTheme.black, 1) }}>Rs.{item.amount}</Text>
                                                    </View>
                                                    {/* <View style={{ height: 40 }}>
                                                        <Text style={{ ...commonStyles.fontStyles(15, props.activeTheme.defaultLight, 4) }}>Vendor</Text>
                                                        <Text style={{ ...commonStyles.fontStyles(13, props.activeTheme.black, 1) }}>Rs.{item.amount}</Text>
                                                    </View>
                                                    <View style={{ height: 40 }}>
                                                        <Text style={{ ...commonStyles.fontStyles(15, props.activeTheme.defaultLight, 4) }}>Jovi</Text>
                                                        <Text style={{ ...commonStyles.fontStyles(13, props.activeTheme.black, 1) }}>Rs.{item.amount}</Text>
                                                    </View> */}
                                                </View>
                                            </View>
                                        })
                                    }
                                </ScrollView>
                                <View style={{ position: 'absolute', bottom: -30, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                    <TouchableOpacity style={{ width: '100%', paddingVertical: 20, height: 60, backgroundColor: props.activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => { setState(pre => ({ ...pre, mode: false })); }}>
                                        <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>Back</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </>
                    :
                    state.mode === 'resetPassword' ?
                        <>
                            <KeyboardAvoidingView style={{ ...stylesHome.wrapperConfirmation, justifyContent: 'flex-start' }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? null : null}>
                                <Text style={{ marginVertical: 10, marginHorizontal: 10, ...stylesHome.touchableText(props.activeTheme) }}>Reset Password</Text>
                                <ScrollView style={{ flex: 1, marginBottom: 40 }}>
                                    <CustomInput
                                        value={state.oldPassword}
                                        label={'Old Password'}
                                        activeTheme={props.activeTheme}
                                        onChangeText={(val) => setState(pre => ({ ...pre, oldPassword: val }))}
                                    />
                                    <CustomInput
                                        value={state.newPassword}
                                        label={'New Password'}
                                        activeTheme={props.activeTheme}
                                        onChangeText={(val) => checkPasswordValidation(val)}
                                        inputProps={{
                                            onBlur: () => setState(pre => ({ ...pre, focusedField: '' })),
                                            onFocus: () => setState(pre => ({ ...pre, focusedField: 'newPassword' }))
                                        }}
                                        rightIcon={state.newPassword!==''}
                                        svgIcon={!state.validationsArr.includes(false) ? correctIcon : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                        <g id="error_Ico" transform="translate(-310 -214)">
                                          <circle id="Ellipse_41" data-name="Ellipse 41" cx="10" cy="10" r="10" transform="translate(310 214)" fill="#fc3f93"/>
                                          <g id="error" transform="translate(315 198.641)">
                                            <path id="Path_208" data-name="Path 208" d="M10.292,28.361l-4.231-7.51a.985.985,0,0,0-1.705,0L.126,28.361a.991.991,0,0,0,.853,1.476H9.407A1,1,0,0,0,10.292,28.361Z" transform="translate(0)" fill="#beb5b5"/>
                                            <path id="Path_209" data-name="Path 209" d="M46.644,63.025l4.231,7.51H42.413l4.231-7.51Z" transform="translate(-41.435 -41.682)" fill="#fff"/>
                                            <g id="Group_209" data-name="Group 209" transform="translate(4.518 23.999)">
                                              <path id="Path_210" data-name="Path 210" d="M195.908,179.013l.262,1.738a.427.427,0,0,0,.426.361h0a.454.454,0,0,0,.426-.361l.262-1.738a.682.682,0,0,0-.689-.787h0A.7.7,0,0,0,195.908,179.013Z" transform="translate(-195.905 -178.226)" fill="#3f4448"/>
                                              <circle id="Ellipse_176" data-name="Ellipse 176" cx="0.394" cy="0.394" r="0.394" transform="translate(0.298 3.247)" fill="#3f4448"/>
                                            </g>
                                          </g>
                                        </g>
                                      </svg>
                                      `}
                                    />
                                    {
                                        errorsUI.passwordErrorMessageUi(state.focusedField, 'newPassword', state.newPassword, props.activeTheme, state.validationsArr, 1, 50, 10)
                                    }
                                     <CustomInput
                                        value={state.confirmPassword}
                                        label={'Confirm Password'}
                                        activeTheme={props.activeTheme}
                                        onChangeText={(val) => setState(pre => ({ ...pre, confirmPassword: val }))}
                                        rightIcon={state.confirmPassword !== ''}
                                        svgIcon={state.newPassword === state.confirmPassword  ? correctIcon : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                        <g id="error_Ico" transform="translate(-310 -214)">
                                          <circle id="Ellipse_41" data-name="Ellipse 41" cx="10" cy="10" r="10" transform="translate(310 214)" fill="#fc3f93"/>
                                          <g id="error" transform="translate(315 198.641)">
                                            <path id="Path_208" data-name="Path 208" d="M10.292,28.361l-4.231-7.51a.985.985,0,0,0-1.705,0L.126,28.361a.991.991,0,0,0,.853,1.476H9.407A1,1,0,0,0,10.292,28.361Z" transform="translate(0)" fill="#beb5b5"/>
                                            <path id="Path_209" data-name="Path 209" d="M46.644,63.025l4.231,7.51H42.413l4.231-7.51Z" transform="translate(-41.435 -41.682)" fill="#fff"/>
                                            <g id="Group_209" data-name="Group 209" transform="translate(4.518 23.999)">
                                              <path id="Path_210" data-name="Path 210" d="M195.908,179.013l.262,1.738a.427.427,0,0,0,.426.361h0a.454.454,0,0,0,.426-.361l.262-1.738a.682.682,0,0,0-.689-.787h0A.7.7,0,0,0,195.908,179.013Z" transform="translate(-195.905 -178.226)" fill="#3f4448"/>
                                              <circle id="Ellipse_176" data-name="Ellipse 176" cx="0.394" cy="0.394" r="0.394" transform="translate(0.298 3.247)" fill="#3f4448"/>
                                            </g>
                                          </g>
                                        </g>
                                      </svg>
                                      `}
                                    />
                                </ScrollView>
                                <View style={{ position: 'absolute', bottom: 0, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                    <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: props.activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => { setState(pre => ({ ...pre, mode: false })); dispatch({ type: UPDATE_MODAL_HEIGHT, payload: false }); }}>
                                        <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CANCEL</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center' }} onPress={() => onChangePassword()}>
                                        <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>SAVE</Text>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </>
                        :
                        state.mode === 'confirm' ?
                            <>
                                <KeyboardAvoidingView style={{ ...stylesHome.wrapperConfirmation }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? null : null}>
                                    <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0 }}>No Working Days Selected</Text>
                                    <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0 }}>Are you sure?</Text>
                                    <View style={{ position: 'absolute', bottom: 0, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                        <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: props.activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => { setState(pre => ({ ...pre, mode: false })); dispatch({ type: UPDATE_MODAL_HEIGHT, payload: false }); }}>
                                            <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CANCEL</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center' }} onPress={() => { setState(pre => ({ ...pre, mode: false })); onSave(true); dispatch({ type: UPDATE_MODAL_HEIGHT, payload: false }); }}>
                                            <Text style={{ ...stylesHome.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>SAVE</Text>
                                        </TouchableOpacity>
                                    </View>
                                </KeyboardAvoidingView>
                            </>
                            :
                            <>
                                <KeyboardAvoidingView style={{ ...stylesHome.wrapper }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? null : null}>
                                    <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Set {camelToTitleCase(state.timePickMode)}</Text>

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
                                        <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: props.activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => { dispatch({ type: UPDATE_MODAL_HEIGHT, payload: false }); setState(pre => ({ ...pre, mode: false })) }}>
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
    touchableText: activeTheme => ({
        ...commonStyles.fontStyles(14, activeTheme.default, 4)
    }),
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
    wrapperConfirmation: {
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
        paddingBottom: 30, //15
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
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
export default connect()(ProfileModal);