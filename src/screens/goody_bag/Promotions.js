import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import CustomHeader from '../../components/header/CustomHeader';
import commonIcons from '../../assets/svgIcons/common/common';
import ExpandableList from '../../components/lists/ExpandableList';
import { getRequest } from '../../services/api';
import { Container, Content } from 'native-base';
import plateformSpecific from '../../utils/plateformSpecific';
import commonStyles from '../../styles/styles';
import { sharedCopyTextToClipboard, recordsNotExistUI } from '../../utils/sharedActions';
import copyIcon from '../../assets/svgIcons/common/copy.svg';
import { SvgXml } from 'react-native-svg';

export default function Promotions({ dispatch, activeTheme, navigation, drawerProps }) {
    // console.log("Promotions.Props :", props);
    let initState = {
        "noRecFound": "",
        "promoList": [],
        areaExpanded: {
            "index": 0,
            "expanded": false,
        },
    }
    const [state, setState] = useState(initState);
    const toggleCardHandler = (item, cardIndex) => {
        setState(prevState => {
            if (prevState.areaExpanded.index === cardIndex && prevState.areaExpanded.expanded) {
                return { ...prevState, areaExpanded: { index: cardIndex, expanded: false } };
            } else {
                return { ...prevState, areaExpanded: { index: cardIndex, expanded: true } };
            }
        });
    };
    const descriptionContentView = listItem => {
        return (
            <View style={{ minHeight: 50, paddingHorizontal: 7 }}>
                <Text style={{ ...commonStyles.fontStyles(14, '#000', 2, undefined) }}>
                    {listItem.description}
                </Text>
                <Text style={{ textAlign: 'center', paddingVertical: 10, ...commonStyles.fontStyles(14, activeTheme.default, 2, 'bold') }}>
                    Expiry Date
                </Text>
                <Text style={{ textAlign: 'center', paddingVertical: 10, ...commonStyles.fontStyles(14, activeTheme.default, 1, undefined) }}>
                    {listItem.expiry}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ paddingVertical: 20, ...commonStyles.fontStyles(14, '#000', 1, undefined) }}>
                        Invite Code:
                </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', left: 5 }}>
                        <Text>
                            {listItem.promotionCode.toUpperCase()}
                        </Text>
                        <TouchableOpacity onPress={() => sharedCopyTextToClipboard(listItem.promotionCode.toUpperCase())} style={{ left: 10 }}>
                            <SvgXml xml={copyIcon} height={20} width={20} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        )
    };
    useEffect(useCallback(() => {
        getRequest('/api/Menu/Promotion/List', {}, dispatch, res => {
            if (res.data.statusCode === 404) setState(prevState => ({ ...prevState, noRecFound: res.data.message ? res.data.message : 'No Record Found' }))
            else setState(prevState => ({ ...prevState, promoList: res.data.promoList ? res.data.promoList : [] }))
        }, err => console.log(err), '');
        return () => {
            // console.log('Promotions state cleared----');
            setState(initState);
        }
    }, []), []);
    return (
        <Container>
            <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={'toggle'}
                    rightIconHandler={() => { }}
                    navigation={drawerProps.navigation}
                    leftIcon={commonIcons.menueIcon(activeTheme)}
                    bodyContent={'Your Goody Bag'}
                    rightIcon={null}
                    activeTheme={activeTheme}

                />
                <Content contentContainerStyle={{
                    paddingHorizontal: 10,
                    // top: plateformSpecific(25, 0),
                    top: 5,

                }}>
                    <TouchableOpacity onPress={() => navigation.navigate("invite_container", { screen: "invites" })} style={{ backgroundColor: activeTheme.default, borderRadius: 5 }}>
                        <View style={{ height: 150, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ ...commonStyles.fontStyles(20, "#fff", 2, 'bold') }}>Earn Your Rewards</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ flex: 4, paddingVertical: 10, paddingBottom: 30 }}>

                        {
                            state.promoList.length > 0 ? state.promoList.map((rec, i) => (
                                <ExpandableList
                                    key={i}
                                    listIndex={i}
                                    title={rec.name}
                                    item={rec}
                                    callback={toggleCardHandler}
                                    descriptionContent={descriptionContentView(rec)}
                                    maxHeightProp={300}
                                    display={state.areaExpanded.index === i && state.areaExpanded.expanded ? "flex" : "none"}
                                    parentState={state}
                                    bgColor={"#F5F5F5"}
                                />

                            ))
                                :
                                <View />
                            // recordsNotExistUI(state.noRecFound)

                        }
                    </View>
                </Content>
            </ImageBackground>
        </Container>
    )
}
