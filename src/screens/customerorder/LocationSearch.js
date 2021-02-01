import React, { useState, useEffect } from "react";
import { View, Platform, Text, Image, StyleSheet, Alert, TouchableOpacity, Dimensions } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_API_KEY } from "../../config/config";
import { SvgXml } from "react-native-svg";
import addIcon from "../../assets/add_ico.png";
import deleteIcon from "../../assets/minus_ico.png";
import locationIcon from "../../assets/location_ico.png";
import AsyncStorage from '@react-native-community/async-storage';
import { pinIconDesc, heartIconFilled, heartIconUnfilled, favHomeIcon, favWorkIcon, /* favOtherIcon, */ favFriendsIcon, favFamilyIcon } from "../../assets/svgIcons/customerorder/customerorder";

export default LocationSearch = ({ dispatch, index, mode, textToShow, onLocationSelected, handleAddPitstop, handleDeletePitstop, handlePinLocationClicked, isLast, handleInputFocused, reRender, totalPitstops, onSetFavClicked, isFavourite }) => {

    const locTextRef = React.createRef();

    const [state, setState] = useState({ searchFocused: false });
    const { searchFocused } = state;

    const [placesState, setPlacesState] = useState({ show: mode === "enterPitstop" ? false : true, predefinedPlaces: [] });
    const { show, predefinedPlaces } = placesState;

    useEffect(() => {
        locTextRef.current && locTextRef.current.refs.textInput.setNativeProps({ text: textToShow });
        // if(mode === "enterPitstop"){
        //     locTextRef.current && locTextRef.current.refs.textInput.focus();
        // }
    });

    useEffect(() => {
        const loadPredefinedPlaces = async () => {
            if (mode === "enterPitstop") {
                const predefinedPlaces = await AsyncStorage.getItem("customerOrder_predefinedPlaces");
                if (predefinedPlaces) {
                    setPlacesState({ show: true, predefinedPlaces: JSON.parse(predefinedPlaces) });
                }
                else {
                    setPlacesState({ show: true, predefinedPlaces: [] });
                }
            }
        }
        loadPredefinedPlaces();
    }, [mode]);

    const clearField = () => {
        locTextRef.current && locTextRef.current.refs.textInput.setNativeProps({ text: "" });
    }

    return (
        show &&
        <GooglePlacesAutocomplete
            placeholder={mode === "destPitstopDetails" ? "Enter destination location" : "Enter a pitstop location"}
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            ref={locTextRef}
            onPress={(data, { geometry }) => onLocationSelected(data, geometry, index, null)}
            query={{
                // available options: https://developers.google.com/places/web-service/autocomplete
                key: GOOGLE_API_KEY,
                language: "en",
                components: "country:pk",
                // radius: 100
            }}

            // predefinedPlaces={[{ description: "Home", geometry: { location: { lat: 33.66337831887427, lng: 73.06501189246774 } } }, { description: "Work", geometry: { location: { lat: 33.6666574, lng: 73.0761395 } } }, { description: "Tehzeeb Bakers, Blue Area, Islamabad, Pakistan", geometry: { location: { lat: 33.7156728, lng: 73.068041 } } }]}
            // predefinedPlaces={predefinedPlaces}
            predefinedPlaces={predefinedPlaces.map((place, i) => ({ ...place, description: (place.description + Array(i).join(" ")) }))}
            // predefinedPlacesAlwaysVisible={true}

            currentLocation={true}
            currentLocationLabel="Nearby Locations..."
            nearbyPlacesAPI="GooglePlacesSearch"
            GooglePlacesSearchQuery={{
                // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                // opennow: true,
                rankby: "distance", // "prominence" | "distance"
                type: "cafe"
            }}

            renderRow={(data) => {
                return (
                    <View style={{ display: "flex", flexDirection: "row" }}>
                        <SvgXml style={{ marginRight: 4 }} xml={data.isFavourite ? heartIconFilled() : pinIconDesc()} height={21} width={21} />
                        {(data.isPredefinedPlace && data.description !== "Nearby Locations...") ?
                            (data.isFavourite) ?
                                <SvgXml style={{ marginRight: 4 }} height={21} width={21} xml={
                                    data.addressType === 1 ?
                                        favHomeIcon("#7359be")
                                        :
                                        data.addressType === 2 ?
                                            favWorkIcon("#7359be")
                                            :
                                            data.addressType === 3 ?
                                                favFriendsIcon("#7359be")
                                                :
                                                favFamilyIcon("#7359be")
                                } />
                                :
                                null
                            :
                            null
                        }
                        <Text numberOfLines={1} style={{ color: "#000", fontSize: 16 }}>{data.description || data.name}</Text>
                    </View>
                );
            }}
            // renderDescription={({ description }) => description}
            renderRightButton={
                (mode === "pitstops") ?
                    (isLast) ?
                        () => {
                            return (
                                <View>
                                    <TouchableOpacity style={{ ...styles.iconStyleRight, right: (totalPitstops < 5) ? 30 : 5 }} onPress={handleAddPitstop}>
                                        <Image style={styles.IcoImg} source={addIcon} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconStyleRight} onPress={() => handleDeletePitstop(index)}>
                                        <Image style={styles.IcoImg} source={deleteIcon} />
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                        :
                        (index === 0) ?
                            () => {
                                return (
                                    <View>
                                        <TouchableOpacity style={styles.iconStyleRight} onPress={() => handleDeletePitstop(index)}>
                                            <Image style={styles.IcoImg} source={deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                            :
                            () => {
                                return (
                                    <View>
                                        <TouchableOpacity style={styles.iconStyleRight} onPress={() => handleDeletePitstop(index)}>
                                            <Image style={styles.IcoImg} source={deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                    :
                    (mode === "enterPitstop") ?
                        () => {
                            return (
                                <View>
                                    <TouchableOpacity style={styles.iconStyleRight} onPress={clearField}>
                                        <Image style={{ ...styles.IcoImg, transform: [{ rotate: '45deg' }] }} source={addIcon} />
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                        :
                        (mode === "pitstopDetails" || mode === "paymentPitstopDetails" || mode === "orderPitstopDetails" || mode === "destPitstopDetails") ?
                            () => {
                                return (
                                    <View>
                                        {textToShow !== "" &&
                                            <TouchableOpacity style={{ ...styles.iconStyleRight, right: 30 }} onPress={onSetFavClicked}>
                                                <SvgXml style={styles.IcoImg} xml={isFavourite ? heartIconFilled() : heartIconUnfilled()} height={20} width={20} />
                                            </TouchableOpacity>
                                        }
                                        <TouchableOpacity style={styles.iconStyleRight} onPress={() => handlePinLocationClicked(index)}>
                                            <Image style={styles.IcoImg} source={locationIcon} />
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                            :
                            null
            }
            textInputProps={{
                onFocus: () => {
                    if (mode === "pitstops" || mode === "pitstopDetails" || mode === "paymentPitstopDetails" || mode === "orderPitstopDetails" || mode === "destPitstopDetails") {
                        handleInputFocused(index);
                    }
                    // setState(prevState => ({ ...prevState, searchFocused: true }));
                },
                onBlur: () => {
                    //reRender();
                    //setState(prevState => ({ ...prevState, searchFocused: false }));
                },
                clearButtonMode: "never",
                // onSubmitEditing: () => {
                // },
                autoFocus: mode === "enterPitstop" ? true : false,
                showSoftInputOnFocus: mode === "enterPitstop" ? true : false,
                editable: true,
                selectTextOnFocus: mode === "enterPitstop" ? true : false,
                caretHidden: mode === "pitstops" ? true : false,
                autoCapitalize: "none",
                autoCorrect: false,
                blurOnSubmit: true,
                selection: (mode === "pitstops" || mode === "pitstopDetails" || mode === "paymentPitstopDetails" || mode === "orderPitstopDetails" || mode === "destPitstopDetails") ? { start: 0, end: 0 } : null
            }}
            listViewDisplayed={searchFocused}
            fetchDetails
            enablePoweredByContainer={false}
            styles={{
                container: {
                    position: "relative",
                    top: Platform.select({ ios: -5, android: -5 }),
                    width: "100%",
                    marginBottom: 5
                },
                textInputContainer: {
                    flex: 1,
                    backgroundColor: "transparent",
                    height: 50,
                    marginHorizontal: 0,
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                },
                textInput: {
                    display: 'flex',
                    width: '100%',
                    borderWidth: 1,
                    borderRadius: 5,
                    borderColor: 'rgba(0,0,0,0.1)',
                    paddingVertical: 0,
                    height: 40,
                    marginBottom: 10,
                    paddingHorizontal: 10,
                    // paddingRight: mode === "pitstops" ? 56 : (mode === "enterPitstop" ? 30 : 15)
                    // paddingRight: (mode === "pitstops" || mode === "enterPitstop") ? 56 : (mode === "pitstopDetails" ? 30 : 15)
                    paddingRight: mode === "pitstops" ?
                        // (index === 0) ? 33 : isLast ? 83 : 59
                        // (index === 0) ? (totalPitstops === 1 ? 59 : 33) : isLast ? (totalPitstops === 2 ? 59 : 83) : 59
                        (isLast) ? (totalPitstops === 5 ? 33 : 59) : 33
                        :
                        (mode === "pitstopDetails" || mode === "paymentPitstopDetails" || mode === "orderPitstopDetails" || mode === "destPitstopDetails") ?
                            59
                            :
                            (mode === "enterPitstop") ? 33 : 15
                },
                listView: {
                    borderWidth: 1,
                    borderColor: "#DDD",
                    backgroundColor: "#FFF",
                    marginHorizontal: 10,
                    elevation: 3,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowOffset: { x: 0, y: 0 },
                    shadowRadius: 15,
                    marginTop: -2,
                    maxHeight: Dimensions.get("window").height * 0.34
                },
                description: {
                    fontSize: 16,
                },
                row: {
                    padding: 8,
                    height: 38,
                    flex: 1,
                    width: "100%",
                },

                predefinedPlacesDescription: {
                    color: '#1faadb',
                },
            }}
        />
    );
}


const styles = StyleSheet.create({

    iconStyleRight: {
        position: "absolute",
        right: 4,
        top: 18,
        width: 32,
        height: 50,
    },

    iconStyleLeft: {
        position: "absolute",
        right: 30,
        top: 18,
        width: 32,
        height: 50,
    },

    IcoImg: {
        width: 20,
        height: 20,
        zIndex: 8
    },
});