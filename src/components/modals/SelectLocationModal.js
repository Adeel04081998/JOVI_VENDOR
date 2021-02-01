import React from 'react';
import CustomLocationSearch from '../../components/locationSearch/CustomLocationSearch';
export default function SelectLocationModal(props) {
    return <CustomLocationSearch {...props} rightButton={true} />
}
