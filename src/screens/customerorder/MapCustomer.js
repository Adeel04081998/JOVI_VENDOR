import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Dimensions, Platform, Text, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Directions from "react-native-maps-directions";
import Geocoder from "react-native-geocoding";
import { GOOGLE_API_KEY } from '../../config/config';
import { SvgXml } from "react-native-svg";
import pinIcon from '../../assets/svgIcons/common/pin.svg';
import finalDestIcon from '../../assets/svgIcons/customerorder/finalDestIcon_Flag1.svg';
import { locRiderIcon_Front, locRiderIcon_Top1, locRiderIcon_Top2 } from '../../assets/svgIcons/customerorder/riderallocated';

Geocoder.init(GOOGLE_API_KEY);

const MapCustomer = ({ mapRef, pitstops, mode, activeTheme, pinRegion, setPinRegion, handlePressOnMap, isOrderOpenedFromHome, orderVerifyCollapsed, finalDestObj, isFinalDestOpened, riderLocation, constantLatDelta, constantLongDelta }) => {

    const regionPakistan = {
        latitude: 25.96146850382255,
        latitudeDelta: 24.20619842968337,
        longitude: 69.89856876432896,
        longitudeDelta: 15.910217463970177
    };

    useEffect(() => {
        animateToCurrentLocation();
    }, []);

    useEffect(() => {
        if (pitstops && pitstops.length /*&& (pitstops.filter(item => item.lastChanged)[0] || pitstops.length > 1)*/
            && (mode === "pitstops" || mode === "pitstopDetails" || mode === "paymentPitstopDetails" || mode === "orderPitstopDetails" || mode === "riderAllocated" || mode === "destPitstopDetails")) {

            fitToPitstopMarkers();
        }
    }, [pitstops]);

    useEffect(() => {
        if (mode === "pinRegion") {
            // onRegionChange(mapRef.current.__lastRegion);
            // findAndDisplayLocation(mapRef.current.__lastRegion);
            if (mapRef.current.__lastRegion) {
                onRegionChange(mapRef.current.__lastRegion);
                mapRef.current.animateToRegion(mapRef.current.__lastRegion);
            }
        }
        else if (mode === "verifyOrder") {
            fitToPitstopMarkers();
        }
    }, [mode, orderVerifyCollapsed]);

    // console.log("MAP_PROPS: ", pitstops, mode);



    const fitToPitstopMarkers = () => {
        // mapRef.current.animateToRegion(pitstops.filter(item => item.lastChanged)[0]);
        if (pitstops.length === 1 && (mode !== "verifyOrder")) {
            if (pitstops[0].latitude) {
                mapRef.current.animateToRegion(pitstops[0]);
            }
            else {
                if (mode === "riderAllocated") {
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
                        top: (Platform.OS === "android" ? 300 : 150),
                        right: 100,
                        bottom:
                            (mode === "pitstops") ?
                                (pitstops.length <= 2) ?
                                    (Platform.OS === "android" ? 750 : 300)
                                    :
                                    (Platform.OS === "android" ? 950 : 400)
                                :
                                (mode === "riderAllocated") ?
                                    (Platform.OS === "android" ? 600 : 300)
                                    :
                                    (mode === "verifyOrder") ?
                                        300
                                        :
                                        (Platform.OS === "android" ? 1200 : 450),
                        left: 100
                    },
                    animated: true
                });
            }
        }
    };

    const animateToCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            mapRef.current && mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: constantLatDelta,
                longitudeDelta: constantLongDelta
            });
        }, (error) => {
            mapRef.current && mapRef.current.animateToRegion(regionPakistan);
            Alert.alert("Location Unavailable!", "Location is either turned off or not responding!");
        }, {
            timeout: 3000,
            // enableHighAccuracy: true,
            // maximumAge: 1000,
        });
    };

    const onRegionChange = (newRegion) => {
        setPinRegion(newRegion, "Fetching Address...");
    };

    const findAndDisplayLocation = async (newRegion) => {
        try {
            const geoCoderResponse = await Geocoder.from({
                latitude: newRegion.latitude,
                longitude: newRegion.longitude
            });

            if (geoCoderResponse) {
                const address = geoCoderResponse.results[0].formatted_address;
                const location = address.substring(0, address.indexOf(","));
                setPinRegion(null, address);
            }
        }
        catch (exp) {
            setPinRegion(null, "Error while Fetching Address!");
        }
    };

    let initialRegionProp = {};
    if (isOrderOpenedFromHome || (isFinalDestOpened && !pitstops?.[0]?.latitude)) {
        initialRegionProp = {
            initialRegion: regionPakistan
        };
    }

    const iosOffsetForPinTop = (pitstops.filter(item => item.latitude).length <= 1 ? 150 + 22 : 0 + 22);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                // region={pinRegion ? null : regionPakistan}
                {...initialRegionProp}
                onPress={(mode === "enterPitstop" || mode === "pitstopDetails" || mode === "paymentPitstopDetails" || mode === "orderPitstopDetails" || mode === "verifyOrder" || mode === "destPitstopDetails") ?
                    handlePressOnMap
                    :
                    (event) => {
                        event.persist();
                        if (mode === "pinRegion") {
                            const newCoordinates = event.nativeEvent.coordinate;
                            mapRef.current.animateToRegion({ ...newCoordinates, latitudeDelta: constantLatDelta, longitudeDelta: constantLongDelta });
                        }
                    }
                }
                style={styles.map}
                onRegionChange={mode === "pinRegion" ? onRegionChange : null}
                onRegionChangeComplete={mode === "pinRegion" ? findAndDisplayLocation : null}
                showsUserLocation={true}
                showsMyLocationButton={false}
                followsUserLocation={true}
                zoomControlEnabled={false}
                showsCompass={false}
                mapPadding={{
                    bottom:
                        (Platform.OS === "android" && (mode === "pitstops" || mode === "pitstopDetails" || mode === "destPitstopDetails")) ?
                            300
                            :
                            (Platform.OS === "ios" && pitstops.filter(item => item.latitude).length <= 1) ?
                                150
                                :
                                0
                }}
                pitchEnabled={(mode === "verifyOrder" && !orderVerifyCollapsed) ? false : true}
                rotateEnabled={(mode === "verifyOrder" && !orderVerifyCollapsed) ? false : true}
                scrollEnabled={(mode === "verifyOrder" && !orderVerifyCollapsed) ? false : true}
                zoomEnabled={(mode === "verifyOrder" && !orderVerifyCollapsed) ? false : true}
                loadingEnabled={true}
            >

                {pitstops.map((item, index) => (
                    (item && item.latitude) ?
                        (item.isDestinationPitstop || (mode === "riderAllocated" && index === pitstops.length - 1)) ?
                            <Marker identifier={"marker-dest"} key={index} coordinate={item} anchor={{ x: 0.25, y: 1 }} style={{ zIndex: Platform.OS === "ios" ? (100 + index) : null, opacity: (item.timeEnd) ? 0.35 : 1 }}>
                                <SvgXml xml={finalDestIcon} width={40} height={40} />
                            </Marker>
                            :
                            <Marker identifier={("marker" + (index + 1))} key={index} coordinate={item} anchor={{ x: 0.46, y: 0.7 }} /* anchor={{ x: 0.5, y: 1 }} */ style={{ zIndex: Platform.OS === "ios" ? (100 + index) : null, opacity: (item.timeEnd) ? 0.35 : 1 }}>
                                <View style={{ ...styles.pitStopMarker, borderColor: /* item.isPaymentPitstop ? "#1cb258" : */ "#7359BE" }}>
                                    <Text style={{ ...styles.pitStopMarkerText, color: /* item.isPaymentPitstop ? "#1cb258" : */ "#7359BE" }}>{index + 1}</Text>
                                </View>
                            </Marker>
                        :
                        null
                ))}

                {mode === "verifyOrder" &&
                    <Marker identifier={"marker-dest"} coordinate={finalDestObj} anchor={{ x: 0.25, y: 1 }} style={{ zIndex: Platform.OS === "ios" ? (100 + (pitstops.length + 1)) : null }}>
                        <SvgXml xml={finalDestIcon} width={40} height={40} />
                    </Marker>
                }

                {/* {mode === "pinRegion" && pinRegion && pinRegion.latitude &&
                    <Marker coordinate={pinRegion} anchor={{ x: 0.5, y: 1 }} />
                } */}

                {mode === "verifyOrder" && pitstops.length >= 2 - (1) &&
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
                }

                {mode === "riderAllocated" && riderLocation && riderLocation.latitude &&
                    <Marker identifier={"marker-rider"} coordinate={riderLocation} anchor={{ x: 0.46, y: 0.57 }} /* anchor={{ x: 0.29, y: 0.57 }} */ /* anchor={{ x: 0.46, y: 0.7 }} */ rotation={riderLocation?.rotation} style={{ zIndex: 1000 }}>
                        <SvgXml xml={locRiderIcon_Top2()} width={29} height={105} /* width={29} height={105} */ /* width={30} height={30} */ />
                    </Marker>
                }

            </MapView>

            {mode === "pinRegion" && pinRegion && pinRegion.latitude &&
                <View style={{ position: "absolute", left: (Dimensions.get('window').width - 40) * 0.5, top: (Dimensions.get('screen').height - (Platform.OS === "android" ? 120 : 35) - (Platform.OS === "ios" ? iosOffsetForPinTop : 0)) * 0.5, right: 0, backgroundColor: 'transparent', width: 50, height: 50 }}>
                    {
                        <SvgXml xml={pinIcon} height={40} width={40} />
                    }
                </View>
            }

        </View >
    )
}

export default MapCustomer;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        alignItems: "center"
    },
    map: {
        flex: 1,
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height
    },
    pitStopMarker: {
        backgroundColor: "#fff",
        borderRadius: 10,
        width: 30,
        height: 30,
        shadowColor: '#7359BE',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        borderColor: '#7359BE',
        borderWidth: 2,
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    pitStopMarkerText: {
        color: "#7359BE",
        paddingVertical: 2.5,
        fontWeight: "bold",
        alignSelf: "center",
        fontSize: 16
    }
})
