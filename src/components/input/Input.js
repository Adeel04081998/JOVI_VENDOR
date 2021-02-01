import React from "react";
import { View, Text, Keyboard } from 'react-native';
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import Validator from 'validator';
import correctIcon from '../../assets/svgIcons/common/correct_icon.svg';
import errorIcon from '../../assets/svgIcons/common/error_icon.svg';
import { SvgXml } from 'react-native-svg';
const CustomInput = props => {
    // console.log("CustomInput.Props :", props)
    const {
        onValidation,
        onChangeHandler,
        pattern,
        style,
        name,
        value,
        children,
        parentState,
        allFieldsValid,
        returnKeyType,
        replaceRightIcon,
        rightIcon,
        rightIconHandler
    } = props;
    const handleValidation = (stringValue) => {
        // debugger;
        // console.log('handleValidation Called--- :', stringValue);
        let result = false;
        if (!pattern) return result = true;
        if (pattern === 'email') result = Validator.isEmail(stringValue.trim());
        // let spacesRemovedValue = stringValue.replace(/\s/g, '');
        else if (pattern === 'alpha') result = Validator.isAlpha(stringValue) && Validator.isLength(stringValue, { min: 2, max: 250 });
        else if (pattern === 'number') result = Validator.isNumeric(stringValue);
        else if (pattern === 'password') result = Validator.isLength(stringValue, { min: 8, max: 32 });
        else if (pattern === 'mobile') {
            if (stringValue.slice(0, 2) === '92') result = Validator.isNumeric(stringValue) && Validator.isLength(stringValue, { min: 12, max: 12 });
            else if (stringValue.slice(0, 1) === '3') result = Validator.isNumeric(stringValue) && Validator.isLength(stringValue, { min: 10, max: 10 });
        }
        else result = true;
        return result;
        // console.log(result);
    }
    const onChange = (value) => {
        // debugger;
        const isValid = handleValidation(value);
        onValidation && onValidation(isValid, name, value);
        onChangeHandler && onChangeHandler(value);
    }
    return (
        <View style={{
            // flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <TextInput
                style={style}
                onChangeText={value => onChange(value)}
                returnKeyType={returnKeyType || "next"}
                textContentType="none"
                autoCompleteType="off"
                // keyboardType="number-pad"
                {...props}

            // autoCompleteType=""
            // autoCorrect
            // autoCapitalize
            // blurOnSubmit={false}
            />
            {
                rightIcon ?
                    <View style={{ maxWidth: '100%', position: 'absolute', right: 0, top: 15, paddingRight: 10 }}>
                        <TouchableOpacity onPress={rightIconHandler ? rightIconHandler : () => { }}>
                            <SvgXml xml={rightIcon} height={25} width={25} />
                        </TouchableOpacity>
                    </View>
                    :
                    null
            }
            {
                replaceRightIcon !== undefined && replaceRightIcon ? null :
                    <View style={{ flex: 1, width: '97%', position: 'absolute' }}>
                        {
                            value.length && parentState.focusedField === name && parentState.focusedField !== 'password' && !parentState.isValid ?
                                <SvgXml xml={`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                <g id="error_Ico" transform="translate(-310 -214)">
                                  <circle id="Ellipse_41" data-name="Ellipse 41" cx="10" cy="10" r="10" transform="translate(310 214)" fill="#fc3f93"/>
                                  <g id="error" transform="translate(315 198.641)">
                                    <path id="Path_208" data-name="Path 208" d="M10.292,28.361l-4.231-7.51a.985.985,0,0,0-1.705,0L.126,28.361a.991.991,0,0,0,.853,1.476H9.407A1,1,0,0,0,10.292,28.361Z" transform="translate(0)" fill="#beb5b5"/>
                                    <path id="Path_209" data-name="Path 209" d="M46.644,63.025l4.231,7.51H42.413l4.231-7.51Z" transform="translate(-41.435 -41.682)" fill="#fff"/>
                                    <g id="Group_209" data-name="Group 209" transform="translate(4.518 23.999)">
                                      <path id="Path_210" data-name="Path 210" d="M195.908,179.013l.262,1.738a.427.427,0,0,0,.426.361h0a.454.454,0,0,0,.426-.361l.262-1.738a.682.682,0,0,0-.689-.787h0A.7.7,0,0,0,195.908,179.013Z" transform="translate(-195.905 -178.226)" fill="#3f4448"/>
                                      <circle id="Ellipse_176" data-name="Ellipse 176" cx="0.394" cy="0.394" r="0.394" transform="translate(0.298 3.247)" fill="#3f4448"/>
                                    </g>
                                  </g>
                                </g>
                              </svg>
                              `} height={18} width={18} style={{ alignSelf: 'flex-end', bottom: 5 }} />
                                :
                                allFieldsValid &&
                                <SvgXml xml={correctIcon} height={18} width={18} style={{ alignSelf: 'flex-end', bottom: 5 }} />
                        }
                    </View>
            }
        </View>
    );
}

export default CustomInput;
