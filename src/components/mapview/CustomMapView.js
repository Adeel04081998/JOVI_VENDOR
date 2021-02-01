import React, { useEffect, useCallback, memo } from 'react';
import { View, Text, Dimensions, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion, Overlay } from "react-native-maps";
import { CONSTANTLATDELTA, CONSTANTLONGDELTA } from '../../config/config';
import { sharedStartingRegionPK } from '../../utils/sharedActions';
import Geocoder from "react-native-geocoding";
import { SvgXml } from 'react-native-svg';
import pinIcon from '../../assets/svgIcons/common/pin.svg';
import finalDestIcon from '../../assets/svgIcons/customerorder/finalDestIcon_Flag1.svg';
import CustomToast from '../toast/CustomToast';

const MemoizedCustomMapView = memo(function CustomMapView({ mapRef, top, markerRef, handlePressOnMap, pinRegion, setPinRegion, editMode, firstRenderMap, parentSetStateHandler, interactibleMap, showMarkupObj, parentState, marketTitle, cashoutScreen, overrideFirstRenderMap = false, restrict = false, onTouchStart = () => { }, onMapReady = () => { } }) {
    // console.log('firstRenderMap :', firstRenderMap);
    const animateToCurrentLocation = () => {
        if (editMode) {
            mapRef.current && mapRef.current.animateToRegion({
                latitude: pinRegion.latitude,
                longitude: pinRegion.longitude,
                latitudeDelta: pinRegion.latitudeDelta,
                longitudeDelta: pinRegion.longitudeDelta
            });
            setTimeout(() => {
                parentSetStateHandler(pre => ({ ...pre, firstRenderMap: true }));
            }, 3000);
            return;
        }
        parentSetStateHandler(pre => ({ ...pre, firstRenderMap: true }));
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            // console.log(latitude);
            // console.log(longitude);
            mapRef.current && mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: CONSTANTLATDELTA,
                longitudeDelta: CONSTANTLONGDELTA
            });
        }, (error) => {
            mapRef.current.animateToRegion(sharedStartingRegionPK);
            CustomToast.error("Location Unavailable!" + "\n" + "Location is either turned off or not responding!")
        },
            {
                timeout: 3000,
                // enableHighAccuracy: true,
                // maximumAge: 100000
            }
        );
    };
    const onRegionChange = (newRegion) => {
        if (restrict) return parentSetStateHandler(pre => ({ ...pre }));
        else setPinRegion(newRegion, 'Fetching Address...');
    };
    const getSetAddressWithTitleAsync = async newRegion => {
        try {
            const geoCoderResponse = await Geocoder.from({
                latitude: newRegion.latitude,
                longitude: newRegion.longitude
            });
            if (geoCoderResponse) {
                // console.log('Ran---');
                setPinRegion({ ...newRegion, title: geoCoderResponse.results[0].formatted_address, }, geoCoderResponse.results[0].formatted_address);
            }
        }
        catch (exp) {
            setPinRegion(null, "Error while Fetching Address!");
        }
    };
    // const onRegionChange = (newRegion) => setPinReg/ion(newRegion);
    // console.log("onRegionChangeComplete :", restrict);
    // console.log('restrict---', restrict);
    // console.log('overrideFirstRenderMap---', overrideFirstRenderMap);
    // console.log('!firstRenderMap---', !firstRenderMap);

    const onRegionChangeComplete = async newRegion => {
        // console.log("onRegionChangeComplete :", restrict);
        if (restrict) return parentSetStateHandler(pre => ({ ...pre }));
        else if (overrideFirstRenderMap) return getSetAddressWithTitleAsync(newRegion);
        else if (!firstRenderMap) return;
        else getSetAddressWithTitleAsync(newRegion);
    };
    // useEffect(useCallback(() => {
    //     animateToCurrentLocation();
    // }, []), []);
    return (
        <>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                initialRegion={sharedStartingRegionPK}
                region={pinRegion ? null : sharedStartingRegionPK}
                onPress={e => {
                    e.persist();
                    if (handlePressOnMap) handlePressOnMap(e);
                    else if (!interactibleMap) return;
                    else mapRef.current.animateToRegion({ ...e.nativeEvent.coordinate, latitudeDelta: CONSTANTLATDELTA, longitudeDelta: CONSTANTLONGDELTA });
                }}
                style={styles.map}
                onRegionChange={onRegionChange}
                onRegionChangeComplete={onRegionChangeComplete}
                showsUserLocation={true}
                followsUserLocation={true}
                showsMyLocationButton={false}
                zoomControlEnabled={false}
                showsCompass={false}
                pitchEnabled={interactibleMap}
                rotateEnabled={interactibleMap}
                scrollEnabled={interactibleMap}
                zoomEnabled={interactibleMap}
                loadingEnabled={interactibleMap}
                onTouchStart={onTouchStart}
                onMapReady={() => {
                    console.log('Map Ready---')
                    onMapReady()
                    animateToCurrentLocation();
                }}
            >
                {
                    cashoutScreen ?
                        <Marker ref={markerRef} coordinate={pinRegion} anchor={{ x: 0.5, y: 1 }} title={marketTitle?.marketTitle}>
                            <SvgXml xml={finalDestIcon} width={40} height={40} />
                        </Marker>
                        :
                        null
                }

            </MapView>
            {
                cashoutScreen ? null :
                    <View style={{ position: "absolute", left: (Dimensions.get("window").width - 40) * 0.5, top: top ? top : (Dimensions.get("screen").height - (Platform.OS === "android" ? 120 : 55)) * 0.5, right: 0, backgroundColor: 'transparent', width: 50, height: 50 }}>
                        {
                            showMarkupObj && showMarkupObj.withStyles ?

                                < View style={styles.pitStopMarker}>
                                    <Text style={styles.pitStopMarkerText}>{showMarkupObj.count}</Text>
                                </View>
                                :
                                <SvgXml xml={pinIcon} height={40} width={40} />

                        }
                    </View>
            }

        </>
    )
})
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        alignItems: "center"
    },
    map: {
        // zIndex: 100,
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
});
export default memo(MemoizedCustomMapView);