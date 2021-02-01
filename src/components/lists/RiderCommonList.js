import React, { Fragment } from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';


const RiderCommonList = props => {
    let keys = Object.keys(props.data[0]);
    console.log(keys)
    return props.data.map((row, i) => (
        <TouchableOpacity key={i} onPress={() => props?.onPress(row)}>
            <View style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ height: 12, width: 12, borderRadius: 6, borderColor: props.activeTheme.default, backgroundColor: props.activeTheme.default, }} />
                    <View style={{ paddingLeft: 5 }}>
                        <Text>{row[keys[1]]}</Text>
                    </View>
                </View>
                <SvgXml xml={`<svg xmlns="http://www.w3.org/2000/svg" width="9.608" height="17.737" viewBox="0 0 9.608 17.737">
<g id="next" transform="translate(-117.33 0)">
  <g id="Group_1164" data-name="Group 1164" transform="translate(117.33 0)">
    <path id="Path_1704" data-name="Path 1704" d="M126.721,8.346,118.592.217a.739.739,0,0,0-1.045,1.045l7.607,7.607-7.607,7.607a.739.739,0,1,0,1.045,1.045l8.129-8.129A.738.738,0,0,0,126.721,8.346Z" transform="translate(-117.33 0)" fill="#7b7b7b"/>
  </g>
</g>
</svg>`} height={15} width={15} />
            </View>
            <View style={{ borderBottomColor: props.activeTheme.lightGrey, borderBottomWidth: 1 }} />
        </TouchableOpacity>
    ))
}

export default RiderCommonList
