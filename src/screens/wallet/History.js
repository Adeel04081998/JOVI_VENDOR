import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Dimensions } from 'react-native';
import walletHistoryStyles from './walletHistoryStyles';
import ExpandableList from '../../components/lists/ExpandableList';
import { ScrollView } from 'react-native-gesture-handler';
import { getRequest, postRequest } from '../../services/api';
import { recordsNotExistUI } from '../../utils/sharedActions';
import CustomToast from '../../components/toast/CustomToast';

export default function History(props) {
    console.log("Wallet.History.Props :", props);
    let initState = {
        "noRecFound": "",
        "transactionDate": {
            "walletTransactionDateViewModels": [],
        },
        "transactions": {
            "paginationInfo": {
                "totalItems": 0,
                "itemsPerPage": 0,
                "actualPage": 0,
                "totalPages": 0
            },
            "data": []
        },
        "pageNumber": 1,
        "itemsPerPage": 20,
        "isAscending": true,
        "month": 0,
        "year": 0,
        areaExpanded: {
            "index": 0,
            "expanded": false,
        },
    }
    const [state, setState] = useState(initState)
    const onSuccess = (response, item, cardIndex, toggleCardsFlag) => {
        // debugger;
        // nestedScrollRef.current.scrollTo({animated: true}, 0);
        if (response.data.statusCode === 200) {
            setState(prevState => ({
                ...prevState,
                transactions: {
                    data: prevState.transactions.data.concat(response.data.transactions.data),
                    paginationInfo: response.data.transactions.paginationInfo
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
                    else {
                        // debugger;
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
        else if (response.data.statusCode === 404) CustomToast.error(response.data.message);
        // console.log("ComplaintsFeedback.onDetailsListSuccess ----", response);
    };
    const getListFromApi = (item, cardIndex) => {
        postRequest('/api/Menu/Wallet/List',
            {
                "pageNumber": item.pageNumber ? item.pageNumber : 1,
                "itemsPerPage": item.itemsPerPage ? item.itemsPerPage : state.itemsPerPage,
                "isAscending": item.isAscending ? item.isAscending : true,
                "month": item.month,
                "year": item.year
            },
            {},
            props.dispatch,
            res => onSuccess(res, item, cardIndex, true),
            err => console.log(err),
            '');
    }
    const getListHandler = (item, cardIndex) => {
        // debugger;
        if (!state.areaExpanded.expanded) {
            // for (let index = 0; index < state.viewsHeights.length; index++) {
            //     minusHeightRef.current += state.viewsHeights[index];
            // }
            getListFromApi(item, cardIndex);

        }
        else if (state.areaExpanded.expanded && cardIndex !== state.areaExpanded.index) {
            setState(pre => ({ ...pre, transactions: initState.transactions }));
            getListFromApi(item, cardIndex);
        }
        else setState(prevState => {
            if (prevState.areaExpanded.index === cardIndex) {
                return { ...prevState, areaExpanded: { index: cardIndex, expanded: false }, transactions: initState.transactions, pageNumber: initState.pageNumber, itemsPerPage: initState.itemsPerPage, isAscending: initState.isAscending };
            } else {
                return { ...prevState, areaExpanded: { index: cardIndex, expanded: true } };
            }
        })
    };
    const paginationHandler = (pageNumber, itemsPerPage, isAscending) => {
        // debugger;
        // getListFromApi({ "pageNumber": pageNumber, "isAscending": isAscending, "itemsPerPage": itemsPerPage, "month": state.month, "year": state.year })
        postRequest('/api/Menu/Wallet/List',
            {
                "pageNumber": pageNumber,
                "itemsPerPage": itemsPerPage,
                "isAscending": isAscending,
                "month": state.month,
                "year": state.year
            },
            {},
            props.dispatch,
            res => {
                // console.log()
                // debugger;
                setState(prevState => ({ ...prevState, pageNumber, itemsPerPage, isAscending }));
                onSuccess(res, { month: state.month, year: state.year }, null, false);
            },
            err => console.log("paginationHandler.Error :", err),
            ''
        );
    };
    let descriptionContent = () => {
        return <ScrollView
            nestedScrollEnabled
            contentContainerStyle={{ paddingHorizontal: 12 }}
            // style={{ flex: 1, backgroundColor:'red' }}
            // ref={nestedScrollRef}
            onScroll={e => {
                let paddingToBottom = 1
                paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                if (e.nativeEvent.contentOffset.y > e.nativeEvent.contentSize.height - paddingToBottom) {
                    console.log('Should be request');
                    if (state.transactions.paginationInfo.actualPage < state.transactions.paginationInfo.totalPages) paginationHandler(state.pageNumber + 1, state.itemsPerPage, true);
                }
            }}
        >
            {
                state.transactions.data.map((l, index) => (
                    <View key={index} style={{ paddingVertical: index > 0 ? 10 : 0 }}>
                        <View style={walletHistoryStyles.dateDayView(props.activeTheme)}>
                            <Text style={walletHistoryStyles.dateDay(props.activeTheme)}>{l.transactionDate}</Text>
                        </View>
                        <View style={walletHistoryStyles.descAmountView(props.activeTheme)}>
                            <View>
                                <Text style={walletHistoryStyles.descText(props.activeTheme)}>
                                    {l.creditDebit} {'\n'}
                                    <Text style={walletHistoryStyles.noteText(props.activeTheme)}>{l.transactionTime}</Text>
                                </Text>
                            </View>
                            <View>
                                <Text style={walletHistoryStyles.descText(props.activeTheme)}>
                                    {l.amount}
                                </Text>
                            </View>
                        </View>
                        <View style={{ borderBottomColor: props.activeTheme.lightGrey, borderBottomWidth: 1, }} />
                    </View>
                ))
            }
        </ScrollView>
    };
    useEffect(useCallback(() => {
        getRequest('/api/Menu/WalletTransactions/ListByDate', {}, props.dispatch, res => {
            if (res.data.statusCode === 404) setState(prevState => ({ ...prevState, noRecFound: res.data.message ? res.data.message : "No Record Found" }));
            else setState(prevState => ({ ...prevState, transactionDate: res.data.transactionDate }))
        }, err => console.log(err), '');
        return () => {
            console.log('Wallet.History state cleared----')
            setState(initState);
        }
    }, []), []);
    console.log(state);
    return (
        <View style={[walletHistoryStyles.listViewContainer(props.activeTheme), { paddingBottom: 20 }]}>
            {
                state.transactionDate.walletTransactionDateViewModels.length ?
                    state.transactionDate.walletTransactionDateViewModels.map((rec, i) => {
                        return <ExpandableList
                            key={i}
                            id={rec.id}
                            listIndex={i}
                            title={rec.monthName + " - " + rec.year}
                            item={rec}
                            callback={getListHandler}
                            // descriptionContent={state.transactions.data.length ? descriptionContent() : recordsNotExistUI('No Record exist')}
                            descriptionContent={state.transactions.data.length ? descriptionContent() : null}
                            display={state.areaExpanded.index === i && state.areaExpanded.expanded ? "flex" : "none"}
                            parentState={state}
                            maxHeightProp={Dimensions.get('window').height * 0.5}
                        />

                    })
                    :
                    <View />
                // recordsNotExistUI(state.noRecFound)
            }
        </View>

    )
}
