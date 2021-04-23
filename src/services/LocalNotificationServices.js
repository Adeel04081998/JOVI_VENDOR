import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
const joviIcon = "https://jovipublic.s3.me-south-1.amazonaws.com/600x600.png";
class LocalNotificationService {
    configure = (onOpenNotification, onAction, onRegistrationError) => {
        // Must be outside of any component LifeCycle (such as `componentDidMount`).
        PushNotification.configure({

            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function (token) {
                console.log("[LocalNotificationService] onRegister TOKEN:", token);
            },

            // (required) Called when a remote is received or opened, or local notification is opened
            onNotification: function (notification) {
                console.log("[LocalNotificationService] NOTIFICATION:", notification);
                if (!notification.data) return;

                notification.userInteraction = true;
                onOpenNotification(Platform.OS === 'ios' ? notification.data.item : notification.data);
                // process the notification

                // (required) Called when a remote is received or opened, or local notification is opened
                if (Platform.OS === 'ios') notification.finish(PushNotificationIOS.FetchResult.NoData);
            },

            // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
            onAction: function (notification) {
                // make sure reciver tag added in AndroidManifest.xml

                // console.log("[LocalNotificationService] ACTION:", notification.action);
                // console.log("[LocalNotificationService] NOTIFICATION:", notification);
                // PushNotification.invokeApp(notification)
                onAction(notification)
                // process the action
            },

            // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
            onRegistrationError: function (err) {
                console.error("[LocalNotificationService] onRegistrationError :", err.message, err);
                onRegistrationError(err)
            },

            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: true,

            /**
             * (optional) default: true
             * - Specified if permissions (ios) and token (android and ios) will requested or not,
             * - if not, you must call PushNotificationsHandler.requestPermissions() later
             * - if you are not using remote notification or do not have Firebase installed, use this:
             *     requestPermissions: Platform.OS === 'ios'
             */
            requestPermissions: true,
        });
    }

    unRegister = () => PushNotification.unregister();
    createChannel = () => {
        PushNotification.channelExists('channel-id', (check) => {
            if (!check) {
                PushNotification.createChannel({
                    channelId: "channel-id", // (required)
                    channelName: "My channel", // (required)
                    channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
                    sound: "my_sound.mp3", // (optional) See `soundName` parameter of `localNotification` function
                    soundName: "my_sound.mp3", // (optional) See `soundName` parameter of `localNotification` function
                    importance: 4, // (optional) default: 4. Int value of the Android notification importance
                    vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
                },
                    (created) => console.log(`createChannel returned '${created}'`));
            }else{
                PushNotification.deleteChannel('channel-id',(created) => console.log(`Channel Deleted: '${created}'`))
            }
        })
        // PushNotification.deleteChannel('channel-id');
    }
    showNotification = (id, title, message, data = {}, options = {}, actions = []) => {
        console.log("showNotification called", options);
        PushNotification.createChannel(
            {
                channelId: "fcm_channel_id", // (required)
                channelName: "fcm_channel_name", // (required)
                channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
                soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
                importance: 4, // (optional) default: 4. Int value of the Android notification importance
                vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
                playSound: true
            },
            (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
        );
        PushNotification.localNotification({
            ...this.buildAndroidNotification(id, title, message, data, options),
            ...this.buildIOSNotification(id, title, message, data, options),
            title: title || "",
            message: message || "",
            playSound: options.playSound || true,
            soundName: options.soundName,
            sound: options.soundName,
            userInteraction: options.userInteraction || true,
            invokeApp: options.invokeApp || true,
            actions,
            ignoreInForeground: false
        })
    };
    buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
        console.log("buildAndroidNotification called");
        let initNotifyObj = {
            id,
            channelId: "fcm_channel_id", // (required)
            channelName: "fcm_channel_name", // (required)
            showWhen: true,
            autoCancel: true,
            bigText: message,
            subText: title,
            // visibility: "public",
            // importance: "high",
            vibrate: options.vibrate || true,
            vibration: options.vibration || 300,
            priority: options.priority || 'high',
            importance: options.importance || 'high',
            allowWhileIdle: options.allowWhileIdle || true,
            data,
            // Right side image
            largeIconUrl: joviIcon,
            smallIcon: "customer",
            soundName: "default",
            // largeIcon: joviIcon,
            // invokeApp: true,
            // imageUrl: "https://jovipublic.s3.me-south-1.amazonaws.com/600x600.png",
            // largeIconUrl: "https://www.uk2.net/blog/wp-content/uploads/domain-suffixes.jpg", for icon in message
            // bigPictureUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8cGljfGVufDB8fDB8&ixlib=rb-1.2.1&w=1000&q=80", // (optional) default: undefined
            // bigLargeIcon: "ic_launcher", // (optional) default: undefined
            // bigLargeIconUrl: "https://www.uk2.net/blog/wp-content/uploads/domain-suffixes.jpg", // (optional) default: undefined
        }
        if (Platform.OS === "android" && parseInt(DeviceInfo.getSystemVersion()) >= 10) {
            initNotifyObj = {
                ...initNotifyObj,
                data: {
                    ...initNotifyObj.data,
                    data: {
                        ...initNotifyObj.data?.data,
                        smallicon: "firebase",
                        color: "#7359BE",
                        soundName: "default",
                    },
                    notification: {
                        ...initNotifyObj.data.notification,
                        android: {
                            ...initNotifyObj.data.notification.android,
                            smallIcon: "firebase",
                            color: "#7359BE",
                            soundName: "default",
                        }
                    }
                },
                smallIcon: "firebase",
                color: "#7359BE"
            }
        }
        console.log("initNotifyObj", initNotifyObj);
        return initNotifyObj;
    };
    buildIOSNotification = (id, title, message, data = {}, options = {}) => {
        console.log("buildIOSNotification called");
        return {
            alertAction: options.alertAction || "view",
            category: options.category || "",
            userInfo: {
                id,
                item: data
            },
        }
    };
    buildIOSNotification = (id, title, message, data = {}, options = {}) => {
        return {
            alertAction: options.alertAction || "view",
            category: options.category || "",
            userInfo: {
                id,
                item: data
            },
        }
    };
    cancelAllLocalNotifications = () => {
        if (Platform.OS === "ios") PushNotificationIOS.removeAllDeliveredNotifications();
        else PushNotification.cancelAllLocalNotifications();
    };

    removeDeliveredNotificationByID = notificationID => {
        console.log("[LocalNotificationService] removeDeliveredNotificationByID:", notificationID);
        PushNotification.cancelLocalNotifications({ id: notificationID })
    }
};

export const localNotificationService = new LocalNotificationService();