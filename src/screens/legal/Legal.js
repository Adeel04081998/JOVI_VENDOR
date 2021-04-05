import React, { useState, useCallback, useEffect } from 'react';
import { ImageBackground, View, Dimensions, Text } from 'react-native';
import { Container, Content } from 'native-base';
import commonIcons from '../../assets/svgIcons/common/common';
import CustomHeader from '../../components/header/CustomHeader';
import CustomLists from '../../components/lists/Lists';
import { getRequest } from '../../services/api';
import legalStyles from './legalStyles';
import { isJoviCustomerApp } from '../../config/config';
import RiderCommonList from '../../components/lists/RiderCommonList';
import CustomToast from '../../components/toast/CustomToast';
import commonStyles from '../../styles/styles';
import crossIcon from "../../assets/svgIcons/common/cross-new.svg";
import { connect } from 'react-redux';

export default connect()(function Legal(props) {
    let initState = {
        noRecFound: "",
        customerLegalsObj: {
            contentPageID: null,
            data: []
        },
        riderLegalsObj: {
            id: null,
            legalListViewModels: []
        }
    }
    const [state, setState] = useState(initState);
    const { activeTheme, navigation,onLogin, dispatch } = props;
    const onSuccessHandler = response => {
        console.log("Legal.onSuccessHandler ----", response);
        if (response.data.statusCode === 404) setState(prevState => ({ ...prevState, noRecFound: response.data.message || "No Record Found" }));
        else setState(prevState => {
            if (isJoviCustomerApp) return {
                ...prevState, customerLegalsObj: { ...prevState.customerLegalsObj, id: response.data.id, data: response.data.legalListViewModels }
            }
            else return {
                ...prevState, riderLegalsObj: { ...prevState.riderLegalsObj, id: response.data.id, legalListViewModels: response.data.legalListViewModels }
            }
        });
    };
    const onErrorHandler = error => {
        console.log("Legal.onErrorHandler ----", error.response);
        // if (error) CustomToast.error("Something went wrong!");

    };
    const getSingleRecord = args => {
        getRequest(`/api/Menu/Legal/List/${args.id}`, {}, props.dispatch, serverRes => {
            if (serverRes.data.statusCode === 200) {
                props.navigation.navigate(onLogin&&onLogin===true?"web_view_container_login":"web_view_container", { uri: null, html: serverRes.data._legalvm.description, screenStyles: {} })
            }
        }, serverErr => {
            if (serverErr) CustomToast.error("Something went wrong!");
        });
    };
    useEffect(useCallback(() => {
        // getRequest(isJoviCustomerApp ? `/api/Menu/ContentPages/List/${2}` : `/api/Menu/Legal/List`, {}, dispatch, onSuccessHandler, onErrorHandler);
        // getRequest(`/api/Menu/Legal/List`, {}, dispatch, onSuccessHandler, onErrorHandler);
        getRequest(`/api/Menu/Legal/ListByType/3`, {}, dispatch, onSuccessHandler, onErrorHandler);
        return () => {
            // console.log('Legal.State Cleared----');
            setState(initState);
        }
    }, []), []);
    console.log('Legal.state :', state);
    const renderContent = () => {
        if (isJoviCustomerApp) {
            return !state.customerLegalsObj.data.length ? null : <CustomLists
                data={state.customerLegalsObj.data}
                listItem={'title'}
                nextIcon={commonIcons.nextIcon()}
                activeTheme={activeTheme}
                // onPress={item => navigation.navigate('legal_details', { dataParams: item })}
                onPress={item => getSingleRecord(item)}
            />
        } else return !state.riderLegalsObj.legalListViewModels.length ? null : <View style={{ height: Dimensions.get('window').height * 0.8, paddingVertical: 10 }}>
            {/* <Text style={[commonStyles.fontStyles(15, props.activeTheme.black, 4), { padding: 10, left: 10 }]}>Legal</Text> */}
            <View style={{
                flex: 1, flexDirection: "column",
                borderRadius: 5,
                borderColor: "none",
                elevation: 5,
                backgroundColor: props.activeTheme.white,
                marginHorizontal: 10,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            }}>
                <RiderCommonList data={state.riderLegalsObj.legalListViewModels} {...props} onPress={item => getSingleRecord(item)} />
            </View>
        </View>
    };
    return (
        <Container>
            <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={() => props?.navigation?.goBack()}
                    rightIconHandler={null}
                    navigation={props.navigation}
                    leftIcon={crossIcon}
                    bodyContent={'Legal'}
                    rightIcon={null}
                    activeTheme={activeTheme}
                    height={15}
                    width={15}
                />
                <Content style={legalStyles.content(activeTheme)}>
                    {
                        renderContent()
                    }
                </Content>
            </ImageBackground>
        </Container >

    )
})
