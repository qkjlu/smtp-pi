import * as React from 'react';
import {createStackNavigator} from "@react-navigation/stack";
import ListWorkSite from "../../components/Worksite/ListWorkSite";
import CraneView from "../../components/Crane/CraneView";
import LogoutButton from "../../components/LogoutButton";
const HomeStack = createStackNavigator();

export default function CraneScreen({navigation,route}) {
    return (
        <HomeStack.Navigator screenOptions={{headerRight : () => (<LogoutButton/>)}}>
            <HomeStack.Screen
                name="WorkSiteManagment"
                component={ListWorkSite}
                options={() => ({headerTitle: 'Gestion des chantiers CRANE',})}
            />
            <HomeStack.Screen
                name="CraneView"
                component={CraneView}
                options={({ route }) => ({headerTitle: route.params.worksite.nom})}
            />
        </HomeStack.Navigator>
    );
}