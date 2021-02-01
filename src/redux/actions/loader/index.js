import { SHOW_HIDE_LOADER } from "../types"

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