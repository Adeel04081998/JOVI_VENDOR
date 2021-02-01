import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../styles/colors';
// import constants from '../../styles/constants';
// let { button } = colors;
export default paginationStyles = StyleSheet.create({
    containerStyle: {
        backgroundColor: 'transparent',
        // position: 'absolute',
        // backgroundColor: 'blue',
    },
    dotStyle: {
        marginBottom: 28,
        width: 11,
        height: 11,
        borderRadius: 60,
        marginHorizontal: -5,
        backgroundColor: 'transparent',
        borderColor: '#FFFFFF',
        borderWidth: 2,

    },
    inactiveDotStyle: {
        width: 8,
        height: 8,
        backgroundColor: '#FFFFFF',
        // opacity: 20
    },
})