import {AsyncStorage, View, Text, ActivityIndicator, TextInput} from "react-native";
import style from "../../Style";
import React from "react";
import ValidateButton from '../ValidateButton';
import axios from 'axios';
import Config from "react-native-config";


export default class WorkSiteSettings extends React.Component {
  constructor(props) {
    super(props);
    this.requestLieu = this.requestLieu.bind(this);
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

  async updateLieu(lieu){
      let token  = await AsyncStorage.getItem('token');
      let data = {
          "adresse": lieu.adresse,
          "longitude": parseFloat(lieu.longitude),
          "latitude": parseFloat(lieu.latitude),
          "rayon" : parseInt(lieu.rayon),
      };
      axios({
          method: 'patch',
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
              return response.status;
          })
          .catch((error) => {
              console.log(error);
          })
  }

  render(){
   if(this.state.chargement === null || this.state.dechargement === null ){
      return(
        <View style={{paddingTop: 30}}>
            <ActivityIndicator color="green" size="large"/>
        </View>
      )
    }else{
       console.log("lieu "+ this.state.chargement.longitude);
      return(
        <View>
            <Text> Modification Chargement :  </Text>
            <Text> Nom du lieu  : {this.state.chargement.longitude}  </Text>
            <TextInput style={style.textinput} onChangeText={ (adresse) => this.setState({ chargement:{
                ...this.state.chargement,
                    adresse: adresse,
                }})} value={this.state.chargement.adresse} placeholder={" adresse "}/>
            <Text> Latitude  :  </Text>
            <TextInput style={style.textinput} onChangeText={ (latitude) => this.setState({ chargement:{
                    ...this.state.chargement,
                    latitude: latitude,
                }})} value={this.state.chargement.latitude} placeholder={" latitude "}/>
            <Text> Longitude  :  </Text>
            <TextInput style={style.textinput} onChangeText={ (longitude) => this.setState({ chargement:{
                    ...this.state.chargement,
                    longitude: longitude,
                }})} value={this.state.chargement.longitude} placeholder={" longitude "}/>
            <Text> Rayon : </Text>
            <TextInput style={style.textinput} onChangeText={ (rayon) => this.setState({ chargement:{
                ...this.state.chargement,
                rayon: rayon,
            }})} value={this.state.chargement.rayon} placeholder={" rayon de chargement"}/>

            <ValidateButton text={"Modifier"} onPress={ () => this.updateLieu(this.state.chargement) }/>


            <Text> Modification Déchargement :  </Text>
            <Text> Nom du lieu  :  </Text>
            <TextInput style={style.textinput} onChangeText={ (adresse) => this.setState({ dechargement:{
                    ...this.state.dechargement,
                    adresse: adresse,
                }})} value={this.state.dechargement.adresse} placeholder={" adresse "}/>
            <Text> Latitude  :  </Text>
            <TextInput style={style.textinput} onChangeText={ (latitude) => this.setState({ dechargement:{
                    ...this.state.dechargement,
                    latitude: latitude,
                }})} value={this.state.dechargement.latitude} placeholder={" latitude "}/>
            <Text> Longitude  :  </Text>
            <TextInput style={style.textinput} onChangeText={ (longitude) => this.setState({ dechargement:{
                    ...this.state.dechargement,
                    longitude: longitude,
                }})} value={this.state.dechargement.longitude} placeholder={" longitude "}/>
            <Text> Rayon : </Text>
            <TextInput style={style.textinput} onChangeText={ (rayon) => this.setState({ dechargement:{
                    ...this.state.dechargement,
                    rayon: rayon,
                }})} value={this.state.dechargement.rayon} placeholder={" rayon de déchargement"}/>
            <ValidateButton text={"Modifier"} onPress={() => this.updateLieu(this.state.dechargement) }/>
        </View>
      )
    }
  }

}
