import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import {Text, View, ScrollView, StyleSheet } from 'react-native';
import UserList from "../components/User/UserList";
import UpdateUser from "../components/User/UpdateUser";
import AddUser from "../components/User/AddUser";
import Login from "../components/Login";
import style from "../Style";


export default function UsersScreen() {
    return (
        <UpdateUser />
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
