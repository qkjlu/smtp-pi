import * as React from 'react';
import {Text, View, ScrollView } from 'react-native';
import style from '../../Style'
import TimeBetween from "./TimeBetween";
import TruckMap from "./TruckMap";
import StopButtons from "../StopButtons";
import MapTruck from "../Map/MapTruck";

export default function TruckView({navigation, route}) {
    return (
        <View>
            <TimeBetween/>
            <MapTruck/>
            <StopButtons/>
        </View>
    );
}
