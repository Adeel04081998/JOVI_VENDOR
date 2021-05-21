import {CLEAR_PRINTER, SET_PRINTER} from "../../actions/types";

let initState = {
    currentPrinter: null,
}
export default (state = initState, action) => {
    switch (action.type) {
        case SET_PRINTER:
            // console.log('Payload :', action.payload);
            return { ...state,currentPrinter:action.payload };
        case CLEAR_PRINTER:
            // console.log('Payload :', action.payload);
            return { ...initState};
        default:
            return state;
    }
}