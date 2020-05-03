import React, { useState } from "react"
import ValidateButton from './ValidateButton';
import {StyleSheet, View, Text, ScrollView, CheckBox} from 'react-native';

export default function Chart({navigation,route}){
  const [isSelected, setSelection] = useState(false);
  const typeOfUser = route.params.typeOfUser;

  return(
    <View style={styles.container}>
      <View style={styles.textContainer}>
       <ScrollView>
         <Text>
           La charte aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
           aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
           aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
           aaaaaaaa Vous acceptez ceci cela blablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablablablablaaaaaaaaaaaaaaaaaaaaaaaaaa
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
           blablablablablablablablablablablablablablablablablablablablablabla
         </Text>
       </ScrollView>
      </View>
      <View style={styles.checkbox}>
        <CheckBox
          value={isSelected}
          onValueChange={setSelection}
        />
        <Text>J'accepte les termes sur la convention d'utilisation</Text>
      </View>
      <View style={styles.button}>
        <ValidateButton  text={"Accepter"} onPress={() => {
            if (isSelected && typeOfUser === "truck") {
              navigation.navigate('Truck', {
                screen: 'WorkSiteManagment',
                params: {typeOfUser:"truck"}
                })
            }else if(isSelected && typeOfUser === "crane"){
              navigation.navigate('Crane', {
                screen: 'WorkSiteManagment',
                params: {typeOfUser:"crane"}
              })
            }
          }
        }/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer:{
    flex:8,
    backgroundColor: "#465881",
    alignItems: 'center',
    borderRadius:25,
    justifyContent: 'center',
    margin:10,
    padding:20,
  },
  checkbox:{
    flex:1,
    paddingTop:10,
    alignItems: 'center',
  },
  button:{
    flex:1,
    padding:20,
    alignItems :'center'
  }
});
