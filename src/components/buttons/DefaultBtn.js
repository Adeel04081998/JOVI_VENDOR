import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import commonStyles from '../../styles/styles';


export default ({ title, onPress, disabled, backgroundColor }) => <TouchableOpacity disabled={disabled} style={{ paddingVertical: 20, backgroundColor: backgroundColor || '#7359BE', justifyContent: 'center', alignItems: 'center' }} onPress={onPress}>
    <Text style={commonStyles.fontStyles(16, "#fff", 4)}>{title}</Text>
</TouchableOpacity >
