import React, { useRef } from 'react';
import { DEVICE_SCREEN_WIDTH } from '../../config/config';
import CustomRatings from '../../components/ratings';
import commonStyles from '../../styles/styles';
import { View, Text, TouchableOpacity } from 'react-native';
import { closeModalAction } from '../../redux/actions/modal';
import { postRequest } from '../../services/api';
import CustomToast from '../../components/toast/CustomToast';
import { updateNotifyAction } from '../../redux/actions/user';
import NavigationService from '../../routes/NavigationService';
export default ({ targetRecord, activeTheme, navigation, dispatch, user, userID }) => {
    // console.log('[RatingsModal] targetRecord :', targetRecord);
    // console.log('[RatingsModal] navigation :', navigation);
    const ratingsPayload = useRef(null);
    const readNotificationHandler = pressType => {
        // click types = {
        // 1 for user gave ratings means isReady should be true
        // 2 for user pressed remind me later means isRead should be false
        // }
        // console.log("readNotificationHandler.ratingsPayload : ", ratingsPayload.current);
        dispatch(closeModalAction());
        postRequest(
            `/api/Notification/NotificationLog/Add`,
            {
                "notificationLogID": targetRecord.notificationLogID,
                "isRead": pressType === 1 ? true : false
            },
            {},
            dispatch,
            res => {
                console.log('[readNotificationHandler] Resonse :', res);
            },
            err => {
                if (err) {
                    console.log('[readNotificationHandler] err :', err);
                    CustomToast.error('Something went wrong');
                }
            },
            '',
            false)
    }
    const sendRatingsToServer = pressType => {
        // pressType 0 for remind me later 1  for ratings
        // console.log('[sendRatingsToServer] ratingsPayload.current-- :', ratingsPayload.current);
        let formData = new FormData();
        if (pressType === 0) {
            formData.append("complaintID", parseInt(targetRecord.entityID));
            formData.append("RemindMeLater", true);
            formData.append("rating", 0);
            formData.append("OrderID", 0);
        } else {
            formData.append("complaintID", parseInt(targetRecord.entityID));
            formData.append("rating", ratingsPayload?.current.rating);
            formData.append("RemindMeLater", false);
        }
        postRequest(
            `/api/Order/Complaint/AddOrUpdate`,
            formData,
            { headers: { 'content-type': 'multipart/form-data' } },
            dispatch,
            success => {
                console.log("[sendRatingsToServer].Success :", success);
                if (success.data.statusCode === 200) {
                    dispatch(closeModalAction());
                    if (pressType === 1) {
                        CustomToast.success('Thankyou for your feedback');
                        if (targetRecord?.fromSignalR) return;
                        else {
                            let updateRecord = user.appNotifications.getNotificationLogViewModel.data.map(doc => {
                                if (doc.notificationLogID === targetRecord.notificationLogID) doc.isRead = true;
                                return doc;
                            });
                            // console.log("updateRecord :", updateRecord);
                            dispatch(updateNotifyAction(updateRecord));
                            readNotificationHandler(1);
                        }
                    }
                }
            },
            err => {
                console.log("[sendRatingsToServer].error :", err);
                if (err) {
                    // dispatch(closeModalAction());
                    CustomToast.error('Something went wrong');
                }

            },
            "",
            false
        )
    };
    return (
        <View style={{ flex: 1, width: DEVICE_SCREEN_WIDTH }}>
            <View style={{ padding: 30 }}>
                <Text style={{ textAlign: 'center', ...commonStyles.fontStyles(15, undefined, 4), paddingVertical: 3 }}>{`Complaint# ${targetRecord.entityID}`}</Text>
                <TouchableOpacity onPress={() => {
                    dispatch(closeModalAction());
                    NavigationService?.navigate('complaints_feedback_container', {
                        // shouldModalOpen: !targetRecord.isRead,
                        shouldModalOpen: false,
                        screen: 'complaint_details',
                        complaintID: parseInt(targetRecord.entityID),
                        dataParams: {
                            targetRecord,
                            cb: () => readNotificationHandler(2)
                        },
                        backScreenObj: {
                            container: "home",
                            screen: "home"
                        }
                    });
                }}>
                    <Text style={{ textAlign: 'center', ...commonStyles.fontStyles(15, activeTheme.default, 1), paddingVertical: 5 }}>View details</Text>
                </TouchableOpacity>
                <Text style={{ textAlign: 'center', ...commonStyles.fontStyles(15, undefined, 4) }}>How was your experience ?</Text>
                <View style={{ marginTop: 10 }}>
                    <CustomRatings
                        margin={3}
                        initialCount={0}
                        disabled={false}
                        starHeight={30}
                        starWidth={30}
                        styles={{}}
                        // onPress={count => onRatingsPress(count)}
                        onPress={count => {
                            ratingsPayload.current = {
                                ...ratingsPayload?.current,
                                rating: count
                            }
                        }}
                    />
                </View>
                <TouchableOpacity style={{ justifyContent: "center", alignItems: 'center', paddingVertical: 20 }} onPress={() => sendRatingsToServer(0)}>
                    <Text style={commonStyles.fontStyles(15, activeTheme.validationRed, 4)}>Remind me later</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableOpacity style={{ justifyContent: "center", alignItems: 'center', paddingVertical: 20, backgroundColor: activeTheme.default }} onPress={() => sendRatingsToServer(1)}>
                    <Text style={commonStyles.fontStyles(14, activeTheme.white, 1)}>Submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
