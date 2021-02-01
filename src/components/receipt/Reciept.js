import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import commonStyles from '../../styles/styles';

export default function Reciept({ activeTheme, orderDetails }) {
    const { width } = Dimensions.get('window');
    let addRecieptLines = () => {
        let arr = [];
        for (let index = 0; index < 70; index++) {
            arr.push('-')
        }
        return arr;
    };
    let renderList = () => (
        <View style={{ flexDirection: 'row', maxWidth: width - 30, overflow: 'hidden' }}>
            {addRecieptLines().map((line, i) => (
                <Text key={i} style={{ marginLeft: 3 }}>
                    {line}
                </Text>
            ))}
        </View>
    )
    return (
        <>
            <View style={{ flexDirection: 'row', maxWidth: width - 30, overflow: 'hidden' }}>
                {renderList()}
            </View>
            <View style={{ alignSelf: 'center' }} >
                <Text style={{ ...commonStyles.fontStyles(18, activeTheme.recieptTitle, 3) }}>*** RECEIPT ***</Text>
            </View>
            {renderList()}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <Text style={{ ...commonStyles.fontStyles(14, activeTheme.recieptTitle, 3) }}>Date</Text>
                <Text style={{ ...commonStyles.fontStyles(14, activeTheme.recieptTitle, 3) }}>{orderDetails.orderDate}</Text>
            </View>
            <View style={{ flexDirection: 'row', maxWidth: width - 30, overflow: 'hidden' }}>
                {renderList()}
            </View>
            <View style={{ marginVertical: 10, marginHorizontal: 20 }}>
                {
                    orderDetails.pitStopsList.map((d, i) => (
                        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ ...commonStyles.fontStyles(14, activeTheme.recieptTitle, 3) }}>{`Pitstope ${i + 1} - ${d.jobAmountTypeDescrp}`}</Text>
                            <Text style={{ ...commonStyles.fontStyles(14, activeTheme.recieptTitle, 3) }}>{d.jobAmount}</Text>
                        </View>
                    ))
                }
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <Text style={{ ...commonStyles.fontStyles(14, activeTheme.recieptTitle, 3) }}>Total</Text>
                <Text style={{ ...commonStyles.fontStyles(14, activeTheme.recieptTitle, 3) }}>{orderDetails.totalAmount}</Text>
            </View>
        </>
    )
}
