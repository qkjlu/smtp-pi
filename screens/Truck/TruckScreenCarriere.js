import * as React from 'react';
import {createStackNavigator} from "@react-navigation/stack";
import TruckView from "../../components/Truck/TruckView";
import LogoutButton from "../../components/LogoutButton";
import CarriereTruck from "../../components/Carriere/CarriereTruck";

const HomeStack = createStackNavigator();
export default function TruckScreenCarriere({navigation,route}) {
    return (
        <HomeStack.Navigator screenOptions={{headerRight : () => (<LogoutButton/>)}}>
            <HomeStack.Screen
                name="CarriereTruck"
                component={CarriereTruck}
                options={() => ({headerTitle: 'Gestion des carrieres',})}
            />
            <HomeStack.Screen
                name="TruckView"
                component={TruckView}
                options={({ route}
                ) => ({headerTitle: route.params.worksite.nom})}
            />
        </HomeStack.Navigator>
    );
}