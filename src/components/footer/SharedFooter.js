import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import commonIcons from '../../assets/svgIcons/common/common';
import commonStyles from '../../styles/styles';
import { navigateWithResetScreen, sharedTotalCartItems } from '../../utils/sharedActions';
import { BOTTOM_TABS } from '../../config/config';
import { setFooterTabsAction } from '../../redux/actions/sharedReduxActions';

export default ({ activeTheme, activeTab, drawerProps, mainDrawerComponentProps, onPress }) => {
    // console.log("mainDrawerComponentProps :", mainDrawerComponentProps);
    // const bottomNavigationHandler = pressedTab => navigateWithResetScreen(null, [{ name: pressedTab.route.container, params: { screen: pressedTab.route.screen } }]);
    const bottomNavigationHandler = (pressedTab, index) => {
        if (onPress) onPress(pressedTab, index);
        else {
            drawerProps?.navigation?.navigate(pressedTab.route.container, { screen: pressedTab.route.screen });
            if (pressedTab.pitstopOrCheckOutItemType) mainDrawerComponentProps.dispatch(setFooterTabsAction({ pressedTab: { ...pressedTab, index } }));
        }

    }
    return (
        <View style={styles.mainView(activeTheme)}>
            <View>
                <View style={styles.footerContainer()}>
                    {
                        (BOTTOM_TABS || []).map((t, j) => (
                            <TouchableOpacity key={j} style={{ width: '25%', alignItems: 'center' }} onPress={() => bottomNavigationHandler(t, j)}>
                                <SvgXml xml={t.icon(activeTab === j ? "#7359BE" : "#c1c0c6")} height={25} width={25} />
                                <Text style={{ ...commonStyles.fontStyles(14, activeTab === j ? activeTheme.default : "#c1c0c6", activeTab === j ? 4 : 1), paddingTop: 10 }}>{t.title}</Text>
                                {
                                    (j === 3 && sharedTotalCartItems().cartProducts.length) ?
                                        <View style={{ position: 'absolute', right: 0, top: -7, zIndex: 999, left: 50, backgroundColor: "#FC3F93", alignItems: 'center', justifyContent: 'center', height: 15, width: 15, borderRadius: 10 }}>
                                            <Text style={{ color: activeTheme.white, fontSize: 10 }}>{sharedTotalCartItems().cartProducts.length}</Text>
                                        </View>
                                        :
                                        null
                                }
                            </TouchableOpacity>
                        ))
                    }
                </View>
                <TouchableOpacity style={styles.absoluteTouchableOpacity(activeTheme)} onPress={() => navigateWithResetScreen(null, [{ name: 'home', params: {} }])}>
                    <SvgXml xml={commonIcons.footerJovi()} height={40} width={40} />
                </TouchableOpacity>
            </View>
        </View >
    )
};

const styles = StyleSheet.create({
    "mainView": activeTheme => ({
        height: 80,
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderTopWidth: 0.2,
        // elevation: 0.5,
        borderTopColor: activeTheme.grey,
        backgroundColor: '#fff'
    }),
    "footerContainer": () => ({
        justifyContent: "space-between",
        alignItems: 'center',
        flexDirection: 'row',
    }),
    "absoluteTouchableOpacity": activeTheme => ({
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 10,
        position: 'absolute',
        height: 60,
        width: 60,
        borderRadius: 35,
        backgroundColor: activeTheme.default,
        bottom: 37,
        alignSelf: "center", justifyContent: 'center', alignItems: 'center'
    })
})
