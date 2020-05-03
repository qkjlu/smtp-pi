import React, { useState } from "react"
import ValidateButton from './ValidateButton';
import {StyleSheet, View, Text, ScrollView, CheckBox} from 'react-native';
import style from "../Style";

export default function Chart({navigation,route}){
  const [isSelected, setSelection] = useState(false);
  const typeOfUser = route.params.typeOfUser;

  return(
    <View style={styles.container}>
      <Text style={style.title}> Charte utilisateur </Text>
      <View style={styles.textContainer}>
       <ScrollView>
         <Text style={{fontSize:20}}>
           Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur et nisl est.
           Nulla dignissim libero luctus sem tristique, non euismod purus porta.
           Fusce eu magna pretium, eleifend est quis, rhoncus massa.
           Nulla malesuada ullamcorper interdum. Curabitur pellentesque nisi eu nisl suscipit iaculis.
           Aliquam placerat purus vitae tellus aliquam, nec cursus purus faucibus. Integer libero risus,
           pellentesque eget metus sit amet, tincidunt mollis magna. Praesent accumsan ligula nec eros auctor,
           sit amet suscipit magna facilisis. Mauris varius porttitor tellus, sed posuere ante blandit nec.
           Vivamus sodales, lectus ut dapibus semper, nisl magna vulputate mauris, in accumsan orci sapien non orci.
           Ut id risus ultrices, finibus enim sit amet, viverra urna. Pellentesque mollis vehicula turpis eget aliquet.
           Curabitur efficitur lectus dapibus, vehicula ipsum quis, pulvinar velit. Duis mauris ex, tincidunt ut cursus ac, posuere ut neque.
           Etiam sed neque in mi rhoncus posuere. Morbi justo felis, dapibus vitae mi eget, viverra interdum nisl.
           Suspendisse bibendum tincidunt dui in porta. Aliquam bibendum libero eu felis eleifend fermentum.
           Integer tincidunt arcu sit amet diam ullamcorper pharetra. Mauris at semper nibh. Etiam facilisis tellus placerat,
           iaculis arcu eu, finibus nisl. Nulla elementum, turpis vitae laoreet molestie, mi nulla tempus massa, quis ornare nulla lorem eu metus.
           Maecenas in ligula varius, blandit lorem in, condimentum massa. Quisque at sollicitudin odio, nec tristique libero.
           Proin tincidunt quam et nisi mollis, id imperdiet ipsum consequat.
           Praesent mana eros, consequat eleifend quam a, sollicitudin porttitor mi. Donec condimentum erat velit.
           Ut ullamcorper orci nec turpis dignissim euismod. Phasellus iaculis id arcu ultrices eleifend.
           Aliquam lectus magna, placerat ut finibus quis, finibus sed quam. Nam ultrices, quam quis molestie lacinia,
           felis dui cursus erat, vitae congue sapien est ut eros. Mauris lobortis velit a neque condimentum, vitae efficitur arcu molestie.
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
    backgroundColor: "#879fc0",
    alignItems: 'center',
    borderRadius:25,
    justifyContent: 'center',
    margin:10,
    padding:20,
  },
  checkbox:{
    flex:1,
    paddingTop:30,
    alignItems: 'center',
  },
  button:{
    flex:1,
    padding:20,
    alignItems :'center'
  }
});
