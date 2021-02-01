import React from 'react';
import { ActivityIndicator, ImageBackground } from 'react-native';
import loaderGif from './loader.gif';
export default ({ styles, width, height, size, color, isActivityIndicator }) => isActivityIndicator ?
    <ActivityIndicator style={{ alignSelf: 'center', }} size={size || "small"} color={color || "#7359BE"} />
    :
    <ImageBackground source={loaderGif} style={{ width: width || 30, height: height || 30 }} />
