import React from 'react'
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { Input } from 'react-native-elements';
import Icon from "react-native-vector-icons/FontAwesome5";

export default function InputCoef (props){
  return(
    <View style={styles.view} >
      <Text>{props.placeholder}: {typeof(props.value)}</Text>
      <TextInput
        style={styles.text}
        value={props.value.toString(10)}
        placeholder={props.placeholder}
        placeholderTextColor="black"
        keyboardType="decimal-pad"
        maxLength={4}
        onChangeText={text => props.onChangeText(text)}
      />
      <TouchableOpacity onPress={() => props.save()}>
        <Icon name={"save"} size={30} color="#32CD32"/>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  view:{
    width:"50%",
    backgroundColor:"#FFFFFF",
    height:50,
    margin:10,
    justifyContent:"space-between",
    flexDirection: 'row',
    alignItems: 'center',
    padding:10,
    borderColor : '#abb0b0',
  },
  text:{
    width:"50%",
    height:40,
    borderWidth : 1,
    color:"black"
  }
});
