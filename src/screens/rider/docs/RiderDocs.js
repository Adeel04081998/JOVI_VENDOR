import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { View, Text, Image, ScrollView, KeyboardAvoidingView, BackHandler, Platform, ImageBackground, StyleSheet, TouchableOpacity, Keyboard, Dimensions, Linking } from 'react-native';
import { userAction } from '../../../redux/actions/user';
import CustomHeader from '../../../components/header/CustomHeader';
import commonIcons from '../../../assets/svgIcons/common/common';
import cameraIcon from '../../../assets/profile/cam.svg';
import docsTab1Icon from '../../../assets/svgIcons/rider/docsTab1.svg';
import docsTab2Icon from '../../../assets/svgIcons/rider/docsTab2.svg';
import picUploadIcon from '../../../assets/svgIcons/rider/uploadIcon.svg';
import waitIcon from '../../../assets/svgIcons/rider/waitIcon.svg';
import errorIcon from '../../../assets/svgIcons/rider/errorIcon.svg';
import approvedIcon from '../../../assets/svgIcons/rider/approvedIcon.svg';
import doodleImg from '../../../assets/doodle.png';
import agentIcon from '../../../assets/svgIcons/rider/agent.svg';
import emailIcon from '../../../assets/svgIcons/common/at.svg';
import telIcon from '../../../assets/svgIcons/common/phone.svg';
import commonStyles from '../../../styles/styles';
import { CONTACT_EMAIL, CONTACT_NUMBER, EMPTY_PROFILE_URL } from "../../../config/config";
import plateformSpecific from '../../../utils/plateformSpecific';
import { useBackHandler } from '@react-native-community/hooks';
import { SvgXml } from 'react-native-svg';
import Spinner from 'react-native-spinkit';
import CustomToast from '../../../components/toast/CustomToast';
import { getRequest, postRequest } from '../../../services/api';
import { renderPicture, sharedImagePickerHandler, navigateWithResetScreen, sharedIsRiderApproved } from '../../../utils/sharedActions';
import ImageView from "react-native-image-viewing";
import crossIcon from "../../../assets/svgIcons/common/cross-new.svg";
import { styles as stylesCustomerOrder } from "../../customerorder/CustomerOrder";
import BottomAlignedModal from '../../../components/modals/BottomAlignedModal';
import { useNavigation } from '@react-navigation/native';




function RiderDocs({ navigation, route, userObj }) {

    // console.log(userObj);
    // console.log(userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken);

    const nav = useNavigation();

    const isRiderApproved = sharedIsRiderApproved(userObj);

    const dispatch = (route && route.params && route.params.dispatch) || null;
    const activeTheme = (route && route.params && route.params.activeTheme) || {};

    const picStatusIcon = {
        "1": waitIcon,
        "2": errorIcon,
        "3": approvedIcon,
    };

    const picTypeEnum = {
        "Photo": 1,
        "CNIC Front Side": 2,
        "CNIC Back Side": 3,
        "Vehicle Registration Book / Card": 4,
        "Driving License": 5
    };

    const initState = {
        loadedProfilePic: false,
        viewingProfilePic: false,
        activeTabIndex: 0,
        data: null,
        loadedPictures: {
            "CNIC Front Side": false,
            "CNIC Back Side": false,
            "Vehicle Registration Book / Card": false,
            "Driving License": false
        },
        viewingPictureIndex: -1,

        confirmUploadModalVisible: false,
        confirmUploadModalPicType: 0
    };

    const [state, setState] = useState(initState);

    console.log("-");
    console.log('DOCS_RIDER STATE :', state);


    useEffect(() => {

    }, [state]);

    useEffect(() => {
        if (isRiderApproved) {
            nav.navigate("rider_order_stack");
        }
        else if (state.data === null) {
            populateDataFromServer();
        }
    }, [isRiderApproved]);

    // BackHandler.addEventListener('hardwareBackPress', async () => {
    useBackHandler(async () => {
        return true;
    });

    const handleDismissKeyboardIOS = (event) => {
        event.persist();
        // console.log(event._targetInst.type);
        if (event._targetInst.type === "RCTMultilineTextInputView" || event._targetInst.type === "RCTSinglelineTextInputView") {
            //Dont Dismiss the keyboard if the target is a text field itself (to avoid keyboard's close and open fluctuation)
        }
        else {
            Keyboard.dismiss();
        }
    };

    const populateDataFromServer = () => {
        getRequest(
            'api/User/Rider/GetRiderPics',
            {},
            dispatch,
            (response) => {
                let fetchedData = response.data.riderPicsViewModel;

                setState((prevState) => ({
                    ...prevState,
                    data: fetchedData,
                }));
            },
            (error) => {
                console.log(((error?.response) ? error.response : {}), error);
                CustomToast.error('An Error Occcurred!');
            },
            ''
        );
    };

    const toggleActiveTab = (index) => {
        setState(prevState => ({
            ...prevState,
            activeTabIndex: index
        }));
    };

    const onUploadPressed = (pictureType) => {
        setState((prevState) => ({ ...prevState, confirmUploadModalVisible: true, confirmUploadModalPicType: pictureType }));
    };

    const onUploadConfirmed = (pictureType) => {
        sharedImagePickerHandler(() => { }, picData => uploadPicture(picData, pictureType));
        setState((prevState) => ({ ...prevState, confirmUploadModalVisible: false, confirmUploadModalPicType: 0 }));
    };

    const uploadPicture = (picData, pictureType) => {
        let formData = new FormData();

        formData.append("UserID", userObj.tokenObj.token.id);
        formData.append("Picture", {
            uri: Platform.OS === 'android' ? picData.uri : picData.uri.replace("file://", ""),
            name: picData.uri.split('/').pop(),
            type: picData.type
        });
        formData.append("UserPictureType", pictureType);

        postRequest(
            'api/User/RiderPictures',
            formData,
            { headers: { 'content-type': 'multipart/form-data' } },
            dispatch,
            (response) => {
                dispatch(userAction({ ...userObj, isLocalChange: true, picture: picData.uri, picStatus: 1, picStatusStr: "Pending" }));
                populateDataFromServer();
            },
            (error) => {
                console.log(((error?.response) ? error.response : {}), error);
                CustomToast.error('An Error Occcurred!');
            },
            true
        );
    };

    const onCloseConfirmUploadModal = () => {
        setState((prevState) => ({ ...prevState, confirmUploadModalVisible: false, confirmUploadModalPicType: 0 }));
    };

    const openDialerOrEmailClient = (type, text) => {
        (type === 1) ?
            Linking.openURL(`mailto:${text}`)
            :
            Linking.openURL(`tel:${text}`)
    };


    //EOF: End Of Functions


    const profilePictureObj = state?.data?.pictureList.filter((pObj) => pObj.userPictureType === picTypeEnum["Photo"])?.[0] || {};

    if (userObj?.tokenObj && !isRiderApproved) {
        return (
            <ImageBackground source={doodleImg} style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <CustomHeader
                        leftIconHandler={'toggle'}
                        rightIconHandler={() => { }}
                        navigation={navigation}
                        leftIcon={commonIcons.menueIcon(activeTheme)}
                        bodyContent={'Vehicle Information'}
                        rightIcon={null}
                        activeTheme={activeTheme}
                    />
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : null} onTouchStart={Platform.OS === "ios" ? handleDismissKeyboardIOS : null}>
                        <View style={{ flex: 1, backgroundColor: activeTheme.white, marginTop: plateformSpecific(55, 35), borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

                            <View style={{ height: 90, width: 90, borderRadius: 45, position: 'absolute', alignSelf: 'center', top: -40, zIndex: 1, backgroundColor: activeTheme.lightGrey, justifyContent: 'center', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => setState((prevState) => ({ ...prevState, viewingProfilePic: true }))}>
                                    <ImageBackground
                                        resizeMode="cover"
                                        style={{ height: 90, width: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
                                        onLoadStart={() => state.loadedProfilePic === true && setState(prevState => ({ ...prevState, loadedProfilePic: false }))}
                                        onLoadEnd={() => state.loadedProfilePic === false && setState(prevState => ({ ...prevState, loadedProfilePic: true }))}
                                        source={{
                                            uri: (profilePictureObj.picture ?
                                                renderPicture(profilePictureObj.picture, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
                                                :
                                                EMPTY_PROFILE_URL
                                            )
                                        }}
                                    >
                                        <Spinner isVisible={!state.loadedProfilePic} size={30} type="Circle" color={activeTheme.default} />

                                        {profilePictureObj.picture &&
                                            <ImageView
                                                images={[{
                                                    uri: renderPicture(profilePictureObj.picture, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
                                                }]}
                                                imageIndex={0}
                                                visible={state.viewingProfilePic}
                                                onRequestClose={() => setState((prevState) => ({ ...prevState, viewingProfilePic: false }))}
                                            />
                                        }
                                    </ImageBackground>
                                </TouchableOpacity>

                                {/* state.activeTabIndex === 0 && */
                                    ((profilePictureObj.picture) ?
                                        // <TouchableOpacity disabled={profilePictureObj.userPicStatus !== 1 ? false : true} onPress={profilePictureObj.userPicStatus !== 1 ? () => onUploadPressed(1) : () => { }} style={{ backgroundColor: activeTheme.white, position: 'absolute', zIndex: 2, left: 55, top: 60, borderRadius: 20, borderColor: activeTheme.white, borderWidth: 1, height: 35, width: 35, justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => onUploadPressed(1)} style={{ backgroundColor: activeTheme.white, position: 'absolute', zIndex: 2, left: 55, top: 60, borderRadius: 20, borderColor: activeTheme.white, borderWidth: 1, height: 35, width: 35, justifyContent: 'center', alignItems: 'center' }}>
                                            <SvgXml xml={picStatusIcon[profilePictureObj.userPicStatus]} height={20} width={20} />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => onUploadPressed(1)} style={{ backgroundColor: activeTheme.grey, position: 'absolute', zIndex: 2, left: 55, top: 60, borderRadius: 20, borderColor: activeTheme.white, borderWidth: 1, height: 35, width: 35, justifyContent: 'center', alignItems: 'center' }}>
                                            <SvgXml xml={cameraIcon} height={20} width={20} />
                                        </TouchableOpacity>
                                    )
                                }
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'center', zIndex: 1, top: 65, marginBottom: 40 }}>
                                {
                                    [docsTab1Icon, docsTab2Icon].map((icon, i) => (
                                        <TouchableOpacity key={i} onPress={() => toggleActiveTab(i)}>
                                            <View style={{ backgroundColor: "#7358be", borderRadius: 15, top: i !== state.activeTabIndex ? 7 : 0, height: state.activeTabIndex === i ? 60 : 45, width: state.activeTabIndex === i ? 60 : 45, justifyContent: 'center', alignItems: 'center', marginLeft: i > 0 ? 20 : 0, }}>
                                                <SvgXml xml={icon} height={i === 0 ? 29 : 22} width={i === 0 ? 29 : 22} />
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                }
                            </View>

                            <View style={{ paddingVertical: 20 }}>
                                <Text style={{ ...styles.caption, fontSize: 17, marginTop: 30, left: 20, marginBottom: 0 }}>{state.activeTabIndex === 0 ? "Vehicle Information" : "Request help"}</Text>
                            </View>

                            <ScrollView style={{ paddingHorizontal: 20, paddingBottom: 20, marginTop: 5 }}>
                                {state.activeTabIndex === 0 ?
                                    <View style={{ marginBottom: 15 }}>
                                        {[
                                            { pictureType: picTypeEnum["CNIC Front Side"], title: "CNIC Front Side" },
                                            { pictureType: picTypeEnum["CNIC Back Side"], title: "CNIC Back Side" },
                                            { pictureType: picTypeEnum["Vehicle Registration Book / Card"], title: "Vehicle Registration Book / Card" },
                                            { pictureType: picTypeEnum["Driving License"], title: "Driving License" },
                                        ].map((item, index) => {

                                            let pictureObj = null;
                                            if (state.data) {
                                                pictureObj = (state.data.pictureList || []).filter((pObj) => pObj.userPictureType === item.pictureType);
                                                pictureObj = (pictureObj && pictureObj[0]) ? pictureObj[0] : null;
                                                // pictureObj = null;
                                            }

                                            return (
                                                <View key={index} style={{ marginTop: index === 0 ? 0 : 20 }}>
                                                    <Text style={{ ...styles.caption, color: "#000", fontSize: 16, left: 0, marginVertical: 0, marginBottom: 10 }}>{item.title}</Text>

                                                    <View style={{ flexDirection: "row" }}>

                                                        {pictureObj &&
                                                            <TouchableOpacity onPress={() => setState((prevState) => ({ ...prevState, viewingPictureIndex: index }))} style={{ flexGrow: 0 }}>
                                                                <ImageBackground
                                                                    resizeMode="cover"
                                                                    style={{ height: 90, width: 90, borderRadius: 10 }}
                                                                    borderRadius={10}
                                                                    onLoadStart={() => state.loadedPictures[item.title] === true && setState(prevState => ({ ...prevState, loadedPictures: { ...prevState.loadedPictures, [item.title]: false } }))}
                                                                    onLoadEnd={() => state.loadedPictures[item.title] === false && setState(prevState => ({ ...prevState, loadedPictures: { ...prevState.loadedPictures, [item.title]: true } }))}
                                                                    source={{
                                                                        uri: renderPicture(pictureObj.picture, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
                                                                    }}
                                                                >
                                                                    <Spinner isVisible={!state.loadedPictures[item.title]} size={40} type="Circle" color={activeTheme.default} />

                                                                    <ImageView
                                                                        key={index}
                                                                        images={[{
                                                                            uri: renderPicture(pictureObj.picture, (userObj.tokenObj && userObj.tokenObj.token && userObj.tokenObj.token.authToken))
                                                                        }]}
                                                                        imageIndex={0}
                                                                        visible={state.viewingPictureIndex === index}
                                                                        onRequestClose={() => setState((prevState) => ({ ...prevState, viewingPictureIndex: -1 }))}
                                                                    />
                                                                </ImageBackground>
                                                            </TouchableOpacity>
                                                        }

                                                        <View style={{ flexGrow: 5 }}>
                                                            <TouchableOpacity onPress={() => onUploadPressed(item.pictureType)} style={{ width: 60, height: 60, zIndex: 100 }}>
                                                                <SvgXml style={{ marginTop: (pictureObj) ? 25 : 5, marginLeft: (pictureObj) ? 10 : 0 }} xml={picUploadIcon} height={38} width={38} />
                                                            </TouchableOpacity>
                                                        </View>

                                                        {pictureObj &&
                                                            <TouchableOpacity disabled={true} onPress={() => { }} style={{ marginTop: 6, width: 35, height: 60, zIndex: 100, flexGrow: 0 }}>
                                                                <SvgXml style={{ marginTop: (pictureObj) ? 25 : 5 }} xml={picStatusIcon[pictureObj.userPicStatus]} height={25} width={35} />
                                                            </TouchableOpacity>
                                                        }

                                                    </View>

                                                </View>
                                            );
                                        })}

                                        {state.data?.status &&
                                            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
                                                <TouchableOpacity disabled={true} onPress={() => { navigateWithResetScreen(null, [{ name: 'rider_order_stack', params: {} }]) }} style={{ ...styles.caption, marginVertical: 0, marginBottom: 10 }}>
                                                    <View style={{ backgroundColor: "#596066", width: 110, height: 40, borderRadius: 15 }}>
                                                        <Text style={{ color: "#fff", fontSize: 15, alignSelf: "center", top: 9 }}>{state.data.status}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        }
                                    </View>
                                    :
                                    <View style={{ marginBottom: 15 }}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <SvgXml xml={agentIcon} height={160} width={90} />
                                        </View>
                                        <View>
                                            <Text style={{ ...commonStyles.fontStyles(16, activeTheme.black, 4), marginTop: 10, textAlign: 'center', }}>How can we help you?</Text>
                                            <View style={{ paddingVertical: 10, marginHorizontal: 30 }}>
                                                <Text style={{ textAlign: 'justify' }}>
                                                    {"It looks like you are experiencing problems with our sign up process. We are here to help so please get in touch with us!"}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: "space-around", marginTop: 10 }}>
                                            {
                                                [
                                                    {
                                                        title: "Email us",
                                                        desc: CONTACT_EMAIL,
                                                        icon: emailIcon,
                                                        type: 1,
                                                    },
                                                    {
                                                        title: "Call to us",
                                                        icon: telIcon,
                                                        desc: CONTACT_NUMBER,
                                                        type: 2,
                                                    }
                                                ].map((row, i) => (
                                                    <View key={i} style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 150, width: 170, borderRadius: 20, elevation: 3, shadowOpacity: 0.5 }}>
                                                        <TouchableOpacity style={{ backgroundColor: activeTheme.default, borderRadius: 25, height: 50, width: 50, justifyContent: 'center', alignItems: 'center' }} onPress={() => openDialerOrEmailClient(row.type, row.desc)}>
                                                            <SvgXml xml={row.icon} height={30} width={30} />
                                                        </TouchableOpacity>
                                                        <Text style={{ top: 5, ...commonStyles.fontStyles(14, activeTheme.black, 4) }}>{row.title}</Text>
                                                    </View>
                                                ))
                                            }

                                        </View>
                                    </View>
                                }
                            </ScrollView>

                        </View>

                        {state.confirmUploadModalVisible &&
                            <BottomAlignedModal
                                visible={true}
                                transparent={true}
                                onRequestCloseHandler={onCloseConfirmUploadModal}
                                modalFlex={2.2}
                                centeredViewFlex={0}
                                modalHeight={260}
                                modelViewPadding={35}
                                androidKeyboardExtraOffset={35}
                                ModalContent={
                                    <>
                                        <View style={{ width: "100%" }}>
                                            <TouchableOpacity onPress={onCloseConfirmUploadModal} style={{ width: 25, height: 25, left: 30, top: -16, alignSelf: "flex-end" }}>
                                                <SvgXml xml={crossIcon} height={14} width={14} />
                                            </TouchableOpacity>

                                            <Text style={{ ...styles.caption, fontSize: 17, left: -15, marginVertical: 0, marginBottom: 5, top: -46 }}>
                                                {state.confirmUploadModalPicType === 1 ?
                                                    "Take a photo of yourself"
                                                    :
                                                    "Take a photo of your " + Object.keys(picTypeEnum)[state.confirmUploadModalPicType - 1]
                                                }
                                            </Text>

                                            <Text style={{ ...styles.caption, color: "#494949", fontSize: 16, left: -15, marginVertical: 0, marginBottom: 5, top: -46, marginTop: 10 }}>
                                                {state.confirmUploadModalPicType === 1 ?
                                                    "Take your picture properly in portrait view"
                                                    :
                                                    "Take picture of whole card in landscape view"
                                                }
                                                {" (include all corners). Make sure that picture is clear and all words are easily readable. If any of the information is blurry or too shiny (from camera flash), it will be rejected."}
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => onUploadConfirmed(state.confirmUploadModalPicType)}
                                            style={{ ...stylesCustomerOrder.appButtonContainer, width: Dimensions.get("window").width, position: "absolute", alignSelf: "center", bottom: 0 }}
                                        >
                                            <Text style={stylesCustomerOrder.appButtonText}>Take Photo</Text>
                                        </TouchableOpacity>
                                    </>
                                }
                            />
                        }

                    </KeyboardAvoidingView>
                </View>
            </ImageBackground>
        );
    }
    else {
        return (
            <View style={{ ...StyleSheet.absoluteFill, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: activeTheme.default, position: 'absolute' }}>
                <Spinner isVisible={true} size={100} type="WanderingCubes" color={activeTheme.white} style={{ marginBottom: 30 }} />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        alignSelf: 'stretch'
    },
    caption: {
        position: "relative",
        left: 10,
        fontSize: 15,
        color: '#7359BE',
        marginVertical: 10,
    }
});

const mapStateToProps = (store) => {
    return {
        // userObj: store.userReducer.reduxLoggedInUser
        userObj: store.userReducer
    }
};

export default connect(mapStateToProps)(RiderDocs);
