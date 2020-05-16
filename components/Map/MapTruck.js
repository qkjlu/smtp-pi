import React from "react";
import MapView from 'react-native-maps'
import { UrlTile} from 'react-native-maps'
import {Text, View, FlatList, ListView, StyleSheet, PermissionsAndroid, Dimensions, AsyncStorage} from "react-native";
import { getDistance } from 'geolib';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import io from "socket.io-client";
import StopButtons from "../StopButtons";
import TimeBetween from "../Truck/TimeBetween";

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
      this.getMyEtatFromServer = this.getMyEtatFromServer.bind(this);
      this.updateEtat = this.updateEtat.bind(this);
      this.rollBack = this.rollBack.bind(this);
      this.calculateFlightDistance = this.calculateFlightDistance.bind(this);
      this.state = {
          distanceMinToChangeEtatNearToAPlace : 40,
          socket : null,
          users: [],
          ETA : 0, //Estimate Time Arrival
          myPos : {
              latitude : null,
              longitude : null
          },
          etat : null,
          previousEtat : null,
      };
  }

  async componentDidMount(){
    const socket = await io("https://smtp-pi.herokuapp.com/");
    const userId  = await AsyncStorage.getItem('userId');
    await this.requestLocationPermission();
    await this.getMyEtatFromServer();
    await socket.emit("chantier/connect", {
          "userId" :  userId,
          "chantierId" : this.props.worksite.id,
          "coordinates": {
            "longitude": this.state.myPos.longitude,
            "latitude": this.state.myPos.latitude
          }
    });
    //await socket.on("chantier/connect/success", this.succesConnection);
    await socket.on("chantier/user/connected", this.handleConnection);
    await this.watchLocation(socket);
    this.setState({socket : socket});
  }

  async componentWillUnmount(){
    await this.state.socket.emit("chantier/disconnect","");
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
        console.log("access to position granted");
        await this.getLocation()
      } else {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.log("error "+err)
    }
  }

  // Get the current position of the device.
  async getLocation(){
      var location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});
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
        timeInterval: 1000,
      },
      position => {
        let { coords } = position;
        this.changeEtatNearPlaces(this.state.distanceMinToChangeEtatNearToAPlace);
        this.setState({
            myPos :{
                longitude : coords.longitude,
                latitude : coords.latitude,
            }
        });
        let toSubmit = {
            "coordinates":{
              "longitude": coords.longitude,
              "latitude" : coords.latitude,
            },
            "etat": this.state.etat,
            "previousEtat": this.state.previousEtat,
            "ETA" : this.state.ETA
        };
        socket.emit("chantier/sendCoordinates", toSubmit);
      },
      error => console.log("error :" +error)
    )
  }

  // calcul meters between 2 coordinates
  calculateFlightDistance(lat1,lon1,lat2,lon2){
      var result = getDistance({latitude: lat1, longitude: lon1,}, {latitude : lat2, longitude : lon2,});
      console.log("lat1: "+lat1+ " lon1 :"+lon1+"lat2: "+lat2+" lon2 : "+lon2+"=>  "+result)
      return result
  }

  //test if a truck is near to a place and have to change his own "etat"
  changeEtatNearPlaces(distanceMinToUpdateEtat){
      var me = this.state.myPos;
      if(this.state.etat === "déchargé") {
          var distance = this.calculateFlightDistance(me.latitude,me.longitude,this.props.chargement.latitude,this.props.chargement.longitude);
          console.log("distance déchargé->enChargement = "+distance);
          if(distance<distanceMinToUpdateEtat){
                console.log("changement d'etat car assez proche du lieu de chargement");
                this.setState({etat: "enChargement"})
          }
      }
      else if (this.state.etat === "chargé"){
          let distance = this.calculateFlightDistance(me.latitude,me.longitude,this.props.dechargement.latitude,this.props.dechargement.longitude);
          console.log("distance chargé->enDéchargement ="+distance);
          if(distance<distanceMinToUpdateEtat){
                console.log("changement d'etat car assez proche du lieu de dechargement");
                this.setState({etat: "enDéchargement"})
            }
      }else if (this.state.etat === "enChargement"){
          let distance = this.calculateFlightDistance(me.latitude,me.longitude,this.props.chargement.latitude,this.props.chargement.longitude);
          console.log("distance enChargement->chargé ="+distance);
          if(distance>distanceMinToUpdateEtat){
              console.log("changement d'etat car assez loin du lieu de chargement");
              this.setState({etat: "chargé"})
          }
      }else if (this.state.etat === "enDéchargement"){
          let distance = this.calculateFlightDistance(me.latitude,me.longitude,this.props.dechargement.latitude,this.props.dechargement.longitude);
          console.log("distance enDéchargement->déchargé ="+distance);
          if(distance>distanceMinToUpdateEtat){
              console.log("changement d'etat car assez loin du lieu de déchargement");
              this.setState({etat: "déchargé"})
          }
      }
  }
   // update etat with the 3 buttons pause probleme urgence
  updateEtat(etat){
      if(etat === "pause" || etat === "probleme" || etat === "urgence"){
          this.setState({previousEtat : this.state.etat})
      }
      this.setState({etat : etat});
      console.log("changement etat => "+ this.state.etat);
      let toSubmit = {
            "coordinates":{
              "longitude": this.state.myPos.longitude,
              "latitude" : this.state.myPos.latitude,
            },
            "etat": etat,
            "previousEtat": this.state.previousEtat,
      };
      this.state.socket.emit("chantier/sendCoordinates", toSubmit);
  }

  // rollback the state after a pause/probleme/urgence
  rollBack(){
        //demande son etat persisté au serveur
        //sinon
        let toSubmit = {
              "coordinates":{
                "longitude": this.state.myPos.longitude,
                "latitude" : this.state.myPos.latitude,
              },
              "etat": this.state.previousEtat,
              "previousEtat": this.state.etat
        };
        this.state.socket.emit("chantier/sendCoordinates", toSubmit);
        this.setState({etat : this.state.previousEtat})
  }


  handleConnection(data){
    console.log("Truck:" + data.userId +" is connected")
  }

  handleCoordinates(data){
    console.log("coordinates receve: " + JSON.stringify(data));
  }

  render() {
    return(
      <View>
          <TimeBetween timeBetween={this.state.timeBetween}/>
          <Text> TEST ENVOIE COORDONNEES CAMIONNEURS</Text>
          <Text>  chargement  : long {this.props.chargement.longitude} lat : {this.props.chargement.latitude} </Text>
          <Text>  dechargement  : long {this.props.dechargement.longitude} lat : {this.props.dechargement.latitude} </Text>
          <Text>  coordonnées user : long :{this.state.myPos.longitude} , lat : {this.state.myPos.latitude} </Text>
          <Text>  mon etat : {this.state.etat}</Text>
          <Text>  mon etat précédent : {this.state.previousEtat}</Text>
          <StopButtons  changeEtat={e => this.updateEtat(e)} rollBack={() => this.rollBack()}/>
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
