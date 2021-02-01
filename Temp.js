import React from 'react'
import { View, Text, TextInput, KeyboardAvoidingView, Image } from 'react-native'

export default function Temp() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{ uri: 'https://files.slack.com/files-pri/T010SHU519Q-F0175C3TBJR/flagsprite60.png' }} height={100} width={100} style={{ height: 100, width: 100 }} />
            {/* <View style={{ flex: 3, backgroundColor: 'red' }} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">

                <View style={{ flex: 1 }}>
                    <TextInput
                        placeholder="email"
                        style={{ width: 200, borderRadius: 5, borderColor: '#000', height: 30, borderWidth: 1, marginVertical: 10 }}
                        keyboardType="email-address"
                        returnKeyType="next"
                    />
                    <TextInput
                        placeholder="password"
                        style={{ width: 200, borderRadius: 5, borderColor: '#000', height: 30, borderWidth: 1, marginVertical: 10 }}
                        keyboardType="email-address"
                        returnKeyType="next"

                    />
                </View>
            </KeyboardAvoidingView> */}
        </View>
        
    )
}


import React, { useState, useRef, useEffect } from 'react';
import { Image, View, ImageBackground, Dimensions, StatusBar } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { Container, Header, Content, Button, Left, Right, Body } from 'native-base';
import styles from './introStyles';
import { navigationHandler } from '../../utils/sharedActions';
import { statusBarHandler } from '../../utils/sharedActions';
import { useFocusEffect } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Svg, { Circle, Text } from 'react-native-svg';

const IntroScreen = props => {
    const carouselRef = useRef(null);
    const paginationRef = useRef(null);
    let winWidth = Dimensions.get('window').width;
    let initState = {
        activeSlide: 0,
        carouselItems: [
            {
                slider: require('../../assets/IntroScreen/pic1.png'),
                text: 'Order your favourite products from anywhere'
            },
            {
                slider: require('../../assets/IntroScreen/pic2.png'),
                text: 'Jovi delivers your  products safely at your door stop'

            },
            {
                slider: require('../../assets/IntroScreen/pic3.png'),
                text: 'Track your jovi rider'
            },
        ]
    }
    const [state, setState] = useState(initState);
    const { carouselItems, activeSlide } = state;

    const _renderItem = ({ item, index }) => {
        return (
            <View key={index} style={styles.renderItemsMainView}>
                <View style={[styles.imageView]}>
                    <Image resizeMode="contain" source={item.slider} style={styles.image} />
                </View>
                <View style={[styles.imageTextView]}>
                    <Text style={styles.imageText}>{item.text}</Text>
                </View>
            </View >
        )
    }
    const width = 100;
    const height = 100;
    const size = width < height ? width - 32 : height - 16;
    const strokeWidth = 25;
    const radius = (size - strokeWidth) / 2;
    const circunference = radius * 2 * Math.PI;
    const _pagination = () => {
        return (
            <Pagination
                ref={paginationRef}
                dotsLength={carouselItems.length}
                activeDotIndex={activeSlide}
                carouselRef={carouselRef}
                tappableDots={true}
                containerStyle={styles.containerStyle}
                dotStyle={styles.dotStyle}
                dotContainerStyle={{
                    // backgroundColor: 'red',
                    padding: 8
                }}
                inactiveDotStyle={styles.inactiveDotStyle}
                inactiveDotOpacity={0.8}
                inactiveDotScale={0.8}

            />
        );
    }
    const _onSnapToItemHandler = (index) => {
        // console.log('paginationRef.curren', paginationRef.current)
        // paginationRef.current.setActiveIndexDot(index)
        setState(prevState => ({ ...prevState, activeSlide: index }));
    };
    useFocusEffect(React.useCallback(() => {
        statusBarHandler();
        return () => setState(initState);
    }, []));
    return (
        <>
            {/* <Container> */}
            <ImageBackground source={require('../../assets/IntroScreen/doodle.png')} style={styles.backgroundImage}>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 0.4, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', maxWidth: Dimensions.get('window').width - 20 }}>
                        <TouchableOpacity onPress={() => navigationHandler("OTP")}>
                            <Text style={styles.headerRightText}>{activeSlide === 2 ? 'Next' : "Skip"}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 5, justifyContent: 'center', alignItems: 'center', }}>
                        <Carousel
                            // automaticallyAdjustContentInsets
                            ref={carouselRef}
                            data={carouselItems}
                            sliderWidth={winWidth}
                            itemWidth={winWidth}
                            renderItem={_renderItem}
                            onSnapToItem={index => _onSnapToItemHandler(index)}
                            autoplay={true}
                            autoplayDelay={3000}
                            autoplayInterval={3000}
                            loopClonesPerSide={carouselItems.length}
                            enableMomentum={true}
                            lockScrollWhileSnapping={true}
                            shouldOptimizeUpdates={true}
                        // loop={true}
                        // activeSlideAlignment="start"
                        // firstItem={0}
                        // activeAnimationType='spring'
                        // decelerationRate="fast"
                        // inactiveSlideScale={1}
                        // apparitionDelay={250}
                        // loop={activeSlide !== 0 && true}
                        // swipeThreshold={10}
                        // scrollEnabled
                        >
                        </Carousel>
                        <View style={[styles.paginationMainView]}>
                            {/* <View style={{ borderRadius: 100, borderWidth: 3, borderColor: 'blue' }}> */}
                            <Svg height="100" width="100" style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Circle
                                    cx={100}
                                    cy={100}
                                    r={radius}
                                    fill="none"
                                    stroke="#000"
                                // fill="none"
                                // strokeDasharray={`${circunference} ${circunference}`}
                                />
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    fill="#7359BE"
                                    stroke="red"
                                // fill="none"
                                // strokeDasharray={`${circunference} ${circunference}`}
                                />
                                <Text
                                    stroke="#fff"
                                    fontSize="15"
                                    textAnchor="middle"
                                    x={size / 2}
                                    y={size / 2}
                                >
                                    {
                                        ">"
                                    }
                                </Text>
                            </Svg>
                            {/* {_pagination()} */}
                        </View>
                    </View>

                    {/* </View> */}
                </View>
            </ImageBackground>
            {/* </Container> */}
        </>
    );
}

export default IntroScreen;
