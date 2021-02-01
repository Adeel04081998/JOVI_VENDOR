import React from 'react';
import { StyleSheet, Modal, View, Text, Dimensions, ScrollView, Image, TouchableOpacity } from 'react-native';
import fontFamilyStyles from '../../styles/styles';
// import pkFlag from '../../assets/1.png';
import { SvgCssUri } from 'react-native-svg';
// import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';

export default function CustomPicker({ data, activeTheme, setSelectedValue, togglePicker, showPicker }) {
    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showPicker}
                onRequestClose={() => togglePicker()}
            >
                <TouchableOpacity activeOpacity={1} style={styles.fadeAreaView} onPress={togglePicker}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Select your country code</Text>
                            <ScrollView contentContainerStyle={{marginHorizontal: 5}}>
                                {
                                    (data || []).map((list, i) => (
                                        <TouchableOpacity activeOpacity={1} key={i} style={{ marginVertical: 5, flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'nowrap', backgroundColor: '#EBECF0', borderRadius: 5, height: 60 }} onPress={() => {
                                            setSelectedValue(i, list.callingCodes[0]);
                                            togglePicker();
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 6 }}>
                                                <View style={{ flex: 1, marginHorizontal: 10 }}>
                                                    <SvgCssUri uri={list.flag} width={50} height={40} />
                                                </View>
                                                <View style={{ alignItems: 'center', flex: 4 }}>
                                                    <Text>{list.name}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text>{list.callingCodes[0]}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                }
                            </ScrollView>

                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View >
    )
}



const styles = StyleSheet.create({
    fadeAreaView: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    centeredView: {
        flex: 1,
        ...fontFamilyStyles.flexStyles(1, undefined, 'center', 'center'),
    },
    emptyView: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    modalView: {
        marginVertical: 20,
        flex: 0.8,
        width: Dimensions.get('window').width - 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
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
        backgroundColor: "#7359BE",
        borderRadius: 20,
        elevation: 3,
        height: 40,
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        margin: 10,
        ...fontFamilyStyles.fontStyles(18, '#000000', 4),
        textAlign: "center"
    },
    modalBodyText: {
        margin: 10,
        ...fontFamilyStyles.fontStyles(16, '#000000', 1),
        textAlign: "center"
    }
});