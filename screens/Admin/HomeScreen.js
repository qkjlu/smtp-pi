import * as React from 'react';
import {StyleSheet} from 'react-native';
import ListWorkSite from "../../components/Worksite/ListWorkSite";
import WorkSiteScreen from "./WorkSiteScreen";
import {createStackNavigator} from "@react-navigation/stack";

const HomeStack = createStackNavigator();
export default function HomeScreen({navigation}) {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen
                name="WorkSiteManagment"
                component={ListWorkSite}
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
