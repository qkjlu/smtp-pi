import React from "react";
import {Callout, Marker} from 'react-native-maps'
import {Text, View, StyleSheet,AsyncStorage} from "react-native";
import axios from 'axios';
import MapCallout from "react-native-maps/lib/components/MapCallout";

export default class TruckMarker extends React.Component {
  constructor(props) {
      super(props);
      this.handleCoordinates = this.handleCoordinates.bind(this);
      this.getCamionneurInfo = this.getCamionneurInfo.bind(this);
      this.colorForThisEtat = this.colorForThisEtat.bind(this);
      this.state = {
        socket : this.props.socket,
        latitude : this.props.user.coordinates.latitude,
        longitude : this.props.user.coordinates.longitude,
        nom: "",
        prenom : "",
        etat : this.props.user.etat,
      }
  }

  async componentDidMount(){
    //const socket = this.props.socket;
    this.getCamionneurInfo();
    await this.state.socket.on("chantier/user/sentCoordinates", this.handleCoordinates);
  }

  async componentWillUnmount(){
    this.state.socket.off("chantier/user/sentCoordinates", this.handleCoordinates);
  }

  async getCamionneurInfo(){
    const token  = await AsyncStorage.getItem('token');
    axios({
      method: 'get',
      url: 'https://smtp-pi.herokuapp.com/camionneurs/' + this.props.user.userId,
      headers: {'Authorization': 'Bearer ' + token},
    })
      .then( response => {
        if(response.status != 200){
          console.log(response.status);
        }
        console.log(response.status)
        this.setState({
          nom: response.data.nom,
          prenom : response.data.prenom
        });
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  async handleCoordinates(data){
      console.log("Marker: coordinates receive: " + JSON.stringify(data));
      if(data.userId == this.props.user.userId){
          this.setState({
              latitude : data.coordinates.latitude,
              longitude : data.coordinates.longitude,
              etat : data.etat,
          })
      }
  }

  colorForThisEtat(etat){
      switch (etat) {
          case "déchargé":
              return "blue";
          case "chargé":
              return "green";
          case "pause":
              return "yellow";
          case "probleme":
              return "orange";
          case "urgence":
              return "red";
          case "enDéchargement":
              return "purple";
          case "enChargement":
              return "purple";
          case null:
              return "black";
      }
  }

  render() {
    return(
      <Marker
          key = {this.props.user.userId + this.state.etat}
          coordinate={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
          }}
          title={this.state.prenom + ' ' + this.state.nom }
          pinColor={this.colorForThisEtat(this.state.etat)}
          description={this.state.etat}

      />
  )
  }
}
