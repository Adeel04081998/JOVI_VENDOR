import React from 'react';
import { View, Text, TouchableOpacity, NativeModules, Platform } from 'react-native';
import commonStyles from '../../styles/styles';

export default function SubmitBtn({ title, activeTheme, onPress, style, disabled }) {
    const renderDevMenuTouchable = () => {
        if (__DEV__ && Platform.OS == "ios") {
            return (
                <TouchableOpacity
                    style={{ backgroundColor: 'blue' }}
                    onPress={() => {
                        NativeModules.DevMenu.reload();
                    }}
                    onLongPress={() => {
                        NativeModules.DevMenu.show();
                    }}
                >
                    <View style={{ width: 50, height: 25, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#fff' }}>Reload</Text>
                    </View>
                </TouchableOpacity>
            )
        }
        else {
            return null;
        }

    }
    return (
        <>
            {/* {renderDevMenuTouchable()} */}
            <TouchableOpacity onPress={onPress} style={style} disabled={disabled}>
                <Text style={{
                    ...commonStyles.fontStyles(14, activeTheme.white, 4),
                    alignSelf: "center",
                    elevation: 3
                }}>{title}</Text>
            </TouchableOpacity>
        </>
    )
}
