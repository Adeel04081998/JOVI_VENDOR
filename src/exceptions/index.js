import { View, Text, Button, DevSettings, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import React, { Component } from 'react';
import { DEVICE_SCREEN_HEIGHT, DEVICE_SCREEN_WIDTH } from '../config/config';
import doodleImg from '../assets/doodle.png';
import Axios from 'axios';
import { SvgXml } from 'react-native-svg';
import wheelIcon from './wheel.svg'
import RNRestart from 'react-native-restart';


export default class ErrorBoundary extends Component {
    constructor(props) {
        DevSettings
        super(props);
        this.state = {
            hasError: false,
            error: {},
            errorInfo: {}
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        // console.log("[ErrorBoundary] getDerivedStateFromError :", error);
        Axios.post(`/api/ErrorLog/FrontEndError/AddOrUpdate`, {
            "userID": null,
            "frontEndErrorID": 0,
            "description": `${JSON.stringify({ error })}`,
            "creationDate": null
        })
            .then(res => {
                console.log('[componentDidCatch].then().res :', res);
            })
            .catch(err => {
                console.log('[componentDidCatch].catch().err :', err)
            }).finally(() => {

            });
        return {
            hasError: true,
            error: JSON.stringify(error),
        };

    }

    componentDidCatch(error, errorInfo) {
        // console.log("[ErrorBoundary] componentDidCatch error :", error);
        // console.log("[ErrorBoundary] componentDidCatch errorInfo :", JSON.stringify(errorInfo));
        if (error || errorInfo) {
            // console.log("[ErrorBoundary] componentDidCatch error :", JSON.stringify({ error, errorInfo }));
            // Axios.post(`/api/ErrorLog/FrontEndError/AddOrUpdate`, {
            //     "userID": null,
            //     "frontEndErrorID": 0,
            //     "description": `${JSON.stringify({ error, errorInfo })}`,
            //     // "description": `${JSON.stringify(error)}`,
            //     "creationDate": null
            // })
            //     .then(res => {
            //         console.log('[componentDidCatch].then().res :', res);
            //         this.setState({
            //             hasError: true,
            //             error: JSON.stringify(error),
            //             errorInfo: JSON.stringify(errorInfo)
            //         });
            //     })
            //     .catch(err => {
            //         console.log('[componentDidCatch].catch().err :', err)
            //     })
            this.setState({
                hasError: true,
                error: JSON.stringify(error),
                errorInfo: JSON.stringify(errorInfo)
            });
        }
    }
    onPress = () => {
        RNRestart.Restart();
        // console.log('here----- :', `${JSON.stringify(this.state.errorInfo)}`);
        // Axios.post(`/api/ErrorLog/FrontEndError/AddOrUpdate`, {
        //     "userID": null,
        //     "frontEndErrorID": 0,
        //     // "description": `${JSON.stringify(this.state.errorInfo)}`,
        //     "description": `${JSON.stringify({ error: this.state.errorInfo, errorInfo: this.state.errorInfo })}`,
        //     "creationDate": null
        // })
        //     .then(res => {
        //         console.log('[componentDidCatch].then().res :', res);
        //         DevSettings.reload()

        //     })
        //     .catch(err => {
        //         console.log('[componentDidCatch].catch().err :', err)
        //     })
        // DevSettings.reload()
    }

    render() {
        // console.log('[Error Boundary] this.state :', this.state)
        if (this.state.hasError) {
            return <View style={{ backgroundColor: '#fff', flex: 1 }}>
                <ImageBackground source={doodleImg} style={{ backgroundColor: 'transparent', flex: 1, ...StyleSheet.absoluteFill }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                        <View style={{
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            padding: 10,
                            elevation: 5,
                            backgroundColor: '#fff',
                            height: DEVICE_SCREEN_HEIGHT * 0.5,
                            width: DEVICE_SCREEN_WIDTH - 40,
                            borderRadius: 5,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <View>
                                <SvgXml xml={wheelIcon} height={80} width={80} />
                            </View>
                            <Text style={{ textAlign: 'center', fontSize: 20, color: '#7359BE' }}>
                                Whoops!
                </Text>
                            <Text style={{ textAlign: 'center', fontSize: 16, margin: 20 }}>
                                There seems to be problem with network connection
                </Text>
                            <View style={{ padding: 15, }}>
                                <TouchableOpacity onPress={this.onPress} style={{ backgroundColor: "#7359BE", padding: 15, borderRadius: 5 }}>
                                    <Text style={{ color: "#fff" }}>Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        } else {
            return this.props.children;
        }

    }
}