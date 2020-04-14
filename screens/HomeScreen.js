import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Search from "../components/Search";
import WorkSite from "../components/WorkSite";
export default function HomeScreen() {
  return (
    <View style={styles.container}>
          <Text style={styles.getStartedText}>Liste des chantier:</Text>
          <Search/>
          <WorkSite/>
          <WorkSite/>
          <WorkSite/>
          <WorkSite/>
          <WorkSite/>
          <WorkSite/>

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
