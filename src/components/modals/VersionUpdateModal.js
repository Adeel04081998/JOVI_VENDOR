import React from 'react';
import { Platform, View } from 'react-native';
import CustomAlert from 'react-native-awesome-alerts';

export default VersionUpdateModal = (props) => {
    const { activeTheme, isVisible, updateCb } = props;

    console.log('VERSION_UPDATE_DIALOG PROPS :', props);

    return (
        <View>
            <CustomAlert
                key={"versionUpdateDialog"}
                show={isVisible}
                useNativeDriver={true}
                showProgress={false}
                title="Update Required!"
                message={`It's Time to Update Your "Jovi Vendor" App.`}
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
                showCancelButton={true}
                showConfirmButton={true}
                cancelText=""
                confirmText="Update Now"
                titleStyle={{ paddingHorizontal: 0, top: -5, color: "#000", fontSize: 18, fontWeight: "700" }}
                contentContainerStyle={{ color: "#000", minWidth: "87%", maxWidth: "87%" }}
                contentStyle={{ justifyContent: 'flex-start', alignItems: "flex-start", padding: 10 }}
                messageStyle={{ color: "#000", fontSize: 15 }}
                actionContainerStyle={{ justifyContent: "flex-end" }}
                cancelButtonStyle={{ backgroundColor: "transparent", display: "none" }}
                cancelButtonTextStyle={{ color: "#000", fontSize: 14, fontWeight: "700" }}
                confirmButtonStyle={{ backgroundColor: activeTheme.default }}
                confirmButtonTextStyle={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                onConfirmPressed={() => updateCb && updateCb()}
            />
        </View>
    );
}