import React, { useRef, useState, useEffect } from "react";
import { Image, View, Animated, TouchableOpacity, TouchableWithoutFeedback, Text, TextInput, ImageBackground, Platform, KeyboardAvoidingView, Keyboard, Alert } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import styles from './OtpStyles';
import colors from "../../styles/colors";
import doodleImg from '../../assets/doodle.png';
import RNOtpVerify from 'react-native-otp-verify';
import { userAction } from "../../redux/actions/user";
import { postRequest } from "../../services/api";
import { sharedKeyboardDismissHandler, navigateWithResetScreen } from "../../utils/sharedActions";
import Validator from 'validator';
import correctsign from '../../assets/svgIcons/common/correct_icon.svg';
import errorIcon from '../../assets/svgIcons/common/error_icon.svg';
import { SvgXml } from 'react-native-svg';
import CustomPicker from "../../components/dropdowns/CustomPicker";
import downArrow from '../../assets/caret-down.png';
import SubmitBtn from "../../components/buttons/SubmitBtn";
import commonStyles from '../../styles/styles';
import { useFocusEffect } from '@react-navigation/native';
import CountryPicker, { getAllCountries, getCallingCode } from 'react-native-country-picker-modal';
import CustomToast from '../../components/toast/CustomToast';

const OTP = (props) => {
    // console.log("OTP.PROPS :", props);
    const { dispatch, activeTheme, navigation, behavior } = props;

    // console.log('navigation.dangerouslyGetState() :', navigation.dangerouslyGetState())
    let initState = {
        countryCode: '92',
        cellNo: '',
        isValid: false,
        showPicker: false,
        animation: new Animated.Value(1),
        gradientView: new Animated.Value(1.5),
        maxLength: 15,

    };
    const [state, setState] = useState(initState);
    const inputRef = useRef(null);
    const { countryCode, cellNo, isValid, showPicker, keypaidOpen, animation, gradientView } = state;
    let cellNoCheck = cellNo.length < 10 ? false : true;

    const togglePicker = () => {
        setState(prevState => ({ ...prevState, showPicker: !prevState.showPicker }))
    }
    const setSelectedValue = countryCode => {
        // console.log('Ran-----', itemIndex, itemValue);
        togglePicker()
        setState({ ...state, countryCode });
    };
    const onChangeNumberHandler = value => {
        value = value.replace(/\s/g, "");
        if (value === "") return setState({ ...state, cellNo: value, isValid: Validator.isNumeric(value), maxLength: 15 });
        else if (!cellNo.length && value == '0') value = '';
        else if (value[0] == '0') {
            value = value.slice(1, value.length);
        }
        else {
            // value = value;
            value = value;
        }
        setState({ ...state, cellNo: value, isValid: Validator.isNumeric(value), maxLength: 10 });
    };
    const onSuccessHandler = response => {
        clearState();
        // navigation.navigate('Code', {
        //     'paramsData': response.config.data, backScreenObj: {
        //         container: null,
        //         screen: "Login"
        //     }
        // });
        navigateWithResetScreen(0, [{
            name: 'Code',
            params: {
                paramsData: response.config.data,
                backScreenObj: navigation.dangerouslyGetState()?.routes[navigation.dangerouslyGetState().index].backScreenObj ?
                    navigation.dangerouslyGetState()?.routes[navigation.dangerouslyGetState().index].backScreenObj : { container: null, screen: "Login" }
            },
        }])
    };
    const onErrorHandler = error => {
        console.log("OTP.js -> onErrorHandler :--- ,", error);
        CustomToast.error(error.errors.PhoneNumber[0] || '');
    };
    const sendOtpRequestHandler = async () => {
        let appHash = null;
        let data = null;
        let phoneNumber = countryCode + cellNo;
        // let phoneNumber = '923177925710';
        if (Platform.OS === 'android') {
            appHash = await RNOtpVerify.getHash();
            data = {
                'phoneNumber': phoneNumber,
                'appHash': appHash[0]
            };
            // console.log('appHash :', appHash)
        } else {
            data = {
                'phoneNumber': phoneNumber,
            };
        }
        // dispatch(userAction({ ...props.user,  phoneNumber, appHash }));
        dispatch(userAction({ ...props.user, mobile: phoneNumber, phoneNumber, appHash }));
        postRequest('/api/User/OTP/Send', data, {}, dispatch, onSuccessHandler, onErrorHandler, '');
    };
    const clearState = () => setState(initState);
    // console.log('state :', state);
    useFocusEffect(React.useCallback(() => {
        return () => {
            // console.log('Registration State Cleared-----');
            Keyboard.dismiss();
        }
    }, []));
    useEffect(() => {
        cellNo.length === 10 && Keyboard.dismiss();
    }, [cellNo])
    return (
        <ImageBackground source={doodleImg} style={{ flex: 1 }}>
            <View style={styles.container, { flex: 1, justifyContent: 'flex-end' }}>
                <LinearGradient style={{ flex: 1, opacity: 0.6 }} colors={[...colors.gradientColors]} onTouchEnd={sharedKeyboardDismissHandler} />
                <KeyboardAvoidingView behavior={behavior}>
                    <View style={{ backgroundColor: '#cf90ee' }}>
                        <View style={styles.wrapper(activeTheme, 300)}>
                            <Image style={styles.IcoImg} source={require('../../assets/GetStarterJovi/getStartedIco.png')} />
                            <Text style={styles.otpCaption(activeTheme)}>Enter your mobile number</Text>
                            <View style={styles.newotpWrap}>
                                <TouchableWithoutFeedback onPress={() => togglePicker()}>
                                    <View style={{ ...styles.countryCode }}>
                                        <Text style={{ fontSize: 16 }}>{"+" + countryCode}</Text>
                                        <View>
                                            <Image source={downArrow} style={{ height: 12, width: 12 }} />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={styles.mobNumView(activeTheme, !cellNo.length ? activeTheme.default : cellNo.length > 0 && isValid ? activeTheme.default : 'red', cellNo,)}>
                                    <TextInput
                                        ref={inputRef}
                                        style={styles.mobNoField(activeTheme)}
                                        placeholder='3xxxxxxxxx'
                                        keyboardType="numeric"
                                        underlineColorAndroid="transparent"
                                        // maxLength 12 is because When copy number from contacts some mobiles give space
                                        maxLength={state.maxLength}
                                        value={cellNo}
                                        onChangeText={onChangeNumberHandler}
                                        autoFocus
                                        autoCapitalize="none"
                                        autoCompleteType="tel"
                                    />
                                    {
                                        cellNo.length > 0 && !isValid ?
                                            <SvgXml xml={errorIcon} style={{ height: 15, width: 15, marginHorizontal: 7 }} />
                                            :
                                            cellNoCheck && isValid &&
                                            <SvgXml xml={correctsign} height={18} width={18} style={{ marginHorizontal: 7 }} />
                                    }
                                </View>
                            </View>
                            {
                                cellNo.length > 0 && !isValid &&
                                <View style={{ alignSelf: 'center' }}>
                                    <Text style={{ color: activeTheme.validationRed, }}>invalid mobile number</Text>
                                </View>
                            }
                            <Text style={{
                                ...commonStyles.fontStyles(14, activeTheme.grey, 4),
                                textAlign: 'justify',
                                // paddingHorizontal: 20,
                                marginVertical: 20
                            }}>A One Time Password (OTP) will be sent to your mobile number.</Text>
                            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', }}>
                                <SubmitBtn
                                    title="Send Code"
                                    activeTheme={activeTheme}
                                    style={styles.appButtonContainer(!cellNoCheck || !isValid ? activeTheme.lightGrey : activeTheme.default, undefined)}
                                    onPress={sendOtpRequestHandler}
                                    disabled={!cellNoCheck ? true : false}
                                />
                            </View>
                        </View>
                        {
                            showPicker &&
                            <CountryPicker
                                visible
                                withEmoji
                                withFilter
                                onSelect={data => setSelectedValue(data.callingCode[0])}
                                onClose={() => setState(prevState => ({ ...prevState, showPicker: false }))}
                                withAlphaFilter
                                withCallingCode
                            />
                            // <CustomPicker
                            //     data={tempData}
                            //     activeTheme={activeTheme}
                            //     setSelectedValue={setSelectedValue}
                            //     togglePicker={togglePicker}
                            //     showPicker={showPicker}
                            // />
                        }
                    </View>
                </KeyboardAvoidingView>
            </View>
        </ImageBackground >
    )
};
export default OTP;
