import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import TabBarIcon from '../components/TabBarIcon';
const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';

export default function BottomTabTruckNavigator({ navigation, route }) {

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