import { USER_ACTION, LOGOUT_ACTION, NOTIFY_ACTION, UPDATE_NOTIFY_ACTION, CART_ACTION } from "../../actions/types";

let initState = {
    "phoneNumber": "",
    "getProfileCall": false,
    "changeMobileNumber": false,
    "isLocalChange": false,
    "appTutorialsEnabled": true,
    pitstopType:0,
    pitstopID:0,
    noOfOpenOrders:0,
    "isUserOnline": false,
    "appNotifications": {
        "getNotificationLogViewModel": {
            "paginationInfo": {},
            "data": []
        },
    },
    "userCart": {
        "checkoutItemsVMList": {
            "pitstopCheckoutItemsListVM": [],
            "shippingCharges": null,
            "total": null,
        },
    }
}
export default (state = initState, action) => {
    switch (action.type) {
        case USER_ACTION:
            return { ...action.payload };
        case LOGOUT_ACTION:
            return { ...initState };
        case CART_ACTION:
            return {
                ...state,
                userCart: { ...action.payload }
            };
        case NOTIFY_ACTION:
            return {
                ...state, appNotifications: {
                    ...action.payload,
                    getNotificationLogViewModel: {
                        paginationInfo: {
                            ...action.payload.getNotificationLogViewModel.paginationInfo,
                            itemsPerPage: 20
                        },
                        data: state.appNotifications.getNotificationLogViewModel.data.concat(action.payload.getNotificationLogViewModel.data)
                    }
                }
            };
        case UPDATE_NOTIFY_ACTION:
            return {
                ...state,
                appNotifications: {
                    ...state.appNotifications,
                    getNotificationLogViewModel: {
                        ...state.appNotifications.getNotificationLogViewModel,
                        data: action.payload
                    }
                }
            };
        default:
            return state;
    }
}