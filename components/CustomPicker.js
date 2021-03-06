import React from 'react'
import {StyleSheet, View, Picker, Text} from 'react-native';

export default function CustomPicker(props){
  if(props.isVisible){
    return null;
  }

  return(
    <View style={styles.container}>
      <Text style={styles.text}>{props.titleContent}</Text>
      <View style={styles.picker}>
        <Picker
          selectedValue={props.selectedValue}
          style={{ color: "black" }}
          onValueChange={(itemValue, itemIndex) => props.onValueChange(itemIndex)}
        >
        {props.data.map((item, key)=>(
          <Picker.Item label={item} value={item} key={key} />)
          )}

        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width:"80%",
    justifyContent:"center",
    borderRadius:25,
    margin:10,

  },
  picker: {
    backgroundColor:"#FFFFFF",
    borderRadius:25,
    paddingLeft:10,
    borderWidth : 1,
    borderColor : '#abb0b0',
  },
  text:{
    margin:5,
    paddingLeft:10,
  }
});
