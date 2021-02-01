import React from 'react';
import { Pagination } from 'react-native-snap-carousel';
import paginationStyles from './paginationStyles';

export default function CustomPagination(props) {
    const { dotsLength, activeSlide, paginationRef, carouselRef } = props;
    return (
        <Pagination
            ref={paginationRef}
            dotsLength={dotsLength}
            activeDotIndex={activeSlide}
            carouselRef={carouselRef}
            tappableDots={true}
            containerStyle={paginationStyles.containerStyle}
            dotStyle={props.dotStyle ? props.dotStyle : paginationStyles.dotStyle}
            dotContainerStyle={{
                // backgroundColor: 'red',
                padding: 3
            }}
            inactiveDotStyle={props.inactiveDotStyle ? props.inactiveDotStyle : paginationStyles.inactiveDotStyle}
            inactiveDotOpacity={1}
            inactiveDotScale={0.8}

        />
    );
}
