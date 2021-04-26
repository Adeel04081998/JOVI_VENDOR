import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import commonStyles from '../../styles/styles';
// import loaderSVG from './loader.svg';
// import { SvgXml } from 'react-native-svg';
import loaderGif from './loader.gif';
// import Spinner from 'react-native-spinkit';


function Loader({ loaderState, theme }) {
    // const { isVisible, message, color, type, size } = loaderState;
    // let activeTheme = theme.lightMode ? theme.lightTheme : theme.darkTheme;

    return (
        <View style={styles.container}>
            {/* <SvgXml xml={loaderSVG} height={100} width={100} /> */}
            <ImageBackground source={loaderGif} style={{opacity:10, width: 300, height: 300 }} />
            {/* <Spinner style={styles.spinner} isVisible={isVisible} size={size} type="WanderingCubes" color={color} /> */}
            {/* <Text style={styles.messageText(activeTheme)}>{message}</Text> */}
        </View>
    )
}

var styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'grey',
        position: 'absolute',
        opacity: 1
    },
    messageText: activetheme => ({
        ...commonStyles.fontStyles(20, activetheme.white, 4),

    }),
    spinner: {
        marginBottom: 30
    },

    btn: {
        marginTop: 20
    },

    text: {
        color: "white"
    }
});

export default Loader;
