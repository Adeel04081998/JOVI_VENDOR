import React, { useEffect, useState, useRef, createRef, memo, useLayoutEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image, StatusBar } from 'react-native';
import closeIcon from '../../assets/svgIcons/common/cross-new.svg';
import { SvgXml } from 'react-native-svg';
import plateformSpecific from '../../utils/plateformSpecific';
import commonStyles from '../../styles/styles';
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import locateMeIcon from "../../assets/svgIcons/customerorder/locate-ico.svg";
import { sahredConvertIntoSubstrings, sharedAnimateToCurrentLocation, sharedGetCustomerAddressesHandler, sharedTakeMapSnapshot } from '../../utils/sharedActions';
import { CONSTANTLATDELTA, CONSTANTLONGDELTA, HAS_NOTCH } from '../../config/config';
import CustomMapView from '../../components/mapview/CustomMapView';
import CustomLocationSearch from '../../components/locationSearch/CustomLocationSearch';
import { closeModalAction } from '../../redux/actions/modal';
import { postRequest, getRequest } from '../../services/api';
import CustomToast from '../../components/toast/CustomToast';
import locationIcon from "../../assets/location_ico.png";
import crossIcon from "../../assets/add_ico.png";
import DefaultBtn from '../../components/buttons/DefaultBtn';
import SmallLoader from '../../components/loader/SmallLoader';


export const MemoisedRFC = memo((props) => {
    return <CustomLocationSearch {...props} />
}, (prevProps, nextProps) => prevProps !== nextProps);

export default function SelectDropOfLocation(props) {
    // console.log('SelectDropOfLocation.Props :', props);
    // console.log('SelectDropOfLocation. NavState :', props.navigation.dangerouslyGetState());
    let parentIndex = props.navigation.dangerouslyGetState().index,
        nestingIndex = props.navigation.dangerouslyGetState().routes[parentIndex].state.index,
        parentRoute = props.navigation.dangerouslyGetState().routes[parentIndex].state.routes[nestingIndex],
        currentRoute = parentRoute?.params?.data || {};
    // console.log('currentRoute :', currentRoute);
    // lastIndex = parentRoute?.state?.index,
    // currentRoute = (parentRoute?.state?.routes[lastIndex].params && parentRoute?.state?.routes[lastIndex]?.params?.data) ? parentRoute?.state?.routes[lastIndex]?.params?.data : {}
    // let currentRoute = {};
    let initState = {
        "predefinedPlaces": [],
        "firstRenderMap": false,
        "hideBottomView": false,
        "renderCustomLocation": true,
        "noRecordFound": null,
        "selectedRegion": {
            "addressID": currentRoute?.addressID || 0,
            "title": currentRoute?.title || "",
            "latitude": currentRoute?.latitude || 0,
            "longitude": currentRoute?.longitude || 0,
            "latitudeDelta": currentRoute?.latitudeDelta || 0.00,
            "longitudeDelta": currentRoute?.longitudeDelta || 0.00,
        }
    }
    const [state, setState] = useState(initState);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    let locationTextRef = createRef(null);
    const setPinRegion = (newRegion, title) => {
        setState(prevState => ({
            ...prevState, selectedRegion: {
                ...prevState.selectedRegion,
                ...newRegion
            }
        }));
    }
    const onSelectLocationHandler = data => {
        if (!data || data === null) return;
        setState(prevState => ({
            ...prevState,
            renderCustomLocation: false,
            firstRenderMap: false,
            selectedRegion: {
                ...prevState.selectedRegion,
                addressID: data.addressID || null,
                title: data.title,
                latitude: data.latitude,
                longitude: data.longitude,
                latitudeDelta: data.latitudeDelta,
                longitudeDelta: data.longitudeDelta
                // latitudeDelta: data.latitudeDelta ? data.latitudeDelta : CONSTANTLATDELTA,
                // longitudeDelta: data.longitudeDelta ? data.longitudeDelta : CONSTANTLONGDELTA

            }
        }));
        props.dispatch(closeModalAction());
        mapRef.current && mapRef.current.animateToRegion({
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: data.latitudeDelta ? data.latitudeDelta : CONSTANTLATDELTA,
            longitudeDelta: data.longitudeDelta ? data.longitudeDelta : CONSTANTLONGDELTA
        });
    };
    const gotoMapLocationPicker = () => {
        props.navigation.navigate("map_location_picker_container", {
            screen: "map_location_picker",
            cb: data => {
                locationTextRef.current && locationTextRef.current.refs.textInput.setNativeProps({ text: data.title || "" });
                onSelectLocationHandler(data);
            },
            backScreenObj: {
                container: "wallet_container",
                screen: "select_dropof_location"
            },
        });
    };
    const goBackToCashoutScreen = async (action) => {
        if (action === 'back') {
            props.route.state.routes[props.route.state.index].params.cb && props.route.state.routes[props.route.state.index].params.cb(null);
            props.navigation.navigate("wallet_container", { screen: "wallet_child_container", data: null, doServerStuff: null })
        }
        else {
            setState(pre => ({ ...pre, hideBottomView: true }));
            try {
                setTimeout(async () => {
                    // markerRef.current && markerRef.current.showCallout();
                    const snapshot = await sharedTakeMapSnapshot(mapRef);
                    // markerRef.current && markerRef.current.hideCallout();
                    // console.log("data:image/jpg;base64," + snapshot);
                    props.route.state.routes[props.route.state.index].params.cb && props.route.state.routes[props.route.state.index].params.cb({ ...state.selectedRegion, cashoutImage: snapshot });
                    props.navigation.navigate("wallet_container", { screen: "wallet_child_container", data: null, doServerStuff: { ...state.selectedRegion, cashoutImage: snapshot } });
                }, 0);
            } catch (error) {
                console.log(error);
            }
        }
    };
    const renderInputRightIcons = () => {
        let iconsArrUI = [{
            icon: locationIcon,
            handler: () => {
                gotoMapLocationPicker();
            },
            imgStyles: {
                // padding: 10,
                width: 22,
                height: 22,
                borderColor: props.activeTheme.default,


            }
        }];
        if (state.selectedRegion.title) {
            iconsArrUI.unshift({
                icon: crossIcon,
                handler: () => {
                    locationTextRef.current && locationTextRef.current.refs.textInput.setNativeProps({ text: "" });
                    setState(pre => ({
                        ...pre, selectedRegion: {
                            ...pre.selectedRegion,
                            title: ""
                        }
                    }))
                },
                imgStyles: {
                    // padding: 10,
                    width: 22,
                    height: 22,
                    borderColor: props.activeTheme.default,
                    transform: [{ rotate: '45deg' }]
                }
            })
        };
        return iconsArrUI.map((item, i) => (
            <TouchableOpacity key={i} style={{
                marginLeft: i > 0 ? 5 : 0,
            }}
                activeOpacity={100}
                onPress={item.handler}
            >
                <Image style={item.imgStyles} source={item.icon} />
            </TouchableOpacity>
        ))
    }
    useEffect(() => {
        // console.log('effect called');
        sharedGetCustomerAddressesHandler(getRequest,
            response => {
                if (response.data.statusCode === 200) setState(copyState => ({ ...copyState, predefinedPlaces: response.data.smAddresses }));
                else setState(copyState => ({ ...copyState, predefinedPlaces: [], noRecordFound: 'No Record Found' }));
            }, err => {
                setState(copyState => ({ ...copyState, predefinedPlaces: [], noRecordFound: 'No Record Found' }));
            }
        );
        // if (currentRoute.title) return;
        // else {
        //     sharedAnimateToCurrentLocation(mapRef, null, {});
        //     sharedGetCustomerAddressesHandler(getRequest,
        //         response => {
        //             if (response.data.statusCode === 200) setState(copyState => ({ ...copyState, predefinedPlaces: response.data.smAddresses }));
        //             else setState(copyState => ({ ...copyState, predefinedPlaces: [], noRecordFound: 'No Record Found' }));
        //         }, err => {
        //             setState(copyState => ({ ...copyState, predefinedPlaces: [], noRecordFound: 'No Record Found' }));
        //         }
        //     );
        // }
        return () => {
            console.log("SelectDropOfLocation state cleared----")
            setState(initState);
        }
    }, []);

    // useLayoutEffect(() => {
    //     console.log('useLayoutEffect called');
    //     if (currentRoute.title) return;
    //     sharedAnimateToCurrentLocation(mapRef, null, {
    //         timeout: 20000,
    //         maximumAge: 100000,
    //         enableHighAccuracy: true,
    //     });
    // }, []);

    // console.log('SelectDropOfLocation.State :', state);
    return (
        <>
            <CustomMapView
                cashoutScreen={true}
                handlePressOnMap={gotoMapLocationPicker}
                // Commented for location picker service on this screen in future
                // handlePressOnMap={e => {
                //     e.persist();
                //     mapRef?.current.animateToRegion({ ...e.nativeEvent.coordinate, latitudeDelta: CONSTANTLATDELTA, longitudeDelta: CONSTANTLONGDELTA })
                // }}
                restrict={false}
                overrideFirstRenderMap={false}
                mapRef={mapRef}
                markerRef={markerRef}
                pinRegion={state.selectedRegion}
                setPinRegion={setPinRegion}
                constantLatDelta={CONSTANTLATDELTA}
                constantLongDelta={CONSTANTLONGDELTA}
                editMode={Object.keys(currentRoute).length ? true : false}
                firstRenderMap={state.firstRenderMap}
                marketTitle={state.selectedRegion.title}
                parentSetStateHandler={setState}
                interactibleMap={false}
                showMarkupObj={{
                    withStyles: true,
                    count: '1'
                }}
                top={(Dimensions.get('window').height * 0.5) - 220}
                onMapReady={() => {
                    if (currentRoute.title) return;
                    else sharedAnimateToCurrentLocation(mapRef, null, {
                        timeout: 20000,
                        maximumAge: 100000,
                        enableHighAccuracy: true,
                    });
                }}

            />
            <View style={{
                width: '100%',
                marginTop: 4,
                position: "absolute",
                top: StatusBar.currentHeight,
                margin: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',

            }}>
                <TouchableOpacity style={{
                    left: 5,
                    backgroundColor: '#fff',
                    elevation: 3,
                    borderRadius: 7,
                    width: 35,
                    height: 35,
                    shadowColor: "#000",
                    marginLeft: plateformSpecific(5, 10),
                    borderColor: '#fff',
                    alignItems: "center", "justifyContent": "center",
                    bottom: 10
                }}
                    onPress={() => goBackToCashoutScreen('back')}
                >
                    <SvgXml xml={closeIcon} height={15} width={15} />
                </TouchableOpacity>
            </View>
            {
                state.hideBottomView ? <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator style={{ paddingHorizontal: 10 }} size="large" color={props.activeTheme.default} />
                </View>
                    :
                    (!state.predefinedPlaces.length && state.noRecordFound === null) ?
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <SmallLoader isActivityIndicator={true} size="large" color={props.activeTheme.default} />
                        </View>
                        :
                        <KeyboardAvoidingView style={{ position: 'relative', backgroundColor: "#fff", borderTopLeftRadius: 15, borderTopRightRadius: 15, flex: Platform.select({ ios: props.stackState.keypaidOpen ? 3 : state.renderCustomLocation ? 1 : 0, android: 0 }), height: Dimensions.get('window').height * (state.renderCustomLocation ? 0.5 : 0.25) }} behavior={Platform.select({ ios: "padding", android: null })}>
                            {
                                state.renderCustomLocation ?
                                    <MemoisedRFC {...props} {...state} locationTitle={state.selectedRegion.title} locationTextRef={locationTextRef} onSelectLocation={data => onSelectLocationHandler(data)} gotoMapLocationPicker={gotoMapLocationPicker} />
                                    :
                                    <View style={{ paddingHorizontal: 15, bottom: 10, flex: 1 }}>
                                        <Text style={[commonStyles.fontStyles(14, props.activeTheme.black, 3), { left: 5, top: 10, paddingVertical: 10 }]}>
                                            {"Drop off location"}
                                        </Text>
                                        <View style={{
                                            paddingHorizontal: 12,
                                            borderWidth: 1,
                                            borderRadius: 5,
                                            borderColor: 'rgba(0,0,0,0.1)',
                                            backgroundColor: 'transparent',
                                            minHeight: 60,
                                            justifyContent: "space-between",
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            top: 10
                                        }}>
                                            <TouchableOpacity onPress={() => setState(pre => ({ ...pre, renderCustomLocation: true }))}>
                                                <Text style={{
                                                    fontSize: 14,
                                                    justifyContent: "flex-start",
                                                    minWidth: "80%",
                                                    opacity: state.selectedRegion.title ? 1 : 0.5
                                                }}>{sahredConvertIntoSubstrings(state.selectedRegion.title, 38, 0, 38) || "Drop off location"}</Text>
                                            </TouchableOpacity>
                                            <View style={{ flexDirection: 'row', left: 5, justifyContent: 'flex-end', paddingVertical: 10 }}>
                                                {renderInputRightIcons()}
                                            </View>

                                        </View>
                                    </View>
                            }

                            <DefaultBtn
                                title="Save and continue"
                                // this
                                disabled={state.selectedRegion.title ? false : true}
                                // disabled={false}
                                // this
                                backgroundColor={state.selectedRegion.title ? props.activeTheme.default : props.activeTheme.lightGrey}
                                // backgroundColor={props.activeTheme.default}
                                onPress={goBackToCashoutScreen}
                            />
                        </KeyboardAvoidingView>
            }



        </>
    )
}



