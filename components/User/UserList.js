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
    this.onPressAdd = this.onPressAdd.bind(this);
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
        <View>

          <Button title="Ajouter un utilisateur" buttonStyle={{width:"80%",alignItems: 'center'}} onPress={this.onPressAdd}/>

          <Text>Liste des camionneurs:</Text>
          <FlatList
            data={this.state.camionneurs}
            renderItem={({item}) => <ItemList user={item} onPressEdit={this.onPressEditCamionneur}/>}
          />

          <Text>Liste des grutiers:</Text>
          <FlatList
            data={this.state.grutiers}
            renderItem={({item}) => <ItemList user={item} onPressEdit={this.onPressEditGrutier}/>}
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  item:{
    flexDirection: 'row',
    margin:10,
    padding:10
  },
});
