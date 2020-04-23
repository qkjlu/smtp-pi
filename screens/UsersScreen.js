import * as React from 'react';
import {Text, View, ScrollView, StyleSheet } from 'react-native';
import UserList from "../components/User/UserList";
import UpdateUser from "../components/User/UpdateUser";
import AddUser from "../components/User/AddUser";
import Login from "../components/Login";
import style from "../Style";
import { createStackNavigator} from "@react-navigation/stack";


const UserStack = createStackNavigator();

export default function UsersScreen() {
  return (
      <UserStack.Navigator>
          <UserStack.Screen
              name="Users"
              component={UserList}
              options={() => ({headerTitle: "Liste des utilisateurs",})}
          />
          <UserStack.Screen
              name="UpdateUser"
              component={UpdateUser}
              options={() => ({headerTitle: "Modifier un utilisateur",})}
          />
          <UserStack.Screen
              name="AddUser"
              component={AddUser}
              options={() => ({headerTitle: "Ajouter un utilisateur",})}
          />
      </UserStack.Navigator>
  );
}

UsersScreen.navigationOptions = {
    header: null,
};

const styles = StyleSheet.create({
  view:{
    flex:1,
  },
});
