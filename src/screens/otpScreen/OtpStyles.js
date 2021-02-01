import { StyleSheet, Dimensions } from 'react-native';
import plateformSpecific from '../../utils/plateformSpecific';
import commonStyles from '../../styles/styles';
export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        alignSelf: 'stretch',
        // backgroundColor: 'red'
    },
    row: {
        // flex: 1,
        flexDirection: "column",
        width: "100%",
        top: 5,
        paddingVertical: 10,
        marginVertical: 20
    },

    otpCaption: activeTheme => ({
        ...commonStyles.fontStyles(16, activeTheme.default, 3),
        paddingVertical: 40,
        alignSelf: 'flex-start',
        top: 10
        // paddingHorizontal: 20,
        // marginHorizontal: 20
        // backgroundColor: 'red'
        // textAlign: 'flex-start'
    }),
    newotpWrap: {
        flex: 1,
        flexDirection: 'row',
    },
    catpion: activeTheme => ({
        ...commonStyles.fontStyles(16, activeTheme.default, 3),
        paddingVertical: 30,
        alignSelf: 'flex-start',
        paddingHorizontal: 20,
        top: 10
        // marginHorizontal: 20
        // backgroundColor: 'red'
        // textAlign: 'flex-start'
    }),
    androidOtpWrap: {
        // flex: 1,
        // paddingHorizontal: 20,
        // backgroundColor: 'red',
        top: 20,
        flexDirection: 'row',
        paddingVertical: 5,
    },
    otpWrap: {
        flex: 0.5,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignSelf: 'center',
        paddingVertical: 5,
    },
    countryCode: {
        borderWidth: 0.5,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingVertical: 0,
        height: 50,
        width: 70,
        marginRight: 10,
        fontSize: 12,
        textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    mobNumView: (activeTheme, borderColor, cellNo, isValid) => ({
        borderWidth: 0.5,
        borderColor,
        borderRadius: 5,
        paddingVertical: 0,
        height: 50,
        width: '80%',
        fontSize: 16,
        textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),

    pickerStyles: (activeTheme) => ({
        ...commonStyles.fontStyles(16, activeTheme.black, 3),
        height: 40,
        width: 100,
        textAlignVertical: 'center'

    }),
    mobNoField: (activeTheme, isValid) => ({
        ...commonStyles.fontStyles(16, activeTheme.black, 3),
        flex: 1,
        paddingLeft: 7,
        textAlignVertical: 'center',
        height: 100
    }),
    wrapper: (activeTheme, minHeight) => ({
        // flex: 1,
        minHeight: minHeight ? minHeight : undefined,
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: '#fff',
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        zIndex: 3,
        // position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        shadowColor: '#000',
        paddingBottom: 0,
        // paddingTop: 35,
        paddingHorizontal: 20,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    }),
    tempContainer: activeTheme => ({
        flex: 1,
        ...StyleSheet.absoluteFill,
        flexDirection: "column",
        alignSelf: 'stretch',

    }),
    tempotpWrap: {
        flex: 1,
        paddingVertical: 5,
        // backgroundColor: 'red'
        // flexDirection: 'row',
        // alignSelf: 'center',
    },
    tempWrapper: (activeTheme, keyboradState, screen) => ({
        flex: 1,
        // flex: 6,
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
        // backgroundColor: 'red',
        // paddingHorizontal: 20,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    }),
    IcoImg: {
        width: 120,
        height: 120,
        position: 'absolute',
        top: -75,
    },
    iosCorrentSign: {
        width: 25,
        height: 25,
        alignSelf: 'center'
    },
    correntSign: {
        width: 20,
        height: 20,
        alignSelf: 'flex-end',
        left: 15
        // marginTop: 5,
        // paddingHorizontal: 20
    },
    input: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: '#000',

    },
    otpCode: {
        borderWidth: 0.5,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingVertical: 0,
        height: 50,
        width: 70,
        marginRight: 10,
        fontSize: 12,
        textAlign: 'center',
        color: '#000'
    },

    androidInstructions: (activeTheme, fontIndex, top) => ({
        ...commonStyles.fontStyles(15, activeTheme.default, 1),
        // textAlign: 'left',
        // paddingVertical: 25,
        // top: top ? top : 15
    }),
    iosInstructions: (activeTheme) => ({
        ...commonStyles.fontStyles(15, activeTheme.default, 1),
        // textAlign: 'center',
        // paddingVertical: 50,
        // top: top ? top : 15
    }),
    iosMobileInstructions: (activeTheme) => ({
        ...commonStyles.fontStyles(12, activeTheme.grey, 3),
        // textAlign: 'center',
        // paddingVertical: 50,
        // top: top ? top : 15
    }),
    otpEmailVerifyinstructions: (activeTheme, fontIndex, top) => ({
        ...commonStyles.fontStyles(15, activeTheme.grey, fontIndex ? fontIndex : 4),
        paddingVertical: 20,
        color: activeTheme.default
        // textAlign: 'center',
        // top: top ? top : 15
    }),
    instructions: (activeTheme, fontIndex, top) => ({
        ...commonStyles.fontStyles(15, activeTheme.grey, fontIndex ? fontIndex : 4),
        textAlign: 'center',
        paddingVertical: 20,
        // top: top ? top : 15
    }),
    appButtonContainer: (backgroundColor, opacity) => ({
        paddingVertical: 20,
        backgroundColor: backgroundColor,
        width: Dimensions.get('window').width,
        opacity,
        justifyContent: 'center',
        alignItems: 'center',

    }),
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

    },
    // Otp.ios.js
    borderStyleBase: {
        width: 30,
        height: 45
    },

    borderStyleHighLighted: {
        borderColor: "#03DAC6",
    },

    underlineStyleBase: {
        width: 30,
        height: 45,
        borderWidth: 0,
        borderBottomWidth: 1,
    },

    underlineStyleHighLighted: activeTheme => ({
        borderColor: activeTheme.default,
    }),
});

