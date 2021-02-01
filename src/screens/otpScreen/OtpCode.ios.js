import React, { useState, useEffect } from "react";
import { Animated, Image, View, Text, ImageBackground, KeyboardAvoidingView, Alert, Keyboard, Dimensions } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import styles from './OtpStyles';
import { sharedKeyboardDismissHandler, sharedAnimationHandler, navigateWithResetScreen } from "../../utils/sharedActions";
import colors from "../../styles/colors";
import doodleImg from '../../assets/doodle.png';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { postRequest } from "../../services/api";
import { userAction } from "../../redux/actions/user";
import CustomToastIos from "../../components/toast/CustomToast.ios";
import SubmitBtn from "../../components/buttons/SubmitBtn";
import { Button } from 'native-base';
import { TouchableOpacity } from "react-native-gesture-handler";


// import { TextInput } from "react-native-gesture-handler";
// import { SafeAreaView, ScrollView } from "react-native-safe-area-context";
// import SmsRetriever from 'react-native-sms-retriever';
const OtpCode = props => {
    // console.log("Here------ :", props.keypaidOpen);
    const { dispatch, navigation, activeTheme, user, behavior, keypaidOpen } = props;
    let timeInterval = 60,
        screenIndex = navigation.dangerouslyGetState().index,
        screenParams = navigation.dangerouslyGetState().routes[screenIndex].params;
    const [state, setState] = useState({
        "phoneNumber": user.phoneNumber,
        "otpVerified": false,
        "mins": '00',
        "sec": '00',
        "intervalStoped": false,
        "intervalId": null,
        "typedCode": "",
        "animation": new Animated.Value(1),
        "gradientView": new Animated.Value(1.5)
    });
    const { phoneNumber, otpVerified, mins, sec, intervalStoped, intervalId, typedCode, animation, gradientView } = state;
    const verifyOtpToServer = () => {
        clearInterval(intervalId);
        setState(prevState => ({ ...prevState, intervalStoped: true }));
        let data = {
            "code": typedCode,
            "phoneNumber": phoneNumber
        };
        postRequest('/api/User/OTP/Verify', data, {}, dispatch, onSuccessHandler, onErrorHandler, '');
    };
    const onSuccessHandler = (resposne) => {
        // console.log('Success Otp verified----- ::', resposne);
        if (resposne.data) {
            const { statusCode, otpResult } = resposne.data;
            if (statusCode === 200) {
                dispatch(userAction({ ...props.user, mobile: phoneNumber, ...otpResult, phoneNumber, getProfileCall: screenParams?.backScreenObj?.container ? true : false, changeMobileNumber: false }))
                // if (screenParams?.backScreenObj?.container === null) return navigation.navigate(screenParams?.backScreenObj?.screen, { 'paramsData': { otpResult, phoneNumber } });
                if (screenParams?.backScreenObj?.container === null) {
                    return navigateWithResetScreen(0, [{ name: screenParams?.backScreenObj?.screen, 'paramsData': { otpResult, phoneNumber, configs: resposne.config.data } }]);
                }
                // else return navigation.navigate(screenParams?.backScreenObj?.container, { screen: screenParams?.backScreenObj?.screen });
                else return navigateWithResetScreen(0, [{
                    name: screenParams?.backScreenObj?.container,
                    state: {
                        routes: [
                            {

                                name: screenParams?.backScreenObj?.screen,
                            }
                        ]
                    }
                }]);
            }
            // navigation.navigate('Login', { 'paramsData': { otpResult, phoneNumber } });
            setState(prevState => ({ ...prevState, otpVerified: true, intervalStoped: true }));
            clearInterval(intervalId);
        }
    };
    const onErrorHandler = (error) => {
        // console.log('onErrorHandler--- :', error);
        const { statusCode } = error;
        if (statusCode === 417) CustomToastIos.error(error.errors.Code[0]);
        clearInterval(intervalId);
        setState(prevState => ({ ...prevState, otpVerified: false, intervalStoped: true, }));
    };
    const onResendSuccess = (response) => {
        // console.log('Resend Success Otp ----- ::', response);
        // Alert.alert(response.data.message);
        countDownInterval(timeInterval);
    };
    const onResendError = (error) => {
        // console.log('Resend OTP Error----- ::', error);
        clearInterval(intervalId);
        setState(prevState => ({ ...prevState, intervalStoped: true }));
    };
    const resendOtp = () => {
        clearInterval(intervalId);
        setState(prevState => ({ ...prevState, intervalStoped: true, otpVerified: false }));
        postRequest('/api/User/OTP/Send', { "phoneNumber": phoneNumber }, {}, dispatch, onResendSuccess, onResendError, '');
    };
    const onCodeFilledHandler = () => {
        clearInterval(intervalId);
        setState(prevState => ({ ...prevState, intervalStoped: true }));
        verifyOtpToServer();
    };
    const countDownInterval = (duration) => {
        var timer = duration, minutes, seconds;
        let intervalID = setInterval(function () {
            // console.log('Interval Ran----');
            minutes = parseInt(timer / 60, 10)
            seconds = parseInt(timer % 60, 10);
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            setState(prevState => ({ ...prevState, intervalStoped: false, mins: minutes, sec: seconds }));
            // console.log('timer :', timer)
            if (--timer < 0) {
                clearInterval(intervalID);
                // console.log('Interval Stoped----');
                setState(prevState => ({ ...prevState, intervalStoped: true }));
                return;
                // timer = duration;
            }
        }, 1000);
        setState(prevState => ({ ...prevState, intervalId: intervalID }));
    };
    // const onFocusHanlder = () => {
    //     console.log('onFocusHanlder ---');
    //     if (keypaidOpen) sharedAnimationHandler(animation, 2, 500);
    //     else sharedAnimationHandler(animation, 1, 500);
    // };
    // useEffect(() => {
    //     onFocusHanlder();
    // }, [keypaidOpen])
    useEffect(() => {
        countDownInterval(timeInterval)
    }, []);
    const changeNumberHandler = () => {
        clearInterval(intervalId);
        navigateWithResetScreen(0, [{ name: "OTP", backScreenObj: screenParams?.backScreenObj }])
        // if (screenParams?.backScreenObj?.container === null) return navigation.navigate("OTP");
        // else {
        //     dispatch(userAction({ ...props.user, changeMobileNumber: true }));
        //     navigation.navigate(screenParams?.backScreenObj?.container, { screen: screenParams?.backScreenObj?.screen })

        // }
    }
    // console.log(state);
    return (
        <ImageBackground source={doodleImg} style={{ flex: 1 }}>
            <View style={styles.container, { flex: 1, justifyContent: 'flex-end' }}>
                <LinearGradient style={{ flex: 1, opacity: 0.6 }} colors={[...colors.gradientColors]} onTouchEnd={sharedKeyboardDismissHandler} />
                <KeyboardAvoidingView behavior={behavior}>
                    <View style={{ backgroundColor: '#cf90ee' }}>
                        <View style={[styles.wrapper(activeTheme, 200)]}>
                            <Image style={styles.IcoImg} source={require('../../assets/GetStarterJovi/getStartedIco.png')} />
                            <View style={{ width: '100%', left: 5 }}>
                                <View style={{ paddingVertical: 40, top: 20 }}>
                                    <Text style={styles.iosInstructions(activeTheme, 14)}> {`Enter the 4 digit code`}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                                    <OTPInputView
                                        style={{ maxWidth: Dimensions.get('window').width - 55, justifyContent: 'space-between', maxHeight: 20, top: 10 }}
                                        pinCount={4}
                                        codeInputFieldStyle={styles.otpCode}
                                        codeInputHighlightStyle={styles.underlineStyleHighLighted(activeTheme)}
                                        onCodeFilled={code => setState({ ...state, typedCode: code })}
                                        onCodeChanged={code => setState({ ...state, typedCode: code })}
                                        clearInputs={otpVerified}
                                        autoFocusOnLoad
                                    // placeholderCharacter="*"

                                    />
                                    {
                                        otpVerified &&
                                        <View style={{ top: 10, justifyContent: 'center', }}>
                                            <Image source={require('../../assets/correctsign.png')} style={styles.iosCorrentSign} />
                                        </View>
                                    }
                                </View>
                                <View style={{ top: 40 }}>
                                    <Text style={styles.iosMobileInstructions(activeTheme)}> {`Enter the OTP code sent to your number +${phoneNumber}`}</Text>
                                </View>

                                <View style={{ marginVertical: 50, top: 30, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', width: '100%', }}>
                                    <TouchableOpacity onPress={changeNumberHandler}>
                                        <Text style={{ color: '#7359BE' }}>Change Number</Text>
                                    </TouchableOpacity>
                                    {
                                        !intervalStoped &&
                                        <View>
                                            <Text style={{ color: intervalStoped ? activeTheme.grey : '#7359BE', fontSize: 16 }}>{mins + ":" + sec}</Text>
                                        </View>
                                    }
                                    <TouchableOpacity onPress={resendOtp} disabled={intervalStoped ? false : true} transparent>
                                        <Text style={{ color: !intervalStoped ? activeTheme.grey : '#7359BE', alignSelf: 'flex-end' }}>Resend OTP</Text>
                                    </TouchableOpacity>
                                </View>



                            </View>
                            <View>
                                <SubmitBtn
                                    title="Done"
                                    activeTheme={activeTheme}
                                    style={styles.appButtonContainer(typedCode.length === 4 ? activeTheme.default : activeTheme.lightGrey, typedCode.length === 4 ? 1 : undefined)}
                                    onPress={onCodeFilledHandler}
                                    disabled={typedCode.length === 4 ? false : true}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </ImageBackground>
    )
};
export default OtpCode;
