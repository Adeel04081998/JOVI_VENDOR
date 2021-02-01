import React, { useState, useEffect, useCallback } from 'react';
import { ImageBackground, View, Text, TouchableOpacity } from 'react-native';
import { Container, Content } from 'native-base';
import CustomHeader from '../../components/header/CustomHeader';
import CustomTabs from '../../components/tabs/Tab';
import commonIcon from '../../assets/svgIcons/common/common';
import History from './History';
import walletHistoryStyles from './walletHistoryStyles';
import commonStyles from '../../styles/styles';
import Cashout from './Cashout';
import Topup from './Topup';
import { sharedCommasAmountConveter } from '../../utils/sharedActions';
import AsyncStorage from '@react-native-community/async-storage';
import { CONSTANTLATDELTA, CONSTANTLONGDELTA } from '../../config/config';

function WalletContainer(props) {
    // console.log("WalletContainer.navigation.dangerouslyGetState() :", props.navigation.dangerouslyGetState());
    // const _currentScreen = props.navigation.dangerouslyGetState()
    const _firstIndex = props.navigation.dangerouslyGetState().index ?? 0,
        _secondIndex = props.navigation.dangerouslyGetState()?.routes[_firstIndex]?.state?.index ?? 0,
        _currentScreen = props.navigation.dangerouslyGetState()?.routes[_firstIndex]?.state?.routes[_secondIndex] ?? 0;
    // console.log("_currentScreen :", _currentScreen);
    let initState = {
        activeTab: 0,
        userWallet: props.user.balance,
        cashoutPayload: {
            "latitude": null,
            "longitude": null,
        },
        totalOrdersLength: null,
        cash: {
            activeBox: _currentScreen?.params?.fromParamsState?.cash.activeBox ?? 0
        }
    };
    const [state, setState] = useState(initState);
    // console.log("WalletContainer.Props :", props);
    // console.log("[WalletContainer].State :", state);

    const { activeTab } = state;
    const setTabHandler = (type, tabIndex) => {
        // debugger;
        // Alert.alert('setTabHandler Called')
        if (type === 2) setState(prevState => ({ ...prevState, cash: { activeBox: tabIndex } }));
        else setState(prevState => ({ ...prevState, activeTab: tabIndex, cash: { activeBox: 0 } }));
    };
    const setUserWallet = walletAmount => setState(prevState => ({ ...prevState, userWallet: walletAmount }));
    // console.log('WalletContainer.State :', state);

    const getSetCurrentLatLng = () => {
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude, longitude } }) => {
                setState(pre => ({
                    ...pre, cashoutPayload: {
                        latitude,
                        longitude
                    }
                }))
            },
            err => console.log(err),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    };

    useEffect(useCallback(() => {
        let getDataAsync = async () => {
            // console.log('getDataAsync :');
            getSetCurrentLatLng();
            let allOrders = JSON.parse(await AsyncStorage.getItem("home_tasksData"));
            setState(pre => ({ ...pre, totalOrdersLength: allOrders.noOfOrders }));
        }
        getDataAsync();
        return () => {
            console.log("WalletContainer.CleanUp---");

        }
    }, []), [])

    return (
        <Container>
            <ImageBackground source={require('../../assets/IntroScreen/doodle.png')} style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={_currentScreen?.params?.backScreenObject ? () => props.navigation.navigate(_currentScreen?.params?.backScreenObject?.container, { screen: _currentScreen?.params?.backScreenObject?.screen })
                        : state.cash.activeBox > 0 ?
                            () => setTabHandler(2, 0)
                            // () => sharedConfirmationAlert('Alert', 'Are you sure you want to discard your changes?', () => { }, () => setTabHandler(2, 0), false)
                            : 'toggle'
                    }
                    rightIconHandler={() => { }}
                    navigation={props.drawerProps.navigation}
                    leftIcon={state.cash.activeBox > 0 ? commonIcon.backIcon(props.activeTheme) : commonIcon.menueIcon(props.activeTheme)}
                    bodyContent={'Wallet'}
                    rightIcon={null}
                    activeTheme={props.activeTheme}
                />
                <CustomTabs
                    tabsArr={['Cash', 'History']}
                    activeTheme={props.activeTheme}
                    activeTab={activeTab}
                    tabHandler={index => setTabHandler(1, index)}
                    tabsContainerStyles={{ top: 0 }}
                />
                <View style={{ flex: 1 }}>
                    <View style={walletHistoryStyles.amountView(props.activeTheme)}>
                        <Text style={[walletHistoryStyles.text(props.activeTheme), { textAlign: 'center' }]}>
                            PKR {"\n"}{sharedCommasAmountConveter(state.userWallet)}
                        </Text>
                    </View>
                    {
                        state.activeTab > 0 ?
                            <Content style={{ flex: 1 }}>
                                <History
                                    {...props}
                                    {..._currentScreen}
                                />
                            </Content>
                            :
                            state.cash.activeBox === 1 ?

                                <Topup {...props} {..._currentScreen} setUserWallet={setUserWallet} setTabHandler={setTabHandler} />
                                :
                                state.cash.activeBox === 2 ?
                                    <Cashout {...props} {...state} {..._currentScreen} setUserWallet={setUserWallet} />
                                    :
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <Text style={[commonStyles.fontStyles(18, undefined, 4), { textAlign: 'center' }]}>Top-Up</Text>
                                            <Text style={[commonStyles.fontStyles(16, undefined, 2), { textAlign: 'justify', margin: 15 }]}>
                                                {"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <Text style={[commonStyles.fontStyles(18, undefined, 4), { textAlign: 'center' }]}>Cash Out</Text>
                                            <Text style={[commonStyles.fontStyles(16, undefined, 2), { textAlign: 'justify', margin: 15 }]}>
                                                {"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."}
                                            </Text>
                                        </View>


                                        <View style={{ flexDirection: 'row', }}>
                                            {
                                                ['Top-Up', "Cash Out"].map((b, k) => (
                                                    <TouchableOpacity onPress={() => setTabHandler(2, k + 1)} key={k} style={{ paddingVertical: 20, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: props.activeTheme.default, marginLeft: k > 0 ? 2 : 0 }}>
                                                        <Text style={{ ...commonStyles.fontStyles(16, "#fff", 4) }}>{b}</Text>
                                                    </TouchableOpacity>
                                                ))
                                            }
                                        </View>
                                    </View>

                    }

                </View>
            </ImageBackground>
        </Container >

    )
}
export default WalletContainer;
