import { ToastAndroid } from 'react-native';
export default {
    success: (message, position, duration, shadow, animation, hideOnPress, delay, onShow, onShown, onHide, onHidden) => {
        return ToastAndroid.showWithGravity(message, duration && duration === 'long' ? ToastAndroid.LONG : ToastAndroid.SHORT, position && position === 'center' ? ToastAndroid.CENTER : position === 'top' ? ToastAndroid.TOP : ToastAndroid.BOTTOM);
    },
    error: (message, position, duration, shadow, animation, hideOnPress, delay, onShow, onShown, onHide, onHidden) => {
        // console.log("ToastAndroid.LONG====== :", ToastAndroid.LONG + 5)
        return ToastAndroid.showWithGravity(message, duration && duration === 'long' ? ToastAndroid.LONG : ToastAndroid.SHORT, position && position === 'center' ? ToastAndroid.CENTER : position === 'top' ? ToastAndroid.TOP : ToastAndroid.BOTTOM);
    },
}
