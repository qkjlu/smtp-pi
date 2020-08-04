import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import TabBarIcon from '../components/TabBarIcon';
import TruckScreen from "../screens/Truck/TruckScreen";
import TruckScreenCarriere from "../screens/Truck/TruckScreenCarriere";
const BottomTab = createBottomTabNavigator();

export default function BottomTabTruckNavigator({ navigation, route }) {
    return (
        <BottomTab.Navigator>
            <BottomTab.Screen
                name="worksite"
                component={TruckScreen}
                options={{
                    title: 'Chantier',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-people" />,
                }}
            />
            <BottomTab.Screen
                name="carriere"
                component={TruckScreenCarriere}
                options={{
                    title: 'Carriere',
                    tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-clipboard" />,
                }}
            />
        </BottomTab.Navigator>
    );
}