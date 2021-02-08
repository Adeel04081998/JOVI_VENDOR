import React, { useEffect } from 'react';
import {
    View,
    AppState,
    Alert,
    YellowBox,
    Linking
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import NavigationService from './src/routes/NavigationService';
import { NavigationContainer } from '@react-navigation/native';
import { connect } from 'react-redux';
import BottomAlignedModal from './src/components/modals/BottomAlignedModal';
import Loader from './src/components/loader/Loader';
import RootStack from './src/routes/RootStack';
import { statusBarHandler } from './src/utils/sharedActions';
import AsyncStorage from '@react-native-community/async-storage';
import ErrorBoundary from './src/exceptions';
import CustomImageView from './src/components/imageView';
import Home from './src/screens/home/Home';

// import Temp from './Temp';
// import HomeDrawer from './src/routes/navigations';
// import SignalRTemp from './signalRTemp';

YellowBox.ignoreWarnings([
    'Remote debugger',
    'Non-serializable values were found in the navigation state',
    'Picker has been extracted from react-native core',
    'Require cycle: node_modules/react-native-maps',
    'Animated:'
]);
navigator.geolocation = require('@react-native-community/geolocation');
const App = (props) => {
    const { modalState, loaderState } = props;
    // console.log("modalState :", modalState)
    useEffect(() => {
        // console.log("App.js useEffect :");
        statusBarHandler();
        SplashScreen.hide();
        handleAppStateForCustomerOrder("mount");
        AppState.addEventListener('change', async (nextAppState) => {
            // console.log(nextAppState)
            handleAppStateForCustomerOrder("change", nextAppState);
        });
        return () => {
            console.log('[App.js] cleared!!');
            
        }
    }, []);

    const handleAppStateForCustomerOrder = async (type, appState) => {
        if (type === "mount") {
            await AsyncStorage.setItem("isFirstLoad", "true");
        }
        else if (type === "change") {
            if (appState === 'background' || appState === 'inactive') {
                const backupPredefinedPlaces = await AsyncStorage.getItem("customerOrder_predefinedPlaces");
                if (backupPredefinedPlaces) await AsyncStorage.setItem("customerOrder_predefinedPlaces_backup", backupPredefinedPlaces);

                await AsyncStorage.removeItem("customerOrder_dontAskBeforeReloadingOrder");
                await AsyncStorage.removeItem("customerOrder_predefinedPlaces");
            }
            else if (appState === 'active') {
                const isFirstLoad = await AsyncStorage.getItem("isFirstLoad");
                if (isFirstLoad) {
                    await AsyncStorage.removeItem("customerOrder_dontAskBeforeReloadingOrder");
                    await AsyncStorage.removeItem("customerOrder_predefinedPlaces");
                    await AsyncStorage.removeItem("customerOrder_predefinedPlaces_backup");

                    await AsyncStorage.removeItem("isFirstLoad");
                }
                else {
                    await AsyncStorage.setItem("customerOrder_dontAskBeforeReloadingOrder", "true");

                    const backupPredefinedPlaces = await AsyncStorage.getItem("customerOrder_predefinedPlaces_backup");
                    if (backupPredefinedPlaces) await AsyncStorage.setItem("customerOrder_predefinedPlaces", backupPredefinedPlaces);

                    await AsyncStorage.removeItem("customerOrder_predefinedPlaces_backup");
                }
            }
        }
    };


    return (
        <ErrorBoundary>
            <NavigationContainer linking={{
                config: {
                    root: {
                        // initialRouteName: "",
                        path: "Dashboard",
                        // exact: "",
                        // parse: "",
                        // stringify: "",
                        // screens: "",
                    }

                },
                prefixes: ["jovi://"],
                getPathFromState: data => console.log('[getPathFromState] data ', data),
                getStateFromPath: data => console.log('[getStateFromPath] data ', data),
            }} ref={NavigationService._navigatorRef} onStateChange={navState => statusBarHandler()}>
                <RootStack />
                {loaderState?.isVisible ? <Loader {...props} /> : null}
                <View>{modalState?.visible ? <BottomAlignedModal {...modalState} /> : null}</View>
                {modalState.imageViewState?.visible ? <CustomImageView {...modalState.imageViewState} /> : null}
            </NavigationContainer>
        </ErrorBoundary>
    );
};
const mapStateToProps = (store) => {
    return {
        theme: store.themeReducer,
        modalState: store.modalReducer,
        loaderState: store.loaderReducer,

    }
};

export default connect(mapStateToProps)(App);

// const { statusBar } = colors;
// console.log('AppProps :', theme);
// AppState.addEventListener('change', nextAppState => console.log(`App is in ${nextAppState} state`));