import React from "react";
import {Callout, Marker} from 'react-native-maps'
import {Text, View, StyleSheet, AsyncStorage, Button} from "react-native";
import axios from 'axios';
import Config from "react-native-config";
import Style from "../../Style";

export default class TruckMarker extends React.Component {
  constructor(props) {
      super(props);
      this.handleCoordinates = this.handleCoordinates.bind(this);
      this.getCamionneurInfo = this.getCamionneurInfo.bind(this);
      this.colorForThisEtat = this.colorForThisEtat.bind(this);
      this.detournement = this.detournement.bind(this);
      this.state = {
        socket : this.props.socket,
        latitude : this.props.user.coordinates.latitude,
        longitude : this.props.user.coordinates.longitude,
        nom: "",
        prenom : "",
        etat : this.props.user.etat,
        chantier : "",
      }
  }

  async componentDidMount(){
    await this.getCamionneurInfo();
    this.setState({chantier : await this.getChantier(this.props.user.chantierId)})
    await this.state.socket.on("chantier/user/sentCoordinates", this.handleCoordinates);
  }

  async componentWillUnmount(){
    this.state.socket.off("chantier/user/sentCoordinates", this.handleCoordinates);
  }

  async getCamionneurInfo(){
    const token  = await AsyncStorage.getItem('token');
    await axios({
      method: 'get',
      url: Config.API_URL + "camionneurs/" +this.props.user.userId,
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

    async getChantier(chantierId){
        const token = await AsyncStorage.getItem('token');
        let url = Config.API_URL+ "chantiers/"+ chantierId;
        return await axios({
            method : 'get',
            url : url,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status != 200){
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status);
                console.log("rdata:" + JSON.stringify(response.data));
                return response.data;
            })
            .catch(function (error) {
                alert(error)
                console.log(error);
            });
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
              return "#00a6ff";
          case "chargé":
              return "#079c00";
          case "pause":
              return "#d6d100";
          case "probleme":
              return "#cf6402";
          case "urgence":
              return "#c91000";
          case "enDéchargement":
              return "#9c0279";
          case "enChargement":
              return "#9c0279";
          case null:
              return "#1f1f1f";
      }
  }

  async detournement() {
        await this.props.editUser();
        this.props.show()
  }
  render() {
      if(this.props.singleChantier){
          return(
              <Marker
                  key = {this.props.user.userId + this.state.etat}
                  coordinate={{
                      latitude: this.state.latitude,
                      longitude: this.state.longitude,
                  }}
                  pinColor={this.colorForThisEtat(this.state.etat)}
                  title={this.state.prenom + ' ' + this.state.nom }
                  description={this.state.etat}
              />
          )
      }else{
          return(
              <Marker
                  key = {this.props.user.userId + this.state.etat}
                  coordinate={{
                      latitude: this.state.latitude,
                      longitude: this.state.longitude,
                  }}
                  pinColor={this.colorForThisEtat(this.state.etat)}
                  onCalloutPress={this.detournement}
                  onPress={this.detournement}
              />
          )
      }

  }
}
