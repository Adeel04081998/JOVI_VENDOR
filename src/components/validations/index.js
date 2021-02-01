import React from 'react';
import { View, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import correctsign from '../../assets/svgIcons/common/correct_icon.svg';
import errorIcon from '../../assets/svgIcons/common/error_icon.svg';
import disabledCorrectIcon from '../../assets/svgIcons/common/disabledTick.svg';
import commonStyles from '../../styles/styles';

export default {
    passwordErrorMessageUi: (focusedField, fieldName, password, activeTheme, validationsArr, flex, maxHeight) => {
        if (focusedField === fieldName) {
            return <View style={{ flex: flex ? flex : 1, maxHeight: maxHeight ? maxHeight : undefined, flexDirection: 'column', marginVertical: 2, }}>
                {
                    [{ "id0": 0, "msg1": '(min 8 - max 32) Characters', "id1": 1, "msg2": 'Capital letter (A-Z)' }, { "id0": 2, "msg1": 'Lowercase letter (a-z)', "id1": 3, "msg2": 'Number (0-9)' }].map((el, i) => (

                        <View key={i} style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', top: i > 0 ? 3 : undefined }}>
                            <View style={{ flex: 1, backgroundColor: 'rgb(245, 248, 255)', borderRadius: 5, height: 40, alignItems: 'center', flexDirection: 'row' }}>
                                {password.length > 0 ?
                                    <SvgXml xml={!validationsArr[el.id0] ? errorIcon : correctsign} height={15} width={15} style={{ marginHorizontal: 3 }} />
                                    :
                                    <SvgXml xml={disabledCorrectIcon} height={15} width={15} style={{ marginHorizontal: 3, opacity: 0.5 }} />
                                }
                                <Text style={{ marginHorizontal: 3, alignSelf: 'center', ...commonStyles.fontStyles(10, activeTheme.grey, 4) }}>{el.msg1}</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: 'rgb(245, 248, 255)', borderRadius: 5, marginHorizontal: 3, height: 40, alignItems: 'center', flexDirection: 'row' }}>
                                {password.length > 0 ?
                                    <SvgXml xml={!validationsArr[el.id1] ? errorIcon : correctsign} height={15} width={15} style={{ marginHorizontal: 3 }} />
                                    :
                                    <SvgXml xml={disabledCorrectIcon} height={15} width={15} style={{ marginHorizontal: 3, opacity: 0.5 }} />
                                }
                                <Text style={{ marginHorizontal: 3, alignSelf: 'center', ...commonStyles.fontStyles(10, activeTheme.grey, 4) }}>{el.msg2}</Text>
                            </View>
                        </View>
                    ))


                }
            </View>
        }
    },
    errorMessageUi: (value, focusedField, fieldName, errorMessage, isValid) => {
        // console.log("value :", value);
        // console.log("focusedField :", focusedField);
        // console.log("fieldName :", fieldName);
        // console.log("errorMessage :", errorMessage);
        // console.log("isValid :", isValid);
        if ((value.length > 0 && focusedField === fieldName && !isValid)) {
            return <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 5 }}>
                <Text style={{ alignSelf: 'center', color: '#EB297F' }}>{errorMessage}</Text>
            </View>
        }
        else {
            return;
        }
    }
}