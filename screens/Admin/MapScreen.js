import * as React from 'react';
import {createStackNavigator} from "@react-navigation/stack";
import MapTest from "../../components/Map/MapTest";
import LogoutButton from "../../components/LogoutButton";
const HomeStack = createStackNavigator();

export default function MapScreen() {
    return (
        <HomeStack.Navigator screenOptions={{headerRight : () => (<LogoutButton/>)}}>
          <HomeStack.Screen
              name="MapManagment"
              component={MapTest}
              options={() => ({headerTitle: "Carte de l\'ensemble des chantiers",})}
          />
        </HomeStack.Navigator>
    );
}

