import React from 'react'
import {
  View,
  Text,
  Switch,
  StyleSheet,
} from 'react-native';
export default function CustomSwitch(props){
  return(
    <View style={styles.admin}>
      <Text>Mode Admin:</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#8FBC8F" }}
          thumbColor={props.isAdmin ? "#008B8B" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={props.handleSwitchChange}
          value={props.isAdmin}
        />
    </View>
    )
}

const styles = StyleSheet.create({
  admin:{
    flexDirection: 'row',
  }
});
