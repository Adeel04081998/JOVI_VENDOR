import { OPEN_MODAL, CLOSE_MODAL, SHOW_HIDE_IMAGE_VIEW } from "../types";

export const openModalAction = ModalComponent => {
    return {
        type: OPEN_MODAL,
        payload: ModalComponent
    }
};
export const closeModalAction = () => {
    return {
        type: CLOSE_MODAL,
    }
};
export const showHideImageViewAction = payload => {
    return {
        type: SHOW_HIDE_IMAGE_VIEW,
        payload
    }
}