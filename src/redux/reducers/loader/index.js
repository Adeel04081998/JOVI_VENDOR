import { SHOW_HIDE_LOADER } from "../../actions/types";
let initState = {
    isVisible: false,
    size: 100,
    type: 'WanderingCubes',
    color: '#fff',
    message: 'Please wait...',
}
export default (state = initState, action) => {
    switch (action.type) {
        case SHOW_HIDE_LOADER:
            return { ...action.payload };
        default:
            return state;
    }
}