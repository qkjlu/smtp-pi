import React from 'react';
import InputText from './InputText';
import ValidateButton from './ValidateButton';
import CustomPicker from './CustomPicker';
import CustomSwitch from './CustomSwitch';
import axios from 'axios';

import {
  StyleSheet,
  View,
} from 'react-native';

export default class Login extends React.Component{

  constructor (props) {
    super(props);
    this.handleSwitchChange = this.handleSwitchChange.bind(this);
    this.handlePickerChange = this.handlePickerChange.bind(this);
    this.handleChangeFirstField = this.handleChangeFirstField.bind(this);
    this.handleChangeSecondField = this.handleChangeSecondField.bind(this);
    this.handleValidate = this.handleValidate.bind(this);
    this.state = {
      pickerSelected: "",
      companies : [],
      firstField: "",
      secondField : "",
      isAdmin : false
    };
  }

  componentDidMount(){
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
    console.log(this.state.firstField);
  }

  render(){

    var firstPC = this.state.isAdmin ?  "Mail" : "Prenom...";
    var secondPC = this.state.isAdmin ? "Mot de passe" : "Nom...";
    var pickerData = this.state.companies.map(item => item.nom);

    return (
      <View >
        <CustomSwitch isVisible ={this.state.isAdmin} handleSwitchChange={this.handleSwitchChange} />
        <InputText placeholder={firstPC} value={this.state.firstField} onChangeText={this.handleChangeFirstField}/>
        <InputText placeholder={secondPC} value={this.state.secondField} onChangeText={this.handleChangeSecondField}/>
        <CustomPicker isVisible={this.state.isAdmin} titleContent="Entreprise:" data={pickerData} selectedValue= {this.state.pickerSelected} onValueChange= {this.handlePickerChange}/>
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
  }
});
