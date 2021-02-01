import React from 'react';
import { View, Text, StatusBar, Platform, ImageBackground } from 'react-native';
import { Header, Left, Body, Right } from 'native-base';
import headerStyles from './headerStyles';
import { SvgXml } from 'react-native-svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Spinner from 'react-native-spinkit';
import dropIcon from '../../assets/svgIcons/common/drop-down-arrow.svg';
export default function ScreenHeader({ leftIcon, leftIconHandler, finalDestinationView, bodyContent, BodyComponent, rightIcon, imgObject, imgStyles, rightIconHandler, navigation, activeTheme, height, width, styles, left, screenName }) {
    // let tempVal = 50;
    // console.log(StatusBar.currentHeight)
    return (
        // <Header transparent style={{ ...styles, top: Platform.OS === 'ios' ? -12 : HAS_NOTCH ? 12 : 5, height: Platform.OS === 'ios' ? StatusBar.currentHeight : undefined }}>
        <Header transparent style={{ ...styles, top: Platform.OS === 'ios' ? -12 : undefined, backgroundColor: undefined }}>
            <>
                {leftIcon ?
                    <Left style={headerStyles.left}>
                        <TouchableOpacity onPress={leftIconHandler === 'toggle' ? () => navigation.toggleDrawer() : leftIconHandler ? leftIconHandler : screenName ? () => navigation.navigate(screenName) : () => navigation.goBack()} style={headerStyles.leftTouchableOpacity}>
                            <View style={headerStyles.leftIconContainer}>
                                <View style={headerStyles.leftView}>
                                    <SvgXml xml={leftIcon} height={height || 20} width={width || 20} style={{ left: left || 0 }} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Left>
                    : null
                }
                {finalDestinationView && finalDestinationView.visible ?
                    <Left style={{ marginLeft: 27, alignContent: "center" }}>
                        <TouchableOpacity onPress={finalDestinationView.onPressHandler ? finalDestinationView.onPressHandler : () => { }} style={{ backgroundColor: "transparent" }}>
                            <View style={{ top: (Platform.OS === "android" ? 6 : 0), left: (Platform.OS === "android" ? 0 : 5) }}>
                                <Text style={{ fontSize: 16, width: 130 }}>
                                    {"Hi, "}
                                    <Text style={{ color: activeTheme.default, fontWeight: "bold" }}>
                                        {finalDestinationView.userName.substring(0, 9) + (finalDestinationView.userName.length > 9 ? "..." : "")}
                                    </Text>
                                </Text>
                                <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                                    {finalDestinationView.finalDestObj.title.substring(0, 18) + (finalDestinationView.finalDestObj.title.length > 18 ? "..." : "")}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Left>
                    : finalDestinationView && finalDestinationView.sticky ? <Left style={{ marginLeft: 27, alignContent: "center" }} /> : null
                }
            </>
            {
                BodyComponent ?
                    <Body style={[headerStyles.body, { justifyContent: "flex-end", alignItems: 'center' }]}>
                        <BodyComponent />
                    </Body> : null
            }
            {
                bodyContent ?
                    <Body style={headerStyles.body}>
                        <View style={headerStyles.bodyView(activeTheme)}>
                            <Text style={headerStyles.bodyText(activeTheme, bodyContent)}>{bodyContent}</Text>
                        </View>
                    </Body> : null
            }
            {
                rightIcon ?
                    <Right style={rightIcon ? headerStyles.right : { flex: 1, justifyContent: 'center', alignSelf: 'center' }}>
                        {
                            imgObject ?
                                <>
                                    {(imgObject.title) ?
                                        <View style={{ backgroundColor: activeTheme.default, width: 142, borderRadius: 85, height: 45, borderWidth: 3, borderStyle: "solid", borderColor: "#F0F0F0", flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <TouchableOpacity style={{ width: 90, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={imgObject.dropDownPress}>
                                                <Text style={{ color: activeTheme.white, paddingLeft: 10 }}>{imgObject.title}</Text>
                                                <SvgXml xml={dropIcon} height={15} width={15} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={rightIconHandler}>
                                                <ImageBackground source={{ uri: imgObject.imgSrc }} resizeMode="cover" style={imgObject.imgStyles} onLoadStart={() => imgObject.loaderCb(true)} onLoadEnd={() => imgObject.loaderCb(false)} >
                                                    <Spinner isVisible={imgObject.loaderBool} size={30} type="Circle" color={activeTheme.white} />
                                                </ImageBackground>
                                            </TouchableOpacity>
                                        </View>
                                        :
                                        <TouchableOpacity onPress={rightIconHandler}>
                                            <ImageBackground source={{ uri: imgObject.imgSrc }} resizeMode="cover" style={imgObject.imgStyles} onLoadStart={() => imgObject.loaderCb(true)} onLoadEnd={() => imgObject.loaderCb(false)} >
                                                <Spinner isVisible={imgObject.loaderBool} size={30} type="Circle" color={activeTheme.white} />
                                            </ImageBackground>

                                        </TouchableOpacity>
                                    }
                                    {
                                        imgObject?.notificationsLength > 0 ?
                                            <View style={{ position: 'absolute', right: 0, top: 0, zIndex: 999, left: 9, backgroundColor: "#FC3F93", alignItems: 'center', justifyContent: 'center', height: 15, width: 15, borderRadius: 10 }}>
                                                <Text style={{ color: activeTheme.white, fontSize: 10 }}>{imgObject.notificationsLength}</Text>
                                            </View>
                                            : null
                                    }

                                </>
                                :
                                <TouchableOpacity onPress={rightIconHandler}>
                                    <View style={{ marginRight: 10 }}>
                                        <SvgXml xml={rightIcon} height={height || 22} width={width || 22} />
                                    </View>
                                </TouchableOpacity>

                        }
                    </Right>
                    : null
            }
        </Header>
    )
}
