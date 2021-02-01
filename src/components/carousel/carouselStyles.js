import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../styles/colors';
import plateformSpecific from '../../utils/plateformSpecific';
import constants from '../../styles/constants';
const winWidth = Dimensions.get('window').width;
const winHeight = Dimensions.get('window').height;
let { button } = colors;
let { androidFonts, iosFonts } = constants;
export default carouselStyles = StyleSheet.create({
    // Crousel render items styles
    renderItemsMainView: {
        // justifyContent: 'center',
        // alignItems: 'center',
        // flexDirection: 'column',
        // height: 'auto',

    },

    imageView: {
        // overflow: 'hidden',
        // maxWidth: '100%',
        // marginTop: 30,
    },
    image: {
        "backgroundColor": 'transparent',
        "opacity": 0.6,
        "borderTopLeftRadius": 20,
        "height": 170,
        "maxWidth": '86%',
        "paddingBottom": 50,
        // "borderTopRightRadius": 20,
        // "borderBottomLeftRadius": 20,
        // "borderBottomRightRadius": 20,
        // "borderColor": "#000",
        // "borderWidth": 1,
        // overflow: 'hidden'
        // "backgroundColor": "#7359BE",
    },
    imageTextView: {
        marginTop: 10, alignSelf: 'center', width: '50%'
    },
    imageText: {
        fontFamily: plateformSpecific(androidFonts.proxima_nova, iosFonts.proxima_nova), fontWeight: '400', fontStyle: 'normal', fontSize: 20, color: '#3E3E3E', lineHeight: 30, alignSelf: 'center', textAlign: 'center'
    },
})