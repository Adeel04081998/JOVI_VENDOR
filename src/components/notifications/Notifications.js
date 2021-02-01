import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import commonStyles from '../../styles/styles';
import { SvgXml } from 'react-native-svg';
import { sahredConvertIntoSubstrings, sharedGetNotificationsHandler, sharedTimeStampsHandler } from '../../utils/sharedActions';
import { postRequest } from '../../services/api';
import CustomToast from '../toast/CustomToast';
import { notifyAction } from '../../redux/actions/user';

export default ({ user, dispatch, activeTheme, onPress, }) => {
    const scrollRef = useRef(null);
    // const readNotificationHandler = pressedRecord => {
    //     onPress(pressedRecord);
    //     postRequest(
    //         `/api/Notification/NotificationLog/Add`,
    //         {
    //             "notificationLogID": pressedRecord.notificationLogID,
    //             "isRead": true
    //         },
    //         {},
    //         dispatch,
    //         res => {
    //             console.log('[readNotificationHandler] Resonse :', res);
    //             if (res.data.statusCode === 200) {
    //                 onPress(pressedRecord);
    //                 // let updateRecord = user.appNotifications.notificationListViewModel.map(doc => {
    //                 //     if (doc.notificationLogID === pressedRecord.notificationLogID) doc.isRead = true;
    //                 //     return doc;
    //                 // });
    //                 // dispatch(notifyAction({ ...user.appNotifications, notificationListViewModel: updateRecord }));

    //             }
    //         },
    //         err => {
    //             if (err) {
    //                 console.log('[readNotificationHandler] err :', err);
    //                 CustomToast.error('Something went wrong');
    //             }
    //             // console.log(err)
    //         },
    //         '',
    //         true)
    // };
    // console.log("Notifications.props.user :", user)
    // useEffect(useCallback(() => {
    //     sharedGetNotificationsHandler();
    // }, []), [])
    return (
        <View>
            <ScrollView style={{ paddingVertical: 10, marginBottom: 20 }}
                ref={scrollRef}
                onScroll={e => {
                    if (user.appNotifications.getNotificationLogViewModel.paginationInfo.totalPages === user.appNotifications.getNotificationLogViewModel.actualPage) return;
                    else {
                        // console.log('Notifications.onScroll Else called');
                        let paddingToBottom = 1
                        paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                        if (e.nativeEvent.contentOffset.y > e.nativeEvent.contentSize.height - paddingToBottom) {
                            sharedGetNotificationsHandler(postRequest, user.appNotifications.getNotificationLogViewModel.paginationInfo.actualPage + 1, user.appNotifications.getNotificationLogViewModel.paginationInfo.itemsPerPage, true, dispatch)
                        }
                    }
                }}
            >
                {
                    user.appNotifications.getNotificationLogViewModel.data.filter(n => n.isRead === false)
                        .map((doc, i) => (
                            <TouchableOpacity key={i} style={{ padding: 7 }} onPress={() => onPress(doc)}>
                                <Text style={{ ...commonStyles.fontStyles(15, activeTheme.black, 4) }}>{doc.entityType + " " + doc.entityID}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 4 }}>
                                    <Text style={{ ...commonStyles.fontStyles(13, activeTheme.black, 2) }}>{sahredConvertIntoSubstrings(doc.description, 40, 0, 40)}</Text>
                                    {
                                        doc.isRead ? null :
                                            <View style={{ backgroundColor: activeTheme.default, alignItems: 'center', justifyContent: 'center', height: 8, width: 8, borderRadius: 4 }} />
                                    }
                                </View>
                                <Text style={{ ...commonStyles.fontStyles(13, activeTheme.black, 2) }}>{sharedTimeStampsHandler(doc.dateTime, 'DD/MM/YYYY HH:mm')}</Text>
                                {/* <Text style={{ ...commonStyles.fontStyles(13, activeTheme.black, 2) }}>{doc.dateTime}</Text> */}
                            </TouchableOpacity>
                        ))
                }
            </ScrollView>
        </View>
    )
}
