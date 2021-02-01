import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ImageBackground, Image, TouchableOpacity, Dimensions, ActivityIndicator, TextInput } from 'react-native';
import { Container, Content, Text, Textarea } from 'native-base';
import CustomHeader from '../../components/header/CustomHeader';
import commonIcons from '../../assets/svgIcons/common/common';
import greyedTick from '../../assets/svgIcons/rider/greyedTick.svg';
import orderStyles from './orderStyles';
import { ScrollView } from 'react-native-gesture-handler';
import ComplaintFeedbackModal from '../../components/modals/ComplaintFeedbackModal';
import { getRequest, postRequest } from '../../services/api';
import CustomToast from '../../components/toast/CustomToast';
import CustomRatings from '../../components/ratings';
import BottomAlignedModal from '../../components/modals/BottomAlignedModal';
import { navigateWithResetScreen, renderPicture, sharedOpenModal } from '../../utils/sharedActions';
import Spinner from 'react-native-spinkit';
import { DEVICE_SCREEN_HEIGHT, DEVICE_WIN_WIDTH, EMPTY_PROFILE_URL, IMAGE_NOT_AVAILABLE_URL, isJoviCustomerApp } from '../../config/config';
import { SvgXml } from 'react-native-svg';
import commonStyles from '../../styles/styles';
import { closeModalAction } from '../../redux/actions/modal';
import DefaultBtn from '../../components/buttons/DefaultBtn';
// import Draggable from 'react-native-draggable';

export const ComplaintSuggestionsModalView = ps => {
    console.log('[ComplaintSuggestionsModalView].props :', ps);
    const [suggestionsState, setSuggestionsState] = useState({
        isLoad: false,
        suggestions: []
    })
    useEffect(useCallback(() => {
        setSuggestionsState(pre => ({ ...pre, isLoad: true }));
        getRequest(`/api/Order/Complaint/GetComplaintReasons`, {}, ps.dispatch, res => {
            console.log("[ComplaintSuggestionsModalView]. useCallback.res :", res);
            if (res.data.statusCode === 200) setSuggestionsState(pre => ({ ...pre, isLoad: false, suggestions: res.data?.complaintReasonsViewModels }))
            else setSuggestionsState(pre => ({ ...pre, isLoad: false }));
        },
            err => {
                if (err) {
                    CustomToast.error("Something went wrong")
                    setSuggestionsState(pre => ({ ...pre, isLoad: false }));
                }
            },
            "",
            false,
            false);
    }), [])
    return <View style={{
        flex: 1, width: DEVICE_WIN_WIDTH, backgroundColor: '#fff', borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    }}>
        <Text style={{ padding: 17, ...commonStyles.fontStyles(16, undefined, 4) }}>Select your reason</Text>
        {
            suggestionsState.isLoad ?
                <ActivityIndicator style={{ flex: 1, alignSelf: 'center' }} size="large" color={ps.activeTheme.default} />
                :
                <ScrollView>
                    <View style={{ padding: 10 }}>
                        {
                            suggestionsState.suggestions.map((row, j) => (
                                <TouchableOpacity key={j}
                                    onPress={() => ps.handlers.openModal({ title: "Complaint", modalType: 2, pressedSuggestion: row })}
                                    style={{ flexDirection: 'row', paddingVertical: 20, borderRadius: 5, marginVertical: 5, backgroundColor: '#fff', ...commonStyles.shadowStyles(null, null, null, null, 2) }}>
                                    <View style={{ maxWidth: '5%', marginHorizontal: 10, height: 15, width: 15, borderRadius: 7.5, borderColor: ps.activeTheme.default, borderWidth: 2 }} />
                                    <Text style={{ ...commonStyles.fontStyles(16, ps.activeTheme.grey, 4), maxWidth: '95%', textAlign: 'left' }}>{row?.description}</Text>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </ScrollView>
        }
    </View>
};

export const AddReviewModalView = (propsFromParent) => {
    console.log("propsFromParent.pressedItem", propsFromParent.pressedItem)
    const reviewRef = useRef(null);
    const addReviewHandler = () => {
        postRequest(`/api/SuperMarket/ItemReview/AddOrUpdate`,
            {
                "pitstopItemID": propsFromParent.pressedItem.itemID,
                "orderID": propsFromParent.pressedItem.orderID,
                ...reviewRef.current
            },
            {},
            propsFromParent.dispatch,
            res => {
                console.log("addReviewHandler res :", res);
                CustomToast.success('Review added');
                propsFromParent.dispatch(closeModalAction());
                propsFromParent.handlers.getOrderDetailsHandler();
            },
            err => {
                if (err) {
                    console.log('addReviewHandler.err :', err);
                    CustomToast.success('Something went wrong');
                }
            },
            '',
            false
        );
    }
    return <View style={{ flex: 1, width: DEVICE_WIN_WIDTH }}>
        <View style={{ paddingVertical: 10 }}>
            <Text style={{ textAlign: 'center', ...commonStyles.fontStyles(15, undefined, 4) }}>How was your experience ?</Text>
            <View style={{ marginTop: 5 }}>
                <CustomRatings
                    margin={3}
                    initialCount={0}
                    disabled={false}
                    starHeight={30}
                    starWidth={30}
                    styles={{}}
                    onPress={count => {
                        reviewRef.current = {
                            ...reviewRef?.current,
                            rating: count
                        }
                    }}
                />
            </View>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ ...commonStyles.fontStyles(15, undefined, 1) }}>Reviews</Text>
            <Textarea autoFocus rowSpan={4} bordered placeholder={`Type review`} style={{ borderRadius: 5 }}
                onChangeText={value => {
                    // if (!reviewRef?.current?.description?.length && !value.trimStart()) return CustomToast.error('Leading or trailing spaces are not allowed');
                    // else if (!reviewRef?.current?.description?.length && (value === "" || value === " ")) return;
                    reviewRef.current = {
                        ...reviewRef.current,
                        description: value.trim()
                    }

                }}
            />
        </View>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <DefaultBtn title="Submit" onPress={addReviewHandler} />
        </View>
    </View>
};


function OrdersHistoryDetails(props) {
    console.log("OrdersHistoryDetails---- :", props);
    const { navigation, activeTheme, dispatch, keypaidOpen } = props;
    let getNavigationState = navigation.dangerouslyGetState();
    let parentScreenState = getNavigationState.routes[getNavigationState.index].params.parentScreenState;
    // console.log(getNavigationState.routes[getNavigationState.index].params.dataParams)
    // console.log("getNavigationState.ParentScreenState :", getNavigationState.routes[getNavigationState.index].params.parentScreenState);
    // let data = getNavigationState.routes[1].params.data;
    const { height } = Dimensions.get('window');
    let initState = {
        // imgView: new Animated.Value(180),
        "imgLoad": true,
        imgView: 180,
        viewState: true,
        "complaintReasonID": 0,
        "offset": 0,
        "order": {
            "orderType": null,
            "jobCategory": null,
            "jobCategoryString": null,
            "orderID": null,
            "orderDate": null,
            "pitStopsList": [],
        },
        modalState: {
            // modalType 1 for complaint suggestion 2 for add complaint 3 for add feedback
            "visible": false,
            "title": "",
            "modalType": 1
        }
    };
    const [state, setState] = useState(initState);
    const toggleAnimation = () => {
        if (state.viewState == true) setState({ ...state, imgView: height * 0.9, viewState: false })
        else setState({ ...state, imgView: 180, viewState: true })
    }
    // console.log('state :', state)
    let textRef = useRef(null);
    let ratingsRef = useRef(null);

    const onChangeHandler = (value, fieldType) => {
        console.log("onChangeHandler Value:", value, "Field :", fieldType)
        if (fieldType === 'text') textRef.current = value;
        else ratingsRef.current = value;
    };
    const getOrderDetailsHandler = () => getRequest(getNavigationState.routes[getNavigationState.index].params.dataParams.jobCategory === 1 ? `/api/Order/Order/OrderDetail/${getNavigationState.routes[getNavigationState.index].params.dataParams.orderID}` : `/api/Order/SMPharmaRstraunt/OrderDetail/${getNavigationState.routes[getNavigationState.index].params.dataParams.orderID}`, {}, dispatch, onSuccessHandler, onErrorHandler);
    // console.log('textRef.current :', textRef.current);
    const addComplaintOrFeedback = (e, enumVal, pictures) => {
        let requestURL = enumVal === "Complaint" ? "/api/Order/Complaint/AddOrUpdate" : "/api/Order/Feedback/Add",
            payload = null,
            headers = {};
        if (enumVal === "Complaint") {
            let formData = new FormData();
            formData.append("complaintID", 0);
            formData.append("description", textRef.current);
            formData.append("rating", 0);
            formData.append("statusID", 0);
            formData.append("orderID", state.order.orderID);
            formData.append("assistance", null);
            formData.append("complaintReasonID", state.complaintReasonID);
            if (pictures.length) {
                for (let index = 0; index < pictures.length; index++) {
                    formData.append("PictureList", pictures[index])
                }
            }
            payload = formData;
            headers = { headers: { 'content-type': 'multipart/form-data' } };
        } else {
            headers = {}
            payload = {
                "orderID": state.order.orderID,
                "description": textRef.current,
                "riderID": state.order.riderID,
                "rating": ratingsRef.current
            }
        };
        postRequest(requestURL,
            payload,
            headers,
            dispatch,
            res => {
                CustomToast.success(res.data.message);
                getOrderDetailsHandler();
                // console.log(res.data.message);
            },
            err => {
                console.log(err)
                if (err) CustomToast.error('Something went wrong');
            },
            '',
            true
        );
        closeModal();
    };

    const openModal = (title, modalType, complaintReasonID) => {
        setState(pre => ({
            ...pre,
            complaintReasonID: complaintReasonID || 0,
            modalState: {
                title,
                visible: true,
                modalType,
            }
        }))
    };
    const closeModal = () => {
        setState(pre => ({
            ...pre,
            modalState: initState.modalState
        }))
    };

    const navigateToComplaintsDetails = complaintID => {
        // debugger;
        navigation.navigate('complaints_feedback_container', {
            screen: 'complaint_details', complaintID, dataParams: getNavigationState.routes[getNavigationState.index].params.dataParams, backScreenObj: {
                container: "orders_stack",
                screen: "order_history_details"
            }
        })
    };
    const onSuccessHandler = res => {
        // debugger;
        setState(prevState => ({ ...prevState, order: res.data.order || res.data.supermarketOrderDetails || null }))
    };
    const onErrorHandler = err => {
        // debugger;
        console.log('OrderHistory details.onErrorHandler--- :', err)
    };
    useEffect(useCallback(() => {
        getOrderDetailsHandler();
        return () => {
            console.log('Order details state cleared----');
            setState(initState);
        }
    }, []), []);
    console.log('OrdersHistoryDetails.State :', state);
    // console.log('height :', height);

    const renderJoviOrderDetails = () => {
        return <>
            {

                (state.order.pitStopsList || []).map((p, i) => (
                    <View key={i} style={{ paddingVertical: isJoviCustomerApp ? 5 : 10 }}>
                        <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <View style={{ flex: 5, flexDirection: 'row', alignItems: 'center' }}>
                                {
                                    isJoviCustomerApp ?
                                        <View style={{ borderRadius: 20, height: 10, width: 10, backgroundColor: activeTheme.default }} />
                                        :
                                        <View style={{ height: 15, width: 15, borderRadius: 7.5, borderColor: activeTheme.grey, borderWidth: 3 }} />
                                }
                                <Text style={{ paddingHorizontal: 5 }}>{`Pitstop 0${i + 1}`}</Text>
                            </View>
                            <View style={{ flex: 1.5 }}>
                                {
                                    isJoviCustomerApp ?
                                        <Text style={[{ ...orderStyles.descriptionText(activeTheme), textAlign: 'right', }]}>R.s {p.jobAmount}</Text>
                                        :
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <SvgXml xml={greyedTick} height={30} width={30} />
                                        </View>

                                }

                            </View>
                        </View>
                        <View style={{
                            top: 7,
                            paddingHorizontal: 20

                        }}>
                            <Text style={orderStyles.descriptionText(activeTheme)}>{p.title}</Text>
                        </View>
                    </View>

                ))
            }

            {
                (parentScreenState.activeTab > 0 && isJoviCustomerApp) ?
                    <View style={{ paddingLeft: 15, paddingVertical: 10, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
                            <Text style={{ fontWeight: "bold" }}>Service Charges</Text>
                            <Text style={[{ ...orderStyles.descriptionText(activeTheme) }, { textAlign: 'right' }]}>R.s {state.order.serviceCharges}</Text>
                        </View>
                        <View style={{ borderBottomColor: '#000', borderBottomWidth: 0.3 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
                            <Text style={{ fontWeight: "bold" }}>Total Amount</Text>
                            <Text style={[{ ...orderStyles.descriptionText(activeTheme) }, { textAlign: 'right' }]}> R.s {state.order.totalAmount}</Text>
                        </View>
                    </View> : null
            }
        </>
    };
    const renderSMPharmacyRestaurantOrderDetails = () => {
        console.log("renderSMPharmacyRestaurantOrderDetails", state.order);
        return <View style={{
            flex: 1, marginVertical: 5, ...commonStyles.shadowStyles(), ...commonStyles.borderedViewStyles(7), elevation: 2,
            backgroundColor: '#fff'
        }}>
            <ScrollView style={{ flex: 1 }}>
                {
                    (state.order.supermarkets || []).map((S, index) => (
                        <View key={index}>
                            <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), padding: 7, paddingLeft: 13 }}>{S.pitstopName}</Text>
                            <View style={{ borderTopColor: activeTheme.lightGrey, borderTopWidth: 0.5 }} />
                            {
                                (S.items || []).map((P, j) => (
                                    <View key={j}>
                                        <View style={{ backgroundColor: '#fff', height: 120, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                                            <View style={{ flex: 3, flexDirection: 'row' }}>
                                                <View style={{ borderRadius: 7, height: 70, width: 70, overflow: 'hidden' }}>
                                                    <ImageBackground resizeMode="cover" source={{ uri: P.itemImage ? renderPicture(P.itemImage, props.user.tokenObj.token.authToken) : IMAGE_NOT_AVAILABLE_URL }} style={[{ flex: 1 }]} />
                                                </View>
                                                <View style={{ justifyContent: 'space-between' }}>
                                                    <Text style={{ ...commonStyles.fontStyles(15, activeTheme.default, 4), paddingLeft: 7 }}>
                                                        {P.name}
                                                    </Text>
                                                    {(P.attributes || []).map((A, k) => (k === 0 && A) ? (
                                                        <Text key={k} style={{ ...commonStyles.fontStyles(15, activeTheme.grey, 4), paddingLeft: 7 }}>
                                                            {A}
                                                        </Text>
                                                    ) : null)}
                                                    <Text style={{ ...commonStyles.fontStyles(16, activeTheme.default, 4), paddingLeft: 7 }}>
                                                        Rs. {P.price}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1, marginTop: 12 }}>
                                                <TouchableOpacity
                                                    disabled={P.ratings > 0 ? true : false}
                                                    onPress={() => sharedOpenModal({
                                                        dispatch: props.dispatch,
                                                        visible: true,
                                                        modalFlex: 0,
                                                        transparent: true,
                                                        modalHeight: 300,
                                                        modelViewPadding: 0,
                                                        ModalContent: <AddReviewModalView {...props} handlers={{ getOrderDetailsHandler }} pressedItem={{ ...P, orderID: state.order.orderID }} />,
                                                        okHandler: null,
                                                        onRequestCloseHandler: null,
                                                        androidKeyboardExtraOffset: 22
                                                    })}>
                                                    <CustomRatings
                                                        margin={1}
                                                        initialCount={P.ratings}
                                                        disabled={true}
                                                        starHeight={15}
                                                        starWidth={15}
                                                        styles={{}}
                                                    />
                                                </TouchableOpacity>
                                                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: props.activeTheme.lightGrey, borderRadius: 20, width: 70, height: 25, top: 10 }}>
                                                    <Text style={{ ...commonStyles.fontStyles(16, activeTheme.default, 4) }}>
                                                        Qty. {P.quantity}
                                                    </Text>
                                                </View>
                                            </View>


                                        </View>
                                        <View style={{ borderBottomColor: activeTheme.lightGrey, borderBottomWidth: 0.5, backgroundColor: '#fff' }} />
                                    </View>
                                ))
                            }

                        </View>
                    ))
                }
            </ScrollView>
            <View style={{ margin: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ ...commonStyles.fontStyles(15, activeTheme.grey, 4), margin: 5, opacity: 0.7 }}>Shipping Charges</Text>
                    <Text style={{ ...commonStyles.fontStyles(16, activeTheme.grey, 4), opacity: 0.7 }}>
                        Rs. {state.order?.serviceCharges}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ ...commonStyles.fontStyles(15, undefined, 4), margin: 5 }}>Total</Text>
                    <Text style={{ ...commonStyles.fontStyles(16, undefined, 4) }}>
                        Rs. {state.order?.totalAmount}
                    </Text>
                </View>
                {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ borderRadius: 20, height: 10, width: 10, backgroundColor: activeTheme.default }} />
                    <Text style={{ paddingHorizontal: 5 }}>{`Unnamed Road, I-8 Markaz I 8 Markaz I-8, Islamabad, Islamabad Capital Territory, Pakistan`}</Text>
                </View> */}
            </View>
        </View>
    };
    return (
        <Container>
            <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={() => navigateWithResetScreen(0, [{ name: "orders_container" }])}
                    rightIconHandler={() => { }}
                    navigation={navigation}
                    leftIcon={commonIcons.backIcon(activeTheme)}
                    bodyContent={isJoviCustomerApp ? 'Order Details' : 'BOOKING DETAILS'}
                    rightIcon={null}
                    activeTheme={activeTheme}
                />
                <Content>
                    {
                        state.order !== null ?
                            <View style={orderStyles.mainContainer(activeTheme)}>
                                <View style={{ height: !state.viewState ? state.imgView : 200, borderRadius: 7, borderColor: "#fff", overflow: 'hidden' }} >
                                    <ImageBackground onLoadEnd={() => setState(pre => ({ ...pre, imgLoad: false }))} style={{ flex: 1 }} resizeMode={state.viewState ? "cover" : "stretch"} source={{ uri: state.order.orderImage ? renderPicture(state.order.orderImage, props.user.tokenObj.token.authToken) : IMAGE_NOT_AVAILABLE_URL }}>
                                        {
                                            state.imgLoad ?
                                                <View style={{ height: !state.viewState ? state.imgView : 200, justifyContent: 'center', alignItems: "center", }}>
                                                    <Spinner isVisible={state.imgLoad} size={40} type="Circle" color={activeTheme.default} />
                                                </View>
                                                : null
                                        }
                                        <TouchableOpacity style={{ minHeight: !state.viewState ? state.imgView : 200, justifyContent: "flex-end", alignItems: 'center', bottom: 10 }} onPress={toggleAnimation}>
                                            <View style={{ borderWidth: 2, borderColor: activeTheme.default, width: 50, borderRadius: 12 }} />
                                        </TouchableOpacity>
                                    </ImageBackground>
                                </View>
                                <ScrollView style={{ flex: 1 }}>
                                    {
                                        isJoviCustomerApp ?
                                            <View style={orderStyles.row(activeTheme)}>
                                                <Text style={orderStyles.dateText(activeTheme)}>{state.order.orderDate}</Text>
                                                <TouchableOpacity onPress={state.order.complaintID ? () => navigateToComplaintsDetails(state.order.complaintID) : () => openModal("complaint_suggestion", 1)}>
                                                    <Text style={[orderStyles.complaintFeedbackText(activeTheme), { color: state.order.complaintID ? activeTheme.grey : activeTheme.default }]}>
                                                        {
                                                            state.order.complaintID ?
                                                                `COMPLAINT NO #${state.order.complaintID}`
                                                                :
                                                                'COMPLAINT'
                                                        }
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => openModal('Feedback', 3)}>
                                                    <Text style={orderStyles.complaintFeedbackText(activeTheme)}>
                                                        FEEDBACK
        </Text>
                                                </TouchableOpacity>
                                            </View>
                                            : null
                                    }

                                    {
                                        (parentScreenState.activeTab > 0 && isJoviCustomerApp) ?
                                            // Rating 
                                            <View style={{ flex: 1, justifyContent: "space-between", flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                        <Image source={{ uri: (state.order?.riderPicture || state.order?.userPicture) ? renderPicture(state.order?.riderPicture || state.order?.userPicture, props.user.tokenObj.token.authToken) : EMPTY_PROFILE_URL }} style={{ height: 50, width: 50, borderRadius: 25, }} resizeMode="cover" />
                                                    </View>
                                                    <Text style={{ marginHorizontal: 5 }}>{isJoviCustomerApp ? state.order.riderName : state.order.userName}</Text>
                                                </View>

                                                <View>
                                                    <CustomRatings
                                                        margin={1}
                                                        initialCount={state.order.orderRiderRating}
                                                        disabled={true}
                                                        starHeight={18}
                                                        starWidth={18}
                                                        styles={{}}
                                                    />
                                                </View>
                                            </View> : null
                                    }
                                    {
                                        isJoviCustomerApp ?
                                            <View>
                                                <Text style={orderStyles.jobText(activeTheme, 20, activeTheme.black, 4)}>{state.order.jobCategoryString}</Text>
                                            </View> : null
                                    }

                                    {
                                        getNavigationState.routes[getNavigationState.index].params.dataParams.jobCategory === 1 ? renderJoviOrderDetails()
                                            :
                                            renderSMPharmacyRestaurantOrderDetails()
                                    }
                                    {/* Main End */}
                                </ScrollView>
                                {
                                    state.modalState.visible &&
                                    <BottomAlignedModal
                                        visible={state.modalState.visible}
                                        transparent={true}
                                        okHandler={() => { }}
                                        onRequestCloseHandler={closeModal}
                                        ModalContent={state.modalState.modalType === 1 ?
                                            <ComplaintSuggestionsModalView {...props} handlers={{
                                                openModal: args => {
                                                    // console.log("Args :", args);
                                                    openModal(args.title, 2, args.pressedSuggestion.complaintReasonID);
                                                }
                                            }} />
                                            :
                                            <ComplaintFeedbackModal ref={textRef} activeTheme={activeTheme} title={state.modalState.title} orderDetailsHandlers={{ addComplaintOrFeedback, onChangeHandler, openComplaintSuggestionModal: () => openModal("complaint_suggestion", 1) }} parentState={state} parentProps={props} />}
                                        modelViewPadding={0}
                                        modalHeight={state.modalState.modalType === 1 ? DEVICE_SCREEN_HEIGHT * 0.7 : state.modalState.modalType === 2 ? DEVICE_SCREEN_HEIGHT * 0.6 : DEVICE_SCREEN_HEIGHT * 0.30}
                                        // modalFlex={1}
                                        // modalFlex={Platform.select({ ios: 1, android: 0.7 })}
                                        androidKeyboardExtraOffset={22}
                                    />
                                }
                            </View>
                            :
                            <View />
                        //  recordsNotExistUI('No Record Found')
                    }

                </Content>
            </ImageBackground>
        </Container >

    )
};
export default OrdersHistoryDetails;

// updateRating: (supermarketIdx, targetProduct, userRatings) => {
//     let parentList = state.order.supermarkets.map((sup, supIndex) => {
//         if (supermarketIdx === supIndex) {
//             let childList = sup.items.map((pr, prIndex) => {
//                 if (pr.itemID === targetProduct.itemID) pr.ratings = userRatings;
//                 return pr;
//             })
//         }
//         return sup;
//     });
//     setState(pre => ({ ...pre, order: { ...pre.order, supermarkets: parentList } }))
//     // console.log('yeah :', parentList);
// }