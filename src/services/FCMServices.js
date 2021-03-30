
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
// import notifee from '@notifee/react-native';

class FCMService {

    // we use this method to register notification service in our app.
    // we call this method in componetDidMount() so, we app load we get permission to 
    // display notification.
    register = (onRegister, onNotification, onOpenNotification) => {
        this.checkPermission(onRegister)
        // when register function call that time we create notification listener 
        this.createNoitificationListeners(onRegister, onNotification, onOpenNotification)
    }
    registerAppWithFCM = async () => {
        if (Platform.OS === "ios") {
            await messaging().registerDeviceForRemoteMessages();
            await messaging().setAutoInitEnabled(true);
        }
    }

    checkPermission = (onRegister) => {
        messaging().hasPermission()
            .then(enabled => {
                if (enabled) {
                    //user has permission
                    this.getToken(onRegister)
                } else {
                    //user don't have permission
                    this.requestPermission(onRegister)
                }
            }).catch(error => {
                console.log("Permission rejected", error)
            })
    }

    getToken = (onRegister) => {
        messaging().getToken()
            .then(fcmToken => {
                if (fcmToken) {
                    onRegister(fcmToken)
                } else {
                    console.log("User does not have a device token")
                }
            }).catch(error => {
                console.log("getToken rejected ", error)
            })
    }

    requestPermission = (onRegister) => {
        messaging().requestPermission()
            .then(() => {
                this.getToken(onRegister)
            }).catch(error => {
                console.log("Requested persmission rejected ", error)
            })
    }

    deletedToken = () => {
        messaging().deleteToken()
            .catch(error => {
                console.log("Delected token error ", error)
            })
    }

    createNoitificationListeners = (onRegister, onNotification, onOpenNotification) => {

        // When app is in background state and user is idle

        // messaging().onDeletedMessages(async () => {
        //     console.log('[FCMService] onDeletedMessages Ran---');
        //     await localNotificationService.cancelAllLocalNotifications();
        // })

        // When app is running but in background state
        // notifee.createChannel({
        //     id: 'custom-sound',
        //     name: 'Channel with custom sound',
        //     sound: 'my_sound.mp3',
        // });
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('[FCMService] onNotificationOpenedApp Notification caused app to open');
            if (remoteMessage) {
                onOpenNotification(remoteMessage.notification)
            }
        });
        // When app is opened from quite state
        messaging().getInitialNotification()
            .then(remoteMessage => {
                console.log('[FCMService] onNotificationOpenedApp Notification caused app to open');
                if (remoteMessage) {
                    onOpenNotification(remoteMessage.notification)
                }
            })
            .catch(err => console.log('[FCMService] getInitialNotification error'));

        // Triggered for data only payload  in foreground 
        this.messageListener = messaging().onMessage(async (remoteMessage) => {
            console.log('[FCMService] A new FCM message arrived :', remoteMessage);
            if (remoteMessage) {
                let notification = null;
                if (Platform.OS === 'ios') {
                    notification = remoteMessage.data.notification;
                } else {
                    notification = remoteMessage.notification
                }
                onNotification(notification)
            }
        });
        // Triggered when have new token
        messaging().onTokenRefresh(fcmToken => {
            console.log('[FCMService] new refresh token :', fcmToken);
            onRegister(fcmToken);
        })
    };

    unRegister = () => {
        this.messageListener()
    }
}
export const fcmService = new FCMService()