import {View} from "react-native";
import ValidateButton from "./ValidateButton";
import * as React from "react";

export default function StopButtons({navigation, route}) {
    return (
        <View style={{flex: 1, flexDirection: "row", alignContent:"flex-end"}}>
            <View style={{flex: 2}}>
                <ValidateButton text={"Pause"}/>
            </View>
            <View style={{flex: 2}}>
                <ValidateButton text={"Problème"}/>
            </View>
            <View style={{flex: 2}}>
                <ValidateButton text={"Urgence"}/>
            </View>
        </View>
    );
}