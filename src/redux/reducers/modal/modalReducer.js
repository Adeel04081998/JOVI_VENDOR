import { OPEN_MODAL, CLOSE_MODAL, SHOW_HIDE_IMAGE_VIEW } from "../../actions/types";

let initState = {
    visible: false,
    transparent: true,
    okHandler: null,
    onRequestCloseHandler: null,
    ModalContent: null,
    modalFlex: null,
    modelViewPadding: 35,
    fadeAreaViewFlex: 1,
    imageViewState: {},
}
export default (state = initState, action) => {
    switch (action.type) {
        case OPEN_MODAL:
            // console.log('Payload :', action.payload);
            return { ...action.payload };
        case CLOSE_MODAL:
            return { ...initState };
        case SHOW_HIDE_IMAGE_VIEW:
            return {
                ...state,
                imageViewState: {
                    ...action.payload
                }
            };
        default:
            return state;
    }
}