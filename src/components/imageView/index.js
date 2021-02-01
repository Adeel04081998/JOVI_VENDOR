import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import ImageView from "react-native-image-viewing";
import { showHideImageViewAction } from '../../redux/actions/modal';
import appStore from '../../redux/store';


export default ({ imageIndex, imagesArr, visible, onRequestClose, swipeToCloseEnabled }) => {
    // console.log("[ImageView] props :", { imageIndex, imagesArr, visible, onRequestClose, swipeToCloseEnabled })
    // useEffect(() => {
    //     return () => {
    //         console.log("ImageView.cleanup called---");
    //         onRequestClose();
    //     }
    // }, [])
    console.log("ImageView Mounted");
    return <ImageView
        key={imageIndex}
        imageIndex={imageIndex}
        images={imagesArr}
        visible={visible}
        onRequestClose={onRequestClose ? onRequestClose : () => { }}
        swipeToCloseEnabled={swipeToCloseEnabled}
        doubleTapToZoomEnabled
    />
}

const styles = StyleSheet.create({});
