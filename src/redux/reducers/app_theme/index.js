import { DARK_MODE, LIGHT_MODE } from "../../actions/types"
let initialState = {
    lightMode: true,
    lightTheme: {
        container: {
            backgroundColor: 'transparent'
        },
        tabs: {
            backgroundActiveColor: '#7359BE',
            backgroundInActiveColor: '#FFFFFF',
        },
        background: '#7359BE',
        svgIconColor: '#7359be',
        headerBodyText: '#7359BE',
        default: '#7359BE',
        warning:'#fc3f93',
        white: '#fff',
        black: '#000',
        grey: '#707070',
        lightGrey: '#E2E2E2',
        recieptTitle: "#4D4D4D",
        validationRed: "#EB297F",
        disabledFieldColor: 'rgb(245, 248, 255)',
        borderColor: 'rgba(0,0,0,0.1)',
        listBgColor: "#F9F8F8",
        switchActiveColor: '#FC3F93'
    },
    darkTheme: {
        container: {
            backgroundColor: '#000'
        },
        tabs: {
            backgroundActiveColor: '#707070',
            backgroundInActiveColor: '#FFFFFF',
        },
        switchActiveColor: '#FFB6C1',
        background: '#707070',
        svgIconColor: '#FFFFFF',
        headerBodyText: '#FFFFFF',
        default: '#707070',
        white: '#fff',
        black: '#000',
        grey: '#707070',
        lightGrey: '#E2E2E2',
        recieptTitle: "#4D4D4D",
        validationRed: "#EB297F",
        disabledFieldColor: 'rgb(245, 248, 255)',
        borderColor: 'rgba(0,0,0,0.1)',
        listBgColor: "#F9F8F8",
        switchActiveColor: '#FC3F93'
    }
};
export default themeReducer = (state = initialState, action) => {
    switch (action.type) {
        case '':
            return { ...state }
        default:
            return state
    }
}