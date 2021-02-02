import { Picker, Text, View } from 'native-base';
import colors from "../../styles/colors";
import { StyleSheet, KeyboardAvoidingView, Platform,ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import styles from '../../screens/userRegister/UserRegisterStyles';
import { sharedKeyboardDismissHandler } from '../../utils/sharedActions';
import CustomAndroidPickerItem from '../dropdowns/picker.android';
import { favHomeIcon } from '../../assets/svgIcons/customerorder/customerorder'
import { SvgXml } from 'react-native-svg';
import commonStyles from '../../styles/styles';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DefaultBtn from '../buttons/DefaultBtn';
const AddBrandModal = (props) => {
    const [state, setState] = useState({
        showDropdown: false
    })
    const onDropdownClick = () => {
        setState(prevState => ({
            ...prevState,
            showDropdown: !prevState.showDropdown
        }))
    }
    const renderSelectionList = () => {
        let data = [{ "text": "Home", "value": 1, "icon": favHomeIcon }, { "text": "Work", "value": 2, "icon": favHomeIcon }, { "text": "Friends", "value": 3, "icon": favHomeIcon }, { "text": "Family", "value": 4, "icon": favHomeIcon }];
        return data.map((r, i) => (
            <TouchableWithoutFeedback onPress={() => { }} key={i} style={{
                borderBottomColor: props.activeTheme.lightGrey,
                height: 50,
                justifyContent: "space-between",
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: i === (data.length - 1) ? 0 : 1,

            }}>
                <Text style={{ paddingLeft: 10, color: props.activeTheme.default }}>{r.text}</Text>
                <View style={{ paddingRight: 10 }} >
                    <SvgXml xml={r.icon(props.activeTheme.default)} height={30} width={30} />
                </View>
            </TouchableWithoutFeedback>
        ));
    }
    return (
        <View style={{ ...StyleSheet.absoluteFill }}>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={styles.tempContainer(props.activeTheme)}>
                {/* <LinearGradient style={{ flex: 1, opacity: 0.6 }} colors={[...colors.gradientColors]} onTouchEnd={sharedKeyboardDismissHandler} /> */}
                <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                    <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                        <View style={styles.userRegWrap(props.activeTheme, props.keypaidOpen)}>
                            <Text style={styles.catpion(props.activeTheme)}>Add Brand</Text>
                        </View>
                        <View style={{ paddingHorizontal: 15, flex: 10}}>
                            <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                {"Brands"}
                            </Text>
                            <View style={{
                                paddingHorizontal: 12,
                                borderWidth: 1,
                                borderRadius: 5,
                                borderColor: 'rgba(0,0,0,0.1)',
                                backgroundColor: 'transparent',
                                height: 50,
                                justifyContent: "space-between",
                                alignItems: 'center',
                                flexDirection: 'row'
                            }}>
                                <TouchableOpacity onPress={() => onDropdownClick()} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                    <Text>{"Choose Brand"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {state.showDropdown ? <ScrollView style={{
                            marginHorizontal: 5,width: '83%',
                            marginBottom: 200, paddingHorizontal: 15 }}  keyboardShouldPersistTaps="always">
                            <View  style={{
                            // marginHorizontal: 5,
                            // marginBottom: 210,
                            // width: '83%',
                            // elevation: 0.5,
                            borderColor: props.activeTheme.lightGrey,
                            borderWidth: 1,
                            borderBottomLeftRadius: 10,
                            borderBottomRightRadius: 10
                        }} >
                            {renderSelectionList()}

                            </View>
                        </ScrollView>
                            :
                            null
                        }
                        <DefaultBtn
                            title="Save and continue"
                            disabled={true}
                            backgroundColor={props.activeTheme.default}
                            onPress={()=>{}}
                        />
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

export default AddBrandModal;