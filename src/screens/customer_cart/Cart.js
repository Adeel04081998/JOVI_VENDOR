import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ImageBackground } from 'react-native';
import commonSvgIcons from '../../assets/svgIcons/common/common';
import commonStyles from '../../styles/styles';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import CustomHeader from '../../components/header/CustomHeader';
import { getRequest, postRequest } from '../../services/api';
import { navigateWithResetScreen, renderPicture, sharedClearCartHandler, sharedConfirmationAlert, sharedGetUserCartHandler } from '../../utils/sharedActions';
import CustomToast from '../../components/toast/CustomToast';
import SmallLoader from '../../components/loader/SmallLoader';
import { SvgXml } from 'react-native-svg';
import { BOTTOM_TABS } from '../../config/config';
import AsyncStorage from '@react-native-community/async-storage';
import { userAction } from '../../redux/actions/user';


export default props => {
    const initState = {
        "requestInProgress": false,
        "checkOutItemID": null,
        "showHideIndicator": false,
        "binIndex": 0,
        "showCrudLayer": false,
        "crudRowIndex": null,
        "crudSectionIndex": null
    }
    const [state, setState] = useState(initState);
    // console.log("Customer Cart.Props :", props);
    console.log("Customer Cart.state :", state);

    const checkOutItemType = props.mainDrawerComponentProps.footerNavReducer.pressedTab?.pitstopOrCheckOutItemType ?? 1
    useEffect(useCallback(() => {
        const _asyncService = async () => {
            if (!props.mainDrawerComponentProps.user.finalDestination) {
                console.log('here---')
                const finalDestination = JSON.parse(await AsyncStorage.getItem("customerOrder_finalDestination"));
                console.log("finalDestination", finalDestination);
                props.mainDrawerComponentProps.dispatch(userAction({ ...props.mainDrawerComponentProps.user, finalDestination: finalDestination[0] }));
            } else {
                console.log('finalDestination already exist')
            }
        };
        _asyncService();
        sharedGetUserCartHandler(getRequest, true, checkOutItemType);
        return () => console.log("Customer Cart cleared :");
    }, []), []);
    const itemIncDecHandler = (pressedItem, idx, binBtnPressed) => {
        // console.log(pressedItem)
        // {
        //     "checkoutItemID": pressedItem.checkOutItemID,
        //     "pitstopItemID": pressedItem.pitstopItemID,
        //     "isActive": (idx !== 2 && pressedItem.quantity - 1) === 0 ? false : true,
        //     "quantity": (idx !== 2 && pressedItem.quantity - 1) === 0 ? 1 : idx === 2 ? pressedItem.quantity + 1 : pressedItem.quantity - 1,
        //     "productAttributeID": pressedItem.productAttributeID,
        //     "checkOutItemType": checkOutItemType
        // }
        setState(pre => ({ ...pre, requestInProgress: true, checkOutItemID: pressedItem.checkOutItemID }));
        const productFormData = new FormData();
        productFormData.append("checkoutItemID", pressedItem.checkOutItemID);
        productFormData.append("pitstopItemID", pressedItem.pitstopItemID);
        productFormData.append("isActive", (idx !== 2 && pressedItem.quantity - 1) === 0 ? false : true);
        productFormData.append("quantity", (idx !== 2 && pressedItem.quantity - 1) === 0 ? 1 : idx === 2 ? pressedItem.quantity + 1 : pressedItem.quantity - 1);
        productFormData.append("checkOutItemType", checkOutItemType);
        // productFormData.append("PrescriptionImage", "");
        // productFormData.append("Description", data ? data.description : "");
        postRequest(
            `/api/SuperMarket/AddUpdateCheckOutItems`,
            productFormData,
            { headers: { 'content-type': 'multipart/form-data' } },
            props?.mainDrawerComponentProps?.dispatch,
            (res) => {
                if (res.data.statusCode === 200) {
                    setState(pre => ({ ...pre, requestInProgress: false, checkOutItemID: null }));
                    if (binBtnPressed && (props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].checkOutItemsListVM.length - 1) === 0) navigateWithResetScreen(null, [{ name: BOTTOM_TABS[props.mainDrawerComponentProps.footerNavReducer.pressedTab?.index ?? 0].route.container }]);
                    else if (props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM.length === 1 && (props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].checkOutItemsListVM.length - 1) === 0 && (props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM[0].checkOutItemsListVM[0].quantity - 1) === 0) navigateWithResetScreen(null, [{ name: BOTTOM_TABS[props.mainDrawerComponentProps.footerNavReducer.pressedTab?.index ?? 0].route.container }]);
                    else sharedGetUserCartHandler(getRequest, false, checkOutItemType);
                };
            },
            err => {
                if (err) CustomToast.error('Something went wrong');
                setState(pre => ({ ...pre, requestInProgress: false, checkOutItemID: null }));

            },
            '',
            false)
    };
    const showHideCrudLayer = (sectionIdx, idx) => {
        if (sectionIdx !== state.crudSectionIndex && idx !== state.crudRowIndex) setState(pre => ({ ...pre, crudRowIndex: idx, crudSectionIndex: sectionIdx, showCrudLayer: true }));
        else setState(pre => ({ ...pre, crudRowIndex: idx, crudSectionIndex: sectionIdx, showCrudLayer: !pre.showCrudLayer }));
    };
    const crudLayer = (row, i) => (
        <View key={i} style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
            {
                state.showHideIndicator && state.binIndex === i ?
                    <SmallLoader size="small" color={props.activeTheme.default} />
                    :
                    <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => sharedConfirmationAlert("Alert", "Are you sure you want to delete this product?", () => {
                        itemIncDecHandler({ ...row, quantity: 1 }, 1, true);
                        showHideCrudLayer(null);
                    }, () => { }, "No", "Yes", true)}>
                        <SvgXml xml={commonSvgIcons.deleteIcon("#FC3F93")} height={16} width={16} />
                    </TouchableOpacity>
            }
            <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => showHideCrudLayer(null)}>
                <SvgXml xml={commonSvgIcons.cross_icon_new()} height={13} width={13} />
            </TouchableOpacity>

        </View >
    );
    // console.log(props.mainDrawerComponentProps.footerNavReducer.pressedTab)
    return (
        <View style={{ flex: 1 }}>
            {/* <SharedHeader {...props} leftIconHandler={null} userObj={props?.mainDrawerComponentProps?.user} drawerProps={props.drawerProps} activeTheme={props.activeTheme} /> */}
            <CustomHeader
                leftIconHandler={() => {
                    if (props.mainDrawerComponentProps.footerNavReducer.pressedTab.from) navigateWithResetScreen(null, [{ name: props.mainDrawerComponentProps.footerNavReducer.pressedTab.from }])
                    else navigateWithResetScreen(null, [{ name: BOTTOM_TABS[props.mainDrawerComponentProps.footerNavReducer.pressedTab?.index ?? 1].route.container }])
                }}
                rightIconHandler={null}
                navigation={props.mainDrawerComponentProps.navigation}
                leftIcon={commonSvgIcons.headerBackIcon()}
                bodyContent={"CART"}
                rightIcon={null}
                activeTheme={props.activeTheme}
                screenName="super_market_home"
            />
            {
                !props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM?.length ? null :
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, padding: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 }}>
                                <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), margin: 5 }}>Your order</Text>
                                <TouchableOpacity onPress={() => sharedConfirmationAlert("Alert", "Are you sure you want to empty your cart?", () => sharedClearCartHandler(postRequest, true, false, checkOutItemType, props.mainDrawerComponentProps.footerNavReducer.pressedTab?.index ?? 1), () => { }, "No", "Yes", true)}>
                                    <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.default, 3) }}>
                                        Empty
                                 </Text>
                                </TouchableOpacity>
                            </View>
                            {
                                <View style={{ flex: props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM?.length <= 3 ? 0 : 1, ...commonStyles.shadowStyles(null, null, null, 10), ...commonStyles.borderedViewStyles(7), backgroundColor: '#fff' }}>
                                    <ScrollView style={{ flex: props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM?.length <= 3 ? 0 : 1 }}>
                                        {
                                            // ([...props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM, ...props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM, ...props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM, ...props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM, ...props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM, ...props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM, ...props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.pitstopCheckoutItemsListVM,] || []).map((S, index) => (
                                            (props.mainDrawerComponentProps.user.userCart.checkoutItemsVMList.pitstopCheckoutItemsListVM || []).map((S, index) => (
                                                <View key={index}>
                                                    <Text style={{ ...commonStyles.fontStyles(16, undefined, 4), padding: 7, paddingLeft: 13 }}>{S.smName}</Text>
                                                    <View style={{ borderTopColor: props.activeTheme.lightGrey, borderTopWidth: 0.5 }} />
                                                    {
                                                        // [...S.checkOutItemsListVM, ...S.checkOutItemsListVM, ...S.checkOutItemsListVM].map((P, j) => (
                                                        S.checkOutItemsListVM.map((P, j) => (
                                                            <View key={j}>
                                                                <View style={{ backgroundColor: '#fff', height: 100, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                                                                    <View style={{ flexDirection: 'row' }}>
                                                                        <View style={{ borderRadius: 7, height: 70, width: 70, overflow: 'hidden' }}>
                                                                            <ImageBackground resizeMode="cover" source={{ uri: renderPicture(P.productImages[0], props?.mainDrawerComponentProps?.user?.tokenObj?.token?.authToken) }} style={[{ flex: 1 }]} />
                                                                        </View>
                                                                        <View style={{ justifyContent: 'space-between' }}>
                                                                            <Text style={{ ...commonStyles.fontStyles(15, props.activeTheme.default, 4), paddingLeft: 7 }}>
                                                                                {P.productItemName}
                                                                            </Text>
                                                                            <Text style={{ ...commonStyles.fontStyles(14, props.activeTheme.grey, 3), paddingLeft: 7 }}>
                                                                                {P.productAttribute}
                                                                            </Text>
                                                                            <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.default, 4), paddingLeft: 7 }}>
                                                                                Rs. {P.price}
                                                                            </Text>
                                                                        </View>
                                                                    </View>

                                                                    <View style={{ justifyContent: 'space-between' }}>

                                                                        {
                                                                            (state.crudSectionIndex === index && state.crudRowIndex === j && state.showCrudLayer) ? crudLayer(P, j) :
                                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: props.activeTheme.lightGrey, borderRadius: 20, width: 70, height: 25 }}>
                                                                                        {
                                                                                            (state.requestInProgress && state.checkOutItemID === P.checkOutItemID) ? <SmallLoader isActivityIndicator={true} size="small" /> :
                                                                                                ['-', P.quantity, '+'].map((btn, idx) => idx === 1 ? <Text key={idx} style={{}}>{btn}</Text> : <TouchableOpacity key={idx} style={{ backgroundColor: '#fff', height: 22, width: 22, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} onPress={() => itemIncDecHandler(P, idx)}>
                                                                                                    <Text style={{}}>{btn}</Text>
                                                                                                </TouchableOpacity>)
                                                                                        }
                                                                                    </View>
                                                                                    <View style={{ left: 3 }}>
                                                                                        <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => showHideCrudLayer(index, j)}>
                                                                                            <SvgXml xml={commonSvgIcons.threeDots("#C0C0C0")} height={22} width={22} style={{ transform: [{ rotate: '0deg' }] }} />
                                                                                        </TouchableOpacity>
                                                                                    </View>
                                                                                </View>

                                                                        }


                                                                    </View>
                                                                </View>
                                                                <View style={{ borderBottomColor: props.activeTheme.lightGrey, borderBottomWidth: 0.5 }} />
                                                            </View>
                                                        ))
                                                    }

                                                </View>
                                            ))
                                        }
                                    </ScrollView>
                                    <View style={{ margin: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ ...commonStyles.fontStyles(15, props.activeTheme.grey, 4), margin: 5, opacity: 0.7 }}>Shipping Charges</Text>
                                            <Text style={{ ...commonStyles.fontStyles(16, props.activeTheme.grey, 4), opacity: 0.7 }}>
                                                Rs. {props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.shippingCharges}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ ...commonStyles.fontStyles(15, undefined, 4), margin: 5 }}>Total</Text>
                                            <Text style={{ ...commonStyles.fontStyles(16, undefined, 4) }}>
                                                {/* Note this is temporary removed of delivery charges needs to be removed in future */}
                                                Rs. {props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.totalProducts + props?.mainDrawerComponentProps?.user?.userCart?.checkoutItemsVMList?.shippingCharges}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            }
                        </View>
                        <TouchableOpacity style={{ paddingVertical: 20, backgroundColor: props.activeTheme.default }} onPress={() => props?.mainDrawerComponentProps?.navigation.navigate("customer_checkout")}>
                            <Text style={{ ...commonStyles.fontStyles(16, '#fff', 4), textAlign: 'center' }}>Continue</Text>
                        </TouchableOpacity>
                    </View>
            }

        </View >
    )
}
