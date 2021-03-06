import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator} from "@react-navigation/stack";
import * as React from 'react';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/Admin/HomeScreen';
import LinksScreen from '../screens/Admin/MapScreen';
import UsersScreen from "../screens/Admin/UsersScreen";
import MapScreen from "../screens/Admin/MapScreen";

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';

export default function BottomTabNavigator({ navigation, route }) {
    // Set the header title on the parent stack navigator depending on the
    // currently active tab. Learn more in the documentation:
    // https://reactnavigation.org/docs/en/screen-options-resolution.html
    //navigation.setOptions({ headerTitle: getHeaderTitle(route) });

    return (
        <BottomTab.Navigator>
            <BottomTab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Chantier',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-people" />,
                }}
            />
            <BottomTab.Screen
                name="Users"
                component={UsersScreen}
                options={{
                    title: 'Utilisateurs',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-people" />,
                }}
            />
            <BottomTab.Screen
                name="Map"
                component={MapScreen}
                options={{
                    title: 'Map',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused}  name="md-map" />,
                }}
            />
        </BottomTab.Navigator>
    );
}
/*
function getHeaderTitle(route) {
    const routeName = route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;

    switch (routeName) {
        case 'WorkSiteManagment':
            return 'Gestion des chantiers2';
        case 'Users':
            return 'Gestion des utilisateurs'
        case 'Links':
            return 'Links to learn more';
    }
}
*/
