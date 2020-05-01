import React from "react";
import MapView from 'react-native-maps'
import { UrlTile} from 'react-native-maps'
import {Text, View, FlatList, ListView, StyleSheet,PermissionsAndroid} from "react-native";
import TruckMarker from './TruckMarker';
import ConnectionToServer from '../Connection/ConnectionToServer';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import io from "socket.io-client";

export default class MapTest extends React.Component {
  constructor(props) {
      super(props);
      this.handleConnection = this.handleConnection.bind(this);
      this.handleCoordinates = this.handleCoordinates.bind(this);
      this.watchLocation = this.watchLocation.bind(this);
      this.requestLocationPermission = this.requestLocationPermission.bind(this);
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
          "userId" : 56,
          "chantierId" : 31,
          "coordinates": {
            "longitude": 43.8333,
            "latitude": 4.35
          }
    });

    await this.requestLocationPermission(socket);
  }

  watchLocation(socket){
    Location.watchPositionAsync(
      // option
      {
        accuracy: Location.Accuracy.Highest,
      },
      position => {
        let { coords } = position;

        let toSubmit = {
            "coordinates":{
              "longitude": coords.longitude,
              "latitude" : coords.latitude
            }
        }

        socket.emit("chantier/sendCoordinates", toSubmit);
        this.setState({myPos : {
          latitude : coords.latitude,
          longitude : coords.longitude
        }})

      },
      error => console.log(error)
    )

  }

  getChantier(){

  }

  handleConnection(data){
    console.log(data.userId +" is connected")
    var copy = this.state.users.slice();
    copy.push(data.userId);
    console.log("users:" + copy);
    this.setState({
      users : copy
    });
  }

  handleCoordinates(data){
    console.log("coordianates receve: " + JSON.stringify(data));
    let copy = this.state.users.slice();
    copy[data.userId] = data.coordinates;
    console.log("copy : " + JSON.stringify(copy));
    this.setState({
      users : copy
    })
  }

  async requestLocationPermission(socket) {
    try {
      let {granted} = await Permissions.askAsync(Permissions.LOCATION);
      if (granted) {
        console.log("acces to position granted")
        this.watchLocation(socket);
      } else {
        console.log("Location permission denied")
      }
    } catch (err) {
      console.log(err)
    }
  }

  render() {

    console.log(this.state.users);
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
          <UrlTile
            urlTemplate={"http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          />

        {this.state.users.map(marker => {

          const coordinates = {
            "coordinates" : {
                latitude: marker.coordinates.latitude,
                longitude: marker.coordinates.longitude,
              }
            };

          return( <TruckMarker coords={coordinates}/>)

        })}

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
