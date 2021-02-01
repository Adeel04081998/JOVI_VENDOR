
// import React, { useState, useEffect } from "react";
// import { Animated, Image, View, TouchableOpacity, Text, ImageBackground, KeyboardAvoidingView, Alert } from "react-native";
// import LinearGradient from 'react-native-linear-gradient';
// import styles from './OtpStyles';
// import { sharedKeyboardDismissHandler, sharedAnimationHandler } from "../../utils/sharedActions";
// import colors from "../../styles/colors";
// import doodleImg from '../../assets/doodle.png';
// import OTPInputView from '@twotalltotems/react-native-otp-input';
// import { postRequest } from "../../services/api";
// import { userAction } from "../../redux/actions/user";
// import CustomToastIos from "../../components/toast/CustomToast.ios";
// import SubmitBtn from "../../components/buttons/SubmitBtn";

// // import { TextInput } from "react-native-gesture-handler";
// // import { SafeAreaView, ScrollView } from "react-native-safe-area-context";
// // import SmsRetriever from 'react-native-sms-retriever';
// const OtpCode = props => {
//     // console.log("Here------ :", props.keypaidOpen);
//     const { dispatch, navigation, activeTheme, user, behavior, keypaidOpen } = props;
//     let timeInterval = 2 * 60;
//     const [state, setState] = useState({
//         "phoneNumber": user.phoneNumber,
//         "otpVerified": false,
//         "mins": '00',
//         "sec": '00',
//         "intervalStoped": false,
//         "intervalId": null,
//         "typedCode": null,
//         "animation": new Animated.Value(1),
//         "gradientView": new Animated.Value(1.5)
//     });
//     const { phoneNumber, otpVerified, mins, sec, intervalStoped, intervalId, typedCode, animation, gradientView } = state;
//     const verifyOtpToServer = (otpCode) => {
//         clearInterval(intervalId);
//         setState(prevState => ({ ...prevState, intervalStoped: true }));
//         let data = {
//             "code": otpCode,
//             "phoneNumber": phoneNumber
//         };
//         postRequest('/api/User/OTP/Verify', data, {}, dispatch, onSuccessHandler, onErrorHandler, 'Please wait otp verifying....')
//     };
//     const onSuccessHandler = (resposne) => {
//         console.log('Success Otp verified----- ::', resposne);
//         if (resposne.data) {
//             const { statusCode, otpResult } = resposne.data;
//             if (statusCode === 200) {
//                 dispatch(userAction({ ...otpResult, phoneNumber }))
//                 navigation.navigate('Login', { 'paramsData': { otpResult, phoneNumber } });
//             }
//             setState(prevState => ({ ...prevState, otpVerified: true, intervalStoped: true }));
//             clearInterval(intervalId);
//         }
//     };
//     const onErrorHandler = (error) => {
//         console.log('onErrorHandler--- :', error);
//         const { statusCode } = error;
//         if (statusCode === 417) CustomToastIos.error(error.errors.Code[0]);
//         clearInterval(intervalId);
//         setState(prevState => ({ ...prevState, otpVerified: false, intervalStoped: true, }));
//     };
//     const onResendSuccess = (resposne) => {
//         console.log('Resend Success Otp verified----- ::', resposne);
//         if (resposne.data.statusCode === 200) {
//             countDownInterval(timeInterval);
//         }
//     };
//     const onResendError = (error) => {
//         console.log('Resend OTP Error----- ::', error);
//         clearInterval(intervalId);
//         setState(prevState => ({ ...prevState, intervalStoped: true }));
//     };
//     const resendOtp = () => {
//         clearInterval(intervalId);
//         setState(prevState => ({ ...prevState, intervalStoped: true, otpVerified: false }));
//         postRequest('/api/User/OTP/Send', { "phoneNumber": phoneNumber }, {}, dispatch, onResendSuccess, onResendError, '');
//     };
//     const onCodeFilledHandler = code => {
//         clearInterval(intervalId);
//         setState(prevState => ({ ...prevState, intervalStoped: true }));
//         verifyOtpToServer(code)
//     };
//     const countDownInterval = (duration) => {
//         var timer = duration, minutes, seconds;
//         let intervalID = setInterval(function () {
//             // console.log('Interval Ran----');
//             minutes = parseInt(timer / 60, 10)
//             seconds = parseInt(timer % 60, 10);
//             minutes = minutes < 10 ? "0" + minutes : minutes;
//             seconds = seconds < 10 ? "0" + seconds : seconds;
//             setState(prevState => ({ ...prevState, intervalStoped: false, mins: minutes, sec: seconds }));
//             // console.log('timer :', timer)
//             if (--timer < 0) {
//                 clearInterval(intervalID);
//                 console.log('Interval Stoped----');
//                 setState(prevState => ({ ...prevState, intervalStoped: true }));
//                 return;
//                 // timer = duration;
//             }
//         }, 1000);
//         setState(prevState => ({ ...prevState, intervalId: intervalID }));
//     };
//     const onFocusHanlder = () => {
//         console.log('onFocusHanlder ---');
//         if (keypaidOpen) sharedAnimationHandler(animation, 2, 500);
//         else sharedAnimationHandler(animation, 1, 500);
//     };
//     useEffect(() => {
//         onFocusHanlder();
//     }, [keypaidOpen])
//     useEffect(() => {
//         countDownInterval(timeInterval)
//     }, []);
//     // console.log(state)
//     return (
//         <ImageBackground source={doodleImg} style={{ flex: 1 }}>
//             <KeyboardAvoidingView behavior={behavior} style={[styles.tempContainer(activeTheme)]}>
//                 <Animated.View style={{ flex: keypaidOpen ? gradientView : 1.7 }}>
//                     <LinearGradient style={{ flex: 1, opacity: 0.6 }} colors={[...colors.gradientColors]} onTouchEnd={() => {
//                         sharedAnimationHandler(animation, 1, 500);
//                         sharedKeyboardDismissHandler();
//                     }} />
//                 </Animated.View>
//                 <Animated.View style={{ flex: animation, backgroundColor: '#cf90ee' }}>
//                     <View style={[styles.tempWrapper(activeTheme, 250)]}>
//                         <Image style={styles.IcoImg} source={require('../../assets/GetStarterJovi/getStartedIco.png')} />
//                         <Text style={[styles.instructions(activeTheme, 14), { paddingVertical: 50, textAlign: "left" }]}>{`Waiting to automatically detect an SMS sent to ${phoneNumber}`}</Text>
//                         {/* <View style={{ maxWidth: '80%', backgroundColor: 'red' }}> */}
//                         <OTPInputView
//                             style={{ maxWidth: '50%', justifyContent: 'space-between', maxHeight: 20 }}
//                             pinCount={4}
//                             codeInputFieldStyle={styles.otpCode}
//                             codeInputHighlightStyle={styles.underlineStyleHighLighted(activeTheme)}
//                             onCodeFilled={() => { }}
//                             onCodeChanged={(e) => console.log(e)}
//                             autoFocusOnLoad

//                         />
//                         {
//                             otpVerified &&
//                             <Image source={require('../../assets/correctsign.png')} style={styles.correntSign} />
//                         }
//                         {/* </View> */}
//                         <View style={{ flex: 1, marginVertical: 50, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', width: '90%' }}>
//                             <TouchableOpacity onPress={() => {
//                                 navigation.navigate('OTP');
//                                 clearInterval(intervalId);
//                             }}>
//                                 <Text style={{ color: '#7359BE', alignSelf: 'flex-end' }}>Change Number</Text>
//                             </TouchableOpacity>
//                             {
//                                 !intervalStoped &&
//                                 <View>
//                                     <Text style={{ color: intervalStoped ? activeTheme.grey : '#7359BE', fontSize: 16 }}>{mins + ":" + sec}</Text>
//                                 </View>
//                             }
//                             <TouchableOpacity onPress={resendOtp} disabled={intervalStoped ? false : true}>
//                                 <Text style={{ color: !intervalStoped ? activeTheme.grey : '#7359BE', alignSelf: 'flex-end' }}>Resend OTP</Text>
//                             </TouchableOpacity>
//                         </View>
//                         <View>
//                             <SubmitBtn
//                                 title="Verify OTP"
//                                 activeTheme={activeTheme}
//                                 style={styles.appButtonContainer(activeTheme.default)}
//                                 onPress={verifyOtpToServer}
//                             // disabled={!cellNoCheck ? true : false}
//                             />
//                         </View>
//                     </View>
//                 </Animated.View>
//             </KeyboardAvoidingView>
//         </ImageBackground >
//     )
// };
// export default OtpCode;
