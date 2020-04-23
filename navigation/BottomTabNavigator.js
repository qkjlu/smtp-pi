import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator} from "@react-navigation/stack";
import * as React from 'react';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import UsersScreen from "../screens/UsersScreen";
import WorkSiteScreen from "../screens/WorkSiteScreen";

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';
const HomeStack = createStackNavigator();

function WorkSiteStackScreen() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen
                name="WorkSiteManagment"
                component={HomeScreen}
                options={() => ({headerTitle: 'Gestion des chantiers',})}
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

function MapStackScreen() {
    return (
        <HomeStack.Navigator>
            <UserStack.Screen
                name="MapManagment"
                component={LinksScreen}
                options={() => ({headerTitle: "Carte de l\'ensemble des chantiers",})}
            />
        </HomeStack.Navigator>
    );
}

export default function BottomTabNavigator({ navigation, route }) {
    // Set the header title on the parent stack navigator depending on the
    // currently active tab. Learn more in the documentation:
    // https://reactnavigation.org/docs/en/screen-options-resolution.html
    //navigation.setOptions({ headerTitle: getHeaderTitle(route) });

    return (
        <BottomTab.Navigator>
            <BottomTab.Screen
                name="Home"
                component={WorkSiteStackScreen}
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
                component={MapStackScreen}
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
