import React from 'react'
import {Text, View, Image} from 'react-native'
import style from '../../Style'
import MapView from 'react-native-maps';
export default class WorkSiteMap extends React.Component {
    render() {
        return (
            <View>
                <Image source={{uri: 'https://img.xooimage.com/files88/a/5/c/itineraire-3932b71.png'}}
                       style={{width: 600, height: 500}} />
            </View>
        );
    }
}