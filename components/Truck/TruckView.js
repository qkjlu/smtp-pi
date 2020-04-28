import * as React from 'react';
import {Text, View, ScrollView } from 'react-native';
import style from '../../Style'
import TimeBetween from "./TimeBetween";
import TruckMap from "./TruckMap";
import StopButtons from "../StopButtons";

export default function TruckView({navigation, route}) {
    return (
        <View>
            <TimeBetween/>
            <TruckMap/>
            <StopButtons/>
        </View>
    );
}
