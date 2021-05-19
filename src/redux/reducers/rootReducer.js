import { combineReducers } from 'redux';
import themeReducer from './app_theme';
import modalReducer from './modal/modalReducer';
import printerReducer from './printer_reducer/printerReducer';
import loaderReducer from './loader/index';
import userReducer from './user/index';
import enumsReducer from './enums';
import { footerNavReducer } from './sharedReducer';

const rootReducer = combineReducers({
    themeReducer,
    modalReducer,
    loaderReducer,
    userReducer,
    enumsReducer,
    printerReducer,
    footerNavReducer
});

export default rootReducer;