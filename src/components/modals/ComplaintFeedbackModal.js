import React, { useState } from 'react';
import { View, Text, Dimensions, Image, Keyboard, Platform, TouchableOpacity } from 'react-native';
import { Textarea } from 'native-base';
import commonStyles from '../../styles/styles';
import SubmitBtn from '../buttons/SubmitBtn';
import { closeModalAction, showHideImageViewAction } from '../../redux/actions/modal';
import { SvgXml } from 'react-native-svg';
import { sharedImagePickerHandler, sharedOpenModal } from '../../utils/sharedActions';
import CustomToast from '../toast/CustomToast';
import { TakePicturesModalView } from '../../screens/assistance/ComplaintsDetailList';
import { DEVICE_WIN_WIDTH } from '../../config/config';
import commonIcons from '../../assets/svgIcons/common/common';
const ComplaintFeedbackModal = React.forwardRef((props, ref) => {
    console.log(props)
    const { title, activeTheme, parentProps, orderDetailsHandlers } = props;
    const [text, setText] = useState("");
    const [images, setImages] = useState([]);
    const getImageHandler = picData => {
        // console.log('imgData :', imgData);
        images.push({
            uri: Platform.OS === 'android' ? picData.uri : picData.uri.replace("file://", ""),
            name: picData.uri.split('/').pop(),
            type: picData.type,
            id: images.length + 1
        })
        setImages([...images]);
    };
    const discardImgHandler = imgID => {
        let modifiedImages = images.filter(row => row.id !== imgID);
        setImages([...modifiedImages]);
    };
    // console.log("ComplaintFeedbackModal.State :", text);
    return (
        <View style={{ flex: 1, width: DEVICE_WIN_WIDTH }} onTouchStart={() => Keyboard.dismiss()} >
            <View style={{ flex: 1, margin: 30 }}>
                {
                    title === "Complaint" ?
                        <TouchableOpacity style={{ bottom: 10, maxWidth: 50 }} onPress={orderDetailsHandlers.openComplaintSuggestionModal}>
                            <SvgXml xml={commonIcons.backIcon(activeTheme)} height={20} width={20} />
                        </TouchableOpacity>
                        : null
                }
                <View style={{ paddingVertical: 5 }}>
                    <Text style={{ ...commonStyles.fontStyles(16, activeTheme.black, 3) }}>{title}</Text>
                </View>
                <View>
                    <Textarea ref={ref} autoFocus rowSpan={4} bordered placeholder={`Enter Your ${title}`} style={{ borderRadius: 5, borderColor: activeTheme.default }} onKeyPress={e => console.log('testtttt :', e.nativeEvent.key)} onChangeText={value => {
                        if (!text.length && !value.trimStart()) return CustomToast.error('Leading or trailing spaces are not allowed');
                        else if (!text.length && (value === "" || value === " ")) return;
                        else {
                            setText(value.trim());
                            orderDetailsHandlers.onChangeHandler(value.trim(), "text");
                        }
                    }} />
                </View>
                {
                    title === "Complaint" ?
                        <View>
                            <TouchableOpacity style={{ paddingVertical: 10, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F4F7', margin: 10 }} onPress={() => {
                                if (images.length === 3) return CustomToast.error("You have reached the maximum allowed limit of attachments (3)")
                                else sharedOpenModal({ dispatch: parentProps.dispatch, visible: true, transparent: true, modalHeight: 220, modelViewPadding: 0, ModalContent: <TakePicturesModalView parentProps={{ ...parentProps }} handlers={{ getImageHandler }} />, okHandler: () => { }, onRequestCloseHandler: null, androidKeyboardExtraOffset: 0 })
                                // else sharedImagePickerHandler(() => { }, getImageHandler)
                            }}>
                                <SvgXml xml={`<svg id="Group_360" data-name="Group 360" xmlns="http://www.w3.org/2000/svg" width="15.429" height="13.372" viewBox="0 0 15.429 13.372">
  <path id="Path_285" data-name="Path 285" d="M14.826,39.2a1.982,1.982,0,0,0-1.454-.6h-1.8l-.41-1.093a1.493,1.493,0,0,0-.559-.679,1.431,1.431,0,0,0-.832-.285H5.657a1.431,1.431,0,0,0-.832.285,1.493,1.493,0,0,0-.558.679L3.857,38.6h-1.8A1.982,1.982,0,0,0,.6,39.2,1.982,1.982,0,0,0,0,40.654v7.2a1.982,1.982,0,0,0,.6,1.454,1.982,1.982,0,0,0,1.455.6H13.371a2.058,2.058,0,0,0,2.057-2.057v-7.2A1.982,1.982,0,0,0,14.826,39.2Zm-4.568,7.6a3.467,3.467,0,0,1-2.543,1.057A3.467,3.467,0,0,1,5.171,46.8a3.589,3.589,0,0,1,0-5.087,3.467,3.467,0,0,1,2.543-1.057,3.467,3.467,0,0,1,2.543,1.057,3.589,3.589,0,0,1,0,5.087Z" transform="translate(0 -36.54)" fill="#000"/>
  <path id="Path_286" data-name="Path 286" d="M194.391,228.4a2.539,2.539,0,1,0,1.791.744A2.441,2.441,0,0,0,194.391,228.4Z" transform="translate(-186.676 -223.275)" fill="#000"/>
</svg>`} height={20} width={20} />
                                <Text style={[commonStyles.fontStyles(14, undefined, 4), { left: 5 }]}>Attach an image</Text>
                            </TouchableOpacity>
                            <Text style={[commonStyles.fontStyles(16, undefined, 2), { margin: 5, left: 10 }]}>Upload limit:3</Text>
                            <View style={{ flexDirection: 'row' }}>
                                {(images || []).map((img, index) => (
                                    <View key={index} style={{ borderRadius: 5, borderWidth: 0.5, borderColor: activeTheme.black, margin: 3 }}>
                                        <TouchableOpacity onPress={() => parentProps.dispatch(showHideImageViewAction({ key: 0, imageIndex: 0, imagesArr: [{ uri: img.uri }], visible: true, onRequestClose: null, swipeToCloseEnabled: null }))}>
                                            <Image source={{ uri: img.uri }} style={{ height: 50, width: 50, margin: 5, borderRadius: 5 }} />
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
                        </View>
                        : null
                }
            </View>
            {/* <View style={{ flex: 1, justifyContent: Platform.select({ ios: 'flex-end', android: props.parentProps.keypaidOpen ? 'flex-start' : 'flex-end' }) }}> */}
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <SubmitBtn
                    style={{ backgroundColor: !text.length ? activeTheme.lightGrey : activeTheme.default, paddingVertical: 20 }}
                    activeTheme={activeTheme}
                    title={"Submit"}
                    onPress={(e) => {
                        parentProps.dispatch(closeModalAction())
                        orderDetailsHandlers.addComplaintOrFeedback(e, title, images)
                    }}
                    disabled={!text.length ? true : false}
                />
            </View>
        </View>
    )
});
export default ComplaintFeedbackModal;
