import React from "react";
import MapView from 'react-native-maps';
import {Text, View, FlatList, ListView, StyleSheet} from "react-native";


export default class MapTest extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          report: null
      };
  }

  render() {
    return(
      <View style={{flex: 1}}>
        <MapView
          style = {styles.map}
          region={{
            latitude: 43.61,
            longitude: 3.87,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
        <MapView.Marker
            coordinate={{latitude: 43.61,
            longitude: 3.87}}
            title={"title"}
            description={"description"}
         />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
