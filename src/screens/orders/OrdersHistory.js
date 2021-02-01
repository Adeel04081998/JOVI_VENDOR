import React, { useState } from 'react';
import { View, Text } from 'react-native';
import orderStyles from './orderStyles';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { sahredConvertIntoSubstrings } from '../../utils/sharedActions';
export default function OrdersHistory(props) {
    const [state, setState] = useState({
        "croppedImage": ""
    })
    // console.log("OrdersHistory.Props :", props);
    const { onPress, activeTheme, data, parentState, paginationHandler } = props;
    // return !data.length ? recordsNotExistUI(parentState.noRecFound)
    return !data.length ? <View />
        : (
            <ScrollView
                onScroll={e => {
                    let paddingToBottom = 1
                    paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                    if (e.nativeEvent.contentOffset.y > e.nativeEvent.contentSize.height - paddingToBottom) {
                        if (parentState.orderList.paginationInfo.actualPage < parentState.orderList.paginationInfo.totalPages) paginationHandler(parentState.pageNumber + 1, parentState.itemsPage, false);
                    }
                }}
            >
                <View style={{ backgroundColor: '#fff', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, padding: 5, borderColor: '#fff' }}>
                    {
                        (data || []).map((doc, i) => (
                            <TouchableWithoutFeedback key={i} onPress={() => onPress(doc)}>
                                <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={orderStyles.text(activeTheme, 4)}>
                                        {doc.orderDate}
                                    </Text>
                                    <Text style={orderStyles.text(activeTheme, 4)}>
                                        PKR {doc.totalAmount}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', }}>
                                    <View style={{ flex: 0.5, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center' }}>
                                        <View style={{ height: 15, width: 15, borderRadius: 7.5, borderColor: activeTheme.default, borderWidth: 2 }} />
                                        <View>
                                            <Text style={{ color: activeTheme.default, fontWeight: 'bold', bottom: 2 }}>{"|"}</Text>
                                        </View>
                                        <View style={{ height: 15, width: 15, borderRadius: 7.5, borderColor: activeTheme.default, backgroundColor: activeTheme.default, }} />
                                    </View>
                                    <View style={{ flex: 5.5, flexDirection: 'column' }}>
                                        <Text style={[orderStyles.pitstopText(activeTheme), { bottom: 8 }]}>{sahredConvertIntoSubstrings(doc.firstPitStopTitle, 50, 0, 50)}</Text>
                                        <View />
                                        <Text style={[orderStyles.pitstopText(activeTheme), { top: 8 }]}>{sahredConvertIntoSubstrings(doc.lastPitstopTitle, 50, 0, 50)}</Text>
                                    </View>
                                </View>
                                <View style={{ padding: 10 }}>
                                    <Text style={[orderStyles.text(activeTheme, 4), { left: 22 }]}>{doc.jobCategoryString}</Text>
                                </View>
                                <View style={{ borderBottomColor: activeTheme.lightGrey, borderBottomWidth: 1, paddingVertical: 0 }} />
                            </TouchableWithoutFeedback>
                        ))
                    }
                </View>
            </ScrollView>
        )
}
