import React, { useRef, useState, useEffect } from "react";
import { Image, View, Animated, TouchableOpacity, TouchableWithoutFeedback, Text, TextInput, ImageBackground, Platform, KeyboardAvoidingView, Keyboard, Alert, BackHandler } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import styles from './OtpStyles';
import colors from "../../styles/colors";
import doodleImg from '../../assets/doodle.png';
// import doodleImg from '../../assets/doodle_updated.png';
import RNOtpVerify from 'react-native-otp-verify';
import { userAction } from "../../redux/actions/user";
import { postRequest, getRequest } from "../../services/api";
import { sharedKeyboardDismissHandler, navigateWithResetScreen, sharedServerErrorToast, error400 } from "../../utils/sharedActions";
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
import NetInfo from "@react-native-community/netinfo";
const isJoviCustomerApp = 1;
const OTP = (props) => {
    console.log("OTP.PROPS :", props);
    const { dispatch, activeTheme, navigation, behavior } = props;
    const BACK_SCREEN_OBJ = navigation.dangerouslyGetState()?.routes[navigation.dangerouslyGetState()?.index]?.backScreenObj ?? {}
    console.log('BACK_SCREEN_OBJ :', BACK_SCREEN_OBJ)
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
        error400(error)
        // sharedServerErrorToast(error)
    };
    const _sendOtpRequestHandler = async () => {
        let appHash = null;
        let data = null;
        let phoneNumber = countryCode + cellNo;
        if (Platform.OS === 'android') {
            appHash = await RNOtpVerify.getHash();
            data = {
                'phoneNumber': phoneNumber,
                'appHash': appHash[0],
                'otpType': 1,
                'userType': 4,
                "isNewVersion": true
            };
            // console.log('appHash :', appHash)
        } else {
            data = {
                'phoneNumber': phoneNumber,
                'otpType': 1,
                'userType': 4,
                "isNewVersion": true
            };
        }
        // debugger;
        // dispatch(userAction({ ...props.user,  phoneNumber, appHash }));
        console.log('Data:', data)
        dispatch(userAction({ ...props.user, mobile: phoneNumber, phoneNumber, appHash }));
        postRequest('/api/User/OTP/Send', data, {}, dispatch, onSuccessHandler, onErrorHandler, '');
    };
    const sendOtpRequesToServer = async () => {
        let internetConnectivity = await NetInfo.fetch();
        if (!internetConnectivity.isConnected) {
            return CustomToast.error('No internet connection');
        } else {
            if (Object.keys(BACK_SCREEN_OBJ).length && BACK_SCREEN_OBJ?.screen === "profile_container") {
                getRequest(`/api/User/PhoneNumberCheck/${countryCode + cellNo}`,
                    {},
                    dispatch,
                    res => {
                        if (res.data.statusCode === 200) {
                            CustomToast.error("Phone number already exist", null, "long")
                        } else if (res.data.statusCode === 404) {
                            _sendOtpRequestHandler()
                        };
                    },
                    err => {
                        // debugger;
                        if (err) {
                            CustomToast.error("Error Occurred during checking existing number");
                        }
                    },
                    "",
                    true,
                    true
                );
            } else {
                _sendOtpRequestHandler()
            }
        }
    };
    const _gotoLegalsScreen = () => {
        navigation.navigate("Legal_Login")
    }
    const goToCallUsPage = () => {
        navigation.navigate("Call_Us", { key: 'Call_Us', item: {loginPage:true} })
    }
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
    }, [cellNo]);
    const handleBackButtonPressed = bool => {
        // if (Object.keys(BACK_SCREEN_OBJ).length && BACK_SCREEN_OBJ.screen === "Reset_Password") {
        //     navigateWithResetScreen(null, [{ name: "Login" }]);
        // } else {
        //     navigateWithResetScreen(null, [{ name: navigation.dangerouslyGetState()?.routes[navigation.dangerouslyGetState().index].backScreenObj.container, params: { screen: navigation.dangerouslyGetState()?.routes[navigation.dangerouslyGetState().index].backScreenObj.screen } }]);
        // }
        return true;
    };
    useEffect(() => {
        if (navigation.dangerouslyGetState()?.routes[navigation.dangerouslyGetState().index].backScreenObj) {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackButtonPressed);
            return () => {
                backHandler.remove();
            }
        }
    }, []);
    return (
        <ImageBackground source={doodleImg} style={{ flex: 1, backgroundColor: activeTheme.default }}>
            <View style={styles.container, { flex: 1, justifyContent: 'flex-end' }}>
                <LinearGradient style={{ flex: 1, opacity: 0.8 }} colors={[...colors.gradientColors]} onTouchEnd={sharedKeyboardDismissHandler} />
                <KeyboardAvoidingView behavior={behavior}>
                    <View style={{ backgroundColor: '#cf90ee' }}>
                        <View style={styles.wrapper(activeTheme, isJoviCustomerApp ? 420 : 470)}>
                            <Image style={styles.IcoImg} source={require('../../assets/GetStarterJovi/getStartedIco.png')} />
                            {
                                !isJoviCustomerApp ?
                                    <Text style={{ ...commonStyles.fontStyles(16, activeTheme.black, 4, undefined, "none"), marginTop: 50, textAlign: "left", alignSelf: "flex-start" }}>{"Aao! Jovi Ki Rider Fleet Ko Join Karo!"} </Text>
                                    : null
                            }
                            <Text style={[styles.otpCaption(activeTheme), isJoviCustomerApp ? {} : { paddingVertical: 10 }]}>{"Enter your mobile number"} </Text>
                            <View style={[styles.newotpWrap, isJoviCustomerApp ? {} : { top: 20 }]}>
                                <TouchableWithoutFeedback onPress={() => togglePicker()}>
                                    <View style={{ ...styles.countryCode }}>
                                        <Text style={{ fontSize: 16 }}>{"+" + countryCode}</Text>
                                        <View>
                                            <Image source={downArrow} style={{ height: 12, width: 12 }} />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={[styles.mobNumView(activeTheme, !cellNo.length ? activeTheme.default : cellNo.length > 0 && isValid ? activeTheme.default : 'red', cellNo,)]}>
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
                                ...commonStyles.fontStyles(14, activeTheme.grey, 1, undefined, "none"),
                                textAlign: 'justify',
                                // paddingHorizontal: 20,
                                marginVertical: 20
                            }}>A One Time Password (OTP) will be sent to your mobile number.</Text>
                            <TouchableOpacity onPress={goToCallUsPage} style={{ paddingLeft: 5, paddingVertical: 3,marginBottom:10,alignSelf:'flex-start' }}><Text style={{ ...commonStyles.fontStyles(undefined, activeTheme.default, 1, 'bold') }}>{"Want to become a vendor?"}</Text></TouchableOpacity>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', }}>
                                <SubmitBtn
                                    title="Send OTP"
                                    activeTheme={activeTheme}
                                    style={styles.appButtonContainer(!cellNoCheck || !isValid ? activeTheme.lightGrey : activeTheme.default, undefined)}
                                    onPress={sendOtpRequesToServer}
                                    disabled={!cellNoCheck || !isValid ? true : false}
                                />
                            </View>
                            <View style={{ padding: 30 }}>
                                <Text>{"By tapping send OTP i am agreeing to"}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <TouchableOpacity onPress={_gotoLegalsScreen}>
                                        <Text style={{ ...commonStyles.fontStyles(undefined, activeTheme.default, 1, 'bold') }}>{"Terms & Conditions"}
                                            <Text style={{ color: "#000", textTransform: "lowercase", fontWeight: "normal" }}>{" and"}</Text>
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={_gotoLegalsScreen} style={{ paddingLeft: 5, paddingVertical: 3 }}><Text style={{ ...commonStyles.fontStyles(undefined, activeTheme.default, 1, 'bold') }}>{"Privacy & Policy"}</Text></TouchableOpacity>
                                </View>
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