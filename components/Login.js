import React from 'react';
import InputText from './InputText';
import ValidateButton from './ValidateButton';
import CustomPicker from './CustomPicker';
import { ButtonGroup } from 'react-native-elements'
import axios from 'axios';
import Style from "../Style";
import  {View, ActivityIndicator, AsyncStorage} from 'react-native';

export default class Login extends React.Component{

  constructor (props) {
    super(props);
    this.handleSwitchChange = this.handleSwitchChange.bind(this);
    this.handlePickerChange = this.handlePickerChange.bind(this);
    this.handleChangeFirstField = this.handleChangeFirstField.bind(this);
    this.handleChangeSecondField = this.handleChangeSecondField.bind(this);
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

  componentDidMount(){
    axios.get('https://smtp-pi.herokuapp.com/entreprises')
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
      return this.props.navigation.navigate("Admin");
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
      var type;

      switch (this.state.selectedIndex) {
        case 0:
          url += "camionneurs";
          type = "truck";
          break;
        case 1:
          url += "grutiers";
          type = "crane"
          break;
        case 2:
          url += "admins";
          type = "admin";
          data = {
            "mail": this.state.firstField,
            "password": this.state.secondField
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
          // store token et type of user in Storage
          this.storeDataSession("token",response.data.token);
          this.storeDataSession("typeUser",type);

          // change view
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
        <View style={Style.container}>
          <ButtonGroup
            onPress={this.updateIndex}
            selectedIndex={this.state.selectedIndex}
            buttons={buttons}
            containerStyle={{height: 50}}
          />
          <InputText placeholder={firstPC} value={this.state.firstField} onChangeText={this.handleChangeFirstField}/>
          <InputText placeholder={secondPC} secureTextEntry={this.state.selectedIndex == 2} value={this.state.secondField} onChangeText={this.handleChangeSecondField}/>
          <CustomPicker isVisible={this.state.selectedIndex == 2} titleContent="Entreprise:" data={pickerData} selectedValue= {selected} onValueChange= {this.handlePickerChange}/>
          <ValidateButton text={"valider"} onPress={this.handleValidate}/>
        </View>
      );
    }
  }
}
