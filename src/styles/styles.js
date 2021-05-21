import plateformSpecific from "../utils/plateformSpecific";
import constants from "./constants";
const { androidFontsArray, iosFontsArray } = constants;
export const tabStyles = {
    tabContainer: (activeTheme,shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation) => ({ height: 110, backgroundColor: '#fff', borderColor: activeTheme.borderColor, borderWidth: 0.5, borderRadius: 15, flexDirection: 'row', marginVertical: 5,shadowColor: shadowColor || "#000",
    shadowOffset: shadowOffset || {
        width: 0,
        height: 2,
    },
    shadowOpacity: shadowOpacity || 0.25,
    shadowRadius: shadowRadius || 3.84,
    elevation: elevation || 1 }),
    tabTitle:(fontSize, color, fontIndex, fontWeight,)=>({
        fontSize,
        color,
        fontFamily: plateformSpecific(androidFontsArray[fontIndex], iosFontsArray[fontIndex]),
        fontWeight,
        marginTop: 0
    }),
    tabDescription:(fontSize, color, fontIndex, fontWeight,)=>({
        maxWidth: '83%', padding: 2 ,
        fontSize,
        color,
        fontFamily: plateformSpecific(androidFontsArray[fontIndex], iosFontsArray[fontIndex]),
        fontWeight,
    }),
    tabCounter: (props,noOfItems) => { return {right:-15, flex: 0.1, width:noOfItems>99?50:30, height: 28, margin: 3, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 20, backgroundColor: props.activeTheme.background } },
    tabTextContainer: { flex: 0.8, alignSelf: 'flex-start', borderRadius: 25, left: 8, top: 5 },
    imageTabContainer: {  margin: 7,height:95,width:110, overflow: 'hidden', borderRadius: 10 },
    imageTab: {
        width: '100%',
        "height": "100%",
    },
}
export default fontFamilyStyles = {
    "flexStyles": (flex, flexDirection, justifyContent, alignItems, alignContent, flexWrap, flexGrow, backgroundColor) => {
        return {
            flex,
            flexDirection,
            justifyContent,
            alignItems,
            alignContent,
            flexWrap,
            flexGrow,
            backgroundColor
        }
    },
    "caption": {
        position: "relative",
        left: 10,
        fontSize: 15,
        color: '#7359BE',
        marginVertical: 10,
    },
    "wrapper":{
         // alignItems: 'flex-start',
         flexDirection: 'column',
         backgroundColor: '#fff',
         width: '100%', //'85%'
         borderTopLeftRadius: 10,
         borderTopRightRadius: 10,
         // position: 'absolute',
         bottom: 0,
         height: '100%',
         justifyContent: 'center',
         alignSelf: 'center',
         zIndex: 5,
         shadowColor: '#000',
         // paddingLeft: 15,
         // paddingRight: 15,
         paddingTop: 15,
         paddingBottom: 0, //15
         shadowOffset: {
             width: 0,
             height: 2,
         },
         shadowOpacity: 0.25,
         shadowRadius: 3.84,
         elevation: 5
    },
    "borderedViewStyles": (borderRadius, borderWidth, borderColor, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius, borderTopLeftRadius, backgroundColor) => {
        return {
            borderRadius,
            borderWidth,
            borderColor,
            borderTopRightRadius,
            borderBottomRightRadius,
            borderBottomLeftRadius,
            borderTopLeftRadius,
            backgroundColor,
        }
    },
    "fontStyles": (fontSize, color, fontIndex, fontWeight,) => ({
        fontSize,
        color,
        fontFamily: plateformSpecific(androidFontsArray[fontIndex], iosFontsArray[fontIndex]),
        fontWeight
    }),
    "shadowStyles": (shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation) => ({
        shadowColor: shadowColor || "#000",
        shadowOffset: shadowOffset || {
            width: 0,
            height: 2,
        },
        shadowOpacity: shadowOpacity || 0.25,
        shadowRadius: shadowRadius || 3.84,
        elevation: elevation || 1
    })
}