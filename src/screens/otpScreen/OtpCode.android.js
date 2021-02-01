import React, { useEffect, useState, useRef, createRef } from "react";
import { Image, View, Text, TextInput, ImageBackground, Keyboard, Alert } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import styles from './OtpStyles';
import { navigationHandler, sharedKeyboardDismissHandler, navigateWithResetScreen } from "../../utils/sharedActions";
import colors from "../../styles/colors";
import doodleImg from '../../assets/doodle.png';
import RNOtpVerify from 'react-native-otp-verify';
import { userAction } from "../../redux/actions/user";
import { postRequest } from "../../services/api";
import CustomToast from "../../components/toast/CustomToast.android";
import commonStyles from '../../styles/styles';
import SubmitBtn from "../../components/buttons/SubmitBtn";
import { Button } from 'native-base';
import { TouchableOpacity } from "react-native-gesture-handler";
// import SmsRetriever from 'react-native-sms-retriever';
const OtpCode = props => {
    const { dispatch, navigation, activeTheme, user } = props;
    console.log("OTP CODE ANDROID PROPS ----", props);
    // console.log("OTP CODE ANDROID dangerouslyGetState ----", navigation.dangerouslyGetState())
    let timeInterval = 60,
        screenIndex = navigation.dangerouslyGetState().index,
        screenParams = navigation.dangerouslyGetState().routes[screenIndex].params;
    // let getParams = JSON.parse(stringyFyParams);
    // console.log('screenParams:', screenParams);
    // let timeInterval = 5;
    let initState = {
        'refsArr': ["", "", "", ""],
        "appHash": user.appHash,
        "phoneNumber": user.phoneNumber,
        "otpVerified": false,
        "mins": '00',
        "sec": '00',
        "intervalStoped": false,
        "intervalId": null,
        'typedCode': '',
        "focusedIndex": 0,
        "0": "",
        "1": "",
        "2": "",
        "3": "",
    }
    const [state, setState] = useState(initState);
    const { refsArr, phoneNumber, otpVerified, mins, sec, intervalStoped, intervalId, appHash, typedCode } = state;
    const elRefs = useRef([]);
    const intervalIDRef = useRef(intervalId);
    const startListeningForOtp = () => {
        // dispatch(showHideLoader(true, "please wait getting otp"));
        // console.log('Sms listener started-------');
        RNOtpVerify.getOtp()
            .then(listener => {
                // console.log('listener---- :', listener)
                RNOtpVerify.addListener(otpHandler)
            }
            )
            .catch(error => console.log(error));
    };
    const onSuccessHandler = (resposne) => {
        // console.log('Verify code Success---- :', resposne);
        const { statusCode, otpResult } = resposne.data;
        if (statusCode === 200) {
            // console.log('intervalIDRef:', intervalIDRef.current);
            // console.log('Interval Cleared---');
            RNOtpVerify.removeListener();
            clearInterval(intervalIDRef.current);
            setState(prevState => ({ ...prevState, otpVerified: true, intervalStoped: true }));
            if (otpResult) {
                dispatch(userAction({ ...props.user, mobile: phoneNumber, phoneNumber, ...otpResult, configs: resposne.config.data, getProfileCall: screenParams?.backScreenObj?.container ? true : false, changeMobileNumber: false }));
                if (screenParams?.backScreenObj?.container === null) {
                    // return navigation.navigate(screenParams?.backScreenObj?.screen, { 'paramsData': { otpResult, phoneNumber, configs: resposne.config.data } });
                    return navigateWithResetScreen(0, [{ name: screenParams?.backScreenObj?.screen, 'paramsData': { otpResult, phoneNumber, configs: resposne.config.data } }]);
                }
                else {
                    CustomToast.success("Profile updated successfully");
                    navigateWithResetScreen(0, [{
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
            }
        }
    };
    const onErrorHandler = (error) => {
        // console.log('onErrorHandler Error---- :', error);
        if (error) {
            clearInterval(intervalIDRef.current);
            setState(prevState => ({ ...prevState, otpVerified: false, intervalStoped: true, }));
            if (error.statusCode === 417) CustomToast.error(error.errors.Code[0]);
        }
    };
    const verifyOtpToServer = (otpCode) => {
        clearInterval(intervalIDRef.current);
        setState(prevState => ({ ...prevState, intervalStoped: true }));
        postRequest('/api/User/OTP/Verify', {
            "code": otpCode,
            "phoneNumber": phoneNumber
        }, {}, dispatch, onSuccessHandler, onErrorHandler, '')
    };
    const otpHandler = (message) => {
        // console.log('message :', message);
        if (message !== "Timeout Error.") {
            let stringify = message.toString().match(/\b\d{4}\b/);
            let parsedValue = parseInt(stringify[0]);
            let commaSplittedArray = stringify[0].split('');
            verifyOtpToServer(parsedValue);
            setState(prevState => ({ ...prevState, refsArr: commaSplittedArray, '0': stringify[0][0], '1': stringify[0][1], '2': stringify[0][2], '3': stringify[0][3] }));
        } else {
            startListeningForOtp();
        }
    };
    const onResendSuccess = (response) => {
        // console.log('Resend Success Otp----- ::', response);
        // Alert.alert(response.data.message);
        countDownInterval(timeInterval);
    };
    const onResendError = (error) => {
        if (intervalIDRef) {
            clearInterval(intervalIDRef.current);
            setState(prevState => ({ ...prevState, intervalStoped: true }));
        }
        console.log('Resend Error Otp----- ::', error);
    };
    const resendOtp = () => {
        clearInterval(intervalIDRef.current);
        setState(prevState => ({ ...prevState, intervalStoped: true, otpVerified: false, '0': '', '1': '', '2': '', '3': '', focusedIndex: initState.focusedIndex, refsArr: initState.refsArr }));
        postRequest('/api/User/OTP/Send', { "phoneNumber": phoneNumber, "appHash": appHash[0] }, {}, dispatch, onResendSuccess, onResendError, '');
        // startListeningForOtp();
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
            if (--timer < 0) {
                // console.log('Interval Stoped----');
                // RNOtpVerify.removeListener();
                clearInterval(intervalID);
                setState(prevState => ({ ...prevState, intervalStoped: true }));
                return;
            }
        }, 1000);
        intervalIDRef.current = intervalID;
        setState(prevState => ({ ...prevState, intervalId: intervalID }));
    };
    const _focusNextField = (e, nextField, currentIndex) => {
        // console.log('_focusNextField.event :', e.nativeEvent);
        let prevField = nextField >= 2 ? nextField - 2 : 0;
        if (isNaN(e.nativeEvent.key) && (e.nativeEvent.key !== 'Backspace')) return;
        else if (e.nativeEvent.key === 'Backspace' && refsArr[currentIndex] !== "") return;
        else if (e.nativeEvent.key === 'Backspace') return elRefs.current[prevField].current.focus();
        else if (nextField < refsArr.length) return elRefs.current[nextField].current.focus();

    };
    const onChangeHanlder = (val, index) => {
        if (isNaN(val)) return;
        let newVal = "";
        if (!val) {
            refsArr[index] = "";
            newVal = typedCode.slice(0, typedCode.length - 1);
        } else {
            newVal = typedCode.concat(val);
            refsArr[index] = newVal[index];
        }
        setState(prevState => ({ ...prevState, typedCode: newVal, refsArr, [index]: val }))
        // debugger;
    };
    const changeNumberHandler = () => {
        clearInterval(intervalId);
        navigateWithResetScreen(0, [{ name: "OTP", backScreenObj: screenParams?.backScreenObj }])
        // if (screenParams?.backScreenObj?.container === null) return navigation.navigate("OTP");
        // else {
        //     dispatch(userAction({ ...props.user, changeMobileNumber: true }));
        //     navigation.navigate(screenParams?.backScreenObj?.container, { screen: screenParams?.backScreenObj?.screen })

        // }
    }
    const _customEffect = () => {
        if (elRefs.current.length !== refsArr.length) {
            elRefs.current = Array(refsArr.length).fill().map((_, i) => elRefs.current[i] || createRef());
        };
        startListeningForOtp();
        countDownInterval(timeInterval);
        return () => {
            // console.log('RNOtpVerify.removeListener------')
            clearInterval(intervalIDRef.current);
            RNOtpVerify.removeListener();
            setState(initState);
        }
    };
    useEffect(() => {
        typedCode.length === 4 && Keyboard.dismiss();
    }, [typedCode]);
    useEffect(_customEffect, []);
    // console.log(state);
    return (
        <ImageBackground source={doodleImg} style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <LinearGradient style={{ flex: 1, opacity: 0.6 }} colors={[...colors.gradientColors]} onTouchEnd={sharedKeyboardDismissHandler} />
                <View style={{ backgroundColor: '#cf90ee' }}>
                    <View style={styles.wrapper(activeTheme, 300)}>
                        <Image style={styles.IcoImg} source={require('../../assets/GetStarterJovi/getStartedIco.png')} />
                        <View style={{
                            flexDirection: "column",
                            width: "100%",
                            paddingVertical: 30,
                            ...commonStyles.fontStyles(14, activeTheme.black, 4)
                        }}>
                            <View style={{ top: 20 }}>
                                <Text style={styles.androidInstructions(activeTheme)}>{`Enter the 4 digit code`}</Text>
                            </View>
                            <View style={styles.androidOtpWrap}>
                                {
                                    (refsArr || []).map((val, i) => {
                                        if (i < 4) return <View key={i}>
                                            <TextInput
                                                autoCorrect={false}
                                                autoCapitalize="none"
                                                ref={elRefs.current[i]}
                                                // value={val}
                                                value={state[i]}
                                                style={[styles.otpCode, { width: 65, borderColor: i === state.focusedIndex ? activeTheme.default : "#ccc" }]}
                                                keyboardType="default"
                                                maxLength={1}
                                                onKeyPress={e => _focusNextField(e, i + 1, i)}
                                                onChangeText={val => onChangeHanlder(val, i)}
                                                autoFocus={i === 0 ? true : false}
                                                onFocus={() => setState(pre => ({ ...pre, focusedIndex: i }))}
                                                returnKeyType="next"
                                            />
                                        </View>
                                    })
                                }
                                {
                                    refsArr.includes("") ? null :
                                        <View style={{ top: 15, right: 10 }}>
                                            <Image source={require('../../assets/correctsign.png')} style={styles.correntSign} />
                                        </View>
                                }
                            </View>
                            <View style={{ top: 30, right: 3 }}>
                                <Text style={styles.iosMobileInstructions(activeTheme)}> {`Enter the OTP code sent to your number +${phoneNumber}`}</Text>
                            </View>
                            <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', width: '100%', paddingVertical: 5, top: 55 }}>
                                <TouchableOpacity onPress={changeNumberHandler} style={{ paddingVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#7359BE' }}>Change Number</Text>
                                </TouchableOpacity>
                                <View>
                                    {
                                        !intervalStoped &&
                                        <Text style={{ color: intervalStoped ? activeTheme.grey : '#7359BE', fontSize: 16 }}>{mins + ":" + sec}</Text>
                                    }
                                </View>
                                <TouchableOpacity onPress={resendOtp} disabled={intervalStoped ? false : true} style={{ paddingVertical: 10, justifyContent: 'center', alignItems: 'center' }} >
                                    <Text style={{ color: !intervalStoped ? activeTheme.grey : '#7359BE' }}>Resend OTP</Text>
                                </TouchableOpacity>
                            </View>




                        </View>
                        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', }}>
                            <SubmitBtn
                                title="Done"
                                activeTheme={activeTheme}
                                style={styles.appButtonContainer(refsArr.includes("") ? activeTheme.lightGrey : activeTheme.default, otpVerified ? 1 : undefined)}
                                // onPress={() => verifyOtpToServer(parseInt(typedCode))}
                                onPress={() => verifyOtpToServer(parseInt(state["0"] + state["1"] + state["2"] + state["3"]))}
                                disabled={refsArr.includes("") ? true : false}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </ImageBackground>
    )
};

export default OtpCode;
