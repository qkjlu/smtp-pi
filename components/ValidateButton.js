import React from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';

export default function ValidateButton(props){
  return(
    <TouchableOpacity style={styles.container} onPress={() => props.onPress()}>
      <Text style={{color: "white"}}>VALIDER</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width:"80%",
    backgroundColor:"#228B22",
    borderRadius:25,
    height:50,
    alignItems:"center",
    justifyContent:"center",
    margin:10
  }
});
