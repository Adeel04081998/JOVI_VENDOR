import plateformSpecific from "../utils/plateformSpecific";
import constants from "./constants";
const { androidFontsArray, iosFontsArray } = constants;
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