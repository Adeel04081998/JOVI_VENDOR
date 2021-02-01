import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView, ImageBackground, Keyboard, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import commonSvgIcons from '../../../assets/svgIcons/common/common';
import SharedFooter from '../../../components/footer/SharedFooter';
import SharedHeader from '../../../components/header/SharedHeader';
import { DEVICE_SCREEN_WIDTH } from '../../../config/config';
import { getRequest, postRequest } from '../../../services/api';
import commonStyles from '../../../styles/styles';
import { renderPicture, sharedGetUserCartHandler, sharedOpenModal } from '../../../utils/sharedActions';
import SmallLoader from '../../../components/loader/SmallLoader';
import ProductsList from '../inventory/ProductsList';
import RangeSlider from 'rn-range-slider';
import CustomRatings from '../../../components/ratings';
import { closeModalAction } from '../../../redux/actions/modal';
import AsyncStorage from '@react-native-community/async-storage';
import CustomToast from '../../../components/toast/CustomToast';
import { userAction } from '../../../redux/actions/user';
import { useFocusEffect } from '@react-navigation/native';
import Spinner from 'react-native-spinkit';

export default props => {
    const PRODUCT_ITEMS_PER_PAGE = 20,
        SUPER_MARKET_ITEM_PER_PAGE = 20,
        BRANDS_ITEM_PER_PAGE = 20;
    const initState = {
        "superMarketPaginationViewModel": {},
        "isRequestInProgress": false,
        "hideCategoriesAndSuperMarkets": false,
        "searchQuery": "",
        "lastRequest": "",
        "supermarketImagesIndexes": [],
    };
    const [state, setState] = useState(initState);
    const [horizontalScrollState, setHorizontalScrollState] = useState({
        lastOffset: 0
    });
    const _finalDestRef = useRef(null);
    const _searchBtnPressedRef = useRef(null);
    const _pressedCategory = useRef(null);
    // console.log("[SuperMarket Home].props", props);
    // console.log("[SuperMarket Home].state", state);
    // console.log("[SuperMarket Home].horizontalScrollState", horizontalScrollState);
    // console.log("[SuperMarket Home].state.lastRequest", state.lastRequest);
    // console.log("[SuperMarket Home]._searchBtnPressedRef", _searchBtnPressedRef?.current);
    const Popup = ({ popupType, cb }) => {
        const [popUpState, setPopUpState] = useState({
            "rating": 0,
            "priceRange": 0,
            "sortingOption": [{ title: 'Price (High to low)', value: 1 }, { title: 'Price (Low to high)', value: 2 }, { title: 'Best selling', value: 3 }],
            "selectedSort": {}
        });
        console.log("[Popup].State :", popUpState);
        return <View style={{ flex: 1, width: DEVICE_SCREEN_WIDTH, }}>
            <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 10, paddingHorizontal: 20 }} onPress={() => props.mainDrawerComponentProps.dispatch(closeModalAction())}>
                <SvgXml xml={`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <g id="close" transform="translate(0.034 0.033)">
    <g id="Group_1191" data-name="Group 1191" transform="translate(-0.034 -0.033)">
      <path id="Path_1705" data-name="Path 1705" d="M22.219,19.971,39.55,2.677a1.56,1.56,0,0,0-2.206-2.2L20.013,17.754,2.683.474a1.561,1.561,0,1,0-2.209,2.2L17.791,19.971.474,37.265a1.561,1.561,0,1,0,2.209,2.2L20.013,22.175,37.344,39.469a1.561,1.561,0,0,0,2.207-2.2Z" transform="translate(0.034 0.033)" fill="#7359be"/>
    </g>
  </g>
</svg>
`} height={15} width={15} />
            </TouchableOpacity>
            <View style={{ flex: 1, paddingHorizontal: 15 }}>
                {popupType === 1 ? renderFilterPopupUI(popUpState, setPopUpState) : renderSortPopupUI(popUpState, setPopUpState)}
            </View>
            <TouchableOpacity style={{ paddingVertical: 20, justifyContentL: 'center', alignItems: 'center', backgroundColor: props.activeTheme.default }} onPress={() => cb({ ...popUpState, popupType })}>
                <Text style={{ ...commonStyles.fontStyles(15, "#fff", 1) }}>Apply</Text>
            </TouchableOpacity>
        </View>
    };
    const renderFilterPopupUI = (popUpState, setPopUpState) => {
        return <View>
            <Text style={{ ...commonStyles.fontStyles(16, undefined, 4) }}>Filter By</Text>
            <View style={{ paddingVertical: 5 }}>
                <Text style={{ ...commonStyles.fontStyles(15, undefined, 1) }}>Price range</Text>
                <RangeSlider
                    style={{ width: "100%", height: 25, elevation: 1 }}
                    gravity={"center"}
                    rangeEnabled={false}
                    thumbBorderColor={"#fff"}
                    thumbBorderWidth={0}
                    thumbColor={"#7359be"}
                    min={1}
                    max={10000}
                    step={50}
                    selectionColor="#7359be"
                    blankColor="#000"
                    thumbRadius={10}
                    lineWidth={7}
                    labelStyle="none"
                    valueType={"number"}
                    initialLowValue={0}
                    onValueChanged={(value) => setPopUpState(pre => ({ ...pre, priceRange: value }))}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ ...commonStyles.fontStyles(15, undefined, 1) }}>{popUpState.priceRange}</Text>
                    <Text style={{ ...commonStyles.fontStyles(15, undefined, 1) }}>PKR 10,000</Text>
                </View>
                <View style={{ paddingVertical: 10, paddingHorizontal: 5 }}>
                    <Text style={{ ...commonStyles.fontStyles(15, undefined, 1) }}>Rating</Text>
                    <CustomRatings
                        margin={3}
                        initialCount={1}
                        disabled={false}
                        starHeight={30}
                        starWidth={30}
                        styles={{ alignSelf: 'flex-start', }}
                        onPress={count => setPopUpState(pre => ({ ...pre, rating: count }))}
                    />
                </View>
            </View>
        </View>
    };
    const renderSortPopupUI = (popUpState, setPopUpState) => {
        const onPress = pressedItem => {
            let updateRecord = popUpState.sortingOption.map((x, k) => {
                if (x.value === pressedItem.value) x.selected = x.selected ? false : true;
                else x.selected = false;
                return x;
            })
            setPopUpState(pre => ({ ...pre, sortingOption: updateRecord, selectedSort: pressedItem }));
        }
        return <View>
            <Text style={{ ...commonStyles.fontStyles(16, undefined, 4) }}>Sort By</Text>
            <ScrollView style={{ marginVertical: 10 }}>
                {popUpState.sortingOption.map((sortItem, i) => (
                    <TouchableOpacity key={i} style={{ paddingVertical: 3 }} onPress={() => onPress(sortItem)} >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ height: 15, width: 15, borderRadius: 7.5, borderColor: props.activeTheme.default, borderWidth: 2, backgroundColor: sortItem?.selected ? props.activeTheme.default : undefined }} />
                            <Text style={{ ...commonStyles.fontStyles(16, undefined, 1), paddingHorizontal: 10 }}>{sortItem.title}</Text>
                        </View>
                        <View style={{ borderBottomColor: props.activeTheme.lightGrey, borderBottomWidth: 1, width: '100%', paddingVertical: 5 }} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View >
    };
    const openSortOrFilterPopup = popupType => {
        // popupType 1 for filter and 2 for sort
        props.mainDrawerComponentProps.dispatch(sharedOpenModal({
            dispatch: props.mainDrawerComponentProps.dispatch, visible: true, transparent: true,
            modalHeight: 0, modelViewPadding: 0,
            ModalContent: <Popup popupType={popupType} cb={getSortOrFilterDataHandler} />, okHandler: () => { }, onRequestCloseHandler: null, androidKeyboardExtraOffset: 0
        }))
    };
    const getSortOrFilterDataHandler = data => {
        // console.log("getSortOrFilterDataHandler :", data);
        props.mainDrawerComponentProps.dispatch(closeModalAction());
        if (data.popupType === 1) {
            // Filter logic
            requestMiddleWareFunc({ "price": data.priceRange, "rating": data.rating, "productItemsPerPage": PRODUCT_ITEMS_PER_PAGE, 'hideCategoriesAndSuperMarkets': true, "showLoader": false })
        } else {
            // Sort logic
            requestMiddleWareFunc({ ...state.lastRequest, "hideCategoriesAndSuperMarkets": true, "sortingType": data.selectedSort.value, "showLoader": false })
        }

    };
    const setSuperMarketPaginationViewModel = (paginationArgs, previousState, serverDataObject) => {
        // pagination request types -> 1 for super markets, 2 for products and 3 for brands
        if (!Object.keys(paginationArgs).length) return serverDataObject;
        else if (paginationArgs.paginationRequestType === 1) {
            // console.log('Super market concat ran---');
            return {
                ...previousState.superMarketPaginationViewModel,
                paginationInfoList: serverDataObject.paginationInfoList,
                superMarketListVM: previousState.superMarketPaginationViewModel.superMarketListVM.concat(serverDataObject.superMarketListVM)
            }
        }
        else if (paginationArgs.paginationRequestType === 2) {
            // console.log('Products concat ran---');
            return {
                ...previousState.superMarketPaginationViewModel,
                paginationInfoList: serverDataObject.paginationInfoList,
                productVMList: previousState.superMarketPaginationViewModel.productVMList.concat(serverDataObject.productVMList)
            }
        }
    };
    const _onSuccess = (request, response, paginationArgs) => {
        // debugger;
        // console.log("[getDataFromServer].request :", request);
        // console.log("[getDataFromServer].onSuccess :", response);
        // JSON.parse(response?.config?.data)
        setTimeout(() => {
            _searchBtnPressedRef.current = false;
        }, 3000);
        if (response.data.statusCode === 200) setState(pre => ({
            ...pre,
            lastRequest: request || {},
            searchQuery: initState.searchQuery,
            superMarketPaginationViewModel: setSuperMarketPaginationViewModel(paginationArgs, pre, response.data.superMarketPaginationViewModel),
            isRequestInProgress: false,
            hideCategoriesAndSuperMarkets: request?.hideCategoriesAndSuperMarkets ?? false
        }));
        else if (response.data.statusCode === 404) setState(pre => ({
            ...initState,
            searchQuery: pre.searchQuery,
            superMarketPaginationViewModel: {
                "categoryVMList": [],
                "paginationInfoList": [{ actualPage: 1 }, { actualPage: 1 }],
                "productVMList": [],
                "superMarketListVM": [],
            }
        }));
    };
    const _onError = (request, error) => {
        // debugger;
        // console.log("[getDataFromServer].request :", request);
        // error?.config?.data ?? {}
        console.log("[getDataFromServer].onError :", error);
        setState(pre => ({ ...pre, lastRequest: request || {}, isRequestInProgress: false }));
        setTimeout(() => {
            _searchBtnPressedRef.current = false;
        }, 3000);
    };
    const _getDataFromServer = (args, paginationArgs) => {
        // console.log("finalDestination :", _finalDestRef);
        setState(pre => ({ ...pre, isRequestInProgress: true }));
        let payload = {
            "searchItem": args?.searchItem ?? "",
            "categoryID": args?.categoryID ?? null,
            "latitude": _finalDestRef?.current?.latitude,
            "rating": args?.rating ?? 0, // for all
            "price": args?.price ?? 0, // for all
            "longitude": _finalDestRef?.current?.longitude,
            "marketPageNumber": args?.marketPageNumber ?? 1,
            "marketItemsPerPage": args?.marketItemsPerPage ?? SUPER_MARKET_ITEM_PER_PAGE,
            "marketIsAscending": args?.marketIsAscending ?? true,
            "productPageNumber": args?.productPageNumber ?? 1,
            "productItemsPerPage": args?.productItemsPerPage ?? PRODUCT_ITEMS_PER_PAGE,
            "productIsAscending": args?.productIsAscending ?? true,
            "brandPageNumber": args?.brandPageNumber ?? 1,
            "brandItemsPerPage": args?.brandItemsPerPage ?? BRANDS_ITEM_PER_PAGE,
            "brandIsAscending": true,
            "pitstopType": props?.mainDrawerComponentProps?.footerNavReducer?.pressedTab?.pitstopOrCheckOutItemType ?? 1,
        }
        // debugger;
        postRequest(
            `/api/SuperMarket/Supermarket/ListOrSearch`,
            {
                ...payload,
                ...args,
            },
            {},
            props.mainDrawerComponentProps.dispatch,
            res => _onSuccess({ ...args, ...payload }, res, paginationArgs),
            err => _onError({ ...args, ...payload }, err, paginationArgs),
            "",
            args?.showLoader
        )
    };
    const requestMiddleWareFunc = payload => {
        Keyboard.dismiss();
        setState(pre => ({
            ...pre,
            superMarketPaginationViewModel: {
                ...pre.superMarketPaginationViewModel,
                productVMList: []
                // superMarketData: {
                //     ...pre.superMarketPaginationViewModel.superMarketData,
                //     productData: []
                // }
            }
        }));
        _getDataFromServer({ "searchItem": state.searchQuery, "hideCategoriesAndSuperMarkets": state.hideCategoriesAndSuperMarkets, showLoader: false, ...payload }, {});
    };
    const _onSearchBtnPressed = () => {
        if (!state.searchQuery.length) return CustomToast.error("Search field is empty");
        _searchBtnPressedRef.current = true;
        requestMiddleWareFunc({});
    };
    const _onCategoryPress = pressedCat => {
        _pressedCategory.current = pressedCat.categoryID;
        requestMiddleWareFunc({ "categoryID": pressedCat.categoryID });

    }
    // console.log('outer', _searchBtnPressedRef?.current);
    useEffect(
        () => {
            const timeout = setTimeout(() => {
                console.log('state.searchQuery.length', state.searchQuery.length);
                console.log('inner', _searchBtnPressedRef?.current);
                if (state.searchQuery.length > 0 && !_searchBtnPressedRef?.current) {
                    // console.log('Request Should be true and state is', state);
                    requestMiddleWareFunc({});
                } else {
                    console.log('Else called in effect :')
                }
            }, 2000);
            return () => clearTimeout(timeout);
        },
        [state.searchQuery]
    );
    useFocusEffect(useCallback(() => {
        // console.log("useFocusEffect---");
        const _getDataAsync = async () => {
            sharedGetUserCartHandler(getRequest, false, props?.mainDrawerComponentProps?.footerNavReducer?.pressedTab?.pitstopOrCheckOutItemType);
            // sharedGetEnumsHandler(getRequest);
            const finalDestination = JSON.parse(await AsyncStorage.getItem("customerOrder_finalDestination"));
            _finalDestRef.current = {
                ...finalDestination[0]
            };
            props.mainDrawerComponentProps.dispatch(userAction({ ...props.mainDrawerComponentProps.user, finalDestination: finalDestination[0] }));
            _getDataFromServer({ showLoader: false }, {});
        };
        _getDataAsync();
    }, [props?.mainDrawerComponentProps?.footerNavReducer?.pressedTab?.pitstopOrCheckOutItemType]), [props?.mainDrawerComponentProps?.footerNavReducer?.pressedTab?.pitstopOrCheckOutItemType])
    return (
        <View style={{ flex: 1 }}>
            <SharedHeader {...props} leftIconHandler={state.hideCategoriesAndSuperMarkets ? () => setState(pre => ({ ...pre, hideCategoriesAndSuperMarkets: false })) : null} userObj={props.mainDrawerComponentProps.user} drawerProps={props.drawerProps} activeTheme={props.activeTheme} showLeftBackBtn={state.hideCategoriesAndSuperMarkets ? true : false} activeBottomTab={0} />
            <View style={{ flex: 1, paddingHorizontal: 17 }}>
                <Text style={{ ...commonStyles.fontStyles(16, undefined, 4) }}>What would you like {'\n'} to order</Text>
                {/* Search bar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-evenly", borderRadius: 5, borderWidth: 0.2, borderColor: props.activeTheme.grey, marginVertical: 5 }}>
                    <TouchableOpacity onPress={_onSearchBtnPressed}>
                        <SvgXml style={{ width: '12%' }} xml={commonSvgIcons.super_search(props.activeTheme.default)} height={20} width={20} />
                    </TouchableOpacity>
                    <TextInput style={{ width: '75%' }} value={state.searchQuery} placeholder="Find a grocery, food, medicine" onChangeText={val => setState(pre => ({ ...pre, searchQuery: val }))} />
                    <TouchableOpacity onPress={() => openSortOrFilterPopup(1)}>
                        <SvgXml style={{ width: '12%' }} xml={commonSvgIcons.super_filter(props.activeTheme.default)} height={20} width={20} />
                    </TouchableOpacity>
                </View>
                {/* Categories */}
                {Object.keys(state.superMarketPaginationViewModel).length ?
                    <View style={{ flex: 1 }}>
                        {
                            state.hideCategoriesAndSuperMarkets ? <View style={{ paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ ...commonStyles.fontStyles(14, undefined, 2) }}>{`${state.superMarketPaginationViewModel?.productVMList?.length ?? 0} results`}</Text>
                                <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => openSortOrFilterPopup(2)}>
                                    <Text style={{ paddingHorizontal: 10 }}>Sort</Text>
                                    <SvgXml style={{ width: '12%' }} xml={commonSvgIcons.super_filter(props.activeTheme.default)} height={20} width={20} />
                                </TouchableOpacity>
                            </View>
                                :
                                <Fragment>
                                    <View style={{ marginVertical: 5 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ ...commonStyles.fontStyles(16, undefined, 4) }}>Categories</Text>
                                            <Text style={{ ...commonStyles.fontStyles(16, undefined, 2) }}>{`${state.superMarketPaginationViewModel?.categoryVMList?.length ?? 0} results `}</Text>
                                        </View>
                                        <ScrollView horizontal={true} style={{ paddingVertical: 10 }} contentContainerStyle={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', }} >


                                            {/* <View style={{ flex: 1, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'green' }}> */}
                                            {
                                                state.superMarketPaginationViewModel?.categoryVMList
                                                    .map((cat, j) => cat.categoryImage ? (
                                                        <View key={j} style={{ minWidth: 65, alignItems: 'center' }}>
                                                            <TouchableOpacity
                                                                style={{
                                                                    height: 50,
                                                                    width: 50,
                                                                    borderRadius: 30,
                                                                    backgroundColor: cat.categoryID === _pressedCategory?.current ? props.activeTheme.default : props.activeTheme.grey,
                                                                    // backgroundColor: cat.categoryID === state.lastRequest?.categoryID ? props.activeTheme.default : props.activeTheme.grey,
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                }}
                                                                onPress={() => _onCategoryPress(cat)}
                                                            >
                                                                <SvgXml xml={cat.categoryImage} height={25} width={25} />

                                                            </TouchableOpacity>
                                                            <Text style={{ ...commonStyles.fontStyles(12, undefined, 1, 'bold'), paddingTop: 5 }}>{cat.name}</Text>
                                                        </View>
                                                    )
                                                        : null
                                                    )
                                            }
                                            {/* </View> */}
                                        </ScrollView>
                                    </View>

                                    {/* Super Markets Horizontal View */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), marginVertical: 5 }}>Super markets</Text>
                                        <Text style={{ ...commonStyles.fontStyles(16, undefined, 2) }}>{`${state.superMarketPaginationViewModel?.superMarketListVM?.length ?? 0} results `}</Text>
                                    </View>
                                    <ScrollView style={{ maxHeight: 105, minHeight: 105 }} horizontal={true}
                                        onScrollEndDrag={e => {
                                            e.persist();
                                            // console.log("e.nativeEvent.contentOffset.x", e.nativeEvent.contentOffset.x);
                                            setHorizontalScrollState(pre => ({ ...pre, lastOffset: e.nativeEvent.contentOffset.x }));
                                            if (e.nativeEvent.contentOffset.x > horizontalScrollState.lastOffset) {
                                                if (state.superMarketPaginationViewModel.paginationInfoList[0].actualPage < state.superMarketPaginationViewModel.paginationInfoList[0].totalPages) {
                                                    // console.log('Super market Should be pagination request')
                                                    _getDataFromServer({ showLoader: true, marketPageNumber: state.superMarketPaginationViewModel.paginationInfoList[0].actualPage + 1 }, { paginationRequestType: 1 })
                                                }
                                                else {
                                                    // console.log('Super market pagination request should be disable')
                                                }
                                            }
                                            else {
                                                // console.log('Super market pagination scroll direction is moving left')
                                            }
                                        }}
                                    >
                                        {(state.superMarketPaginationViewModel?.superMarketListVM || []).map((superMarket, k) => (
                                            <TouchableOpacity key={k}>
                                                <View style={{ height: 90, width: DEVICE_SCREEN_WIDTH * 0.55, borderRadius: 10, marginHorizontal: 3, overflow: 'hidden' }}>
                                                    <ImageBackground
                                                        source={{ uri: renderPicture(superMarket.superMarketPics[0], props.mainDrawerComponentProps?.user?.tokenObj?.token?.authToken) }}
                                                        resizeMode="stretch"
                                                        style={{ flex: 1 }}
                                                        onLoadEnd={() => state.supermarketImagesIndexes.indexOf(k) === -1 && setState((pre) => ({ ...pre, supermarketImagesIndexes: [...pre.supermarketImagesIndexes, k] }))}
                                                    >
                                                        {
                                                            state.supermarketImagesIndexes.indexOf(k) === -1 ?
                                                                <View style={{ backgroundColor: '#fff', height: 90, justifyContent: 'center', alignItems: 'center' }}>
                                                                    <Spinner isVisible={true} size={40} type="Circle" color={"#7359be"} />
                                                                </View>
                                                                : null
                                                        }
                                                    </ImageBackground>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </Fragment>
                        }

                        {
                            (!state.superMarketPaginationViewModel?.productVMList?.length && state.isRequestInProgress) ?
                                <SmallLoader isActivityIndicator={true} size={"large"} />
                                :
                                // <View style={{ maxHeight: 150 }}>

                                <ScrollView contentContainerStyle={{ paddingRight: 8 }}
                                    onScroll={e => {
                                        if (state.superMarketPaginationViewModel.paginationInfoList) {
                                            // console.log('paginationInfoList exist---');
                                            let paddingToBottom = 1
                                            paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                                            if (e.nativeEvent.contentOffset.y > e.nativeEvent.contentSize.height - paddingToBottom) {
                                                if (state.superMarketPaginationViewModel.paginationInfoList[1].actualPage < state.superMarketPaginationViewModel.paginationInfoList[1].totalPages) {
                                                    console.log('Products should be load---');
                                                    _getDataFromServer({ showLoader: true, hideCategoriesAndSuperMarkets: state.hideCategoriesAndSuperMarkets, productPageNumber: state.superMarketPaginationViewModel.paginationInfoList[1].actualPage + 1 }, { paginationRequestType: 2 })
                                                } else {
                                                    console.log('Products vertical Scroll should be disabled---');
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ ...commonStyles.fontStyles(15, undefined, 4) }}>{`Products`}</Text>
                                        <Text style={{ ...commonStyles.fontStyles(15, undefined, 2) }}>{`${state.superMarketPaginationViewModel?.productVMList?.length ?? 0} results`}</Text>
                                    </View>
                                    {state.superMarketPaginationViewModel?.productVMList?.length ?
                                        <ProductsList data={state.superMarketPaginationViewModel?.productVMList ?? []} user={props.mainDrawerComponentProps.user} navigation={props.mainDrawerComponentProps.navigation} activeTheme={props.activeTheme} />
                                        : null
                                    }

                                </ScrollView>
                            // </View>
                        }
                    </View>
                    :
                    <SmallLoader isActivityIndicator={true} size={"large"} styles={{ flex: 1, alignSelf: 'center' }} />
                }
            </View>
            {
                (Platform.OS === "android" && props?.mainDrawerComponentProps?.stackState?.keypaidOpen) ? null : <SharedFooter {...props} activeTab={props?.mainDrawerComponentProps?.footerNavReducer?.pressedTab?.index ?? 0} />
            }

        </View>
    )
};

