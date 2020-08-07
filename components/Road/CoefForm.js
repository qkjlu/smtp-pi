import React from "react";
import style from "../../Style";
import {Text, View,AsyncStorage, ActivityIndicator, TextInput, StyleSheet, TouchableOpacity} from "react-native";
import InputCoef from './InputCoef';
import axios from 'axios';
import Config from "react-native-config";

export default class CoefForm extends React.Component {
  constructor(props) {
      super(props);
      this.handleLundi = this.handleLundi.bind(this);
      this.handleMardi = this.handleMardi.bind(this);
      this.handleMercredi = this.handleMercredi.bind(this);
      this.handleJeudi = this.handleJeudi.bind(this);
      this.handleVendredi = this.handleVendredi.bind(this);
      this.save = this.save.bind(this);
      this.getCoefByType = this.getCoefByType.bind(this);
      this.view = this.view.bind(this);
      this.state = {
          lundi :null,
          mardi : null,
          mercredi : null,
          jeudi : null,
          vendredi : null,
          loading : true
      }
  }

  async componentDidMount(){
    this.getCoefByType();
  }

  async getCoefByType(){
    const token  = await AsyncStorage.getItem('token');
    const type = this.props.type;
    console.log
    let url = Config.API_URL + "chantiers/" + this.props.chantier + "/route/" + this.props.type + "/coefs";
    console.log(url)
    await axios({
      method: 'get',
      url: url,
      headers: {'Authorization': 'Bearer ' + token},
    })
      .then((response) => {
        console.log(response.status);
        // set state of all coefficient
        let tabDataSemaine = response.data[type].JourSemaines;
        let result = {}
        tabDataSemaine.map( e => {
          let semaine = e.nom;
          result[semaine] = e.Coef.value
        })
        this.setState(result);
      })
      .catch(function (error) {
        console.log(error);
      });
    //this.setState({ loading : false})
  }

  handleLundi(value){
    this.setState({lundi : value})
  }

  handleMardi(value){
    this.setState({mardi : value})
  }

  handleMercredi(value){
    this.setState({mercredi : value})
  }

  handleJeudi(value){
    this.setState({jeudi : value})
  }

  handleVendredi(value){
    this.setState({vendredi : value})
  }

  async save(day){
    if(this.state[day] == ""){
      alert('Entrez un coefficient pour ' + day);
    }else{
      const token  = await AsyncStorage.getItem('token');
      const data = {
        "day" : day,
        "value" : this.state[day]
      }

      await axios({
        method: 'patch',
        url: Config.API_URL + "chantiers/" + this.props.chantier + "/route/" + this.props.type + "/coefs" ,
        headers: {'Authorization': 'Bearer ' + token},
        data : data
      })
        .then((response) => {
          alert("le coefficient de " + day +" pour la route " + this.props.type + " a bien été modifié");
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  view(){
    console.log("state"  + JSON.stringify(this.state));
    return(
      <View style={styles.week}>
        <InputCoef placeholder="Lundi" value={this.state.lundi} onChangeText={this.handleLundi} save={() =>this.save("lundi")}/>
        <InputCoef placeholder="Mardi" value={this.state.mardi} onChangeText={this.handleMardi} save={() =>this.save("mardi")}/>
        <InputCoef placeholder="Mercredi" value={this.state.mercredi} onChangeText={this.handleMercredi} save={() =>this.save("mercredi")}/>
        <InputCoef placeholder="Jeudi" value={this.state.jeudi} onChangeText={this.handleJeudi} save={() => this.save("jeudi")}/>
        <InputCoef placeholder="Vendredi" value={this.state.vendredi} onChangeText={this.handleVendredi} save={() => this.save("vendredi")}/>
      </View>
    )
  }

  render(){
    let coefAvailable = this.state.lundi == null && this.state.mardi == null;
    return (coefAvailable ?
      <View style={styles.week}>
        <Text> Pas de coefficient encore défini pour cette route. Contacter un administrateur.</Text>
      </View>
      : this.view());
  }
}

const styles = StyleSheet.create({
  week:{
    flex : 1,
    flexDirection : 'column',
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal : 5,
  },
});
