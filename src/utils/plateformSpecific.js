import { Platform } from 'react-native';
export default (androidStuff, iosStuff) => {
    if (Platform.OS === 'ios') return iosStuff
    else return androidStuff
}