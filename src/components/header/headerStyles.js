import { StyleSheet } from 'react-native';
import plateformSpecific from '../../utils/plateformSpecific';
import constants from '../../styles/constants';
// import fontFamilyStyles from '../../styles/styles';
const { androidFonts, iosFonts } = constants;
export default headerStyles = StyleSheet.create({
    "left": {
        flex: 0.1,
        // backgroundColor: 'red',
    },
    "body": {
        flex: 1,
        // backgroundColor: 'blue',

    },
    "right": {
        flex: 0.1,
        // display: 'none'
        // backgroundColor: 'green'

    },
    "leftIconContainer": {
        "marginLeft": 10,
        "opacity": 1,
        "backgroundColor": "transparent",
        // "zIndex": 999,
        // "position": 'absolute',
        // "alignSelf": 'center'
        // "position": "",
        // "left": 8,
        // backgroundColor: 'red'
    },
    "leftView": {
        'justifyContent': 'center',
        'backgroundColor': 'transparent',
        'width': 30,
        'height': 30,
        'borderRadius': 5,
        'borderColor': '#707070',
        'shadowRadius': 20,
        'shadowColor': '#000',
        'shadowOpacity': 0.3
    },
    "leftTouchableOpacity": {
        "backgroundColor": '#fff', "elevation": 3, "borderRadius": 7, "width": 35,
        "height": 35, "shadowColor": "#000", "marginLeft": plateformSpecific(5, 10),
        "borderColor": '#fff',
        "alignItems": "center", "justifyContent": "center"
    },
    "bodyView": activeTheme => ({
        'flex': 1,
        'width': '100%',
        'justifyContent': 'center',
        'alignItems': 'flex-start'
    }),
    "bodyText": (activeTheme, bodyContent) => ({
        'color': activeTheme.headerBodyText,
        'fontFamily': plateformSpecific(androidFonts.proxima_nova_bold, iosFonts.proxima_nova_bold),
        'fontSize': 20,
        'alignSelf': 'center',
        'marginRight': bodyContent.length <= 10 ? 40 : 0
        // "marginHorizontal": 5
    }),
});