import Icon from "react-native-vector-icons/FontAwesome";
import {Text, View, AsyncStorage } from "react-native";
import * as React from "react";
import axios from 'axios';
import Config from "react-native-config";



export default class TruckArrivalTime extends React.Component{

    constructor(props){
      super(props);
      this.getCamionneurInfo = this.getCamionneurInfo.bind(this);
      this.state = {
        prenom: "",
      }
    }

    async componentDidMount(){
      //const socket = this.props.socket;
      console.log(this.props.truck)
      this.getCamionneurInfo();
    }

    async getCamionneurInfo(){
      const token  = await AsyncStorage.getItem('token');
      axios({
        method: 'get',
        url: Config.API_URL + "camionneurs/" +this.props.truck.userId,
        headers: {'Authorization': 'Bearer ' + token},
      })
        .then( response => {
          if(response.status != 200){
            console.log(response.status);
          }
          console.log(response.status)
          this.setState({
            prenom : response.data.prenom
          });
        })
        .catch(function (error) {
          console.log(error);
        })
    }

    render() {
        console.log("truck array: "+ JSON.stringify(this.props.truck))

        if(this.props.truck === undefined){
            return null
        }else{
          let time = Math.round(parseInt(this.props.truck.ETA));
          let minutes =  Math.floor(time / 60);
          console.log("mn : "  + time );
          let seconds = time - minutes * 60;
            return(
                <View style={{flexDirection:'column', paddingHorizontal : 5 }}>
                  <View style={{flexDirection:'row', paddingHorizontal : 5 }}>
                      <Icon name="truck" style={{justifyContent:'center', alignItems: 'center'}} size={40} color="gray" />
                      <Text style={{paddingTop:8, fontSize:20}}> {minutes}mn{seconds}</Text>
                  </View>
                  <Text style={{fontSize:20, textAlign: "center" }}>{this.state.prenom} </Text>
                </View>
            );
        }
    }
}
