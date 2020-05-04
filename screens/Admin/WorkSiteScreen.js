import * as React from 'react';
import { View } from 'react-native';
import WorkSiteView from "../../components/Worksite/WorkSiteView";

export default function WorkSiteScreen({navigation, route}) {
    const idChargement = route.params.worksite.lieuChargementId;
    const idDechargement = route.params.worksite.lieuDéchargementId;
    const worksite = route.params.worksite;
    return (
            <View>
                <WorkSiteView worksite={worksite} idChargement = {idChargement} idDechargement = {idDechargement} />
            </View>
        );
}