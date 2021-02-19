import { StyleSheet, Dimensions } from 'react-native';
import plateformSpecific from '../../utils/plateformSpecific';
import commonStyles from '../../styles/styles';
export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        alignSelf: 'stretch',
        // backgroundColor: '#fff'
        // opacity: 0.2
    },
    row: {
        flex: 1,
        flexDirection: "column",
        width: Dimensions.get('window').width,
    },
    catpion: activeTheme => ({
        ...commonStyles.fontStyles(16, activeTheme.black, 3),
        marginVertical: 5,
        marginHorizontal:5,
        alignSelf: 'flex-start'
    }),
    catpionLogout: activeTheme => ({
        ...commonStyles.fontStyles(16, activeTheme.default, 3),
        // marginVertical: 5,
        // marginHorizontal:5,
        alignSelf: 'flex-end'
    }),
    tempContainer: activeTheme => ({
        flex: 1,
        ...StyleSheet.absoluteFill,
        flexDirection: "column",
        alignSelf: 'stretch',

    }),
    tempWrapperSignIn: (activeTheme, keyboradState, screen) => ({
        flex: screen && screen === 1 ? 0 : keyboradState ? 5 : 3,
        // flex: screen && screen === 1 ? 0 : keyboradState ? 5 : 10,
        alignSelf: 'flex-end',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: '#fff',
        width: '100%',
        // borderTopLeftRadius: 10,
        // borderTopRightRadius: 10,
        bottom: 0,
        alignSelf: 'center',
        shadowColor: '#000',
        paddingBottom: 0,
        paddingTop: 10,
        // borderWidth:0,
        // borderColor: 'white',
        // paddingHorizontal: 20,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    }),
    tempWrapper: (activeTheme, keyboradState, screen) => ({
        flex: screen && screen === 1 ? 0 : keyboradState ? 5 : 3,
        // flex: screen && screen === 1 ? 0 : keyboradState ? 5 : 10,
        alignSelf: 'flex-end',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: '#fff',
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        bottom: 0,
        alignSelf: 'center',
        shadowColor: '#000',
        paddingBottom: 0,
        paddingTop: 10,
        borderColor: activeTheme.default,
        // paddingHorizontal: 20,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    }),
    wrapper: (activeTheme, minHeight) => ({
        minHeight: minHeight ? minHeight : undefined,
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: '#fff',
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        // zIndex: 3,
        // position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        shadowColor: '#000',
        paddingBottom: 0,
        // paddingTop: 35,
        paddingHorizontal: 10,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    }),
    userRegWrap: (activeTheme, keyboradState) => ({
        flex: 1,
        width: '100%',
        marginHorizontal: 20,
        // alignItems: 'flex-end',
        // backgroundColor: 'yellow'

    }),
    regWrap: {
        marginHorizontal: 10,
        // backgroundColor: 'yellow'
        // maxWidth: '90%',
        // width: Dimensions.get('window').width,
        // marginHorizontal: 100,
        // display: 'flex',
        // alignSelf: 'stretch',
        // marginVertical: 2

    },
    Inputcatpion: (value, activeTheme, isValid, focusedField, currentField) => ({
        ...commonStyles.fontStyles(14, (value.length > 0 && focusedField === currentField && !isValid) ? activeTheme.validationRed : '#000', 3),
        marginBottom: 5,
        // marginVertical: 5
    }),
    regInputArea: (activeTheme, isValid, focusedField, currentField) => ({
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: (focusedField === currentField && !isValid) ? activeTheme.validationRed : focusedField === currentField ? activeTheme.default : 'rgba(0,0,0,0.1)',
        paddingVertical: 0,
        height: 50,
        marginBottom: 10,
        paddingHorizontal: 10,
    }),
    defaultInputArea: (activeTheme, state) => ({
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'rgba(0,0,0,0.1)',
        paddingVertical: 0,
        height: 50,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: state && state.focusedField === 'email' && !state.enableForm ? activeTheme.disabledFieldColor : "#fff"

        // marginHorizontal: 30
    }),
    appButtonContainer: (activeTheme, isValid) => ({
        backgroundColor: isValid && isValid ? activeTheme.default : activeTheme.lightGrey,
        paddingVertical: 20,
        width: Dimensions.get('window').width,
    }),
    appButtonText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        fontFamily: plateformSpecific('proxima-nova', 'Proxima Nova'),
        elevation: 3
    },
    touchableText: activeTheme => ({
        ...commonStyles.fontStyles(14, activeTheme.default, 4)
    }),
    btmBg: {
        width: '100%',
        height: 100,
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        zIndex: 2
    },
    overlayBg: {
        // position: 'relative',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        opacity: 0.6,
        // zIndex: 1
    },
    bgImg: {
        resizeMode: "cover",
        width: '100%',
        height: '100%',

    },

});

