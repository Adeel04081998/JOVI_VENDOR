import React, { useState } from 'react';
import { ScrollView, SafeAreaView, ImageBackground, View, Text, Dimensions } from 'react-native';
import { Container, Content } from 'native-base';
import closeIcon from '../../assets/svgIcons/common/cross-new.svg';
import CustomHeader from '../../components/header/CustomHeader';
import ExpandableList from '../../components/lists/ExpandableList';
import CustomWebView from '../../components/webView';

const FaqDetails = props => {
    const { theme, navigation, activeTheme } = props;
    let initState = {
        areaExpanded: {
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
    const descriptionContentView = listItem => {
        return (
            <View style={{ minHeight: 400 }}>
                <CustomWebView
                    html={`<html><body style='background-color:transparent; padding-left: 20px;padding-right: 20px'><p style='color: #000;font-size: 40px;'>${listItem.answer}</p></body></html>`}
                    screenStyles={{ top: 0, right: 0 }}
                />
            </View>

        )
    };
    return (
        <Container>
            <ImageBackground source={require('../../assets/doodle.png')} style={{ flex: 1 }}>
                <CustomHeader
                    leftIconHandler={() => navigation.navigate("help_faq_stack", { screen: "help_faqs" })}
                    rightIconHandler={() => Alert.alert('Right icon clicked')}
                    navigation={navigation}
                    leftIcon={closeIcon}
                    bodyContent={'FAQs'}
                    rightIcon={null}
                    activeTheme={activeTheme}
                    height={15}
                    width={15}
                    left={3}

                />
                <Content>
                    <ScrollView style={{ flex: 1, margin: 20 }} nestedScrollEnabled>
                        {
                            navigation.dangerouslyGetState().routes[navigation.dangerouslyGetState().index].params.list.faQs.length ? navigation.dangerouslyGetState().routes[navigation.dangerouslyGetState().index].params.list.faQs.map((rec, i) => <ExpandableList
                                key={i}
                                id={i}
                                listIndex={i}
                                title={rec.question}
                                item={rec}
                                callback={toggleCardHandler}
                                descriptionContent={descriptionContentView(rec)}
                                maxHeightProp={Dimensions.get('window').height}
                                display={state.areaExpanded.index === i && state.areaExpanded.expanded ? "flex" : "none"}
                                parentState={state}
                            />
                            )
                                :
                                <View />
                            // recordsNotExistUI('No Record exist');
                        }
                    </ScrollView>
                </Content>
            </ImageBackground>
        </Container>
    )
};

export default FaqDetails;
