import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Dimensions, TouchableOpacity, Linking } from 'react-native';
import commonStyles from '../../styles/styles';
import { SvgXml } from 'react-native-svg';
import telIcon from '../../assets/svgIcons/common/phone.svg';
import emailIcon from '../../assets/svgIcons/common/at.svg';
import { CONTACT_EMAIL, CONTACT_NUMBER } from '../../config/config';
export default function ContactUsModal(props) {
    const { activeTheme, complaintID } = props;
    let initState = {
        contactNo: CONTACT_NUMBER,
        contactEmail: CONTACT_EMAIL
    }
    const [state, setState] = useState(initState);
    const { width, height } = Dimensions.get('window');
    const openDialerOrEmailClient = (type, text) => {
        if (type === 1) Linking.openURL(`mailto:${text}`);
        else Linking.openURL(`tel:${text}`);
    };
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 2, left: 45, top: 20 }}>
                <Text style={styles.headerText(activeTheme, width, height)}>{`Complaint No# ${complaintID}`}</Text>
            </View>
            <View style={{ flex: 4, justifyContent: 'flex-end', alignItems: "flex-end", flexDirection: 'row' }}>
                {
                    ['Email Us', "Contact Us"].map((c, k) => (
                        // <TouchableOpacity key={k} style={{ backgroundColor: activeTheme.default, width: '50%', height: 70, marginRight: k > 0 ? 0 : 3, borderColor: '#000', borderTopRightRadius: k > 0 ? 0 : 5, borderBottomRightRadius: k > 0 ? 0 : 5, borderTopLeftRadius: k > 0 ? 5 : 0, borderBottomLeftRadius: k > 0 ? 5 : 0, borderWidth: 0.2, justifyContent: 'center', alignItems: 'center' }} onPress={() => openDialerOrEmailClient(k > 0 ? 2 : 1, k > 0 ? state.contactNo : state.contactEmail)}>
                        <TouchableOpacity key={k} style={{ backgroundColor: activeTheme.default, width: '50%', height: 70, marginRight: k > 0 ? 0 : 2, borderColor: '#000',  borderWidth: 0.2, justifyContent: 'center', alignItems: 'center' }} onPress={() => openDialerOrEmailClient(k > 0 ? 2 : 1, k > 0 ? state.contactNo : state.contactEmail)}>
                            <SvgXml xml={k > 0 ? telIcon : emailIcon} height={40} width={40} />
                        </TouchableOpacity>
                    ))
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    "headerText": (theme, windWidth, winHeight) => ({
        ...commonStyles.fontStyles(16, theme.default, 1),
    }),
    "emailUsView": (theme, windWidth, winHeight) => ({
        height: 60,
        backgroundColor: theme.default,
        width: windWidth,
        justifyContent: 'center',
        alignItems: 'center'
        // borderRadius: 5,
        // ...commonStyles.fontStyles(14, theme.default, 1),
    }),
    "emailUsText": (theme, windWidth, winHeight) => ({
        // minHeight: 60,
        ...commonStyles.fontStyles(16, theme.white, 1),
    }),
    "contactUsView": (theme, windWidth, winHeight) => ({
        height: 60,
        backgroundColor: theme.lightGrey,
        width: windWidth,
        // borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5
        // ...commonStyles.fontStyles(14, theme.default, 1),
    }),
    "contactUsText": (theme, windWidth, winHeight) => ({
        ...commonStyles.fontStyles(16, theme.black, 1),
    }),
})
