import React from "react";
import { Image, View, Text, ImageBackground, StyleSheet } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import styles from './GetStartedJoviStyles';
import { navigationHandler } from "../../utils/sharedActions";
import colors from "../../styles/colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import doodleImg from '../../assets/doodle.png';
export default GetStartJovi = props => {
    return (
        <ImageBackground source={doodleImg} style={{ ...StyleSheet.absoluteFill }}>
            <View style={styles.container}>
                <View style={styles.wrapper}>
                    <Image style={styles.IcoImg} source={require('../../assets/GetStarterJovi/getStartedIco.png')} />
                    <TouchableOpacity style={styles.appButtonContainer} onPress={() => navigationHandler('OTP', {})}>
                        <Text style={styles.appButtonText}>Get started with jovi</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.btmBg}></View>
                <LinearGradient style={styles.overlayBg} colors={[...colors.gradientColors]} />
            </View>
        </ImageBackground>
    )

};
