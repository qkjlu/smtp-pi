import * as React from 'react';
import {createStackNavigator} from "@react-navigation/stack";
import ListWorkSite from "../../components/Worksite/ListWorkSite";
import WorkSiteScreen from "../Admin/WorkSiteScreen";
import TruckView from "../../components/Truck/TruckView";
import LogoutButton from "../../components/LogoutButton";

const HomeStack = createStackNavigator();
export default function TruckScreen({navigation,route}) {
    return (
        <HomeStack.Navigator screenOptions={{headerRight : () => (<LogoutButton/>)}}>
            <HomeStack.Screen
                name="WorkSiteManagment"
                component={ListWorkSite}
                options={() => ({headerTitle: 'Gestion des chantiers',})}
            />
            <HomeStack.Screen
                name="TruckView"
                component={TruckView}
                options={({route}
                ) => ({headerTitle: route.params.worksite.nom})}
            />
        </HomeStack.Navigator>
    );
}