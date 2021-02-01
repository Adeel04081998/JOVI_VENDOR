import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Image, View, ImageBackground, Dimensions, Text } from 'react-native';
import Carousel, { Pagination, ParallaxImage } from 'react-native-snap-carousel';
import styles from './introStyles';
import { navigateWithResetScreen } from '../../utils/sharedActions';
import { statusBarHandler } from '../../utils/sharedActions';
import { useFocusEffect } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import nextArrowIcon from '../../assets/IntroScreen/next_arrow.svg';
import { MODES, APP_MODE } from '../../config/config';
import AsyncStorage from '@react-native-community/async-storage';
import CircularProgress from '../../components/progress';

const IntroScreen = props => {
    // console.log("IntroScreen.Props :", props)
    const carouselRef = useRef(null);
    const paginationRef = useRef(null);
    let winWidth = Dimensions.get('window').width;
    let initState = {
        activeSlide: 0,
        carouselItems: APP_MODE === MODES.CUSTOMER ?
            [
                {
                    slider: require('../../assets/IntroScreen/pic1.png'),
                    text: 'Order your favourite products from'
                },
                {
                    slider: require('../../assets/IntroScreen/pic2.png'),
                    text: 'Jovi delivers your products safely at your door stop'

                },
                {
                    slider: require('../../assets/IntroScreen/pic3.png'),
                    text: 'Track your jovi rider'
                },
            ]
            :
            [
                {
                    slider: require('../../assets/IntroScreen/pic1.png'),
                    text: 'Rider: Order your favourite products from'
                },
                {
                    slider: require('../../assets/IntroScreen/pic2.png'),
                    text: 'Rider: Jovi delivers your products safely at your door stop'

                },
                {
                    slider: require('../../assets/IntroScreen/pic3.png'),
                    text: 'Rider: Track your jovi rider'
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
    const setIntroBool = async () => await AsyncStorage.setItem("intro_screen_viewed", "true");
    useFocusEffect(React.useCallback(() => {
        setIntroBool();
        statusBarHandler();
        return () => setState(initState);
    }, []));
    return (
        <>
            {/* <Container> */}
            {/* <ImageBackground source={require('../../assets/IntroScreen/doodle.png')} style={styles.backgroundImage}> */}
            <View style={{ flex: 1 }}>
                <View style={{ flex: 0.4, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', maxWidth: Dimensions.get('window').width - 20 }}>
                    <TouchableOpacity onPress={() => navigateWithResetScreen(0, [{
                        name: "OTP",
                        backScreenObj: null
                    }])}>
                        <Text style={styles.headerRightText}>{activeSlide === 2 ? 'Next' : "Skip"}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 5, justifyContent: 'center', alignItems: 'center' }}>
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
                    // enableMomentum={true}
                    // lockScrollWhileSnapping={true}
                    // shouldOptimizeUpdates={true}
                    // loopClonesPerSide={carouselItems.length}
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
                    <TouchableOpacity
                        onPress={() => {
                            if (activeSlide === 2) return navigateWithResetScreen(0, [{
                                name: "OTP",
                                backScreenObj: null
                            }]);
                            else {
                                carouselRef.current.snapToItem(state.activeSlide + 1)
                                setState(prevState => ({ ...prevState, activeSlide: prevState.activeSlide + 1 }));
                            }
                        }}>
                        <CircularProgress size={90} text={'t'} progressPercent={activeSlide <= 0 ? 33 : 33 * (activeSlide + 1)} strokeWidth={5} pgColor={"#7359BE"} innerComponent={(
                            <View style={{ borderRadius: 35, borderColor: '#7359BE', height: 70, width: 70, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center', opacity: 1 }}>
                                <SvgXml xml={nextArrowIcon} height={20} width={20} />
                            </View>
                        )} />
                    </TouchableOpacity>

                    {/* <View style={[styles.paginationMainView]}>
                        <TouchableOpacity style={{ borderRadius: 90 / 2, borderStyle: "solid", borderWidth: 3, borderLeftColor: activeSlide > 1 ? "#7359BE" : '#fff', borderTopColor: activeSlide === 2 ? "#7359BE" : '#fff', borderBottomColor: activeSlide > 0 ? "#7359BE" : '#fff', borderRightColor: '#7359BE', height: 90, width: 90, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', padding: 10 }} onPress={() => {
                            if (activeSlide === 2) navigationHandler(APP_MODE === MODES.CUSTOMER ? "OTP" : "Login");
                            else {
                                carouselRef.current.snapToItem(state.activeSlide + 1)
                                setState(prevState => ({ ...prevState, activeSlide: prevState.activeSlide + 1 }));
                            }
                        }
                        }>
                            <View style={{ borderRadius: 70 / 2, borderColor: '#7359BE', height: 70, width: 70, backgroundColor: '#7359BE', justifyContent: 'center', alignItems: 'center', opacity: 1 }}>
                                <SvgXml xml={nextArrowIcon} height={20} width={20} />
                            </View>
                        </TouchableOpacity>
                    </View> */}
                </View>
            </View>
            {/* </ImageBackground> */}
            {/* </Container> */}
        </>
    );
}

export default IntroScreen;
