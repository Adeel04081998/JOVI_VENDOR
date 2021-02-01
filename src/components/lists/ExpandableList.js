import React from 'react';
import { View, Text, TouchableWithoutFeedback, ScrollView, Alert, ActivityIndicator } from 'react-native';
import listStyles from './listStyles';

export default ExpandableList = props => {
    const { item, listIndex, title, desc, descriptionContent, callback, maxHeightProp, display, parentState, bgColor } = props;
    // console.log('[ExpandableList] item :', item);
    const toggleAreaExpended = cardIndex => callback && callback(item, cardIndex);
    return (
        <View style={{ minHeight: 60, paddingVertical: 1, backgroundColor: bgColor ? bgColor : '#fff', borderRadius: 10, borderColor: '#707070', borderWidth: 0.2, marginTop: listIndex > 0 ? 10 : 0 }}>
            <View style={{ flex: 1 }}>
                {
                    !title ? null :
                        <TouchableWithoutFeedback onPress={() => toggleAreaExpended(listIndex)} style={{ marginTop: 15 }}>
                            {/* <View style={{ flex: 1, marginTop: parentState.areaExpanded.index === listIndex && parentState.areaExpanded.expanded ? 15 : 0, justifyContent: !parentState.areaExpanded.expanded ? 'center' : undefined, paddingHorizontal: 12, paddingVertical: 10 }}> */}
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 }}>
                                <Text style={{ ...listStyles.fontStyles(16, '#060606', 1) }}>{title}</Text>
                                {
                                    item?.loading ? <ActivityIndicator size="small" color="#7359BE" /> : null
                                }
                            </View>
                        </TouchableWithoutFeedback>
                }

                <View style={{ display }} >
                    <View style={{ maxHeight: maxHeightProp ? maxHeightProp : 480, marginTop: 3 }}>
                        {
                            descriptionContent && descriptionContent
                        }
                        {
                            desc &&
                            <Text style={{ ...listStyles.fontStyles(14, '#000000', 2), marginLeft: 5, paddingBottom: 10 }}>
                                {desc}
                            </Text>
                        }
                    </View>
                </View>
                {
                    item?.cardLoader ?
                        <ActivityIndicator style={{ alignSelf: 'center', paddingVertical: 5 }} size="large" color="#7359BE" /> : null
                }
                {/* Marging left View End */}
            </View>

            {/* PARENT END */}
        </View >
    )
}
