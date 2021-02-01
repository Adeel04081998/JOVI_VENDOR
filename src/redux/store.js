import { createStore, compose, applyMiddleware } from 'redux';
import rootReducer from './reducers/rootReducer';
import thunk from 'redux-thunk';
const middleWares = [thunk];
export const appStore = createStore(
    rootReducer,
    {},
    compose(
        applyMiddleware(...middleWares),
    )
)
export default appStore;