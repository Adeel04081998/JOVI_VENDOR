import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import walletHistoryStyles from './walletHistoryStyles';
import CustomToast from '../../components/toast/CustomToast';
import { postRequest } from '../../services/api';
import { SvgXml } from 'react-native-svg';
import commonSvgIcons from '../../assets/svgIcons/common/common';
import commonStyles from '../../styles/styles';
import correctIcon from '../../assets/svgIcons/common/correct_icon.svg';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DefaultBtn from '../../components/buttons/DefaultBtn';
import { BASE_URL } from '../../config/config';


export default function Topup(props) {
    console.log("Topup.Props :", props);
    // mode enum = {type: 1, name: "enter amount"},{type: 2, name: "payment gateway"}
    const initState = {
        "activeBox": 0,
        "amount": "",
        "mode": 1,
    };
    const scrollRef = useRef(null);
    const [state, setState] = useState(initState);
    const setActiveBox = index => setState(copyState => ({ ...copyState, activeBox: index }));
    const getPayloadForWebViewHandler = () => {
        postRequest(
            `/api/Payment/EasyPaisaPay`,
            {},
            {},
            props.dispatch,
            success => {
                // debugger;
                console.log("Success :", success)
                if (success.data.statusCode === 200) {
                    props.navigation.navigate("web_view_container", {
                        // uri: { uri: success.data.easyPaisaAuthViewModel.url, method: 'POST', body: `postBackURL=${success.data.easyPaisaAuthViewModel.postBackURL}&auth_token=${success.data.easyPaisaAuthViewModel.auth_token}` }, html: null, screenStyles: {}, backScreenObject: props?.params?.backScreenObject ?? null
                        uri: { uri: success.data.easyPaisaAuthViewModel.url, method: 'POST', body: `postBackURL=${BASE_URL}/api/EasyPaisa/SuccessTransDetailPBURL&auth_token=${success.data.easyPaisaAuthViewModel.auth_token}` }, html: null, screenStyles: {}, backScreenObject: props?.params?.backScreenObject ?? null
                    })
                }
            },
            fail => {
                // debugger;
                if (fail) CustomToast.error("Something went wrong")
            },
            '')
    };
    const renderBoxes = () => {
        return [{ name: "", type: 1, icon: common.creditDebitCard(0 === state.activeBox ? props.activeTheme.default : props.activeTheme.black) }, {
            name: "", type: 2, icon: common.overTheCounter(1 === state.activeBox ? props.activeTheme.default : props.activeTheme.black)
        }, {
            name: "", type: 3, icon: common.easyPaisa(2 === state.activeBox ? "#A2BF37" : props.activeTheme.black)
        }]
            .map((r, i) => (
                <TouchableOpacity
                    key={i}
                    onPress={() => setActiveBox(i)}
                    style={{ height: 80, width: 100, borderWidth: 1, borderColor: props.activeTheme.lightGrey, borderRadius: 10, backgroundColor: i === state.activeBox ? props.activeTheme.lightGrey : undefined }}>
                    {
                        i === state.activeBox &&
                        <View style={[walletHistoryStyles.tabBox(props.activeTheme), { alignSelf: 'flex-end', margin: 5 }]}>
                            <View style={walletHistoryStyles.boxInner(props.activeTheme)} />
                        </View>

                    }
                    <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'column', margin: 7 }}>
                        <SvgXml xml={r.icon} height={i === 2 ? 45 : 35} width={i === 2 ? 45 : 35} />
                        <Text>
                            {r.name}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))
    };
    const renderPaymentsCards = () => {
        return [{ name: "Credit or Debit Card", desc: "Lorem ipsum is a dummy text...", type: 1, icon: commonSvgIcons.creditDebitCard(props.activeTheme.white) }, {
            name: "Over the counter", desc: "Lorem ipsum is a dummy text...", type: 2, icon: commonSvgIcons.overTheCounter(props.activeTheme.white)
        }, {
            name: "Easypaisa", desc: "Lorem ipsum is a dummy text...", type: 3, icon: commonSvgIcons.easyPaisa(props.activeTheme.white, props.activeTheme.white)
        }]
            .map((r, i) => (
                <TouchableWithoutFeedback
                    key={i}
                    onPress={() => setActiveBox(i)}
                    style={{ ...commonStyles.shadowStyles(null, null, null, null, i === state.activeBox ? 3 : 0), borderRadius: 5, margin: 5, backgroundColor: '#fff', borderColor: i === state.activeBox ? props.activeTheme.default : '#fff' }}>
                    <View style={{ flexDirection: 'row', height: 70, alignItems: 'center' }}>
                        <View style={{ height: 50, width: 50, margin: 10, backgroundColor: props.activeTheme.default, alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                            <SvgXml xml={r.icon} height={i === 2 ? 45 : 35} width={i === 2 ? 45 : 35} />
                        </View>
                        <View>
                            <Text style={commonStyles.fontStyles(15, props.activeTheme.black, 4)}>{r.name}</Text>
                            <Text style={commonStyles.fontStyles(13, props.activeTheme.grey, 3)}>{r.desc}</Text>
                        </View>
                        {
                            i === state.activeBox ?
                                <View style={{ flex: 1 }}>
                                    <SvgXml xml={correctIcon} height={15} width={15} style={{ alignSelf: 'flex-end', right: 15 }} />
                                </View> : null
                        }
                    </View>
                </TouchableWithoutFeedback >
            ))
    };
    const onChangeText = value => setState(prevState => ({ ...prevState, amount: value }));
    const onPress = type => {
        if (type > 2) getPayloadForWebViewHandler();
        else setState(prevState => ({ ...prevState, mode: type }));
    };
    console.log('State :', state)
    return (
        <View style={{
            maxHeight: Platform.select({ ios: props.stackState.keypaidOpen ? Dimensions.get('window').height * 0.40 : undefined, android: undefined }),
            flex: Platform.select({ ios: props.stackState.keypaidOpen ? 0 : 1, android: 1 }),
            backgroundColor: props.activeTheme.white,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            elevation: 3
        }}>
            <View style={{ flex: 1 }}>
                <View style={{ padding: 10, top: 10 }}>
                    <Text style={{ bottom: 5, left: 2 }}>
                        {"Enter amount"}
                    </Text>
                    <TextInput
                        value={state.amount.toString()}
                        style={walletHistoryStyles.defaultInputArea(props.activeTheme, 'amount', 'amount')}
                        placeholder={'4,500'}
                        keyboardType={"decimal-pad"}
                        onChangeText={value => onChangeText(value)}
                        autoFocus
                    />
                </View>
                {
                    state.mode === 2 ?
                        <ScrollView style={{ paddingHorizontal: 5, top: 10 }}>
                            {
                                renderPaymentsCards()
                            }
                        </ScrollView>
                        :
                        null
                }
            </View>
            <DefaultBtn
                title={state.mode === 1 ? "Proceed for topup" : state.mode === 2 ? "Continue" : 'Submit'}
                backgroundColor={!state.amount.length ? props.activeTheme.lightGrey : props.activeTheme.default}
                disabled={!state.amount.length ? true : false}
                onPress={() => onPress(state.mode + 1)}
            />
        </View >
    )
}



{/* <TouchableOpacity
key={i}
onPress={() => setActiveBox(i)}
style={{ ...commonStyles.shadowStyles(null, null, null, null, i === state.activeBox ? 2 : 0), borderRadius: 5, margin: 5, borderColor: i === state.activeBox ? props.activeTheme.default : '#fff' }}>
<View style={{ flexDirection: 'row', height: 70, alignItems: 'center', justifyContent: 'space-around' }}>
    <View style={{ height: 50, width: 50, backgroundColor: props.activeTheme.default, alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
        <SvgXml xml={r.icon} height={i === 2 ? 45 : 35} width={i === 2 ? 45 : 35} />
    </View>
    <View>
        <Text>{r.name}</Text>
        <Text>{r.desc}</Text>
    </View>
    <View>
        <SvgXml xml={correctIcon} height={15} width={15} />
    </View>
</View>
</TouchableOpacity> */}