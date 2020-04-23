import * as React from 'react';
import {Text, View, ScrollView } from 'react-native';
import style from '../Style'
import WorkSiteView from "../components/Worksite/WorkSiteView";
import WorkSiteMap from "../components/Worksite/WorkSiteMap";
export default function WorkSiteScreen({navigation, route}) {
    const idChargement = route.params.worksite.lieuChargementId;
    const idDechargement = route.params.worksite.lieuDéchargementId;
    return (
            <View>
                <WorkSiteView idChargement = {idChargement} idDechargement = {idDechargement} />
            </View>
        );
}

WorkSiteScreen.navigationOptions = {
    header: null,
};
