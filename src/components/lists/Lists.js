import React from 'react';
import { View, Text } from 'react-native';
import listStyles from './listStyles';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';

export default function CustomLists(props) {
    const { data, nextIcon, onPress, activeTheme, listItem } = props;
    return data.map((list, i) => {
        return (
            <TouchableOpacity key={i} onPress={() => onPress(list)} style={{ paddingVertical: 1 }}>
                <View style={listStyles.listContainer}>
                    <View style={listStyles.listLeftContent}>
                        <View style={listStyles.listLeftItems}>
                            {
                                list.letter ?
                                    <View style={listStyles.circleView(activeTheme)}>
                                        <Text style={listStyles.circleInnerText}>{list.letter}</Text>
                                    </View>
                                    :
                                    <View style={{ paddingRight: 15 }} />
                            }
                            <View style={listStyles.noteView}>
                                <Text style={listStyles.noteText}>{listItem && list[listItem]}</Text>
                            </View>
                        </View>
                    </View>
                    {
                        nextIcon &&
                        <View style={listStyles.listRightView}>
                            <View style={listStyles.listRightIconView}>
                                <SvgXml xml={nextIcon} height={25} width={25} />
                            </View>
                        </View>
                    }

                </View>
            </TouchableOpacity>
        )
    })
}
