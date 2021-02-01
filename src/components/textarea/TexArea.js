import React from 'react'
import { TextInput, Platform } from 'react-native'

export default function TexArea(props) {
    const { numberOfLines, styles, height, onChangeHandler } = props;
    return (
        <TextInput multiline={true} numberOfLines={5} style={{ borderRadius: 5, borderColor: '#707070', borderWidth: 0.2, textAlignVertical: 'top', padding: 5, height: Platform.OS === 'ios' ? height : undefined }} onChange={(e) => onChangeHandler(e)} />
    )
}
