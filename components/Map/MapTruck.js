import React from "react";
import MapView from 'react-native-maps'
import { UrlTile} from 'react-native-maps'
import {Text, View, FlatList, ListView, StyleSheet, PermissionsAndroid, Dimensions, AsyncStorage} from "react-native";
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
      this.succesConnection = this.succesConnection.bind(this);
      this.getLocation = this.getLocation.bind(this);
      this.state = {
        socket : null,
        users: [],
        myPos : {
          latitude : null,
          longitude : null
        },
        etat : null,
        previousEtat : null
      };
  }

  async componentDidMount(){
    const socket = await io("https://smtp-pi.herokuapp.com/");
    const userId  = await AsyncStorage.getItem('userId');
    await this.requestLocationPermission();
    await socket.emit("chantier/connect", {
          "userId" :  userId,
          "chantierId" : this.props.worksite.id,
          "coordinates": {
            "longitude": this.state.myPos.longitude,
            "latitude": this.state.myPos.latitude
          }
    });
    await socket.on("chantier/connect/success", this.succesConnection);
    await socket.on("chantier/user/connected", this.handleConnection);
    await this.watchLocation(socket);
    this.setState({socket : socket});
  }

  async componentWillUnmount(){
    await this.state.socket.emit("chantier/disconnect","")
    console.log("Truck : Close connection to socket");
    this.state.socket.close();
  }

  succesConnection(data){
    console.log("Truck: ACK connection" + JSON.stringify(data));
    this.setState({
      etat : data.etat,
      previousEtat : data.previousEtat
    })
  }

  // ask location to GPS and get current position if granted
  async requestLocationPermission() {
    try {
      let {granted} = await Permissions.askAsync(Permissions.LOCATION);
      if (granted) {
        console.log("acces to position granted")
        await this.getLocation()
      } else {
        console.log("Location permission denied")
      }
    } catch (err) {
      console.log(err)
    }
  }

  // Get the current position of the device.
  async getLocation(){
    let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});
    this.setState({ myPos : {
                              latitude : location.coords.latitude,
                              longitude : location.coords.longitude
                            }
                  });
  }

  // Subscribe to location updates from the device
  watchLocation(socket){
    Location.watchPositionAsync(
      // option
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 5000,
      },
      position => {
        let { coords } = position;

        let toSubmit = {
            "coordinates":{
              "longitude": coords.longitude,
              "latitude" : coords.latitude,
            },
            "etat": this.state.etat,
            "previousEtat": this.state.previousEtat,
        };
        socket.emit("chantier/sendCoordinates", toSubmit);
      },
      error => console.log(error)
    )
  }


  getCoordinatesChargement(){
      return [this.props.worksite.lieuDéchargementId,]
  }

  handleConnection(data){
    console.log("Truck:" + data.userId +" is connected")
  }

  handleCoordinates(data){
    console.log("coordianates receve: " + JSON.stringify(data));
  }

  render() {
    return(
      <View>
          <Text> TEST ENVOIE COORDONNEES CAMIONNEURS</Text>
          <Text>  chargement  : long {this.props.chargement.longitude} lat : {this.props.chargement.latitude} </Text>
          <Text>  dechargement  : long {this.props.dechargement.longitude} lat : {this.props.dechargement.latitude} </Text>
          <Text>  coordonnées user : long :{this.state.myPos.longitude} , lat : {this.state.myPos.latitude} </Text>
          <Text>  mon etat : {this.state.etat}</Text>
          <Text>  mon etat précédent : {this.state.previousEtat}</Text>
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
