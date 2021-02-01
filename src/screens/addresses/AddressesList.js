import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ImageBackground, Platform, ScrollView, ActivityIndicator } from 'react-native';
import CustomHeader from '../../components/header/CustomHeader';
import svgIcons from '../../assets/svgIcons/feedbackComplaints';
import Svg, { SvgXml } from 'react-native-svg';
import editIcon from '../../assets/svgIcons/common/edit.svg';
import homeIcon from '../../assets/svgIcons/common/home.svg';
import workIcon from '../../assets/svgIcons/common/work.svg';
import threeDots from '../../assets/svgIcons/common/three-dots.svg';
import crossIcon from '../../assets/svgIcons/common/cross-new.svg';
import { getRequest, postRequest } from '../../services/api';
import { TouchableOpacity } from 'react-native-gesture-handler';
import commonStyles from '../../styles/styles';
import { useFocusEffect } from '@react-navigation/native';
import commonSvgIconsJs from '../../assets/svgIcons/common/common';
import CustomToast from '../../components/toast/CustomToast';
import AsyncStorage from '@react-native-community/async-storage';
import { sahredConvertIntoSubstrings, sharedConfirmationAlert } from '../../utils/sharedActions';
import { favHomeIcon, favWorkIcon, favFamilyIcon, favFriendsIcon } from '../../assets/svgIcons/customerorder/customerorder';
import DefaultBtn from '../../components/buttons/DefaultBtn';

export default function AddressesList(props) {
    let initState = {
        "addresses": [],
        "showHideIndicator": false,
        "binIndex": 0,
        "showCrudLayer": false,
        "crudRowIndex": null
    }
    const [state, setState] = useState(initState);
    const renderFavIcons = addressType => {
        if (addressType === 1) return favHomeIcon(props.activeTheme.default);
        if (addressType === 2) return favWorkIcon(props.activeTheme.default);
        if (addressType === 3) return favFriendsIcon(props.activeTheme.default);
        if (addressType === 4) return favFamilyIcon(props.activeTheme.default);
    }
    // console.log(state.addresses.length)
    const getAllAddresses = () => {
        getRequest(
            '/api/Menu/Address/List',
            {},
            props.dispatch,
            response => {
                // console.log(response)
                // let recievedAddresses = ((response && response.data && response.data.getAddresss).slice(response.data.getAddresss.length - 10, response.data.getAddresss.length) || []);
                let recievedAddresses = ((response && response.data && response.data.getAddresss) || []);
                recievedAddresses = recievedAddresses.map((item, i) => ({
                    addressID: item.addressID,
                    note: item.note,
                    title: item.title,
                    addressType: item.addressType,
                    addressTypeStr: item.addressTypeStr,
                    latitudeDelta: parseFloat(item.latitudeDelta),
                    longitudeDelta: parseFloat(item.longitudeDelta),
                    geometry: {
                        location: {
                            lat: parseFloat(item.latitude),
                            lng: parseFloat(item.longitude)
                        }
                    }
                }));
                setState(copyState => ({ ...copyState, addresses: recievedAddresses }))
            },
            (error) => {
                console.log(((error?.response) ? error.response : {}), error);
            },
            ''
        );
    };
    const deleteAddressHandler = (addressObj, index) => {
        setState(pre => ({ ...pre, showHideIndicator: true, binIndex: index }));
        postRequest(
            `/api/Menu/Address/Delete/${addressObj.addressID}`,
            {},
            {},
            props.dispatch,
            async (res) => {
                await AsyncStorage.removeItem("customerOrder_predefinedPlaces");
                let filteredAddresses = state.addresses.filter(ad => ad.addressID !== addressObj.addressID);
                setState(pre => ({ ...pre, addresses: filteredAddresses, showHideIndicator: false, crudRowIndex: null, showCrudLayer: false }));
                CustomToast.success(res.data.message);
                // getAllAddresses();
            },
            err => {
                console.log(err)
                setState(pre => ({ ...pre, showHideIndicator: false }));
            },
            '',
            false)

    };
    const deleteAddressWarn = (addressObj, index) => sharedConfirmationAlert("Alert", "Are You sure you want to delete the address?", () => deleteAddressHandler(addressObj, index), () => { }, "No", "Yes", true)
    const goToAddressAddOrUpdate = (record, actionType) => {
        if (actionType === 1 && state.addresses.length > 9) return CustomToast.error("Cannot add address! You have reached the maximum allowed limit of favourite addresses (10)", null, 'long');
        else props.navigation.navigate("addresses_add_update", { record });
    };
    const showHideCrudLayer = idx => {
        if (idx !== state.crudRowIndex) setState(pre => ({ ...pre, crudRowIndex: idx, showCrudLayer: true }));
        else setState(pre => ({ ...pre, crudRowIndex: idx, showCrudLayer: !pre.showCrudLayer }));
    };
    const crudLayer = (row, i) => (
        <View key={i} style={{ width: "100%", position: 'absolute', flexDirection: 'row', justifyContent: "space-between", alignItems: 'center', height: 70, borderRadius: 7, borderColor: "#000", elevation: Platform.select({ ios: 10, android: 2 }), backgroundColor: '#fff', marginTop: 10 }}>
            <View style={{ flex: 0.5, paddingHorizontal: 10 }}>
                <SvgXml xml={renderFavIcons(row.addressType)} height={30} width={30} />
            </View>
            <View style={{ flex: 4, opacity: 0.5, }}>
                <Text style={[commonStyles.fontStyles(14, props.activeTheme.grey, 1), { paddingVertical: 10 }]}>{sahredConvertIntoSubstrings(row.title, 40, 0, (row.title.length - 20))}</Text>
            </View>
            <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => goToAddressAddOrUpdate(row, 2)}>
                <SvgXml xml={editIcon} height={16} width={16} />
            </TouchableOpacity>
            {
                state.showHideIndicator && state.binIndex === i ?
                    <ActivityIndicator style={{ paddingHorizontal: 10 }} size="small" color={props.activeTheme.default} />
                    :
                    <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => deleteAddressWarn(row, i)}>
                        <SvgXml xml={commonSvgIconsJs.deleteIcon("#FC3F93")} height={16} width={16} />
                    </TouchableOpacity>
            }
            <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => showHideCrudLayer(null)}>
                <SvgXml xml={crossIcon} height={13} width={13} />
            </TouchableOpacity>
        </View>
    )
    useFocusEffect(useCallback(() => {
        console.log("AddressesList.useCallback---");
        getAllAddresses();
        return () => {
            console.log('Addresses list cleanup--');
            setState(initState);
        }
        // debugger;
    }, []), []);


    // console.log('Addresses.State :', state);
    return (
        <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
            <CustomHeader
                leftIconHandler={'toggle'}
                rightIconHandler={() => { }}
                navigation={props.drawerProps.navigation}
                leftIcon={svgIcons.menuIcon(props.activeTheme)}
                bodyContent={'MY ADDRESSES'}
                rightIcon={null}
                activeTheme={props.activeTheme}
            />
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 10 }} style={{ flex: 2, marginBottom: 20, paddingBottom: 20 }}>
                    {
                        state.addresses.length ? state.addresses.map((row, i) => (
                            <View key={i} style={{ marginHorizontal: 18, flexDirection: 'row', justifyContent: "space-between", alignItems: 'center', height: 70, borderRadius: 7, borderColor: "#000", elevation: Platform.select({ ios: 10, android: 1 }), backgroundColor: '#fff', marginTop: 10, }}>
                                <View style={{ flex: 0.5, paddingHorizontal: 10 }}>
                                    <SvgXml xml={renderFavIcons(row.addressType)} height={30} width={30} />
                                </View>

                                {
                                    (state.crudRowIndex === i && state.showCrudLayer) ? crudLayer(row, i) :
                                        <>
                                            <View style={{ flex: 4 }}>
                                                <Text style={[commonStyles.fontStyles(14, props.activeTheme.grey, 1), { paddingVertical: 10 }]}>{sahredConvertIntoSubstrings(row.title, 40, 0, (row.title.length - 20))}</Text>
                                            </View>
                                            <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => showHideCrudLayer(i)}>
                                                <SvgXml xml={threeDots} height={20} width={20} />
                                            </TouchableOpacity>
                                        </>
                                }


                            </View>
                        ))
                            :
                            <View />
                    }
                </ScrollView>
                <View style={{ flex: 0.1, justifyContent: 'flex-end' }}>
                    <DefaultBtn
                        title="Add new address"
                        onPress={() => goToAddressAddOrUpdate(null, 1)}
                    />
                </View>
            </View>
        </ImageBackground>

    )
}
