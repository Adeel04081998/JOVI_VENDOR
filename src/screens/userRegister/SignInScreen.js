import React, { useState, useEffect, useRef } from 'react';
import styles from './UserRegisterStyles';
import { View, Text, Alert, Keyboard, ScrollView, Platform } from "react-native";
import { TouchableOpacity, TextInput } from 'react-native-gesture-handler';
import { postRequest, getRequest } from '../../services/api';
import CustomInput from '../../components/input/Input';
import AsyncStorage from '@react-native-community/async-storage';
import CustomToast from "../../components/toast/CustomToast";
import SubmitBtn from '../../components/buttons/SubmitBtn';
import errorsUI from '../../components/validations';
import { userAction } from '../../redux/actions/user';
import closeEye from '../../assets/svgIcons/common/close_eye.svg';
import openEye from '../../assets/svgIcons/common/open_eye.svg';
import { SvgXml } from 'react-native-svg';
import { APP_MODE, MODES, isJoviCustomerApp } from '../../config/config';
import { clearCustomerOrderStorage, clearCustomerOrderFinalDestination, navigateWithResetScreen, sharedHubConnectionInitiator, sharedGetNotificationsHandler } from '../../utils/sharedActions';
import Config from 'react-native-config';
import { LOGOUT_ACTION } from '../../redux/actions/types';
export default function SignInScreen(props) {
    const { handleScreen, navigation, activeTheme, dispatch, user } = props;

    const initState = Config.BUILD_TYPE === "debug" ? {
    
        // riders abcz@gamil.com / connor@gmail.com
        // 'email': "",
        // 'passwordd': "",
        // 'email':'tabishAdmin@gmail.com',
        // 'password':'Kaplan224400',
        'email':'vendorj@jovi.com',
        'password':'Vendor123',
        // 'password': "",
        // 'email': isJoviCustomerApp ? "malikjrw147@gmail.com" : "connor@gmail.com",
        // 'password': isJoviCustomerApp ? 'Abc12345' : "Abc12345",
        'focusedField': '',
        'isValid': user.email ? true : false,
        "showHidePasswordBool": false

        // production behaviour in dev mode
        // 'email': user.email || '',
        // 'password': '',
        // 'focusedField': '',
        // 'isValid': user.email ? true : false,
        // "showHidePasswordBool": false
    } :
        // for production
        {
            'email': user.email || '',
            'password': '',
            'focusedField': '',
            'isValid': user.email ? true : false,
            "showHidePasswordBool": false
        };


    const [state, setState] = useState(initState);
    const { email, password, focusedField, isValid, showHidePasswordBool } = state;
    // console.log('SignIn Screen props :', props);
    const loginSuccessHandler = async res => {
        // debugger;
        // console.log('loginSuccessHandler--------- :', res);
        try {
            if (res.data.statusCode === 200) {
                clearCustomerOrderStorage();
                clearCustomerOrderFinalDestination();
                await AsyncStorage.removeItem("home_tasksData");
                // debugger;
                // Keyboard.dismiss();
                dispatch(userAction({ ...props.user,userID: res.data.loginResult.token.id, tokenObj: res.data.loginResult }))
                getRequest(`/api/Vendor/Details`,
                // getRequest(`/api/User/Details`,
                    { "Authorization": "Bearer " + res.data.loginResult.token.authToken },
                    dispatch,
                    async ress => {
                        console.log('USer---------',ress.data)
                        dispatch(userAction({ ...props.user, ...ress.data.userDetails, userID: res.data.loginResult.token.id, tokenObj: res.data.loginResult }));
                        // sharedGetNotificationsHandler(postRequest, 1, 20, true, dispatch);
                    },
                    err => {
                        console.log("Problem is here--- :", JSON.stringify(err))
                        if (err) CustomToast.error("Something went wrong!")
                        dispatch(userAction({ ...props.user, daysOfTheWeek:[],openingTime:'',closingTime:'', userID: res.data.loginResult.token.id, tokenObj: res.data.loginResult }));

                        // Commented line were creating an ambigous behaviour when logged in user open app after a while 
                        // if (err) setState({ ...state, loggedInUser: null, initRoute: "Login" });
                    },
                    '',
                );
                // getRequest(`/api/User/Details`,
                // { "Authorization": "Bearer " + res.data.loginResult.token.authToken },
                // dispatch,
                // r => {
                //     sharedGetNotificationsHandler(postRequest, 1, 10, true, dispatch);
                //     dispatch(userAction({ ...props.user, ...r.data.userDetails, userID: res.data.loginResult.token.id, tokenObj: res.data.loginResult }))
                //     },
                //     err => console.log(err),
                //     '');
                await AsyncStorage.setItem('User', JSON.stringify(res.data.loginResult));
                // navigateWithResetScreen(0, [{ name: "Dashboard" }]);
                // navigation.navigate('Dashboard');
                navigateWithResetScreen(null, [{ name: 'Dashboard', params: {} }])
                // sharedHubConnectionInitiator(postRequest);
                // navigation.navigate('Dashboard');
                // CustomToast.success('You are logged in!');
                // Alert.alert(JSON.stringify(res.data.loginResult));
            };
        } catch (error) {
            // debugger;
            // Keyboard.dismiss();
            console.log('loginSuccessHandler Catch Error Ran--- :', error);
        }
    };
    const loginErrorHandler = err => {
        if (err.response) return CustomToast.error(err.response);
        // debugger;
        console.log('loginErrorHandler--------- :', err);
        const { errors } = err;
        if (errors && errors.Email) CustomToast.error(errors.Email[0]);
        else if (errors && errors.Password) CustomToast.error(errors.Password[0]);
        else if (errors && errors.Error) CustomToast.error(errors.Error[0])
    };
    const onValidation = (isValidFlag, key, value) => {
        // console.log('Value :', value)
        setState(prevState => ({ ...prevState, isValid: isValidFlag }));
    };
    const onChangeHandler = (key, value) => {
        setState(prevState => ({ ...prevState, [key]: value, focusedField: key }));
    };
    const signInHandler = () => {
        // debugger;
        Keyboard.dismiss();
        // debugger;
        postRequest(
            `/Api/Vendor/Vendor/Login`,
            // `/api/User/Admin/Login`,
            // `/api/User/${APP_MODE === MODES.CUSTOMER ? "Customer" : "Rider"}/Login`,
            {
                'email': email,
                'password': password
            },
            {},
            dispatch,
            loginSuccessHandler,
            loginErrorHandler,
            '')
    };
    const navigateToSignup = () => {
        setState(initState);
        return navigateWithResetScreen(0, [{ name: "Registration", 'paramsData': { 'phoneNumber': user.phoneNumber, "newUser": user.newUser } }]);
        // navigation.navigate('Registration', { 'paramsData': { 'phoneNumber': user.phoneNumber, "newUser": user.newUser } });

    };
    useEffect(() => {
        if (navigation.dangerouslyGetState().routes[navigation.dangerouslyGetState().index].params === "logout") {
            console.log('Logout user')
            dispatch({ type: LOGOUT_ACTION });
        }
        return () => {
            setState(initState);
        }

    }, []);
    // console.log('state :', state);
    const allFieldsValid = email.length > 0 && isValid && password.length > 0 ? true : false
    return (
        <>
            <View style={styles.regWrap}>
                {/* <Text style={styles.catpion(activeTheme)}>Sign In</Text> */}
                <Text style={styles.Inputcatpion(activeTheme)}>
                    Email
            </Text>
                <CustomInput
                    onValidation={onValidation}
                    name="email"
                    placeholder='Email ID'
                    style={email.length > 0 ? styles.regInputArea(activeTheme, isValid, focusedField, 'email') : { ...styles.defaultInputArea(activeTheme), borderColor: state.focusedField === 'email' ? activeTheme.default : activeTheme.borderColor }}
                    value={email}
                    onChangeHandler={value => onChangeHandler('email', value.trim())}
                    pattern={"email"}
                    onFocus={() => setState(prevState => ({ ...prevState, focusedField: 'email' }))}
                    parentState={state}
                    // keyboardType={Platform.constants.Model === "WAS-LX1A" ? "numeric" : "default"}
                    keyboardType={"default"}
                    allFieldsValid={allFieldsValid}
                    autoFocus={true}

                />
                {errorsUI.errorMessageUi(email, focusedField, 'email', 'invalid email', isValid)}
                <Text style={styles.Inputcatpion(activeTheme)}>
                    Password
            </Text>

                <CustomInput
                    // onValidation={onValidation}
                    placeholder='Password'
                    style={{
                        width: '100%',
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: focusedField === 'password' ? activeTheme.default : 'rgba(0,0,0,0.1)',
                        paddingVertical: 0,
                        height: 50,
                        marginBottom: 10,
                        paddingHorizontal: 10
                    }}
                    value={password}
                    onChangeHandler={(value) => onChangeHandler('password', value)}
                    pattern={"password"}
                    secureTextEntry={true}
                    name="password"
                    parentState={state}
                    allFieldsValid={allFieldsValid}
                    onFocus={() => setState({ ...state, focusedField: 'password' })}
                    secureTextEntry={showHidePasswordBool ? false : true}
                    replaceRightIcon={true}
                    rightIcon={password.length ? showHidePasswordBool ? openEye : closeEye : false}
                    rightIconHandler={() => setState(pre => ({ ...pre, showHidePasswordBool: !pre.showHidePasswordBool }))}
                    maxLength={32}
                    keyboardType={"default"}
                // keyboardType={Platform.constants.Model === "WAS-LX1A" ? "numeric" : "default"}
                />
                {/* <View style={{ marginVertical: 15, justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    <TouchableOpacity onPress={navigateToSignup} >
                        <Text style={{ color: activeTheme.grey, fontSize: 14 }}>{`Don't have an account ? `}
                            <Text style={styles.touchableText(activeTheme)}>{'Sign Up'}</Text>
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleScreen('forgot_password')} style={{ marginVertical: 5 }}>
                        <Text style={styles.touchableText(activeTheme)}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View> */}
            </View>
            <View style={{ flex: 0 }}>
                <SubmitBtn
                    title="Login"
                    activeTheme={activeTheme}
                    onPress={signInHandler}
                    disabled={allFieldsValid ? false : true}
                    style={styles.appButtonContainer(activeTheme, isValid && password.length > 0 ? true : false)}

                // disabled={false}
                // style={styles.appButtonContainer(activeTheme, true)}
                />
            </View>
        </>
    )
}
