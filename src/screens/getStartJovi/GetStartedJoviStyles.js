import { StyleSheet, Dimensions } from 'react-native';
import plateformSpecific from '../../utils/plateformSpecific';
export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        alignSelf: 'stretch',
    },
    wrapper: {
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: '#fff',
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        zIndex: 3,
        shadowColor: '#000',
        // paddingBottom: 20,
        paddingTop: 70,
        paddingHorizontal: 20,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    IcoImg: {
        display: 'flex',
        width: 120,
        height: 120,
        position: 'absolute',
        bottom: 75,
    },
    appButtonContainer: {
        backgroundColor: "#7359BE",
        // borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 15,
        width: Dimensions.get('window').width,
    },
    appButtonText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        fontFamily: plateformSpecific('proxima-nova', 'Proxima Nova')
    },
    btmBg: {
        width: '100%',
        height: 100,
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        zIndex: 2
    },
    overlayBg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        opacity: 0.6
    },
    bgImg: {
        resizeMode: "cover",
        width: '100%',
        height: '100%',

    }
});

