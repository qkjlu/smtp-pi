import React from "react";
import MapView from 'react-native-maps'
import { UrlTile} from 'react-native-maps'
import {Text, View, FlatList, Dimensions, StyleSheet,PermissionsAndroid,AsyncStorage} from "react-native";
import TruckMarker from './TruckMarker';
import {Marker, Circle} from "react-native-maps";
import ConnectionToServer from '../Connection/ConnectionToServer';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import io from "socket.io-client";

export default class MapAdmin extends React.Component {
  constructor(props) {
      super(props);
      this.handleConnection = this.handleConnection.bind(this);
      this.handleDisconnection = this.handleDisconnection.bind(this);
      this.handleCoordinates = this.handleCoordinates.bind(this);
      this.componentDidMount =this.componentDidMount.bind(this);
      this.succesConnection = this.succesConnection.bind(this);
      this.state = {
          socket : null,
          connected : false,
          users: [],
          etat : null,
      };
  }

  async componentDidMount(){
    const socket = await io("https://smtp-pi.herokuapp.com/");
    const userId  = await AsyncStorage.getItem('userId');
    await socket.emit("chantier/connect", {
          "userId" : userId,
          "chantierId" : this.props.worksite.id,
  });
    await socket.on("chantier/connect/success", this.succesConnection);
    await socket.on("chantier/user/connected", this.handleConnection);
    await socket.on("chantier/user/disconnected", this.handleDisconnection);
    await socket.on("chantier/user/sentCoordinates", this.handleCoordinates);
    this.setState({ socket : socket});
  }

  async componentWillUnmount(){
    await this.state.socket.emit("chantier/disconnect","")
    console.log("Admin : Close connection to socket");
    this.state.socket.close();
  }

  // update map when an user connect or disconnect
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.users.length != this.state.users.length;
  }


  // delete in user array the user that deconnecting
  handleDisconnection(data){
    console.log("Admin:" + data.userId + " disconnect");
    var copy = this.state.users.slice();
    var index = copy.findIndex(s => s.userId == data.userId);
    if (index > -1) {
      copy.splice(index, 1);
      this.setState({
        users : copy
      })
    }
  }

  succesConnection(data){
    console.log("Admin: ACK connection");
  }

  async handleConnection(data){
    console.log("Admin: " + data.userId +" is connected")
    // check if the user connecting is a admin
    var isAdmin = Object.keys(data.coordinates).length === 0 && data.coordinates.constructor === Object;
    if(!isAdmin){
      var copy = this.state.users.slice();
      copy.push(data);
      this.setState({
        users : copy
      });
    }
  }

  async handleCoordinates(data){
    //console.log("Admin: coordinates receive: " + JSON.stringify(data));
    var copy = this.state.users.slice();
    var index = copy.findIndex(s => s.userId == data.userId);
    if( index != -1){
      copy[index] = data;
      this.setState({
        users : copy
      });
    }else{
      copy.push(data);
      this.setState({
        users : copy
      });
    }
  }

  render() {
    console.log("users:" + JSON.stringify(this.state.users));
    const chargement = {latitude : this.props.chargement.latitude, longitude : this.props.chargement.longitude};
    const dechargement = {latitude : this.props.dechargement.latitude, longitude : this.props.dechargement.longitude};

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
          <Marker coordinate={chargement} title={"chargement"} pinColor={"#3895ff"}/>
          <Marker coordinate={dechargement} title={"dechargement"} pinColor={"#3895ff"}/>
          <Circle key = {"chargementCircle"} center={chargement} radius = {20} />
          <Circle key = {"chargementCircle"} center={dechargement} radius = {20} />
          {this.state.users.map(marker => {
            // const coordinates = {
            //   "coordinates" : {
            //       latitude: marker.coordinates.coordinates.latitude,
            //       longitude: marker.coordinates.coordinates.longitude,
            //     }
            //   };
            // console.log("after affectation:" + JSON.stringify(coordinates))

            return( <TruckMarker user={marker} socket={this.state.socket}/>)
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
