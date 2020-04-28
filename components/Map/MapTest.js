import React from "react";
import MapView from 'react-native-maps'
import { UrlTile} from 'react-native-maps'
import {Text, View, FlatList, ListView, StyleSheet,PermissionsAndroid} from "react-native";
import TruckMarker from './TruckMarker';


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
            latitude: 43.8333,
            longitude: 4.35,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <TruckMarker />

          <UrlTile
            urlTemplate={"http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          />
        </MapView>

      </View>
    )
  }
}


const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
