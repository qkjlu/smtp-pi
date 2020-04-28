import React from 'react';
import InputText from '../InputText';
import CustomPicker from '../CustomPicker';
import CustomSwitch from '../CustomSwitch';
import ItemList from './ItemList.js';
import axios from 'axios';
import { Icon, Button } from 'react-native-elements'
import style from '../../Style'


import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';

export default class UserList extends React.Component{

  constructor (props) {
    super(props);
    this.onPressEditCamionneur = this.onPressEditCamionneur.bind(this);
    this.onPressEditGrutier = this.onPressEditGrutier.bind(this);
    this.onPressDeleteCamionneur = this.onPressDeleteCamionneur.bind(this);
    this.onPressDeleteGrutier = this.onPressDeleteGrutier.bind(this);
    this.onPressAdd = this.onPressAdd.bind(this);
    this.onPressDelete = this.onPressDelete.bind(this);
    this.state = {
      camionneurs : null,
      grutiers : null
    };
  }

  componentDidMount(){
    this.getCamionneurs();
    this.getGrutiers();
  }

  handleSwitchChange(){
    this.setState({isAdmin : !this.state.isAdmin})
  }

  onPressEditCamionneur(user){
    this.props.navigation.navigate("UpdateUser",{ user : user, type : true});
  }

  onPressEditGrutier(user){
    this.props.navigation.navigate("UpdateUser",{ user : user, type : false});
  }

  onPressDeleteCamionneur(user){
    this.onPressDelete(user,"camionneurs")
  }

  onPressDeleteGrutier(user){
    this.onPressDelete(user,"grutiers")
  }

  async onPressDelete(user,type){
    const token  = await AsyncStorage.getItem('token');
    var data = { "id" : user.id}
    axios({
      method: 'delete',
      url: 'https://smtp-pi.herokuapp.com/' + type,
      headers: {'Authorization': 'Bearer ' + token},
      data : data
    })
      .then( response => {
        if(response.status != 204){
          console.log(response.status);
          alert(response.status);
          return response.status;
        }

        // update list
        if(type == "camionneurs"){
          var copy = this.state.camionneurs.slice();
          var index = copy.findIndex(u => u.id == user.id);
          if (index > -1) {
            copy.splice(index, 1);
            this.setState({
              camionneurs : copy
            })
          }
        }else{
          var copy = this.state.grutiers.slice();
          var index = copy.findIndex(u => u.id == user.id);
          if (index > -1) {
            copy.splice(index, 1);
            this.setState({
              grutiers : copy
            })
          }
        }

        alert(user.nom + " " + user.prenom + " supprimé");
        console.log(response.status)
        return response.status;
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  onPressAdd(){
    this.props.navigation.navigate("AddUser");
  }

  async getCamionneurs(){

    const token  = await AsyncStorage.getItem('token');
    axios({
      method: 'get',
      url: 'https://smtp-pi.herokuapp.com/camionneurs',
      headers: {'Authorization': 'Bearer ' + token},
    })
      .then( response => {
        if(response.status != 200){
          console.log(response.status);
          alert(response.status);
          return response.status;
        }
        console.log(response.status)
        this.setState({camionneurs: response.data});
        return response.status;
      })
      .catch(function (error) {
        alert(error)
        console.log(error);
      })
  }

  async getGrutiers(){
    const token  = await AsyncStorage.getItem('token');
    axios({
      method: 'get',
      url: 'https://smtp-pi.herokuapp.com/grutiers',
      headers: {'Authorization': 'Bearer ' + token},
    })
      .then( response => {
        if(response.status != 200){
          console.log(response.status);
          alert(response.status);
          return response.status;
        }
        console.log(response.status)
        this.setState({grutiers: response.data});
        return response.status;
      })
      .catch(function (error) {
        alert(error)
        console.log(error);
      })
  }

  render(){
    if (this.state.camionneurs === null || this.state.grutier === null){
      return (<ActivityIndicator color="red" size="large"/>);
    } else {
      return(
        <View style={styles.container}>

          <Button title="Ajouter un utilisateur" buttonStyle={styles.addUser} onPress={this.onPressAdd}/>

          <View style={styles.truckList}>
            <Text>Liste des camionneurs:</Text>
            <FlatList
              data={this.state.camionneurs}
              renderItem={({item}) => <ItemList user={item} onPressEdit={this.onPressEditCamionneur} onPressDelete={this.onPressDeleteCamionneur}/>}
            />
          </View>

          <View style={styles.truckList}>
            <Text>Liste des grutiers:</Text>
            <FlatList
              data={this.state.grutiers}
              renderItem={({item}) => <ItemList user={item} onPressEdit={this.onPressEditGrutier} onPressDelete={this.onPressDeleteGrutier}/>}
            />
          </View>

        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  truckList:{
    flex: 4,
  },
  addUser:{
    flex: 2,
    width:"80%",
    borderRadius:25,
    margin:10,
    padding:10,
    alignItems:"center",
    justifyContent:"center",
  },
  item:{
    flexDirection: 'row',
    margin:10,
    padding:10
  },
});
