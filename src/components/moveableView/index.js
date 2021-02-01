import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PanResponder, Animated } from 'react-native';

export default props => {
    const [state, setState] = useState({
        pan: new Animated.ValueXY(),
        disabled: props.disabled,
        xOffset: 0,
        yOffset: 0
    })
    let panResponder = useRef(PanResponder.create({
        onMoveShouldSetPanResponder: (e, gestureState) => !state.disabled,
        onMoveShouldSetPanResponderCapture: (e, gestureState) => !state.disabled,
        onPanResponderGrant: (e, gestureState) => {
            state.pan.setOffset({ x: state.xOffset, y: state.yOffset });
            // props.onDragStart(e, gestureState);
        },
        onPanResponderMove:
            // props.onDragStart(e, gestureState);
            // console.log("onPanResponderMove :", e, gestureState)
            // state.pan.setOffset({ x: state.xOffset, y: state.yOffset });
            Animated.event([null, {
                dx: state.pan.x,
                dy: state.pan.y,
            }], {})
        ,
        onPanResponderRelease: (e, gestureState) => {
            const xOffset = state.xOffset + gestureState.dx;
            const yOffset = state.yOffset + gestureState.dy;
            setState(pre => ({ ...pre, xOffset, yOffset }));
            // props.onDragEnd(e, gestureState);
        }
    })).current;

    useEffect(() => {
        if (typeof props.onMove === 'function') state.pan.addListener((values) => props.onMove(values));
        return () => {
            state.pan.removeAllListeners()
        }
    }, []);
    useEffect(useCallback(
        () => {
            console.log('State.move :', state)
        },
        [],
    ), [state])



    // changeDisableStatus = () => {
    //     this.state.disabled = !this.state.disabled
    // };

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[props.style, state.pan.getLayout()]}
        >
            {props.children}
        </Animated.View>
    );
}
