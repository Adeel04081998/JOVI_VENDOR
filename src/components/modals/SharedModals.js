import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, ImageBackground, Platform, ScrollView } from 'react-native'
import { SvgXml } from 'react-native-svg';
import modalCam from '../../assets/profile/camera.svg';
import { DEVICE_WIN_WIDTH } from '../../config/config';
import { closeModalAction, showHideImageViewAction } from '../../redux/actions/modal';
import { sharedLounchCameraOrGallary } from '../../utils/sharedActions';
import commonStyles from '../../styles/styles';
import { Textarea } from 'native-base';
import DefaultBtn from '../buttons/DefaultBtn';
import CustomToast from '../toast/CustomToast';
const SharedTakePicturesModalView = ({ images, activeTheme, dispatch, handlers, padding }) => (
    <View style={{ padding, justifyContent: 'space-between' }}>
        <SvgXml xml={modalCam} height={40} width={40} style={{ alignSelf: 'center', marginVertical: 5 }} />
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: activeTheme.default, paddingVertical: 15, borderRadius: 5, marginVertical: 5 }}
            onPress={() => {
                if (images.length) CustomToast.error('You can attach only (1) prescription image', null, 'long');
                else {
                    sharedLounchCameraOrGallary(1, () => { }, picData => {
                        handlers.getImageHandler(picData);
                        // dispatch(closeModalAction());
                    });
                }
            }}
        >
            <Text style={commonStyles.fontStyles(14, activeTheme.white, 3, 'bold')}>{"Take a photo"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: activeTheme.validationRed, paddingVertical: 15, borderRadius: 5, marginVertical: 5 }}
            onPress={() => {
                if (images.length) CustomToast.error('You can attach only (1) prescription image', null, 'long');
                else {
                    sharedLounchCameraOrGallary(0, () => { }, picData => {
                        handlers.getImageHandler(picData);
                        // dispatch(closeModalAction());
                    })
                }
            }}
        >
            <Text style={commonStyles.fontStyles(14, activeTheme.white, 3, 'bold')}>{"Choose from gallary"}</Text>
        </TouchableOpacity>
    </View>
);
const PrescriptionModalView = ({ activeTheme, dispatch, handlers }) => {

    const initState = {
        images: [],
        description: ""
    };
    const [state, setState] = useState(initState);
    useEffect(() => {
        return () => {
            setState(initState);
        }
    }, [])
    const discardImgHandler = imgID => {
        let modifiedImages = state.images.filter(row => row.id !== imgID);
        setState(pre => ({ ...pre, images: modifiedImages }));
    };
    const cb = picData => {
        state.images.push({
            uri: Platform.OS === 'android' ? picData.uri : picData.uri.replace("file://", ""),
            name: picData.uri.split('/').pop(),
            type: picData.type,
            id: state.images.length + 1
        });
        setState(pre => ({ ...pre, images: pre.images }));
    };
    return <View style={{ flex: 1, width: DEVICE_WIN_WIDTH }}>
        <ScrollView style={{ flex: 1 }}>
            <View style={{ flex: 1, margin: 10 }}>
                <Text style={{ ...commonStyles.fontStyles(15, activeTheme.black, 3, 'bold'), padding: 10 }}>{"Please add prescription"}</Text>
                <SharedTakePicturesModalView images={state.images} activeTheme={activeTheme} dispatch={dispatch} handlers={{ getImageHandler: cb }} padding={0} />
                <View style={{ flexDirection: 'row' }}>
                    {(state.images || []).map((img, index) => (
                        <View key={index} style={{ borderRadius: 5, borderWidth: 0.5, borderColor: activeTheme.black, margin: 3 }}>
                            <TouchableOpacity onPress={() => dispatch(showHideImageViewAction({ key: 0, imageIndex: 0, imagesArr: [{ uri: img.uri }], visible: true, onRequestClose: null, swipeToCloseEnabled: null }))}>
                                <ImageBackground source={{ uri: img.uri }} style={{ height: 50, width: 50, margin: 5, borderRadius: 5 }} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ position: 'absolute', backgroundColor: activeTheme.white, height: 20, width: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', elevation: 3, left: 40 }}
                                onPress={() => discardImgHandler(img.id)}
                            >
                                <Text style={[commonStyles.fontStyles(16)]}>
                                    ×
                                 </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                <Textarea autoFocus rowSpan={3} bordered placeholder={`Description here...`} style={{ borderRadius: 5 }}
                    onChangeText={value => setState(pre => ({ ...pre, description: value.trim() }))}
                />
            </View>
        </ScrollView>
        <DefaultBtn title={"Done"} onPress={() => {
            handlers.cb(state);
            dispatch(closeModalAction());
        }} />
    </View>
}

export {
    SharedTakePicturesModalView,
    PrescriptionModalView
}