import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native'
import { doneIcon } from "../assets/svgIcons/customerorder/customerorder";
import topNoRiderFound from '../assets/svgIcons/rider/topNoRiderFound.svg';
import retryNoRiderFound from '../assets/svgIcons/rider/retryNoRiderFound.svg';
import cancelNoRiderFound from '../assets/svgIcons/rider/cancelNoRiderFound.svg';


import { SvgXml } from "react-native-svg";
import allocatingRiderIcon from "../assets/allocating-rider.gif";
import { calculateTimeDifference, getHubConnectionInstance, navigateWithResetScreen } from '../utils/sharedActions';
import { getRequest } from '../services/api';
import AsyncStorage from '@react-native-community/async-storage';
import CustomToast from '../components/toast/CustomToast';
import { closeModalAction } from '../redux/actions/modal';
const CommonRiderAllocation = props => {
    console.log("[CommonRiderAllocation].Props :", props);
    // console.log("[CommonRiderAllocation].getHubConnectionInstance :", getHubConnectionInstance);

    let initState = {
        "orderRequestTime": null,
        "allocatingRiderRetryString": ""
    };
    const [state, setState] = useState(initState);
    const retriedRequestTime = useRef(new Date().getTime());
    const retryOrderRequest = (isAuto, orderID) => {
        // debugger;
        getRequest(`/api/Order/Customer/SendOrderRequest?orderID=${orderID}`,
            {},
            props.dispatch,
            res => {
                // debugger;
                setState((prevState) => ({
                    ...prevState,
                    // allocatingRiderModalVisible: true,
                    orderID: orderID,
                    allocatingRiderRetryString: (isAuto === false) ? "" : prevState.allocatingRiderRetryString,
                    orderRequestTime: (isAuto === false) ? new Date().getTime() : prevState.orderRequestTime
                }));
            },
            err => {
                // debugger;
                CustomToast.error("Error Occurred in Retrying Order Request");
            },
            "",
            true,
            false
        );
    };
    // console.log('state :', state);
    useEffect(() => {
        setState(pre => ({ ...pre, orderRequestTime: new Date().getTime() }));
    }, []);
    useEffect(() => {
        getHubConnectionInstance("RiderFound")?.on("RiderFound", (orderId) => {
            console.log(`CommonRiderAllocation -> : `, [orderId]);
            if (props.orderInfo.orderID === orderId) {
                getRequest("/api/Dashboard/GetOpenOrderDetails/List",
                    {},
                    props.dispatch,
                    res => {
                        const handleCase = async () => {
                            let tempArr = res.data.getOpenOrderDetails.openOrderList.length > 3 ?
                                res.data.getOpenOrderDetails.openOrderList.slice(res.data.getOpenOrderDetails.openOrderList.length - 3, res.data.getOpenOrderDetails.openOrderList.length)
                                :
                                res.data.getOpenOrderDetails.openOrderList;

                            let openOrderDetails = {
                                noOfOrders: tempArr.length,
                                openOrderList: tempArr
                            };

                            await AsyncStorage.setItem("home_tasksData", JSON.stringify(openOrderDetails));
                            props?.navigation.navigate("customer_order", { fetchPreviousOrder: false, openOrderID: orderId, selectDestination: false, fromHome: false, homeFooterHandler: {} });
                        };
                        handleCase();
                        props.dispatch(closeModalAction());
                    },
                    err => { },
                    ""
                );
            } else {
                console.log('props.orderInfo.orderID :', props.orderInfo.orderID, "server orderId :", orderId);
                CustomToast.error('Dev error Order ids are different check console :',);
            }
        });
        getHubConnectionInstance("NoRiderFound")?.on("NoRiderFound", (responseStr, orderId) => {
            console.log(`CommonRiderAllocation -> ' NoRiderFound': `, [responseStr, orderId]);
            console.log("CommonRiderAllocation.State :", state);
            const currentTime = new Date().getTime();
            const timeWhenOrderWasRequested = (state.orderRequestTime) ? state.orderRequestTime : currentTime;
            const timeDifferenceTillNow_sinceOrderRequested = calculateTimeDifference(currentTime, timeWhenOrderWasRequested, "minutes");

            console.log("->CommonRiderAllocation timeWhenOrderWasRequested: ", timeWhenOrderWasRequested);
            console.log("->CommonRiderAllocation timeDifferenceTillNow_sinceOrderRequested: ", timeDifferenceTillNow_sinceOrderRequested + " minute(s)");

            if (timeWhenOrderWasRequested && timeDifferenceTillNow_sinceOrderRequested < 1) {

                const timeWhenAutoRetriedRequest = retriedRequestTime.current;
                const timeDifferenceTillNow_sinceAutoRetriedRequest = currentTime - timeWhenAutoRetriedRequest;

                // console.log("&");
                // console.log("-> timeWhenAutoRetriedRequest: ", timeWhenAutoRetriedRequest.toString());
                // console.log("-> timeDifferenceTillNow_sinceAutoRetriedRequest: ", timeDifferenceTillNow_sinceAutoRetriedRequest + " millisecond(s)");

                if (timeDifferenceTillNow_sinceAutoRetriedRequest < 900) {
                    console.log("-> Waiting for 6 seconds before initiating a new Auto Retry Order Request, without this it will create a loop of 'NoRiderFound'!")

                    setTimeout(() => {
                        const currentTime = new Date().getTime();
                        CustomToast.success("Finding a rider again! Please wait...");
                        console.log("-> Auto Retrying Order Request!");
                        retriedRequestTime.current = currentTime;
                        retryOrderRequest(true, orderId);
                    }, 6000);
                }
                else {
                    CustomToast.success("Finding a rider again! Please wait...");
                    console.log("-> Auto Retrying Order Request!");
                    retriedRequestTime.current = currentTime;
                    retryOrderRequest(true, (props.orderInfo.orderID || orderId));
                }
            }
            else {
                console.log("-> Ask user to do retry Manually, waiting time is over!");
                setState((prevState) => ({
                    ...prevState,
                    allocatingRiderRetryString: responseStr,
                    orderRequestTime: null
                }));
            }
        });
        return () => {

        }
    }, [state]);

    const RiderAllocationErrorUI = () => {
        return <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
                <SvgXml xml={topNoRiderFound} height={60} width={60} />

                <Text style={{ color: '#000', marginTop: 10, left: 0, fontWeight: "bold", marginVertical: 0 }}>Sorry!</Text>

                <Text style={{ color: '#000', marginTop: 10, left: 0, marginVertical: 0 }}>{state.allocatingRiderRetryString || ""}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ elevation: 8, width: 90, backgroundColor: "transparent" }} onPress={() => {
                    retriedRequestTime.current = new Date().getTime();
                    retryOrderRequest(false, props.orderInfo.orderID);
                }}>
                    <SvgXml xml={retryNoRiderFound} height={45} width={45} />

                </TouchableOpacity>
                <TouchableOpacity style={{
                    borderRadius: 0,
                    // backgroundColor: "transparent"
                }} onPress={() => {
                    props.dispatch(closeModalAction());
                    navigateWithResetScreen(null, [{ name: props.backScreen }]);
                }}>
                    <SvgXml xml={cancelNoRiderFound} height={45} width={45} />
                </TouchableOpacity>
            </View>
        </View>
    };
    const RiderAllocationModalUI = () => {
        return (
            <View style={{ paddingVertical: 25, flexDirection: "column", alignItems: "center" }}>
                <SvgXml xml={doneIcon()} height={70} width={70} />
                <Text style={{
                    position: "relative",
                    left: 10,
                    fontSize: 15,
                    color: '#7359BE',
                    marginVertical: 10, color: '#000', marginTop: 10, left: 0, fontWeight: "bold", marginVertical: 0
                }}>Your Order is Placed</Text>

                <Text style={{
                    position: "relative",
                    left: 10,
                    fontSize: 15,
                    color: '#7359BE',
                    marginVertical: 10, color: '#000', marginTop: 10, left: 0, marginVertical: 0
                }}>Your Jovi will be at your services shortly...</Text>

                <ImageBackground source={allocatingRiderIcon} style={{ marginTop: 15, resizeMode: 'contain', width: 70, height: 70 }} />
            </View>
        )
    };
    return state.allocatingRiderRetryString ? <RiderAllocationErrorUI {...state} {...props} /> : <RiderAllocationModalUI {...state} {...props} />
}

const TempRiderAllocationModalUI = () => {
    return (
        <View style={{ paddingVertical: 25, flexDirection: "column", alignItems: "center" }}>
            <SvgXml xml={doneIcon()} height={70} width={70} />
            <Text style={{
                position: "relative",
                left: 10,
                fontSize: 15,
                color: '#7359BE',
                marginVertical: 10, color: '#000', marginTop: 10, left: 0, fontWeight: "bold", marginVertical: 0
            }}>Your Order is Placed</Text>

            <Text style={{
                position: "relative",
                left: 10,
                fontSize: 15,
                color: '#7359BE',
                marginVertical: 10, color: '#000', marginTop: 10, left: 0, marginVertical: 0
            }}>Your Jovi will be at your services shortly...</Text>

            <ImageBackground source={allocatingRiderIcon} style={{ marginTop: 15, resizeMode: 'contain', width: 70, height: 70 }} />
        </View>
    )
};
export {
    CommonRiderAllocation,
    TempRiderAllocationModalUI
};
