import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Keyboard, KeyboardAvoidingView, StyleSheet } from 'react-native';
import styles from './UserRegisterStyles';
import CustomInput from '../../components/input/Input';
import { postRequest } from '../../services/api';
import LinearGradient from 'react-native-linear-gradient';
import colors from "../../styles/colors";
import Validator from 'validator';
import CustomToast from "../../components/toast/CustomToast";
import errorsUI from '../../components/validations';
import SubmitBtn from "../../components/buttons/SubmitBtn";
import { navigateWithResetScreen, sharedKeyboardDismissHandler } from '../../utils/sharedActions';
import { useFocusEffect } from '@react-navigation/native';
import closeEye from '../../assets/svgIcons/common/close_eye.svg';
import openEye from '../../assets/svgIcons/common/open_eye.svg';

export default function ResetPassword(props) {
    const { toggleModal, navigation, activeTheme, user, dispatch, behavior, keypaidOpen } = props;
    console.log('ResetPassword Screen Props :', props);
    let initState = {
        'password': "",
        'confirmPassword': "",
        'focusedField': "",
        "validationsArr": [],
        'isValid': false,
        "showHidePasswordBool": false,
        "showHideConfPasswordBool": false,
    };
    const [state, setState] = useState(initState);
    const { confirmPassword, password, focusedField, isValid, validationsArr, showHideConfPasswordBool, showHidePasswordBool } = state;
    let allFieldsValid = (Validator.isLength(password, { min: 8, max: 32 }) && Validator.isLength(confirmPassword, { min: 8, max: 32 }) && password === confirmPassword) ? true : false;
    const onValidation = (isValidFlag, key, value) => {
        if (focusedField === 'password') {
            validationsArr[0] = value.length >= 8 && value.length <= 32 ? true : false
            validationsArr[1] = value.match(/[A-Z]/g) ? true : false
            validationsArr[2] = value.match(/[a-z]/g) ? true : false
            validationsArr[3] = value.match(/[0-9]/g) ? true : false
        }
        if (focusedField === 'confirmPassword' && value !== password) {
            isValidFlag = false;
        }
        setState(prevState => ({ ...prevState, isValid: isValidFlag, validationsArr }));
    };
    const onChangeHandler = (key, value) => {
        setState(prevState => ({ ...prevState, [key]: value, focusedField: key }));
    };
    const onSuccessHandler = async res => {
        // console.log('onSuccessHandler--------- :', res);
        const { statusCode, message } = res.data;
        if (statusCode === 201) {
            CustomToast.success(message);
            navigateWithResetScreen(0, [{ name: "Login", 'paramsData': { 'currentScreen': '' } }]);
            // navigation.navigate('Login', { 'paramsData': { 'currentScreen': '' } });
        }
        // dispatch(userAction())
    };
    const onErrorHandler = err => {
        if (err.errors.Password) {
            CustomToast.error(err.errors.Password[0]);
        }
        // console.log('onErrorHandler--------- :', err);
    };
    const resetPassword = () => {
        let data = {
            "password": password,
            "confirmPassword": confirmPassword
        }
        postRequest('/api/User/ResetPassword', data, { headers: { 'Authorization': 'Bearer ' + user.token.authToken } }, dispatch, onSuccessHandler, onErrorHandler, '')
    };
    // useFocusEffect(React.useCallback(() => {
    //     Keyboard.dismiss();
    //     return () => {
    //         Keyboard.dismiss();
    //     }
    // }, []));
    return (
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <LinearGradient style={{ flex: 1, opacity: 0.6 }} colors={[...colors.gradientColors]} onTouchEnd={sharedKeyboardDismissHandler} />
            <KeyboardAvoidingView behavior={behavior} >
                <View style={{ backgroundColor: '#cf90ee' }}>
                    <View style={styles.wrapper(activeTheme, focusedField === 'password' ? 350 : 300)}>
                        <View style={styles.regWrap}>
                            <Text style={styles.catpion(activeTheme)}>Reset Password</Text>
                            <View>

                                <Text style={styles.Inputcatpion(activeTheme)}>
                                    Password
                            </Text>
                                <CustomInput
                                    onValidation={onValidation}
                                    placeholder='New Password'
                                    style={password.length > 0 ? styles.regInputArea(activeTheme, isValid, focusedField, 'password') : styles.defaultInputArea(activeTheme)}
                                    value={password}
                                    onChangeHandler={(value) => onChangeHandler('password', value)}
                                    pattern={"password"}
                                    name="password"
                                    parentState={state}
                                    secureTextEntry={true}
                                    onFocus={() => setState({ ...state, focusedField: 'password' })}
                                    allFieldsValid={allFieldsValid}
                                    onBlur={() => setState({ ...state, focusedField: '' })}
                                    autoFocus={true}
                                    secureTextEntry={showHidePasswordBool ? false : true}
                                    replaceRightIcon={true}
                                    rightIcon={password.length ? state.showHidePasswordBool ? openEye : closeEye : false}
                                    rightIconHandler={() => setState(pre => ({ ...pre, showHidePasswordBool: !pre.showHidePasswordBool }))}
                                    maxLength={32}

                                />
                            </View>
                            {errorsUI.passwordErrorMessageUi(focusedField, 'password', password, activeTheme, validationsArr, 0, 80)}
                            <View>

                                <Text style={styles.Inputcatpion(activeTheme)}>
                                    Confirm Password
            </Text>
                                <CustomInput
                                    onValidation={onValidation}
                                    placeholder='Confirm Password'
                                    style={confirmPassword.length > 0 ? styles.regInputArea(activeTheme, isValid, focusedField, 'confirmPassword') : styles.defaultInputArea(activeTheme)}
                                    value={confirmPassword}
                                    onChangeHandler={(value) => onChangeHandler('confirmPassword', value)}
                                    pattern={"password"}
                                    secureTextEntry={true}
                                    name="confirmPassword"
                                    parentState={state}
                                    allFieldsValid={allFieldsValid}
                                    onFocus={() => setState({ ...state, focusedField: 'confirmPassword' })}
                                    secureTextEntry={true}
                                    editable={password.length >= 8 ? true : false}
                                    secureTextEntry={showHideConfPasswordBool ? false : true}
                                    replaceRightIcon={true}
                                    rightIcon={confirmPassword.length ? state.showHideConfPasswordBool ? openEye : closeEye : false}
                                    rightIconHandler={() => setState(pre => ({ ...pre, showHideConfPasswordBool: !pre.showHideConfPasswordBool }))}
                                    maxLength={32}

                                />
                            </View>

                            {errorsUI.errorMessageUi(confirmPassword, focusedField, 'confirmPassword', 'Password dot not match', isValid)}
                        </View>
                        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', }}>
                            <SubmitBtn
                                title="Reset"
                                activeTheme={activeTheme}
                                onPress={resetPassword}
                                disabled={!allFieldsValid}
                                style={styles.appButtonContainer(activeTheme, isValid && allFieldsValid)}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}
