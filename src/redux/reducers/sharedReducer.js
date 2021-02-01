import { GET_SET_FOOTER_TABS_ACTION } from "../actions/types";

const footerNavReducer = (state = {}, action) => {
    switch (action.type) {
        case GET_SET_FOOTER_TABS_ACTION:
            return { ...action.payload };
        default:
            return state;
    }
};

export {
    footerNavReducer
}