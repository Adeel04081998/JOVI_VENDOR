import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import arrowUpIcon from '../../../assets/svgIcons/rider/arrowUp.svg';
import boardIcon from '../../../assets/svgIcons/rider/board.svg';
import menuIcon from '../../../assets/svgIcons/common/menu-stripes.svg';
import CustomHeader from '../../../components/header/CustomHeader';
import commonStyles from '../../../styles/styles';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { getRequest } from '../../../services/api';
import CustomToast from '../../../components/toast/CustomToast';
import { getHubConnectionInstance } from '../../../utils/sharedActions';
export default props => {
    let initState = {
        "riderPromoList": [],
    };
    const [state, setState] = useState(initState);
    console.log("Rider.Promotions.Props :", props);
    console.log("Rider.State :", state);
    const toggleCards = cardIndex => {
        // getHubConnectionInstance()?.invoke('LoadNotifications')
        //     .then(invokedData => console.log('invokedData :', invokedData))
        //     .catch(err => console.log('Error during invoking for notifications :', err))
        let updatedRecords = state.riderPromoList.map((card, k) => {
            if (k === cardIndex) card.show = card.show ? false : true;
            return card;
        });
        setState(pre => ({ ...pre, riderPromoList: updatedRecords }));
    };
    const onSuccess = apiRes => {
        if (apiRes.data.statusCode === 200) setState(pre => ({ ...pre, riderPromoList: apiRes.data.riderPromoList }));
    };
    const onError = apiErr => {
        if (apiErr) CustomToast.error("Something went wrong!");
    };
    useEffect(useCallback(() => {
        // getHubConnectionInstance("LoadNotifications")?.on("LoadNotifications", function (nots) {
        //     console.log("Load Notification----", nots);
        // });
        getRequest(`/api/Menu/Rider/Promotion/List`, {}, props.dispatch, onSuccess, onError);
    }, []), []);

    return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <CustomHeader
                leftIconHandler={'toggle'}
                rightIconHandler={null}
                navigation={props.drawerProps.navigation}
                leftIcon={menuIcon}
                bodyContent={"TODAY'S OPPORTUNITIES"}
                rightIcon={null}
                activeTheme={props.activeTheme}
            />
            <ScrollView style={{ marginTop: 25 }}>
                <View style={{ padding: 20 }}>
                    {
                        (state.riderPromoList || []).map((rec, j) => (
                            <View key={j} style={{ marginTop: j > 0 ? 30 : 0, height: rec.show ? 300 : 160, borderRadius: 5, backgroundColor: '#fff', elevation: 1 }}>
                                <View style={{ position: 'absolute', bottom: 0, top: -20, left: 0, right: 0, alignItems: 'center' }}>
                                    <SvgXml xml={(j % 2) === 0 ? arrowUpIcon : boardIcon} height={40} width={40} />
                                </View>
                                <View style={{ marginTop: 40 }}>
                                    <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 4), textAlign: 'center' }}>{rec.title}</Text>
                                    <Text style={{ textAlign: 'center', paddingVertical: 10 }}>{rec.combineDateTime}</Text>
                                </View>
                                <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => toggleCards(j)}>
                                    <Text style={{ textAlign: 'center', color: props.activeTheme.default }}>{rec.show ? 'Show less' : 'Show More'}</Text>
                                </TouchableOpacity>
                                {/* Expended area */}
                                {
                                    rec.show ?
                                        <View style={{ paddingHorizontal: 20, paddingTop: 5 }}>
                                            <Text>{rec.description}</Text>
                                        </View>
                                        :
                                        null
                                }
                            </View>
                        ))
                    }
                </View>
            </ScrollView>
        </View>
    )
}