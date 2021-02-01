import { StyleSheet } from 'react-native';
import plateformSpecific from '../../utils/plateformSpecific';
import constants from '../../styles/constants';
import fontFamilyStyles from '../../styles/styles';
const { androidFonts, iosFonts } = constants;
export default listStyles = StyleSheet.create({
    ...fontFamilyStyles,
    "listContainer": {
        flex: 1,
        backgroundColor: '#F9F8F8',
        marginTop: 10,
        minHeight: 60, borderRadius: 10, borderColor: "#707070", borderWidth: 0.2,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        marginHorizontal: 15

    },
    "listLeftContent": {
        flex: 6,
        overflow: 'hidden',
        // backgroundColor: 'red',
        // maxWidth: '80%'

    },
    "listLeftItems": {
        justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center'
    },
    "circleView": (activeTheme) => ({
        height: 50, margin: 5, width: 50, backgroundColor: activeTheme.background, borderRadius: 10, borderWidth: 0.1, borderColor: '#707070', justifyContent: 'center'
    }),
    "circleInnerText": {
        alignSelf: 'center', color: '#FFFFFF',
        fontFamily: plateformSpecific(androidFonts.proxima_nova_bold, iosFonts.proxima_nova_bold),
        fontSize: 20
    },
    "noteView": {
        // paddingLeft: 5
    },
    "noteText": {
        fontFamily: plateformSpecific(androidFonts.proxima_nova_regular, iosFonts.proxima_nova_regular),
        fontSize: 16,
        color: '#060606',
        marginLeft: 5,
    },
    "listRightView": {
        flex: 0,
        // backgroundColor: 'yellow',
        // maxWidth: '100%'
    },
    "listRightIconView": {
        alignSelf: 'flex-end', marginRight: 10
    },
});
