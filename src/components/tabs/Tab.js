import React from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import tabStyles from './tabStyles';
export default ({ tabsArr, activeTab, tabHandler, activeTheme, tabsContainerStyles, tabsViewStyles, tabTextStyles }) => {
    return (
        <View style={tabStyles.tabsContainer(tabsContainerStyles || {})}>
            {tabsArr.map((tab, i) => {
                return (
                    <View key={i} style={[tabStyles.tabsView(activeTheme, activeTab, i, tabsViewStyles || {})]}>
                        <TouchableOpacity onPress={() => tabHandler(i)} style={{ minWidth: '90%', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ ...tabStyles.tabText(activeTheme, activeTab, i, tabTextStyles || {}) }}> {tab}</Text>
                        </TouchableOpacity>
                    </View>
                )
            })}
        </View>
    )
}
