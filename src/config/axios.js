import Axios from 'axios';
import { BASE_URL } from './config';
import AsyncStorage from '@react-native-community/async-storage';
Axios.interceptors.request.use(
    async config => {
        config.baseURL = BASE_URL;
        console.log("BASE_URL ", BASE_URL)
        let res = await AsyncStorage.getItem('User');
        // console.log("Axios.res :", res);
        if (!res) config.headers['content-type: application/json'];
        else {
            res = JSON.parse(res);
            // config.headers['Authorization'] = 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MjMzMzY2Njk5OTAiLCJqdGkiOiI1NmUzNTlhYy04YmM4LTRlYjQtOWMxZi03OGVmNjQyNjQ2NjUiLCJpYXQiOjE2MTIyNzAwMzIsInJvbCI6ImFwaV9hY2Nlc3MiLCJpZCI6ImExMWY1MWYwLWU3ZjgtNDRiMS05ZGNiLWFlMWExZmRjYTc4NSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFkbWluIiwiUm9sZU5hbWUiOiJBZG1pbiIsImlzQWRtaW4iOiJUcnVlIiwiaXNSaWRlciI6IkZhbHNlIiwibmJmIjoxNjEyMjcwMDMxLCJleHAiOjE2MTIyNzcyMzEsImlzcyI6IndlYkFwaSIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEifQ.PgXWMZPvoC_XrWeKUBngw6TakE1iBlEqFfy5PbVsQT4';
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