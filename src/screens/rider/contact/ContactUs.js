import React from 'react';
import { View, Text, Linking } from 'react-native';
import { SvgXml } from 'react-native-svg';
import agentIcon from '../../../assets/svgIcons/rider/agent.svg';
import menuIcon from '../../../assets/svgIcons/common/menu-stripes.svg';
import telIcon from '../../../assets/svgIcons/common/phone.svg';
import emailIcon from '../../../assets/svgIcons/common/at.svg';
import CustomHeader from '../../../components/header/CustomHeader';
import commonStyles from '../../../styles/styles';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CONTACT_EMAIL, CONTACT_NUMBER } from '../../../config/config';

export default props => {
    // console.log("RiderContactUs.Props :", props);
    const openDialerOrEmailClient = (type, text) => {
        if (type === 1) Linking.openURL(`mailto:${text}`);
        else Linking.openURL(`tel:${text}`);
    };
    return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <CustomHeader
                leftIconHandler={'toggle'}
                rightIconHandler={null}
                navigation={props.drawerProps.navigation}
                leftIcon={menuIcon}
                bodyContent={'CONTACT US'}
                rightIcon={null}
                activeTheme={props.activeTheme}
            />
            <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                <SvgXml xml={agentIcon} height={200} width={100} />
            </View>
            <View style={{ flex: 1, }}>
                <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4), textAlign: 'center', }}>How can we help you?</Text>
                <View style={{ paddingVertical: 10, marginHorizontal: 50 }}>
                    <Text style={{ textAlign: 'justify' }}>It looks like you are experiencing problems
                    with our sign up process. We are here to
help so please get in touch with us!</Text>
                </View>
            </View>
            <View style={{ flex: 3, flexDirection: 'row', justifyContent: "space-around", top: 30, paddingHorizontal: 20 }}>
                {
                    [{
                        title: "Email us",
                        desc: CONTACT_EMAIL,
                        icon: emailIcon,
                        type: 1,
                    }, {
                        title: "Call to us",
                        icon: telIcon,
                        desc: CONTACT_NUMBER,
                        type: 2,
                    }]
                        .map((row, i) => (
                            <View key={i} style={{
                                flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 150, width: 120, borderRadius: 20,
                                elevation: 5,
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.5,
                                shadowRadius: 3.84,
                            }}>
                                <TouchableOpacity style={{ backgroundColor: props.activeTheme.default, borderRadius: 25, height: 50, width: 50, justifyContent: 'center', alignItems: 'center' }} onPress={() => openDialerOrEmailClient(row.type, row.desc)}>
                                    <SvgXml xml={row.icon} height={30} width={30} />
                                </TouchableOpacity>
                                <Text style={{ top: 5, ...commonStyles.fontStyles(14, props.activeTheme.black, 4) }}>{row.title}</Text>
                            </View>
                        ))
                }

            </View>
        </View>
    )
}
