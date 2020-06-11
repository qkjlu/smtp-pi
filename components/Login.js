import React from 'react';
import InputText from './InputText';
import ValidateButton from './ValidateButton';
import CustomPicker from './CustomPicker';
import { ButtonGroup } from 'react-native-elements';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import NetInfo from "@react-native-community/netinfo";
import {Image} from "react-native";
import axios from 'axios';
import style from "../Style";
import  {View, ActivityIndicator, AsyncStorage} from 'react-native';
var jwtDecode = require('jwt-decode');

export default class Login extends React.Component{

  constructor (props) {
    super(props);
    this.handleSwitchChange = this.handleSwitchChange.bind(this);
    this.handlePickerChange = this.handlePickerChange.bind(this);
    this.handleChangeFirstField = this.handleChangeFirstField.bind(this);
    this.handleChangeSecondField = this.handleChangeSecondField.bind(this);
    this.requestLocationPermission = this.requestLocationPermission.bind(this);
    this.internetCheck = this.internetCheck.bind(this);
    this.accesLocation = this.accesLocation.bind(this);
    this.handleValidate = this.handleValidate.bind(this);
    this.updateIndex = this.updateIndex.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.state = {
      pickerSelected: null,
      companies : null,
      firstField: "",
      secondField : "",
      selectedIndex: 0
    };
  }

  async componentDidMount(){
    await this.requestLocationPermission();
    await this.internetCheck();
    await axios.get('https://smtp-pi.herokuapp.com/entreprises')
      .then( response => {
        if(response.status != 200){
          console.log(response.status);
          alert(response.status);
          return response.status;
        }
        this.setState({companies: response.data});
        this.setState({pickerSelected : response.data[0].id});
        return response.status;
      })
      .catch(function (error) {
        alert(error)
        console.log(error);
      });
  }

  // handle connection error
  async internetCheck(){
    NetInfo.fetch().then(state => {
      if (state.type === 'cellular' || state.type === 'wifi') {
        console.log("send request");
        axios.get('https://smtp-pi.herokuapp.com/entreprises',{timeout:5000})
          .then( response => {
            console.log(response.status);
            }
          ).catch(function (error) {
            console.log(error);
            alert("Erreur réseau ! Veuillez activez les données mobiles");
          });
      }else{
        alert("Erreur Réseau ! Veuillez activez les données mobiles");
      }
    }).catch(function (error){
      alert("error")
    });
  }

  accesLocation(){
    return RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
    .then(data => {
      console.log("data" + data)
      return true
    }).catch(err => {
      return false
    });
  }

  // ask location to GPS and get current position if granted
  async requestLocationPermission() {
    let permission = false;
    let acces = false;
    while (!permission || !acces){
      try {
          let {granted} = await Permissions.askAsync(Permissions.LOCATION);
          if (granted) {
              console.log("access to position granted");
              permission = true;
              acces = this.accesLocation();
              console.log(acces);
          } else {
              console.log("Location permission denied");
          }
      } catch (err) {
          console.log("error "+err)
      }
    }
  }



  async storeDataSession(item, selectedValue){
    try {
      await AsyncStorage.setItem(item, selectedValue);
      console.log(item + " stored")
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }

  redirect(){
    if(this.state.selectedIndex === 2){
      return this.props.navigation.navigate("Admin",{typeOfUser:"admin"});
    }else if(this.state.selectedIndex === 1){
      return this.props.navigation.navigate("Chart",{typeOfUser:"crane"});
    }else{
      return this.props.navigation.navigate("Chart",{typeOfUser:"truck"});
    }
  }

  // to do : change view in fonction of User type
  async formSubmit(){
    if(this.state.firstField == "" || this.state.secondField == ""){
      alert('Veuillez saisir tous les champs')
    }else{
      var data = {
        "nom": this.state.firstField,
        "prenom": this.state.secondField,
        "entreprise" : this.state.pickerSelected
      };

      var url = "https://smtp-pi.herokuapp.com/";
      var typeUser;

      switch (this.state.selectedIndex) {
        case 0:
          url += "camionneurs";
          typeUser = "truck";
          break;
        case 1:
          url += "grutiers";
          typeUser = "crane";
          break;
        case 2:
          url += "admins";
          typeUser = "admin";
          data = {
            "mail": this.state.firstField.trim(),
            "password": this.state.secondField.trim()
          };
          break;
      }

      await axios({
        method: 'post',
        url: url + "/authenticate",
        data : data
      })
      .then((response) => {
        if(response.status != 200){
          console.log(response);
        }else{
          console.log(response.status);
          const payload = jwtDecode(response.data.token);
          this.storeDataSession("token",response.data.token);
          this.storeDataSession("typeUser",typeUser);
          this.storeDataSession("userId",payload.id);
          this.redirect();
        }
      })
        .catch(function (error) {
        console.log(error);
        alert("Champ incorrect !");
      });
    }
  }

  updateIndex (selectedIndex) {
    this.setState({selectedIndex})
  }

  handleSwitchChange(){
    this.setState({isAdmin : !this.state.isAdmin})
  }

  handlePickerChange(value){
    this.setState({pickerSelected : this.state.companies[value].id})
  }

  handleChangeFirstField(text){
    this.setState({firstField : text})
  }

  handleChangeSecondField(text){
    this.setState({secondField : text})
  }

  handleValidate(){
    this.formSubmit();
  }

  render(){
    if (this.state.companies == null){
      return (<ActivityIndicator color="red" size="large"/>);
    }else{
      var firstPC = this.state.selectedIndex == 2 ?  "Mail" : "Nom";
      var secondPC = this.state.selectedIndex == 2 ? "Mot de passe" : "Prenom";
      const buttons = ['Camionneur', 'Grutier', 'Admin'];

      // set Data for picker
      var pickerData = this.state.companies.map(item => item.nom);
      // set selectedValue for picker
      var resIndex = this.state.companies.findIndex(s => s.id == this.state.pickerSelected);
      var selectedIndex = resIndex == -1 ? 0 : resIndex
      var selected = this.state.companies[selectedIndex].nom;

      return (
        <View style={style.container}>
          <Image  source={require('../assets/images/logoSMTP.png')}/>
          <ButtonGroup
            onPress={this.updateIndex}
            selectedIndex={this.state.selectedIndex}
            buttons={buttons}
            containerStyle={{height: 50}}
          />
          <InputText style = { style.input } placeholder={firstPC} value={this.state.firstField} onChangeText={this.handleChangeFirstField}/>
          <InputText style = {style.input} placeholder={secondPC} secureTextEntry={this.state.selectedIndex == 2} value={this.state.secondField} onChangeText={this.handleChangeSecondField}/>
          <CustomPicker isVisible={this.state.selectedIndex == 2} titleContent="Entreprise:" data={pickerData} selectedValue= {selected} onValueChange= {this.handlePickerChange}/>
          <ValidateButton text={"valider"} onPress={this.handleValidate}/>
        </View>
      );
    }
  }
}
