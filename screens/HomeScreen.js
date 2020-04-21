import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, TextInput, Button, Alert  } from 'react-native';
import Search from "../components/Search";

import AddWorkSiteForm from "../components/Worksite/AddWorkSiteForm";
import ListWorkSite from "../components/Worksite/ListWorkSite";
import AddUser from "../components/User/AddUser";
import Login from "../components/Login";
import UserList from "../components/User/UserList";
import UpdateUser from "../components/User/UpdateUser";

import style from "../Style";
export default function HomeScreen() {
  return (
          <View>
              { /*ajouter un chantier*/}
              { /*ajouter une entreprise*/}

              { /*ajouter un compte utilisateur */}

              { /* liste de chantier */}
          </View>
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
