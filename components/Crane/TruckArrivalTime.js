import Icon from "react-native-vector-icons/FontAwesome";
import {Text, View} from "react-native";
import * as React from "react";

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
          var time = Math.round(parseInt(this.props.truck.ETA));
          var minutes =  Math.floor(time / 60);
          console.log("mn : "  + time );
          var seconds = time - minutes * 60;
            return(
                <View style={{flexDirection:'row', paddingHorizontal : 5 }}>
                    <Icon name="truck" size={40} color="gray" />
                    <Text style={{paddingTop:8, fontSize:20}}> {minutes}mn{seconds} </Text>
                    //<Text style={{paddingTop:8, fontSize:20}}> {this.state.prenom} </Text>
                </View>
            );
        }
    }
}
