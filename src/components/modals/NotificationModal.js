import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, Animated, Modal, View, Dimensions, Text, TouchableOpacity, BackHandler, KeyboardAvoidingView, Keyboard, Platform, TextInput, ImageBackground } from 'react-native';
import fontFamilyStyles from '../../styles/styles';
import { connect } from 'react-redux';
import { closeModalAction } from '../../redux/actions/modal';
import { getApiDetails, sharedAnimationHandler } from '../../utils/sharedActions';
import store from '../../redux/store';
import RatingsModal from './RatingsModal';
import dummy from '../../assets/orderImage.png';
// import dummy from '../../assets/card-image.png';
import IncomingJobModal from './IncomingJobModal';
import commonStyles from '../../styles/styles';
import { getRequest } from '../../services/api';
const FadeInView = (props) => {
    const fadeAnim = useRef(new Animated.Value(0)).current  // Initial value for opacity: 0
    const [state, setState] = useState(0);
    const infiniteLoop = () => {
        fadeAnim.setValue(0);
        Animated.timing(
            fadeAnim,
            {
                toValue: 0.7,
                duration: 1000,
            }
        ).start(({ finished }) => {
            if(finished === true){
                infiniteLoop();
            }
        });
    }
    useEffect(() => {
        console.log('Fade ----->>>>', fadeAnim)
        infiniteLoop();
    }, [])

    return (
        <Animated.View
            style={{
                ...props.style,
                opacity: fadeAnim,         // Bind opacity to animated value
            }}
        >
            {props.children}
        </Animated.View>
    );
}
const NotificationModal = props => {
    // console.log("BottomAlignedModal.Props :", props);
    const { height, width } = Dimensions.get('window');
    const { theme } = props;
    let activeTheme = theme.lightMode ? theme.lightTheme : theme.darkTheme;
    const { transparent, notificationModalVisible, vendorSkipped, notificationModalContent, okHandler, onRequestCloseHandler, dispatch, modalFlex, centeredViewFlex = 1, modelViewPadding, modalHeight, androidKeyboardExtraOffset = 0 } = props;
    const [state, setState] = useState({
        isKeyboardOpen: false,
        keyboardHeight: 0,
        animationView: new Animated.Value(height),
    });
    const _keyboardShowDetecter = e => {
        // console.log(e)
        sharedAnimationHandler(state.animationView, (height - e.endCoordinates.height - (Platform.OS === "android" ? androidKeyboardExtraOffset : 0)), 10);
        // setState(prevState => ({ ...prevState, isKeyboardOpen: true, keyboardHeight: e.endCoordinates.height }));
    };
    const _keyboardHideDetecter = () => {
        sharedAnimationHandler(state.animationView, height, 10);
        // setState(prevState => ({ ...prevState, isKeyboardOpen: false }));
    }
    useEffect(useCallback(() => {
        Keyboard.addListener('keyboardDidShow', _keyboardShowDetecter);
        Keyboard.addListener('keyboardDidHide', _keyboardHideDetecter);
        getApiDetails({ ...props, getRequest: getRequest });
        return () => {
            console.log('Notification Modal State Cleared-----');
            Keyboard.removeListener('keyboardDidShow', _keyboardShowDetecter);
            Keyboard.removeListener('keyboardDidHide', _keyboardHideDetecter);
            // BackHandler.removeEventListener('hardwareBackPress', bool => Alert.alert(bool));
        }
    }, []), []);
    // console.log("BottomAlignedModal.State :", state);


    return (
        <View style={{ ...styles.centeredView(centeredViewFlex) }}>
            <Modal
                animationType='fade'
                transparent={transparent}
                visible={notificationModalVisible}
                onRequestClose={() => dispatch(closeModalAction())}
            >
                <Animated.View style={styles.fadeAreaView(state, props)}>
                    <TouchableOpacity onPress={() => dispatch(closeModalAction())} style={{ ...styles.emptyView(props) }} />
                    <View style={{ flex: 1 }}>
                        <View style={styles.centeredView(centeredViewFlex)}>
                            <TouchableOpacity onPress={() => dispatch(closeModalAction())} style={styles.modalView(modelViewPadding, Dimensions.get('window').height, "center")}>
                                {/* {
                                    modalContentToRender
                                } */}
                                <View style={{ height: '50%', overflow: 'hidden', borderRadius: 10, backgroundColor: '#fff', width: '80%' }}>
                                    <View style={{ flex: 4, justifyContent: 'center', paddingHorizontal: 10, alignItems: 'center', alignContent: 'center' }}>
                                        <View style={{ width: '100%', padding: 20, height: '80%' }}>
                                                <ImageBackground source={dummy} style={{ height: '100%', width: '100%', alignSelf: 'center', overflow: 'hidden' }} resizeMode='contain'  >
                                                </ImageBackground>
                                            {/* <FadeInView style={{ width: '100%', height: '100%', }}> */}
                                            {/* </FadeInView> */}
                                        </View>
                                        <Text style={{ width: '90%', textAlign: 'center', ...commonStyles.fontStyles(16, activeTheme.black, 4) }}>{notificationModalContent?.orderMsg}</Text>
                                        <Text style={{ width: '90%', textAlign: 'center', ...commonStyles.fontStyles(16, activeTheme.black, 4) }}>Order No: {notificationModalContent?.orderId}</Text>
                                    </View>
                                    {vendorSkipped !== true && <TouchableOpacity onPress={() => { dispatch(closeModalAction()); props.navigation.navigate('Orders') }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: activeTheme.default }}>
                                        <Text style={{ ...commonStyles.fontStyles(16, activeTheme.white, 3) }}>View Details</Text>
                                    </TouchableOpacity>}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </Modal>
        </View >
    )
}
const styles = StyleSheet.create({
    centeredView: (centeredViewFlex) => ({ ...fontFamilyStyles.flexStyles(centeredViewFlex, undefined, 'flex-end', 'center') }),
    emptyView: p => ({
        flex: p.modalFlex ? p.modalFlex : 1.5,
    }),
    fadeAreaView: (state, props) => ({
        flex: 1,
        ...props.fadeAreaViewStyle,
        // This height is commented because of bottom issue of modal in s8
        // height: state.animationView,
        backgroundColor: 'rgba(0,0,0,0.5)',
    }),
    modalView: (modelViewPadding, modalHeight, alignItems) => {
        if (typeof modelViewPadding === "number") {
            modelViewPadding = { top: modelViewPadding, bottom: modelViewPadding, left: modelViewPadding, right: modelViewPadding };
        }
        return {
            // margin: 20,
            flex: modalHeight ? null : 1,
            height: modalHeight ? modalHeight : Dimensions.get('window').width,
            width: Dimensions.get('window').width,// - 30,
            // opacity:0.1,
            // backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            justifyContent: 'center', alignItems: 'center',
            // padding: modelViewPadding,
            paddingTop: modelViewPadding.top,
            paddingBottom: modelViewPadding.bottom,
            paddingLeft: modelViewPadding.left,
            paddingRight: modelViewPadding.right,
            alignItems,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        }
    },

});
const mapStateToProps = (store) => {
    return {
        user: store.userReducer,
        theme: store.themeReducer
    }
};
export default connect(mapStateToProps)(NotificationModal);
