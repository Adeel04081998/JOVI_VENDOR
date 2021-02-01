import Axios from '../../../config/axios';
import { showHideLoader } from '../loader';
export const OtpAction = (url, data, onSuccess, onError, loaderMsg) => async dispatch => {
    console.log(data)
    dispatch(showHideLoader(true, loaderMsg && loaderMsg.length > 2 ? loaderMsg : ''));
    try {
        let res = await Axios.post(url, data);
        if (res.data.statusCode === 200) {
            dispatch(showHideLoader(false, ''));
            onSuccess(res);
        }
    } catch (error) {
        dispatch(showHideLoader(false, ''));
        onError(error.response.data);
    }
};

export const authActions = (url, method, onSuccess, onError, loaderMsg) => async dispatch => {
    console.log(data)
    dispatch(showHideLoader(true, loaderMsg && loaderMsg.length > 2 ? loaderMsg : ''));
    try {
        let res = await Axios.post(url, data);
        if (res.data.statusCode === 200) {
            dispatch(showHideLoader(false, ''));
            onSuccess(res);
        }
    } catch (error) {
        dispatch(showHideLoader(false, ''));
        onError(error)
    }
};
