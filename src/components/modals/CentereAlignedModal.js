import React from 'react';
import { StyleSheet, Modal, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import fontFamilyStyles from '../../styles/styles';
import doneIcon from '../../assets/svgIcons/common/done.svg';
import { SvgXml } from 'react-native-svg';

const CenterAlignedModal = props => {
    const { transparent, visible, title, okHandler, onRequestCloseHandler, parentState, parentProps } = props;
    const { activeTheme } = parentProps;
    // console.log(parentState);
    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="fade"
                transparent={transparent}
                visible={visible}
                onRequestClose={onRequestCloseHandler}
            >

                <View style={styles.fadeAreaView}>
                    <TouchableOpacity onPress={onRequestCloseHandler} style={styles.emptyView()} />
                    <View style={{ flex: 0.6 }}>
                        {/* <View style={styles.centeredView}> */}
                        <View style={styles.modalView}>
                            <View style={{ paddingVertical: 10 }}>
                                <SvgXml xml={doneIcon} height={60} width={60} />
                            </View>
                            <View>
                                <Text style={styles.modalText(activeTheme)}>Email Confirmation</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalDesc(activeTheme)}>Are you sure you want to receive the code at <Text style={{ fontWeight: 'bold', color: activeTheme.black }}>{parentState.email}</Text>? If you would like to change your email ID, please press Edit.</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={onRequestCloseHandler} style={{ ...styles.openButton }}>
                                        <Text style={styles.textStyle}>{"Edit"}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={okHandler} style={[styles.openButton, { left: 1 }]}>
                                        <Text style={styles.textStyle}>{"Continue"}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                {/* </View> */}
            </Modal>
        </View >
    )
}
const styles = StyleSheet.create({
    centeredView: {
        ...fontFamilyStyles.flexStyles(1, undefined, 'flex-end', 'center'),
    },
    emptyView: modalFlex => ({
        flex: 1,
        // backgroundColor: 'yellow'
    }),
    fadeAreaView: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        // margin: 20,
        flex: 1,
        width: Dimensions.get('window').width,
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        // padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    openButton: {
        flex: 1,
        backgroundColor: "#7359BE",
        // borderRadius: 5,
        elevation: 3,
        height: 60,
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        // margin: 20
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: activeTheme => ({
        margin: 10,
        ...fontFamilyStyles.fontStyles(18, activeTheme.black, 4),
        textAlign: "center"
    }),
    modalDesc: activeTheme => ({
        ...fontFamilyStyles.fontStyles(16, activeTheme.black, 3),
        // paddingVertical: 10,
        // padding: 10,
        textAlign: "center",
        lineHeight: 21,
        // alignSelf: 'center',
        // textAlign: 'center'
    }),
    modalBodyText: {
        margin: 10,
        ...fontFamilyStyles.fontStyles(16, '#000000', 1),
        textAlign: "center"
    }
});

export default CenterAlignedModal;
