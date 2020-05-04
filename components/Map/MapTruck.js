import React from "react";
import MapView from 'react-native-maps'
import { UrlTile} from 'react-native-maps'
import {Text, View, FlatList, ListView, StyleSheet, PermissionsAndroid, Dimensions} from "react-native";
import TruckMarker from './TruckMarker';
import ConnectionToServer from '../Connection/ConnectionToServer';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import io from "socket.io-client";

export default class MapTruck extends React.Component {
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
    await socket.emit("chantier/connect", {
          "userId" : Math.random()*1000,
          "chantierId" : 31,
          "coordinates": {
            "longitude": 43.8333,
            "latitude": 4.35
          }
    });

    await this.requestLocationPermission(socket);

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

      },
      error => console.log(error)
    )

  }

  getChantier(){

  }

  handleConnection(data){
    console.log("User say:" + data.userId +" is connected")
    // this.setState({
    //   users : copy
    // });
  }

  handleCoordinates(data){
    console.log("coordianates receve: " + JSON.stringify(data));
  }

  render() {

    console.log(this.state.users);
    return(
      <View>

        <Text> TEST ENVOIE COORDONNEES CAMIONNEURS</Text>

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
