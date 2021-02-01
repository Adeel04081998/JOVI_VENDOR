import React from 'react'
import { PickerIOS } from '@react-native-community/picker';

export default function CustomIosPickerItem(props) {
    const { data, style, setSelectedValue, selectedValue, enabled, prompt, mode } = props;
    return (
        <PickerIOS
            style={{ ...style }}
            selectedValue={selectedValue}
            accessible={enabled}
            // accessibilityState={{ disabled: true, expanded: false }}
            itemStyle={{ fontSize: 16 }}
            onValueChange={itemValue => setSelectedValue(itemValue)}

        >
            {
                (data || []).map((item, i) => {
                    return <PickerIOS.Item key={i} label={item} value={item} />
                })
            }
        </PickerIOS >
    )
}
