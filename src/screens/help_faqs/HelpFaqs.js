import React, { useState, useEffect, useCallback } from 'react';
import { View, ImageBackground, Alert } from 'react-native';
import { Container, Content } from 'native-base';
import CustomHeader from '../../components/header/CustomHeader';
import menuIcon from '../../assets/svgIcons/common/menu-stripes.svg';
import CustomTabs from '../../components/tabs/Tab';
import CustomLists from '../../components/lists/Lists';
import nextIcon from '../../assets/svgIcons/common/next-icon.svg';
import { getRequest } from '../../services/api';
import { recordsNotExistUI } from '../../utils/sharedActions';
import plateformSpecific from '../../utils/plateformSpecific';
function HelpFaqs(props) {
    const { navigation, theme, dispatch, activeTheme } = props;
    let initState = {
        "activeTab": 0,
        "noRecFound": "",
        "contentPageList": [],
        "faqCategoryData": []
    };
    const [state, setState] = useState(initState);
    const setTabHandler = tabIndex => {
        if (tabIndex === 1) getRequest('/api/Menu/FAQ/List', {}, dispatch, res => setState(prevState => ({ ...prevState, faqCategoryData: res.data.faqCategoryData, activeTab: tabIndex, contentPageList: [] })), err => console.log(err), '', true);
        else getRequest('/api/Menu/ContentPages/List/1', {}, dispatch, res => onSuccessHandler(res, tabIndex), onErrorHandler, '', true);
        //     setState(prevState => {
        //         return { ...prevState, activeTab: tabIndex })
        // };
    };
    const navigationHandler = list => {
        // navigation.setParams
        // `<html><body style='background-color:transparent; padding-left: 70px;padding-right: 10px'><p style='color: #000;font-size: 40px;'>${getNavigationState.routes[getNavigationState.index].params.list.description}</p></body></html>`
        // if (activeTab === 0) navigation.navigate("help_faq_stack", { screen: 'help_details', params: { list } })
        if (activeTab === 0) navigation.navigate("web_view_container", { uri: null, html: `<html><body style='background-color:transparent; padding-left: 70px;padding-right: 10px'><p style='color: #000;font-size: 40px;'>${list.description}</p></body></html>`, screenStyles: {} })
        else navigation.navigate("help_faq_stack", { screen: 'faqs_details', params: { list } })
    }
    const { activeTab } = state;
    const onSuccessHandler = (response, tabIndex) => {
        if (response.data.statusCode === 404) setState(prevState => ({ ...prevState, noRecFound: res.data.message ? res.data.message : "No Record Found" }));
        setState(prevState => ({ ...prevState, contentPageList: response.data.contentPageList, activeTab: tabIndex, faqCategoryData: [] }));
        // console.log("ComplaintsFeedback.onDetailsListSuccess ----", response);
    };
    const onErrorHandler = error => {
        console.log("ComplaintsFeedback.onDetailsListError ----", error);
    };
    useEffect(useCallback(() => {
        getRequest('/api/Menu/ContentPages/List/1', {}, dispatch, res => onSuccessHandler(res, 0), onErrorHandler, '', true);
        return () => {
            console.log('help faqs state cleared---');
            setState(initState);
        }
    }, []), []);
    // console.log(state);
    return (
        <Container>
            <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={'toggle'}
                    rightIconHandler={() => Alert.alert('Right icon clicked')}
                    navigation={navigation}
                    leftIcon={menuIcon}
                    bodyContent={activeTab === 0 ? 'Help' : 'FAQs'}
                    rightIcon={null}
                    activeTheme={activeTheme}
                />
                {/*Custom Tabs Section */}
                <CustomTabs
                    tabsArr={['Help', 'FAQs']}
                    activeTheme={activeTheme}
                    activeTab={activeTab}
                    tabHandler={setTabHandler}
                    tabsContainerStyles={{ top: plateformSpecific(0, -10) }}
                />
                <Content style={{ bottom: plateformSpecific(0, 20) }}>
                    {/* Custom Lists */}
                    {
                        state.contentPageList.length || state.faqCategoryData.length ?
                            <CustomLists
                                data={activeTab > 0 ? state.faqCategoryData : state.contentPageList}
                                listItem={activeTab > 0 ? 'name' : 'title'}
                                nextIcon={nextIcon}
                                onPress={list => navigationHandler(list)}
                            />
                            :
                            <View />
                        // recordsNotExistUI(state.noRecFound)
                    }
                </Content>
                <View>
                </View>
            </ImageBackground>
        </Container>

    )
};

export default HelpFaqs;
