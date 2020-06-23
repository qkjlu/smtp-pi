import {AsyncStorage, View, Text,ActivityIndicator} from "react-native";
import style from "../../Style";
import React from "react";
import * as RootNavigation from '../../navigation/RootNavigation.js';
import { Icon, Button } from 'react-native-elements'
import InputText from '../InputText';
import ValidateButton from '../ValidateButton';
import axios from 'axios';
import Config from "react-native-config";


export default class WorkSiteSettings extends React.Component {
  constructor(props) {
    super(props);
    this.adresseChargement = null;
    this.adresseDechargement = null;
    this.requestLieu = this.requestLieu.bind(this);
    this.handleChargementText = this.handleChargementText.bind(this);
    this.handleDechargementText = this.handleDechargementText.bind(this);
    this.state = {
        chargementRayon : null,
        dechargementRayon: null,
        loading : true
    }
  }


  // get adress of lieuChargement and lieuDéchargement
  async componentDidMount(){
    let worksite = this.props.route.params.worksite;
    let chargement = await this.requestLieu(worksite.lieuChargementId);
    let dechargement = await this.requestLieu(worksite.lieuDéchargementId);
    this.adresseChargement = chargement.adresse;
    this.adresseDechargement = dechargement.adresse;
    this.setState({chargementRayon : chargement.adresse})
    this.setState({dechargementRayon : dechargement.adresse})
    this.setState({loading : false});

    //let dechargement = requestLieu(worksite.lieuDéchargementId,"dechargement");

    // let dechargement = requestLieu(this.props.worksite.lieuChargementId);
    // this.adresseChargement = chargement.adresse;
    // this.dechargement = dechargement.adresse;
    // this.setState({chargementRayon : this.props.worksite.});
    // this.setState({dechargementRayon : this.props.worksite.})


  }

  async requestLieu(lieuID){
    const token = await AsyncStorage.getItem('token');
    //let url = Config.API_URL + 'chantiers/' + adresseID + '/lieu/' + type
    let url = 'http://192.168.56.1:3000/lieux/' + lieuID;
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
        console.log(response.data)
        return response.data;

      })
      .catch(function (error) {
        alert(error)
        console.log(error);
      });
  }

  handleChargementText(text){
    this.setState({chargementRayon : text});
  }

  handleDechargementText(text){
    this.setState({dechargementRayon : text});
  }

  handleModifyChargement(){

  }

  handleModifyDechargement(){

  }

  render(){
   if(this.state.loading){
      return(
        <View style={{paddingTop: 30}}>
            <ActivityIndicator color="green" size="large"/>
        </View>
      )
    }else{
      return(
        <View>
          <Text>Rayon de chargement:</Text>
          <Text>Adresse: {this.adresseChargement}</Text>
          <InputText placeholder="Rayon en m" onChangeText={this.handleChargementText}/>
          <ValidateButton text={"Modifier"} onPress={this.handleModifyChargement}/>
          <Text>Rayon de déchargement:</Text>
          <Text>Adresse: {this.adresseDechargement}</Text>
          <InputText placeholder="Rayon m" onChangeText={this.handleDechargementText}/>
          <ValidateButton text={"Modifier"} onPress={this.handleModifyDechargement}/>
        </View>
      )
    }
  }

}
