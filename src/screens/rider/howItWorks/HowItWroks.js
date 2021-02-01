import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';
import menuIcon from '../../../assets/svgIcons/common/menu-stripes.svg';
import RiderCommonList from '../../../components/lists/RiderCommonList';
import { HAS_NOTCH } from '../../../config/config';
import { getRequest } from '../../../services/api';
import CustomToast from '../../../components/toast/CustomToast';
import commonStyles from '../../../styles/styles';


export default props => {
    // console.log("Rider.HowItWorks.Props :", props);
    let initState = {
        "howItWorksID": null,
        "howItWorksListViewModels": []
    }
    const [state, setState] = useState(initState);
    const getSingleRecord = args => {
        // console.log(args)
        getRequest(`/api/Menu/HowItWorks/List/${args.howItWorksID}`, {}, props.dispatch, serverRes => {
            if (serverRes.data.statusCode === 200) {
                let _html = serverRes.data.howItWorksViewModels.description;
                props.navigation.navigate("web_view_container", { uri: null, html: _html, screenStyles: {} })
            }
        }, serverErr => {
            if (serverErr) CustomToast.error("Something went wrong!");
        });
    };
    useEffect(useCallback(() => {
        getRequest(`/api/Menu/HowItWorks/List`, {}, props.dispatch, apiRes => {
            if (apiRes.data.statusCode === 200) setState(pre => ({ ...pre, howItWorksID: apiRes.data.howItWorksID, howItWorksListViewModels: apiRes.data.howItWorksListViewModels }));
        }, apiErr => {
            if (apiErr) CustomToast.error("Something went wrong!");
        });
    }, []), []);
    console.log("Rider.HowItWorks.state :", state);

    return (
        <View style={{ flex: 1 }}>
            <CustomHeader
                leftIconHandler={'toggle'}
                rightIconHandler={null}
                navigation={props.drawerProps.navigation}
                leftIcon={menuIcon}
                bodyContent={"HOW IT WORKS"}
                rightIcon={null}
                activeTheme={props.activeTheme}
            />
            {
                state.howItWorksListViewModels.length ?
                    <View style={{ flex: 1 }}>
                        {/* <Text style={[commonStyles.fontStyles(15, props.activeTheme.black, 4), { padding: 10, left: 10 }]}>All Topics</Text> */}
                        <View style={{
                            flex: 5, flexDirection: "column", borderRadius: 5, borderColor: "none", elevation: 5, backgroundColor: props.activeTheme.white, margin: 15,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                        }}>
                            {
                                <RiderCommonList data={state.howItWorksListViewModels} {...props} onPress={item => getSingleRecord(item)} />

                            }
                        </View>
                        <View style={{ flex: 0.5 }} />
                    </View>
                    : null
            }
        </View>
    )
}

