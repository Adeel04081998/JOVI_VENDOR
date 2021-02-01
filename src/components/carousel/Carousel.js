import React from 'react';
import Carousel from 'react-native-snap-carousel';
import { DEVICE_WIN_WIDTH } from '../../config/config';
import carouselStyles from './carouselStyles';
console.log(carouselStyles)
export default function CustomCarousel(props) {
    return (
        <Carousel
            automaticallyAdjustContentInsets
            ref={props.carouselRef}
            data={props.data}
            sliderWidth={props.winWidth ? props.winWidth : DEVICE_WIN_WIDTH}
            itemWidth={props.winWidth ? props.winWidth : DEVICE_WIN_WIDTH}
            renderItem={props._renderItem}
            onSnapToItem={index => props._onSnapToItemHandler(index)}
            activeAnimationType='spring'
            autoplayDelay={props?.autoplayDelay ?? 0}
            autoplayInterval={props?.autoplayInterval ?? 0}
            autoplay={props?.autoplay ?? false}
            loop={props?.loop ?? false}
        // loopClonesPerSide={props.data.length ? props.data.length : data.length}
        // enableMomentum={true}
        // decelerationRate="fast"
        // lockScrollWhileSnapping={true}
        // shouldOptimizeUpdates={true}
        // firstItem={0}
        // activeSlideAlignment="start"

        // inactiveSlideScale={1}
        // apparitionDelay={250}
        // loop={activeSlide !== 0 && true}
        // swipeThreshold={10}
        // scrollEnabled
        />
    )
}
