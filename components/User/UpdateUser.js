import React, { useState } from "react"
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import InputText from '../InputText';
import ValidateButton from '../ValidateButton';
import AddCompany from '../Company/AddCompany';
import CustomPicker from '../CustomPicker';
import axios from 'axios';
import { Icon, Button } from 'react-native-elements'
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import style from '../../Style'
import Config from "react-native-config"; 

export default class UpdateUser extends React.Component {
  constructor(props) {
    super(props);
    this.handlePickerChange = this.handlePickerChange.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangeSurname = this.handleChangeSurname.bind(this);
    this.handleChangeCompany = this.handleChangeCompany.bind(this);
    this.handleValidate = this.handleValidate.bind(this);
    this.getCompany = this.getCompany.bind(this);
    this.createCompany = this.createCompany.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.arrayDifference = this.arrayDifference.bind(this);
    this.onPressPicker = this.onPressPicker.bind(this);
    this.onPressAddCompany = this.onPressAddCompany.bind(this);
    this.onPressDelete = this.onPressDelete.bind(this);
    this.refreshFunction = this.props.route.params.refreshFunction;

    this.state = {
      id : null,
      pickerSelected: null,
      companies : null,
      name: null,
      surname : null,
      type: null, // true : camionneur, false : grutier
      printCompany : false,
      company : "",
      myCompanies: null
    };
  }

  async componentDidMount(){
    this.getCompany();
    //this.getUserById();
    this.setState({
      id : this.props.route.params.user.id,
      name : this.props.route.params.user.nom,
      surname : this.props.route.params.user.prenom,
      myCompanies : this.props.route.params.user.Entreprises,
      type : this.props.route.params.type
    })
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

  arrayDifference(a,b){
    var res = a;
    for(let i =0; i< a.length; i++){
      for(let j =0; j< b.length; j++){
        if(a[i].nom == b[j].nom){
          res.slice(i,1)
        }
      }
    }
    console.log("entreprise:" + res);
    this.setState({companies : res});
  }

  // API call for get and initialise list of company
  async getCompany(){
    axios.get('entreprises')
      .then( response => {
        if(response.status != 200){
          console.log(response.status);
          alert(response.status);
          return response.status;
        }
        this.setState({companies : response.data})
        this.setState({pickerSelected : response.data[0].id});
        console.log(response.status);
        return response.data;
      })
      .catch(function (error) {
        alert(error)
        console.log(error);
      })
  }

  // create company request and return id of company created
  async createCompany(){

    const token  = await AsyncStorage.getItem('token');
    await axios({
      method: 'post',
      url: Config.API_URL + 'entreprises',
      headers: {'Authorization': 'Bearer ' + token},
      data : { "nom" : this.state.company}
    }).then((response) => {
      if(response.status != 201){
        console.log(response.status);
        alert(response.status);
        return response.status;
      }

        // update PickerData
        var copy = this.state.companies.slice();
        copy.push(response.data);
        this.setState({
          pickerSelected : response.data.id,
          companies : copy
        });

        console.log(response.status);
        alert("Entreprise crée");
        return response.data.id;
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  async formSubmit(){
    if (this.state.name == "" || this.state.surname == "" ) {
      alert('Entrez un nom ou un prenom');
    }else{

      const token  = await AsyncStorage.getItem('token');
      const data = {
        "nom": this.state.name,
        "prenom": this.state.surname,
      };

      var typeUser = this.state.type ? "camionneurs" : "grutiers";
      console.log(this.state.type)

      await axios({
        method: 'patch',
        url: Config.API_URL + typeUser + "/" + this.state.id,
        headers: {'Authorization': 'Bearer ' + token},
        data : data
      })
        .then((response) => {
          alert(typeUser +  'modifié');
          console.log(response.status);
          this.refreshFunction();
          this.props.navigation.goBack();
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  //add an company to the user
  async onPressPicker(){

    const token  = await AsyncStorage.getItem('token');

    console.log("selected:" +this.state.pickerSelected)

    //data to post
    var data = {
      "entreprise" : this.state.pickerSelected
    }

    var typeUser = this.state.type ? "camionneurs" : "grutiers";

    axios({
      method: 'post',
      url: Config.API_URL + typeUser +"/" + this.state.id + "/entreprise",
      headers: {'Authorization': 'Bearer ' + token},
      data: data
    })
    .then( response => {
      if(response.status != 201){
        console.log(response.status);
        return response.status;
      }

      // update List of companies of the user
      var element = this.state.companies.find(e => e.id == this.state.pickerSelected);
      var copy = this.state.myCompanies.slice();
      copy.push(element);
      this.setState({
        myCompanies : copy
      });

      console.log(response.status)
      alert("Entreprise ajouté à la liste !")
      return response.status;
    })
    .catch(function (error) {
      alert(error)
      console.log(error);
    })
  }

  onPressAddCompany(){
    this.createCompany()
  }

  // remove user from a company
  // id : id of the company
  async onPressDelete(idCompany){

    const token  = await AsyncStorage.getItem('token');

    var idUser = this.state.id
    var data = { "camionneur" : idUser}
    var url = Config.API_URL + 'entreprises/' + idCompany + '/camionneur'

    // case gruiter
    if(!this.state.type){
      url = Config.API_URL + 'entreprises/' + idCompany + '/grutier'
      data = { "grutier" : idUser}
    }

    axios({
      method: 'delete',
      url: url,
      headers: {'Authorization': 'Bearer ' + token},
      data : data
    })
    .then( response => {

      //update data
      var copy = this.state.myCompanies.slice();
      var index = copy.findIndex(u => u.id == idCompany);
      if (index > -1) {
        copy.splice(index, 1);
        this.setState({
          myCompanies : copy
        })
      }

      alert("Entreprise retiré");
      console.log(response.status)
      return response.status;
    })
    .catch(function (error) {
      console.log(error);
      console.log(error.response)
    })

  }

  render() {

    if (this.state.name === null || this.state.type === null || this.state.surname === null || this.state.companies == null || this.state.myCompanies == null){
      return (<ActivityIndicator color="red" size="large"/>);
    }else{

      // set Data for picker
      var pickerData = this.state.companies.map(item => item.nom);
      // set selectedValue for picker
      var resIndex = this.state.companies.findIndex(s => s.id == this.state.pickerSelected);
      var selectedIndex = resIndex == -1 ? 0 : resIndex
      var selected = this.state.companies[selectedIndex].nom;

      return (
        <View style={styles.container}>
          <Text style={styles.titleText} >Modifier un utilisateur</Text>
          <InputText placeholder={this.state.name} value={this.state.name} onChangeText={this.handleChangeName}/>
          <InputText placeholder={this.state.surname} value={this.state.surname} onChangeText={this.handleChangeSurname}/>

          <View style={styles.adder}>
            <CustomPicker data={pickerData} titleContent="Ajouter une entreprise:" selectedValue= {selected} onValueChange= {this.handlePickerChange}/>
            <TouchableOpacity style={styles.bouton} onPress={this.onPressPicker}>
              <Text style={{color: "white"}}>Ajouter</Text>
            </TouchableOpacity>
          </View>


          <AddCompanyInput isVisible={!this.state.printCompany} value={this.state.company} onChangeText={this.handleChangeCompany} onPress ={this.onPressAddCompany}/>

          <View style={styles.addFirm}>
            <Text>Entreprise non présente dans la liste ? Creer une entreprise:</Text>
            <TouchableOpacity style={styles.bouton} onPress={() => this.setState({printCompany : true})}>
              <Text style={{color: "white"}}>Créer</Text>
            </TouchableOpacity>
          </View>

          <Text>Les entreprises auxquelles j'appartiens:</Text>
          <FlatList
            data={this.state.myCompanies}
            renderItem={({item}) => <ItemList entreprise={item} onPress={this.onPressDelete}/>}
          />

          <ValidateButton text={"Modifier"} onPress={this.handleValidate}/>
        </View>
      );
    }
  }
}


function AddCompanyInput(props){
  if(props.isVisible){
    return null;
  }

  return(
    <View style={{width: "80%",flexDirection: 'row'}} >
      <InputText placeholder="Nom de l'entreprise" value={props.firm} onChangeText={props.onChangeText}/>
      <TouchableOpacity style={styles.bouton} onPress={props.onPress}>
        <Text style={{color: "white"}}>Ajouter</Text>
      </TouchableOpacity>
    </View>
  )

}

function ItemList(props) {
  return(
    <View style={style.worksite}>
      <Text style = { style.title}> {props.entreprise.nom} </Text>
      <View style={styles.adder} >
        <Button
          icon={
            <Icon
              name='trash'
              type='font-awesome'
            />
          }
          title=""
          type="clear"
          onPress={button => props.onPress(props.entreprise.id)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  },
  bouton:{
    backgroundColor:"#228B22",
    alignSelf : "flex-end",
    borderRadius:25,
    margin:10,
    padding:10
  },
  addFirm:{
    flexDirection: 'row',
    alignItems:"center",
    justifyContent:"center",
    margin:10
  },
  adder:{
    flexDirection: 'row',
  }
});
