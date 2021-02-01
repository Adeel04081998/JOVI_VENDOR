import React, { useEffect, useCallback, useState, useRef, Fragment } from 'react';
import { ScrollView, SafeAreaView, ImageBackground, Alert, View, Text, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import CustomHeader from '../../components/header/CustomHeader';
import { Container, Content } from 'native-base';
import svgIcons from '../../assets/svgIcons/feedbackComplaints';
import complaintsFeedbackStyles from './complaintsFeedbackStyles';
import walletHistoryStyles from '../wallet/walletHistoryStyles';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getRequest, postRequest } from '../../services/api';
import { recordsNotExistUI } from '../../utils/sharedActions';
import ExpandableList from '../../components/lists/ExpandableList';
import CustomToast from '../../components/toast/CustomToast';
import { useFocusEffect } from '@react-navigation/native';
import CustomTabs from '../../components/tabs/Tab';
import plateformSpecific from '../../utils/plateformSpecific';
import SmallLoader from '../../components/loader/SmallLoader';
const ComplaintsFeedback = (props) => {
    const { navigation, activeTheme, dispatch, drawerProps } = props;
    // console.log("ComplaintsFeedback.Props :", props)

    let initState = {
        "error": null,
        "activeTab": 0,
        "viewsHeights": [],
        "complaints": [],
        "noRecFound": null,
        complaintsDetailsList: {
            "paginationInfo": {
                "actualPage": 1,
                "itemsPerPage": 0,
                "totalItems": 0,
                "totalPages": 0
            },
            "data": []
        },
        "list": [],
        "pageNumber": 1,
        "itemsPerPage": 10,
        "isAscending": true,
        "month": null,
        "year": null,
        areaExpanded: {
            "index": 0,
            "expanded": false,
        },
    };
    const [state, setState] = useState(initState);
    let nestedScrollRef = useRef(null);
    let minusHeightRef = useRef(null);
    const onSuccessHandler = (response) => {
        if (response.data.statusCode === 200) {
            setState(prevState => ({
                ...prevState,
                complaints: response.data.complaints
            }))
        }
        else if (response.data.statusCode === 404) {
            CustomToast.error("No Record Found");
            setState(pre => ({ ...pre, noRecFound: "No Record Found" }));
        }
    };
    const onErrorHandler = error => {
        console.log("ComplaintsFeedback.onErrorHandler ----", error);
        if (error) {
            CustomToast.error("Something went wrong");
            setState({ ...state, error: "Something went wrong" });
        }


    };
    const onDetailsListSuccess = (response, item, cardIndex, toggleCardsFlag) => {
        // debugger;
        // nestedScrollRef.current.scrollTo({animated: true}, 0);
        if (response.data.statusCode === 200) {
            setState(prevState => ({
                ...prevState,
                complaintsDetailsList: {
                    data: prevState.complaintsDetailsList.data.concat(response.data.complaints.data),
                    paginationInfo: response.data.complaints.paginationInfo
                },
                month: item.month,
                year: item.year
            }))
            if (toggleCardsFlag) {
                setState(prevState => {
                    if (prevState.areaExpanded.index === cardIndex && prevState.areaExpanded.expanded) {
                        return {
                            ...prevState,
                            areaExpanded: { index: cardIndex, expanded: false },
                        };
                    }
                    // else if (prevState.areaExpanded.index !== cardIndex && prevState.areaExpanded.expanded) {
                    //     return {
                    //         ...prevState,
                    //         areaExpanded: {
                    //             index: cardIndex,
                    //             expanded: true,
                    //         }
                    //     };
                    // }
                    else {
                        return {
                            ...prevState,
                            areaExpanded: {
                                index: cardIndex,
                                expanded: true,
                            }
                        };
                    }
                });
            }
        }
        else if (response.data.statusCode === 404) {
            CustomToast.error("No Record Found");
            setState(pre => ({ ...pre, noRecFound: "No Record Found" }));

        }
        // console.log("ComplaintsFeedback.onDetailsListSuccess ----", response);
    };
    const onDetailsListError = error => {
        console.log("ComplaintsFeedback.onDetailsListError ----", error);
        CustomToast.error("Something went wrong");
        setState({ ...state, error: "Something went wrong" });

    };
    const setLoaderIntoListMiddleware = (item, loading, cardLoader) => {
        let addLoaderPropToList = state.complaints.map(row => {
            if (row.month === item.month) {
                row = {
                    ...row,
                    loading,
                    cardLoader
                }
            };
            return row;
        });
        // console.log("addLoaderPropToList :", addLoaderPropToList);
        setState(pre => ({ ...pre, complaints: addLoaderPropToList }))
    }
    const paginationHandler = (pageNumber, itemsPerPage, isAscending, isSolved) => {
        // debugger;
        setLoaderIntoListMiddleware({ month: state.month }, false, true);
        postRequest('/api/Menu/Complaint/List',
            {
                "pageNumber": pageNumber,
                "itemsPerPage": itemsPerPage,
                "isAscending": isAscending,
                "isSolved": isSolved,
                "month": state.month,
                "year": state.year
            },
            {},
            dispatch,
            res => {
                // console.log()
                // debugger;
                setLoaderIntoListMiddleware({ month: state.month }, false, false);
                setState(prevState => ({ ...prevState, pageNumber, itemsPerPage, isAscending }));
                onDetailsListSuccess(res, { month: state.month, year: state.year }, null, false);
            },
            err => {
                setLoaderIntoListMiddleware({ month: state.month }, false, false);
                onDetailsListError(err)
            },
            '',
            false
        );
    };
    const getListFromApi = (item, cardIndex) => {
        setLoaderIntoListMiddleware(item, true, false);
        postRequest('/api/Menu/Complaint/List',
            {
                "pageNumber": 1,
                "itemsPerPage": state.itemsPerPage,
                "isAscending": true,
                "month": item.month,
                "year": item.year,
                "isSolved": item?.isSolved
            },
            {},
            dispatch,
            res => {
                setLoaderIntoListMiddleware(item, false, false);
                onDetailsListSuccess(res, item, cardIndex, true)
            },
            err => {
                setLoaderIntoListMiddleware(item, false, false);
                onDetailsListError(err)
            },
            '',
            false);
    };
    const getListHandler = (item, cardIndex, fromActiveTab) => {
        setState(pre => ({ ...pre, complaintsDetailsList: initState.complaintsDetailsList, error: initState.error, noRecFound: initState.error }));
        if (fromActiveTab) return getListFromApi(item, cardIndex);
        else {
            if (!state.areaExpanded.expanded) {
                minusHeightRef.current = 0;
                getListFromApi(item, cardIndex);
                for (let index = 0; index < state.viewsHeights.length; index++) {
                    minusHeightRef.current += state.viewsHeights[index];
                }
            }
            else if (state.areaExpanded.expanded && cardIndex !== state.areaExpanded.index) {
                minusHeightRef.current = 0;
                getListFromApi(item, cardIndex);
                for (let index = 0; index < state.viewsHeights.length; index++) {
                    minusHeightRef.current += state.viewsHeights[index];
                }

            }
            else setState(prevState => {
                if (prevState.areaExpanded.index === cardIndex) {
                    return { ...prevState, areaExpanded: { index: cardIndex, expanded: false }, complaints: prevState.complaints, complaintsDetailsList: initState.complaintsDetailsList, year: initState.year, month: initState.month, pageNumber: initState.pageNumber };
                } else {
                    return { ...prevState, areaExpanded: { index: cardIndex, expanded: true }, complaints: prevState.complaints, complaintsDetailsList: initState.complaintsDetailsList, year: initState.year, month: initState.month, pageNumber: initState.pageNumber };
                }
            })
        }
    };
    const setActiveTab = tabIdx => {
        if (tabIdx === 1) {
            setState(pre => ({ ...pre, activeTab: tabIdx, complaintsDetailsList: initState.complaintsDetailsList, complaints: initState.complaints, error: initState.error, noRecFound: initState.noRecFound }));
            getRequest('/api/Menu/Complaint/ListByDate', {}, dispatch, onSuccessHandler, onErrorHandler, '', true, false);
        } else {
            getListHandler({
                "pageNumber": 1,
                "itemsPerPage": state.itemsPerPage,
                "isAscending": true,
                "isSolved": false,
                "month": 0,
                "year": 0
            }, null, true);
            setState(pre => ({ ...pre, activeTab: tabIdx, complaints: [] }));
        }
    }
    useFocusEffect(useCallback(() => {
        getListHandler({
            "pageNumber": 1,
            "itemsPerPage": state.itemsPerPage,
            "isAscending": true,
            "isSolved": false,
            "month": 0,
            "year": 0
        }, null, true);
        return () => {
            // console.log('Complaint Feedback state cleared----')
            setState(initState);
        }
    }, []), []);
    const renderDetails = (l, index, showBottomLine) => (
        <View key={index} style={{ top: index > 0 ? 10 : 0, paddingHorizontal: 12 }}>
            <View style={walletHistoryStyles.dateDayView(activeTheme)}>
                <Text style={walletHistoryStyles.dateDay(activeTheme)}>{l.complaintDate}</Text>
            </View>
            <TouchableOpacity activeOpacity={1} onPress={() => navigation.navigate('complaints_feedback_container', {
                screen: 'complaint_details', complaintID: l.complaintID,
                dataParams: {},
                backScreenObj: {
                    container: "complaints_feedback_container",
                    screen: "complaints_feedback"
                }
            })}>
                <View style={[walletHistoryStyles.descAmountView(activeTheme), { paddingVertical: 5 }]}>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Text style={walletHistoryStyles.descText(activeTheme)}>{l.joviTypeStr}</Text>
                        <Text style={[walletHistoryStyles.noteText(activeTheme)]}>{l.complaintTime}</Text>
                        <Text style={{ paddingVertical: 3 }}>{'Complaint No# ' + l.complaintID}</Text>
                    </View>
                    <View>
                        <Text style={walletHistoryStyles.descText(activeTheme, l.statusName)}>
                            {l.statusName}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
            {
                showBottomLine ? <View style={{ borderBottomColor: activeTheme.lightGrey, borderBottomWidth: 1 }} /> : null
            }
        </View>
    )
    let descriptionContent = () => {
        if (!state.complaintsDetailsList.data.length) return <View />
        return <ScrollView
            nestedScrollEnabled
            horizontal={false}
            ref={nestedScrollRef}
            onScroll={e => {
                let paddingToBottom = 1
                paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                if (e.nativeEvent.contentOffset.y > e.nativeEvent.contentSize.height - paddingToBottom) {
                    if (state.complaintsDetailsList.paginationInfo.actualPage < state.complaintsDetailsList.paginationInfo.totalPages) paginationHandler(state.pageNumber + 1, state.itemsPerPage, true, false);
                }
            }}
        >
            {
                state.complaintsDetailsList.data.map((l, index) => renderDetails(l, index, true))
            }
        </ScrollView>
    };
    console.log('state :', state);
    // console.log('viewsHeights :', state.viewsHeights);
    // console.log('minusHeightRef :', minusHeightRef.current);
    return (
        <Container style={complaintsFeedbackStyles.container}>
            <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={'toggle'}
                    rightIconHandler={() => Alert.alert('Right icon clicked')}
                    navigation={drawerProps.navigation}
                    leftIcon={svgIcons.menuIcon(activeTheme)}
                    bodyContent={'Complaints'}
                    rightIcon={null}
                    activeTheme={activeTheme}
                />
                <View style={complaintsFeedbackStyles.content}>
                    <CustomTabs
                        tabsArr={['Active', 'Solved']}
                        activeTheme={activeTheme}
                        activeTab={state.activeTab}
                        tabHandler={setActiveTab}
                        tabsContainerStyles={{ top: plateformSpecific(0, -10) }}
                    />

                    <ScrollView style={complaintFeedbackStyles.scrollView} nestedScrollEnabled>
                        <View style={{ marginHorizontal: 15 }}>
                            {
                                (state.complaintsDetailsList.data.length && state.activeTab === 0) ?
                                    state.complaintsDetailsList.data.map((rec, i) => (
                                        <ExpandableList
                                            key={i}
                                            id={i}
                                            listIndex={i}
                                            title={null}
                                            item={rec}
                                            callback={() => { }}
                                            descriptionContent={<ScrollView
                                                onScroll={e => {
                                                    let paddingToBottom = 1
                                                    paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                                                    if (e.nativeEvent.contentOffset.y > e.nativeEvent.contentSize.height - paddingToBottom) {
                                                        if (state.complaintsDetailsList.paginationInfo.actualPage < state.complaintsDetailsList.paginationInfo.totalPages) paginationHandler(state.pageNumber + 1, state.itemsPerPage, true, true);
                                                    }
                                                }}
                                            >
                                                {renderDetails(rec, i, false)}
                                            </ScrollView>}
                                            display={"flex"}
                                            parentState={state}
                                            maxHeightProp={Dimensions.get("screen").height - minusHeightRef.current}
                                        />
                                    ))
                                    :
                                    (state.complaints.length && state.activeTab === 1) ?
                                        state.complaints.map((rec, i) => {
                                            return (
                                                <View key={i} style={{ paddingBottom: i === (state.complaints.length - 1) ? 50 : undefined }} onLayout={e => {
                                                    if (i > 0 && !state.viewsHeights.length) {
                                                        let cardHeightsArr = [];
                                                        for (let v = 0; v < 3; v++) {
                                                            cardHeightsArr.push(Math.ceil(e.nativeEvent.layout.height))
                                                        }
                                                        setState(pre => ({ ...pre, viewsHeights: cardHeightsArr }));
                                                    };
                                                }}>
                                                    <ExpandableList
                                                        key={i}
                                                        id={i}
                                                        listIndex={i}
                                                        title={rec.monthName + '-' + rec.year}
                                                        item={rec}
                                                        callback={(item, cardIndex) => getListHandler({ ...item, isSolved: true }, cardIndex)}
                                                        descriptionContent={descriptionContent()}
                                                        display={state.areaExpanded.index === i && state.areaExpanded.expanded ? "flex" : "none"}
                                                        parentState={state}
                                                        maxHeightProp={Dimensions.get("screen").height - minusHeightRef.current}
                                                    />
                                                </View>
                                            )
                                        })
                                        :
                                        (state.noRecFound || state.error) ? null
                                            :
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                <SmallLoader isActivityIndicator={true} size="large" color={activeTheme.default} />
                                            </View>
                            }
                        </View>
                    </ScrollView>

                </View>
            </ImageBackground>
        </Container >

    )
};

export default ComplaintsFeedback;
