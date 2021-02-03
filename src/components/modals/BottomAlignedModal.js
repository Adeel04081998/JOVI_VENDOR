import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Modal, View, Dimensions, TouchableOpacity, BackHandler, KeyboardAvoidingView, Keyboard, Platform, TextInput } from 'react-native';
import fontFamilyStyles from '../../styles/styles';
import { connect } from 'react-redux';
import { closeModalAction } from '../../redux/actions/modal';
import Animated from 'react-native-reanimated';
import { sharedAnimationHandler } from '../../utils/sharedActions';
import store from '../../redux/store';
import RatingsModal from './RatingsModal';
import IncomingJobModal from './IncomingJobModal';

const BottomAlignedModal = props => {
    // console.log("BottomAlignedModal.Props :", props);
    const { height, width } = Dimensions.get('window');
    const { transparent, visible, ModalContent, okHandler, onRequestCloseHandler, dispatch, modalFlex, centeredViewFlex = 1, modelViewPadding, modalHeight, androidKeyboardExtraOffset = 0 } = props;
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

    let modalContentToRender = null;
    if (ModalContent?.name === "ratings_pop_up") {
        modalContentToRender = (
            <RatingsModal
                {...props}
                targetRecord={{
                    userID: ModalContent?.data?.userID,
                    entityID: ModalContent?.data?.complaintID,
                    fromSignalR: ModalContent?.data?.fromSignalR,
                }}
                activeTheme={store.getState().themeReducer.lightTheme}
            />
        );
    }
    else if (ModalContent?.name === "incoming_job_modal") {
        modalContentToRender = (
            <IncomingJobModal
                {...props}
                activeTheme={store.getState().themeReducer.lightTheme}
            />
        );
    }
    else {
        modalContentToRender = ModalContent;
    }

    return (
        <View style={{...styles.centeredView(centeredViewFlex)}}>
            <Modal
                animationType='fade'
                transparent={transparent}
                visible={visible}
                onRequestClose={onRequestCloseHandler ? onRequestCloseHandler : () => dispatch(closeModalAction())}
            >
                <Animated.View style={styles.fadeAreaView(state, props)}>
                    <TouchableOpacity onPress={onRequestCloseHandler ? onRequestCloseHandler : () => dispatch(closeModalAction())} style={{...styles.emptyView(props)}} />
                    <View style={{ flex: 1 }}>
                        <View style={styles.centeredView(centeredViewFlex)}>
                            <View style={styles.modalView(modelViewPadding, modalHeight, ModalContent?.props?.alignItems ?? "center")}>
                                {
                                    modalContentToRender
                                }
                            </View>
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
            height: modalHeight ? modalHeight : null,
            width: Dimensions.get('window').width,// - 30,
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
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
export default connect(mapStateToProps)(BottomAlignedModal);
