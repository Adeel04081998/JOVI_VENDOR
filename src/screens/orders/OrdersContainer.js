import React, { useState, useEffect, useCallback } from 'react';
import { View, ImageBackground } from 'react-native';
import CustomHeader from '../../components/header/CustomHeader';
import commonIcons from '../../assets/svgIcons/common/common';
import CustomTabs from '../../components/tabs/Tab';
import OrdersHistory from './OrdersHistory';
import plateformSpecific from '../../utils/plateformSpecific';
import { postRequest } from '../../services/api';
import { isJoviCustomerApp } from '../../config/config';
import CustomToast from '../../components/toast/CustomToast';
function OrdersContainer(props) {
    // console.log(":OrdersContainer.Props :", props);
    const { navigation, activeTheme, dispatch } = props;
    let initState = {
        // "activeTab": isJoviCustomerApp ? 0 : 1,
        "activeTab": 1,
        "orderType": 0,
        "jobCategory": 0,
        "noRecFound": "",
        "fromOrderDate": null,
        "toOrderDate": null,
        "pageNumber": 1,
        "itemsPage": 15,
        "isAscending": false,
        "orderList": {
            "orderType": 0,
            "jobCategory": 0,
            "orderID": 0,
            "paginationInfo": {
                "totalItems": 0,
                "itemsPerPage": 0,
                "actualPage": 0,
                "totalPages": 0
            },
            "list": []
        }
    };
    const [state, setState] = useState(initState);
    // console.log(":OrdersContainer.state :", state);

    const onSuccessHandler = response => {
        // console.log("OrdersContainer.onSuccessHandler ----", response);
        if (response.data.statusCode === 200) setState(pre => ({ ...pre, orderList: response.data.orderList ? response.data.orderList : initState.orderList }));
        else if (response.data.statusCode === 404) {
            CustomToast.error(response.data?.message ?? "No Record Found");
            setState(pre => ({ ...pre, orderList: initState.orderList, noRecFound: response.data?.message ?? "No Record Found" }));
        }


    };
    const onErrorHandler = error => {
        console.log("ComplaintsFeedback.onDetailsListError ----", error);
    };
    const getAllOrdersHistory = orderType => {
        // console.log("getAllOrdersHistory.called");
        postRequest('/api/Order/List',
            {
                "orderType": orderType,
                "jobCategory": state.jobCategory,
                "fromOrderDate": state.fromOrderDate,
                "toOrderDate": state.toOrderDate,
                "pageNumber": state.pageNumber,
                "itemsPage": state.itemsPage,
                "isAscending": state.isAscending,
                "UserType": isJoviCustomerApp ? 1 : 2
            },
            {},
            dispatch,
            onSuccessHandler,
            onErrorHandler,
            '',
            true);
    };
    const setTabHandler = tabIndex => setState(prevState => ({ ...prevState, activeTab: tabIndex, noRecFound: "" }));

    const navigationHandler = (item) => navigation.navigate('order_history_details', { dataParams: item, parentScreenState: state });

    const paginationHandler = (pageNumber, itemsPage, isAscending) => {
        postRequest('/api/Order/List',
            {
                "orderType": state.orderType,
                "jobCategory": state.jobCategory,
                "fromOrderDate": state.fromOrderDate,
                "toOrderDate": state.toOrderDate,
                "pageNumber": pageNumber,
                "itemsPage": itemsPage,
                "isAscending": isAscending,
                "UserType": isJoviCustomerApp ? 1 : 2
            },
            {},
            dispatch,
            res => {
                let newList = state.orderList.list.concat(res.data.orderList.list);
                // console.log("newList :", newList);
                setState(prevState => ({
                    ...prevState,
                    pageNumber,
                    itemsPage,
                    orderList: {
                        list: newList,
                        paginationInfo: res.data.orderList.paginationInfo,

                    }
                }));
            },
            err => console.log(err),
            ''
        );
    };
    useEffect(() => {
        if (isJoviCustomerApp) getAllOrdersHistory(!state.activeTab ? 1 : 0);
        else getAllOrdersHistory(0);
    }, [state.activeTab])
    // console.log("OrdersContainer.State :", state);
    return (
        <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
            <CustomHeader
                leftIconHandler={'toggle'}
                rightIconHandler={null}
                navigation={navigation}
                leftIcon={commonIcons.menueIcon(activeTheme)}
                bodyContent={isJoviCustomerApp ? 'My Orders' : 'BOOKING HISTORY'}
                rightIcon={null}
                activeTheme={activeTheme}
            />
            {
                isJoviCustomerApp ?
                    <CustomTabs
                        tabsArr={['Schedule', 'History']}
                        activeTheme={activeTheme}
                        activeTab={state.activeTab}
                        tabHandler={setTabHandler}
                        tabsContainerStyles={{ top: 0 }}
                    />
                    :
                    null
            }
            <View style={{ flex: 1, marginTop: plateformSpecific(10, -15) }}>
                <OrdersHistory
                    onPress={item => navigationHandler(item)}
                    activeTheme={activeTheme}
                    data={state.orderList.list}
                    parentState={state}
                    paginationHandler={paginationHandler}
                    {...props}
                />
            </View>
        </ImageBackground>

    )
};
export default OrdersContainer;
