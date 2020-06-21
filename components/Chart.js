import React, { useState, useEffect } from "react"
import ValidateButton from './ValidateButton';
import {StyleSheet, View, Text, ScrollView,AsyncStorage, CheckBox} from 'react-native';
import style from "../Style";
import axios from 'axios';
import Config from "react-native-config";

export default class Chart extends React.Component{

  constructor(props){
    super(props);
    this.typeOfUser = this.props.route.params.typeOfUser;
    this.state = {
      text : ""
    }
  }

  // get chart
  async componentDidMount(){
    const token  = await AsyncStorage.getItem('token');
    axios({
      method: 'get',
      url: Config.API_URL +'chartes',
      headers: {'Authorization': 'Bearer ' + token},
    }).then( response => {
      if(response.status != 200){
        console.log(response.status);
        return response.status;
      }
      console.log(response.status);
      this.setState({text : response.data.text});
    })
    .catch(function (error) {
      console.log(error);
    })
  }

  render(){
    return(
      <View style={styles.container}>
        <Text style={style.title}> Charte utilisateur </Text>
        <View style={styles.textContainer}>
         <ScrollView>
           <Text style={{fontSize:20}}>
             {this.state.text}
           </Text>
         </ScrollView>
        </View>
        <View style={styles.button}>
          <ValidateButton  text={"Accepter"} onPress={() => {
              if  (this.typeOfUser === "truck") {
                this.props.navigation.navigate('Truck', {
                  screen: 'WorkSiteManagment',
                  params: {typeOfUser:"truck"}
                  })
              }else if(this.typeOfUser === "crane"){
                this.props.navigation.navigate('Crane', {
                  screen: 'WorkSiteManagment',
                  params: {typeOfUser:"crane"}
                })
              }
            }
          }/>
          <Text> En cliquant sur ce bouton vous acceptez les termes sur la convention d'utilisation</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer:{
    flex:8,
    backgroundColor: "#879fc0",
    alignItems: 'center',
    borderRadius:25,
    justifyContent: 'center',
    margin:10,
    padding:20,
  },
  checkbox:{
    flex:1,
    paddingTop:30,
    alignItems: 'center',
  },
  button:{
    flex:1,
    padding:20,
    alignItems :'center'
  }
});
