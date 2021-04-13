import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, Alert, Linking, TouchableOpacity, StyleSheet, ScrollView, Dimensions, BackHandler } from 'react-native';
import { SvgXml } from 'react-native-svg';
import common from '../../assets/svgIcons/common/common';
import { CONTACT_NUMBER } from '../../config/config';
import { getRequest } from '../../services/api';
// import { SvgXml } from 'react-native-svg';
// import { renderPicture, renderPictureResizeable } from "../../utils/sharedActions";
import commonStyles from '../../styles/styles';
import { error400 } from '../../utils/sharedActions';
// import CustomToast from '../../components/toast/CustomToast';
function ContactUs(props) {
    const { navigation,otpScreen } = props;
    const data = navigation.dangerouslyGetState()?.routes?.filter(item => item?.name === 'Call_Us')[0]?.params?.item;
    console.log('Data:', data,props)
    const [state, setState] = useState({
        helpline:'0517080452',
    })
    useEffect(()=>{
        getRequest('api/Common/Helplines',{},props.dispatch,(res)=>{
            if(res){
                setState(pre=>({...pre,helpline:res.data.helplinesViewModel.vendorHelpline}));
            }
        },(err)=>{
            if(err&&err.response) error400(err.response);
        });
    },[]);
    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 30, width: 30, backgroundColor: 'white', borderColor: props.activeTheme.borderColor, borderWidth: 0.5, borderRadius: 8, top: 60, right: 20, position: 'absolute' }}>
                <TouchableOpacity style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: '100%' }} onPress={() => navigation.goBack()}>
                    <Text style={{ ...commonStyles.fontStyles(16, 'black', 4) }} >X</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginTop: 30, justifyContent: 'center', alignItems: 'center' }}>
                <SvgXml xml={common.callUsLogo()} height={150} width={80} />
                <View style={{ width: '70%', marginBottom: 20, justifyContent: "space-between" }}>
                    <Text style={{ width: '90%', textAlign: 'center', ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }}>How can we help you?</Text>
                    <Text style={{ width: '90%', textAlign: 'center', ...commonStyles.fontStyles(16, props.activeTheme.black, 3), marginLeft: 20 }}>{otpScreen===true?'Please call us, if you want to register yourself as a vendor.':'We are here to help. Please get in touch with us.'}</Text>
                </View>
                <View style={{ height: 180, borderWidth: 0.5, borderRadius: 15, borderColor: '#929293', backgroundColor: 'white', width: '40%' }}>
                    <TouchableOpacity style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', }} onPress={() => Linking.openURL(`tel:${state.helpline??props.user.helpNumber}`)}>
                        <SvgXml xml={common.callUsLogoIcon()} height={50} width={38} />
                        <Text>Call Us</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </View>
    )
}
const styleProduct = StyleSheet.create({
    brandContainer: { width: 150, height: 120, justifyContent: 'center', alignItems: 'center' },

})
export default ContactUs;