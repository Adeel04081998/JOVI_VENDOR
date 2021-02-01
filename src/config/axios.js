import Axios from 'axios';
import { BASE_URL } from './config';
import AsyncStorage from '@react-native-community/async-storage';

Axios.interceptors.request.use(
    async config => {
        config.baseURL = BASE_URL;
        // console.log("BASE_URL ", BASE_URL)
        let res = await AsyncStorage.getItem('User');
        // console.log("Axios.res :", res);
        if (!res) config.headers['content-type: application/json'];
        else {
            res = JSON.parse(res);
            config.headers['Authorization'] = 'Bearer ' + res.token.authToken;
            config.headers['content-type: application/json'];
        }
        return config;
    },
    error => {
        Promise.reject(error)
    });
// Axios.interceptors.response.use(function (response) {
//     return response;
// }, function (error) {
//     console.log("[Axios.js] Error :", error.response)
//     if (error.response.status === 404) {
//         console.log("[Axios.js] Error :", error.response);
//         console.log('[Axios.js] NavigationService._navigatorRef :', NavigationService._navigatorRef);
//         // NavigationService._navigatorRef?.current.goBack();
//         // console.log('Forbidden');
//     }
//     return Promise.reject(error);
// });
export default Axios;