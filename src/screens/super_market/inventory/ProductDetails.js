import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';
import commonSvgIcons from '../../../assets/svgIcons/common/common';
import { getScreenNavState, navigateWithResetScreen, openShareClients, renderPicture, sahredConvertIntoSubstrings, sharedAddItemToFavouritesHandler, sharedGetUserCartHandler, sharedOpenModal, sharedTotalCartItems } from '../../../utils/sharedActions';
import { DEVICE_SCREEN_HEIGHT, IMAGE_NOT_AVAILABLE_URL } from '../../../config/config';
import { SvgXml } from 'react-native-svg';
import commonStyles from '../../../styles/styles';
import CustomRatings from '../../../components/ratings';
import { getRequest, postRequest } from '../../../services/api';
import Spinner from 'react-native-spinkit';
import CustomToast from '../../../components/toast/CustomToast';
import { showHideImageViewAction } from '../../../redux/actions/modal';
import { PrescriptionModalView } from '../../../components/modals/SharedModals';


export default props => {
    const _currentScreen = getScreenNavState(props?.mainDrawerComponentProps?.navigation);
    const initState = {
        "tabIndex": 0,
        "isImageLoading": true,
        "pitstopItemDetailsViewModel": {},
        "qty": 1,
        "productAttributeID": 0,
    };
    const [state, setState] = useState(initState);
    const checkOutItemType = props.mainDrawerComponentProps.footerNavReducer.pressedTab?.pitstopOrCheckOutItemType ?? 1
    // console.log('[Product Details].props :', props);

    // console.log('[Product Details]._currentScreen :', _currentScreen);
    console.log('[Product Details].state :', state);

    useEffect(useCallback(() => {
        getRequest(`/api/SuperMarket/Product/Detail/${_currentScreen?.params?.item?.pitstopItemID}`, {}, props.mainDrawerComponentProps?.dispatch, res => _onSuccess(null, res), err => _onError(null, err), '', true, true);
        return () => console.log('Product detials unmounted')
    }, []), []);

    const _onSuccess = (req, res) => {
        // console.log('[Product Details]._onSuccess :', 'req :', req, "res :", res);
        if (res.data.statusCode === 200) setState(pre => ({ ...pre, qty: initState.qty, pitstopItemDetailsViewModel: res.data.pitstopItemDetailsViewModel, productAttributeID: res.data.pitstopItemDetailsViewModel.productAttributesVMList ? res.data.pitstopItemDetailsViewModel.productAttributesVMList[0].productAttributeID : 0 }))
    };
    const _onError = (req, res) => {
        // console.log('[Product Details]._onError :', 'req :', req, "res :", res);
    };
    const itemIncDecHandler = pressType => {
        setState(pre => ({
            ...pre,
            qty: (pressType !== 2 && pre.qty <= 1) ? 1 : pressType === 2 ? pre.qty + 1 : pre.qty - 1
        }))
    };
    const onChangeTab = tabIdx => setState(pre => ({ ...pre, tabIndex: tabIdx }));
    const productDetailsUI = () => (
        <View style={{ flex: 1, overflow: 'hidden', ...commonStyles.shadowStyles(), ...commonStyles.borderedViewStyles(10), backgroundColor: '#fff', marginHorizontal: 15 }}>
            <View style={{ padding: 10 }}>
                {/* <Text style={{ ...commonStyles.fontStyles(16, '#000', 4) }}>{_currentScreen?.params?.item?.productName ?? "Product name"}</Text> */}
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ ...commonStyles.fontStyles(14, '#000', 4), top: 5 }}>
                            {`Rs. ${state.pitstopItemDetailsViewModel?.productItemPrice}`}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: props.activeTheme.lightGrey, borderRadius: 20, width: 70, height: 25 }}>
                            {['-', state.qty, '+'].map((btn, idx) => idx === 1 ? <Text key={idx} style={{}}>{btn}</Text> : <TouchableOpacity key={idx} style={{ backgroundColor: '#fff', height: 22, width: 22, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} onPress={() => itemIncDecHandler(idx)}>
                                <Text style={{}}>{btn}</Text>

                            </TouchableOpacity>)}
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ ...commonStyles.fontStyles(15, '#000', 2) }}>
                            Discount:{" "}
                            <Text style={{ ...commonStyles.fontStyles(14, '#000', 1, '700') }}>
                                {`Rs. ${state.pitstopItemDetailsViewModel?.discountPrice}`}
                                {" "}
                            </Text>
                        </Text>
                        <View style={{ backgroundColor: '#FFE7D9', borderRadius: 12, paddingVertical: 7, paddingHorizontal: 10, left: 5 }}>
                            <Text style={{ ...commonStyles.fontStyles(14, '#FF6000', 4) }}>
                                {state.pitstopItemDetailsViewModel?.discount}% OFF
                          </Text>
                        </View>
                    </View>
                    {/* Ratings */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }}>
                        <CustomRatings
                            margin={1}
                            initialCount={state.pitstopItemDetailsViewModel?.rating}
                            disabled={true}
                            starHeight={15}
                            starWidth={15}
                            styles={{}}
                            onPress={count => {

                            }}
                        />
                        <Text style={{ ...commonStyles.fontStyles(15, '#000', 2), marginLeft: 10 }}>
                            {`( ${state.pitstopItemDetailsViewModel?.pitstopItemReviewVMList.length} Reviews )`}
                        </Text>
                    </View>
                    {/* Delivery */}
                    <View style={{ paddingVertical: 5 }}>
                        <Text style={{ ...commonStyles.fontStyles(16, '#000', 1), }}>
                            Delivery {"\n"}
                            <Text style={{ ...commonStyles.fontStyles(14, '#000', 2), }}>
                                Free
                            </Text>
                        </Text>
                    </View>
                    {/* KGS sections */}
                    <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
                        {(state.pitstopItemDetailsViewModel?.productAttributesVMList || []).map((A, key) => (
                            <TouchableOpacity key={key} style={{ padding: 5, marginHorizontal: 2, borderRadius: 10, borderColor: props.activeTheme.default, justifyContent: 'center', backgroundColor: A.productAttributeID === state.productAttributeID ? props.activeTheme.default : undefined, borderWidth: 1, }} onPress={() => setState(pre => ({ ...pre, productAttributeID: A.productAttributeID }))}>
                                <Text style={{ ...commonStyles.fontStyles(14, A.productAttributeID === state.productAttributeID ? "#fff" : props.activeTheme.default, 1) }}>
                                    {A.productAttributeName.toLocaleUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {/* Product Details */}
                    <Text style={{ ...commonStyles.fontStyles(17, '#000', 4), paddingVertical: 5, top: 5 }}>{"Product Details"}</Text>
                    <ScrollView style={{ maxHeight: 200 }}>
                        <Text style={{ ...commonStyles.fontStyles(15, '#000', 2) }}>
                            {
                                state.pitstopItemDetailsViewModel?.description
                            }

                        </Text>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
    const renderReviewsUI = () => (
        <View style={{ flex: 1, ...commonStyles.shadowStyles(), ...commonStyles.borderedViewStyles(10), marginHorizontal: 15, backgroundColor: '#fff' }}>
            <Text style={{ ...commonStyles.fontStyles(17, '#000', 4), padding: 10 }}>{"Reviews"}</Text>
            <View style={{ flex: 1, paddingHorizontal: 5 }}>
                <ScrollView contentContainerStyle={{ marginHorizontal: 0 }}>
                    {
                        (state.pitstopItemDetailsViewModel.pitstopItemReviewVMList || []).map((item, key) => (
                            <View key={key} style={{ flexDirection: 'row', paddingVertical: 5 }}>
                                <View style={{ height: 50, width: 50, borderRadius: 25, backgroundColor: props.activeTheme.grey, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ ...commonStyles.fontStyles(16, '#fff') }}>{(item.customerName.split(" ").length > 1) ? item.customerName.split(" ")[0][0] + item.customerName.split(" ")[1][0] : item.customerName.split(" ")[0][0]} </Text>
                                </View>
                                <View style={{ paddingLeft: 10 }}>
                                    <CustomRatings
                                        margin={1}
                                        initialCount={item.rating}
                                        disabled={true}
                                        starHeight={15}
                                        starWidth={15}
                                        styles={{ alignSelf: 'flex-start' }}
                                        onPress={count => {
                                        }}
                                    />
                                    <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), paddingVertical: 5 }}>{item?.customerName ?? ""} </Text>
                                    <Text style={{ ...commonStyles.fontStyles(16, undefined, 2) }}>
                                        {sahredConvertIntoSubstrings(item?.description, 100, 0, 70)}
                                    </Text >
                                </View >
                            </View >
                        ))
                    }

                </ScrollView >
            </View >

        </View >
    );
    const addItemToCart = (data) => {
        const productFormData = new FormData();
        productFormData.append("checkoutItemID", state.pitstopItemDetailsViewModel?.checkoutItemID ?? 0);
        productFormData.append("pitstopItemID", state.pitstopItemDetailsViewModel?.pitstopItemID);
        productFormData.append("isActive", true);
        productFormData.append("quantity", state.pitstopItemDetailsViewModel?.quantity + state.qty);
        productFormData.append("checkOutItemType", checkOutItemType);
        productFormData.append("PrescriptionImage", data ? data.images[0] : "");
        productFormData.append("Description", data ? data.description : "");
        postRequest(
            `/api/SuperMarket/AddUpdateCheckOutItems`,
            productFormData,
            { headers: { 'content-type': 'multipart/form-data' } },
            props?.mainDrawerComponentProps?.dispatch,
            (res) => {
                // debugger;
                if (res.data.statusCode === 200) {
                    CustomToast.success('Item added to cart');
                    getRequest(`/api/SuperMarket/Product/Detail/${state.pitstopItemDetailsViewModel.pitstopItemID}`, {}, props.mainDrawerComponentProps?.dispatch, res => _onSuccess(null, res), err => _onError(null, err), '', true, false);
                    sharedGetUserCartHandler(getRequest, false, props?.mainDrawerComponentProps?.footerNavReducer?.pressedTab?.pitstopOrCheckOutItemType);
                };
            },
            err => {
                if (err) {
                    // debugger;
                    CustomToast.error('Something went wrong')
                }
            },
            '',
            false)
    };

    const addPrescriptionIfRequired = () => sharedOpenModal({ dispatch: props?.mainDrawerComponentProps?.dispatch, visible: true, transparent: true, modalHeight: DEVICE_SCREEN_HEIGHT * 0.5, modelViewPadding: 0, ModalContent: <PrescriptionModalView activeTheme={props.mainDrawerComponentProps.activeTheme} dispatch={props.mainDrawerComponentProps.dispatch} handlers={{ cb: data => addItemToCart(data) }} />, okHandler: () => { }, onRequestCloseHandler: null, androidKeyboardExtraOffset: 0 })
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader
                leftIconHandler={() => navigateWithResetScreen(null, [{ name: 'super_market_home' }])}
                rightIconHandler={() => props.mainDrawerComponentProps.navigation.navigate("customer_cart_home", { screen: "customer_cart" })}
                navigation={props.mainDrawerComponentProps.navigation}
                leftIcon={commonSvgIcons.headerBackIcon()}
                bodyContent={state.pitstopItemDetailsViewModel?.productItemName ?? _currentScreen?.params?.item?.productItemName}
                rightIcon={commonSvgIcons.footerCart(props.mainDrawerComponentProps.activeTheme.default)}
                activeTheme={props.activeTheme}
                finalDestinationView={{ visible: false }}
            />
            {
                sharedTotalCartItems().cartProducts.length ?
                    <View style={{ position: 'absolute', right: 17, top: 35, zIndex: 999, backgroundColor: "#FC3F93", alignItems: 'center', justifyContent: 'center', height: 12, width: 12, borderRadius: 10 }}>
                        <Text style={{ color: props.mainDrawerComponentProps.activeTheme.white, fontSize: 10 }}>{sharedTotalCartItems().cartProducts.length}</Text>
                    </View>
                    : null
            }
            {
                !Object.keys(state.pitstopItemDetailsViewModel).length ? <View style={{ flex: 1 }} />
                    :
                    <Fragment>
                        <View style={{ flex: 0.8 }}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => props?.mainDrawerComponentProps?.dispatch(showHideImageViewAction({ key: 0, imageIndex: 0, imagesArr: [{ uri: state.pitstopItemDetailsViewModel?.productImageList.length ? renderPicture(state.pitstopItemDetailsViewModel?.productImageList[0] ?? "", props?.mainDrawerComponentProps?.user?.tokenObj?.token?.authToken) : IMAGE_NOT_AVAILABLE_URL }], visible: true, onRequestClose: () => props?.mainDrawerComponentProps?.dispatch(showHideImageViewAction({})), swipeToCloseEnabled: true }))}>
                                <ImageBackground resizeMode="cover" onLoadEnd={() => setState(pre => ({ ...pre, isImageLoading: false }))} source={{ uri: state.pitstopItemDetailsViewModel?.productImageList.length ? renderPicture(state.pitstopItemDetailsViewModel?.productImageList[0] ?? "", props?.mainDrawerComponentProps?.user?.tokenObj?.token?.authToken) : IMAGE_NOT_AVAILABLE_URL }} style={[{ flex: 1 }, state.isImageLoading ? { justifyContent: 'center', alignItems: 'center' } : {}]}>
                                    {
                                        state.isImageLoading ?
                                            <Spinner isVisible={state.isImageLoading} size={50} type="Circle" color={props.activeTheme.default} />
                                            :
                                            <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 3 }} onPress={() => {
                                                sharedAddItemToFavouritesHandler(postRequest, {
                                                    "favoritePitstopItemID": state.pitstopItemDetailsViewModel?.favoritePitstopItemID,
                                                    "pitstopItemID": state.pitstopItemDetailsViewModel?.pitstopItemID,
                                                    "inActive": state.pitstopItemDetailsViewModel?.isFavorite
                                                },
                                                    res => {
                                                        if (res.data.statusCode === 200) {
                                                            console.log("res :", res);
                                                            CustomToast.error(state.pitstopItemDetailsViewModel.isFavorite ? 'Item removed from favourites' : 'Item added to favourites');
                                                            setState(pre => ({
                                                                ...pre, pitstopItemDetailsViewModel: {
                                                                    ...pre.pitstopItemDetailsViewModel,
                                                                    isFavorite: !pre.pitstopItemDetailsViewModel.isFavorite
                                                                }
                                                            }))
                                                        };
                                                    },
                                                    err => {
                                                        if (err) CustomToast.error('Something went wrong');
                                                    }
                                                )
                                            }}>
                                                <SvgXml xml={commonSvgIcons.super_heart_Icon(state.pitstopItemDetailsViewModel.isFavorite ? props.activeTheme.default : '#fff')} height={40} width={40} />
                                            </TouchableOpacity>
                                    }
                                </ImageBackground>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 2, marginBottom: 20 }}>
                            <View style={{ alignSelf: 'center', flexDirection: 'row', marginVertical: 7, alignItems: 'center' }}>
                                {
                                    [{ title: 'Product' }, { title: "Reviews" }].map((item, k) => (
                                        <TouchableOpacity key={k} style={{ paddingVertical: 5, paddingHorizontal: 12, borderRadius: k === state.tabIndex ? 20 : 0, backgroundColor: k === state.tabIndex ? props.activeTheme.default : undefined }} onPress={() => onChangeTab(k)}>
                                            <Text style={{ ...commonStyles.fontStyles(14, k === state.tabIndex ? '#fff' : '#000') }}>
                                                {item.title}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                }

                            </View>
                            {
                                state.tabIndex === 0 ? productDetailsUI() : renderReviewsUI()
                            }
                        </View>
                        {/* Footer buttons */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            {[{
                                title: 'SHARE THIS', icon: commonSvgIcons.super_share(), onPress: () => openShareClients({ title: "Share with", message: `` })
                            },
                            {
                                title: 'ADD TO CART', icon: commonSvgIcons.super_cart(), onPress: () => {
                                    if (state.pitstopItemDetailsViewModel.isPrescriptionRequired && checkOutItemType === 3) addPrescriptionIfRequired();
                                    else addItemToCart(null);
                                }
                            }].map((f, o) => (
                                <TouchableOpacity onPress={f.onPress} key={o} style={{ width: '50%', paddingVertical: 20, marginLeft: o > 0 ? 3 : undefined, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: props.activeTheme.default }}>
                                    <Text style={{ ...commonStyles.fontStyles(15, '#fff', 1) }}>{f.title}</Text>
                                    <View style={{ marginLeft: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 30, width: 30, borderRadius: 15 }}>
                                        <SvgXml xml={f.icon} height={15} width={15} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Fragment>
            }

        </View >
    )
};
const styles = StyleSheet.create({})
