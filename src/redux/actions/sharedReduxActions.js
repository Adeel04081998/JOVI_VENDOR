import { GET_SET_FOOTER_TABS_ACTION } from "./types";

const setFooterTabsAction = payload => {
    return {
        type: GET_SET_FOOTER_TABS_ACTION,
        payload
    }
};

export {
    setFooterTabsAction
}