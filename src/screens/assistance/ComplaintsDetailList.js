import React, { useState, Fragment, useEffect, useCallback, createRef } from 'react';
import { View, Text, ImageBackground, Alert, ScrollView, Image, TextInput, Platform, Dimensions, KeyboardAvoidingView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Container } from 'native-base';
import doodleImg from '../../assets/doodle.png';
import CustomHeader from '../../components/header/CustomHeader';
import complaintFeedbackStyles from './complaintsFeedbackStyles';
import svgIcons from '../../assets/svgIcons/feedbackComplaints';
import commonSvgIcons from '../../assets/svgIcons/common/common';
import { openModalAction, closeModalAction, showHideImageViewAction } from '../../redux/actions/modal';
import ContactUsModal from '../../components/modals/ContactUsContent';
import { getRequest, postRequest } from '../../services/api';
import { renderPicture, sharedLounchCameraOrGallary, sharedOpenModal } from '../../utils/sharedActions';
import moment from 'moment';
import plateformSpecific from '../../utils/plateformSpecific';
import jovi_admin_logo from '../../assets/Common/jovi_admin.png';
import { SvgXml } from 'react-native-svg';
import CustomToast from '../../components/toast/CustomToast';
import commonStyles from '../../styles/styles';
import modalCam from '../../assets/profile/camera.svg';
import { DEVICE_WIN_WIDTH, EMPTY_PROFILE_URL } from '../../config/config';
import { sendIcon } from '../../assets/svgIcons/customerorder/riderallocated';
import { sharedConfirmationAlert } from '../../utils/sharedActions';
// import { Rating } from 'react-native-ratings';

export const TakePicturesModalView = ({ parentProps, handlers }) => (
    <View style={{ flex: 1, width: DEVICE_WIN_WIDTH, padding: 30, justifyContent: 'space-between' }}>
        <SvgXml xml={modalCam} height={40} width={40} style={{ alignSelf: 'center' }} />
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: parentProps.activeTheme.default, paddingVertical: 15, borderRadius: 5 }}
            onPress={() => {
                sharedLounchCameraOrGallary(1, () => { }, picData => {
                    handlers.getImageHandler(picData);
                    parentProps.dispatch(closeModalAction());
                })
            }}
        >
            <Text style={commonStyles.fontStyles(14, parentProps.activeTheme.white, 3, 'bold')}>{"Take a photo"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: parentProps.activeTheme.validationRed, paddingVertical: 15, borderRadius: 5 }}
            onPress={() => {
                sharedLounchCameraOrGallary(0, () => { }, picData => {
                    handlers.getImageHandler(picData);
                    parentProps.dispatch(closeModalAction());
                })
            }}
        >
            <Text style={commonStyles.fontStyles(14, parentProps.activeTheme.white, 3, 'bold')}>{"Choose from gallary"}</Text>
        </TouchableOpacity>
    </View>
);

const ComplaintDetailsList = props => {
    // console.log("ComplaintDetailsList.props :", props);
    // console.log("Platefor :", Platform.Version);
    // console.log('Moment :', moment());
    // console.log('Moment Bool :', moment("13/08/2020", 'dd/MM/yyyy').format("DD/MM/YYYY"))
    let initState = {
        "commentMsg": "",
        "isFocused": false,
        "btnLoader": false,
        "singleComplaint": {
            "description": "",
            "statusID": "",
            "complaintID": "",
            "complaintDate": "",
            "statusName": "",
            "complaintDetail": [],
            "isAdmin": false,
            "user": "",
            "complaintPicsList": []
        }
    };
    const [state, setState] = useState(initState);
    const [images, setImages] = useState([]);
    const { navigation, dispatch, activeTheme, behavior } = props;
    const commentsScrollRef = createRef(null);
    const parentScrollRef = createRef(null);
    let getNavigationState = navigation.dangerouslyGetState();
    let _screenParams = getNavigationState.routes[getNavigationState.index].state.routes[getNavigationState.routes[getNavigationState.index].state.index].params
    console.log("ComplaintDetailsList._screenParams", _screenParams);
    // debugger;
    const renderImages = ({ showCrossIcons, position, data }) => {
        return <View style={{ flexDirection: 'row', position }}>
            {(data || []).map((img, index) => (
                <View key={index} style={{ borderRadius: 5, borderWidth: 0.5, borderColor: activeTheme.black, margin: 3 }}>
                    <TouchableOpacity onPress={() => props.dispatch(showHideImageViewAction({ key: 0, imageIndex: 0, imagesArr: [{ uri: img?.uri || renderPicture(img, props.user.tokenObj.token.authToken) }], visible: true, onRequestClose: () => dispatch(showHideImageViewAction({})), swipeToCloseEnabled: true }))}>
                        <Image source={{ uri: img?.uri || renderPicture(img, props.user.tokenObj.token.authToken) }} style={{ height: 50, width: 50, margin: 5, borderRadius: 5 }} />
                    </TouchableOpacity>
                    {
                        showCrossIcons ?
                            <View style={{ position: 'absolute', left: 42 }}>

                                <TouchableOpacity style={{ alignSelf: 'flex-end', backgroundColor: activeTheme.white, height: 15, width: 15, borderRadius: 7, alignItems: 'center', justifyContent: 'center', elevation: 3 }}
                                    onPress={() => discardImgHandler(img.id)}
                                >
                                    <Text style={[commonStyles.fontStyles(16)]}>
                                        ×
</Text>
                                </TouchableOpacity>
                            </View>
                            : null
                    }
                </View>
            ))}
        </View>
    };
    const userIconUI = obj => (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', margin: 5 }}>
            <Text style={{ paddingRight: 10 }}>{obj.user}</Text>
            <Image source={{ uri: obj.profilePicture ? renderPicture(obj.profilePicture, props.user.tokenObj.token.authToken) : EMPTY_PROFILE_URL }} style={{ height: 30, width: 30, borderRadius: 15 }} />
        </View>
    );
    const adminIconUi = obj => (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', margin: 5 }}>
            <Image source={jovi_admin_logo} style={{ height: 30, width: 30, borderRadius: 15 }} />
            <Text style={{ paddingLeft: 10 }}>{obj.user}</Text>
        </View>
    );


    const getImageHandler = picData => {
        // console.log('imgData :', imgData);
        images.push({
            uri: Platform.OS === 'android' ? picData.uri : picData.uri.replace("file://", ""),
            name: picData.uri.split('/').pop(),
            type: picData.type,
            id: images.length + 1
        })
        setImages([...images]);
    };
    const discardImgHandler = imgID => {
        let modifiedImages = images.filter(row => row.id !== imgID);
        setImages([...modifiedImages]);
    };
    const openContactUsModal = rec => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: toggleModalHandler,
            ModalContent: (<ContactUsModal activeTheme={activeTheme} complaintID={rec.complaintID} />),
            modalFlex: 3,
            modelViewPadding: 0
        };
        dispatch(openModalAction(ModalComponent));
    }
    const toggleModalHandler = () => {
        dispatch(closeModalAction());
    }
    const goToBackScreen = () => {
        navigation.navigate(_screenParams?.backScreenObj?.container, {
            screen: _screenParams?.backScreenObj?.screen,
            params: {
                dataParams: {
                    orderID: _screenParams.dataParams.orderID,
                },
                parentScreenState: {
                    activeTab: 1
                }
            }
        });
    };
    const dateUI = i => {
        // console.log("Client Date :", moment().format("MMM D, YYYY"));
        // console.log("DB Date :", state.singleComplaint.complaintDetail[i].dateTime)
        return <View style={{ padding: i > 0 ? 10 : 0, justifyContent: 'center', alignItems: 'center' }}>
            {/*  backgroundColor: "#ebe2ed" */}
            <Text style={{ backgroundColor: activeTheme.grey, borderRadius: 5, padding: 10, textAlign: "center", color: activeTheme.white }}>
                {
                    state.singleComplaint.complaintDetail[i] !== undefined && state.singleComplaint.complaintDetail[i].dateTime === moment().subtract(1, "day").format("MMM D, YYYY") ? "YESTERDAY" :
                        moment().format("MMM D, YYYY") === state.singleComplaint.complaintDetail[i].dateTime ?
                            "TODAY" :
                            state.singleComplaint.complaintDetail[i].dateTime
                }
            </Text>
        </View>
    };
    const onSuccessHandler = response => {
        // console.log("Legal.onSuccessHandler ----", response);
        if (response.data.statusCode === 200) {
            setState(prevState => ({ ...prevState, singleComplaint: response.data.getComplaintsByID }));
            // console.log('_screenParams :', _screenParams);
            if (_screenParams?.dataParams?.cb) {
                _screenParams?.dataParams?.cb();
                // sharedOpenModal({
                //     dispatch: dispatch, visible: true, transparent: true, modalHeight: 200, modelViewPadding: 0,
                //     ModalContent: <RatingsModal {...props} targetRecord={_screenParams.dataParams.targetRecord} activeTheme={props.activeTheme} showDetails={false} />, okHandler: () => { }, onRequestCloseHandler: () => { }, androidKeyboardExtraOffset: 0
                // })
            }
        }
    };
    const onErrorHandler = error => console.log("Legal.onErrorHandler ----", error);
    const addCommentHandler = ({ pictures }) => {
        state.singleComplaint.complaintDetail.push({
            complaintDetailID: !state.singleComplaint.complaintDetail.length ? 0 : state.singleComplaint.complaintDetail[state.singleComplaint.complaintDetail.length - 1].complaintDetailID + 1,
            complaintID: state.singleComplaint.complaintID,
            dateTime: moment().format("MMM D, YYYY"),
            time: moment().format("hh:mm"),
            description: state.commentMsg,
            isAdmin: false,
            user: props.user.firstName + " " + props.user.lastName,
            profilePicture: props.user.picture ? props.user.picture : null,
            complaintPicsList: pictures,
            complaintDateTime: moment().format("DD/MM/YYYY HH:mm")
        });
        setState({ ...state, commentMsg: "" });
        setImages([]);
        let formData = new FormData();
        formData.append("complaintID", state.singleComplaint.complaintID);
        formData.append("description", state.commentMsg);
        formData.append("ComplaintDateTime", moment().format("DD/MM/YYYY HH:mm"));
        formData.append("isAdmin", false);
        if (pictures.length) {
            for (let index = 0; index < pictures.length; index++) {
                formData.append("PictureList", pictures[index])
            }
        }
        // postRequest(`/api/Menu/Complaint/ComplainDetail${(state.singleComplaint.complaintDetail.length === 25 || state.singleComplaint.complaintDetail.length === 26 || state.singleComplaint.complaintDetail.length === 28 || state.singleComplaint.complaintDetail.length === 30 || state.singleComplaint.complaintDetail.length === 31 || state.singleComplaint.complaintDetail.length === 33 || state.singleComplaint.complaintDetail.length === 35) ? "ss" : "s"}`,
        postRequest(`/api/Menu/Complaint/ComplainDetails`,
            formData,
            { headers: { 'content-type': 'multipart/form-data' } },
            dispatch,
            res => {
                if (res) {
                    // console.log("res success case :", state.singleComplaint);
                    commentsMiddleWare({ complaintDetailID: state.singleComplaint.complaintDetail[state.singleComplaint.complaintDetail.length - 1].complaintDetailID, loading: false, isError: false });
                }
            },
            err => {
                // debugger;
                if (err) {
                    console.log(err)
                    if (err.errors) {
                        CustomToast.error(err.errors.Description[0]);
                    } else {
                        commentsMiddleWare({ complaintDetailID: state.singleComplaint.complaintDetail[state.singleComplaint.complaintDetail.length - 1].complaintDetailID, loading: false, isError: true });
                        // console.log("addUpdateErrorProp error case :", addUpdateErrorProp);
                    }
                }
            },
            '',
            false
        );
    };
    const commentsMiddleWare = args => {
        let addUpdateErrorProp = state.singleComplaint.complaintDetail.map(row => {
            if (row.complaintDetailID === args.complaintDetailID) {
                row.isError = args.isError;
                row.loading = args.loading;
                row.sentMsg = args?.sentMsg
            }
            return row;
        });
        setState(pre => ({
            ...pre,
            singleComplaint: {
                ...pre.singleComplaint,
                complaintDetail: addUpdateErrorProp
            }
        }));
    };
    const retryHandler = commentObj => {
        console.log('[retryHandler] commentObj:', commentObj);
        commentsMiddleWare({ complaintDetailID: commentObj.complaintDetailID, loading: true, isError: false });
        let formData = new FormData();
        formData.append("complaintID", commentObj.complaintID);
        formData.append("description", commentObj.description);
        formData.append("ComplaintDateTime", commentObj.complaintDateTime);
        formData.append("isAdmin", false);
        if (commentObj.complaintPicsList.length) {
            for (let index = 0; index < commentObj.complaintPicsList.length; index++) {
                formData.append("PictureList", commentObj.complaintPicsList[index])
            }
        }
        postRequest(`/api/Menu/Complaint/ComplainDetails`,
            formData,
            { headers: { 'content-type': 'multipart/form-data' } },
            dispatch,
            res => {
                if (res) {
                    commentsMiddleWare({ complaintDetailID: commentObj.complaintDetailID, loading: false, isError: false, sentMsg: 'sent' });
                    setTimeout(() => {
                        commentsMiddleWare({ complaintDetailID: commentObj.complaintDetailID, loading: false, isError: false, sentMsg: '' });
                    }, 3000);
                }
            },
            err => {
                // debugger;
                if (err) {
                    console.log(err)
                    if (err.errors) {
                        CustomToast.error(err.errors.Description[0]);
                    } else {
                        // console.log("addUpdateErrorProp error case :", addUpdateErrorProp);
                        commentsMiddleWare({ complaintDetailID: commentObj.complaintDetailID, loading: false, isError: true });
                    }
                }
            },
            '',
            false
        );
    };

    const solveComplaintHandler = () => {
        sharedConfirmationAlert("Confirm", "Are you sure you want to close this complaint?",
            () => {
                let formData = new FormData();
                formData.append("complaintID", state.singleComplaint.complaintID);
                formData.append("rating", 0);
                formData.append("statusID", 2);
                formData.append("description", null);
                formData.append("orderID", 0);
                formData.append("assistance", null);
                postRequest(`/api/Order/Complaint/AddOrUpdate`,
                    formData,
                    { headers: { 'content-type': 'multipart/form-data' } },
                    dispatch,
                    res => {
                        if (res) {
                            console.log("[solveComplaintHandler] Response :", res);
                            goToBackScreen();
                            CustomToast.success("Complaint closed successfully")
                        }
                    },
                    err => {
                        if (err) {
                            console.log("[solveComplaintHandler] error :", err)

                        }
                    },
                    '',
                    false,
                    smloaderBool => setState(pre => ({ ...pre, btnLoader: smloaderBool }))
                );
            },
            () => { },
            "No",
            "Yes")
    };
    const handleCommentsUI = (commentObj, i) => {
        // console.log(state.singleComplaint.complaintDetail[i - 1] !== undefined && state.singleComplaint.complaintDetail[i + 1] !== undefined && state.singleComplaint.complaintDetail[i - 1].isAdmin && state.singleComplaint.complaintDetail[i + 1].isAdmin && !state.singleComplaint.complaintDetail[i].isAdmin ? state.singleComplaint.complaintDetail[i] : "Not found")
        let arr = [];
        if (!commentObj?.isAdmin) {
            arr.push((
                <Fragment key={commentObj.complaintDetailID + 1}>
                    {
                        i === 0 ? dateUI(i)
                            :
                            state.singleComplaint.complaintDetail[i] !== undefined && state.singleComplaint.complaintDetail[i - 1] !== undefined &&
                            state.singleComplaint.complaintDetail[i].dateTime !== state.singleComplaint.complaintDetail[i - 1].dateTime &&
                            dateUI(i)
                    }
                    {
                        i === 0 && state.singleComplaint.complaintDetail[i] !== undefined && !state.singleComplaint.complaintDetail[i]?.isAdmin ?
                            userIconUI(commentObj)
                            :
                            state.singleComplaint.complaintDetail[i - 1] !== undefined && state.singleComplaint.complaintDetail[i - 1]?.isAdmin ?
                                userIconUI(commentObj)
                                :
                                null

                    }
                    <View style={{ flex: 1, borderRadius: 2, borderColor: '#707070', borderWidth: 0.2, margin: 7, backgroundColor: activeTheme.disabledFieldColor }}>
                        <View>
                            {renderImages({ showCrossIcons: false, position: 'relative', data: commentObj?.complaintPicsList })}
                        </View>
                        <View style={{ padding: 5, justifyContent: 'space-between', flexDirection: 'row' }}>
                            <Text style={[complaintFeedbackStyles.fontStyles(12, '#000000', 1), { textAlign: 'justify', flex: 4 }]}>{commentObj.description}</Text>
                        </View>
                        {
                            commentObj?.isError ?
                                <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {
                                        commentObj.loading ?
                                            <ActivityIndicator size="small" color={activeTheme.default} />
                                            :
                                            <TouchableOpacity onPress={() => retryHandler(commentObj)}>
                                                <Text style={[{ ...complaintFeedbackStyles.fontStyles(12, activeTheme.validationRed, 1) }, { opacity: 0.5 }]}>Tap to retry</Text>
                                            </TouchableOpacity>
                                    }
                                    <Text style={[{ ...complaintFeedbackStyles.fontStyles(12, '#000000', 1) }, { opacity: 0.5, textAlign: "right" }]}>{commentObj.time}</Text>
                                </View>
                                :
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
                                    <Text style={[{ ...complaintFeedbackStyles.fontStyles(16, '#000000', 1) }, { opacity: 0.5, padding: 5 }]}>{commentObj?.sentMsg || ""}</Text>
                                    <Text style={[{ ...complaintFeedbackStyles.fontStyles(12, '#000000', 1) }, { opacity: 0.5, padding: 5 }]}>{commentObj.time}</Text>
                                </View>
                        }
                    </View>
                </Fragment>

            ))
        } else {
            arr.push(
                <Fragment key={commentObj.complaintDetailID + 1}>
                    {
                        i === 0 ? dateUI(i)
                            :
                            state.singleComplaint.complaintDetail[i] !== undefined && state.singleComplaint.complaintDetail[i - 1] !== undefined &&
                            state.singleComplaint.complaintDetail[i].dateTime.split(" ")[0] !== state.singleComplaint.complaintDetail[i - 1].dateTime.split(" ")[0] &&
                            dateUI(i)
                    }
                    {
                        state.singleComplaint.complaintDetail[i - 1]?.isAdmin !== undefined && !state.singleComplaint.complaintDetail[i - 1]?.isAdmin ?
                            adminIconUi(commentObj)
                            :
                            null
                    }
                    <View style={{ flex: 1, borderRadius: 2, borderColor: '#707070', borderWidth: 0.2, margin: 7, backgroundColor: '#fff' }}>
                        <View>
                            {renderImages({ showCrossIcons: false, position: 'relative', data: commentObj?.complaintPicsList })}
                        </View>
                        <View style={{ margin: 5 }}>
                            <Text style={{ ...complaintFeedbackStyles.fontStyles(12, '#000000', 1) }}>{commentObj.description}</Text>
                            <View style={{ padding: 5 }}>
                                <Text style={[{ ...complaintFeedbackStyles.fontStyles(12, '#000000', 1) }, { opacity: 0.5, textAlign: 'right' }]}>{commentObj.time}</Text>
                            </View>
                        </View>
                    </View>
                </Fragment >

            )
        }
        return arr;
    };
    useEffect(useCallback(() => {
        console.log('Complaint details useEffect called----');
        getRequest(`/api/Menu/Complaint/${_screenParams?.complaintID}`, {}, dispatch, onSuccessHandler, onErrorHandler);
        return () => {
            console.log('Complaint details state cleared----');
            setState(initState);
        }
    }, []), []);
    console.log('ComplaintsDetailsState:---- :', state);
    return (
        <Container style={{ ...activeTheme.container }}>
            <ImageBackground source={doodleImg} style={complaintFeedbackStyles.backgroundImg}>
                <CustomHeader
                    leftIconHandler={goToBackScreen}
                    rightIconHandler={() => Alert.alert('Right icon clicked')}
                    navigation={navigation}
                    leftIcon={svgIcons.backIcon(activeTheme)}
                    bodyContent={'Complaints'}
                    rightIcon={null}
                    activeTheme={activeTheme}
                    styles={{ paddingBottom: plateformSpecific(20, 0) }}
                />
                <KeyboardAvoidingView behavior={behavior} style={{ flex: 1 }}>
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <View style={{ flex: state.singleComplaint.statusID === 2 ? 0 : state.singleComplaint?.complaintDetail.length ? 1 : 0, backgroundColor: "#FFFFFF", borderRadius: 10 }}>
                            <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{ marginHorizontal: 20 }} ref={parentScrollRef}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', top: 10 }}>
                                    <Text style={{ ...complaintFeedbackStyles.fontStyles(16), left: 7 }}>Complaint No# {state.singleComplaint.complaintID}</Text>
                                    <Text style={{ ...complaintFeedbackStyles.fontFaimlyRegular, color: state.singleComplaint.statusID === 2 ? "#46E54B" : '#E35555', fontSize: 12 }}>{state.singleComplaint.statusName}</Text>
                                </View>
                                <View>
                                    <View style={{ marginVertical: 10 }}>
                                        <Text style={[complaintFeedbackStyles.fontStyles(16, '#000000', 2), { margin: 7 }]}>
                                            {state.singleComplaint.description.trim()}
                                        </Text>
                                        <View>
                                            {renderImages({ showCrossIcons: false, data: state.singleComplaint?.complaintPicsList, position: "relative" })}
                                        </View>
                                    </View>
                                    {
                                        state.singleComplaint.statusID === 2 ?
                                            <View style={{ paddingTop: 7 }}>
                                                <Text>Assistance:</Text>
                                                <Text style={{ ...complaintFeedbackStyles.fontStyles(14, '#000000', 2), marginLeft: 3, textAlign: 'justify' }}>{state.singleComplaint.assistance !== "null" ? state.singleComplaint.assistance : ""}</Text>
                                            </View>
                                            : null
                                    }
                                    {
                                        state.singleComplaint.statusID === 1 ?
                                            <View style={{ maxHeight: 400, marginVertical: 10, borderRadius: 5, borderColor: '#707070', borderWidth: 0.2 }}>
                                                <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled ref={commentsScrollRef} onContentSizeChange={() => commentsScrollRef.current.scrollToEnd({ animated: true })}>
                                                    {
                                                        state.singleComplaint.complaintDetail.length ? <View style={{ paddingVertical: 5 }}>{state.singleComplaint.complaintDetail.map((item, i) => handleCommentsUI(item, i))}</View> : null
                                                    }
                                                </ScrollView>
                                                {
                                                    state.singleComplaint.complaintDetail.length ? <View style={{ borderBottomColor: props.activeTheme.lightGrey, borderBottomWidth: 1, margin: 5 }} /> : null
                                                }
                                                {renderImages({ showCrossIcons: true, position: 'relative', data: images })}
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <View style={{
                                                        flex: 3,
                                                        marginHorizontal: 10,
                                                    }}>
                                                        <TextInput
                                                            autoCompleteType="off"
                                                            multiline={true}
                                                            numberOfLines={2}
                                                            placeholder="Additional comment"
                                                            style={{ textAlignVertical: "center" }}
                                                            value={state.commentMsg}
                                                            onFocus={() => {
                                                                setState(pre => ({ ...pre, isFocused: true }))
                                                                parentScrollRef.current.scrollToEnd({ animated: true })
                                                            }}
                                                            onBlur={() => {
                                                                setState(pre => ({ ...pre, isFocused: false }))
                                                            }}
                                                            onChangeText={val => {
                                                                // debugger;
                                                                if (!state.commentMsg.length && !val.trimStart()) return CustomToast.error('Leading or trailing spaces are not allowed');
                                                                else if (!state.commentMsg.length && (val === "" || val === " ")) return;
                                                                else setState(pre => ({ ...pre, commentMsg: val }))
                                                            }} />
                                                    </View>
                                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: "space-around", paddingHorizontal: 5 }}>
                                                        <TouchableOpacity style={{}} onPress={() => {
                                                            if (images.length === 3) return CustomToast.error("You have reached the maximum allowed limit of attachments (3)")
                                                            else sharedOpenModal({ dispatch: props.dispatch, visible: true, transparent: true, modalHeight: 220, modelViewPadding: 0, ModalContent: <TakePicturesModalView parentProps={{ ...props }} handlers={{ getImageHandler }} />, okHandler: () => { }, onRequestCloseHandler: null, androidKeyboardExtraOffset: 0 })
                                                        }}>
                                                            <SvgXml xml={commonSvgIcons.smCamIcon()} height={20} width={20} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity disabled={(state.commentMsg.length || images.length) ? false : true} onPress={() => addCommentHandler({ pictures: images })} >
                                                            <SvgXml xml={sendIcon((state.commentMsg.length || images.length) ? props.activeTheme.default : props.activeTheme.grey)} height={20} width={20} />
                                                        </TouchableOpacity>

                                                    </View>
                                                </View>
                                            </View>
                                            :
                                            null
                                    }
                                </View>
                                {
                                    state.singleComplaint.statusID === 2 &&
                                    <TouchableOpacity style={complaintFeedbackStyles.footerContainer} onPress={() => openContactUsModal(state.singleComplaint)}>
                                        <View style={complaintFeedbackStyles.footerView}>
                                            <Text>
                                                Not Satisfied?
                                                <Text style={complaintFeedbackStyles.footerText(activeTheme)}> Contact Us</Text>
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                }
                            </ScrollView>

                        </View>
                        {
                            state.singleComplaint.statusID === 1 ?
                                <TouchableOpacity style={{ minWidth: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center', backgroundColor: activeTheme.default, paddingVertical: 20 }} onPress={solveComplaintHandler}>
                                    {
                                        state.btnLoader ? <ActivityIndicator size="small" color={activeTheme.white} /> :
                                            <Text style={{ ...complaintFeedbackStyles.fontStyles(16, '#FFFFFF', 4) }}>{'Close complaint'}</Text>
                                    }
                                </TouchableOpacity>
                                :
                                null
                        }
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        </Container >
    )
};

export default ComplaintDetailsList;



