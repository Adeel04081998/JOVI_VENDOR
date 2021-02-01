import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

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

    showNotification = (id, title, message, data = {}, options = {}, actions = []) => {
        console.log("showNotification called");
        PushNotification.localNotification({
            ...this.buildAndroidNotification(id, title, message, data, options),
            ...this.buildIOSNotification(id, title, message, data, options),
            title: title || "",
            message: message || "",
            playSound: options.playSound || false,
            soundName: options.soundName || "default",
            userInteraction: options.userInteraction || false,
            invokeApp: options.invokeApp || true,
            actions,
            ignoreInForeground: true
        })
    };

    buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
        console.log("buildAndroidNotification called");
        return {
            id,
            autoCancel: true,
            largeIcon: options.largeIcon || "",
            smallIcon: options.smallIcon || "",
            bigText: message,
            subText: title,
            vibrate: options.vibrate || true,
            vibration: options.vibration || 300,
            priority: options.priority || 'high',
            importance: options.importance || 'high',
            data,

            // largeIcon: options.largeIcon || "ic_launcher",
            // smallIcon: options.smallIcon || "ic_notification",

            // largeIconUrl: "https://www.uk2.net/blog/wp-content/uploads/domain-suffixes.jpg", for icon in message
            // bigPictureUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8cGljfGVufDB8fDB8&ixlib=rb-1.2.1&w=1000&q=80", // (optional) default: undefined
            // bigLargeIcon: "ic_launcher", // (optional) default: undefined
            // bigLargeIconUrl: "https://www.uk2.net/blog/wp-content/uploads/domain-suffixes.jpg", // (optional) default: undefined
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