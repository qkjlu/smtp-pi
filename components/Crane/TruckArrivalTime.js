import Icon from "react-native-vector-icons/FontAwesome";
import {Text, View} from "react-native";
import * as React from "react";

export default class HomeScreen extends React.Component{

    render() {
        console.log("truck array: "+ JSON.stringify(this.props.truck))

        if(this.props.truck === undefined){
            return null
        }else{
          var time = Math.round(parseInt(this.props.truck.ETA));
          var minutes =  Math.floor(time / 60);
          console.log("mn : "  + time );
          var seconds = time - minutes * 60;
            return(
                <View style={{flexDirection:'row', paddingHorizontal : 5 }}>
                    <Icon name="truck" size={40} color="gray" />
                    <Text style={{paddingTop:8, fontSize:20}}> {minutes}mn{seconds} </Text>
                </View>
            );
        }
    }
}
