import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native'
import { SvgXml } from 'react-native-svg';
import { renderPicture } from '../../../utils/sharedActions';
import commonStyles from '../../../styles/styles';
import Spinner from 'react-native-spinkit';

export default (props) => {
    // console.log('[Product List].props :', props);
    const [state, setState] = useState({
        "productImagesIndexes": [],
    })
    const { data, user, navigation, activeTheme } = props;

    const _gotoProductDetails = item => {
        navigation.navigate("product_details", {
            item
        });
    };
    // console.log("Product List state :", state);

    return (
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {
                data.map((P, idx) => (
                    <TouchableOpacity key={idx} style={{ ...commonStyles.shadowStyles(), margin: 2, elevation: 0.5, height: 170, width: "32%", backgroundColor: "#fff", borderRadius: 7, overflow: 'hidden' }} onPress={() => _gotoProductDetails(P)}>
                        <ImageBackground
                            source={{ uri: renderPicture(P.productImageList, user.tokenObj.token.authToken) }}
                            resizeMode="cover"
                            style={{ height: 90 }}
                            onLoadEnd={() => state.productImagesIndexes.indexOf(idx) === -1 && setState((pre) => ({ ...pre, productImagesIndexes: [...pre.productImagesIndexes, idx] }))}
                        >
                            {
                                state.productImagesIndexes.indexOf(idx) === -1 ?
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                                        <Spinner isVisible={true} size={30} type="Circle" color={"#7359be"} />
                                    </View>
                                    :
                                    null
                            }

                        </ImageBackground>
                        <View style={{ padding: 5 }}>
                            <Text style={{ ...commonStyles.fontStyles(15, activeTheme.grey, 4) }}>{`${P?.marketName}`}</Text>
                            <Text style={{ ...commonStyles.fontStyles(13, activeTheme.grey, 2) }}>{`${P?.productItemName?.length >= 10 ? P?.productItemName.substring(0, 10) + "..." : P?.productItemName}`}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                            <Text>{'Rs.' + P.productPrice}</Text>
                            <View style={{ backgroundColor: 'grey', borderRadius: 20, height: 17, width: 35, justifyContent: 'space-evenly', flexDirection: 'row', alignItems: 'center' }}>
                                <SvgXml xml={`<svg xmlns="http://www.w3.org/2000/svg" width="30.687" height="30.636" viewBox="0 0 30.687 30.636">
<path id="shapes-and-symbols" d="M6.655,18.335,5.143,27.609a.9.9,0,0,0,1.317.928l7.868-4.349,7.868,4.35a.9.9,0,0,0,1.317-.928L22,18.336l6.4-6.56a.9.9,0,0,0-.505-1.51L19.086,8.92,15.138.51a.932.932,0,0,0-1.62,0L9.57,8.919.761,10.265a.9.9,0,0,0-.505,1.51Z" transform="translate(1.016 0.961)" fill="#fff" stroke="#fff" stroke-width="2"/>
</svg>
`} height={12} width={12} />
                                <Text style={{ ...commonStyles.fontStyles(12, "#fff",) }}>{P.rating}</Text>

                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            }
        </View>
    )
}


