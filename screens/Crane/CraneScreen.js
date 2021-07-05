import * as React from 'react';
import {createStackNavigator} from "@react-navigation/stack";
import ListWorkSite from "../../components/Worksite/ListWorkSite";
import LogoutButton from "../../components/LogoutButton";
import WorkSiteScreen from "../Admin/WorkSiteScreen";
const HomeStack = createStackNavigator();

export default function CraneScreen({navigation,route}) {
    return (
        <HomeStack.Navigator screenOptions={{headerRight : () => (<LogoutButton/>)}}>
            <HomeStack.Screen
                name="WorkSiteManagment"
                component={ListWorkSite}
                options={() => ({headerTitle: 'Gestion des chantiers Chauffeur de pelle',})}
            />
            <HomeStack.Screen
                name="CraneView"
                component={WorkSiteScreen}
                options={({ route }) => ({headerTitle: route.params.worksite.nom})}
            />
        </HomeStack.Navigator>
    );
}