import * as React from 'react';
import {Text, View, ScrollView } from 'react-native';
import style from '../../Style'
import TimeBetween from "./TimeBetween";
import StopButtons from "../StopButtons";
import MapTruck from "../Map/MapTruck";

export default function TruckView({navigation, route}) {
    const worksite = route.params.worksite;
    return (
        <View>
            <TimeBetween/>
            <MapTruck worksite={worksite}/>
            <StopButtons/>
        </View>
    );
}
