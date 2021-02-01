import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, View, Dimensions, Platform, Text, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Directions from "react-native-maps-directions";
import Geocoder from "react-native-geocoding";
import { SENDING_LOCATIONS_ENABLED, GOOGLE_API_KEY } from '../../../config/config';
import { SvgXml } from "react-native-svg";
import finalDestIcon from '../../../assets/svgIcons/customerorder/finalDestIcon_Flag1.svg';
import { styles } from "../../customerorder/MapCustomer";
import { getHubConnectionInstance, getAppLocationInstance, setUnsubscribeFromLocationUpdates, setLastRecordedLocation, getLastRecordedLocation, handleBackgroundLocationForRider, setIsForceTurnOnLocDialogVisible, getIsForceTurnOnLocDialogVisible } from '../../../utils/sharedActions';

Geocoder.init(GOOGLE_API_KEY);

const MapRider = ({ mapRef, pitstops, mode, notifyOfFirstLoadAfterLocation, userObj, orderID, activePitstopIndex, handlePressOnMap, orderAllocatedCollapsed, chatVisible, constantLatDelta, constantLongDelta }) => {

    const lastValue_IsActive = useRef(null);
    const lastValue_Mode = useRef(null);
    const lastValue_orderID = useRef(null);

    const regionPakistan = {
        latitude: 25.96146850382255,
        latitudeDelta: 24.20619842968337,
        longitude: 69.89856876432896,
        longitudeDelta: 15.910217463970177
    };

    const initState = {
        isFirstLoadAfterLocation: true
    };

    const [state, setState] = useState(initState);

    // EOS: End Of State

    useEffect(() => {
        animateToCurrentLocation();
    }, []);

    useEffect(() => {
        if (pitstops && pitstops.length /*&& (pitstops.filter(item => item.lastChanged)[0] || pitstops.length > 1)*/
            && (mode === "orderAllocated")) {

            fitToPitstopMarkers();
        }
    }, [pitstops]);

    useEffect(() => {
        if (mode === "orderAllocated") {
            fitToPitstopMarkers();
        }
    }, [mode, orderAllocatedCollapsed, chatVisible]);

    // console.log("MAP_PROPS: ", pitstops, mode);

    const onLocationChangedOnMap = (event) => {
        const locationFromMap = {
            latitude: event.nativeEvent.coordinate.latitude,
            latitudeDelta: constantLatDelta,
            longitude: event.nativeEvent.coordinate.longitude,
            longitudeDelta: constantLongDelta,
        };

        if (state.isFirstLoadAfterLocation) {
            animateToCurrentLocation(() => {
                notifyOfFirstLoadAfterLocation();
            });
            setState((prevState) => ({ ...prevState, isFirstLoadAfterLocation: false }));
        }

        if (
            (lastValue_IsActive.current === null && lastValue_Mode.current === null && lastValue_orderID.current === null)
            ||
            (lastValue_IsActive.current !== userObj.isActive || lastValue_Mode.current !== mode || lastValue_orderID.current !== orderID)
        ) {
            // console.log(userObj.isActive, mode, orderID);
            lastValue_IsActive.current = userObj.isActive;
            lastValue_Mode.current = mode;
            lastValue_orderID.current = orderID;

            if (SENDING_LOCATIONS_ENABLED) {
                let unsubscribe = getAppLocationInstance(true)?.subscribeToLocationUpdates((updatedLocationArr) => {
                    if (userObj.isActive) {
                        const locObj = {
                            latitude: updatedLocationArr[0].latitude,
                            latitudeDelta: constantLatDelta,
                            longitude: updatedLocationArr[0].longitude,
                            longitudeDelta: constantLongDelta,
                            rotation: updatedLocationArr[0].course,
                            timestamp: updatedLocationArr[0].timestamp
                        };

                        const lastLocObj = getLastRecordedLocation();
                        if (lastLocObj === null || (locObj.latitude !== lastLocObj.latitude || locObj.longitude !== lastLocObj.longitude || locObj.rotation !== lastLocObj.rotation)) {

                            if (mode !== "noInternet") {
                                setLastRecordedLocation(locObj);

                                if (orderID) {
                                    getHubConnectionInstance()?.invoke("RealtimeCoordinates", locObj.latitude, locObj.latitudeDelta, locObj.longitude, locObj.longitudeDelta, locObj.rotation.toString(), orderID, (userObj?.userID ? userObj.userID : ""))
                                        .then((hubRes) => {
                                            console.log(`INVOKED -> 'RealtimeCoordinates' :`, [locObj.latitude.toString(), locObj.latitudeDelta.toString(), locObj.longitude.toString(), locObj.longitudeDelta.toString(), locObj.rotation.toString(), orderID, (userObj?.userID ? userObj.userID : "")]);
                                        })
                                        .catch((hubErr) => {
                                            console.log("Error while invoking 'RealtimeCoordinates':", hubErr);
                                        });
                                }
                            }
                            else {
                                console.log("INVOKE SKIPPED -> No Internet!");
                            }
                        }
                        else {
                            console.log("INVOKE SKIPPED -> Same Location sent previously / Not a Significant Location update!");
                        }
                    }
                    else {
                        console.log("INVOKE SKIPPED -> Status Offline!");
                    }
                });
                setUnsubscribeFromLocationUpdates(unsubscribe);

                handleBackgroundLocationForRider(
                    userObj.isActive,
                    (updatedLocation) => {
                        // console.log(updatedLocation); 
                    },
                    true, // Can be changed to "false" later
                );
            }
        }
    };

    const fitToPitstopMarkers = () => {
        // mapRef.current.animateToRegion(pitstops.filter(item => item.lastChanged)[0]);
        if (pitstops.length === 1) {
            if (pitstops[0].latitude) {
                mapRef.current.animateToRegion(pitstops[0]);
            }
            else {
                if (mode === "orderAllocated") {
                    mapRef.current.animateToRegion(regionPakistan);
                }
                else {
                    animateToCurrentLocation();
                }
            }
        }
        else {
            if (pitstops.filter(item => item.latitude).length === pitstops.length) {
                let markers = pitstops.map((item, index) => ("marker" + (index + 1)));
                markers.push("marker-dest");
                mapRef.current.fitToSuppliedMarkers(markers, {
                    edgePadding:
                    {
                        top: 300,
                        right: 100,
                        bottom: 600,
                        left: 100
                    },
                    animated: true
                });
            }
        }
    };

    const animateToCurrentLocation = (cbSuccess) => {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            mapRef.current && mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: constantLatDelta,
                longitudeDelta: constantLongDelta
            });
            cbSuccess && cbSuccess();
        }, (error) => {
            mapRef.current && mapRef.current.animateToRegion(regionPakistan);
            // Alert.alert("Location Unavailable!", "Location is either turned off or not responding!");
        }, {
            timeout: 3000,
            // enableHighAccuracy: true,
            // maximumAge: 1000,
        });
    };

    let initialRegionProp = {};
    if (state.isFirstLoadAfterLocation) {
        initialRegionProp = {
            initialRegion: regionPakistan
        };
    }

    return (
        <View style={styles.container}>
            <MapView
                onUserLocationChange={onLocationChangedOnMap}
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                // region={pinRegion ? null : regionPakistan}
                {...initialRegionProp}
                onPress={(mode === "noInternet" || mode === "riderHome" || mode === "orderAllocated") ?
                    handlePressOnMap
                    :
                    () => { }
                }
                style={{ ...styles.map, opacity: (mode === "noInternet" ? 0.35 : 1) }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                followsUserLocation={true}
                zoomControlEnabled={false}
                showsCompass={false}
                mapPadding={{
                    bottom: 0
                }}
                pitchEnabled={(mode === "noInternet" || (mode === "orderAllocated" && (!orderAllocatedCollapsed || chatVisible))) ? false : true}
                rotateEnabled={(mode === "noInternet" || (mode === "orderAllocated" && (!orderAllocatedCollapsed || chatVisible))) ? false : true}
                scrollEnabled={(mode === "noInternet" || (mode === "orderAllocated" && (!orderAllocatedCollapsed || chatVisible))) ? false : true}
                zoomEnabled={(mode === "noInternet" || (mode === "orderAllocated" && (!orderAllocatedCollapsed || chatVisible))) ? false : true}
                loadingEnabled={true}
            >

                {pitstops.map((item, index) => (
                    (item && item.latitude) ?
                        (item.isDestinationPitstop || (mode === "orderAllocated" && index === pitstops.length - 1)) ?
                            <Marker identifier={"marker-dest"} key={index} coordinate={item} anchor={{ x: 0.25, y: 1 }} style={{ zIndex: null }}>
                                <SvgXml xml={finalDestIcon} width={40} height={40} />
                            </Marker>
                            :
                            <Marker identifier={("marker" + (index + 1))} key={index} coordinate={item} anchor={{ x: 0.5, y: 1 }} style={{ zIndex: null }}>
                                <View style={{ ...styles.pitStopMarker, borderColor: "#7359BE" }}>
                                    <Text style={{ ...styles.pitStopMarkerText, color: "#7359BE" }}>{index + 1}</Text>
                                </View>
                            </Marker>
                        :
                        null
                ))}

                {mode === "orderAllocated" && activePitstopIndex <= pitstops.length - 2 &&
                    <Directions
                        key={activePitstopIndex}
                        origin={pitstops[activePitstopIndex]}
                        destination={pitstops[activePitstopIndex + 1]}
                        apikey={GOOGLE_API_KEY}
                        strokeWidth={3.5}
                        strokeColor="#000"
                        optimizeWaypoints={false}
                        mode="DRIVING"
                        onStart={(param) => { }}
                        onReady={(param) => { }}
                        onError={(error) => { }}
                    />
                }

                {/* {mode === "verifyOrder" && pitstops.length >= 2 - (1) &&
                    pitstops.map((item, index) => {
                        if (index < pitstops.length - 1) {
                            return (
                                <Directions
                                    key={index}
                                    origin={pitstops[index]}
                                    destination={pitstops[index + 1]}
                                    apikey={GOOGLE_API_KEY}
                                    strokeWidth={3.5}
                                    strokeColor="#000"
                                    optimizeWaypoints={false}
                                    mode="DRIVING"
                                    onStart={(param) => { }}
                                    onReady={(param) => { }}
                                    onError={(error) => { }}
                                />
                            );
                        }
                        else {
                            return (
                                <Directions
                                    key={index}
                                    origin={pitstops[pitstops.length - 1]}
                                    destination={finalDestObj}
                                    apikey={GOOGLE_API_KEY}
                                    strokeWidth={3.5}
                                    strokeColor="#000"
                                    optimizeWaypoints={false}
                                    mode="DRIVING"
                                    onStart={(param) => { }}
                                    onReady={(param) => { }}
                                    onError={(error) => { }}
                                />
                            );
                        }
                    })
                } */}

            </MapView>

        </View >
    )
}

export default MapRider;
