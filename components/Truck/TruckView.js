import * as React from 'react';
import {Text, View, ScrollView } from 'react-native';
import style from '../../Style'
import WorkSiteView from "../Worksite/WorkSiteView";

export default function TruckView({navigation, route}) {
    const idChargement = route.params.worksite.lieuChargementId;
    const idDechargement = route.params.worksite.lieuDéchargementId;
    const worksite = route.params.worksite;
    return (
        <View>
            <WorkSiteView worksite={worksite} idChargement = {idChargement} idDechargement = {idDechargement} />
        </View>
    );
}
