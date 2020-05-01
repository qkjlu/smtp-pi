watchLocation(){
  console.log("enter location")
  this.watchID = Geolocation.watchPosition(
    position => {
      const { latitude, longitude } = position.coords;
      console.log("latitude: " +latitude);

      this.setState({
        latitude : latitude,
        longitude : longitude
      });
    },

    error => console.log(error),

    // option
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000,
    }

  )

}

{
  accuracy: Location.Accuracy.Highest,
  timeInterval: 5000,
  distanceInterval: 10
},

// Connection to server: socket
// passer la socket(fonction lister) dans les props du marker dans le marker
//

import React from "react";
import MapView from 'react-native-maps'
import { UrlTile} from 'react-native-maps'
import {Text, View, FlatList, ListView, StyleSheet,PermissionsAndroid} from "react-native";
import TruckMarker from './TruckMarker';
import ConnectionToServer from '../Connection/ConnectionToServer';


export default class MapTest extends React.Component {
  constructor(props) {
      super(props);
      this.handleConnection = this.handleConnection.bind(this);
      this.state = {
        socket : null,
        users: [],
      };
  }

  async componentDidMount(){
    let s = await new ConnectionToServer();
    await s.listenConnection(this.handleConnection);
    await s.initConnection(56,1);
    s.listenConnection(this.handleConnection);
    this.setState({socket : s});
  }

  getChantier(){

  }

  handleConnection(data){
    console.log(data.userId +" is connected")
    var copy = this.state.users.slice();
    copy.push(data.userId);
    console.log(copy);
    this.setState({
      users : copy
    });
  }

  render() {
    return(
      <View style={{flex: 1}}>
        <MapView
          style = {styles.map}
          region={{
            latitude: 43.8333,
            longitude: 4.35,
            latitudeDelta: 0.1,
            longitudeDelta: 0.0421,
          }}
        >

        <TruckMarker
          socket={this.state.socket}
        />

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
