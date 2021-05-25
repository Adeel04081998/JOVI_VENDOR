import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ImageBackground, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native'
import { doneIcon } from "../assets/svgIcons/customerorder/customerorder";
import topNoRiderFound from '../assets/svgIcons/rider/topNoRiderFound.svg';
import retryNoRiderFound from '../assets/svgIcons/rider/retryNoRiderFound.svg';
import cancelNoRiderFound from '../assets/svgIcons/rider/cancelNoRiderFound.svg';
import { Picker } from 'native-base';


import { SvgXml } from "react-native-svg";
import allocatingRiderIcon from "../assets/allocating-rider.gif";
import { calculateTimeDifference, camelToTitleCase, convert24To12Hour, getHubConnectionInstance, navigateWithResetScreen } from '../utils/sharedActions';
import { getRequest } from '../services/api';
import AsyncStorage from '@react-native-community/async-storage';
import CustomToast from '../components/toast/CustomToast';
import { closeModalAction } from '../redux/actions/modal';
import commonStyles from '../styles/styles';
import { TextInput } from 'react-native-gesture-handler';
export const TimePicker24 = ({ time,noButtons, title, onTimeChange,enabled, activeTheme,saveTime ,onCancel}) => {
    return <>
        <Text style={{ ...commonStyles.fontStyles(16, activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Set {camelToTitleCase(title??'')}</Text>
        <View style={{ width: '100%', flexDirection: 'row' }}>
            <Text style={{ ...commonStyles.caption, paddingLeft: 20, width: '50%', left: 0, color: '#000' }}>Hour</Text>
            <Text style={{ ...commonStyles.caption, paddingLeft: 17, width: '50%', left: 0, color: '#000' }}>Minutes</Text>
        </View>
        <View style={{ marginTop: 2, paddingLeft: 20, paddingRight: 20, marginBottom:noButtons===true?0:60, flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
            <Picker
                accessibilityLabel={"hours"}
                style={{ zIndex: 500, width: 115 }}
                mode="dialog" // "dialog" || "dropdown"
                // prompt="Select Hours"
                enabled={enabled===false?false:true}
                selectedValue={(time || "HH:MM").split(":")[0]}
                onValueChange={(value, i) => onTimeChange(value, 0)}
            >
                {
                    Array.from(Array(24), (item, i) => ( i.toString()))
                        .map((item, i) => (
                            <Picker.Item key={i} label={item} value={item} />
                        ))
                }
            </Picker>
            <Text style={{ ...commonStyles.caption, left: 0, top: 2.5, color: "#000", fontWeight: "bold" }}>:</Text>
            <Picker
                accessibilityLabel={"minutes"}
                style={{ zIndex: 500, width: 115 }}
                mode="dialog" // "dialog" || "dropdown"
                enabled={enabled===false?false:true}
                selectedValue={(time || "HH:MM").split(":")[1]}
                onValueChange={(value, i) => onTimeChange(value, 1)}
            >
                {
                    Array.from(Array(60), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                        .map((item, i) => (
                            <Picker.Item key={i} label={item} value={item} />
                        ))
                }
            </Picker>
        </View>
        {noButtons === true?null:<View style={{ position: 'absolute', bottom: 0, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => onCancel()}>
                <Text style={{ ...commonStyles.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center' }} onPress={() => saveTime()}>
                <Text style={{ ...commonStyles.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CONTINUE{/*SAVE */}</Text>
            </TouchableOpacity>
        </View>}
    </>
}
export const TimePicker12 = ({ time,noButtons, title, onTimeChange, activeTheme,saveTime ,enabled,onCancel}) => {
    let timeConvert = convert24To12Hour(time);
    let time12 = null;
    if(timeConvert.validation === true){
        time12 = timeConvert.time;
    }
    return <>
        <Text style={{ ...commonStyles.fontStyles(16, activeTheme.black, 4), left: 7 /* -5 */, color: '#000', marginVertical: 0, paddingVertical: 6 }}>Set {camelToTitleCase(title??'')}</Text>
        <View style={{ width: '100%', flexDirection: 'row' }}>
            <Text style={{ ...commonStyles.caption, paddingLeft: 20, width: '33%', left: 0, color: '#000' }}>Hour</Text>
            <Text style={{ ...commonStyles.caption, paddingLeft: 17, width: '33%', left: 0, color: '#000' }}>Minutes</Text>
            <Text style={{ ...commonStyles.caption, paddingLeft: 17, width: '33%', left: 0, color: '#000' }}>AM/PM</Text>
        </View>
        <View style={{ marginTop: 2, paddingLeft: 20, paddingRight: 20, marginBottom:noButtons===true?0:60, flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
            <Picker
                accessibilityLabel={"hours"}
                style={{ zIndex: 500, width: 115 }}
                enabled={enabled===false?false:true}
                mode="dialog" // "dialog" || "dropdown"
                // prompt="Select Hours"
                selectedValue={(time || "HH:MM AM").split(" ")[0].split(":")[0]}
                onValueChange={(value, i) => onTimeChange(value, 0)}
            >
                {
                    Array.from(Array(13), (item, i) => ( i.toString()))
                        .filter(item=>parseInt(item)!==0).map((item, i) => (
                            <Picker.Item key={i} label={item} value={item} />
                        ))
                }
            </Picker>
            <Text style={{ ...commonStyles.caption, left: 0, top: 2.5, color: "#000", fontWeight: "bold" }}>:</Text>
            <Picker
                accessibilityLabel={"minutes"}
                style={{ zIndex: 500, width: 115 }}
                enabled={enabled===false?false:true}
                mode="dialog" // "dialog" || "dropdown"
                selectedValue={(time || "HH:MM AM").split(" ")[0].split(":")[1]}
                onValueChange={(value, i) => onTimeChange(value, 1)}
            >
                {
                    Array.from(Array(60), (item, i) => (i < 10 ? 0 + i.toString() : i.toString()))
                        .map((item, i) => (
                            <Picker.Item key={i} label={item} value={item} />
                        ))
                }
            </Picker>
            <Text style={{ ...commonStyles.caption, left: 0, top: 2.5, color: "#000", fontWeight: "bold" }}>  </Text>
            <Picker
                accessibilityLabel={"Period"}
                style={{ zIndex: 500, width: 115 }}
                mode="dialog" // "dialog" || "dropdown"
                enabled={enabled===false?false:true}
                selectedValue={(time || "HH:MM AM").split(" ")[1]}
                onValueChange={(value, i) => onTimeChange(value, 2)}
            >
                {
                    ['AM', 'PM'].map((item, i) => (
                        <Picker.Item key={i} label={item} value={item} />
                    ))
                }
            </Picker>
        </View>
        {noButtons === true?null:<View style={{ position: 'absolute', bottom: 0, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: activeTheme.warning, justifyContent: 'center', alignItems: 'center' }} onPress={() => onCancel()}>
                <Text style={{ ...commonStyles.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: '50%', paddingVertical: 20, height: 60, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center' }} onPress={() => saveTime()}>
                <Text style={{ ...commonStyles.caption, left: 0, color: 'white', marginVertical: 0, paddingVertical: 6, fontWeight: "bold" }}>CONTINUE{/*SAVE */}</Text>
            </TouchableOpacity>
        </View>}
    </>
}
export const CustomInput = ({ label, textStyle, textProps, parentViewStyle, inputViewStyle, value, svgIcon, onChangeText, rightIcon, inputProps, activeTheme, onlyText }) => {
    return <View style={{ width: '100%', paddingLeft: 10, position: 'relative', ...parentViewStyle }}>
        <Text style={[commonStyles.fontStyles(14, activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
            {label}
        </Text>
        {
            rightIcon && <SvgXml xml={svgIcon} height={18} width={18} style={{ alignSelf: 'flex-end', position: 'absolute', right: 25, top: 50 }} />
        }
        <View style={{
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: 'rgba(0,0,0,0.1)',
            backgroundColor: 'transparent',
            height: 40,
            width: '96%',
            justifyContent: "space-between",
            alignItems: 'center',
            flexDirection: 'row',
            overflow:'hidden',
            ...inputViewStyle,
        }}>
            {
                onlyText === true ?
                    <Text {...textProps} style={{ ...textStyle, maxWidth: '95%', minWidth: '90%' }}>{value?.toString()}</Text>
                    :
                    <TextInput value={value} placeholder={label} style={{ width: '100%' }} onChangeText={onChangeText} {...inputProps} />

            }
        </View>

    </View>
}
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
