import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Dimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import commonStyles from '../../styles/styles';
const CommentSubmitContent = props => {
    const { activeTheme, title, bodyMessage, btnText, iconXml, okHandler, cbTitle } = props;
    const { width, height } = Dimensions.get('window');
    return (
        <>
            <SvgXml xml={iconXml} height={40} width={60} />
            <Text style={styles.modalText(activeTheme, width, height)}>{title}</Text>
            <Text style={styles.modalBodyText(activeTheme, width, height)}>{bodyMessage}</Text>

            <TouchableWithoutFeedback onPress={(e) => okHandler(e, cbTitle)}>
                <View style={{ ...styles.openButton(activeTheme, width, height) }}>
                    <Text style={styles.textStyle(activeTheme, width, height)}>{btnText}</Text>
                </View>
            </TouchableWithoutFeedback>
        </>
    )
}
const styles = StyleSheet.create({
    modalText: (theme, windWidth, winHeight) => ({
        margin: 10,
        ...fontFamilyStyles.fontStyles(18, '#000000', 4),
        textAlign: "center"
    }),
    modalBodyText: (theme, windWidth, winHeight) => ({
        margin: 10,
        ...fontFamilyStyles.fontStyles(16, '#000000', 1),
        textAlign: "center"
    }),
    openButton: (theme, windWidth, winHeight) => ({
        backgroundColor: "#7359BE",
        borderRadius: 20,
        elevation: 3,
        height: 50,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    }),
    textStyle: (theme, windWidth, winHeight) => ({
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    }),
    "headerText": (theme, windWidth, winHeight) => ({
        ...commonStyles.fontStyles(14, theme.default, 1),
    }),
    "emailUsView": (theme, windWidth, winHeight) => ({
        height: 40,
        backgroundColor: theme.default,
        width: windWidth - 80,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
        // ...commonStyles.fontStyles(14, theme.default, 1),
    }),
    "emailUsText": (theme, windWidth, winHeight) => ({
        ...commonStyles.fontStyles(14, theme.white, 1),
    }),
    "contactUsView": (theme, windWidth, winHeight) => ({
        height: 40,
        backgroundColor: theme.grey,
        width: windWidth - 80,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5
        // ...commonStyles.fontStyles(14, theme.default, 1),
    }),
    "contactUsText": (theme, windWidth, winHeight) => ({
        ...commonStyles.fontStyles(14, theme.black, 1),
    }),
})

export default CommentSubmitContent;
