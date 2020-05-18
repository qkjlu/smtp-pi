import * as React from 'react';
import { View } from 'react-native';
import WorkSiteView from "../../components/Worksite/WorkSiteView";

export default function WorkSiteScreen({navigation, route}) {
    const worksite = route.params.worksite;
    const auChargement = route.params.auChargement;
    return (
            <View>
                <WorkSiteView worksite={worksite} auChargement={auChargement}/>
            </View>
        );
}