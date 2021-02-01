import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import errorsUI from '../../components/validations';
import CustomInput from '../../components/input/Input';
import { SvgXml } from 'react-native-svg';
import closeEye from '../../assets/svgIcons/common/close_eye.svg';
import openEye from '../../assets/svgIcons/common/open_eye.svg';

export default function ChangePassword({ styles, parentState, onValidation, onChangeHandler, onFocus, activeTheme, handleIsValidFromChangePsw }) {
    // console.log("ChangePassword.parentState :", parentState)
    const [state, setState] = useState({
        fieldsData: [
            { id: 1, show: false, editable: true, field: "oldPassword", title: 'Old Password', pattern: '', validationerror: "", value: parentState.oldPassword },
            { id: 2, show: false, editable: true, field: "newPassword", title: 'New Password', pattern: 'password', validationerror: "", value: parentState.newPassword },
            { id: 3, show: false, editable: true, field: "confirmPassword", title: 'Confirm Password', pattern: 'password', validationerror: "Passwords do not match", value: parentState.confirmPassword },
        ],
    });
    const handleValidationChange = (isValid, name, value, focusedIndex) => {
        // console.log("handleValidationChange.Value :", value);
        onValidation(isValid, name, value);
        let changedArray = state.fieldsData.map((z, j) => {
            if (focusedIndex === j) {
                z.value = value;
                return z;
            } else {
                if (!value) {
                    handleIsValidFromChangePsw(true)
                    z.editable = true;
                } else {
                    z.editable = isValid;
                }
                return z;
            }
        })
        setState(pre => ({
            ...pre,
            fieldsData: changedArray
        }))
        // console.log(isValid)
    };
    const showHidePassword = fieldID => {
        let findAndUpdateRow = state.fieldsData.map(R => {
            if (R.id === fieldID) {
                R.show = !R.show;
                return R
            } else return R;
        });
        setState(pre => ({ ...pre, fieldsData: findAndUpdateRow }))
    };
    const handleEditables = (rec, idx) => {
        if (idx > 0 && idx < 2) {
            if (!parentState.oldPassword.length) return false;
            else return rec.editable;
        };
        if (idx === 2) {
            if (!parentState.newPassword.length) return false;
            else return rec.editable;
        }
        else return rec.editable;
    };
    // console.log('ChangePassword.State :', state);
    return state.fieldsData.map((x, i) => (
        <View key={i}>
            <View style={{ paddingBottom: 5 }}>
                <Text>
                    {x.title}
                </Text>
            </View>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: "hidden"
            }}>
                <CustomInput
                    onValidation={(validBool, fieldName, value) => handleValidationChange(validBool, fieldName, value, i)}
                    placeholder={x.title}
                    editable={handleEditables(x, i)}
                    // style={[styles, { paddingRight: 45 }]}
                    // style={passwordStyles.defaultInputArea(activeTheme, x.field, parentState, x.editable ? "#fff" : activeTheme.disabledFieldColor)}
                    style={passwordStyles.defaultInputArea(activeTheme, x.field, parentState, handleEditables(x, i) ? "#fff" : activeTheme.disabledFieldColor)}
                    value={x.value}
                    datavalue={x.value}
                    onChangeHandler={value => onChangeHandler(x.field, value)}
                    pattern={x.pattern}
                    name={x.field}
                    parentState={parentState}
                    onFocus={() => onFocus(x.field)}
                    secureTextEntry={!x.show}
                    allFieldsValid={parentState.oldPassword.length > 0 && parentState.newPassword.length > 0 && parentState.confirmPassword.length > 0 && parentState.isValid ? true : false}
                    maxLength={32}
                    replaceRightIcon={true}
                    // autoFocus={i === 0 ? true : false}

                />
                {
                    x.value.length > 0 &&
                    <TouchableOpacity onPress={() => showHidePassword(x.id)} style={{ width: "20%", justifyContent: 'center', position: 'absolute', right: 0, paddingRight: 10, height: 60 }} >
                        <SvgXml xml={x.show ? openEye : closeEye} height={25} width={25} style={{ alignSelf: "flex-end", bottom: 5 }} />
                    </TouchableOpacity>
                }
            </View>
            {
                x.field === "newPassword" && !parentState.isValid ?
                    errorsUI.passwordErrorMessageUi(parentState.focusedField, x.field, x.value, activeTheme, parentState.validationsArr)
                    :
                    x.field === parentState.focusedField && !parentState.isValid ? errorsUI.errorMessageUi(x.value, x.field, x.field, x.validationerror, parentState.isValid) : null

            }
        </View>
    ))
}

const passwordStyles = StyleSheet.create({
    defaultInputArea: (activeTheme, currentField, state, bgColor) => ({
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: (state.focusedField === currentField && !state.isValid) ? activeTheme.validationRed : state.focusedField === currentField ? activeTheme.default : 'rgba(0,0,0,0.1)',
        paddingVertical: 0,
        height: 50,
        marginBottom: 10,
        paddingHorizontal: 10,
        // backgroundColor: (!state.isValid && state.focusedField !== currentField) ? activeTheme.disabledFieldColor : "#fff"
        backgroundColor: bgColor

    }),
});
