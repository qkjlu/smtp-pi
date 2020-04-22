import * as React from 'react';
import {Text, View, ScrollView } from 'react-native';
import style from '../Style'
export default function WorkSiteScreen({navigation, route}) {
    const {nom} = route.params.worksite.nom;
    const {idChargement} = route.params.worksite.nom;
    return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={style.title}> {route.params.worksite.nom} </Text>
                <Text style={style.title}> Yo </Text>
            </View>
        );
}

WorkSiteScreen.navigationOptions = {
    header: null,
};
