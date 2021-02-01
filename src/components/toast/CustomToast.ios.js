import Toast from 'react-native-root-toast';
export default {
    success: (message, position, duration, shadow, animation, hideOnPress, delay, onShow, onShown, onHide, onHidden) => {
        // console.log("Toast.positions.BOTTOM :", Toast.positions.BOTTOM);
        // console.log("Toast.positions.CENTER :", Toast.positions.CENTER);
        // console.log("Toast.positions.TOP :", Toast.positions.TOP);
        return (
            Toast.show(message, {
                duration: duration && duration === 'long' ? Toast.durations.LONG : Toast.durations.SHORT,
                position: position && position === 'center' ? Toast.positions.CENTER : position === 'top' ? Toast.positions.TOP : Toast.positions.BOTTOM,
                shadow: shadow ? shadow : true,
                animation: animation ? animation : true,
                hideOnPress: hideOnPress ? hideOnPress : true,
                delay: delay ? delay : 0,
                onShow: onShow ? onShow : () => console.log('OnShow Called---'),
                onShown: onShown ? onShown : () => console.log('OnShown Called----'),
                onHide: onHide ? onHide : () => console.log('OnHide Called----'),
                onHidden: onHidden ? onHidden : () => console.log('OnHidden Called----')
            })
        )

    },
    error: (message, position, duration, shadow, animation, hideOnPress, delay, onShow, onShown, onHide, onHidden) => {
        return (
            Toast.show(message, {
                duration: duration && duration === 'long' ? Toast.durations.LONG : Toast.durations.SHORT,
                position: position && position === 'center' ? Toast.positions.CENTER : position === 'top' ? Toast.positions.TOP : Toast.positions.BOTTOM,
                shadow: shadow ? shadow : true,
                animation: animation ? animation : true,
                hideOnPress: hideOnPress ? hideOnPress : true,
                delay: delay ? delay : 0,
                onShow: onShow ? onShow : () => console.log('OnShow Called---'),
                onShown: onShown ? onShown : () => console.log('OnShown Called----'),
                onHide: onHide ? onHide : () => console.log('OnHide Called----'),
                onHidden: onHidden ? onHidden : () => console.log('OnHidden Called----')
            })
        )

    },
}
