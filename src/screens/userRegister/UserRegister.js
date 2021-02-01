import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, ScrollView, Keyboard, KeyboardAvoidingView, StyleSheet, Dimensions } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import styles from './UserRegisterStyles';
import { sharedKeyboardDismissHandler, sharedAnimationHandler, navigateWithResetScreen } from "../../utils/sharedActions";
import colors from "../../styles/colors";
import { getRequest, postRequest } from "../../services/api";
import CustomInput from "../../components/input/Input";
import { userAction } from "../../redux/actions/user";
import CustomToast from "../../components/toast/CustomToast";
import SubmitBtn from "../../components/buttons/SubmitBtn";
import errorsUI from '../../components/validations';
import commonStyles from '../../styles/styles';
import { useFocusEffect } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import closeEye from '../../assets/svgIcons/common/close_eye.svg';
import openEye from '../../assets/svgIcons/common/open_eye.svg';
import { APP_MODE, MODES } from '../../config/config';


export default RegisterUser = props => {
    const { activeTheme, dispatch, user, behavior, keypaidOpen } = props;
    // console.log('getParams :', getParams)
    // console.log('RegisterUser.props :', props);
    let initState = {
        'emailAlreadyExist': false,
        'enableForm': false,
        'isValid': false,
        'focusedField': '',
        'fname': "",
        'lname': "",
        'mobile': user.phoneNumber,
        'email': "",
        'password': "",
        'confirmPassword': "",
        "validationsArr": [],
        "animationFlex": new Animated.Value(3.5),
        "showHidePasswordBool": false,
        "showHideConfPasswordBool": false,

    };
    const [state, setState] = useState(initState);
    const { enableForm, email, mobile, fname, lname, password, confirmPassword, isValid, focusedField, emailAlreadyExist, validationsArr, animationFlex, showHidePasswordBool, showHideConfPasswordBool } = state;
    let allFieldsValid = (fname.length >= 2 && lname.length >= 2 && password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword) ? true : false;
    const onChangeHandler = (key, value) => {
        setState(prevState => ({ ...prevState, [key]: value, focusedField: key, emailAlreadyExist: false }));
    };
    const emailCheckSuccessHandler = (response) => {
        // console.log('emailCheckSuccessHandler :', response.data);
        const { statusCode } = response.data;
        if (statusCode === 404) setState(prevState => ({ ...prevState, enableForm: true, emailAlreadyExist: false }));
        else {
            setState(prevState => ({ ...prevState, emailAlreadyExist: true, enableForm: false }));
            Keyboard.dismiss();
            // dispatch(userAction({ ...props.user, email }));
        }

    };
    const emailCheckErrorHandler = (error) => {
        console.log('emailCheckErrorHandler----', error);

    };
    const checkEmailAlreadyExist = payload => {
        getRequest(`/api/User/EmailCheck/${payload}`, {}, dispatch, emailCheckSuccessHandler, emailCheckErrorHandler, '', true, false)
    };
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
        else if (key === 'email' && isValidFlag) {
            console.log('should be request')
            checkEmailAlreadyExist(value);
            // if (value.split('.')[1] === 'com') checkEmailAlreadyExist(value);
        }
        setState(prevState => ({ ...prevState, isValid: isValidFlag, validationsArr }));
    };
    // console.log(validationsArr);
    const createUpdateSuccessHandler = res => {
        // console.log(res.data);
        const { statusCode } = res.data;
        if (statusCode === 200) {
            CustomToast.success('You are registered successfully')
            // Alert.alert('---User registeration success---');
            navigateWithResetScreen(0, [{ name: "Login", paramsPayload: { email, phoneNumber: mobile } }])
            // navigation.navigate('Login', { paramsPayload: { email, phoneNumber: mobile } });
        }
    };
    const createUpdateErrorHandler = err => {
        if (err.errors) {
            var errorKeys = Object.keys(err.errors),
                errorStr = "";
            for (let index = 0; index < errorKeys.length; index++) {
                errorStr += "*  " + err.errors[errorKeys[index]][0] + "\n"
            }
            CustomToast.error(errorStr, null, 'long');
        }
    };
    const userCreateUpdate = () => {
        let formData = new FormData();
        formData.append("FirstName", fname);
        formData.append("LastName", lname);
        formData.append("Mobile", mobile);
        formData.append("Email", email);
        formData.append("Password", password);
        formData.append("ConfirmPassword", confirmPassword);
        formData.append("Gender", 0);
        formData.append("UserType", (APP_MODE === MODES.RIDER) ? 2 : 1);
        // formData.append("IsDuplicate", false);
        // formData.append("IsDuplicate", !user.newUser);
        postRequest(
            '/api/User/CreateUpdate',
            formData,
            { headers: { 'content-type': 'multipart/form-data' } },
            dispatch,
            createUpdateSuccessHandler,
            createUpdateErrorHandler,
            '')
    };
    const alreadyEmailExistHandler = () => {
        dispatch(userAction({ ...props.user, email }));
        navigateWithResetScreen(0, [{ name: "ExistLogin" }]);
        // navigation.navigate('ExistLogin');
    };

    useFocusEffect(React.useCallback(() => {
        // Keyboard.dismiss();
        return () => {
            // console.log('Registration State Cleared-----');
            // Keyboard.dismiss();
        }
    }, []));
    useEffect(() => {
        if (keypaidOpen) sharedAnimationHandler(animationFlex, 5, 400);
        else sharedAnimationHandler(animationFlex, emailAlreadyExist ? 5 : 3.5, 400);
    }, [keypaidOpen])
    return (
        <View style={{ ...StyleSheet.absoluteFill }}>
            <KeyboardAvoidingView behavior={behavior} style={styles.tempContainer(activeTheme)}>
                <LinearGradient style={{ flex: 1, opacity: 0.6 }} colors={[...colors.gradientColors]} onTouchEnd={sharedKeyboardDismissHandler} />
                <Animated.View style={{ flex: animationFlex, backgroundColor: '#cf90ee' }}>
                    <View style={styles.tempWrapper(activeTheme, keypaidOpen, 2)}>
                        <View style={styles.userRegWrap(activeTheme, keypaidOpen)}>
                            <Text style={styles.catpion(activeTheme)}>Registration</Text>
                            <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingHorizontal: 10 }} style={{ marginBottom: 20 }}>
                                <View style={{ marginVertical: 2 }}>
                                    <Text style={styles.Inputcatpion(email, activeTheme, isValid, focusedField, 'email')}>
                                        Email
                                    </Text>
                                    <CustomInput
                                        onValidation={onValidation}
                                        name="email"
                                        placeholder='Email'
                                        style={email.length > 0 ? styles.regInputArea(activeTheme, isValid, focusedField, 'email') : styles.defaultInputArea(activeTheme)}
                                        value={email}
                                        onChangeHandler={value => onChangeHandler('email', value.trim())}
                                        datavalue={email}
                                        pattern={"email"}
                                        parentState={state}
                                        allFieldsValid={allFieldsValid}
                                        validationerror="invalid email"
                                        onFocus={() => setState({ ...state, focusedField: 'email' })}
                                        keyboardType="email-address"
                                        autoFocus={true}
                                    />
                                    {
                                        emailAlreadyExist ?
                                            <Text style={{ color: activeTheme.validationRed, textAlign: 'center' }}>This account already exist! </Text>
                                            :
                                            errorsUI.errorMessageUi(email, focusedField, 'email', 'invalid email', isValid)
                                    }
                                </View>
                                <View style={{ marginVertical: 2 }}>

                                    <Text style={styles.Inputcatpion(fname, activeTheme, isValid, focusedField, 'fname')}>
                                        First name
                            </Text>
                                    <CustomInput
                                        onValidation={onValidation}
                                        placeholder='First name'
                                        style={fname.length > 0 ? styles.regInputArea(activeTheme, isValid, focusedField, 'fname') : styles.defaultInputArea(activeTheme, state)}
                                        editable={enableForm}
                                        value={fname}
                                        onChangeHandler={(value) => onChangeHandler('fname', value)}
                                        datavalue={fname}
                                        pattern={"alpha"}
                                        name="fname"
                                        parentState={state}
                                        allFieldsValid={allFieldsValid}
                                        validationerror="invalid first name"
                                        onFocus={() => setState({ ...state, focusedField: 'fname' })}
                                    />
                                    {errorsUI.errorMessageUi(fname, focusedField, 'fname', 'invalid first name!', isValid)}
                                </View>
                                <View style={{ marginVertical: 2 }}>
                                    <Text style={styles.Inputcatpion(lname, activeTheme, isValid, focusedField, 'lname')}>
                                        Last name
                            </Text>
                                    <CustomInput
                                        onValidation={onValidation}
                                        placeholder='Last name'
                                        style={lname.length > 0 ? styles.regInputArea(activeTheme, isValid, focusedField, 'lname') : styles.defaultInputArea(activeTheme, state)}
                                        editable={enableForm}
                                        value={lname}
                                        datavalue={lname}
                                        onChangeHandler={(value) => onChangeHandler('lname', value)}
                                        pattern={"alpha"}
                                        name="lname"
                                        parentState={state}
                                        allFieldsValid={allFieldsValid}
                                        validationerror="invalid last name"
                                        onFocus={() => setState({ ...state, focusedField: 'lname' })}
                                    />
                                    {errorsUI.errorMessageUi(lname, focusedField, 'lname', 'invalid last name!', isValid)}
                                </View>
                                <View style={{ marginVertical: 2 }}>
                                    <Text style={styles.Inputcatpion(mobile, activeTheme, isValid, focusedField, 'mobile')}>
                                        Mobile
                            </Text>

                                    <CustomInput
                                        onValidation={onValidation}
                                        placeholder='Mobile'
                                        style={[styles.defaultInputArea(activeTheme), { backgroundColor: activeTheme.disabledFieldColor }]}
                                        editable={false}
                                        value={mobile}
                                        datavalue={mobile}
                                        onChangeHandler={(value) => onChangeHandler('mobile', value)}
                                        pattern={"number"}
                                        name="Mobile"
                                        parentState={state}
                                        allFieldsValid={allFieldsValid}
                                        onFocus={() => setState({ ...state, focusedField: 'mobile' })}
                                    />
                                </View>
                                <View style={{ marginVertical: 2 }}>
                                    <Text style={styles.Inputcatpion(password, activeTheme, isValid, focusedField, 'password')}>
                                        Password
                            </Text>
                                    <CustomInput
                                        onValidation={onValidation}
                                        placeholder='Password'
                                        style={password.length > 0 ? styles.regInputArea(activeTheme, isValid, focusedField, 'password') : styles.defaultInputArea(activeTheme, state)}
                                        editable={enableForm}
                                        value={password}
                                        datavalue={password}
                                        onChangeHandler={(value) => onChangeHandler('password', value)}
                                        pattern={"password"}
                                        secureTextEntry={true}
                                        name="password"
                                        parentState={state}
                                        allFieldsValid={allFieldsValid}
                                        validationerror={'password must be between 8-32 characters long'}
                                        onFocus={() => setState({ ...state, focusedField: 'password' })}
                                        secureTextEntry={showHidePasswordBool ? false : true}
                                        replaceRightIcon={true}
                                        rightIcon={password.length ? state.showHidePasswordBool ? openEye : closeEye : false}
                                        rightIconHandler={() => setState(pre => ({ ...pre, showHidePasswordBool: !pre.showHidePasswordBool }))}
                                        maxLength={32}
                                    />
                                    {errorsUI.passwordErrorMessageUi(focusedField, 'password', password, activeTheme, validationsArr)}
                                </View>
                                <View style={{ marginVertical: 2 }}>
                                    <Text style={styles.Inputcatpion(confirmPassword, activeTheme, isValid, focusedField, 'confirmPassword')}>
                                        Confirm Password
                            </Text>
                                    <CustomInput
                                        onValidation={onValidation}
                                        placeholder='Confirm Password'
                                        style={lname.length > 0 ? styles.regInputArea(activeTheme, isValid, focusedField, 'confirmPassword') : styles.defaultInputArea(activeTheme, state)}
                                        editable={enableForm}
                                        value={confirmPassword}
                                        datavalue={confirmPassword}
                                        onChangeHandler={(value) => onChangeHandler('confirmPassword', value)}
                                        pattern={"password"}
                                        secureTextEntry={true}
                                        name="confirmPassword"
                                        parentState={state}
                                        allFieldsValid={allFieldsValid}
                                        validationerror="passwords do not match"
                                        onFocus={() => setState({ ...state, focusedField: 'confirmPassword' })}
                                        secureTextEntry={showHideConfPasswordBool ? false : true}
                                        replaceRightIcon={true}
                                        rightIcon={confirmPassword.length ? state.showHideConfPasswordBool ? openEye : closeEye : false}
                                        rightIconHandler={() => setState(pre => ({ ...pre, showHideConfPasswordBool: !pre.showHideConfPasswordBool }))}
                                        maxLength={32}
                                    />
                                    {errorsUI.errorMessageUi(confirmPassword, focusedField, 'confirmPassword', 'Passwords do not match!', isValid)}
                                </View>
                                <TouchableOpacity style={{ marginVertical: 10, marginHorizontal: 20 }} onPress={() => navigateWithResetScreen(0, [{ name: "Login" }])}>
                                    <Text style={{ color: activeTheme.grey, textAlign: 'center' }}>Already have an account! <Text style={{ ...commonStyles.fontStyles(16, activeTheme.default, 4) }}>Sign In</Text></Text>
                                </TouchableOpacity>
                            </ScrollView>
                            {/* <View style={{flex: 2, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', backgroundColor: 'red' }}> */}
                            <View style={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                <SubmitBtn
                                    title="Sign Up"
                                    activeTheme={activeTheme}
                                    onPress={userCreateUpdate}
                                    disabled={isValid && allFieldsValid ? false : true}
                                    style={[styles.appButtonContainer(activeTheme, isValid && allFieldsValid ? true : false), { justifyContent: 'center', alignItems: 'center' }]}
                                />
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </View >

    )
};
