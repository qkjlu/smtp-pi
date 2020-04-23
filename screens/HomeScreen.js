import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import Search from "../components/Search";
import ButtonGroupAdmin from "../components/ButtonGroupAdmin";
import ListWorkSite from "../components/Worksite/ListWorkSite";
import WorkSiteMap from "../components/Worksite/WorkSiteMap";
export default function HomeScreen({navigation}) {
  return (
      <ScrollView>
          <View>
              <ButtonGroupAdmin/>
              { /* liste de chantier */}
              <Text style={styles.getStartedText}>Liste des chantier:</Text>
              <Search/>
              <ListWorkSite navigation={navigation}/>
          </View>
      </ScrollView>
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
