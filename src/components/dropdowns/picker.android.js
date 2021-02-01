import React from 'react';
import { Picker } from 'react-native';

export default function CustomAndroidPickerItem({ data, style, setSelectedValue, selectedValue, enabled, prompt, mode }) {
    // console.log('Data :', data)
    return (
        <Picker
            enabled={enabled}
            style={{ ...style }}
            mode={mode ? mode : "dialog"}
            prompt={prompt}
            onValueChange={itemValue => setSelectedValue(itemValue)}
            selectedValue={selectedValue}
        // accessibilityLabel={selectedValue}
        // accessibilityValue={selectedValue}
        >

            {
                data.map((item, i) => (
                    <Picker.Item key={i} label={item} value={item} />
                ))
            }
        </Picker>
    )
}
