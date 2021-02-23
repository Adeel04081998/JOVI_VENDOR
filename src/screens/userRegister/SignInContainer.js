import React, { useState, useEffect } from "react";
import { View, ImageBackground,Image, Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Platform, Keyboard } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import styles from './UserRegisterStyles';
import colors from "../../styles/colors";
import doodleImg from '../../assets/doodle.png';
import SignInScreen from "./SignInScreen";
import ForgotPassword from "./ForgotPassword";
import CenterAlignedModal from "../../components/modals/CentereAlignedModal";
import { postRequest } from "../../services/api";
import { sharedKeyboardDismissHandler, navigateWithResetScreen } from "../../utils/sharedActions";
import { userAction } from "../../redux/actions/user";
import CustomToast from "../../components/toast/CustomToast";
import { useFocusEffect } from '@react-navigation/native';
export default SignIn = props => {
    const { navigation, dispatch, user, activeTheme, behavior } = props;
    // let payloadVar = 'paramsPayload';
    // console.log('navigation.dangerouslyGetState--- :', navigation.dangerouslyGetState());
    let initState = {
        'isModalOpen': false,
        // 'currentScreen': "forgot_password",
        'currentScreen': "",
        'email': "",
        'focusedField': '',
        'isValid': false,
    };
    const [state, setState] = useState(initState);
    const { currentScreen, isModalOpen, email } = state;


    const onValidation = (isValidFlag, key, value) => {
        setState(prevState => ({ ...prevState, isValid: isValidFlag }));
    };
    const onChangeHandler = (key, value) => {
        setState(prevState => ({ ...prevState, [key]: value, focusedField: key }));
    };
    const handleToggleModal = () => {
        setState(prevState => ({
            ...prevState,
            isModalOpen: !prevState.isModalOpen
        }))
    };
    const handleScreen = (screenName) => {
        setState(prevState => ({
            ...prevState,
            currentScreen: screenName
        }))
    };
    const onSuccessHandler = async res => {
        // console.log('onSuccessHandler--------- :', res);
        const { statusCode, message } = res.data;
        // dispatch(userAction())
        if (statusCode === 200) {
            handleScreen('forgot_password');
            // Alert.alert(message);
            dispatch(userAction({ ...user, email }));
            navigateWithResetScreen(0, [{ name: 'Email_Otp_verify', 'paramsData': { email, phoneNumber: user.phoneNumber, appHash: user.appHash } }]);
            // navigation.navigate('Email_Otp_verify', { 'paramsData': { email, phoneNumber: user.phoneNumber, appHash: user.appHash } });
        }
        else if (statusCode === 404) {
            setState(prevState => ({ ...prevState, focusedField: 'email' }))
            CustomToast.error(message)
            // Alert.alert(message);
        }
    };
    const onErrorHandler = err => {
        console.log('onErrorHandler--------- :', err);
    };
    const sendEmailVerificationCode = () => {
        let payload = {
            "email": email,
            // "phoneNumber": user.phoneNumber
        }
        postRequest(
            '/api/User/OTP/Send',
            payload,
            {},
            dispatch,
            onSuccessHandler,
            onErrorHandler,
            '')
    };
    const modalOkHandler = () => {
        handleToggleModal();
        sendEmailVerificationCode();
        // navigation.navigate('Email_Otp_verify');
    };
    useFocusEffect(React.useCallback(() => {
        setState({ ...state, currentScreen: navigation.dangerouslyGetState().routes[navigation.dangerouslyGetState().index]?.paramsData?.currentScreen })
        return () => {
            setState(initState);
        }
    }, []));
    // console.log('Signin container State :', state);signinSC signInScreen signInScreencc
    return (
        <View style={{ ...StyleSheet.absoluteFill }}>
            <KeyboardAvoidingView behavior={behavior} style={styles.tempContainer(activeTheme)} >
                {/* <LinearGradient style={{ flex: 1, opacity: 0.1 }} colors={[...colors.gradientColors]} onTouchEnd={sharedKeyboardDismissHandler} /> */}
                <View style={{ backgroundColor: 'white',flex:1 }}>
                <ImageBackground source={require('../../assets/signInNew.png')} style={{width: '100%', height: '100%',flex:1}} resizeMode={'stretch'} resizeMethod={'scale'}>
                    
                </ImageBackground>
                {/* <Image source={require('../../assets/signinSC.png')} style={{ width: '100%',backgroundColor:'red', height: '90%', position: 'absolute', top: -200, left: 0,resizeMode: 'stretch', }}  /> */}
                    <View style={styles.tempWrapperSignIn(activeTheme, false, 1)}>
                        {
                            currentScreen === 'forgot_password' ?
                                <ForgotPassword
                                    toggleModal={handleToggleModal}
                                    // payloadVar={payloadVar}
                                    signInContainerState={state}
                                    onValidation={onValidation}
                                    onChangeHandler={onChangeHandler}
                                    onFocus={field => setState(pre => ({ ...pre, focusedField: field }))}
                                    {...props}
                                // {...getParams}
                                />
                                :
                                <SignInScreen
                                    handleScreen={handleScreen}
                                    handleToggleModal={handleToggleModal}
                                    // payloadVar={payloadVar}
                                    {...props}
                                />
                        }
                    </View>
                </View>
            </KeyboardAvoidingView>
            {
                isModalOpen &&
                <CenterAlignedModal
                    transparent={true}
                    visible={isModalOpen}
                    title={"Email Confirmation"}
                    okHandler={modalOkHandler}
                    onRequestCloseHandler={handleToggleModal}
                    parentState={state}
                    parentProps={props}

                />
            }
        </View>

    )
};
