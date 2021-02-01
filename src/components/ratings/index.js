import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import unfilledStar from '../../assets/svgIcons/common/unfilled.svg';
import filledStar from '../../assets/svgIcons/common/filled.svg';
import { SvgXml } from "react-native-svg";
// import { TouchableOpacity } from 'react-native-gesture-handler';
export default function index({ styles, initialCount, disabled, margin, paddingVertical, onPress, starHeight, starWidth }) {
    let initState = {
        ratings: [
            { "id": 1, "star": unfilledStar },
            { "id": 2, "star": unfilledStar },
            { "id": 3, "star": unfilledStar },
            { "id": 4, "star": unfilledStar },
            { "id": 5, "star": unfilledStar },
        ]
    }
    const [state, setState] = useState(initState);
    const selectedAndUnSelected = starID => {
        if (starID === 1 && state.ratings[0].star === filledStar && state.ratings[1].star !== filledStar) {
            setState(initState);
            starID = 0
        } else {
            for (let index = 0; index < state.ratings.length; index++) {
                if (index < starID) state.ratings[index]['star'] = filledStar;
                else state.ratings[index]['star'] = unfilledStar;
            }
            setState({ ...state });
        }
        onPress && onPress(starID);
    };
    useEffect(useCallback(() => {
        selectedAndUnSelected(initialCount ? initialCount : 0);
    }, [initialCount]), [initialCount]);
    // console.log("[Ratings] :", state);
    return (
        <View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: "center" }, { ...styles }]}>
            {
                state.ratings.map((item, i) => (
                    <TouchableOpacity key={i} style={{ margin: margin ? margin : 5 }} onPress={disabled ? () => { } : () => selectedAndUnSelected(item.id, i)} disabled={disabled}>
                        <SvgXml xml={item.star} height={starHeight ? starHeight : 20} width={starWidth ? starWidth : 20} />
                    </TouchableOpacity>
                ))
            }
        </View >
    )
}
