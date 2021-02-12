import React, { useState, useCallback, useEffect } from 'react';
import { Text, ImageBackground, View, Alert,Linking, TouchableOpacity,StyleSheet, ScrollView, Dimensions, BackHandler } from 'react-native';
// import { SvgXml } from 'react-native-svg';
// import { renderPicture, renderPictureResizeable } from "../../utils/sharedActions";
import commonStyles from '../../styles/styles';
// import CustomToast from '../../components/toast/CustomToast';
function ContactUs(props) {
    const { navigation } = props;
    // console.log('Data:', data)
    const [state, setState] = useState({
    })
    useEffect(useCallback(() => {
        return () => {
            setState({
            })
        };
    }, []), []);
    return (
        <View style={{ flex: 1 }}>
            
            <View style={{ flex: 1, marginTop: 30,justifyContent:'center',alignItems:'center' }}>
                <View style={{ width:'70%',marginBottom:20, justifyContent: "space-between" }}>
                    <Text style={{width:'90%',textAlign:'center', ...commonStyles.fontStyles(18, props.activeTheme.background, 4), marginLeft: 20 }}>How can we help you?</Text>
                    <Text style={{width:'90%',textAlign:'center', ...commonStyles.fontStyles(16, props.activeTheme.black, 3), marginLeft: 20 }}>We are here to help. Please get in touch with us.</Text>
                </View>
                <View style={{height:230,borderWidth:0.5,borderRadius:15,borderColor:'#929293',backgroundColor:'white',width:'50%'}}>
                    <TouchableOpacity style={{width:'100%',height:'100%',justifyContent:'center',alignItems:'center',}} onPress={()=>Linking.openURL(`tel:090078601`)}>
                            <Text>Call US</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </View>
    )
}
const styleProduct = StyleSheet.create({
    brandContainer:{ width: 150, height: 120, justifyContent: 'center', alignItems: 'center' },

})
export default ContactUs;