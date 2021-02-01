import { StyleSheet, Dimensions, Platform } from 'react-native';
import commonStyles from '../../styles/styles';
const { height, width } = Dimensions.get('window');
export default walletHistoryStyles = StyleSheet.create({
    // History
    "viewContainer": activeThem => ({
        // marginVertical: Platform.select({ ios: 0, android: 0 }),
        // bottom: Platform.select({ ios: 20, android: 0 })

    }),
    "amountView": activeTheme => ({
        padding: 10
        // marginBottom: 10,
        // backgroundColor: activeTheme.white,
        // justifyContent: 'center',
        // alignItems: 'center',
    }),
    "tabsContainer": activeThem => ({
        flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center',
        // top: Platform.select({ ios: 0, android: 10 }),
        top: 10,
        alignSelf: 'flex-start',
        paddingHorizontal: 15,
        width: '100%',
    }),
    "tabBox": activeTheme => ({
        height: 20, width: 20, borderRadius: 10, borderWidth: 1, borderColor: activeTheme.default, justifyContent: 'center', alignItems: 'center'
    }),
    "boxInner": (activeTheme, activeBox, index) => ({
        height: 8, width: 8, borderRadius: 4, borderWidth: 1, borderColor: activeBox === index ? activeTheme.default : "#fff", backgroundColor: activeBox === index ? activeTheme.default : "#fff"
    }),
    "text": activeTheme => ({
        // backgroundColor: "red",
        ...commonStyles.fontStyles(18, activeTheme.black, 4),
    }),
    "listViewContainer": activeTheme => ({
        // marginVertical: 5,
        paddingHorizontal: 15,

    }),
    "dateDayView": activeTheme => ({
        // margin: 2,

    }),
    "dateDay": activeTheme => ({
        ...commonStyles.fontStyles(16, '#060606', 2),
    }),
    "descAmountView": activeTheme => ({
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginVertical: 10,
    }),
    "descText": (activeTheme, status) => ({
        ...commonStyles.fontStyles(16, status === 'Solved' ? "#46E54B" : status === 'Active' ? '#E35555' : '#060606', 1),
    }),
    "noteText": activeTheme => ({
        // marginTop: 20,
        top: 3,
        paddingVertical: 10,
        ...commonStyles.fontStyles(16, '#060606', 2),
    }),

    // Cashout screen
    "container": activeTheme => ({
        flex: 1,
        // bottom: Platform.select({ ios: 15, android: 0 }),
        // maxHeight: 400,
        backgroundColor: activeTheme.white,
        // backgroundColor: "yellow",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        elevation: 3
    }),
    defaultInputArea: (activeTheme, focusedField, currentField) => ({
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: focusedField === currentField ? activeTheme.default : activeTheme.borderColor,
        paddingVertical: 0,
        height: 60,
        marginBottom: 10,
        paddingHorizontal: 10,

    }),
})