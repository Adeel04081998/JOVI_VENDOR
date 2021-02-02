import React, { useEffect, useCallback, useState, useRef, createRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Platform, ScrollView, TextInput, StatusBar } from 'react-native';
import closeIcon from '../../assets/svgIcons/common/cross-new.svg';
import { SvgXml } from 'react-native-svg';
import plateformSpecific from '../../utils/plateformSpecific';
import commonStyles from '../../styles/styles';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { sharedGetCustomerAddressesHandler, sharedValidateAllProperties } from '../../utils/sharedActions';
import { CONSTANTLATDELTA, CONSTANTLONGDELTA } from '../../config/config';
import CustomMapView from '../../components/mapview/CustomMapView';
import CustomLocationSearch from '../../components/locationSearch/CustomLocationSearch';
import { openModalAction, closeModalAction } from '../../redux/actions/modal';
import { postRequest, getRequest } from '../../services/api';
import CustomToast from '../../components/toast/CustomToast';
import AsyncStorage from '@react-native-community/async-storage';
import { favHomeIcon, favWorkIcon, favFamilyIcon, favFriendsIcon } from '../../assets/svgIcons/customerorder/customerorder';
import DefaultBtn from '../../components/buttons/DefaultBtn';

export default function AddOrEditAddress(props) {
    // console.log('navState :', props.navigation.dangerouslyGetState());
    let parentIndex = props.navigation.dangerouslyGetState().index,
        nestingIndex = props.navigation.dangerouslyGetState().routes[parentIndex].state.index,
        parentRoute = props.navigation.dangerouslyGetState().routes[parentIndex].state.routes[nestingIndex],
        lastIndex = parentRoute?.state?.index,
        currentRoute = (parentRoute?.state?.routes[lastIndex].params && parentRoute?.state?.routes[lastIndex]?.params?.record) ? parentRoute?.state?.routes[lastIndex]?.params?.record : {};
    let initState = {
        "showHideDropDownsBool": false,
        "firstRenderMap": false,
        "dataRecived": false,
        "predefinedPlaces": [],
        "addressText": currentRoute?.addressTypeStr || "Home",
        "focusedField": "",
        "restrict": false,
        "selectedRegion": {
            "addressID": currentRoute?.addressID || 0,
            "title": currentRoute?.title || null,
            "note": currentRoute?.note || "",
            "latitude": currentRoute?.geometry?.location?.lat || null,
            "longitude": currentRoute?.geometry?.location?.lng || null,
            "latitudeDelta": currentRoute?.latitudeDelta || null,
            "longitudeDelta": currentRoute?.longitudeDelta || null,
            "addressType": currentRoute?.addressType && currentRoute.addressType !== 3 ? currentRoute?.addressType : 1,
            "addressTypeStr": ""
        }
    };
    const [state, setState] = useState(initState);
    // console.log('AddOrEditAddress.Props :', props);
    // console.log('AddOrEditAddress.State :', state);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const locationTextRef = createRef(null);
    const scrollRef = createRef(null);


    const setPinRegion = (newRegion, title) => {
        // console.log('setPinRegion called---');
        setState(prev => ({
            ...prev,
            selectedRegion: {
                ...prev.selectedRegion,
                ...newRegion,
                title,
            }
        }));
    }

    const onSelectLocationHandler = data => {
        if (!data || data === null) return;
        props.dispatch(closeModalAction());
        mapRef.current && mapRef.current.animateToRegion({
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: data.latitudeDelta ? data.latitudeDelta : state.selectedRegion.latitudeDelta,
            longitudeDelta: data.longitudeDelta ? data.longitudeDelta : state.selectedRegion.longitudeDelta
        });
        setState(prevState => ({
            ...prevState,
            firstRenderMap: initState.firstRenderMap,
            restrict: true,
            selectedRegion: {
                ...prevState.selectedRegion,
                // addressID: data.addressID,
                title: data.title,
                latitude: data.latitude,
                longitude: data.longitude,
                latitudeDelta: data.latitudeDelta ? data.latitudeDelta : state.selectedRegion.latitudeDelta,
                longitudeDelta: data.longitudeDelta ? data.longitudeDelta : state.selectedRegion.longitudeDelta

            }
        }));

    };
    const gotoMapLocationPicker = () => {
        props.navigation.navigate("map_location_picker_container", {
            screen: "map_location_picker",
            cb: data => onSelectLocationHandler(data),
            backScreenObj: {
                container: "addresses_container",
                screen: "addresses_add_update"
            },
        });
    };
    const selectLocation = () => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <CustomLocationSearch
                    {...props}
                    {...state}
                    gotoMapLocationPicker={gotoMapLocationPicker}
                    predefinedPlaces={state.predefinedPlaces}
                    onSelectLocation={data => onSelectLocationHandler(data)}
                    locationTitle={state.selectedRegion.title}
                    locationTextRef={locationTextRef}
                />
            ),
            // modalFlex: 0,
            modalHeight: Dimensions.get('window').height * 0.5,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...props }
        };
        props.dispatch(openModalAction(ModalComponent));
    };
    const showHideDropDowns = (addressType, addressText) => {
        setState(pre => ({
            ...pre,
            showHideDropDownsBool: !pre.showHideDropDownsBool,
            addressText: addressText ? addressText : pre.addressText,
            selectedRegion: {
                ...pre.selectedRegion,
                addressType: addressType ? addressType : pre.selectedRegion.addressType,
                // addressTypeStr: addressType !== 3 ? "" : pre.selectedRegion.addressTypeStr
                addressTypeStr: addressText ? addressText : pre.selectedRegion.addressTypeStr
            }
        }));
    };
    const renderSelectionList = () => {
        let data = [{ "text": "Home", "value": 1, "icon": favHomeIcon }, { "text": "Work", "value": 2, "icon": favWorkIcon }, { "text": "Friends", "value": 3, "icon": favFriendsIcon }, { "text": "Family", "value": 4, "icon": favFamilyIcon }];
        return data.map((r, i) => (
            <TouchableWithoutFeedback onPress={() => showHideDropDowns(r.value, r.text)} key={i} style={{
                borderBottomColor: props.activeTheme.lightGrey,
                height: 50,
                justifyContent: "space-between",
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: i === (data.length - 1) ? 0 : 1,

            }}>
                <Text style={{ paddingLeft: 10, color: r.text === state.addressText ? props.activeTheme.default : '#000' }}>{r.text}</Text>
                <View style={{ paddingRight: 10 }} >
                    <SvgXml xml={r.icon(props.activeTheme.default)} height={30} width={30} />
                </View>
            </TouchableWithoutFeedback>
        ));
    }
    const addUpdateAddressApi = () => {
        // sharedValidateAllProperties({ ...state.selectedRegion }, ['addressID'])
        postRequest(
            `/api/Menu/Address/AddOrUpdate`,
            state.selectedRegion,
            {},
            props.dispatch,
            async (res) => {
                await AsyncStorage.removeItem("customerOrder_predefinedPlaces");
                CustomToast.success(res.data.message);
                props.navigation.navigate("addresses_list");
                // navigateWithResetScreen(0, [{ name: "addresses_list" }])
            },
            err => console.log(err),
            '',
            true)
    };
    useEffect(() => {
        if (state.showHideDropDownsBool) {
            scrollRef?.current?.scrollToEnd({ animated: true });
        }
    }, [state.showHideDropDownsBool]);
    useEffect(useCallback(() => {
        // console.log("AddOrEditAddress.useCallback")
        sharedGetCustomerAddressesHandler(getRequest,
            response => {
                if (response.data.statusCode === 200) setState(copyState => ({ ...copyState, predefinedPlaces: response.data.smAddresses }));
                else setState(copyState => ({ ...copyState, predefinedPlaces: [], noRecordFound: 'No Record Found' }));
            }, err => {
                setState(copyState => ({ ...copyState, predefinedPlaces: [], noRecordFound: 'No Record Found' }));
            });
        return () => {
            console.log("Addresses.AddOrEditAddress state cleared----")
            setState(initState);
        }
    }, []), []);
    // console.log('StatusBar :', StatusBar.currentHeight);

    return (
        <>
            <CustomMapView
                handlePressOnMap={(e) => {
                    e.persist();
                    // setState(pre => ({ ...pre, restrict: false }));
                    mapRef?.current.animateToRegion({ ...e.nativeEvent.coordinate, latitudeDelta: CONSTANTLATDELTA, longitudeDelta: CONSTANTLONGDELTA });
                }}
                restrict={state.restrict}
                overrideFirstRenderMap={!state.firstRenderMap}
                mapRef={mapRef}
                pinRegion={state.selectedRegion}
                setPinRegion={setPinRegion}
                constantLatDelta={CONSTANTLATDELTA}
                constantLongDelta={CONSTANTLONGDELTA}
                editMode={Object.keys(currentRoute).length ? true : false}
                firstRenderMap={state.firstRenderMap}
                parentSetStateHandler={setState}
                parentState={state}
                marketTitle={state.selectedRegion.title}
                interactibleMap={true}
                markerRef={markerRef}
                showMarkupObj={{
                    withStyles: false,
                    count: '0'
                }}
                top={(Dimensions.get('window').height * 0.5) - 185}
                onTouchStart={() => setState(pre => ({ ...pre, restrict: false }))}
            />
            <View style={{
                width: '100%',
                marginTop: 4,
                position: "absolute",
                top: StatusBar.currentHeight || 35,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <TouchableOpacity style={{
                    "left": 5,
                    "backgroundColor": '#fff', "elevation": 3, "borderRadius": 7, "width": 35,
                    "height": 35, "shadowColor": "#000",
                    "marginLeft": plateformSpecific(5, 10),
                    "borderColor": '#fff',
                    "alignItems": "center", "justifyContent": "center"
                }}
                    onPress={() => props.navigation.navigate("addresses_list")}
                    activeOpacity={0.5}
                >
                    <SvgXml xml={closeIcon} height={15} width={15} />
                </TouchableOpacity>
                <View />
            </View>
            <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 15, borderTopRightRadius: 15, flex: Platform.select({ ios: 1, android: 0 }), height: Dimensions.get('window').height * 0.5, }} >
                <ScrollView style={{ flex: 1, paddingHorizontal: 15 }} ref={scrollRef} keyboardShouldPersistTaps="always">
                    <View style={{ paddingHorizontal: 15 }}>
                        <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                            {"Location"}
                        </Text>
                        <TouchableOpacity style={{
                            // padding: 10,
                            borderWidth: 1,
                            borderRadius: 5,
                            borderColor: 'rgba(0,0,0,0.1)',
                            backgroundColor: 'transparent',
                            height: 70,
                            justifyContent: "center",
                            // alignItems: 'center',
                            // flexDirection: 'row'
                        }}
                            onPress={selectLocation}
                        >
                            <Text style={{ padding: 10 }}>{state.selectedRegion.title || "Fetching current location..."}</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Input */}
                    <View style={{ paddingHorizontal: 15 }}>
                        <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                            {"Note"}
                        </Text>
                        <TextInput style={{
                            paddingHorizontal: 12,
                            borderWidth: 1,
                            borderRadius: 5,
                            borderColor: state.focusedField === 'note' ? props.activeTheme.default : 'rgba(0,0,0,0.1)',
                            backgroundColor: 'transparent',
                            height: 50,
                            justifyContent: "space-between",
                            alignItems: 'center',
                            flexDirection: 'row'
                        }}
                            placeholder="Description"
                            value={state.selectedRegion.note}
                            onChangeText={txt => setState(pre => ({
                                ...pre, selectedRegion: {
                                    ...pre.selectedRegion,
                                    note: txt
                                }
                            }))}
                            onFocus={e => setState(pre => ({ ...pre, focusedField: 'note' }))}
                            onBlur={e => setState(pre => ({ ...pre, focusedField: '' }))}
                        />
                    </View>
                    <View style={{ paddingHorizontal: 15, paddingBottom: state.showHideDropDownsBool ? 0 : 10 }}>
                        <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 1), { paddingVertical: 10, left: 3 }]}>
                            {"Label as"}
                        </Text>
                        <View style={{
                            paddingHorizontal: 12,
                            borderWidth: 1,
                            borderRadius: 5,
                            borderColor: 'rgba(0,0,0,0.1)',
                            backgroundColor: 'transparent',
                            height: 50,
                            justifyContent: "space-between",
                            alignItems: 'center',
                            flexDirection: 'row'
                        }}>
                            <TouchableOpacity onPress={() => showHideDropDowns(null, null)} style={{ maxWidth: '95%', minWidth: '90%' }}>
                                <Text>{state.addressText || "Choose your label as"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {
                        state.showHideDropDownsBool ?
                            <View style={{
                                marginHorizontal: 15,
                                marginBottom: 10,
                                justifyContent: 'center',
                                // elevation: 0.5,
                                borderColor: props.activeTheme.lightGrey,
                                borderWidth: 1,
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10
                            }}>
                                {renderSelectionList()}
                            </View>
                            :
                            null
                    }
                </ScrollView>
                <DefaultBtn
                    title="Save"
                    disabled={sharedValidateAllProperties({ ...state.selectedRegion }, ['addressID', 'note', 'addressTypeStr']) ? false : true}
                    backgroundColor={sharedValidateAllProperties({ ...state.selectedRegion }, ['addressID', 'note', 'addressTypeStr']) ? props.activeTheme.default : props.activeTheme.lightGrey}
                    onPress={addUpdateAddressApi}
                />
            </View>
        </>
    );
};