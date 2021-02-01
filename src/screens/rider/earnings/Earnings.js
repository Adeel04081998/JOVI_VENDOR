import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, ImageBackground, } from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';
import menuIcon from '../../../assets/svgIcons/common/menu-stripes.svg';
import arrowBack from '../../../assets/svgIcons/rider/arrowBack.svg';
import arrowNext from '../../../assets/svgIcons/rider/arrowNext.svg';
import verticalBar from '../../../assets/svgIcons/rider/verticalBar.svg';
import { ScrollView } from 'react-native-gesture-handler';
import commonStyles from '../../../styles/styles';
import { BarChart } from "react-native-chart-kit";
import { SvgXml } from 'react-native-svg';
import { renderPicture, sharedCommasAmountConveter } from '../../../utils/sharedActions';
import Spinner from 'react-native-spinkit';
import { postRequest } from '../../../services/api';
import moment from 'moment';
import { DATE_FORMATE } from '../../../config/config';
import CustomToast from '../../../components/toast/CustomToast';
import commonSvgIcons from '../../../assets/svgIcons/icons';

const winLayout = Dimensions.get('window');
export default props => {
    const momentDateConverter = (date, formate) => moment(date, formate).toDate();
    const getRangedDates = (type, start, range) => {
        let toDate = momentDateConverter(start, DATE_FORMATE);
        if (type === 1) {
            return {
                startDate: moment(toDate).format(DATE_FORMATE),
                endDate: moment(toDate).add(range, 'days').format(DATE_FORMATE)
            }
        } else {
            return {
                endDate: moment(toDate).format(DATE_FORMATE),
                startDate: moment(toDate).subtract(range, "days").format(DATE_FORMATE),
            }
        }
    };
    let initState = {
        // "isImageViewOpen": false,
        "stateFirstOrderDate": "",
        "stateMinOrderDate": "",
        "isDraggarPicked": false,
        "upperCardLayout": {
            'height': winLayout.height * 0.6
        },
        "lowerCardLayout": {
            "imgLayout": {
                "height": 150
            }
        },
        "offSet": 0,
        "chartCardLayout": {
            'height': 0,
            'width': 0,
        },
        "imgLoading": true,
        "expandableArea": {
            "isExpanded": false,
            "expandedIndex": null
        },
        "riderEarningsViewModel": {
            ...getRangedDates(2, new Date(), 7),
            "minimumOrderDate": "",
            "firstOrderDate": "",
            "totalEarnings": 0,
            "chartData": {
                "labels": [],
                "datasets": [
                    {
                        "data": []
                    }
                ],
            },
        },
        "getOrdersEarningsByDate": []
    };
    const [state, setState] = useState(initState);
    const barChartRef = useRef(null);
    // console.log(winLayout.height - upperCardLayout.height)
    console.log('props :', props);
    // console.log('State :', state);
    const onGetByDateSuccess = res => {
        if (res.data.statusCode === 200) setState(pre => ({ ...pre, getOrdersEarningsByDate: res.data.getOrdersEarningsByDate, expandableArea: initState.expandableArea }));
        else if (res.data.statusCode === 404) setState(pre => ({ ...pre, getOrdersEarningsByDate: initState.getOrdersEarningsByDate, expandableArea: initState.expandableArea }))
    };
    const onGetByDateError = er => {
        if (er) return CustomToast.error("Something went wrong");
    };
    const getEarningDetailsByDateHandler = args => {
        postRequest(
            `/api/Menu/Rider/GetOrdersEarningsByDate`,
            {
                'orderDate': args.orderDate,
            },
            {},
            props.dispatch,
            onGetByDateSuccess,
            onGetByDateError,
            '')
    };
    const onSuccessHandler = (apiRes, args) => {
        // console.log('args :', args);
        if (apiRes.data.statusCode === 200) {
            // console.log(JSON.parse(apiRes.config.data).startDate)
            setState(pre => ({ ...pre, riderEarningsViewModel: apiRes.data.riderEarningsViewModel, stateFirstOrderDate: args.isFirstLoad ? apiRes.data.riderEarningsViewModel.firstOrderDate : pre.stateFirstOrderDate, stateMinOrderDate: args.isFirstLoad ? apiRes.data.riderEarningsViewModel.minimumOrderDate : pre.stateMinOrderDate }));
            getEarningDetailsByDateHandler({ orderDate: apiRes.data.riderEarningsViewModel.firstOrderDate });
        }
        else if (apiRes.data.statusCode === 404) {
            setState(pre => ({
                ...pre,
                riderEarningsViewModel: {
                    // ...pre.riderEarningsViewModel,
                    // totalEarnings: 0,
                    ...initState.riderEarningsViewModel,
                    ...JSON.parse(apiRes.config.data)
                },
                getOrdersEarningsByDate: []
            }));
            // CustomToast.error("No Record Found");
        }
    };
    const onErrorHandler = apiError => {
        if (apiError) return CustomToast.error("Something went wrong");
        console.log(apiError);
    };
    const getEarningsHandler = args => {
        postRequest(
            `/api/Menu/Rider/GetEarnings`,
            {
                'startDate': args.startDate,
                'endDate': args.endDate,
            },
            {},
            props.dispatch,
            res => onSuccessHandler(res, args),
            onErrorHandler,
            '')
    };

    const nextPrevPress = pressType => {
        if (pressType === 1) getEarningsHandler({ isFirstLoad: false, ...getRangedDates(pressType, moment(momentDateConverter(state.riderEarningsViewModel.endDate, DATE_FORMATE)).add(1, "day"), 6) });
        else getEarningsHandler({ isFirstLoad: false, ...getRangedDates(pressType, moment(momentDateConverter(state.riderEarningsViewModel.startDate, DATE_FORMATE)).subtract(1, "day"), 6) });
    };
    const renderExpendedArea = rec => (
        <View style={{ flex: 1 }}>
            <ImageBackground onLoadEnd={() => setState(pre => ({ ...pre, imgLoading: false }))} style={{ flex: 1, height: state.lowerCardLayout.imgLayout.height, width: "100%" }} resizeMode={"cover"} source={{ uri: renderPicture(rec.orderImg, props.user?.tokenObj?.token?.authToken) }}>
                {
                    state.imgLoading ?
                        <View style={{ height: 100, justifyContent: 'center', alignItems: "center", }}>
                            <Spinner isVisible={state.imgLoading} size={40} type="Circle" color={props.activeTheme.default} />
                        </View>
                        : null

                }
            </ImageBackground>
            <View style={{ flex: 1, flexDirection: 'column' }}>
                {
                    [{ t: "Trip Earnings", am: `Rs ${rec.totalEarningsOfOrder}` }, { t: "Jovi Deduction", am: `Rs ${rec.joviDeduction}` }, { t: "You Earned", am: `PKR ${rec.earnings}` }]
                        .map((doc, j) => (
                            <View key={j} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 7 }}>
                                <Text style={j === 2 ? commonStyles.fontStyles(14, "#000", 3, 'bold') : {}}>{doc.t}</Text>
                                <Text style={j === 2 ? commonStyles.fontStyles(14, "#000", 3, 'bold') : {}}>{doc.am}</Text>
                            </View>
                        ))
                }
            </View>
        </View>

    )
    const showHideExpandedCard = idx => {
        if (idx !== state.expandableArea.expandedIndex) setState(pre => ({
            ...pre, expandableArea: {
                expandedIndex: idx, isExpanded: true
            }
        }));
        else setState(pre => ({
            ...pre, expandableArea: {
                expandedIndex: idx, isExpanded: !pre.expandableArea.isExpanded
            }
        }));
    };
    const enumerateDaysBetweenDates = (startDate, endDate) => {
        let dates = []
        while (moment(momentDateConverter(startDate, DATE_FORMATE)) <= moment(momentDateConverter(endDate, DATE_FORMATE))) {
            dates.push(startDate);
            startDate = moment(momentDateConverter(startDate, DATE_FORMATE)).add(1, 'day').format(DATE_FORMATE);
        }
        return dates;
    };
    const onDataPointClick = args => getEarningDetailsByDateHandler({ orderDate: enumerateDaysBetweenDates(state.riderEarningsViewModel.startDate, state.riderEarningsViewModel.endDate)[args.index] });
    const onResponderMove = e => {
        // console.log("onResponderMove :", state.offSet, e.nativeEvent.pageY);
        e.persist();
        if (state.isDraggarPicked) {
            setState(pre => ({
                ...pre,
                upperCardLayout: {
                    height: Math.ceil(e.nativeEvent.pageY) > Math.ceil(pre.offSet) ? pre.upperCardLayout.height + (Math.ceil(e.nativeEvent.pageY) - Math.ceil(pre.offSet)) : pre.upperCardLayout.height - (Math.ceil(pre.offSet) - Math.ceil(e.nativeEvent.pageY))
                },
                offSet: e.nativeEvent.pageY,
            }))
        }
    };
    const onResponderGrant = e => {
        e.persist();
        // console.log("onResponderGrant");
        setState(pre => ({
            ...pre,
            offSet: e.nativeEvent.pageY,
            isDraggarPicked: true
        }));
    };
    const onResponderRelease = e => {
        e.persist();
        setState(pre => ({
            ...pre, isDraggarPicked: false,
            offSet: e.nativeEvent.pageY,
            lowerCardLayout: {
                ...pre.lowerCardLayout,
                imgLayout: {
                    height: pre.upperCardLayout.height >= 400 ? initState.lowerCardLayout.imgLayout.height : pre.upperCardLayout.height === winLayout.height * 0.6 ? pre.lowerCardLayout.imgLayout.height : 362 * (winLayout.width / 250)
                }
            },
        }));
    };
    useEffect(useCallback(() => {
        getEarningsHandler({ startDate: "", endDate: "", isFirstLoad: true });
        // getEarningsHandler({ startDate: "09/10/2020", endDate: "15/10/2020" });
    }, []), []);
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader
                leftIconHandler={'toggle'}
                rightIconHandler={null}
                navigation={props.drawerProps.navigation}
                leftIcon={menuIcon}
                bodyContent={"EARNINGS"}
                rightIcon={null}
                activeTheme={props.activeTheme}
            />
            <View style={{ flex: 1, marginTop: 20 }}>
                <View style={{
                    height: state.upperCardLayout.height, minHeight: 150, maxHeight: (winLayout.height * 0.5) + 20, marginHorizontal: 15, borderRadius: 10, elevation: state.isDraggarPicked ? 5 : 3, backgroundColor: props.activeTheme.white, paddingBottom: 10, shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                }} onLayout={e => {
                    e.persist();
                    setState(pre => ({ ...pre, chartCardLayout: e.nativeEvent.layout }))
                }}>
                    <View style={{ padding: 5, borderColor: "#7359BE", borderWidth: 0.3, margin: 15, borderRadius: 5, justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ marginLeft: 5 }}>
                                <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.grey, 1) }}>Wallet Balance
                                {'\n'}
                                    <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.black, 4) }}>PKR {sharedCommasAmountConveter(props.user.balance)}</Text>
                                </Text>
                            </View>
                            {/* <TouchableOpacity onPress={() => sharedOpenModal({ dispatch: props.dispatch, visible: true, transparent: true, modalHeight: 270, modelViewPadding: 0, ModalContent: <ModalView {...props} />, okHandler: () => { }, onRequestCloseHandler: null, androidKeyboardExtraOffset: 30 })} style={{ marginRight: 5, backgroundColor: props.activeTheme.default, justifyContent: 'center', alignItems: 'center', padding: 10, borderRadius: 5 }}>
                                <Text style={{ color: props.activeTheme.white }}>WITHDRAW</Text>
                            </TouchableOpacity> */}
                        </View>
                    </View>
                    <View style={{ margin: 0 }}>
                        <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.black, 1), textAlign: 'center' }}>{`${moment(momentDateConverter(state.riderEarningsViewModel.startDate, DATE_FORMATE)).format("MMM D")} - ${moment(momentDateConverter(state.riderEarningsViewModel.endDate, DATE_FORMATE)).format(state.riderEarningsViewModel.startDate.split("/")[1] === state.riderEarningsViewModel.endDate.split("/")[1] ? "D YYYY" : "MMM D YYYY")}`}</Text>
                        <View style={{ ...commonStyles.flexStyles(1, 'row', 'space-between', 'center'), marginTop: 20, paddingHorizontal: 10 }}>
                            {
                                enumerateDaysBetweenDates(state.riderEarningsViewModel.startDate, state.riderEarningsViewModel.endDate).includes(state.stateMinOrderDate) ? <View />
                                    :
                                    <SvgXml xml={arrowBack} height={25} width={25} onPress={() => nextPrevPress(2)} />
                            }
                            <Text style={{ ...commonStyles.fontStyles(18, props.activeTheme.black, 4), textAlign: 'center' }}>{`PKR. ${state.riderEarningsViewModel.totalEarnings}`}</Text>
                            {
                                enumerateDaysBetweenDates(state.riderEarningsViewModel.startDate, state.riderEarningsViewModel.endDate).includes(state.stateFirstOrderDate) ? <View /> :
                                    < SvgXml xml={arrowNext} height={25} width={25} onPress={() => nextPrevPress(1)} />
                            }
                        </View>
                    </View>
                    {
                        (state.riderEarningsViewModel.chartData.labels.length > 0 && state.chartCardLayout.width > 0) ?
                            // <View style={{ flex: 1, marginTop: 40, overflow: 'hidden', }} onTouchStart={e => console.log("Event :", e.nativeEvent.touches, 'barChartRef', barChartRef.current, 'Others :', barChartRef.current && barChartRef.current.calcBaseHeight(state.riderEarningsViewModel.chartData.datasets[0].data, 220))}>
                            <View style={{ flex: 1, marginTop: 20, overflow: 'hidden' }}>
                                <BarChart
                                    // segments={12}
                                    ref={barChartRef}
                                    onDataPointClick={onDataPointClick}
                                    // children={() => <View><Text>Hello</Text></View>}
                                    style={{
                                        paddingRight: -7,
                                    }}
                                    data={state.riderEarningsViewModel.chartData}
                                    width={state.chartCardLayout.width}
                                    height={220}
                                    showBarTops={false}
                                    withInnerLines={false}
                                    showValuesOnTopOfBars={true}
                                    // yAxisLabel="PKR"
                                    withVerticalLabels={true}
                                    withHorizontalLabels={false}
                                    fromZero={true}
                                    chartConfig={{
                                        // backgroundColor: 'red',
                                        // paddingRight: 100,
                                        // width: '100%',
                                        backgroundGradientFrom: "#fff",
                                        backgroundGradientTo: "#fff",
                                        fillShadowGradient: props.activeTheme.default,
                                        fillShadowGradientOpacity: 1,
                                        barRadius: 5,
                                        barPercentage: 0.9,
                                        // useShadowColorFromDataset: true,
                                        // scrollableDotFill: "e",
                                        // backgroundGradientFromOpacity: 1,
                                        // backgroundGradientToOpacity: 1,
                                        // decimalPlaces: 2, 
                                        // optional, defaults to 2dp
                                        color: (opacity = 1) => props.activeTheme.black,
                                        labelColor: (opacity = 1) => props.activeTheme.black,
                                        style: {
                                            borderRadius: 16,
                                        },
                                        propsForDots: {
                                            // onPressIn: e => console.log('onPressIn :', e),
                                            r: "6",
                                            strokeWidth: "10",
                                        },
                                        propsForBackgroundLines: {

                                            // backgroundColor: 'red'
                                        },
                                        propsForLabels: {
                                            // onPress: e => console.log('onPress :', e),
                                            // onLongPress: e => console.log('onLongPress :', e),
                                            // onPressIn: e => console.log('onPressIn :', e),
                                            // onPressOut: e => console.log('onPressOut :', e),
                                        },
                                        propsForVerticalBars: {

                                        },
                                        // stackedBar: true,
                                        propsForVerticalLabels: {

                                            // baselineShift: true
                                            // fontSize: 14,
                                            // onPress: e => console.log('onPress :', e),
                                            // onLongPress: data => console.log('onLongPress :', data),
                                            // onPressIn: e => console.log('onPressIn :', e),
                                            // onPressOut: e => console.log('onPressOut :', e),

                                            // 'fill': 'red'
                                        },
                                        propsForHorizontalLabels: {
                                            // onPress: data => console.log('Data :', data),
                                            // onLongPress: data => console.log('Data :', data),
                                            // onPressIn: data => console.log('Data :', data),
                                            // onPressOut: data => console.log('Data :', data),
                                            // fill: 'red'
                                        },


                                    }}
                                    verticalLabelRotation={0}

                                />
                            </View>
                            : null
                    }
                    <View style={{ position: 'absolute', left: 0, right: 0, bottom: -25, zIndex: 999 }}>
                        <SvgXml onTouchMove={onResponderMove} xml={commonSvgIcons.draggarIcon({ fill: state.isDraggarPicked ? props.activeTheme.default : props.activeTheme.grey })} height={50} width={50} style={{ alignSelf: 'center' }} onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true} onResponderGrant={onResponderGrant} onResponderRelease={onResponderRelease} onResponderMove={onResponderMove} />
                    </View>
                </View>
                <ScrollView style={{ flex: 1, marginBottom: 35, marginTop: 20 }}>
                    {
                        (state.getOrdersEarningsByDate || []).map((x, k) => (

                            // <View key={k} style={{ height: state.expandableArea.isExpanded && (state.expandableArea.expandedIndex === k) ? 250 : 80, marginHorizontal: 15, borderColor: '#707070', backgroundColor: props.activeTheme.listBgColor, elevation: 0.5, borderRadius: 5, marginTop: k > 0 ? 10 : 0, overflow: 'hidden' }}>
                            <View key={k} style={{ flex: 1, marginHorizontal: 15, borderColor: '#707070', backgroundColor: props.activeTheme.listBgColor, elevation: 0.5, borderRadius: 5, marginTop: k > 0 ? 10 : 0, overflow: 'hidden' }}>

                                <TouchableOpacity style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', backgroundColor: "#F9F8F8" }} activeOpacity={1} onPress={() => showHideExpandedCard(k)}>
                                    {
                                        state.expandableArea.isExpanded && (state.expandableArea.expandedIndex === k) ?
                                            renderExpendedArea(x)
                                            :
                                            <View style={{ padding: 3 }}>
                                                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={{ height: 15, width: 15, borderRadius: 7.5, borderColor: props.activeTheme.default, borderWidth: 2 }} />
                                                        <Text style={{ ...commonStyles.fontStyles(14, '#000000', 1), left: 5 }}>{x.orderDate}</Text>
                                                    </View>
                                                    <Text style={{ ...commonStyles.fontStyles(14, '#000000', 2) }}>{x.orderTime}</Text>
                                                </View>

                                                <View style={{ flex: 0, paddingHorizontal: 15 }}>
                                                    <SvgXml xml={verticalBar} />
                                                </View>
                                                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={{ height: 15, width: 15, borderRadius: 7.5, borderColor: props.activeTheme.default, backgroundColor: props.activeTheme.default, }} />
                                                        <Text style={{ ...commonStyles.fontStyles(14, '#000000', 1), left: 5 }}>{x.orderTypeStr}</Text>
                                                    </View>
                                                    <Text style={{ ...commonStyles.fontStyles(14, '#000000', 2) }}>{`PKR ${x.totalEarningsOfOrder}`}</Text>
                                                </View>
                                            </View>

                                    }
                                </TouchableOpacity>
                            </View>

                        ))
                    }

                </ScrollView>
            </View>
            {/* <CustomImageView
                key={0}
                imageIndex={0}
                imagesArr={[{
                    uri: renderPicture(state.getOrdersEarningsByDate[state.expandableArea.expandedIndex]?.orderImg, props.user?.tokenObj?.token?.authToken)
                }]}
                visible={state.isImageViewOpen}
                onRequestClose={() => setState(pre => ({ ...pre, isImageViewOpen: !pre.isImageViewOpen }))}
                swipeToCloseEnabled={true}
            /> */}
        </View>
    )
};
const styles = StyleSheet.create({
    defaultInputArea: (activeTheme, currentField, state) => ({
        width: '100%',
        borderWidth: 1,
        borderRadius: 20,
        borderColor: state.focusedField === currentField ? activeTheme.default : 'rgba(0,0,0,0.1)',
        paddingVertical: 0,
        height: 50,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: activeTheme.white

    }),
});




