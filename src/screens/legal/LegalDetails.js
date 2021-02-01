import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { Container, Content } from 'native-base';
import commonIcons from '../../assets/svgIcons/common/common';
import CustomHeader from '../../components/header/CustomHeader';
import legalStyles from './legalStyles';
import doodleImg from '../../assets/doodle.png';
import { isJoviCustomerApp } from '../../config/config';
export default function LegalDetails(props) {
    // console.log('Legal Props :', props);
    const { activeTheme, navigation } = props;
    let getNavigationState = navigation.dangerouslyGetState();
    // console.log(getNavigationState)
    // debugger;
    let parentStack = getNavigationState.routes[getNavigationState.index];
    // console.log('parentStack :', parentStack);
    let chilStack = parentStack.state.routes[parentStack.state.index];
    // console.log('chilStack :', chilStack);
    let item = chilStack.state.routes[chilStack.state.index].params.dataParams;
    // console.log(item);
    // let item = getNavigationState.routes[0].state.routes[getNavigationState.routes[0].state.index].params && getNavigationState.routes[0].state.routes[getNavigationState.routes[0].state.index].params.dataParams.item;

    return (
        <Container>
            <ImageBackground source={doodleImg} style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={() => navigation.navigate("legal_stack", { screen: 'legal' })}
                    rightIconHandler={() => Alert.alert('Right icon clicked')}
                    navigation={navigation}
                    leftIcon={commonIcons.backIcon(activeTheme)}
                    bodyContent={item.title}
                    rightIcon={null}
                    activeTheme={activeTheme}
                />
                <Content style={[legalStyles.content(activeTheme), { paddingHorizontal: 15 }]}>
                    <View style={legalStyles.mainView(activeTheme)}>
                        <View style={legalStyles.idView(activeTheme)}>
                            <Text style={legalStyles.idText(activeTheme)}>
                                {
                                    isJoviCustomerApp ?
                                        `ID# ${item.contentPageID}`
                                        :
                                        null
                                }
                            </Text>
                        </View>
                        <View style={legalStyles.detailsView(activeTheme)}>
                            <Text style={legalStyles.detailsText(activeTheme)}>
                                {item.description}
                            </Text>
                        </View>
                    </View>
                </Content>
            </ImageBackground>
        </Container >

    )
}
