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
        maxWidth: '90%', padding: 2 ,
        fontSize,
        color,
        fontFamily: plateformSpecific(androidFontsArray[fontIndex], iosFontsArray[fontIndex]),
        fontWeight,
    }),
    tabCounter: (props) => { return {right:-15, flex: 0.1, width: 30, height: 28, margin: 3, justifyContent: 'center', alignItems: 'center', borderColor: props.activeTheme.background, borderWidth: 1, borderRadius: 20, backgroundColor: props.activeTheme.background } },
    tabTextContainer: { flex: 0.8, alignSelf: 'flex-start', borderRadius: 25, left: 20, top: 5 },
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