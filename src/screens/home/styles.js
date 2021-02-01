import { StyleSheet, Dimensions } from 'react-native';
import plateformSpecific from '../../utils/plateformSpecific';
import constants from '../../styles/constants';
import commonStyles from '../../styles/styles';
export default menuStyles = StyleSheet.create({
    "taskView": {
        "backgroundColor": "rgba(115, 89, 190, 1)",
        "borderRadius": 50,
        "width": '90%',
        "height": 'auto',
        "alignSelf": 'center',
        "borderTopColor": "rgba(255, 255, 255, 1)",
        "borderRightWidth": 2,
        "borderRightColor": "rgba(255, 255, 255, 1)",
        "borderBottomWidth": 2,
        "borderBottomColor": "rgba(255, 255, 255, 1)",
        "borderLeftWidth": 2,
        "borderLeftColor": "rgba(255, 255, 255, 1)",
        "borderTopWidth": 2,
        "borderTopColor": "rgba(255, 255, 255, 1)",
    },
    "textView": { 'margin': 10, 'alignSelf': 'center' },
    "taskText": { "color": "rgba(255, 255, 255, 1)" },
    "headerImg": { 'width': 40 },
    // Header Body
    "headerBodyAndroid": {

    },
    // Carousal Styles
    "carouselView": {
        "flex": 1,
        "borderRadius": 20,
        "overflow": 'hidden',
    },
    "contentView": {
        "borderTopLeftRadius": 20,
        "borderTopRightRadius": 20,
        "borderBottomLeftRadius": 20,
        "borderBottomRightRadius": 20,
        'margin': 25,
        'marginTop': 0,
        "flex": 1,
        "backgroundColor": '#FFFFFF',
        // "backgroundColor": 'grey',
        "overflow": 'hidden'
        // "flexGrow": 6,
        // "height": screenHeight / 2,
        // alignSelf: 'auto',
        // flexDirection: 'column'
        // width: '100%',
        // position: ""
    },
    "contentText": {
        width: '70%',
        lineHeight: 30,
        ...commonStyles.fontStyles(20, '#000', 2,)
    },
    "footerView": { position: 'absolute', left: 0, right: 0, bottom: 0 },
    // "footerView": { "marginTop": screenHeight, "left": 0, "top": 0, "width": winWidth, "position": 'absolute', "flexDirection": 'column', "alignSelf": 'flex-end', "justifyContent": 'flex-end', "backgroundColor": '#7359BE' },
    "footerWrapper": { maxHeight: 110, "backgroundColor": '#7359BE', "bottom": 0, "justifyContent": 'space-evenly', "flexDirection": 'row' },
    "footerTabs": {
        "backgroundColor": '#fff',
        "height": 120,
        "width": 90,
        "borderTopLeftRadius": 20,
        "borderTopRightRadius": 20,
        "borderBottomLeftRadius": 20,
        "borderBottomRightRadius": 20,
        "marginLeft": 5,
        "borderWidth": 0.1,
        "borderColor": '#707070',
        elevation: 3,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    "thinText": {
        ...commonStyles.fontStyles(14, undefined, 2)
    },
    "mainText": {
        bottom: 5,
        ...commonStyles.fontStyles(15, undefined, 4)
    },
    "btnText": {
        ...commonStyles.fontStyles(16, undefined, 3),
        color: '#7359BE',
        // fontWeight: '300', fontSize: 18, color: '#7359BE', fontFamily: plateformSpecific(androidFonts.proxima_nova_normal, iosFonts.proxima_nova)
    }
})

// export default menuStyles;