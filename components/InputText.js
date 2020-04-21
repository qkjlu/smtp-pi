import React from 'react'
import {
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';

export default function InputText (props){
  return(
    <View style={styles.view} >
      <TextInput
        style={styles.text}
        value={props.value}
        placeholder={props.placeholder}
        placeholderTextColor="white"
        onChangeText={text => props.onChangeText(text)}/>
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
  text:{
    height:50,
    color:"white"
  }
});
