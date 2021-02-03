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
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DefaultBtn from '../buttons/DefaultBtn';
import { closeModalAction } from '../../redux/actions/modal';
const DisableProductModal = (props) => {
    const [state, setState] = useState({
        showDropdown: false,
        selectedDropdown:props.product.active===true?'Activated':'Deactivated',
        description:'',
    })
    const onDropdownClick = ()=>{
        setState({...state,showDropdown:!state.showDropdown});
    }
    const onChangeHandler = (e) => {
        let value = e.target.value;
        setState(prevState=>({
            ...prevState,
            description:value
        }))
    }
    const onSave = () => {
        props.onSaveStatus({productID:props.product.productID,active:state.selectedDropdown==='Activated'?true:false,description:state.description});
        props.dispatch(closeModalAction());
    }
    const renderSelectionList = () => {
        let data = [{text:'Deactivate',value:'Deactivated'},{text:'Activate',value:'Activated'}];
        return data.map((r, i) => (
            <TouchableOpacity onPress={() => {setState(prevState=>({...prevState,selectedDropdown:r.value,showDropdown:!prevState.showDropdown}))}} key={i} style={{
                borderBottomColor: props.activeTheme.lightGrey,
                height: 40,
                justifyContent: "space-between",
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: i === (data.length - 1) ? 0 : 1,

            }}>
                <Text style={{ paddingLeft: 10, color: props.activeTheme.default }}>{r.text}</Text>
            </TouchableOpacity>
        ));
    }
    return (
        <View style={{ ...StyleSheet.absoluteFill }}>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{...styles.tempContainer(props.activeTheme)}}>
                <Animated.View style={{ flex: new Animated.Value(4), backgroundColor: 'transparent' }}>
                    <View style={{ ...styles.tempWrapper(props.activeTheme, props.keypaidOpen, 2) }}>
                        <View style={{height:20,width:'100%',marginHorizontal:20}}>
                            <Text style={styles.catpion(props.activeTheme)}>Change Item Status</Text>
                        </View>
                        <View style={{ paddingHorizontal: 15,width:'100%', flex: 1}}>
                            <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                Status
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
                                    <Text>{state.selectedDropdown!==''?state.selectedDropdown:'Choose Status'}</Text>
                                </TouchableOpacity>
                            </View>
                        {state.showDropdown ? <ScrollView style={{
                            marginHorizontal: 15,width:'95%',position:'absolute',marginTop:90,backgroundColor:'white',zIndex:999, paddingHorizontal: 3 }}  keyboardShouldPersistTaps="always">
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
                        <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                                Description
                            </Text>
                        <TextInput
                            multiline={true}
                            numberOfLines={10}
                            onChange={(e)=>onChangeHandler(e)}
                            editable
                            style={{borderWidth: 1,
                                borderRadius: 5,
                                borderColor: 'rgba(0,0,0,0.1)'}}
                        />
                        </View>
                        <DefaultBtn
                            title="Save and continue"
                            disabled={false}
                            backgroundColor={props.activeTheme.default}
                            onPress={()=>onSave()}
                        />
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

export default DisableProductModal;