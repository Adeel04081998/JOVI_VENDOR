import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SvgXml } from "react-native-svg";
import locateMeIcon from "../../assets/svgIcons/customerorder/locate-ico.svg";
import crossIcon from "../../assets/svgIcons/common/cross-new.svg";
import CustomMapView from '../../components/mapview/CustomMapView';
import { CONSTANTLATDELTA, CONSTANTLONGDELTA, DEVICE_SCREEN_HEIGHT } from '../../config/config';
import { sharedAnimateToCurrentLocation } from '../../utils/sharedActions';


export default function MapLocationPicker(props) {
    let initState = {
        pinRegion: {
            latitude: 25.96146850382255,
            latitudeDelta: 24.20619842968337,
            longitude: 69.89856876432896,
            longitudeDelta: 15.910217463970177
        },
    }
    const [state, setState] = useState(initState)
    const mapRef = useRef();
    const setPinRegion = (newRegion, title) => {
        setState((prevState) => ({
            ...prevState,
            pinRegion: newRegion ? { ...newRegion, title: title } : { ...prevState.pinRegion, title: title },
        }));
    };
    const goBackToCashoutScreen = async (returnType) => {
        if (returnType === 'cancel') {
            props.route.state.routes[props.route.state.index].params.cb && props.route.state.routes[props.route.state.index].params.cb(state.pinRegion, 2, 1);
            props.navigation.navigate(props.route.state.routes[props.route.state.index].params.backScreenObj ?
                props.route.state.routes[props.route.state.index].params.backScreenObj.container : "wallet_container",
                {
                    screen: props.route.state.routes[props.route.state.index].params.backScreenObj ?
                        props.route.state.routes[props.route.state.index].params.backScreenObj.screen : "wallet_child_container", data: null
                })
        }
        else {
            props.route.state.routes[props.route.state.index].params.cb && props.route.state.routes[props.route.state.index].params.cb(state.pinRegion, 2, 1)
            props.navigation.navigate(props.route.state.routes[props.route.state.index].params.backScreenObj ?
                props.route.state.routes[props.route.state.index].params.backScreenObj.container : "wallet_container",
                {
                    screen: props.route.state.routes[props.route.state.index].params.backScreenObj ?
                        props.route.state.routes[props.route.state.index].params.backScreenObj.screen : "wallet_child_container", data: state.pinRegion
                });
        }
    };
    // useEffect(() => {
    //     console.log('MapLocationPicker. useLayoutEffect called')
    //     sharedAnimateToCurrentLocation(mapRef, null, {});
    //     return () => {
    //         console.log("MapLocationPicker.Cleanup---")
    //         setState(initState.pinRegion)
    //     }
    // }, []);
    // console.log('MapLocationPicker.State :', state);
    // console.log('pinRegionRef.cuurent :', pinRegionRef.current);
    return (
        <View style={{
            flex: 1,
            flexDirection: "column",
            alignSelf: 'stretch'
        }}>
            <CustomMapView
                mapRef={mapRef}
                markerRef={null}
                pinRegion={state.pinRegion}
                setPinRegion={setPinRegion}
                constantLatDelta={CONSTANTLATDELTA}
                constantLongDelta={CONSTANTLONGDELTA}
                editMode={false}
                firstRenderMap={true}
                marketTitle={""}
                parentSetStateHandler={() => { }}
                interactibleMap={true}
                showMarkupObj={{
                    withStyles: false,
                    count: '0'
                }}
                top={(DEVICE_SCREEN_HEIGHT - 120) * 0.5}
            // bottom={50}
            />
            <TouchableOpacity onPress={() => goBackToCashoutScreen('cancel')} style={{ position: "absolute", left: "4%", top: 41, zIndex: 6 }}>
                <View style={styles.headerLeftIconView} >
                    <SvgXml style={{ ...styles.svgTag, marginTop: 1 }} xml={crossIcon} height={14} width={14} />
                </View>
            </TouchableOpacity>

            {/* <Text style={{ ...styles.caption, position: "absolute", left: "35%", marginVertical: 0, top: 48, fontSize: 18 }}>
                <Text>Select Location</Text>
            </Text> */}

            <View style={{
                ...styles.textInputLoc, position: "absolute",
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 2,
                // borderColor: props.activeTheme.default,
                top: 87, alignSelf: "center",
            }} width={"92%"} height={60} pointerEvents={"none"}>
                <Text style={{ padding: 3 }}>{state?.pinRegion?.title}</Text>
            </View>

            <TouchableOpacity onPress={() => sharedAnimateToCurrentLocation(mapRef)} style={{ bottom: /*170 + 23*/ 76 - (15), position: "absolute", left: "87.3%" /*"82.3%"*/, zIndex: 6 }} >
                <View style={styles.headerLeftIconView} >
                    <SvgXml style={{ ...styles.svgTag, marginTop: 1.5 }} xml={locateMeIcon} height={18} width={18} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                disabled={state.pinRegion && (state.pinRegion.title === "Fetching Address..." || state.pinRegion.title === "Error while Fetching Address!") ? true : false}
                onPress={goBackToCashoutScreen}
                style={styles.appButtonContainer(state, props.activeTheme)}
            >
                <Text style={styles.appButtonText}>Confirm Location</Text>
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        alignSelf: 'stretch'
    },
    wrapper: {
        alignItems: 'flex-start',
        flexDirection: 'column',
        backgroundColor: '#fff',
        width: '100%', //'85%'
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        zIndex: 5,
        shadowColor: '#000',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
        paddingBottom: 0, //15
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    appButtonContainer: (state, activeTheme) => ({
        elevation: 8,
        backgroundColor: state.pinRegion && (state.pinRegion.title === "Fetching Address..." || state.pinRegion.title === "Error while Fetching Address!") ? activeTheme.lightGrey : activeTheme.default,
        borderRadius: 0, //50
        paddingVertical: 15,
        paddingHorizontal: 15,
        position: "absolute",
        width: "100%"/*"77%"*/,
        alignSelf: "center",
        bottom: 15 - (15),
    }),
    appButtonText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        // fontFamily: plateformSpecific('proxima-nova', 'Proxima Nova')
    },
    btmBg: {
        width: '100%',
        height: 100,
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        zIndex: 2
    },
    caption: {
        position: "relative",
        left: 10,
        fontSize: 15,
        color: '#7359BE',
        marginVertical: 10,
    },


    headerLeftIconView: {
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        width: 38,
        height: 38,
        borderRadius: 10,
        elevation: 4
    },
    headerRightIconView: {
        width: 40,
        elevation: 4
    },
    svgTag: {
        alignSelf: 'center'
    },


    taskView: {
        backgroundColor: "rgba(115, 89, 190, 1)",
        borderRadius: 50,
        width: '90%',
        height: 'auto',
        alignSelf: 'center',
        marginTop: 4,
        elevation: 10
    },
    textView: {
        margin: 10,
        alignSelf: 'center'
    },
    taskText: {
        color: "rgba(255, 255, 255, 1)"
    },

    textInputLoc: {
        display: 'flex',
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'rgba(0,0,0,0.1)',
        paddingVertical: 0,
        marginBottom: 0,
        paddingHorizontal: 10,
        paddingRight: 10,
        backgroundColor: "white",
        elevation: 2
    },
    textInputDesc: {
        display: 'flex',
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'rgba(0,0,0,0.1)',
        paddingVertical: 0,
        marginBottom: 5,
        paddingHorizontal: 5,
        paddingRight: 5
    }
});
