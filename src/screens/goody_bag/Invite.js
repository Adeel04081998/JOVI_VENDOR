import React from 'react';
import { View, Text, ImageBackground, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import CustomHeader from '../../components/header/CustomHeader';
import commonIcons from '../../assets/svgIcons/common/common';
import { Container } from 'native-base';
import plateformSpecific from '../../utils/plateformSpecific';
import commonStyles from '../../styles/styles';
import { TextInput } from 'react-native-gesture-handler';
import { openShareClients } from '../../utils/sharedActions';
import { BASE_URL, DEVICE_WIN_WIDTH } from '../../config/config';
import DefaultBtn from '../../components/buttons/DefaultBtn';
export default function Invite(props) {
    const { dispatch, activeTheme, navigation, drawerProps, stackState } = props;
    let tempPromo = `${BASE_URL}/users/invites/${props.user ? props.user.referralCode : ""}`;
    console.log('Invite.Props :', props);
    return (
        <Container style={{ flex: 1 }}>
            <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={null}
                    rightIconHandler={() => { }}
                    navigation={drawerProps.navigation}
                    leftIcon={commonIcons.backIcon(activeTheme)}
                    bodyContent={'EARN YOUR REWARD'}
                    rightIcon={null}
                    activeTheme={activeTheme}

                />
                <View style={{ flex: 1, top: plateformSpecific(25, 0) }} onTouchEnd={() => stackState.keypaidOpen && Keyboard.dismiss()}>

                    <View style={{ height: 170, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ ...commonStyles.fontStyles(20, "#000", 2, 'bold'), textAlign: 'center' }}>{"20% Off \n on next Ride"}</Text>
                        <Text style={{ ...commonStyles.fontStyles(18, "#000", 1, '100'), paddingHorizontal: 40, textAlign: 'center', paddingTop: 20 }}>{"Add a free pitstop when refer \n a friend to try jovi"}</Text>
                    </View>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "padding" : null} style={{ flex: 1 }}>
                        <View style={{ flex: 1, justifyContent: "flex-end" }}>
                            <View style={{ bottom: stackState.keypaidOpen ? plateformSpecific(25, 90) : plateformSpecific(25, 0), height: 200, width: DEVICE_WIN_WIDTH, borderRadius: 20, borderWidth: 0.2, borderColor: activeTheme.lightGrey, backgroundColor: '#fff', elevation: 2 }}>
                                <View style={{ padding: 20 }}>
                                    <Text style={{ ...commonStyles.fontStyles(16, "#000", 4, undefined) }}>Share your invite Code</Text>
                                    <View style={{ paddingTop: 10 }}>
                                        <TextInput editable={false} style={{ paddingLeft: 10, minHeight: 60, borderRadius: 5, borderWidth: 1, borderColor: activeTheme.lightGrey }} defaultValue={props.user ? props.user.referralCode : ""} />
                                    </View>
                                </View>
                                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                                    <DefaultBtn
                                        title="Invite"
                                        onPress={() => openShareClients({ title: "Share with", message: `20% Off on next Ride Add a free pitstop when refer a friend to try jovi \n ${tempPromo}`, url: tempPromo })}
                                    />

                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </ImageBackground>
        </Container>
    )
}
