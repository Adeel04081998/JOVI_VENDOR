import React, { useRef } from 'react';
import { DEVICE_SCREEN_WIDTH } from '../../config/config';
import commonStyles from '../../styles/styles';
import { Animated, View, Text, TouchableOpacity } from 'react-native';
import { closeModalAction } from '../../redux/actions/modal';
import { postRequest } from '../../services/api';
import CustomToast from '../../components/toast/CustomToast';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { userAction } from '../../redux/actions/user';


export default ({ orderID, activeTheme, navigation, dispatch, userObj }) => {

    const onAccepted = () => {
        dispatch(closeModalAction());
        sendResponseToServer(1, "Accepted");
    };

    const onIgnored = () => {
        dispatch(closeModalAction());
        sendResponseToServer(2, "Ignored");
    };

    const onCancelled = () => {
        dispatch(closeModalAction());
        sendResponseToServer(3, "Cancelled");
    };

    const sendResponseToServer = (riderActionType, riderActionTypeStr) => {
        orderID &&
            postRequest(
                '/api/Order/Rider/OrderAllocation',
                {
                    "orderID": orderID,
                    "riderActionType": riderActionType
                },
                null,
                dispatch,
                (response) => {
                    CustomToast.success(`Order ${riderActionTypeStr}!`);
                    if (riderActionTypeStr === "Accepted") {
                        dispatch(userAction({ ...userObj, orderID: orderID }));
                        navigation.navigate("rider_order", { fetchPreviousOrder: false, openOrderID: orderID, selectDestination: false, fromHome: false, homeFooterHandler: {} });
                    }
                },
                (error) => {
                    console.log(((error?.response) ? error.response : {}), error);
                    CustomToast.error("Error in Order Allocation!");
                },
                true
            );
    };

    return (
        <View style={{ flex: 1, width: DEVICE_SCREEN_WIDTH }}>
            <View style={{ padding: 17 }}>
                <Text style={{ textAlign: 'left', ...commonStyles.fontStyles(17, activeTheme.default, 1) }}>
                    {"Please accept the incoming order"}
                </Text>

                <View style={{ justifyContent: 'center', alignSelf: "center", marginTop: 19, width: 110 }}>
                    <TouchableOpacity onPress={() => onAccepted()}>
                        <CountdownCircleTimer
                            onComplete={() => onIgnored()}
                            size={110}
                            duration={20} // in "seconds"
                            isPlaying={true}
                            strokeLinecap="round"
                            rotation="clockwise"
                            trailColor="#dedede"
                            isLinearGradient={false}
                            colors={[
                                ["#6d4fc6", 0.4],
                                ["#7359be", 0.4],
                                ["#fc3f93", 0.2],
                            ]}
                        >
                            {({ remainingTime, animatedColor }) => (
                                <Animated.Text style={{ color: animatedColor, fontSize: 13.5, fontWeight: "bold" }}>
                                    {"ACCEPT"}
                                </Animated.Text>
                            )}
                        </CountdownCircleTimer>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableOpacity style={{ justifyContent: "center", alignItems: 'center', paddingVertical: 18, backgroundColor: "#fc3f93" }} onPress={() => onCancelled()}>
                    <Text style={{ ...commonStyles.fontStyles(14, activeTheme.white, 1), fontWeight: "bold" }}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
