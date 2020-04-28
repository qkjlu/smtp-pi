import React from 'react'
import {Text, View, Image} from 'react-native'
export default class TruckMap extends React.Component {
    render() {
        return (
            <View>
                <Image source={{uri: 'https://image.freepik.com/free-vector/map-with-marked-route_23-2147624233.jpg'}}
                       style={{width: 600, height: 700}} />
            </View>
        );
    }
}