import React from 'react';
import { Dimensions, View } from 'react-native';

import { WebView } from 'react-native-webview';

export default ({ html, screenStyles, uri }) => {
    console.log("WebView.uri :", uri);
    console.log("WebView.html :", html);

    return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <WebView
                source={html ? { html } : { ...uri }}
                style={[{ ...screenStyles }, { flex: 1, minHeight: 200, width: Dimensions.get('window').width, backgroundColor: 'transparent' }]}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}

            />
        </View>
    )
}
