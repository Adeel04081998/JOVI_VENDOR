import { StyleSheet, Dimensions } from 'react-native';
import plateformSpecific from '../utils/plateformSpecific';
import constants from '../styles/constants';
import { DEVICE_SCREEN_HEIGHT, isJoviCustomerApp } from '../config/config';
const { androidFonts, iosFonts } = constants;
export default styles = StyleSheet.create({
    headerView: { flex: 2 },
    headerImage: { height: 50, width: 50, borderRadius: 25 },
    contentView: { flex: 10, top: isJoviCustomerApp ? 0 : 15 },
    // drawerContentItems: { backgroundColor: 'red' },
    drawerContentItems: { fontFamily: plateformSpecific(androidFonts.proxima_nova, iosFonts.proxima_nova), fontWeight: 'bold' },
    drawerFooterView: { marginBottom: DEVICE_SCREEN_HEIGHT <= 640 ? 10 : 25, flexDirection: 'row' },
    drawerFooterItems: {}

})