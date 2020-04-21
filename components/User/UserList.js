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
  ActivityIndicator
} from 'react-native';

export default class UserList extends React.Component{

  constructor (props) {
    super(props);
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

  onPressEdit(){

  }

  getCamionneurs(){
    axios({
      method: 'get',
      url: 'https://smtp-pi.herokuapp.com/camionneurs',
      headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI'}
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

  getGrutiers(){
    axios({
      method: 'get',
      url: 'https://smtp-pi.herokuapp.com/grutiers',
      headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI'}
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
          <Button title="Ajouter un utilisateur" buttonStyle={{width:"80%",alignItems: 'center'}}/>
          <FlatList
            data={this.state.camionneurs}
            renderItem={({item}) => <ItemList nom={item.nom} prenom={item.prenom} id={item.id} onPress={this.onPressEdit}/>}
          />

          <FlatList
            data={this.state.grutiers}
            renderItem={({item}) => <ItemList nom={item.nom} prenom={item.prenom} id={item.id}  onPress={this.onPressEdit}/>}
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
