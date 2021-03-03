import React, { useState } from 'react';
import { View, Text, StatusBar, Platform, ImageBackground,Dimensions } from 'react-native';
import { Header, Left, Body, Right } from 'native-base';
import headerStyles from './headerStyles';
import { SvgXml } from 'react-native-svg';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import dummy from '../../assets/card-image.png';
import Spinner from 'react-native-spinkit';
import dropIcon from '../../assets/svgIcons/common/drop-down-arrow.svg';
import CustomInput from '../input/Input';
import { renderPicture } from '../../utils/sharedActions';
import ProfileModal from '../modals/ProfileModal';
import plateformSpecific from '../../utils/plateformSpecific';
import { openModalAction } from '../../redux/actions/modal';
import common from '../../assets/svgIcons/common/common';
import { useFocusEffect } from '@react-navigation/native';
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
export const HeaderApp = (props) => {
    const [headerState,setHeaderState] = useState({
        searchVal:'',
    });
    useFocusEffect(()=>{
        if(headerState.searchVal !==''){setHeaderState({
            searchVal:'',
        })}
    },[])
    const { state,noBackButton, caption,noSearch,screenProps, commonStyles, activeTheme,onChangeText,user } = props;
    const profileHeader = () => {
        let ModalComponent = {
            visible: true,
            transparent: true,
            okHandler: () => { },
            onRequestCloseHandler: null,
            ModalContent: (
                <ProfileModal {...screenProps} />
            ),
            // modalFlex: 0,
            modalHeight: Dimensions.get('window').height * 0.85,
            modelViewPadding: 0,
            fadeAreaViewFlex: plateformSpecific(1, 0.6),
            screenProps: { ...screenProps }
        };
        screenProps.dispatch(openModalAction(ModalComponent));
    }
    return <View
        style={{ height: 110,paddingTop:10, backgroundColor: activeTheme.background, justifyContent: 'space-between', alignItems: 'center' }}
        onTouchEnd={() => {
            if (state.isSmModalOpen) showHideModal(false, 1);
        }}
    >
        <View style={{ position: 'absolute', right: 20,top:27, backgroundColor: activeTheme.default, width: 43, borderRadius: 85, height: 45, borderWidth: 3, borderStyle: "solid", borderColor: "#F0F0F0", flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity style={{ width: 90, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={() => profileHeader()}>
                {/* <ImageBackground source={{uri:renderPicture(user.picture,user.tokenObj &&user.tokenObj.token.authToken)}} style={{ marginRight: 52, height: 32, width: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }} resizeMode='cover'  > */}
                <ImageBackground source={user&&user.picture?{uri:renderPicture(user.picture,user.tokenObj &&user.tokenObj.token.authToken)}:dummy} style={{ marginRight: 52, height: 32, width: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }} resizeMode='cover'  >
                    {/* <Spinner isVisible={true} size={30} type="Circle" color={activeTheme.white} /> */}
                </ImageBackground>
            </TouchableOpacity>
        </View>
        {noBackButton!==true&&<View style={{ width: '10%',position:'absolute',left:0,top:0,bottom:-10,zIndex:1000, }}><TouchableOpacity onPress={()=>screenProps.navigation.goBack()} style={{width:'100%',paddingLeft:15,justifyContent:'center',height:'100%'}}><SvgXml  xml={common.backIconHeader()} height={30} width={25} /></TouchableOpacity></View>}
        <Text style={{ ...commonStyles.fontStyles(20, activeTheme.white, 4), flex: 1, alignSelf: 'center', top: 30,maxWidth:'70%',flexWrap:'wrap' }}>{caption}</Text>
        {noSearch&&noSearch===true?<></>:<View style={{ width: '100%',position:'absolute',bottom:-20, marginTop: 10,zIndex:1000, alignItems: 'center', flex: 1 }}>
            <TextInput
                style={{
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    width: '90%',
                    borderRadius: 5,
                    marginTop: 20,
                    // left:20,
                    zIndex: 1500,
                    borderColor: state.focusedField === 'note' ? props.activeTheme.default : 'rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    height: 40,
                    justifyContent: "center",
                    alignItems: 'center',
                    // flexDirection: 'row'
                }}
                placeholder="Search"
                onChangeText={onChangeText?(val)=>onChangeText(val):()=>{}}
            />
        </View>}
        {/* <View style={{ alignItems: 'center', justifyContent: 'center', right: 10, flex: 0.8 }}>
        <Text style={commonStyles.fontStyles(12, props.activeTheme.white, 4)}>YOUR BALANCE</Text>
        <Text style={commonStyles.fontStyles(12, props.activeTheme.white, 4)}>RS {sharedCommasAmountConveter(userObj.balance)}</Text>
    </View> */}
    </View>
}
