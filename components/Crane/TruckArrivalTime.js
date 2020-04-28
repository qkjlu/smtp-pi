import Icon from "react-native-vector-icons/FontAwesome";
import {Text, View} from "react-native";
import * as React from "react";

export default class HomeScreen extends React.Component{

    render() {
        return(
            <View style={{flexDirection:'row', paddingHorizontal : 5 }}>
                <Icon name="truck" size={30} color="gray" />
                <Text style={{paddingTop:4}}> {this.props.time} mn </Text>
            </View>
        );
    }
}
