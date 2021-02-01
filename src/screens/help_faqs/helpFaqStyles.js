import { StyleSheet } from 'react-native';
import commonStyles from '../../styles/styles'
// import constants from '../../styles/constants';
// import plateformSpecific from '../../utils/plateformSpecific';
// const { androidFonts, iosFonts } = constants;
export default helpFaqsStyles = StyleSheet.create({
    "viewContainer": activeThem => ({
        flex: 1,
        marginHorizontal: 10,
        backgroundColor: 'transparent',
        flexDirection: 'column'
    }),
    "text": activeTheme => ({
        ...commonStyles.fontStyles(18, '#000000', 2),
        marginLeft: 5,
        paddingBottom: 10
    })
})