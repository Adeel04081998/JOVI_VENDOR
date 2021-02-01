import React, { useState, useRef } from 'react';
import { ScrollView, SafeAreaView, ImageBackground, View, Text, Dimensions, Platform, Switch } from 'react-native';
import { Container, Content } from 'native-base';
import CustomHeader from '../../components/header/CustomHeader';
import ExpandableList from '../../components/lists/ExpandableList';
import commonIcon from '../../assets/svgIcons/common/common';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { userAction } from '../../redux/actions/user';
import AsyncStorage from '@react-native-community/async-storage';
import commonStyles from '../../styles/styles';
import { isJoviCustomerApp } from '../../config/config';
import RiderCommonList from '../../components/lists/RiderCommonList';
import CustomToast from '../../components/toast/CustomToast';
import RNDrawOverlay from 'react-native-draw-overlay';
import { sharedConfirmationAlert } from '../../utils/sharedActions';

const SettingsScreen = props => {
    // console.log("SettingsScreen.props :", props);
    let initState = {
        "darkMode": false,
        "firstRowObj": {
            "rowIndex": 0,
            "itemIndex": 0,
        },
        "secondRowObj": {
            "rowIndex": 1,
            "itemIndex": 0,
        },
        "areaExpanded": {
            "index": 0,
            "expanded": false,
        },
    };
    const [state, setState] = useState(initState);
    const toggleCardHandler = (item, cardIndex) => {
        setState(prevState => {
            if (prevState.areaExpanded.index === cardIndex && prevState.areaExpanded.expanded) {
                return { ...prevState, areaExpanded: { index: cardIndex, expanded: false } };
            } else {
                return { ...prevState, areaExpanded: { index: cardIndex, expanded: true } };
            }
        });
    };
    const _asyncOverlayPermission = async () => {
        if (props.user?.appearOnTop) CustomToast.error("Cannot be disable!");
        else {
            try {
                const result = await RNDrawOverlay.askForDispalayOverOtherAppsPermission();
                if (result) {
                    props.dispatch(userAction({ ...props.user, appearOnTop: true }));
                    await AsyncStorage.setItem("appearOnTop", JSON.stringify(true));
                }
            } catch (error) {
                console.log('Érror :', error);
                if (error) sharedConfirmationAlert(
                    'Appear on top permission is not granted!',
                    'You must have to enable this permission.',
                    () => _asyncOverlayPermission(),
                    null,
                    null,
                    'Enable',
                    false,
                );
            }
        }
        
    };
    const onCheckBoxChange = (rowIdx, itemIdx) => setState(pre => {
        if (rowIdx === 0) return {
            ...pre,
            firstRowObj: {
                ...pre.firstRowObj,
                rowIndex: rowIdx,
                itemIndex: itemIdx

            }
        }
        else return {
            ...pre,
            secondRowObj: {
                ...pre.secondRowObj,
                rowIndex: rowIdx,
                itemIndex: itemIdx

            }
        }
    });

    const renderStyles = (parentRowIndex, j) => {
        if (parentRowIndex === 0) {
            if (state.firstRowObj.rowIndex === parentRowIndex && state.firstRowObj.itemIndex === j) return { height: 10, width: 10, borderRadius: 5, backgroundColor: props.activeTheme.default }
            else return { height: 10, width: 10, borderRadius: 5, backgroundColor: props.activeTheme.white };
        } else {
            if (state.secondRowObj.rowIndex === parentRowIndex && state.secondRowObj.itemIndex === j) return { height: 10, width: 10, borderRadius: 5, backgroundColor: props.activeTheme.default };
            else return { height: 10, width: 10, borderRadius: 5, backgroundColor: props.activeTheme.white };
        }

    }
    const descriptionContentView = (listItem, parentRowIndex) => {
        return (
            <View style={{ padding: 10 }} >
                {
                    listItem.itemsArr.map((x, j) => {
                        return <View key={j} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
                            <Text>{x}</Text>
                            <TouchableOpacity style={{ height: 20, width: 20, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: props.activeTheme.default, justifyContent: 'center', alignItems: 'center' }} onPress={() => onCheckBoxChange(parentRowIndex, j)}>
                                <View style={renderStyles(parentRowIndex, j)} />
                            </TouchableOpacity>
                        </View>
                    })
                }
            </View>

        )
    };
    const enableDisableAppTuts = async bool => {
        props.dispatch(userAction({ ...props.user, appTutorialsEnabled: bool }));
        await AsyncStorage.setItem("appTutorialsEnabled", JSON.stringify(bool));
        CustomToast.success(bool ? 'App tutorials turned on' : 'App tutorials turned off');
    };

    const renderContent = () => {
        if (isJoviCustomerApp) return (
            <View style={{ flex: 1, paddingHorizontal: 20, }}>
                {
                    [{ title: 'Languages', itemsArr: ['English (US)', 'Urdu', 'Hindi'] }, { title: 'Font Settings', itemsArr: ['Size', 'Font Style', 'Color'] }].map((rec, i) => <ExpandableList
                        key={i}
                        id={i}
                        listIndex={i}
                        title={rec.title}
                        item={rec}
                        callback={toggleCardHandler}
                        descriptionContent={descriptionContentView(rec, i)}
                        maxHeightProp={400}
                        display={state.areaExpanded.index === i && state.areaExpanded.expanded ? "flex" : "none"}
                        parentState={state}
                        bgColor={props.activeTheme.listBgColor}
                    />
                    )
                }
                <View style={{ minHeight: 60, backgroundColor: '#F9F8F8', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', marginTop: 12, borderRadius: 10, borderColor: '#707070', borderWidth: 0.2, }}>
                    <Text style={{ paddingLeft: 15, ...commonStyles.fontStyles(16, '#060606', 1) }}>App Tutorials</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: props.activeTheme.switchActiveColor }}
                        thumbColor={"#fff"}
                        ios_backgroundColor="#767577"
                        onValueChange={val => enableDisableAppTuts(val)}
                        value={props.user.appTutorialsEnabled}
                        style={{ marginRight: Platform.select({ ios: 10, android: 0 }) }}
                    />
                </View>
            </View>
        )
        else {
            let tempData = [
                {
                    caption: "Favourites", dataArr: [{ title: "Add Home" }, { title: "Work" }]
                },
                {
                    caption: "Safety", dataArr: [{ title: "Manage Trusted" }, { title: "Verify" }]
                },
                {
                    caption: "Privacy", dataArr: [{ title: "Manage the data you share with us" }, { title: "Security" }]
                }
            ]
            return <View style={{ flex: 1, padding: 5 }}>
                {
                    tempData.map((D, j) => (
                        <View key={j} style={{ flexDirection: "column", justifyContent: 'flex-start', borderRadius: 5, elevation: 1, backgroundColor: props.activeTheme.white, marginHorizontal: 10, marginTop: 5 }}>
                            <Text style={{ padding: 5, paddingLeft: 12, ...commonStyles.fontStyles(16, undefined, 2) }}>{D.caption}</Text>
                            <RiderCommonList
                                {...props}
                                data={D.dataArr}
                                onPress={() => { }}
                            />
                            {
                                j === 0 ?
                                    <TouchableOpacity style={{ paddingVertical: 10 }}>
                                        <Text style={{ padding: 5, paddingLeft: 12, color: props.activeTheme.default }}>More Saved Places</Text>
                                    </TouchableOpacity>
                                    : null
                            }
                        </View>
                    ))
                }
                <View style={{ minHeight: 60, backgroundColor: '#F9F8F8', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', marginTop: 12, borderRadius: 10, borderColor: '#707070', borderWidth: 0.2, }}>
                    <Text style={{ paddingLeft: 15, ...commonStyles.fontStyles(16, '#060606', 1) }}>Appear on top</Text>
                    <Switch
                        onTouchStart={_asyncOverlayPermission}
                        trackColor={{ false: "#767577", true: props.activeTheme.switchActiveColor }}
                        thumbColor={"#fff"}
                        ios_backgroundColor="#767577"
                        value={props.user?.appearOnTop}
                        style={{ marginRight: Platform.select({ ios: 10, android: 0 }) }}
                    // disabled={props.user?.appearOnTop}
                    />
                </View>
            </View>
        }
    };
    // console.log("SettingsScreen.State :", state);
    console.log("SettingsScreen.Props :", props);

    return (
        <Container>
            <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={'toggle'}
                    rightIconHandler={() => { }}
                    navigation={props.drawerProps.navigation}
                    leftIcon={commonIcon.menueIcon(props.activeTheme)}
                    bodyContent={'Settings'}
                    rightIcon={null}
                    activeTheme={props.activeTheme}
                    height={20}
                    width={20}
                />
                <Content style={{ top: Platform.select({ ios: 0, android: 10 }) }}>
                    {renderContent()}
                </Content>
            </ImageBackground>
        </Container>
    )
};
export default SettingsScreen;
