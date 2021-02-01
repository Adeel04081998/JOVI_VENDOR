// This is a temporary file which may include relavant legacy code related to Customer Order (which was previously used and was then removed)
// Please don't edit this file!

//----------------------------------------------------------------------------------------------

// A timeline component with a vertical line to the left and a circle with all headers

// import Timeline from 'react-native-timeline-flatlist';

// <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', top: -7, marginBottom: 5 }}>
//     <Timeline
//         style={{ height: 275, marginBottom: 0 }}
//         data={state.pitstops}
//         columnFormat="single-column-left"
//         circleColor={"#7359be"}
//         separator={false}
//         lineColor={"#7359be"}
//         showTime={false}
//         renderFullLine={false}
//         // titleStyle={{ bottom: 15 }}
//         // descriptionStyle={{ bottom: 12 }}
//         innerCircle="element"
//         listViewContainerStyle={{ width: '100%' }}
//         renderDetail={(item, index) =>
//             <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between" }}>
//                 <View style={{ flexDirection: "column", width: "80%" }}>
//                     <Text style={{ ...styles.caption, color: '#7359be', left: -0.5, top: -13, marginVertical: 0 }}>{"PitStop " + (index + 1)}</Text>

//                     <Text style={{ ...styles.caption, color: '#000', fontSize: 13, top: -13, left: 0, marginVertical: 0 }}>{item.title}</Text>

//                     <Text style={{ ...styles.caption, color: '#7f7f7f', fontSize: 13, top: -13, left: 0, marginVertical: 0 }}>{item.details.description}</Text>
//                 </View>
//                 <View style={{ top: -4, }}>
//                     <Switch
//                         key={index}
//                         trackColor={{ false: "#767577", true: "#46e54b"  /*"#7359be"*/ }}
//                         thumbColor={"#fff"}
//                         ios_backgroundColor="#767577" //"#3e3e3e"
//                         onValueChange={(value) => onSetAsPaymentPitstop(index)}
//                         value={item.isPaymentPitstop}
//                     />
//                 </View>
//             </View>
//         }
//     />
// </View>

//----------------------------------------------------------------------------------------------

// A backup of pitstops in Customer Order state, as they were added using the App

pitstops: [
    {
        "latitude": 33.64363527649992,
        "longitude": 73.06866740807891,
        "latitudeDelta": 0.0122,
        "longitudeDelta": 0.0068625000000000005,
        "title": "NA 60A, 7th Rd, Satellite Town, Rawalpindi, Punjab, Pakistan",
        "isDone": false,
        "details": {
            "buyForMe": true,
            "estCost": 2250,
            "description": "Go there!"
        },
        "isPaymentPitstop": false,
        "isPayElsewherePitstop": false
    },
    {
        "latitude": 33.64363527649992,
        "longitude": 73.06866740807891,
        "latitudeDelta": 0.0122,
        "longitudeDelta": 0.0068625000000000005,
        "title": "Home",
        "isDone": false,
        "details": {
            "buyForMe": true,
            "estCost": 2250,
            "description": "Go there!"
        },
        "isPaymentPitstop": false,
        "isPayElsewherePitstop": false
    },
    {
        "latitude": 33.65824972968349,
        "longitude": 73.07553118094802,
        "latitudeDelta": 0.0122,
        "longitudeDelta": 0.0068625000000000005,
        "title": "655 Service Rd South I 8, I-8/4 I 8/4 I-8, Islamabad, Islamabad Capital Territory, Pakistan",
        "isDone": false,
        "details": {
            "buyForMe": true,
            "estCost": 2050,
            "estTime": "00:08:00",
            "description": "Reach here! Reach here! Reach here! Reach here! Reach here! Reach here!"
        },
        "isPaymentPitstop": true,
        "isPayElsewherePitstop": false
    }
]

// finalDestObj: {
//     "latitude": 33.63369422234826,
//     "longitude": 73.0682479776442,
//     "latitudeDelta": 0.0122,
//     "longitudeDelta": 0.0068625000000000005,
//     "title": "Ali Mirza Barlas Rd, B-Block Block B Satellite Town, Rawalpindi, Punjab, Pakistan",
//     "isDone": false,
//     "details": {
//       "description": "Finally reach my home!",
//       "buyForMe": true,
//       "estCost": 3050,
//       "estTime": "00:07:00"
//     },
//     "isPaymentPitstop": false,
//     "isPayElsewherePitstop": false,
//     "isDestinationPitstop": true
// }

//----------------------------------------------------------------------------------------------

// Swipable element with left actions being animated/moved along while swiping 

// renderLeftActions={(progress, dragX) => {
//     const trans = dragX.interpolate({
//         inputRange: [0, 50, 100, 101],
//         outputRange: [-20, 0, 0, 1],
//         // inputRange: [-101, -100, -50, 0],
//         // outputRange: [1, -30, -20, -10],
//     });

//     console.log(progress, dragX, trans);

//     return (
//         <>
//             <Animated.View style={{ transform: [{ translateX: trans }] }}>
//                 <TouchableOpacity onPress={() => deletePitstop(index)} style={{ ...styles.appButtonContainer, elevation: 0, backgroundColor: "#D11A2A", height: "100%", justifyContent: "center" }}>
//                     <Text style={styles.appButtonText}>
//                         <SvgXml style={styles.svgTag} xml={CommonIcons.deleteIcon()} height={13} width={13} />
//                     </Text>
//                 </TouchableOpacity>
//             </Animated.View>

//             <Animated.View style={{ transform: [{ translateX: trans }] }}>
//                 <TouchableOpacity onPress={() => handleLocationSelected(null, null, index, null, false, "orderPitstopDetails")} style={{ ...styles.appButtonContainer, elevation: 0, backgroundColor: "#7359be", height: "100%", justifyContent: "center" }}>
//                     <Text style={styles.appButtonText}>
//                         <SvgXml style={styles.svgTag} xml={CommonIcons.editIcon()} height={17} width={17} />
//                     </Text>
//                 </TouchableOpacity>
//             </Animated.View>
//         </>
//     );
// }}

//----------------------------------------------------------------------------------------------

// TouchableHighlight having expand collapse (Show/Hide) feature

// onPress={() => {
//     showHideRefsInDragList.forEach((showHideRef, i) => {
//         if (i !== index) {
//             showHideRef.props.style.display = "none";
//             showHideRef.setNativeProps({ display: "none" });
//         }
//         else {
//             showHideRef.props.style.display = (showHideRef.props.style.display === "flex") ? "none" : "flex";
//             showHideRef.setNativeProps({ display: showHideRef.props.style.display });
//         }
//     });
// }}

{/* <Animated.View ref={ref => showHideRefsInDragList.push(ref)} style={{ display: "none" }}>
    {item.details && item.details.description &&
        <Text style={{ ...styles.caption, color: '#7f7f7f', fontSize: 13, top: 0, left: 25, marginVertical: 0 }}>
            <Text style={{ textDecorationLine: "underline" }}>Description</Text><Text>: </Text>
            {item.details && item.details.description}
        </Text>
    }

    <Text style={{ ...styles.caption, color: '#7f7f7f', fontSize: 13, top: 0, left: 25, marginVertical: 0 }}>
        <Text style={{ textDecorationLine: "underline" }}>Buy For Me</Text><Text>: </Text>
        {item.details && (item.details.buyForMe ? "Yes" : "No")}
    </Text>

    {item.details && item.details.buyForMe &&
        <Text style={{ ...styles.caption, color: '#7f7f7f', fontSize: 13, top: 0, left: 25, marginVertical: 0 }}>
            <Text style={{ textDecorationLine: "underline" }}>Estimated Amount</Text><Text>: Rs. </Text>
            {item.details && item.details.estCost}
        </Text>
    }

    {item.details && item.details.estTime &&
        <Text style={{ ...styles.caption, color: '#7f7f7f', fontSize: 13, top: 0, left: 25, marginVertical: 0 }}>
            <Text style={{ textDecorationLine: "underline" }}>Estimated Time</Text><Text>: </Text>
            {item.details && item.details.estTime}
        </Text>
    }
</Animated.View> */}

//----------------------------------------------------------------------------------------------

// (Taking Map Snapshot)

// mapRef.current.takeSnapshot({
//     format: "jpg",      // "png" | "jpg"
//     quality: 0.7,       // (0.1 - 1)
//     result: "base64"    // "file" | "base64"
// }).then((uri) => {
//     setState((prevState) => ({
//         ...prevState,
//         lastMapImage: "data:image/jpg;base64," + uri,
//         lastMapRegion: mapRef.current.__lastRegion
//     }));
// });

//----------------------------------------------------------------------------------------------

// (Previous State of Icons on Fields in "pitstops" mode)

/*
renderRightButton = {
    (mode === "pitstops") ?
    (isLast) ?
        () => {
            return (
                <View>
                    <TouchableOpacity style={{ ...styles.iconStyleLeft, right: (totalPitstops < 5) ? (totalPitstops <= 2 ? 30 : 55) : 30 }} onPress={handleAddPitstop}>
                        <Image style={styles.IcoImg} source={addIcon} />
                    </TouchableOpacity>
                    {totalPitstops > 2 &&
                        <TouchableOpacity style={{ ...styles.iconStyleRight, right: (totalPitstops < 5) ? 30 : 5 }} onPress={() => handleDeletePitstop(index)}>
                            <Image style={styles.IcoImg} source={deleteIcon} />
                        </TouchableOpacity>
                    }
                    {totalPitstops < 5 &&
                        <TouchableOpacity style={styles.iconStyleRight} onPress={() => handlePinLocationClicked(index)}>
                            <Image style={styles.IcoImg} source={locationIcon} />
                        </TouchableOpacity>
                    }
                </View>
            )
        }
        :
        (index === 0) ?
            () => {
                return (
                    <View>
                        <TouchableOpacity style={styles.iconStyleRight} onPress={() => handlePinLocationClicked(index)}>
                            <Image style={styles.IcoImg} source={locationIcon} />
                        </TouchableOpacity>
                    </View>
                )
            }
            :
            () => {
                return (
                    <View>
                        <TouchableOpacity style={styles.iconStyleLeft} onPress={() => handleDeletePitstop(index)}>
                            <Image style={styles.IcoImg} source={deleteIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconStyleRight} onPress={() => handlePinLocationClicked(index)}>
                            <Image style={styles.IcoImg} source={locationIcon} />
                        </TouchableOpacity>
                    </View>
                )
            }
    :
    (mode === "enterPitstop") ?
        () => { }
        :
        (mode === "pitstopDetails" || mode === "paymentPitstopDetails" || mode === "orderPitstopDetails") ?
            () => { }
            :
            null
}


styles={{
    textInput: {
        //some props here
        paddingHorizontal: 10,
        // paddingRight: mode === "pitstops" ? 56 : (mode === "enterPitstop" ? 30 : 15)
        // paddingRight: (mode === "pitstops" || mode === "enterPitstop") ? 56 : (mode === "pitstopDetails" ? 30 : 15)
        paddingRight: mode === "pitstops" ?
            // (index === 0) ? 33 : isLast ? 83 : 59
            (index === 0) ? (totalPitstops === 1 ? 59 : 33) : isLast ? (totalPitstops === 2 ? 59 : 83) : 59
            :
            (mode === "pitstopDetails" || mode === "paymentPitstopDetails" || mode === "enterPitstop" || mode === "orderPitstopDetails" ? 33 : 15)
    }
}}
*/

//----------------------------------------------------------------------------------------------

// (Previously used Final Destination Icon)

//<Marker identifier={"marker-dest"} coordinate={finalDestObj} anchor={{ x: 0.5, y: 1 }} style={{ zIndex: Platform.OS === "ios" ? (100 + (pitstops.length + 1)) : null }}>
//    <View style={{ ...styles.pitStopMarker, borderColor: "#000", borderRadius: 10 }}>
//        <SvgXml xml={finalDestIcon} width={26} height={26} />
//    </View>
//</Marker>

//----------------------------------------------------------------------------------------------

//----------Mudassir-------------//

// Complaints Details Bottom aligned Customer, admin icons full screen

// import React, { useState, Fragment, useEffect, useCallback, createRef } from 'react';
// import { View, Text, ImageBackground, Alert, ScrollView, Image, TextInput, Platform, Dimensions, KeyboardAvoidingView } from 'react-native';
// import { Container, Content } from 'native-base';
// import doodleImg from '../../assets/doodle.png';
// import CustomHeader from '../../components/header/CustomHeader';
// import complaintFeedbackStyles from './complaintsFeedbackStyles';
// import svgIcons from '../../assets/svgIcons/feedbackComplaints';
// import { TouchableOpacity } from 'react-native-gesture-handler';
// import { connect } from 'react-redux';
// import { openModalAction, closeModalAction } from '../../redux/actions/modal';
// import ContactUsModal from '../../components/modals/ContactUsContent';
// import CommentSubmitContent from '../../components/modals/CommentSubmitContent';
// import { getRequest, postRequest } from '../../services/api';
// import { recordsNotExistUI } from '../../utils/sharedActions';
// import moment from 'moment';
// import plateformSpecific from '../../utils/plateformSpecific';
// import jovi_admin_logo from '../../assets/Common/jovi_admin.png';
// import userIcon from '../../assets/profileIcon.png';
// // import { Rating } from 'react-native-ratings';
// const ComplaintDetailsList = props => {
//     // console.log("ComplaintDetailsList :", props)
//     // console.log('Moment :', moment());
//     // console.log('Moment Bool :', moment("13/08/2020", 'dd/MM/yyyy').format("DD/MM/YYYY"))
//     let initState = {
//         "commentMsg": "",
//         "singleComplaint": {
//             "description": "",
//             "statusID": "",
//             "complaintID": "",
//             "complaintDate": "",
//             "statusName": "",
//             "complaintDetail": [],
//             "isAdmin": false,
//             "user": ""
//         }
//     };
//     const [state, setState] = useState(initState);
//     const { navigation, dispatch, activeTheme, behavior } = props;
//     const commentsScrollRef = createRef(null);
//     const parentScrollRef = createRef(null);
//     // let activeTheme = theme.lightMode ? theme.lightTheme : theme.darkTheme;
//     let getNavigationState = navigation.dangerouslyGetState();
//     // debugger;
//     const openContactUsModal = rec => {
//         let ModalComponent = {
//             visible: true,
//             transparent: true,
//             okHandler: () => { },
//             onRequestCloseHandler: toggleModalHandler,
//             ModalContent: (<ContactUsModal activeTheme={activeTheme} complaintID={rec.complaintID} />),
//             modalFlex: 3,
//             modelViewPadding: 0
//         };
//         dispatch(openModalAction(ModalComponent));
//     }
//     const openCommentSubmitModal = () => {
//         let ModalComponent = {
//             visible: true,
//             transparent: true,
//             okHandler: toggleModalHandler,
//             onRequestCloseHandler: toggleModalHandler,
//             ModalContent: (<CommentSubmitContent
//                 activeTheme={activeTheme}
//                 title="Submitted Successfully"
//                 bodyMessage="lorem ipsum text"
//                 btnText="Done"
//                 iconXml={svgIcons.doneIcon}
//                 okHandler={toggleModalHandler}

//             />),
//         };
//         dispatch(openModalAction(ModalComponent));
//     };
//     const toggleModalHandler = () => {
//         dispatch(closeModalAction());
//     }
//     const leftIconHandler = () => {
//         navigation.navigate("complaints_feedback_container", { screen: "complaints_feedback" });
//     };
//     const dateUI = i => {
//         return <View style={{ padding: i > 0 ? 10 : 0, justifyContent: 'center', alignItems: 'center' }}>
//             <Text style={{ backgroundColor: "#ebe2ed", borderRadius: 5, padding: 10, textAlign: "center", color: activeTheme.default }}>{
//                 state.singleComplaint.complaintDetail[i].dateTime.split(" ")[0]
//             }</Text>
//         </View>
//     };
//     const userIconUI = obj => (
//         <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', margin: 5 }}>
//             <Text style={{ paddingRight: 10 }}>{obj.user}</Text>
//             <Image source={userIcon} style={{ height: 30, width: 30 }} />
//         </View>
//     );
//     const adminIconUi = obj => (
//         <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', margin: 5 }}>
//             <Image source={jovi_admin_logo} style={{ height: 30, width: 30 }} />
//             <Text style={{ paddingLeft: 10 }}>{obj.user}</Text>
//         </View>
//     )
//     const handleCommentsUI = (commentObj, i) => {
//         // console.log(state.singleComplaint.complaintDetail[i - 1] !== undefined && state.singleComplaint.complaintDetail[i + 1] !== undefined && state.singleComplaint.complaintDetail[i - 1].isAdmin && state.singleComplaint.complaintDetail[i + 1].isAdmin && !state.singleComplaint.complaintDetail[i].isAdmin ? state.singleComplaint.complaintDetail[i] : "Not found")
//         let arr = [];
//         if (!commentObj.isAdmin) {
//             arr.push((
//                 <Fragment key={commentObj.complaintDetailID + 1}>
//                     {
//                         i === 0 ? dateUI(i)
//                             :
//                             state.singleComplaint.complaintDetail[i] !== undefined && state.singleComplaint.complaintDetail[i - 1] !== undefined &&
//                             state.singleComplaint.complaintDetail[i].dateTime.split(" ")[0] !== state.singleComplaint.complaintDetail[i - 1].dateTime.split(" ")[0] &&
//                             dateUI(i)
//                     }
//                     <View style={{ flex: 1, borderRadius: 2, borderColor: '#707070', borderWidth: 0.2, margin: 7, backgroundColor: activeTheme.disabledFieldColor }}>
//                         <View style={{ padding: 5, justifyContent: 'space-between', flexDirection: 'row' }}>
//                             <Text style={[complaintFeedbackStyles.fontStyles(12, '#000000', 1), { textAlign: 'justify', flex: 4 }]}>{commentObj.description}</Text>
//                         </View>
//                         <View style={{ padding: 5 }}>
//                             <Text style={[{ ...complaintFeedbackStyles.fontStyles(12, '#000000', 1) }, { opacity: 0.5, textAlign: 'right' }]}>{commentObj.dateTime.split(" ")[1]}</Text>
//                         </View>
//                     </View>
//                     {
//                         i === state.singleComplaint.complaintDetail.length - 1 && state.singleComplaint.complaintDetail[state.singleComplaint.complaintDetail.length - 1] !== undefined && !state.singleComplaint.complaintDetail[state.singleComplaint.complaintDetail.length - 1].isAdmin ?
//                             userIconUI(commentObj)
//                             :
//                             state.singleComplaint.complaintDetail[i - 1] !== undefined && state.singleComplaint.complaintDetail[i] !== undefined && state.singleComplaint.complaintDetail[i + 1] !== undefined &&
//                                 state.singleComplaint.complaintDetail[i - 1].isAdmin && !state.singleComplaint.complaintDetail[i].isAdmin && state.singleComplaint.complaintDetail[i + 1].isAdmin ?
//                                 userIconUI(commentObj)
//                                 :
//                                 state.singleComplaint.complaintDetail[i - 1] !== undefined &&
//                                     state.singleComplaint.complaintDetail[i].isAdmin !== state.singleComplaint.complaintDetail[i - 1].isAdmin ?
//                                     null
//                                     :
//                                     state.singleComplaint.complaintDetail[i + 1] !== undefined &&
//                                         state.singleComplaint.complaintDetail[i + 1].isAdmin ?
//                                         userIconUI(commentObj)

//                                         :
//                                         state.singleComplaint.complaintDetail[i - 1] !== undefined && state.singleComplaint.complaintDetail[i - 1].isAdmin ?
//                                             userIconUI(commentObj)
//                                             :
//                                             state.singleComplaint.complaintDetail[i - 1] !== undefined && state.singleComplaint.complaintDetail[i + 1] !== undefined && state.singleComplaint.complaintDetail[i - 1].isAdmin && state.singleComplaint.complaintDetail[i + 1].isAdmin &&
//                                             userIconUI(commentObj)

//                     }
//                 </Fragment>

//             ))
//         } else {
//             arr.push(
//                 <Fragment key={commentObj.complaintDetailID + 1}>
//                     {
//                         i === 0 ? dateUI(i)
//                             :
//                             state.singleComplaint.complaintDetail[i] !== undefined && state.singleComplaint.complaintDetail[i - 1] !== undefined &&
//                             state.singleComplaint.complaintDetail[i].dateTime.split(" ")[0] !== state.singleComplaint.complaintDetail[i - 1].dateTime.split(" ")[0] &&
//                             dateUI(i)
//                     }
//                     <View style={{ flex: 1, borderRadius: 2, borderColor: '#707070', borderWidth: 0.2, margin: 7, backgroundColor: '#fff' }}>
//                         <View style={{ margin: 5 }}>
//                             <Text style={{ ...complaintFeedbackStyles.fontStyles(12, '#000000', 1) }}>{commentObj.description}</Text>
//                             <View style={{ padding: 5 }}>
//                                 <Text style={[{ ...complaintFeedbackStyles.fontStyles(12, '#000000', 1) }, { opacity: 0.5, textAlign: 'right' }]}>{commentObj.dateTime.split(" ")[1]}</Text>
//                             </View>
//                         </View>
//                     </View>
//                     {
//                         state.singleComplaint.complaintDetail[i + 1] !== undefined &&
//                             state.singleComplaint.complaintDetail[i].isAdmin === state.singleComplaint.complaintDetail[i + 1].isAdmin ?
//                             null
//                             :
//                             state.singleComplaint.complaintDetail[i - 1].isAdmin !== undefined && state.singleComplaint.complaintDetail[i - 1].isAdmin ?
//                                 adminIconUi(commentObj)
//                                 :
//                                 state.singleComplaint.complaintDetail[i].isAdmin !== undefined &&
//                                     state.singleComplaint.complaintDetail[i].isAdmin ?
//                                     adminIconUi(commentObj)
//                                     :
//                                     null
//                     }
//                 </Fragment >

//             )
//         }
//         return arr;
//     };
//     const onChangeHandler = (val) => {
//         setState({ ...state, commentMsg: val })
//     };
//     const onSuccessHandler = response => {
//         if (response.data.statusCode === 200) setState(prevState => ({ ...prevState, singleComplaint: response.data.getComplaintsByID }));
//         console.log("Legal.onSuccessHandler ----", response);
//     };
//     const onErrorHandler = error => {
//         console.log("Legal.onErrorHandler ----", error);
//     };
//     const addCommentHandler = () => {
//         postRequest('/api/Menu/Complaint/ComplainDetails',
//             {
//                 "complaintID": state.singleComplaint.complaintID,
//                 "description": state.commentMsg,
//                 "isAdmin": false
//             },
//             {},
//             dispatch,
//             res => {
//                 if (res) {
//                     // if (state.singleComplaint.complaintDetail.length) {
//                     state.singleComplaint.complaintDetail.push({
//                         complaintDetailID: !state.singleComplaint.complaintDetail.length ? 0 : state.singleComplaint.complaintDetail[state.singleComplaint.complaintDetail.length - 1].complaintDetailID + 1,
//                         complaintID: state.singleComplaint.complaintID,
//                         dateTime: moment().format("DD/MM/YYYY h:mm"),
//                         description: state.commentMsg,
//                         isAdmin: false,
//                         user: props.loggedInUser.firstName + " " + props.loggedInUser.lastName
//                     });
//                     setState(prevState => ({ ...prevState, commentMsg: "" }));
//                     // }
//                     // else {
//                     //     getRequest(`/api/Menu/Complaint/${getNavigationState.routes[getNavigationState.index].state.routes[getNavigationState.routes[getNavigationState.index].state.index].params.dataParams}`, {}, dispatch, onSuccessHandler, onErrorHandler);
//                     //     setState(prevState => ({ ...prevState, commentMsg: "" }));
//                     // }
//                 }
//             },
//             err => console.log(err),
//             '',
//             false
//         );
//     }
//     useEffect(useCallback(() => {
//         getRequest(`/api/Menu/Complaint/${getNavigationState.routes[getNavigationState.index].state.routes[getNavigationState.routes[getNavigationState.index].state.index].params.dataParams}`, {}, dispatch, onSuccessHandler, onErrorHandler);
//         return () => {
//             console.log('Complaint details state cleared----');
//             setState(initState);
//         }
//     }, []), []);
//     // console.log('ComplaintsDetailsState:---- :', state)
//     return (
//         <Container style={{ ...activeTheme.container }}>
//             <ImageBackground source={doodleImg} style={complaintFeedbackStyles.backgroundImg}>
//                 <CustomHeader
//                     leftIconHandler={leftIconHandler}
//                     rightIconHandler={() => Alert.alert('Right icon clicked')}
//                     navigation={navigation}
//                     leftIcon={svgIcons.backIcon(activeTheme)}
//                     bodyContent={'Complaints'}
//                     rightIcon={null}
//                     activeTheme={activeTheme}
//                     styles={{ paddingBottom: plateformSpecific(20, 0) }}
//                 />
//                 <KeyboardAvoidingView behavior={behavior} style={{ flex: 1 }}>
//                     <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
//                         <View style={{ flex: state.singleComplaint.complaintDetail.length > 1 ? 1 : 0, backgroundColor: "#FFFFFF", borderRadius: 10 }}>
//                             <ScrollView contentContainerStyle={{ marginHorizontal: 20 }} ref={parentScrollRef}>
//                                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', top: 10 }}>
//                                     <View>
//                                         <Text style={{ ...complaintFeedbackStyles.fontStyles(16) }}>Complaint No# {state.singleComplaint.complaintID}</Text>
//                                     </View>
//                                     <View style={{ height: 25, width: 65, justifyContent: 'center', alignItems: 'center' }}>
//                                         <Text style={{ ...complaintFeedbackStyles.fontFaimlyRegular, color: state.singleComplaint.statusName === 'Solved' ? "#46E54B" : '#E35555', fontSize: 12 }}>{state.singleComplaint.statusName}</Text>
//                                     </View>
//                                 </View>
//                                 <View>
//                                     <View style={{ maxHeight: 120, paddingVertical: 20 }}>
//                                         <ScrollView nestedScrollEnabled>
//                                             <Text style={{ ...complaintFeedbackStyles.fontStyles(14, '#000000', 2), marginLeft: 5 }}>
//                                                 {state.singleComplaint.description}
//                                             </Text>
//                                         </ScrollView>
//                                     </View>
//                                     {
//                                         state.singleComplaint.statusName === 'Solved' &&
//                                         <View style={{ paddingBottom: 20 }}>
//                                             <Text>Assistance:</Text>
//                                             <Text style={{ ...complaintFeedbackStyles.fontStyles(14, '#000000', 2), marginLeft: 3, textAlign: 'justify' }}>{state.singleComplaint.assistance}</Text>
//                                         </View>
//                                     }
//                                     {
//                                         state.singleComplaint.statusName === 'Active' &&
//                                         <View style={{ maxHeight: 400, paddingVertical: 20, borderRadius: 5, borderColor: '#707070', borderWidth: 0.2 }}>
//                                             <ScrollView nestedScrollEnabled ref={commentsScrollRef} onContentSizeChange={() => commentsScrollRef.current.scrollToEnd({ animated: true })}>
//                                                 {
//                                                     state.singleComplaint.complaintDetail.length ? state.singleComplaint.complaintDetail.map((item, i) => handleCommentsUI(item, i)) : recordsNotExistUI('No comment exist', '#fff', null, null, null, 5)

//                                                 }
//                                             </ScrollView>
//                                         </View>
//                                     }
//                                     {
//                                         state.singleComplaint.statusName === 'Active' &&
//                                         <View style={{ paddingVertical: 20 }}>
//                                             <Text style={{ ...complaintFeedbackStyles.fontStyles(16, '#060606', 1,) }}>Aditional Comments</Text>
//                                             <View style={{ marginTop: 10 }}>
//                                                 <TextInput multiline={true} numberOfLines={5} style={{ borderRadius: 5, borderColor: '#707070', borderWidth: 0.2, textAlignVertical: 'top', padding: 5, height: Platform.OS === 'ios' ? 70 : undefined }} value={state.commentMsg} onFocus={() => parentScrollRef.current.scrollToEnd({ animated: true })} onChangeText={val => onChangeHandler(val)} />
//                                             </View>
//                                         </View>
//                                     }

//                                 </View>
//                                 {
//                                     state.singleComplaint.statusName === 'Solved' &&
//                                     <TouchableOpacity style={complaintFeedbackStyles.footerContainer} onPress={() => openContactUsModal(state.singleComplaint)}>
//                                         <View style={complaintFeedbackStyles.footerView}>
//                                             <Text>
//                                                 Not Satisfied?
//                                                 <Text style={complaintFeedbackStyles.footerText(activeTheme)}> Contact Us</Text>
//                                             </Text>
//                                         </View>
//                                     </TouchableOpacity>
//                                 }
//                             </ScrollView>
//                             <TouchableOpacity style={{ justifyContent: 'flex-end' }} onPress={state.singleComplaint.statusName === 'Active' ? addCommentHandler : () => { }}>
//                                 <View style={{ ...complaintFeedbackStyles.submitBtn(activeTheme) }}>
//                                     <Text style={{ ...complaintFeedbackStyles.fontStyles(18, '#FFFFFF', 1) }}>{state.singleComplaint.statusName === 'Active' ? 'Submit' : 'Ok'}</Text>
//                                 </View>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </KeyboardAvoidingView>
//             </ImageBackground>
//         </Container >
//     )
// };
// const mapStateToProps = (store) => {
//     return {
//         theme: store.themeReducer
//     }
// };

// export default connect(mapStateToProps)(ComplaintDetailsList);



// Mudassir

// Select Drop of location screen

// import React, { useEffect, useCallback, useState, useRef, createRef, memo } from 'react';
// import { View, Text, Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
// import closeIcon from '../../assets/svgIcons/common/cross-new.svg';
// import { SvgXml } from 'react-native-svg';
// import plateformSpecific from '../../utils/plateformSpecific';
// import commonStyles from '../../styles/styles';
// import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
// import locateMeIcon from "../../assets/svgIcons/customerorder/locate-ico.svg";
// import { sharedAnimateToCurrentLocation, sharedTakeMapSnapshot, sharedValidateAllProperties } from '../../utils/sharedActions';
// import { CONSTANTLATDELTA, CONSTANTLONGDELTA } from '../../config/config';
// import CustomMapView from '../../components/mapview/CustomMapView';
// import CustomLocationSearch from '../../components/locationSearch/CustomLocationSearch';
// import { closeModalAction } from '../../redux/actions/modal';
// import { postRequest, getRequest } from '../../services/api';
// import CustomToast from '../../components/toast/CustomToast';


// export const MemoisedRFC = memo((props) => {
//     // console.log("MemoisedRFC.Props :", props);
//     return <CustomLocationSearch
//         {...props}
//         gotoMapLocationPicker={props.gotoMapLocationPicker}
//         predefinedPlaces={props.predefinedPlaces}
//         onSelectLocation={data => {
//             props.onSelectLocationHandler(data)
//         }}
//         locationTitle={props.selectedRegion.title}
//         locationTextRef={props.locationTextRef}
//     />
// }, (prevProps, nextProps) => prevProps !== nextProps);


// export const MemoisedMapRFC = memo((props) => {
//     // console.log("MemoisedRFC.Props :", props);
//     return <CustomMapView
//         handlePressOnMap={props.gotoMapLocationPicker}
//         mapRef={props.mapRef}
//         markerRef={props.markerRef}
//         pinRegion={props.pinRegion}
//         setPinRegion={props.setPinRegion}
//         constantLatDelta={props.constantLatDelta}
//         constantLongDelta={props.constantLongDelta}
//         editMode={Object.keys(props.currentRoute).length ? true : false}
//         firstRenderMap={props.firstRenderMap}
//         marketTitle={props.marketTitle}
//         parentSetStateHandler={props.parentSetStateHandler}
//         interactibleMap={props.interactibleMap}
//         showMarkupObj={props.showMarkupObj}
//     />
// }, (prevProps, nextProps) => prevProps !== nextProps);
// export default function SelectDropOfLocation(props) {
//     // console.log('SelectDropOfLocation.Props :', props);
//     // console.log('SelectDropOfLocation. NavState :', props.navigation.dangerouslyGetState());
//     let parentIndex = props.navigation.dangerouslyGetState().index,
//         nestingIndex = props.navigation.dangerouslyGetState().routes[parentIndex].state.index,
//         parentRoute = props.navigation.dangerouslyGetState().routes[parentIndex].state.routes[nestingIndex],
//         currentRoute = parentRoute?.params?.data || {};
//     // console.log('currentRoute :', currentRoute);
//     // lastIndex = parentRoute?.state?.index,
//     // currentRoute = (parentRoute?.state?.routes[lastIndex].params && parentRoute?.state?.routes[lastIndex]?.params?.data) ? parentRoute?.state?.routes[lastIndex]?.params?.data : {}
//     // let currentRoute = {};
//     let initState = {
//         "predefinedPlaces": [],
//         "firstRenderMap": false,
//         "selectedRegion": {
//             "addressID": currentRoute?.addressID || 0,
//             "title": currentRoute?.title || "",
//             "latitude": currentRoute?.latitude || null,
//             "longitude": currentRoute?.longitude || null,
//             "latitudeDelta": currentRoute?.latitudeDelta || null,
//             "longitudeDelta": currentRoute?.longitudeDelta || null,
//         }
//     }
//     const [state, setState] = useState(initState);
//     const mapRef = useRef(null);
//     const markerRef = useRef(null);
//     let locationTextRef = createRef(null);
//     const setPinRegion = newRegion => setState(prevState => ({
//         ...prevState, selectedRegion: {
//             ...prevState.selectedRegion,
//             ...newRegion
//         }
//     }));
//     const onSelectLocationHandler = data => {
//         if (!data || data === null) return;
//         setState(prevState => ({
//             ...prevState,
//             firstRenderMap: false,
//             selectedRegion: {
//                 ...prevState.selectedRegion,
//                 // addressID: data.addressID,
//                 title: data.title,
//                 latitude: data.latitude,
//                 longitude: data.longitude,
//                 latitudeDelta: data.latitudeDelta ? data.latitudeDelta : state.selectedRegion.latitudeDelta,
//                 longitudeDelta: data.longitudeDelta ? data.longitudeDelta : state.selectedRegion.longitudeDelta

//             }
//         }));
//         props.dispatch(closeModalAction());
//         mapRef.current && mapRef.current.animateToRegion({
//             latitude: data.latitude,
//             longitude: data.longitude,
//             latitudeDelta: data.latitudeDelta ? data.latitudeDelta : state.selectedRegion.latitudeDelta,
//             longitudeDelta: data.longitudeDelta ? data.longitudeDelta : state.selectedRegion.longitudeDelta
//         });
//     };
//     const gotoMapLocationPicker = () => {
//         props.navigation.navigate("map_location_picker_container", {
//             screen: "map_location_picker",
//             cb: data => {
//                 locationTextRef.current && locationTextRef.current.refs.textInput.setNativeProps({ text: data.title || "" });
//                 onSelectLocationHandler(data);
//             },
//             backScreenObj: {
//                 container: "wallet_container",
//                 screen: "select_dropof_location"
//             },
//         });
//     };
//     const goBackToCashoutScreen = async (action) => {
//         if (action === 'back') {
//             props.route.state.routes[props.route.state.index].params.cb && props.route.state.routes[props.route.state.index].params.cb(state.selectedRegion);
//             props.navigation.navigate("wallet_container", { screen: "wallet_child_container", data: null })
//         }
//         else {
//             try {
//                 // markerRef.current && markerRef.current.showCallout();
//                 const snapshot = await sharedTakeMapSnapshot(mapRef);
//                 // markerRef.current && markerRef.current.hideCallout();
//                 props.route.state.routes[props.route.state.index].params.cb && props.route.state.routes[props.route.state.index].params.cb({ ...state.selectedRegion, cashoutImage: snapshot });
//                 props.navigation.navigate("wallet_container", { screen: "wallet_child_container", data: null });
//             } catch (error) {
//                 console.log(error);
//             }
//         }
//     };
//     useEffect(useCallback(() => {
//         console.log("AddOrEditAddress.useCallback")
//         sharedAnimateToCurrentLocation(mapRef);
//         getRequest(
//             '/api/Order/GetAddress',
//             {},
//             props.dispatch,
//             response => {
//                 let recievedAddresses = ((response && response.data && response.data.addresses) || []);//.slice(0, 15);
//                 recievedAddresses = recievedAddresses.map((item, i) => ({
//                     addressID: item.addressID,
//                     description: item.title,
//                     latitudeDelta: parseFloat(item.latitudeDelta),
//                     longitudeDelta: parseFloat(item.longitudeDelta),
//                     geometry: {
//                         location: {
//                             lat: parseFloat(item.latitude),
//                             lng: parseFloat(item.longitude)
//                         }
//                     }
//                 }));
//                 setState(copyState => ({ ...copyState, predefinedPlaces: recievedAddresses }))
//             },
//             (error) => {
//                 console.log(error);
//             },
//             '',
//             true,
//             false
//         );
//         return () => {
//             console.log("SelectDropOfLocation state cleared----")
//             setState(initState);
//         }
//     }, []), []);
//     console.log('SelectDropOfLocation.State :', state);
//     return (
//         <>
//             <MemoisedMapRFC
//                 gotoMapLocationPicker={gotoMapLocationPicker}
//                 mapRef={mapRef}
//                 markerRef={markerRef}
//                 {...state}
//                 {...props}
//                 pinRegion={state.selectedRegion}
//                 setPinRegion={setPinRegion}
//                 constantLatDelta={CONSTANTLATDELTA}
//                 constantLongDelta={CONSTANTLONGDELTA}
//                 currentRoute={currentRoute}
//                 firstRenderMap={state.firstRenderMap}
//                 marketTitle={state.selectedRegion.title}
//                 parentSetStateHandler={setState}
//                 interactibleMap={false}
//                 showMarkupObj={{
//                     withStyles: true,
//                     count: '1'
//                 }}
//             />
//             <View style={{
//                 width: '100%',
//                 height: 'auto',
//                 alignSelf: 'center',
//                 marginTop: 4,
//                 position: "absolute",
//                 // left: "40%",
//                 top: 39,
//                 margin: 10,
//                 // backgroundColor: 'red',
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 alignItems: 'center'
//             }}>
//                 <TouchableOpacity style={{
//                     "left": 5,
//                     "backgroundColor": '#fff', "elevation": 3, "borderRadius": 7, "width": 35,
//                     "height": 35, "shadowColor": "#000",
//                     "marginLeft": plateformSpecific(5, 10),
//                     "borderColor": '#fff',
//                     "alignItems": "center", "justifyContent": "center"
//                 }}
//                     onPress={() => goBackToCashoutScreen('back')}
//                 >
//                     <SvgXml xml={closeIcon} height={15} width={15} />
//                 </TouchableOpacity>
//             </View>
//             {/* locate me */}
//             {/* <View style={{ height: Dimensions.get('window').height * 0.5, marginTop: Platform.select({ ios: 0, android: 25 }), flexDirection: 'column', position: "absolute", alignSelf: 'flex-end', justifyContent: 'flex-end', top: 0, bottom: 0, padding: 10, alignItems: 'center' }}>
//                 <TouchableOpacity style={{}} onPress={() => sharedAnimateToCurrentLocation(mapRef)}>
//                     <View style={{
//                         justifyContent: 'center',
//                         backgroundColor: '#FFFFFF',
//                         width: 38,
//                         height: 38,
//                         borderRadius: 10,
//                         elevation: 4
//                     }}>
//                         <SvgXml style={{ alignSelf: "center" }} xml={locateMeIcon} height={18} width={18}
//                         />
//                     </View>
//                 </TouchableOpacity>
//             </View> */}
//             <KeyboardAvoidingView style={{ backgroundColor: "#fff", borderTopLeftRadius: 15, borderTopRightRadius: 15, flex: Platform.select({ ios: props.stackState.keypaidOpen ? 3 : 1, android: 0 }), height: Dimensions.get('window').height * 0.5, }} behavior={Platform.select({ ios: "padding", android: null })}>
//                 {
//                     state.predefinedPlaces.length ?
//                         <>
//                             <MemoisedRFC {...props} {...state} locationTextRef={locationTextRef} onSelectLocationHandler={onSelectLocationHandler} gotoMapLocationPicker={gotoMapLocationPicker} />
//                             <TouchableOpacity disabled={state.selectedRegion.title ? false : true} style={{ backgroundColor: state.selectedRegion.title ? props.activeTheme.default : props.activeTheme.lightGrey, paddingVertical: 20, }} onPress={goBackToCashoutScreen}>
//                                 <Text style={{ textAlign: 'center', color: props.activeTheme.white }}>Save and continue</Text>
//                             </TouchableOpacity>
//                         </>
//                         // <>
//                         //     <CustomLocationSearch
//                         //         {...props}
//                         //         {...state}
//                         //         gotoMapLocationPicker={gotoMapLocationPicker}
//                         //         predefinedPlaces={state.predefinedPlaces}
//                         //         onSelectLocation={data => onSelectLocationHandler(data)}
//                         //         locationTitle={state.selectedRegion.title}
//                         //     />
//                         //     <TouchableOpacity disabled={state.selectedRegion.title ? false : true} style={{ backgroundColor: state.selectedRegion.title ? props.activeTheme.default : props.activeTheme.lightGrey, paddingVertical: 20, }} onPress={goBackToCashoutScreen}>
//                         //         <Text style={{ textAlign: 'center', color: props.activeTheme.white }}>Save and continue</Text>
//                         //     </TouchableOpacity>
//                         // </>
//                         :
//                         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                             <ActivityIndicator size="large" color={props.activeTheme.default} />
//                         </View>
//                 }
//             </KeyboardAvoidingView>


//         </>
//     )
// }



// Rider Menu Screen code  -> Mudassir

// import React, { useState, useRef, useEffect } from 'react'
// import { View, Text, Dimensions } from 'react-native';
// import CustomMapView from '../../../components/mapview/CustomMapView';
// import { CONSTANTLATDELTA, CONSTANTLONGDELTA, EMPTY_PROFILE_URL } from '../../../config/config';
// import { renderPicture, sharedAnimateToCurrentLocation, sharedStartingRegionPK } from '../../../utils/sharedActions';
// import commonIcons from '../../../assets/svgIcons/common/common';
// import goIcon from '../../../assets/svgIcons/rider/go.svg';
// import CustomHeader from '../../../components/header/CustomHeader';
// import commonStyles from '../../../styles/styles';
// import { SvgXml } from 'react-native-svg';
// import { TouchableOpacity } from 'react-native-gesture-handler';
// import riderCommonIcons from '../../../assets/svgIcons/icons'
// export default props => {
//     console.log("Rider Menu Props :", props)
//     let initState = {
//         pinRegion: sharedStartingRegionPK,
//         isSmModalOpen: false,
//         isImgLoad: false,
//         timer: '00:00:00',
//     }
//     const [state, setState] = useState(initState);
//     let mapRef = useRef(null);
//     const setPinRegion = newRegion => setState(pre => ({ ...pre, pinRegion: newRegion }))
//     const showHideModal = bool => setState(prevState => ({ ...prevState, isSmModalOpen: bool }));

//     return (
//         <View style={{
//             flex: 1,
//             flexDirection: "column",
//             alignSelf: 'stretch'
//         }}>
//             <CustomMapView
//                 mapRef={mapRef}
//                 markerRef={null}
//                 pinRegion={state.pinRegion}
//                 setPinRegion={setPinRegion}
//                 constantLatDelta={CONSTANTLATDELTA}
//                 constantLongDelta={CONSTANTLONGDELTA}
//                 editMode={false}
//                 firstRenderMap={true}
//                 marketTitle={""}
//                 parentSetStateHandler={() => { }}
//                 interactibleMap={true}
//                 showMarkupObj={{
//                     withStyles: false,
//                     count: '0'
//                 }}
//                 top={null}
//             // bottom={50}
//             />
//             <View style={{
//                 width: '100%',
//                 marginTop: 4,
//                 position: "absolute",
//                 top: 0,
//                 bottom: 0,
//                 // backgroundColor: 'blue',

//                 // height: 'auto',
//                 // flexDirection: 'row',
//                 // justifyContent: 'space-between',
//             }}>

//                 <CustomHeader
//                     leftIconHandler={'toggle'}
//                     rightIconHandler={() => { }}
//                     navigation={props.drawerProps.navigation}
//                     leftIcon={commonIcons.menueIcon(props.activeTheme)}
//                     BodyComponent={() => <View style={{ right: 30, backgroundColor: props.activeTheme.default, width: 80, borderRadius: 65, height: 40, borderWidth: 3, borderStyle: "solid", borderColor: "#F0F0F0", justifyContent: "center", alignItems: 'center' }}>
//                         <View style={{ width: 90, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} >
//                             <Text style={{ color: props.activeTheme.white, padding: 5 }}>{state.timer}</Text>
//                         </View>
//                     </View>}
//                     rightIcon={true}
//                     activeTheme={props.activeTheme}
//                     imgObject={{
//                         imgSrc: props.user && props.user.picture ? props.user.isLocalChange ? props.user.picture : renderPicture(props.user.picture, (props.user.tokenObj && props.user.tokenObj.token && props.user.tokenObj.token.authToken)) : EMPTY_PROFILE_URL,
//                         loaderBool: state.isImgLoad,
//                         loaderCb: bool => setState(pre => ({ ...pre, isImgLoad: bool })),
//                         imgStyles: { marginRight: 2, height: 32, width: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
//                         title: props.user.balance,
//                         dropDownPress: () => showHideModal(!state.isSmModalOpen)
//                     }}
//                 />
//                 <View style={{ height: 40, backgroundColor: props.activeTheme.grey, justifyContent: 'center', alignItems: 'center', borderRadius: 15, alignSelf: 'center', marginTop: 20 }}>
//                     <Text style={{ color: props.activeTheme.white, padding: 20 }}>{props.user.isUserOnline ? "You are online" : "You are offline"}</Text>
//                 </View>
//                 {/* Bottom View */}

//                 <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
//                     {/* Go Icon */}
//                     <TouchableOpacity style={{ alignSelf: 'center', padding: 10 }}>
//                         <SvgXml xml={goIcon} height={60} width={60} />
//                     </TouchableOpacity>

//                     {/* Wrapper */}
//                     <View style={{ backgroundColor: props.activeTheme.white, width: Dimensions.get('window').width, borderRadius: 10, minHeight: 200 }}>
//                         <Text style={{ padding: 10, ...commonStyles.fontStyles(16, props.activeTheme.default, 1) }}>History of your tasks</Text>
//                     </View>

//                     {/* Chat Icon */}
//                     <View style={{ position: 'absolute', bottom: 25, right: 0 }}>
//                         <TouchableOpacity disabled={!props.user.isUserOnline}>
//                             <SvgXml xml={props.user.isUserOnline ? riderCommonIcons.chatEnabledIcon({ count: 1 }) : riderCommonIcons.chatDisabledIcon()} height={50} width={50} />
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </View>
//         </View>
//     )
// }


// EARNINGS MODAL VIEW FOR WITHDRAW

// export const ModalView = props => {
//     const [modalState, setModalState] = useState({
//         'activeBox': 0,
//         'focusedField': '',
//     });
//     const setActiveBox = index => setModalState(copyState => ({ ...copyState, activeBox: index }));
//     return <View style={{ flex: 1, flexDirection: 'column', width: Dimensions.get('window').width, }}>
//         <View style={{ padding: 20, top: 10 }}>
//             <TextInput keyboardType="number-pad" style={styles.defaultInputArea(props.activeTheme, 'amount', modalState)} placeholder="Enter amount" onFocus={() => setModalState(pre => ({ ...pre, focusedField: 'amount' }))} onBlur={() => setModalState(pre => ({ ...pre, focusedField: '' }))} />
//         </View>
//         <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
//             {
//                 [{ name: "Easy Paisa" }, { name: "Jazz Cash" }]
//                     .map((r, i) => (
//                         <TouchableOpacity
//                             key={i}
//                             onPress={() => setActiveBox(i)}
//                             style={{ marginLeft: i > 0 ? 10 : 0, height: 90, width: 110, borderWidth: 1, borderColor: props.activeTheme.lightGrey, borderRadius: 10, backgroundColor: i === modalState.activeBox ? props.activeTheme.lightGrey : undefined }}>
//                             {
//                                 i === modalState.activeBox ?
//                                     <View style={{ alignSelf: 'flex-end', margin: 5, height: 20, width: 20, borderRadius: 10, borderWidth: 1, borderColor: props.activeTheme.default, justifyContent: 'center', alignItems: 'center' }}>
//                                         <View style={{ height: 8, width: 8, borderRadius: 4, borderWidth: 1, borderColor: modalState.activeBox === i ? props.activeTheme.default : "#fff", backgroundColor: modalState.activeBox === i ? props.activeTheme.default : "#fff" }} />
//                                     </View>
//                                     : null

//                             }
//                             <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'column', margin: 10 }}>
//                                 <Text>
//                                     {i > 0 ? r.name.split(" ")[0] + "\n" + r.name.split(" ")[1] : r.name}
//                                 </Text>
//                             </View>
//                         </TouchableOpacity>
//                     ))
//             }
//         </View>
//         <View style={{ flex: 1, justifyContent: 'flex-end' }}>
//             <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: props.activeTheme.default, paddingVertical: 20 }} onPress={() => {
//                 props.dispatch(closeModalAction());
//                 props.navigation.navigate("web_view_container", { uri: `https://stackoverflow.com/questions/35531679/react-native-open-links-in-browser`, html: null, screenStyles: {} })
//             }}>
//                 <Text style={commonStyles.fontStyles(16, props.activeTheme.white, 3)}>Withdraw</Text>
//             </TouchableOpacity>
//         </View>
//     </View >
// };

// HOW IT WORKS DETAILS

// import React from 'react';
// import { View } from 'react-native';
// import closeIcon from '../../../assets/svgIcons/common/cross-new.svg';
// import CustomHeader from '../../../components/header/CustomHeader';
// import CustomWebView from '../../../components/webView';
// import plateformSpecific from '../../../utils/plateformSpecific';

// export default props => {
//     const { activeTheme, navigation } = props;
//     let getNavigationState = navigation.dangerouslyGetState();
//     return (
//         <View style={{ flex: 1 }}>
//             <CustomHeader
//                 leftIconHandler={() => navigation.navigate("rider_how_it_works_stack", { screen: "rider_how_it_works_container" })}
//                 rightIconHandler={() => { }}
//                 navigation={navigation}
//                 leftIcon={closeIcon}
//                 bodyContent={'HOW IT WORKS'}
//                 rightIcon={null}
//                 activeTheme={activeTheme}
//                 height={15}
//                 width={15}
//                 left={3}
//             />
//             <View style={{ flex: 1, top: plateformSpecific(10, -10) }}>
//                 <CustomWebView
//                     html={`<html><body style='background-color:transparent; padding-left: 70px;padding-right: 10px'><p style='color: #000;font-size: 40px;'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p></body></html>`}
//                     screenStyles={{ top: 20, right: 10 }}
//                 />
//             </View>
//         </View>
//     )
// };

//  Customer Help Details

// import React from 'react';
// import { ImageBackground } from 'react-native';
// import { Container, Content } from 'native-base';
// import closeIcon from '../../assets/svgIcons/common/cross-new.svg';
// import CustomHeader from '../../components/header/CustomHeader';
// import CustomWebView from '../../components/webView';
// import plateformSpecific from '../../utils/plateformSpecific';

// const HelpDetails = props => {
//     const { activeTheme, navigation } = props;
//     let getNavigationState = navigation.dangerouslyGetState();
//     return (
//         <Container>
//             <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
//                 <CustomHeader
//                     leftIconHandler={() => navigation.navigate("help_faq_stack", { screen: "help_faqs" })}
//                     rightIconHandler={() => { }}
//                     navigation={navigation}
//                     leftIcon={closeIcon}
//                     bodyContent={'Help'}
//                     rightIcon={null}
//                     activeTheme={activeTheme}
//                     height={15}
//                     width={15}
//                     left={3}
//                 />
//                 <Content contentContainerStyle={{ flex: 1, top: plateformSpecific(10, -10) }}>
//                     <CustomWebView
//                         html={`<html><body style='background-color:transparent; padding-left: 70px;padding-right: 10px'><p style='color: #000;font-size: 40px;'>${getNavigationState.routes[getNavigationState.index].params.list.description}</p></body></html>`}
//                         screenStyles={{ top: 20, right: 10 }}
//                     />

//                 </Content>
//             </ImageBackground>
//         </Container>
//     )
// };

// export default HelpDetails;



// WALLET SECTION TOPUP SCREEN
// import React, { useState, useRef } from 'react';
// import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Dimensions, Platform, Alert } from 'react-native';
// import walletHistoryStyles from './walletHistoryStyles';
// import commonStyles from '../../styles/styles';
// import Validator from 'validator';


// export default function Topup(props) {
//     console.log("Topup.Props :", props);
//     const initState = {
//         "activeBox": 0,
//         "cardNumber": "",
//         "expDate": "",
//         "cvv": "",
//         "country": "",
//         "backspace": false,
//         "focusedField": "",
//     }
//     const scrollRef = useRef(null);
//     const [state, setState] = useState(initState);
//     const setActiveBox = index => setState(copyState => ({ ...copyState, activeBox: index }))
//     const renderBoxes = () => {
//         return [{ name: "Credit or Debit Card", handler: () => { } }, { name: "Jazz Cash", handler: () => props.navigation.navigate("web_view_container", { uri: `https://www.jazzcash.com.pk/`, html: null, screenStyles: {} }) }, {
//             name: "Easy Paisa", handler: () => props.navigation.navigate("web_view_container", {
//                 uri: null, html: `
        
// <form action="https://easypaystg.easypaisa.com.pk/easypay/Confirm.jsf" method="POST" target="_blank">
// <input name="postBackURL" value="http%3A%2F%2F2d89ecc2eca3.ngrok.io%2Fapi%2FEasyPasa%2FCredConfirmPostURL" hidden = "true"/>
// <input name="auth_token" value="63497609142229179216458614596524379002" hidden = "true"/>
// <input type = "submit" border="0" name= "pay">
// </form>
//         `, screenStyles: {}
//             })
//         }]
//             .map((r, i) => (
//                 <TouchableOpacity
//                     key={i}
//                     onPress={() => {
//                         setActiveBox(i);
//                         r.handler();
//                     }}
//                     style={{ height: 90, width: 110, borderWidth: 1, borderColor: props.activeTheme.lightGrey, borderRadius: 10, backgroundColor: i === state.activeBox ? props.activeTheme.lightGrey : undefined }}>
//                     {
//                         i === state.activeBox &&
//                         <View style={[walletHistoryStyles.tabBox(props.activeTheme), { alignSelf: 'flex-end', margin: 5 }]}>
//                             <View style={walletHistoryStyles.boxInner(props.activeTheme)} />
//                         </View>

//                     }
//                     <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'column', margin: 10 }}>
//                         <Text>
//                             {i > 0 ? r.name.split(" ")[0] + "\n" + r.name.split(" ")[1] : r.name}
//                         </Text>
//                     </View>
//                 </TouchableOpacity>
//             ))
//     };
//     // const onKeyPress = (e) => {
//     //     const { key } = e.nativeEvent;

//     // }
//     const onChangeText = (key, value) => {
//         // if (!value) return;
//         if (key === "expDate") {
//             if (value.length > 1 && !state.backspace) {
//                 value = value.split("")
//                 value[2] = "/";
//                 value = value.join("")
//             }
//         }
//         if (key === "country") {
//             if (value.length && !Validator.isAlpha(value)) return Alert.alert('Please enter a valid country name')
//         }
//         setState(prevState => ({ ...prevState, [key]: value }))
//     }
//     // console.log('State :', state)
//     return (
//         <View style={{
//             maxHeight: Platform.select({ ios: props.stackState.keypaidOpen ? Dimensions.get('window').height * 0.40 : undefined, android: undefined }),
//             flex: Platform.select({ ios: props.stackState.keypaidOpen ? 0 : 1, android: 1 }),
//             backgroundColor: props.activeTheme.white,
//             borderTopLeftRadius: 10,
//             borderTopRightRadius: 10,
//             elevation: 3
//         }}>
//             <ScrollView ref={scrollRef} >
//                 <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 7 }}>
//                     {renderBoxes()}
//                 </View>
//                 {
//                     state.activeBox === 0 &&
//                     <>
//                         <View style={{ paddingVertical: 5, paddingLeft: 17 }}>
//                             <Text style={commonStyles.fontStyles(16, props.activeTheme.default, 1)}>Please add card details</Text>
//                         </View>
//                         <View style={{ padding: 15 }}>
//                             {
//                                 [
//                                     { field: "cardNumber", title: "Card Number", value: state.cardNumber, keyboardType: "numeric", placeholder: "Enter card number", maxLength: 14 },
//                                     { field: "expDate", title: "Exp. Date", value: state.expDate, keyboardType: "numeric", placeholder: "MM/YY", maxLength: 5 },
//                                     { field: "cvv", title: "CVV", value: state.cvv, keyboardType: "numeric", placeholder: "123", maxLength: 3 },
//                                     { field: "country", title: "Country", value: state.country, keyboardType: "email-address", placeholder: "Country", maxLength: 20 },
//                                 ]
//                                     .map((F, j) => (
//                                         <View key={j} style={{}}>
//                                             <Text style={{ bottom: 5, left: 2 }}>
//                                                 {F.title}
//                                             </Text>
//                                             <TextInput
//                                                 value={F.value}
//                                                 style={walletHistoryStyles.defaultInputArea(props.activeTheme, state.focusedField, F.field)}
//                                                 placeholder={F.placeholder}
//                                                 keyboardType={F.keyboardType}
//                                                 onFocus={() => {
//                                                     scrollRef.current.scrollToEnd({ animated: true })
//                                                     setState(pre => ({ ...pre, focusedField: F.field }))
//                                                     // console.log('OnFouc----')
//                                                 }}
//                                                 maxLength={F.maxLength}
//                                                 onChangeText={value => onChangeText(F.field, value)}
//                                                 onKeyPress={e => setState({ ...state, backspace: e.nativeEvent.key === "Backspace" ? true : false })}

//                                             />
//                                         </View>
//                                     ))
//                             }
//                         </View>
//                     </>
//                 }
//             </ScrollView>
//             <View style={{ flexDirection: 'row' }}>
//                 {
//                     ['Top-Up', "Cash Out"].map((b, k) => (
//                         <TouchableOpacity onPress={() => props.setTabHandler(2, k)} key={k} style={{ paddingVertical: 20, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: props.activeTheme.default, marginLeft: k > 0 ? 2 : 0 }}>
//                             <Text style={{ color: props.activeTheme.white }}>{b}</Text>
//                         </TouchableOpacity>
//                     ))
//                 }
//             </View>
//         </View >
//     )
// }


















// import { View, Text, Button, DevSettings, ImageBackground, StyleSheet } from 'react-native';
// import React, { Component } from 'react';
// import { DEVICE_SCREEN_HEIGHT, DEVICE_SCREEN_WIDTH } from '../config/config';
// import doodleImg from '../assets/doodle.png';
// import Axios from 'axios';
// import { SvgXml } from 'react-native-svg';
// import wheelIcon from './wheel.svg';
// import BottomAlignedModal from '../components/modals/BottomAlignedModal';

// export const FallBackUI = () => (
//     <ImageBackground source={doodleImg} style={{ backgroundColor: 'transparent', flex: 1, ...StyleSheet.absoluteFill }}>
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
//             <View style={{
//                 shadowColor: "#000",
//                 shadowOffset: {
//                     width: 0,
//                     height: 2,
//                 },
//                 shadowOpacity: 0.25,
//                 shadowRadius: 3.84,
//                 padding: 10,
//                 elevation: 5,
//                 backgroundColor: '#fff',
//                 height: DEVICE_SCREEN_HEIGHT * 0.5,
//                 width: DEVICE_SCREEN_WIDTH - 40,
//                 borderRadius: 5,
//                 justifyContent: 'center',
//                 alignItems: 'center'
//             }}>
//                 <View>
//                     <SvgXml xml={wheelIcon} height={80} width={80} />
//                 </View>
//                 <Text style={{ textAlign: 'center', fontSize: 20, color: '#7359BE' }}>
//                     Whoops!
//                 </Text>
//                 <Text style={{ textAlign: 'center', fontSize: 16, color: "#E2E2E2" }}>
//                     There seems to be problem with network!
//                 </Text>
//                 <View style={{ padding: 20 }}>
//                     <Button title="Try Again" color={'#7359BE'} onPress={() => DevSettings.reload()} />
//                 </View>
//             </View>
//         </View>
//     </ImageBackground>
// )


// export default class ErrorBoundary extends Component {
//     constructor(props) {
//         DevSettings
//         super(props);
//         this.state = { hasError: false };
//     }

//     static getDerivedStateFromError(error) {
//         // Update state so the next render will show the fallback UI.
//         console.log("[ErrorBoundary] getDerivedStateFromError :", error);
//         Axios.post(`/api/ErrorLog/FrontEndError/AddOrUpdate`, {
//             "userID": null,
//             "frontEndErrorID": 0,
//             "description": JSON.stringify({ error }),
//             "creationDate": null
//         })
//             .then(res => {
//                 console.log('[componentDidCatch].then().res :', res);
//                 return { hasError: true };

//             })
//             .catch(err => {
//                 console.log('[componentDidCatch].catch().err :', err)
//             })
//     }

//     componentDidCatch(error, errorInfo) {
//         // console.log("[ErrorBoundary] componentDidCatch error :", error);
//         // console.log("[ErrorBoundary] componentDidCatch errorInfo :", JSON.stringify(errorInfo));
//         if (error || errorInfo) {
//             // console.log("[ErrorBoundary] componentDidCatch error :", JSON.stringify({ error, errorInfo }));
//             this.setState({
//                 hasError: true
//             });
//         }
//     }
//     render() {
//         if (this.state.hasError) {
//             return <BottomAlignedModal
//                 visible={this.state.hasError}
//                 transparent={true}
//                 okHandler={() => { }}
//                 onRequestCloseHandler={() => { }}
//                 ModalContent={<FallBackUI />}
//                 modelViewPadding={0}
//                 modalFlex={1}
//                 androidKeyboardExtraOffset={0}
//             />
//         } else {
//             return this.props.children;
//         }

//     }
// }



// import { View, Text, Button, DevSettings, ImageBackground, StyleSheet } from 'react-native';
// import React, { Component } from 'react';
// import { DEVICE_SCREEN_HEIGHT, DEVICE_SCREEN_WIDTH } from '../config/config';
// import doodleImg from '../assets/doodle.png';
// import Axios from 'axios';
// import { SvgXml } from 'react-native-svg';
// import wheelIcon from './wheel.svg';
// import BottomAlignedModal from '../components/modals/BottomAlignedModal';
// import { TouchableOpacity } from 'react-native-gesture-handler';


// export const FallBackUI = props => (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
//         <View>
//             <SvgXml xml={wheelIcon} height={120} width={120} />
//         </View>
//         <Text style={{ textAlign: 'center', fontSize: 20, color: '#7359BE' }}>
//             Whoops!
//                 </Text>
//         <Text style={{ textAlign: 'center', fontSize: 16, color: "#707070", margin: 5 }}>
//             There seems to be problem with network!
//                 </Text>
//         <View style={{ padding: 20 }}>
//             <Button title="Try Again" color={'#7359BE'} onPress={props.onPress} />
       
//         </View>
//     </View>
// )


// export default class ErrorBoundary extends Component {
//     constructor(props) {
//         DevSettings
//         super(props);
//         this.state = { hasError: false };
//     }

//     static getDerivedStateFromError(error) {
//         // Update state so the next render will show the fallback UI.
//         console.log("[ErrorBoundary] getDerivedStateFromError :", error);
//         Axios.post(`/api/ErrorLog/FrontEndError/AddOrUpdate`, {
//             "userID": null,
//             "frontEndErrorID": 0,
//             "description": JSON.stringify({ error }),
//             "creationDate": null
//         })
//             .then(res => {
//                 console.log('[componentDidCatch].then().res :', res);
//                 return { hasError: true };

//             })
//             .catch(err => {
//                 console.log('[componentDidCatch].catch().err :', err)
//             })
//     }

//     componentDidCatch(error, errorInfo) {
//         // console.log("[ErrorBoundary] componentDidCatch error :", error);
//         // console.log("[ErrorBoundary] componentDidCatch errorInfo :", JSON.stringify(errorInfo));
//         if (error || errorInfo) {
//             // console.log("[ErrorBoundary] componentDidCatch error :", JSON.stringify({ error, errorInfo }));
//             this.setState({
//                 hasError: true
//             });
//         }
//     }

//     onPress = () => {
//         this.setState({
//             hasError: false
//         });
//         DevSettings.reload();
//     }
//     render() {
//         if (this.state.hasError) {
//             // return <BottomAlignedModal
//             //     visible={this.state.hasError}
//             //     transparent={true}
//             //     okHandler={this.onPress}
//             //     onRequestCloseHandler={this.onPress}
//             //     ModalContent={<FallBackUI onPress={this.onPress} />}
//             //     modelViewPadding={0}
//             //     modalFlex={1}
//             //     androidKeyboardExtraOffset={0}
//             // />
//         } else {
//             return this.props.children;
//         }

//     }
// }


// Dynaic Routes navigations logic by Mudassir

// let Test1 = prs => {
//     console.log("Test1.Props :", prs)
//     return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <Text>Test 1</Text>
//     </View>
// }
// let Test2 = prs => {
//     console.log("Test2.Props :", prs)
//     return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <Text>Test 2</Text>
//     </View>
// }
// let superMarketStacksArr = (mainDrawerProps, drawerProps, activeTheme, stackState, stackID) => {
//     let stacksArr = [{
//         screenName: "super_market_home_stack",
//         stackID,
//         Stacks: [{ name: "test1", screenView: (propss) => <Test1 {...propss} /> }, { name: "test2", screenView: (propss) => <Test2 {...propss} /> }]
//     }]
//     return <Animated.View style={StyleSheet.flatten([styles.stack, props.style])}>
//         <Stack.Navigator
//             screenOptions={{ headerShown: false }}
//             initialRouteName={stacksArr[stackID].Stacks[stackID].name}
//         >
//             {
//                 stacksArr[stackID].Stacks.map((row, componentIndex) => (
//                     <Stack.Screen key={componentIndex} name={row.name} options={props.options} children={childProps => row.screenView({ drawerProps, props: mainDrawerProps, activeTheme, stackState, stackID, childProps })} />
//                 ))
//             }
//         </Stack.Navigator>
//     </Animated.View>
// }

// let superMarketDrawerArr = (mainDrawerProps, activeTheme, stackState) => {
//     return [{
//         name: "super_market_home",
//     }].map((drawer, index) => <Drawer.Screen key={index} name={drawer.name} children={drawerProps => superMarketStacksArr(mainDrawerProps, drawerProps, activeTheme, stackState, index)} options={screenOpts} />)
// }
