import {AsyncStorage, View, Text, ActivityIndicator, TextInput, ScrollView} from "react-native";
import style from "../../Style";
import React from "react";
import ValidateButton from '../ValidateButton';
import axios from 'axios';
import Config from "react-native-config";
import {Button} from 'react-native-elements'
import * as RootNavigation from '../../navigation/RootNavigation.js';

export default class WorkSiteSettings extends React.Component {
  constructor(props) {
    super(props);
    this.requestLieu = this.requestLieu.bind(this);
    this.setGPSLocationPage = this.setGPSLocationPage.bind(this);
    this.state = {
        chargement : null,
        dechargement : null,
        chargementRayon : null,
        dechargementRayon: null,
        loading : true
    }
  }

  // get adress of lieuChargement and lieuDéchargement
  async componentDidMount(){
    let worksite = this.props.route.params.worksite;
    let chargement = await this.requestLieu(worksite.lieuChargementId)
    let dechargement = await this.requestLieu(worksite.lieuDéchargementId)
    this.setState({ chargement: chargement })
    this.setState({ dechargement: dechargement })
  }

  async requestLieu(lieuID){
    const token = await AsyncStorage.getItem('token');
    let url = Config.API_URL+ "lieux/" + lieuID;
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

  // update state after update GPS location of a place
  componentDidUpdate(prevProps){
    console.log(prevProps.route.params);
    if(this.props.route.params.marker !== undefined){
      if(this.props.route.params.type === "chargement"){
        if(this.state.chargement.latitude !== this.props.route.params?.marker.coordinate.latitude){
          // copy object to avoid immutability
          let copy = Object.assign({}, this.state.chargement);
          copy.latitude = this.props.route.params?.marker.coordinate.latitude;
          copy.longitude = this.props.route.params?.marker.coordinate.longitude;
          this.setState({
            chargement :copy
          })
        }
      }else{
        let copy = Object.assign({}, this.state.dechargement);
        copy.latitude = this.props.route.params?.marker.coordinate.latitude;
        copy.longitude = this.props.route.params?.marker.coordinate.longitude;
        this.setState({
          dechargement :copy
        })
      }
    }
  }

  async updateLieu(lieu){
      let token  = await AsyncStorage.getItem('token');
      let data = {
          "adresse": lieu.adresse,
          "longitude": parseFloat(lieu.longitude),
          "latitude": parseFloat(lieu.latitude),
          "rayon" : parseInt(lieu.rayon),
      };
      axios({
          method: 'put',
          url: Config.API_URL + 'lieux/'+ lieu.id,
          data : data,
          headers: {'Authorization': 'Bearer ' + token},
      })
          .then( response => {
              if(response.status != 204){
                  console.log(response.status);
                  alert(response.status);
                  return response.status;
              }
              console.log(response.status);
              alert("Le lieu a bien été modifié");
              return response.status;
          })
          .catch((error) => {
              console.log(error.toString());
          })
  }

  setGPSLocationPage(type){
    let lat = type === "chargement" ? this.state.chargement.latitude : this.state.dechargement.latitude;
    let lon = type === "chargement" ? this.state.chargement.longitude : this.state.dechargement.longitude;
    RootNavigation.navigate("setGPSLocation", {longitude:lon, latitude: lat, origin : "Settings", type: type });
  }

  render(){
   if(this.state.chargement === null || this.state.dechargement === null ){
      return(
        <View style={{paddingTop: 30}}>
            <ActivityIndicator color="green" size="large"/>
        </View>
      )
    }else{
      return(
        <View>
            <ScrollView>
                <Text> Modification Chargement :  </Text>
                <Text> Nom du lieu  :   </Text>
                <TextInput style={style.textinput} onChangeText={ (adresse) => this.setState({ chargement:{
                    ...this.state.chargement,
                        adresse: adresse,
                    }})} value={this.state.chargement.adresse.toString()} placeholder={" adresse "}/>
                <Text> Rayon : </Text>
                <TextInput style={style.textinput} onChangeText={ (rayon) => this.setState({ chargement:{
                    ...this.state.chargement,
                    rayon: rayon,
                }})} value={this.state.chargement.rayon.toString()} placeholder={" rayon de chargement"}/>

                <Button
                  onPress={() => this.setGPSLocationPage("chargement")}
                  title={"Modifier les coordonnées"}
                />

                <ValidateButton text={"Modifier"} onPress={ () => this.updateLieu(this.state.chargement) }/>

                <Text> Modification Déchargement :  </Text>
                <Text> Nom du lieu  :  </Text>
                <TextInput style={style.textinput} onChangeText={ (adresse) => this.setState({ dechargement:{
                        ...this.state.dechargement,
                        adresse: adresse,
                    }})} value={this.state.dechargement.adresse.toString()} placeholder={" adresse "}/>

                <Text> Rayon : </Text>
                <TextInput style={style.textinput} onChangeText={ (rayon) => this.setState({ dechargement:{
                        ...this.state.dechargement,
                        rayon: rayon,
                    }})} value={this.state.dechargement.rayon.toString()} placeholder={" rayon de déchargement"}/>
                <Button
                  onPress={() => this.setGPSLocationPage("dechargement")}
                  title={"Modifier les coordonnées"}
                />
                <ValidateButton text={"Modifier"} onPress={() => this.updateLieu(this.state.dechargement) }/>
            </ScrollView>
        </View>
      )
    }
  }

}
