import React from 'react';
import { Icon, Button } from 'react-native-elements'
import style from '../../Style'

import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

export default function ItemList(props) {
  return(
    <View style={style.worksite}>
      <Text style = {{ fontSize :20, flex:1, paddingTop:3}}> {props.user.nom} </Text>
      <Text style = {{ fontSize :20, flex:1, paddingTop:3}}> {props.user.prenom} </Text>
      <View style={styles.buttons} >
        <Button
          icon={
            <Icon
              name='edit'
              type='font-awesome'
              color="#FF8C00"
            />
          }
          title=""
          type="clear"
          onPress={button => props.onPressEdit(props.user)}
        />
        <Button
          icon={
            <Icon
              name='trash'
              type='font-awesome'
               color = "#FF0000"
            />
          }
          title=""
          type="clear"
          onPress={button => props.onPressDelete(props.user)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttons:{
    flexDirection: 'row',
  }
});
