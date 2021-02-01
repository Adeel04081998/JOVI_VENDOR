import { GET_SET_ENUMS_ACTION } from "../../actions/types";

export default (state = { enums: {} }, action) => {
    switch (action.type) {
        case GET_SET_ENUMS_ACTION:
            return { ...action.payload };
        default:
            return state;
    }
}