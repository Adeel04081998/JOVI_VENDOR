import * as React from 'react';
import { DrawerActions } from '@react-navigation/native';
const _navigatorRef = React.createRef();
function navigate(routeName, params) {
    // console.log("nav sErvice _navigatorRef.current :", _navigatorRef.current)
    _navigatorRef.current && _navigatorRef.current.navigate(routeName, params);
}
function drawerOpen() {
    _navigatorRef.current && _navigatorRef.current.dispatch(DrawerActions.toggleDrawer());
}
export default {
    _navigatorRef,
    navigate,
    drawerOpen,
};