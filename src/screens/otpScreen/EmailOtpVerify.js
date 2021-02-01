import React, { useState, createRef, useRef, useEffect } from "react";
import { ImageBackground, Image, View, TouchableOpacity, Text, TextInput, Alert, KeyboardAvoidingView } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import styles from './OtpStyles';
import { navigationHandler, sharedCountDownInterval, sharedKeyboardDismissHandler, navigateWithResetScreen } from "../../utils/sharedActions";
import colors from "../../styles/colors";
import { postRequest } from "../../services/api";
import CustomToast from '../../components/toast/CustomToast';
import doodleImg from '../../assets/doodle.png';
import { userAction } from "../../redux/actions/user";

export default EmailOtpVerify = props => {
    const { navigation, activeTheme, user, dispatch, behavior } = props;
    // console.log('EmailOtpVerify Props :', props);
    let getParams = {}
    // console.log('EmailOtpVerify get params--- :', getParams);
    let initState = {
        "appHash": getParams.appHash ? getParams.appHash : user.appHash,
        "phoneNumber": getParams.phoneNumber ? getParams.phoneNumber : user.phoneNumber,
        "email": getParams.email ? getParams.email : user.email,
        "otpVerified": false,
        "mins": '00',
        "sec": '00',
        "intervalStoped": false,
        "intervalId": null,
        'typedCode': '',
        'refsArr': ['', '', '', ''],
        "0": "",
        "1": "",
        "2": "",
        "3": "",
    }
    const [state, setState] = useState(initState);
    const { phoneNumber, otpVerified, mins, sec, intervalStoped, intervalId, typedCode, appHash, refsArr, email } = state;
    const arrLength = refsArr.length;
    const elRefs = useRef([]);
    let timeInterval = 60;
    // console.log(codeBool);
    if (elRefs.current.length !== arrLength) {
        elRefs.current = Array(arrLength).fill().map((_, i) => elRefs.current[i] || createRef());
    };
    const _focusNextField = (e, nextField, currentIndex) => {
        let prevField = nextField >= 2 ? nextField - 2 : 0;
        if (state[currentIndex]) return;
        if (e.nativeEvent.key === 'Backspace') return elRefs.current[prevField].current.focus();
        if (nextField < arrLength) return elRefs.current[nextField].current.focus();
    };
    const onChangeHanlder = (val, index) => {
        let newVal = "";
        if (!val) {
            refsArr[index] = "";
            newVal = typedCode.slice(0, typedCode.length - 1);
            // console.log('newVal :', newVal)
        } else {
            newVal = typedCode.concat(val);
            refsArr[index] = newVal[index];
        }
        setState(prevState => ({ ...prevState, typedCode: newVal, refsArr, [index]: val }))
    };
    const onSuccessHandler = (resposne) => {
        console.log('onSuccessHandler :', resposne);
        const { statusCode, otpResult } = resposne.data;
        if (statusCode === 200) {
            CustomToast.success('Otp verified');
            clearInterval(intervalId);
            setState(prevState => ({ ...prevState, otpVerified: true, intervalStoped: true }));
            dispatch(userAction({ ...user, ...otpResult, }))
            navigateWithResetScreen(0, [{ name: 'Reset_Password' }]);
            // navigation.navigate('Reset_Password');
            // clearInterval(intervalId);
            // if (otpResult) {
            //     dispatch(userAction({ ...otpResult, phoneNumber }))
            //     navigation.navigate('Login', { 'paramsData': { otpResult, phoneNumber } });
            // } else {
            //     Alert.alert('Result not found from server')
            // }
        }
    };
    const onErrorHandler = (error) => {
        console.log('onErrorHandler Error---- :', error);
        if (error) {
            clearInterval(intervalId);
            setState(prevState => ({ ...prevState, otpVerified: false, intervalStoped: true, refsArr: initState.refsArr }));
            if (error.statusCode === 417) CustomToast.error(error.errors.Code[0]);
        }
    };
    const verifyOtpToServer = () => {
        clearInterval(intervalId);
        setState(prevState => ({ ...prevState, intervalStoped: true, otpVerified: false }));
        let data = {
            // "code": typedCode,
            "code": parseInt(state['0'] + state['1'] + state['2'] + state['3']),
            "email": user.email
            // "phoneNumber": phoneNumber
        };
        // debugger;
        postRequest('/api/User/OTP/Verify', data, {}, dispatch, onSuccessHandler, onErrorHandler, 'Please wait otp verifying....');
    };

    const onResendSuccess = (response) => {
        console.log('Resend Success Otp----- ::', response);
        if (response.data.statusCode === 200) {
            // Alert.alert(response.data.message);
            sharedCountDownInterval(timeInterval, setState);
        }
    };
    const onResendError = (error) => {
        if (intervalId) {
            clearInterval(intervalId);
            setState({ ...state, intervalStoped: true, otpVerified: false });
        }
        console.log('Resend Error----- ::', error);
    };
    const resendOtp = () => {
        clearInterval(intervalId);
        setState({ ...state, intervalStoped: true, otpVerified: false });
        // debugger;
        postRequest('/api/User/OTP/Send', { "email": email }, {}, dispatch, onResendSuccess, onResendError, 'Please wait...')
    };
    const _customEffect = () => {
        sharedCountDownInterval(timeInterval, setState);
        return () => {
            clearInterval(intervalId);
            setState(initState);
        }
    };
    useEffect(_customEffect, [])
    // console.log('EmailOtpVerify State :', state);
    return (
        <ImageBackground source={doodleImg} style={{ flex: 1 }}>
            <View style={styles.container, { flex: 1, justifyContent: 'flex-end' }}>
                <LinearGradient style={{ flex: 1, opacity: 0.6 }} colors={[...colors.gradientColors]} onTouchEnd={sharedKeyboardDismissHandler} />
                <KeyboardAvoidingView behavior={behavior}>
                    <View style={[styles.wrapper(activeTheme, 300)]}>
                        <Image style={styles.IcoImg} source={require('../../assets/GetStarterJovi/getStartedIco.png')} />
                        <View style={styles.row}>
                            <Text style={[styles.otpEmailVerifyinstructions(activeTheme, 5)]}>{`Enter the 4 digit code`}</Text>
                            <View style={{
                                flex: 0.5,
                                flexDirection: 'row',
                                // alignSelf: 'center',
                                // paddingVertical: 5,
                            }}>
                                {
                                    (refsArr || []).map((refs, i) => {
                                        return <TextInput
                                            key={i}
                                            ref={elRefs.current[i]}
                                            style={styles.otpCode}
                                            // placeholder='*'
                                            keyboardType='numeric'
                                            maxLength={1}
                                            underlineColorAndroid="transparent"
                                            autoCapitalize="none"
                                            autoCompleteType="tel"
                                            onKeyPress={e => _focusNextField(e, i + 1, i)}
                                            onChangeText={val => onChangeHanlder(val, i)} />
                                    })
                                }
                                {
                                    otpVerified &&
                                    <Image style={styles.IcoImg} source={require('../../assets/correctsign.png')} style={styles.correntSign} />
                                }
                            </View>
                        </View>
                        <View style={{ top: 40, width: '100%', right: 5 }}>
                            <Text style={[styles.iosMobileInstructions(activeTheme), { fontSize: 12 }]}> {`Enter OTP code sent to your email ${user.email}`}</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', width: '100%', paddingVertical: 25, top: 25 }}>
                            <TouchableOpacity onPress={() => {
                                navigateWithResetScreen(0, [{ name: 'Login', paramsData: { 'currentScreen': 'forgot_password' } }]);
                                // navigation.navigate('Login', {'paramsData': {'currentScreen': 'forgot_password' } });
                                clearInterval(intervalId)
                            }
                            }>
                                <Text style={{ color: '#7359BE', alignSelf: 'flex-end' }}>Change Email</Text>
                            </TouchableOpacity>
                            <View>
                                {
                                    !intervalStoped &&
                                    <Text style={{ color: intervalStoped ? activeTheme.grey : '#7359BE', fontSize: 16 }}>{mins + ":" + sec}</Text>
                                }
                            </View>
                            <TouchableOpacity onPress={resendOtp} disabled={intervalStoped ? false : true}>
                                <Text style={{ color: !intervalStoped ? activeTheme.grey : '#7359BE', alignSelf: 'flex-end' }}>Resend OTP</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.appButtonContainer(typedCode.length > 3 ? activeTheme.default : activeTheme.lightGrey, undefined)}
                            disabled={typedCode.length > 3 ? false : true}
                            onPress={verifyOtpToServer}>
                            <Text style={styles.appButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    {/* <View style={styles.btmBg} /> */}
                </KeyboardAvoidingView>
            </View>
        </ImageBackground >
    )
};