import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Modal, View, Dimensions,Text, TouchableOpacity, BackHandler, KeyboardAvoidingView, Keyboard, Platform, TextInput } from 'react-native';
import fontFamilyStyles from '../../styles/styles';
import { connect } from 'react-redux';
import { closeModalAction } from '../../redux/actions/modal';
import Animated from 'react-native-reanimated';
import { sharedAnimationHandler } from '../../utils/sharedActions';
import store from '../../redux/store';
import RatingsModal from './RatingsModal';
import IncomingJobModal from './IncomingJobModal';

const NotificationModal = props => {
    // console.log("BottomAlignedModal.Props :", props);
    const { height, width } = Dimensions.get('window');
    const { transparent, notificationModalVisible, modalContentNotification, okHandler, onRequestCloseHandler, dispatch, modalFlex, centeredViewFlex = 1, modelViewPadding, modalHeight, androidKeyboardExtraOffset = 0 } = props;
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
        return () => {
            console.log('BottomAlignedModal State Cleared-----');
            Keyboard.removeListener('keyboardDidShow', _keyboardShowDetecter);
            Keyboard.removeListener('keyboardDidHide', _keyboardHideDetecter);
            // BackHandler.removeEventListener('hardwareBackPress', bool => Alert.alert(bool));
        }
    }, []), []);
    // console.log("BottomAlignedModal.State :", state);

    let modalContentToRender = modalContentNotification;

    return (
        <View style={{...styles.centeredView(centeredViewFlex)}}>
            <Modal
                animationType='fade'
                transparent={transparent}
                visible={notificationModalVisible}
                onRequestClose={ () => dispatch(closeModalAction())}
            >
                <Animated.View style={styles.fadeAreaView(state, props)}>
                    <TouchableOpacity onPress={ () => dispatch(closeModalAction())} style={{...styles.emptyView(props)}} />
                    <View style={{ flex: 1 }}>
                        <View style={styles.centeredView(centeredViewFlex)}>
                            <TouchableOpacity onPress={ () => dispatch(closeModalAction())} style={styles.modalView(modelViewPadding, Dimensions.get('window').height, "center")}>
                                {
                                    modalContentToRender
                                }
                                <View style={{height:'50%',overflow:'hidden',borderRadius:10,backgroundColor:'#fff',width:'70%'}}>
                                    <View style={{flex:4,backgroundColor:'red',justifyContent:'center',alignItems:'center'}}>
                                        <Text>asd</Text>
                                    </View>
                                    <View style={{flex:1}}>

                                    </View>
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
            height: modalHeight ? modalHeight :Dimensions.get('window').width ,
            width: Dimensions.get('window').width,// - 30,
            // opacity:0.1,
            // backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            justifyContent:'center',alignItems:'center',
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
        theme: store.themeReducer
    }
};
export default connect(mapStateToProps)(NotificationModal);
