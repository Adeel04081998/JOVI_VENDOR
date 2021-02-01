import { StyleSheet } from 'react-native';
import commonStyles from '../../styles/styles';
export default legalStyles = StyleSheet.create({
    "content": activeThem => ({
        flex: 1,
        marginHorizontal: 5,
    }),
    "mainView": activeTheme => ({
        flex: 1, backgroundColor: 'transparent',
    }),
    "idView": activeTheme => ({
        margin: 5
    }),
    "idText": activeThem => ({
        ...commonStyles.fontStyles(18, '#000000', 3),
    }),
    "detailsView": activeTheme => ({
        margin: 5
    }),
    "detailsText": activeThem => ({
        ...commonStyles.fontStyles(16, '#000000', 2),
    }),
})