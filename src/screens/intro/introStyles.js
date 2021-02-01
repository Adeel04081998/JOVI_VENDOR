import { StyleSheet, Dimensions } from 'react-native';
import plateformSpecific from '../../utils/plateformSpecific';
import colors from '../../styles/colors';
import constants from '../../styles/constants';
const winWidth = Dimensions.get('window').width;
const winHeight = Dimensions.get('window').height;
let { button } = colors;
let { androidFonts, iosFonts } = constants;
export default styles = StyleSheet.create({
    // Background Image Styles
    backgroundImage: {
        flex: 1
        // height: winHeight, width: winWidth
    },
    // Crousel render items styles
    renderItemsMainView: {
        flex: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        // height: 'auto',
        // backgroundColor: 'red'
    },
    imageView: {
        // left: 35,
        // alignSelf: 'center',
        width: winWidth,
        // marginTop: 30,
    },
    image: {
        // flex: 1,
        alignSelf: 'center',
        height: (winHeight / 2) - 50,
        width: winWidth - 20,
        backgroundColor: 'transparent'
    },
    imageTextView: {
        top: 20,
        alignSelf: 'center',
        width: '80%'
    },
    imageText: {
        fontFamily: plateformSpecific(androidFonts.proxima_nova, iosFonts.proxima_nova), fontWeight: '400', fontStyle: 'normal', fontSize: 20, color: '#3E3E3E', lineHeight: 30, alignSelf: 'center', textAlign: 'center'
    },
    // Pagination Styles
    paginationMainView: {
        position: 'absolute', justifyContent: 'flex-end', flexDirection: 'column', height: winHeight - 120, alignSelf: 'center'
    },
    containerStyle: {
        backgroundColor: 'transparent', marginTop: 40
    },
    dotStyle: {
        width: 13,
        height: 13,
        borderRadius: 60,
        marginHorizontal: 6,
        backgroundColor: button.color,
    },
    inactiveDotStyle: {
        width: 12,
        height: 12,
        backgroundColor: '#333333'
    },
    // Header styles
    headerRightText: {
        color: button.color,
        fontStyle: 'normal',
        fontWeight: '400',
        fontFamily: plateformSpecific(androidFonts.proxima_nova, iosFonts.proxima_nova)
    }

});