import { StyleSheet } from 'react-native';
import commonStyles from '../../styles/styles'
export default orderStyles = StyleSheet.create({
    "content": (activeThem, i) => ({
        flex: 1,
        marginHorizontal: 20,
        borderRadius: 12,
        backgroundColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
        marginTop: i > 0 ? 10 : undefined,
    }),
    "imageContainer": activeThem => ({
        borderRadius: 12,
        backgroundColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 2,
        // ...commonStyles.fontStyles(16, '#000000', 3),
    }),
    "orderHistoryImageView": (activeTheme, topLeft, topRight) => ({
        flex: 1,
        aspectRatio: 1.5,
        borderTopLeftRadius: topLeft,
        borderTopRightRadius: topRight,
    }),
    "imageView": (activeTheme, topRight, bottomRight, bottomLeft, topLeft) => ({
        flex: 1,
        aspectRatio: 1.5,
        borderRadius: 10,
        // transform: [{ rotate: '90deg' }]
        // height: 200,
        // width: "100%",
        borderTopLeftRadius: topLeft,
        borderTopRightRadius: topRight,
        // borderBottomRightRadius: bottomRight,
        // borderBottomRightRadius: bottomLeft,
    }),
    "mainView": activeTheme => ({
        borderRadius: 10,
    }),
    "text": (activeThem, fontIndex) => ({
        ...commonStyles.fontStyles(14, '#000000', fontIndex),
    }),
    "pitstopText": activeThem => ({
        ...commonStyles.fontStyles(14, '#000000', 2),
    }),
    "jobText": (activeThem, size, color, fontFamily) => ({
        ...commonStyles.fontStyles(size, color, fontFamily),
    }),
    // Order History Details Screen
    "mainContainer": activeThem => ({
        marginHorizontal: 15
        // ...commonStyles.fontStyles(16, '#000000', 3),
    }),
    "row": activeThem => ({
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10
    }),
    "dateText": activeThem => ({
        ...commonStyles.fontStyles(14, activeThem.balck, 2),
    }),
    "descriptionText": activeThem => ({
        textAlign: "left",
        ...commonStyles.fontStyles(16, activeThem.balck, 2),
    }),
    "complaintFeedbackText": activeThem => ({
        ...commonStyles.fontStyles(14, activeThem.default, 4),

    }),
    "amountText": activeThem => ({
        ...commonStyles.fontStyles(14, activeThem.grey, 4),
    }),

})