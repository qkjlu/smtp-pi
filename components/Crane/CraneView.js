import * as React from 'react';
import {Text, View, ScrollView } from 'react-native';
import ValidateButton from "../ValidateButton";
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import StopButtons from "../StopButtons";
import WorkSiteMap from "../Worksite/WorkSiteMap";
import TruckArrivalTime from "./TruckArrivalTime";
export default function CraneView({navigation, route}) {
    return (
        <View>
            <View style={{alignItems: 'center', justifyContent: 'center', paddingTop: 10,}}>
                <WorkSiteMap/>
            </View>
            <Text style={{textAlign:"center", fontSize:15, paddingVertical: 5}}> Arrivé des prochains camions</Text>
            <View style={{flexDirection:'row',  justifyContent:'center', alignItems: 'center' , backgroundColor : '#FFF' }}>
                <Icon style={{paddingRight:5}} name="map-marker" size={30} color="green" />
                <TruckArrivalTime time={2}/>
                <TruckArrivalTime time={5}/>
                <TruckArrivalTime time={8}/>
                <TruckArrivalTime time={13}/>
                <TruckArrivalTime time={16}/>
            </View>
            <StopButtons/>
        </View>
    );
}
