import { showHideLoader } from "../redux/actions/loader";
import Axios from '../config/axios';
import CustomToast from "../components/toast/CustomToast";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
import { navigateWithResetScreen } from "../utils/sharedActions";
export const refreshTokenMiddleware = async (requestCallback, params, dispatch) => {
    let prevToken = await AsyncStorage.getItem('User');
    postRequest(
        "/api/User/RefreshToken",
        {
            "accessToken": JSON.parse(prevToken).token.authToken,
            "refreshToken": JSON.parse(prevToken).refreshToken
        },
        {},
        dispatch,
        async res => {
            console.log("refreshTokenMiddleware.Res :", res)
            if (res.data.statusCode === 403) {
                // CustomToast.error('UnAuthorized User');
                AsyncStorage.removeItem("User");
                navigateWithResetScreen(0, [{ name: "Login" }])
                return;
            } else {
                await AsyncStorage.setItem('User', JSON.stringify(res.data));
                requestCallback.apply(this, params);
            }
        },
        err => {
            console.log("refreshTokenMiddleware.err", err)
        },
        "",
        true
    )


};
export const postRequest = async (url, data, headers, dispatch, onSuccess, onError, loaderMsg, loaderBool, middleWareCallback = () => { }) => {
    // console.log(data)
    // debugger;
    let internetConnectivity = await NetInfo.fetch();
    if (!internetConnectivity.isConnected) {
        onError({ response: "No internet connection" });
        return CustomToast.error('No internet connection');
    };
    middleWareCallback(true);
    dispatch(showHideLoader(loaderBool !== undefined ? loaderBool : true, loaderMsg && loaderMsg.length ? loaderMsg : 'Please wait...'));
    try {
        let res = await Axios.post(url, data, headers);
        // console.log('postRequest Response===----> :', res);
        // debugger;
        if (res.status === 200) {
            dispatch(showHideLoader(false, ''));
            onSuccess(res);
            middleWareCallback(false);
        }
    } catch (error) {
        console.log('postRequest : Logical error---- :', JSON.stringify(error.response ? error.response : error));
        // debugger;
        middleWareCallback(false);
        if (error?.response?.data) {
            if (error.response.data.StatusCode === 401) refreshTokenMiddleware(postRequest, [url, data, headers, dispatch, onSuccess, onError, loaderMsg, loaderBool], dispatch);
            // else if (error.response.data.statusCode === 404) CustomToast.error('Something Went Wrong!!');
            else if (error.response.data.statusCode === 500) CustomToast.error('Something Went Wrong!!');
            dispatch(showHideLoader(false, ''));
            onError(error.response.data);
        }
        else if (error?.response?.status) {
            if (error.response.status === 400) CustomToast.error('Bad Request---!!');
            else if (error.response.status === 404) CustomToast.error('Bad Request---!!');
            else if (error.response.status === 500) CustomToast.error('Something Went Wrong!!');
        }
    }
};
export const getRequest = async (url, customHeaders, dispatch, onSuccess, onError, loaderMsg, hideLoaderAfterCall = true, loaderBool = true) => {
    // debugger;
    let internetConnectivity = await NetInfo.fetch();
    if (!internetConnectivity.isConnected) {
        onError({ response: "No internet connection" });
        return CustomToast.error('No internet connection');
    }
    // console.log('Get Request Called and data is---- :', data);
    // console.log('Get Request headers----', customHeaders);
    dispatch(showHideLoader(loaderBool, loaderMsg && loaderMsg.length ? loaderMsg : 'Please wait...'));
    try {
        let res = await Axios.get(url, "Authorization" in customHeaders && { headers: customHeaders });
        // debugger;
        if (res.status === 200) {
            hideLoaderAfterCall && dispatch(showHideLoader(false, ''));
            onSuccess(res);
        }
    } catch (error) {
        if (error?.response?.data) {
            // debugger;
            if (error.response.data.StatusCode === 401) refreshTokenMiddleware(getRequest, [url, customHeaders, dispatch, onSuccess, onError, loaderMsg, hideLoaderAfterCall = true, loaderBool = true], dispatch);
            // else if (error.response.data.statusCode === 404) CustomToast.error('Something Went Wrong!!');
            else if (error.response.data.statusCode === 500) CustomToast.error('Something Went Wrong!!');
        }
        else if (error?.response?.status) {
            if (error.response.status === 400) CustomToast.error('Something Went Wrong!!');
            else if (error.response.status === 404) CustomToast.error('Something Went Wrong ddd!!');
            else if (error.response.status === 500) CustomToast.error('Something Went Wrong!!');
        }
        hideLoaderAfterCall && dispatch(showHideLoader(false, ''));
        onError(error);
    }
};
export const deleteRequest = async (url, data, headers, dispatch, onSuccess, onError, loaderMsg) => {
    let internetConnectivity = await NetInfo.fetch();
    if (!internetConnectivity.isConnected) {
        onError({ response: "No internet connection" });
        return CustomToast.error('No internet connection');
    }
    console.log(data);
    dispatch(showHideLoader(true, loaderMsg && loaderMsg.length ? loaderMsg : ''));
    try {
        let res = await Axios.delete(url, data, headers);
        if (res.data.statusCode === 200) {
            dispatch(showHideLoader(false, ''));
            onSuccess(res);
        }
    } catch (error) {
        if (error.response.data.StatusCode === 401) {
            CustomToast.error('UnAuthorized User');
            // return;
        }
        else {
            if (error.response.status === 400) CustomToast.error('Bad Request---!!');
            else if (error.response.status === 404) CustomToast.error('Bad Request---!!');
            else if (error.response.status === 500) CustomToast.error('Something Went Wrong!!');
        }
        dispatch(showHideLoader(false, ''));
        onError(error);
    }
};
export const updatePatchRequest = async (url, data, headers, dispatch, onSuccess, onError, loaderMsg) => {
    let internetConnectivity = await NetInfo.fetch();
    if (!internetConnectivity.isConnected) {
        onError({ response: "No internet connection" });
        return CustomToast.error('No internet connection');
    }
    console.log(data)
    dispatch(showHideLoader(true, loaderMsg && loaderMsg.length ? loaderMsg : ''));
    try {
        let res = await Axios.patch(url, data, headers);
        if (res.data.statusCode === 200) {
            dispatch(showHideLoader(false, ''));
            onSuccess(res);
        }
    } catch (error) {
        if (error.response.data.StatusCode === 401) {
            CustomToast.error('UnAuthorized User');
            // return;
        }
        else {
            if (error.response.status === 400) CustomToast.error('Bad Request---!!');
            else if (error.response.status === 404) CustomToast.error('Bad Request---!!');
            else if (error.response.status === 500) CustomToast.error('Something Went Wrong!!');
        }
        dispatch(showHideLoader(false, ''));
        onError(error);
    }
};
