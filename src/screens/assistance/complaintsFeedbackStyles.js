import { StyleSheet, Dimensions, Platform } from 'react-native';
import plateformSpecific from '../../utils/plateformSpecific';
import constants from '../../styles/constants';
import commonStyles from '../../styles/styles'
const { androidFonts, iosFonts } = constants;
export default complaintFeedbackStyles = StyleSheet.create({
    ...commonStyles,
    // Header
    "leftIcon": {
        "opacity": 1,
        "backgroundColor": "transparent",
        // "position": "",
        // "left": 8,
        // backgroundColor: 'red'
    },
    "content": {
        "flex": 1,
        'paddingHorizontal': 15,
        'marginTop': 0,
        // margin: 20,
    },
    "bodyText": {
        'color': '#7359BE',
        'fontFamily': plateformSpecific(androidFonts.proxima_nova_bold, iosFonts.proxima_nova_bold),
        'fontSize': 20
    },
    "scrollView": {
        'flex': 1,
        'paddingVertical': 10
    },
    // Complaints Details Screen Styles 
    "backgroundImg": {
        'flex': 1,
    },
    "headerLeftIconView": {
        'justifyContent': 'center', backgroundColor: '#FFFFFF', width: 40, height: 40, borderRadius: 5, borderColor: '#707070', shadowRadius: 20, shadowColor: '#000', shadowOpacity: 0.3
    },
    "svgTag": {
        'alignSelf': 'center'
    },
    "submitBtn": (activeTheme) => ({
        'justifyContent': 'center',
        'alignItems': 'center',
        'backgroundColor': activeTheme.background,
        'height': 50,
        // 'marginVertical': 10,
        // 'top': 5,
        // 'margin': 20,
        // 'borderRadius': 10,
        // 'borderWidth': 0.1,
        // 'elevation': 3,
        // 'width': Dimensions.get('window').width
    }),
    "footerContainer": {
        'flex': 1,
        'justifyContent': 'center',
        'alignItems': 'center',
        'paddingVertical': 30,
    },
    "footerView": {
        'justifyContent': 'center',
        'alignItems': 'center',
        'margin': 5,
        'paddingBottom': 20
        // 'height': 50
    },
    "footerText": activeTheme => ({
        ...commonStyles.fontStyles(14, activeTheme.background, 1)
    }),
    // Contact Us Styles
    "content": {
        flex: 1,
        ...commonStyles.fontStyles(20, '#fff', 4),
        // backgroundColor: 'r'
        // top: Platform.OS === "android" ? 5 : 0,
    },
    "textInputArea": {
        ...commonStyles.borderedViewStyles(7, 0.1, '#707070'),
        'textAlignVertical': 'top',
        'backgroundColor': '#FFFFFF'
    },
    "attachImgView": {
        ...commonStyles.borderedViewStyles(7, 0.3, '#707070'),
        ...commonStyles.flexStyles(1, 'row', 'center', 'center'),
        'height': 50,
        'marginTop': 10
    },
    "submitBtnView": activeTheme => ({
        'height': 50,
        'marginTop': 10,
        'backgroundColor': activeTheme.background,
        'justifyContent': 'center',
        'alignItems': 'center',
        ...commonStyles.borderedViewStyles(7, 0.3, activeTheme.background)
    })
});
// export default {
//     complaintFeedbackStyles,
// };