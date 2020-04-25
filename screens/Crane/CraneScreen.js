import * as React from 'react';
import {createStackNavigator} from "@react-navigation/stack";
import ListWorkSite from "../../components/Worksite/ListWorkSite";
import WorkSiteScreen from "../Admin/WorkSiteScreen";

const HomeStack = createStackNavigator();
export default function TruckScreen({navigation}) {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen
                name="WorkSiteManagment"
                component={ListWorkSite}
                options={() => ({headerTitle: 'Gestion des chantiers CRANE',})}
            />
            <HomeStack.Screen
                name="WorkSite"
                component={WorkSiteScreen}
                options={({ route
                          }) => ({headerTitle: route.params.worksite.nom})}
            />
        </HomeStack.Navigator>
    );
}