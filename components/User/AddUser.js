import React, { useState } from "react"
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import InputText from '../InputText';
import ValidateButton from '../ValidateButton';
import AddCompany from '../Company/AddCompany';
import CustomPicker from '../CustomPicker';
import axios from 'axios';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

export default class AddUser extends React.Component {
  constructor() {
    super();
    this.handlePickerChange = this.handlePickerChange.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangeSurname = this.handleChangeSurname.bind(this);
    this.handleChangeCompany = this.handleChangeCompany.bind(this);
    this.handleValidate = this.handleValidate.bind(this);
    this.getCompany = this.getCompany.bind(this);
    this.createCompany = this.createCompany.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.state = {
      pickerSelected: "",
      companies : [],
      name: "",
      surname : "",
      type: 0,
      printCompany : false,
      company: ""
    };
  }

  componentDidMount(){
    this.getCompany();
  }

  handlePickerChange(value){
    this.setState({pickerSelected : this.state.companies[value].id})
  }

  handleChangeName(text){
    this.setState({name : text})
  }

  handleChangeSurname(text){
    this.setState({surname : text})
  }

  handleChangeCompany(text){
    this.setState({company : text})
  }

  handleValidate(){
    this.formSubmit();
  }

  // API call for get and initialise list of company
  getCompany(){
    axios.get('https://smtp-pi.herokuapp.com/entreprises')
      .then( response => {
        if(response.status != 200){
          console.log(response.status);
          alert(response.status);
          return response.status;
        }
        this.setState({companies: response.data});
        return response.status;
      })
      .catch(function (error) {
        alert(error)
        console.log(error);
      })
  }

  // create company request and return id of company created
  async createCompany(){
    await axios({
      method: 'post',
      url: 'https://smtp-pi.herokuapp.com/entreprises',
      data : { "nom" : this.state.company}
    }).then((response) => {
      if(response.status != 201){
        console.log(response.status);
        alert(response.status);
        return response.status;
      }
        console.log(response.status);
        this.setState({pickerSelected : response.data.id});
        return response.data.id;
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  async formSubmit(){
    if (this.state.name == "" || this.state.surname == "") {
      alert('Entrez un nom ou un prenom');
    }else{
      var url = this.state.type == 0 ? "camionneurs" : "grutiers";

      if(this.state.printCompany){
          await this.createCompany();
      }

      const data = {
        "nom": this.state.name,
        "prenom": this.state.surname,
        "entreprise" : this.state.pickerSelected
      };

      await axios({
        method: 'post',
        url: 'https://smtp-pi.herokuapp.com/' + url,
        data : data
      })
        .then((response) => {
          alert(url +  ' crée');
          console.log(response.status);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  render() {

    var radio_props = [
                        {label: 'Camionneur', value: 0 },
                        {label: 'Grutier', value: 1 }
                      ];

    var pickerData = this.state.companies.map(item => item.nom);
    return (
      <View style={styles.container}>
        <Text style={styles.titleText} >Créer un utilisateur </Text>
        <InputText placeholder="Nom" value={this.state.name} onChangeText={this.handleChangeName}/>
        <InputText placeholder="Prenom" value={this.state.surname} onChangeText={this.handleChangeSurname}/>
        <CustomPicker isVisible={this.state.printCompany} data={pickerData} titleContent="Entreprise:" selectedValue= {this.state.pickerSelected} onValueChange= {this.handlePickerChange}/>
        <View style={styles.addFirm}>
          <Text>Entreprise non présente dans la liste ? Creer une entreprise:</Text>
          <TouchableOpacity style={styles.bouton} onPress={() => this.setState({printCompany : true})}>
            <Text style={{color: "white"}}>ajouter</Text>
          </TouchableOpacity>
        </View>
        <AddCompany isVisible={!this.state.printCompany} value={this.state.company} onChangeText={this.handleChangeCompany}/>
        <Text>Type:</Text>
        <RadioForm
          radio_props={radio_props}
          initial={this.state.type}
          onPress={(value) => {this.setState({type:value})}}
        />
        <ValidateButton onPress={this.handleValidate}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  },
  bouton:{
    backgroundColor:"#228B22",
    borderRadius:25,
    margin:10,
    padding:10
  },
  addFirm:{
    flexDirection: 'row',
    alignItems:"center",
    justifyContent:"center",
    margin:10
  }
});
