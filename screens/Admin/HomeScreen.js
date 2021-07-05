import * as React from 'react';
import {StyleSheet} from 'react-native';
import ListWorkSite from "../../components/Worksite/ListWorkSite";
import WorkSiteSettings from "../../components/Worksite/WorkSiteSettings";
import AddGPSLocation from "../../components/Place/AddGPSLocation";
import ModifyGPSLocation from "../../components/Place/ModifyGPSLocation";
import AddPlaceForm from "../../components/Place/AddPlaceForm";
import WorkSiteScreen from "./WorkSiteScreen";
import {createStackNavigator} from "@react-navigation/stack";
import LogoutButton from "../../components/LogoutButton";
import Button from "react-native-web/dist/exports/Button";
import Road from "../../components/Road/Road";
const HomeStack = createStackNavigator();
export default function HomeScreen({navigation}) {
    return (
        <HomeStack.Navigator screenOptions={{headerRight : () => (<LogoutButton/>)}}>
            <HomeStack.Screen
                name="WorkSiteManagment"
                component={ListWorkSite}
                options={{
                    headerTitle: 'Gestion des chantiers',
                    headerRight : () => (
                        <LogoutButton/>
                    ),
                }}
            />

            <HomeStack.Screen
                name="WorkSite"
                component={WorkSiteScreen}
                options={({ route }) => ({headerTitle: route.params.worksite.nom})}
            />
            <HomeStack.Screen
                name="AddGPSLocation"
                component={AddGPSLocation}
                options={({ route }) => ({headerTitle: "coordonnées GPS d'un lieu"})}
            />
            <HomeStack.Screen
                name="ModifyGPSLocation"
                component={ModifyGPSLocation}
                options={({ route }) => ({headerTitle: "coordonnées GPS d'un lieu"})}
            />
            <HomeStack.Screen
                name="AddPlace"
                component={AddPlaceForm}
                options={({ route }) => ({headerTitle: "Ajout d'un lieu"})}
            />
            <HomeStack.Screen
                name="Road"
                component={Road}
                options={({ route }) => ({headerTitle: route.params.worksite.nom})}
            />
            <HomeStack.Screen
                name="Settings"
                component={WorkSiteSettings}
                options={({ route }) => ({headerTitle: route.params.worksite.nom})}
            />
        </HomeStack.Navigator>
    );
}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  getStartedText: {
    marginVertical : 40,
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
});
