import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import commonIcons from '../../assets/svgIcons/common/common';
import commonStyles from '../../styles/styles';
import { navigateWithResetScreen, sharedTotalCartItems } from '../../utils/sharedActions';
import { BOTTOM_TABS } from '../../config/config';
import { setFooterTabsAction } from '../../redux/actions/sharedReduxActions';

export default ({ activeTheme, onHome, activeTab, hideOptions, drawerProps, mainDrawerComponentProps, onPress }) => {
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
        <View style={{ zIndex: 999 }, styles.mainView(activeTheme)}>
            <View style={{ zIndex: 999 }}>
                <View style={styles.footerContainer()}>
                    {
                        hideOptions && hideOptions === true ? <TouchableOpacity style={{ width: '25%', height: 45, alignItems: 'center' }}></TouchableOpacity> : (BOTTOM_TABS || []).filter(t=>mainDrawerComponentProps?.user?.canUpdatePrices==true&&mainDrawerComponentProps?.user?.canAddUpdateProduct==true?true:t.isHide!==true).map((t, j) => (
                            <TouchableOpacity key={j} style={{ width: '25%', alignItems: 'center' }} onPress={() => bottomNavigationHandler(t, j)}>
                                <View style={{ height: 40, width: 40, borderWidth: 1, borderColor:activeTab===j?activeTheme.default:'#fff', borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}>
                                    <SvgXml xml={t.icon("#7359BE")} height={25} width={25} />
                                </View>
                                <Text style={{ ...commonStyles.fontStyles(14, activeTheme.default, 4), paddingTop: 4 }}>{t.title}</Text>
                                {/* <Text style={{ ...commonStyles.fontStyles(14, activeTab === j ? activeTheme.default : "#c1c0c6", activeTab === j ? 4 : 1), paddingTop: 10 }}>{t.title}</Text> */}
                                {
                                    (t.title === 'Orders' && mainDrawerComponentProps.user.noOfOpenOrders > 0) ?
                                        <View style={{ position: 'absolute', right: 0, top: 0, zIndex: 999, left: 52, backgroundColor: "#FC3F93", alignItems: 'center', justifyContent: 'center', height: 15, width: 15, borderRadius: 10 }}>
                                            <Text style={{ color: activeTheme.white, fontSize: 10 }}>{mainDrawerComponentProps.user.noOfOpenOrders}</Text>
                                        </View>
                                        :
                                        null
                                }
                            </TouchableOpacity>
                        ))
                    }
                </View>
                <TouchableOpacity style={{ width: 30, zIndex: 1500, height: 30, ...styles.absoluteTouchableOpacity(activeTheme) }} onPress={onHome && onHome === true ? () => { } : () => navigateWithResetScreen(null, [{ name: mainDrawerComponentProps.user.pitstopType === 4 ? 'homeRes' : 'home', params: {} }])}>
                    <SvgXml xml={commonIcons.footerHome()} height={30} width={40} />
                </TouchableOpacity>
            </View>
        </View >
    )
};

const styles = StyleSheet.create({
    "mainView": activeTheme => ({
        height: 80,
        zIndex: 1500,
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
