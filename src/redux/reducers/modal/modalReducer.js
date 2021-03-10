import { OPEN_MODAL, CLOSE_MODAL, SHOW_HIDE_IMAGE_VIEW ,UPDATE_MODAL_HEIGHT} from "../../actions/types";

let initState = {
    visible: false,
    transparent: true,
    okHandler: null,
    onRequestCloseHandler: null,
    ModalContent: null,
    notificationModalVisible:false,
    notificationModalContent:null,
    modalContentNotification:null,
    orderRecievedCheck:null,
    vendorSkipped:null,
    modalFlex: null,
    modalHeightDefault:null,
    modelViewPadding: 35,
    fadeAreaViewFlex: 1,
    fadeAreaViewStyle: {},
    imageViewState: {},
}
export default (state = initState, action) => {
    switch (action.type) {
        case OPEN_MODAL:
            // console.log('Payload :', action.payload);
            return { ...action.payload ,modalHeightDefault:action.payload.modalHeight};
        case UPDATE_MODAL_HEIGHT:
            // console.log('Payload :', action.payload);
            return { ...state,modalHeight:action.payload===false?state.modalHeightDefault:action.payload };
        case CLOSE_MODAL:
            return { ...initState,notificationModalVisible:false };
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