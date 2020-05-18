import Icon from "react-native-vector-icons/FontAwesome";
import {Text, View} from "react-native";
import * as React from "react";

export default class HomeScreen extends React.Component{

    render() {
        console.log("truck : "+this.props.truck)
        if(this.props.truck === undefined){
            return null
        }else{
            return(
                <View style={{flexDirection:'row', paddingHorizontal : 5 }}>
                    <Icon name="truck" size={40} color="gray" />
                    <Text style={{paddingTop:8, fontSize:20}}> {this.props.time} mn </Text>
                </View>
            );
        }

    }
}
