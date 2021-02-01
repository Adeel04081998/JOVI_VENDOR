const { USER_ACTION, NOTIFY_ACTION, UPDATE_NOTIFY_ACTION, CART_ACTION } = require("../types");

export const userAction = userPayload => dispatch => {
    dispatch({
        type: USER_ACTION,
        payload: userPayload
    })
};
export const notifyAction = notifyPayload => {
    return {
        type: NOTIFY_ACTION,
        payload: notifyPayload,
    }
};
export const updateNotifyAction = updatedPayload => {
    return {
        type: UPDATE_NOTIFY_ACTION,
        payload: updatedPayload,
    }
};

export const cartAction = cartPayload => {
    return {
        type: CART_ACTION,
        payload: cartPayload,
    }
};
