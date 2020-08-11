import React from 'react';
import InputText from './InputText';
import ValidateButton from './ValidateButton';
import CustomPicker from './CustomPicker';
import { ButtonGroup } from 'react-native-elements';
import axios from 'axios';
import style from "../Style";
import  {View, ActivityIndicator, AsyncStorage, ScrollView, Text} from 'react-native';
import AutoCompletePlaces from "./Place/AutoCompletePlaces";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import AutoCompleteUsers from "./AutoCompleteUsers";
import Style from "../Style";
var jwtDecode = require('jwt-decode');
import Config from "react-native-config";
import Setup from './Services/setup'
import { Image } from 'react-native-elements';


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
    this.setup = new Setup();
    this.state = {
      pickerSelected: null,
      companies : null,
      firstField: "",
      secondField : "",
      selectedIndex: 0,
      user : null,
      fill :100
    };
  }

  async componentDidMount(){
    await this.setup.initSetup();
    await axios.get(Config.API_URL + 'entreprises')
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

      var url = Config.API_URL;
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
          const payload = jwtDecode(response.data.token);
          this.storeDataSession("token",response.data.token);
          this.storeDataSession("typeUser",typeUser);
          this.storeDataSession("userId",payload.id);
          this.redirect();
        }
      })
        .catch(function (error) {
        console.log(error.toString());
        alert("Champ incorrect !");
      });
    }
  }

  updateIndex (selectedIndex) {
    this.setState({selectedIndex})
    this.setState({firstField : "", secondField : ""})
  }

  handleSwitchChange(){
    this.setState({isAdmin : !this.state.isAdmin})
  }

  handlePickerChange(value){
    this.setState({pickerSelected : this.state.companies[value].id})
  }

  handleChangeFirstField(text){
    this.setState({firstField : text.trim()})
  }

  handleChangeSecondField(text){
    this.setState({secondField : text.trim()})
  }

  handleValidate(){
    this.formSubmit();
  }

  render(){
    if (this.state.companies == null){
      return (
        <View style={style.container}>
          <AnimatedCircularProgress
            size={150}
            width={25}
            fill={100}
            tintColor="#f69552"
            duration={120000}
            backgroundColor="#3d5875">
            {
              (fill) => (
                <Text>
                  {Math.trunc(fill)} %
                </Text>
              )
            }
          </AnimatedCircularProgress>
        </View>
      );
    }else{
      let firstPC = this.state.selectedIndex == 2 ?  "Mail" : "Nom";
      let secondPC = this.state.selectedIndex == 2 ? "Mot de passe" : "Prenom";

      const component1 = () => <Image source={require('./../assets/images/truck.png') }
                                      style={{ width: 68, height: 68 }}
                                />
      const component2 = () => <Image source={require('./../assets/images/crane.png')}
                                      style={{ width: 50, height: 50 }}
                               />
      const component3 = () => <Image source={require('./../assets/images/admin.png')}
                                      style={{ width: 50, height: 44 }}
                               />

      const buttons = [{ element: component1 }, { element: component2 }, { element: component3 }];

      // set Data for picker
      let pickerData = this.state.companies.map(item => item.nom);
      // set selectedValue for picker
      let resIndex = this.state.companies.findIndex(s => s.id == this.state.pickerSelected);
      let selectedIndex = resIndex == -1 ? 0 : resIndex
      let selected = this.state.companies[selectedIndex].nom;

      return (
          <ScrollView>
            <View style={style.container}>
              <Image source={require('./../assets/images/logoSMTP.png')}
                     style={{ width: 209, height: 209 }}
              />
              <ButtonGroup
                  onPress={this.updateIndex}
                  selectedIndex={this.state.selectedIndex}
                  buttons={buttons}
                  containerStyle={{height: 50}}
              />
              {this.state.selectedIndex != 2 &&
              <AutoCompleteUsers style={Style.input} changePlace={(user) => this.setState({user})}
                                 currentIndex={this.state.selectedIndex} user={this.state.user}
                                 changeFirstField={txt => this.handleChangeFirstField(txt)}
                                 changeSecondField={txt => this.handleChangeSecondField(txt)}/>
              }
              {this.state.selectedIndex == 2 &&
                <InputText style={style.input} placeholder={firstPC} value={this.state.firstField} onChangeText={this.handleChangeFirstField} />
              }
              {this.state.selectedIndex == 2 &&
              <InputText style = {style.input} placeholder={secondPC} secureTextEntry={this.state.selectedIndex == 2} value={this.state.secondField} onChangeText={this.handleChangeSecondField}/>
              }

              <CustomPicker isVisible={this.state.selectedIndex == 2} titleContent="Entreprise:" data={pickerData} selectedValue= {selected} onValueChange= {this.handlePickerChange}/>
              <ValidateButton text={"valider"} onPress={this.handleValidate}/>
              <Text>{Config.VERSION} version</Text>
            </View>
          </ScrollView>
      );
    }
  }
}
/*
<InputText style = { style.input } placeholder={firstPC} value={this.state.firstField} onChangeText={this.handleChangeFirstField}/>
          <InputText style = {style.input} placeholder={secondPC} secureTextEntry={this.state.selectedIndex == 2} value={this.state.secondField} onChangeText={this.handleChangeSecondField}/>

 */
