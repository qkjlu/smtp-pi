import * as React from 'react';
import {createStackNavigator} from "@react-navigation/stack";
import WorkSiteMap from "../../components/Worksite/WorkSiteMap";
import MapTest from "../../components/Map/MapTest";
const HomeStack = createStackNavigator();

export default function MapScreen() {
    return (
        <HomeStack.Navigator>
          <HomeStack.Screen
              name="MapManagment"
              component={MapTest}
              options={() => ({headerTitle: "Carte de l\'ensemble des chantiers",})}
          />
        </HomeStack.Navigator>
    );
}

