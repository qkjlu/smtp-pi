import React from 'react'
import {
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';
import { Input } from 'react-native-elements';

export default function InputText (props){
  return(
    <View style={styles.view} >
      <TextInput
        style={styles.text}
        value={props.value}
        placeholder={props.placeholder}
        placeholderTextColor="black"
        secureTextEntry={props.secureTextEntry}
        onChangeText={text => props.onChangeText(text)}/>
    </View>
  )
}

const styles = StyleSheet.create({
  view:{
    width:"80%",
    backgroundColor:"#FFFFFF",
    height:50,
    margin:10,
    justifyContent:"center",
    padding:10,
    borderWidth : 1,
    borderColor : '#abb0b0',
  },
  text:{
    height:50,
    color:"black"
  }
});
