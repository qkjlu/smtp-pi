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

    <Text style = { style.title}> {props.nom} </Text>
    <Text style = { style.title}> {props.prenom} </Text>

    <View style={styles.buttons} >
    <Button
      icon={
        <Icon
          name='edit'
          type='font-awesome'
        />
      }
      title=""
      type="clear"
    />
    <Button
      icon={
        <Icon
          name='trash'
          type='font-awesome'
        />
      }
      title=""
      type="clear"
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
