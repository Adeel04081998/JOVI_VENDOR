/**
 * @format
 */

import { AppRegistry, ImageBackground } from 'react-native';
import React from 'react';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import appStore from './src/redux/store';
import messaging from '@react-native-firebase/messaging';
import invokeApp from 'react-native-invoke-app';
messaging().setBackgroundMessageHandler(async remoteMessage => {
    // For background job
    console.log('[Index.js] message handeled in the background :', remoteMessage);
    invokeApp();
    // if (remoteMessage.notification.body === "Hello Rider" || remoteMessage.notification.body === "Hello Customer") {
    // }
});
const RNRedux = () => (
    <ImageBackground source={require('./src/assets/doodle.png')} style={{ flex: 1 }}>
        <Provider store={appStore}>
            <App />
        </Provider>
    </ImageBackground>
)
const HeadlessCheck = ({ isHeadless }) => {
    if (isHeadless) { return null };
    return <RNRedux />
}
AppRegistry.registerComponent(appName, () => HeadlessCheck);
