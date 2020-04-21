import React from 'react'
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import InputText from '../InputText';

export default function AddCompany (props){
  if(props.isVisible){
    return null;
  }

  return(
    <View style={styles.view} >
      <InputText placeholder="Nom de l'entreprise" value={props.firm} onChangeText={props.onChangeText}/>
    </View>
  )
}

const styles = StyleSheet.create({
  view:{
    width:"80%",
    backgroundColor:"#465881",
    borderRadius:25,
    height:50,
    margin:10,
    justifyContent:"center",
    padding:10
  },
});
