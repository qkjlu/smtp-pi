import React from "react";
import MapView from 'react-native-maps'
import { UrlTile} from 'react-native-maps'
import {Text, View, FlatList, Dimensions, StyleSheet,PermissionsAndroid} from "react-native";
import TruckMarker from './TruckMarker';
import {Marker} from "react-native-maps";
import ConnectionToServer from '../Connection/ConnectionToServer';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import io from "socket.io-client";

export default class MapAdmin extends React.Component {
  constructor(props) {
      super(props);
      this.handleConnection = this.handleConnection.bind(this);
      this.handleCoordinates = this.handleCoordinates.bind(this);
      this.componentDidMount =this.componentDidMount.bind(this);
      this.state = {
        myPos : {
          latitude : -1,
          longitude : -1
        },
        users: [],
      };
  }

  async componentDidMount(){
    const socket = await io("https://smtp-pi.herokuapp.com/")
    await socket.on("chantier/user/connected", this.handleConnection);
    await socket.on("chantier/user/sentCoordinates", this.handleCoordinates);
    await socket.emit("chantier/connect", {
          "userId" : 11111,
          "chantierId" : 31,
          "coordinates": {
            "longitude": 43.8333,
            "latitude": 4.35
          }
    });

  }

  getChantier(){

  }

  handleConnection(data){
    console.log(data.userId +" is connected")
    var copy = this.state.users.slice();
    copy.push(data);
    console.log("users:" + copy);
    this.setState({
      users : copy
    });
  }

  handleCoordinates(data){
    console.log("coordinates receve: " + JSON.stringify(data));
    let truckData = data.coordinates;
    var copy = this.state.users.slice();
    var index = copy.findIndex(s => s.userId == data.userId);
    if( index != -1){
      copy[index] = data;
      this.setState({
        users : copy
      });
    }else{
      console.log("user not connected or internal error")
    }

  }

  render() {
    return(
      <View style={{flex: 1}}>
        <MapView
          style = {styles.map}
          region={{
            latitude: this.props.chargement.latitude,
            longitude: this.props.chargement.longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.0421,
          }}
        >
          <UrlTile urlTemplate={"http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"}/>
          <Marker coordinate={{ latitude: this.props.chargement.latitude, longitude: this.props.chargement.longitude}} title={"chargement"} pinColor={"#3895ff"}/>
          <Marker coordinate={{ latitude: this.props.dechargement.latitude, longitude: this.props.dechargement.longitude}} title={"dechargement"} pinColor={"#3895ff"}/>
          {this.state.users.map(marker => {

            const coordinates = {
              "coordinates" : {
                  latitude: marker.coordinates.coordinates.latitude,
                  longitude: marker.coordinates.coordinates.longitude,
                }
              };

            return( <TruckMarker coords={coordinates}/>)
          })}
        </MapView>
      </View>
    )
  }
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  map: {
      width : width,
      height: height,
  },
});
