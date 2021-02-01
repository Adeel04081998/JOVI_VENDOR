import { StyleSheet } from 'react-native';
import plateformSpecific from '../../utils/plateformSpecific';
import constants from '../../styles/constants';
import fontFamilyStyles from '../../styles/styles';
const { androidFonts, iosFonts } = constants;
export default tabStyles = StyleSheet.create({
    ...fontFamilyStyles,
    "tabsContainer": styles => ({
        // flex: 0.1,
        minHeight: 60,
        // margin: 0,
        marginHorizontal: 15,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        // width: '90%',
        borderRadius: 10,
        borderWidth: 0.2,
        borderColor: '#fff',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        top: plateformSpecific(15, -10),
        ...styles
    }),
    "tabsView": (activeTheme, activeTab, i, styles) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: activeTab === i ? activeTheme.tabs.backgroundActiveColor : activeTheme.tabs.backgroundInActiveColor,
        ...activeTab === 0 ? { borderTopLeftRadius: styles.borderRadius || 10, borderBottomLeftRadius: styles.borderRadius || 10 } : {
            borderTopRightRadius: styles.borderRadius || 10,
            borderBottomRightRadius: styles.borderRadius || 10
        },
        ...i === 1 ? {
            borderTopRightRadius: styles.borderRadius || 10,
            borderBottomRightRadius: styles.borderRadius || 10
        } : {
                borderTopLeftRadius: styles.borderRadius || 10,
                borderBottomLeftRadius: styles.borderRadius || 10
            },
    }),
    "tabText": (activeTheme, activeTab, i, styles) => ({
        fontFamily: styles.fontFamily || plateformSpecific(androidFonts.proxima_nova_bold, iosFonts.proxima_nova_bold),
        fontSize: styles.fontSize || 14,
        alignSelf: 'center',
        color: activeTab === i ? styles.activeTextColor || '#FFFFFF' : styles.inActiveTextColor || '#000',
        // color: activeTab === i ? '#FFFFFF' : '#000'
    }),
})
