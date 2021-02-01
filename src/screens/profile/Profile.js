import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, ImageBackground, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Dimensions, ActivityIndicator } from 'react-native';
import CustomHeader from '../../components/header/CustomHeader';
import commonIcons from '../../assets/svgIcons/common/common';
import editIcon from '../../assets/profile/edit_profile.svg';
import pswIcon from '../../assets/profile/edit_psw.svg';
import maleIcon from '../../assets/profile/male.svg';
import femalIcon from '../../assets/profile/female.svg';
import unselIcon from '../../assets/profile/unsel.svg';
import selIcon from '../../assets/profile/sel.svg';
import nextIcon from '../../assets/profile/next.svg';
import cameraIcon from '../../assets/profile/cam.svg';
import doodleImg from '../../assets/doodle.png';
import modalCam from '../../assets/profile/camera.svg';

import plateformSpecific from '../../utils/plateformSpecific';
import CustomInput from '../../components/input/Input';
import { SvgXml } from 'react-native-svg';
import commonStyles from '../../styles/styles';
import { getRequest, postRequest } from '../../services/api';
import errorsUI from '../../components/validations';
import correctIcon from '../../assets/svgIcons/common/correct_icon.svg';
import ChangePassword from './ChangePassword';
import CustomToast from '../../components/toast/CustomToast';
import { sharedImagePickerHandler, renderPicture, sharedlogoutUser, navigateWithResetScreen, sharedObjectComparison, sharedOpenModal, sharedLounchCameraOrGallary } from '../../utils/sharedActions';
import Spinner from 'react-native-spinkit';
import { connect } from 'react-redux';
import { userAction } from '../../redux/actions/user';
import { openModalAction, closeModalAction } from '../../redux/actions/modal';
import Picker from '../../components/dropdowns/picker';
import { DEVICE_WIN_WIDTH, EMPTY_PROFILE_URL } from '../../config/config';
// import { useIsFocused } from '@react-navigation/native';
import { isJoviCustomerApp } from '../../config/config';
import waitIcon from '../../assets/svgIcons/rider/waitIcon.svg';
import errorIcon from '../../assets/svgIcons/rider/errorIcon.svg';
import CustomImageView from '../../components/imageView';
const DatePicker = props => {
    const [dateState, setDateState] = useState({
        "D": props.parentState.dob.split("/")[0] || props.parentState.daysArr[0],
        "M": props.parentState.dob.split("/")[1] || props.parentState.monthsArr[0],
        "Y": props.parentState.dob.split("/")[2] || props.parentState.yearsArr[0],
        // "dateString": props.parentState.dob || ""
    });

    return (
        <View style={{ width: "100%", padding: 30 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', }}>
                <TouchableOpacity onPress={() => props.dispatch(closeModalAction())}>
                    <Text style={{ color: props.activeTheme.default, }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    props.onSave('dob', `${dateState.D}/${dateState.M}/${dateState.Y}`);
                    props.dispatch(closeModalAction());
                }}>
                    <Text style={{ color: props.activeTheme.default }}>Save </Text>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 }}>
                {
                    [{ key: "D", selectedValue: dateState.D, prompt: "Date", data: props.parentState.daysArr }, { key: "M", selectedValue: dateState.M, prompt: "Month", data: props.parentState.monthsArr }, { key: "Y", selectedValue: dateState.Y, prompt: "Year", data: props.parentState.yearsArr }].map((X, i) => (
                        <View key={i} >
                            <Text style={[commonStyles.fontStyles(16, props.activeTheme.black, 4), { left: 5, textAlign: Platform.select({ ios: 'center', android: "left" }) }]}>
                                {X.prompt}
                            </Text>
                            <Picker
                                data={X.data}
                                style={{ width: i > 1 ? 110 : 85 }}
                                setSelectedValue={v => setDateState({ ...dateState, [X.key]: v })}
                                mode={"dialog"}
                                prompt={`Select ${X.prompt}`}
                                selectedValue={X.selectedValue}
                                enabled={true}
                            />
                        </View>

                    ))
                }
            </View>
        </View >
    )
};

const ModalView = ({ parentProps, parentState, uiType, handlers }) => {
    const [smLoader, setSmLoader] = useState(false);
    return <View style={{ flex: 1, width: DEVICE_WIN_WIDTH, padding: 30, justifyContent: 'space-between' }}>
        <SvgXml xml={modalCam} height={40} width={40} style={{ alignSelf: 'center' }} />
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: parentProps.activeTheme.default, paddingVertical: 15, borderRadius: 5 }}
            onPress={() => {
                if (uiType === 1) {
                    parentProps.dispatch(closeModalAction());
                    handlers.takePictureHandler(false);
                } else {
                    sharedLounchCameraOrGallary(1, () => { }, picData => {
                        handlers.getPicture(picData);
                        parentProps.dispatch(closeModalAction());
                    })
                }
            }}
        >
            <Text style={commonStyles.fontStyles(14, parentProps.activeTheme.white, 3)}>{uiType ? "View Picture" : "Take a photo"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: parentProps.activeTheme.validationRed, paddingVertical: 15, borderRadius: 5 }}
            onPress={() => {
                if (uiType === 1) {
                    if (parentState.picturePicked) {
                        parentProps.dispatch(closeModalAction());
                        parentProps.dispatch(userAction({ ...parentProps.U, picture: EMPTY_PROFILE_URL, isLocalChange: true }));
                        handlers.setState(pre => ({ ...pre, picture: EMPTY_PROFILE_URL, pictureObj: {}, picturePicked: false }));
                    } else {
                        setSmLoader(true);
                        postRequest(
                            `/api/User/RemovePicture`,
                            {
                                'removePic': true,
                            },
                            {},
                            parentProps.dispatch,
                            success => {
                                console.log("[Success ] : ", success);
                                if (success.data.statusCode === 200) {
                                    setSmLoader(false);
                                    parentProps.dispatch(closeModalAction());
                                    parentProps.dispatch(userAction({ ...parentProps.U, picture: EMPTY_PROFILE_URL, isLocalChange: true }));
                                    handlers.setState(pre => ({ ...pre, picture: EMPTY_PROFILE_URL }));
                                }
                            },
                            error => {
                                console.log("[Error ] : ", error);
                                if (error) CustomToast.error("Something went wrong");
                                setSmLoader(false);
                            },
                            '',
                            false)
                    }
                } else {
                    sharedLounchCameraOrGallary(0, () => { }, picData => {
                        handlers.getPicture(picData);
                        parentProps.dispatch(closeModalAction());
                    })
                }
            }}
        >
            {
                smLoader ?
                    <ActivityIndicator style={{ paddingHorizontal: 10 }} size="small" color={parentProps.activeTheme.white} />
                    :
                    <Text style={commonStyles.fontStyles(14, parentProps.activeTheme.white, 3)}>{uiType ? "Remove Picture" : "Choose from gallary"}</Text>
            }
        </TouchableOpacity>


    </View>
};

function Profile(props) {
    console.log("Profile.props :", props);
    let initState = {
        'emailAlreadyExist': false,
        'activeTab': 0,
        'isValid': true,
        'focusedField': '',
        'gender': props.U.genderEnum || 1,
        'fname': props.U.firstName || "",
        'lname': props.U.lastName || "",
        'mobile': props.U.mobile || "",
        'email': props.U.email || "",
        'dob': props.U.dob || "",
        'picture': props.U.picture && props.U.isLocalChange ? props.U.picture : props.U.picture ? renderPicture(props.U.picture, props.U.tokenObj.token.authToken) : EMPTY_PROFILE_URL,
        'pictureObj': {},
        'pictureSentObj': {},
        'oldPassword': "",
        'newPassword': "",
        'confirmPassword': "",
        'validationsArr': [],
        'isLoading': false,
        'yearsArr': [],
        'monthsArr': [],
        'daysArr': [],
        'isImageViewOpen': false,
        'picturePicked': false

    };
    const [state, setState] = useState(initState);
    console.log('state :', state);
    // console.log("sharedObjectComparison(state.pictureObj, state.pictureSentObj) :", sharedObjectComparison(state.pictureObj, state.pictureSentObj, []));
    const toggleHandler = (type, idx) => {
        setState(prevState => {
            if (type === 1) return { ...prevState, ...initState, yearsArr: prevState.yearsArr, monthsArr: prevState.monthsArr, daysArr: prevState.daysArr, activeTab: idx, picture: prevState.picture, pictureObj: prevState.pictureObj }
            else return { ...prevState, gender: idx }
        })
    };
    const onChangeHandler = (key, value) => {
        // debugger;
        if (key === 'mobile') {
            // console.log(value)
            if (!state.mobile.length && value == '0') value = '';
            else if (value[0] == '0') {
                value = value.slice(1, value.length);
            }
            else if (value.slice(0, 3) === "920") {
                // value = value.slice(0, 2) + value.slice(2, value.length);
                value = value.slice(0, 2);
            }
            else {
                value = value;
            }
        } else if (key === 'email') {
            console.log('email changing :', value);
            if (value.split('.')[1] === 'com' && value === props.user.email) return setState(prevState => ({ ...prevState, [key]: value, focusedField: key }));
            else if (value.split('.')[1] === 'com') {
                getRequest(`/api/User/EmailCheck/${value}`, {}, props.dispatch, res => {
                    if (res.data.statusCode === 200) setState(prevState => ({ ...prevState, emailAlreadyExist: true, isValid: false }));
                    else if (res.data.statusCode === 404) setState(prevState => ({ ...prevState, emailAlreadyExist: false, isValid: true }));
                },
                    err => {
                        console.log("onChangeHandler.getRequest.err :", err)
                    },
                    '',
                    true,
                    false)
            }
            else {
                setState(prevState => ({ ...prevState, emailAlreadyExist: false, isValid: false }));
            }
        }
        setState(prevState => ({ ...prevState, [key]: value, focusedField: key }));
    }
    const onValidation = (isValidBool, key, value) => {
        // debugger;
        if (state.focusedField === 'newPassword') {
            state.validationsArr[0] = value.length >= 8 && value.length <= 32 ? true : false
            state.validationsArr[1] = value.match(/[A-Z]/g) ? true : false
            state.validationsArr[2] = value.match(/[a-z]/g) ? true : false
            state.validationsArr[3] = value.match(/[0-9]/g) ? true : false
        }
        else if (state.focusedField === 'confirmPassword' && value !== state.newPassword) {
            isValidBool = false;
        }
        setState(prevState => ({ ...prevState, isValid: isValidBool, validationsArr: state.validationsArr }));
    };
    // const toggleModal = () => setState(prevState => ({ ...prevState, calanderOpened: !prevState.calanderOpened }));
    const profileUpdateHandler = () => {
        let formData = new FormData();
        formData.append("UserID", props.U.userID);
        formData.append("FirstName", state.fname);
        formData.append("LastName", state.lname);
        formData.append("Email", state.email);
        formData.append("Mobile", state.mobile);
        formData.append("DateOfBirth", state.dob);
        formData.append("Gender", state.gender);
        // formData.append("Picture", Object.keys(state.pictureObj).length ? state.pictureObj : "");
        formData.append("Picture", sharedObjectComparison(state.pictureObj, state.pictureSentObj, []) ? "" : Object.keys(state.pictureObj).length ? state.pictureObj : "");
        formData.append("OldPassword", state.oldPassword);
        formData.append("Password", state.newPassword);
        formData.append("ConfirmPassword", state.confirmPassword);
        formData.append("UserType", isJoviCustomerApp ? 1 : 2);
        formData.append("IsDuplicate", false);
        postRequest(
            '/api/User/CreateUpdate',
            formData,
            { headers: { 'content-type': 'multipart/form-data' } },
            props.dispatch,
            res => {
                if (state.activeTab > 0) {
                    sharedlogoutUser(props.navigation, postRequest, props.dispatch, props?.U, false);
                    CustomToast.success(res.data.message);
                }
                else {
                    setState(pre => ({ ...pre, pictureSentObj: state.pictureObj, picturePicked: false }));
                    props.dispatch(userAction({ ...props.U, firstName: state.fname, lastName: state.lname, isLocalChange: Object.keys(state.pictureObj).length ? true : false, picture: Object.keys(state.pictureObj).length ? state.picture : props.U.picture, picStatus: 1, picStatusStr: "Pending" }));
                    CustomToast.success(res.data.message);
                }
            },
            err => {
                if (err.errors.Password) CustomToast.error(err.errors.Password[0]);
                if (err.errors.Email) CustomToast.error(err.errors.Email[0]);
                if (err.errors.OldPassword) CustomToast.error(err.errors.OldPassword[0]);
                // console.log(err)
            },
            '')
    };
    const onSavePress = (clickType) => {
        Keyboard.dismiss();
        if (clickType === 'changeNumber') {
            navigateWithResetScreen(0, [{
                name: "OTP",
                backScreenObj: {
                    container: "Dashboard",
                    screen: "profile_container"
                }
            }])
        }
        // if ((state.mobile !== props.U.mobile) || props.user.changeMobileNumber) {
        //     sendOtpHandler();
        // }
        else {
            profileUpdateHandler();
        }

    };
    const getPicture = picData => setState(prevState => ({
        ...prevState,
        isLoading: false,
        picturePicked: true,
        picture: picData.uri,
        pictureObj: {
            uri: Platform.OS === 'android' ? picData.uri : picData.uri.replace("file://", ""),
            name: picData.uri.split('/').pop(),
            type: picData.type
            // type: 'image/jpg'
        }
    }));
    const takePictureHandler = async (takePick) => {
        if (!takePick) return setState(pre => ({ ...pre, isImageViewOpen: true }));
        else {
            try {
                await sharedImagePickerHandler(() => setState(prevState => ({ ...prevState, isLoading: false })), picData => getPicture(picData))
            } catch (error) {
                setState(prevState => ({ ...prevState, isLoading: false }));
            }
        }
    };

    const openDatePicker = () => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (<DatePicker activeTheme={props.activeTheme} parentState={state} onSave={(key, value) => onChangeHandler(key, value)} {...props} />),
            modalFlex: Platform.select({ ios: 2.5, android: 3 }),
            modelViewPadding: 0
        };
        props.dispatch(openModalAction(ModalComponent));
    };
    const renderProfileUI = () => {
        if (!isJoviCustomerApp) {
            if (parseInt(props.U.picStatus) === 3 || parseInt(props.U.picStatus) === 0) {
                return <Fragment>
                    <ImageBackground source={{ uri: state.picture }} resizeMode="cover" style={{ height: 90, width: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }} onLoadStart={() => setState(prevState => ({ ...prevState, isLoading: true }))} onLoadEnd={() => setState(prevState => ({ ...prevState, isLoading: false }))}>
                        <Spinner isVisible={state.isLoading} size={30} type="Circle" color={props.activeTheme.default} />
                    </ImageBackground>
                    {
                        state.activeTab === 0 ?
                            <TouchableOpacity onPress={() => takePictureHandler(true)} style={{ backgroundColor: props.activeTheme.grey, position: 'absolute', zIndex: 1, left: 55, top: 60, borderRadius: 17, borderColor: props.activeTheme.white, borderWidth: 1, height: 35, width: 35, justifyContent: 'center', alignItems: 'center' }}>
                                <SvgXml xml={cameraIcon} height={20} width={20} />
                            </TouchableOpacity>
                            : null
                    }
                </Fragment>
            } else {
                return <Fragment>

                    <ImageBackground
                        source={{ uri: state.picture }}
                        resizeMode="cover" style={{ height: 90, width: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
                        onLoadStart={() => setState(prevState => ({ ...prevState, isLoading: true }))}
                        onLoadEnd={() => setState(prevState => ({ ...prevState, isLoading: false }))}
                    />
                    {
                        state.activeTab === 0 ?
                            <TouchableOpacity disabled={parseInt(props.U.picStatus) === 2 ? false : true} onPress={parseInt(props.U.picStatus) === 2 ? () => takePictureHandler(false) : () => { }} style={{ backgroundColor: props.activeTheme.white, position: 'absolute', zIndex: 1, left: 55, top: 60, borderRadius: 20, borderColor: props.activeTheme.white, borderWidth: 1, height: 35, width: 35, justifyContent: 'center', alignItems: 'center' }}>
                                <SvgXml xml={parseInt(props.U.picStatus) === 1 ? waitIcon : errorIcon} height={20} width={20} />
                            </TouchableOpacity>
                            : null
                    }
                </Fragment>

            }
        } else {
            return <Fragment>
                <ImageBackground source={{ uri: state.picture }} resizeMode="cover" style={{ height: 90, width: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }} onLoadStart={() => setState(prevState => ({ ...prevState, isLoading: true }))} onLoadEnd={() => setState(prevState => ({ ...prevState, isLoading: false }))}>
                    <Spinner isVisible={state.isLoading} size={30} type="Circle" color={props.activeTheme.default} />
                </ImageBackground>
                {
                    state.activeTab === 0 ?
                        <TouchableOpacity onPress={() => sharedOpenModal({ dispatch: props.dispatch, visible: true, transparent: true, modalHeight: 220, modelViewPadding: 0, ModalContent: <ModalView parentState={state} parentProps={{ ...props }} uiType={0} handlers={{ getPicture }} />, okHandler: () => { }, onRequestCloseHandler: null, androidKeyboardExtraOffset: 0 })} style={{ backgroundColor: props.activeTheme.grey, position: 'absolute', zIndex: 1, left: 55, top: 60, borderRadius: 20, borderColor: props.activeTheme.white, borderWidth: 1, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}>
                            <SvgXml xml={cameraIcon} height={25} width={25} />
                        </TouchableOpacity>
                        : null
                }
            </Fragment>
        }

    };
    const onPictureClicked = () => {
        if (state.picture === EMPTY_PROFILE_URL) takePictureHandler(false);
        else if (state.activeTab > 0) takePictureHandler(false);
        else if (isJoviCustomerApp) sharedOpenModal({ dispatch: props.dispatch, visible: true, transparent: true, modalHeight: 220, modelViewPadding: 0, ModalContent: <ModalView parentState={state} parentProps={{ ...props }} uiType={1} handlers={{ takePictureHandler, setState }} />, okHandler: () => { }, onRequestCloseHandler: null, androidKeyboardExtraOffset: 0 });
        else takePictureHandler(false);
    }
    const handleIsValidFromChangePsw = bool => setState(pre => ({ ...pre, isValid: bool }));
    useEffect(useCallback(() => {
        // console.log("profile mounted----");
        let now = new Date(new Date().setUTCFullYear(new Date().getUTCFullYear() - 15)).getUTCFullYear(),
            years = Array(now - (now - 70)).fill('').map((v, idx) => (now - idx).toString()),
            months = Array.from(Array(12), (item, i) => ((i + 1) < 10 ? 0 + (i + 1).toString() : (i + 1).toString())),
            days = Array.from(Array(31), (item, i) => ((i + 1) < 10 ? 0 + (i + 1).toString() : (i + 1).toString()));
        setState(prevState => ({ ...prevState, yearsArr: years, monthsArr: months, daysArr: days }));
        return () => {
            // console.log("Profile Unmounted and State cleared----");
            setState(initState);
        }
    }, []), []);

    // this
    // its commented for client demo test

    // useEffect(() => {
    //     if (props.user.getProfileCall) {
    //         console.log("profile mounted with update call----", props.user.getProfileCall);
    //         props.dispatch(userAction({ ...props.U, getProfileCall: false }));
    //         profileUpdateHandler();
    //     }
    // }, [props.user.getProfileCall]);  

    // console.log("profile mounted with update call----", props.user.getProfileCall);
    console.log("profile state----", state);
    let editProfileBool = state.mobile.length >= 9 ? false : true;
    let editPasswordeBool = state.isValid && state.oldPassword.length > 0 && state.newPassword.length > 0 && state.confirmPassword.length > 0 ? false : true;
    return (
        <ImageBackground source={doodleImg} style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={'toggle'}
                    rightIconHandler={() => { }}
                    navigation={props.drawerProps.navigation}
                    leftIcon={commonIcons.menueIcon(props.activeTheme)}
                    bodyContent={'Edit Profile'}
                    rightIcon={null}
                    activeTheme={props.activeTheme}
                />
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: null })}>
                    <View style={{ flex: 1, backgroundColor: props.activeTheme.white, marginTop: plateformSpecific(55, 35), borderRadius: 20 }}>
                        <TouchableWithoutFeedback onPress={onPictureClicked} hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }} >
                            {/* <TouchableOpacity disabled={state.activeTab > 0 ? true : false} onPress={() => takePictureHandler(true)} hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }} > */}
                            <View style={{ height: 90, width: 90, borderRadius: 45, position: 'absolute', alignSelf: 'center', top: -40, zIndex: 1, backgroundColor: props.activeTheme.lightGrey, justifyContent: 'center', alignItems: 'center' }}>
                                {renderProfileUI()}
                            </View>
                        </TouchableWithoutFeedback>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', zIndex: 1, top: 65, marginBottom: 40 }}>
                            {
                                [editIcon, pswIcon].map((icon, i) => (
                                    <TouchableOpacity key={i} onPress={() => toggleHandler(1, i)}>
                                        <View style={{ backgroundColor: props.activeTheme.default, borderRadius: 15, top: i !== state.activeTab ? 7 : 0, height: state.activeTab === i ? 60 : 45, width: state.activeTab === i ? 60 : 45, justifyContent: 'center', alignItems: 'center', marginLeft: i > 0 ? 20 : 0, }}>
                                            <SvgXml xml={icon} height={30} width={30} />
                                        </View>
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                        <ScrollView style={{ paddingHorizontal: 20, paddingBottom: 20, marginTop: 30 }} keyboardShouldPersistTaps="always">
                            <View style={{ paddingVertical: 20 }}>
                                {state.activeTab === 0 &&
                                    <View>
                                        <Text style={commonStyles.fontStyles(16, "#000", 3)}>Gender</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                                            {
                                                [maleIcon, femalIcon].map((g, i) => (
                                                    <TouchableOpacity key={i} onPress={() => toggleHandler(2, i + 1)}>
                                                        <SvgXml xml={g} height={70} width={70} />
                                                        <View style={{ position: 'absolute', alignSelf: 'center', zIndex: 1, top: 45, }}>
                                                            <SvgXml xml={i + 1 === state.gender ? selIcon : unselIcon} height={45} width={45} />
                                                        </View>
                                                    </TouchableOpacity>

                                                ))
                                            }
                                        </View>
                                    </View>
                                }
                                <View style={{ marginTop: 15 }}>
                                    {
                                        state.activeTab === 0 ?
                                            [
                                                { field: "fname", title: 'First name', pattern: 'alpha', validationerror: "Invalid first name", value: state.fname, maxLength: 50 },
                                                { field: "lname", title: 'Last name', pattern: 'alpha', validationerror: "Invalid last name", value: state.lname, maxLength: 50 },
                                                { field: "email", title: 'Email', pattern: 'email', validationerror: state?.emailAlreadyExist ? "This email is already exist" : "Invalid email", value: state.email, maxLength: 64 },
                                                { field: "mobile", title: 'Mobile', pattern: 'mobile', validationerror: "Invalid mobile number", value: state.mobile, maxLength: 12 },
                                                { field: "dob", title: 'Date of birth', pattern: 'date', validationerror: "Invalid date", value: state.dob },

                                            ].map((x, i) => (
                                                <View key={i}>
                                                    <View style={{ paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text style={commonStyles.fontStyles(14, props.activeTheme.black, 1, "100")}>
                                                            {x.title}
                                                        </Text>
                                                        {
                                                            x.field === "mobile" ?
                                                                <TouchableOpacity onPress={() => onSavePress("changeNumber")}>
                                                                    <Text style={{ color: props.activeTheme.default }}>Change</Text>
                                                                </TouchableOpacity>
                                                                : null
                                                        }
                                                    </View>
                                                    {
                                                        x.field === 'dob' ?
                                                            <TouchableOpacity style={[profileStyles.defaultInputArea(props.activeTheme, x.field, state), { justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }]}
                                                                disabled={!state.isValid ? true : false}
                                                                onPress={openDatePicker}
                                                            >
                                                                <Text>{state.dob.length ? state.dob : "dd/mm/yyyy"}</Text>
                                                                {
                                                                    state.dob.length ?
                                                                        <SvgXml xml={correctIcon} height={18} width={18} />
                                                                        : null
                                                                }
                                                            </TouchableOpacity>
                                                            :
                                                            <CustomInput
                                                                onValidation={onValidation}
                                                                placeholder={x.title}
                                                                style={[profileStyles.defaultInputArea(props.activeTheme, x.field, state)]}
                                                                value={x.value}
                                                                datavalue={x.value}
                                                                onChangeHandler={(value) => onChangeHandler(x.field, value)}
                                                                pattern={x.pattern}
                                                                name={x.field}
                                                                parentState={state}
                                                                allFieldsValid={state.email.length > 0 && state.fname.length > 0 && state.lname.length > 0 && state.mobile.length > 0 && state.dob.length > 0 && state.isValid ? true : false}
                                                                onFocus={() => setState({ ...state, focusedField: x.field })}
                                                                editable={x.field === "mobile" ? false : (!state.isValid && state.focusedField !== x.field) ? false : true}
                                                                maxLength={x.maxLength}
                                                            />
                                                    }
                                                    {errorsUI.errorMessageUi(x.value, state.focusedField, x.field, x.validationerror, state.isValid)}
                                                </View>
                                            ))
                                            :
                                            <ChangePassword
                                                parentState={state}
                                                onValidation={onValidation}
                                                onChangeHandler={onChangeHandler}
                                                styles={[profileStyles.defaultInputArea(props.activeTheme, state.focusedField, state)]}
                                                activeTheme={props.activeTheme}
                                                onFocus={field => setState({ ...state, focusedField: field })}
                                                handleIsValidFromChangePsw={handleIsValidFromChangePsw}
                                            />

                                    }
                                </View>
                            </View>
                        </ScrollView>
                        <TouchableOpacity
                            style={{
                                backgroundColor: state.activeTab === 0 ? state.isValid && !editProfileBool ? props.activeTheme.default : props.activeTheme.lightGrey
                                    : state.isValid && !editPasswordeBool ? props.activeTheme.default : props.activeTheme.lightGrey,
                                justifyContent: "flex-end",
                                alignItems: 'center',
                                paddingVertical: 20
                            }}
                            onPress={onSavePress}
                            disabled={state.isValid && state.activeTab === 0 ? editProfileBool : editPasswordeBool}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ color: '#fff' }}>
                                    Save
                            </Text>
                                <View style={{ paddingLeft: 20 }} >
                                    <SvgXml xml={nextIcon} height={20} width={20} />
                                </View>
                            </View>
                        </TouchableOpacity>
                        {/* {
                            state.calanderOpened &&
                            <View style={{ flex: 1 }}>
                                <CustomCalendar
                                    activeTheme={props.activeTheme}
                                    onSelectDateHandler={date => {
                                        toggleModal();
                                        date.dateString = moment(date.dateString).format("DD/MM/YYYY");
                                        onChangeHandler('dob', date.dateString);
                                    }}
                                    toggleModal={toggleModal}
                                    visible={state.calanderOpened}

                                />
                            </View>

                        } */}
                    </View>
                    <CustomImageView
                        key={0}
                        imageIndex={0}
                        imagesArr={[{
                            uri: state.picture
                        }]}
                        visible={state.isImageViewOpen}
                        onRequestClose={() => setState(pre => ({ ...pre, isImageViewOpen: !pre.isImageViewOpen }))}
                        swipeToCloseEnabled={true}
                    />
                </KeyboardAvoidingView>
            </View>
        </ImageBackground>
    )
};

const profileStyles = StyleSheet.create({
    defaultInputArea: (activeTheme, currentField, state) => ({
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: (state.focusedField === currentField && !state.isValid) ? activeTheme.validationRed : state.focusedField === currentField ? activeTheme.default : 'rgba(0,0,0,0.1)',
        paddingVertical: 0,
        height: 50,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: currentField === "mobile" ? activeTheme.disabledFieldColor : (!state.isValid && state.focusedField !== currentField) ? activeTheme.disabledFieldColor : "#fff"

    }),
});
const mapStateToProps = (store) => {
    return {
        U: store.userReducer,
    }
};
export default connect(mapStateToProps)(Profile);


// <ImageBackground source={{ uri: state.picture }} resizeMode="cover" style={{ height: 90, width: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }} onLoadEnd={() => setState(prevState => ({ ...prevState, isLoading: false }))}>
// <Spinner isVisible={state.isLoading} size={30} type="Circle" color={props.activeTheme.default} />
// </ImageBackground>