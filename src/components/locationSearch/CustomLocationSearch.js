import React, { useState, useEffect, memo } from 'react';
import { View, Text, Image, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { pinIconDesc, heartIconFilled } from "../../assets/svgIcons/customerorder/customerorder";
import { GOOGLE_API_KEY } from '../../config/config';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import locationIcon from "../../assets/location_ico.png";
import crossIcon from "../../assets/add_ico.png";
import commonStyles from '../../styles/styles';
import { SvgXml } from "react-native-svg";
import { closeModalAction } from '../../redux/actions/modal';
// import { TouchableOpacity } from 'react-native-gesture-handler';
const MemoizedCustomLocationSearch = memo(function CustomLocationSearch(props) {
    let locationTextRef = props.locationTextRef;
    const [state, setState] = useState({ isFocused: false, showCross: props.locationTitle ? true : false });
    const substringConverter = string => {
        if (!string) return;
        return string.substring(0, 35);
    };
    // console.log('locationTextRef :', locationTextRef);
    const renderInputRightIcons = () => {
        let iconsArrUI = [{
            icon: locationIcon,
            handler: () => {
                props.dispatch(closeModalAction());
                props.gotoMapLocationPicker();
            },
            imgStyles: {
                padding: 10,
                width: 22,
                height: 22,
                backgroundColor: '#fff',

            }
        }];
        if (state.showCross) {
            iconsArrUI.push({
                icon: crossIcon,
                handler: () => {
                    locationTextRef.current && locationTextRef.current.refs.textInput.setNativeProps({ text: "" });
                    setState(pre => ({ ...pre, showCross: false }));
                },
                imgStyles: {
                    padding: 10,
                    width: 22,
                    height: 22,
                    backgroundColor: '#fff',
                    transform: [{ rotate: '45deg' }]
                }
            })
        }
        return iconsArrUI.map((item, i) => (
            <TouchableOpacity key={i} style={{
                position: "absolute",
                right: i > 0 ? Platform.select({ ios: 65, android: 67 }) : Platform.select({ ios: 35, android: 35 }),
                top: Platform.select({ ios: 57, android: 62 }),
                width: Platform.select({ android: 40, ios: 40 }),
                height: 45,
                zIndex: 99999,
                backgroundColor: '#fff',
                // backgroundColor: 'red',
                paddingTop: 15,
                padding: 10,
                paddingHorizontal: 10,
                paddingVertical: 10,
                marginRight: 7,
                overflow: 'scroll'
                // padding: 10,
            }}
                activeOpacity={100}
                onPress={item.handler}
            >
                <Image style={item.imgStyles} source={item.icon} />
            </TouchableOpacity>
        ))
    }
    useEffect(() => {
        // console.log('Ran---')
        locationTextRef.current && locationTextRef.current.refs.textInput.setNativeProps({ text: props.locationTitle || "" });
        return () => {
            console.log("CustomLocationSearch cleared----")
        }
    }, [props.locationTitle]);
    // console.log("predefinedPlaces :", props.predefinedPlaces);
    // console.log("props.predefinedPlaces :", props.predefinedPlaces);
    return (
        <View style={{ flex: 1, padding: 30 }}>
            <View style={{ paddingBottom: 5, paddingHorizontal: 10 }}>
                <Text style={commonStyles.fontStyles(14, props.activeTheme.black, 1, "bold")}>
                    {props.title ? props.title : "Drop off location"}
                </Text>
            </View>
            <GooglePlacesAutocomplete
                defaultValue={props.value ? props.value : ""}
                value={props.value ? props.value : ""}
                ref={locationTextRef}
                autoFocus
                fetchDetails
                placeholder={props.placeholder ? props.placeholder : "Enter a pitstop location"}
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                onPress={(data, { geometry }) => {
                    locationTextRef.current && locationTextRef.current.refs.textInput.setNativeProps({ text: data.description ? data.description : data.name });
                    // debugger;
                    // console.log("data :", data, 'Geo :', geometry)
                    props.onSelectLocation({
                        addressID: data.addressID ? data.addressID : 0,
                        title: data.description ? data.description : data.name,
                        latitude: geometry.location.lat,
                        longitude: geometry.location.lng,
                        latitudeDelta: data.latitudeDelta ? data.latitudeDelta : null,
                        longitudeDelta: data.longitudeDelta ? data.longitudeDelta : null,
                    })
                }}
                // caretHidden={true}
                // onPress={d => console.log(d)}
                query={{
                    // available options: https://developers.google.com/places/web-service/autocomplete
                    key: GOOGLE_API_KEY,
                    language: "en",
                    components: "country:pk",
                    location: {
                        latitude: "",
                        longitude: ""
                    }
                    // radius: 100
                }}
                predefinedPlacesAlwaysVisible={false}
                currentLocation={true}
                currentLocationLabel="Nearby Locations..."
                nearbyPlacesAPI="GooglePlacesSearch"
                GooglePlacesSearchQuery={{
                    // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                    // opennow: true,
                    rankby: "distance", // "prominence" | "distance"
                    type: "cafe"
                }}
                predefinedPlaces={props.predefinedPlaces}
                textInputProps={{
                    // style: { width: '100%', backgroundColor: 'red' },
                    clearButtonMode: "never",
                    onFocus: () => setState(pre => ({ ...pre, isFocused: true })),
                    onBlur: () => setState(pre => ({ ...pre, isFocused: false })),
                    // onTouchStart: () => locationTextRef?.current?.locationTextRef?.current?.focus()
                }}
                renderRightButton={() => <View />}
                renderRow={
                    data => {
                        return (
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                <SvgXml xml={pinIconDesc()} height={21} width={21} />
                                <Text numberOfLines={1} style={{ color: "#000", fontSize: 16, paddingHorizontal: 15 }}>{substringConverter(data.description) || substringConverter(data.name)}</Text>
                                {
                                    (data.isPredefinedPlace && data.description !== "Nearby Locations...") ?
                                        <SvgXml style={{}} xml={heartIconFilled()} height={21} width={21} />
                                        :
                                        null
                                }
                            </View>
                        );
                    }
                }
                styles={{
                    container: {
                        // position: "absolute",
                        // flex: 1,
                        top: -5,
                        width: "100%",
                        marginBottom: 5
                    },
                    textInputContainer: {
                        // flex: 1,
                        backgroundColor: "transparent",
                        // backgroundColor: "red",
                        // height: 50,
                        marginHorizontal: 0,
                        borderTopWidth: 0,
                        borderBottomWidth: 0,
                        minWidth: "100%",
                        // overflow: 'hidden'
                    },
                    textInput: {
                        borderWidth: 0.7,
                        borderRadius: 5,
                        borderColor: state.isFocused ? props.activeTheme.default : "rgba(0, 0, 0, 0.5)",
                        paddingVertical: 0,
                        height: 60,
                        // overflow: 'hidden'
                        // backgroundColor: 'red',
                    },
                    listView: {
                        // borderWidth: 1,
                        // borderColor: "#DDD",
                        backgroundColor: "#FFF",
                        // backgroundColor: "red",
                        // marginHorizontal: 10,
                        elevation: 3,
                        shadowColor: "#000",
                        shadowOpacity: 0.1,
                        shadowOffset: { x: 0, y: 0 },
                        shadowRadius: 15,
                        marginTop: 25,
                        borderBottomLeftRadius: 5,
                        borderBottomRightRadius: 5,
                        marginHorizontal: 10,
                        // bottom: props.predefinedPlaces.length ? 0 : Platform.select({ ios: 55, android: 30 }),
                        // height: Dimensions.get("window").height * 0.5,
                        // maxHeight: Dimensions.get("window").height * 0.5
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
                        color: '#000',
                    },
                }}
            />
            {renderInputRightIcons()}
        </View >
    )
});
export default memo(MemoizedCustomLocationSearch);
