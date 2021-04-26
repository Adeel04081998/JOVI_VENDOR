import { SHOW_HIDE_LOADER, SHOW_HIDE_MODAL_LOADER } from "../types"

let defaultAction = {
    size: 100,
    type: 'WanderingCubes',
    color: '#fff',
    message: 'Please wait...',
}
export const showHideLoader = (isVisible, message) => {
    return {
        type: SHOW_HIDE_LOADER,
        payload: { ...defaultAction, isVisible, message, }
    }
}
export const showHideModalLoader = (check) => {
    return {
        type: SHOW_HIDE_MODAL_LOADER,
        payload:check
    }
}