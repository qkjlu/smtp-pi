import React from "react";
import { Marker } from 'react-native-maps'
import {Text, View, StyleSheet,AsyncStorage} from "react-native";
import axios from 'axios';

export default class TruckMarker extends React.Component {
  constructor(props) {
      super(props);
      this.handleCoordinates = this.handleCoordinates.bind(this);
      this.getCamionneurInfo = this.getCamionneurInfo.bind(this);
      this.state = {
        latitude : this.props.user.coordinates.latitude,
        longitude : this.props.user.coordinates.longitude,
        nom: "",
        prenom : "",
        etat : null,
        previousEtat : null
      }
  }

  async componentDidMount(){
    const socket = this.props.socket;
    this.getCamionneurInfo();
    await socket.on("chantier/user/sentCoordinates", this.handleCoordinates);
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
    console.log("Marker: coordinates receve: " + JSON.stringify(data));
    if(data.userId == this.props.user.userId){
      this.setState({
        latitude : data.coordinates.latitude,
        longitude : data.coordinates.longitude,
      })
    }
  }

  render() {
    return(
      <Marker
        coordinate={{
          latitude: this.state.latitude,
          longitude: this.state.longitude,
        }}
        title={this.state.prenom + " " + this.state.nom}
      />
    );
  }

}
