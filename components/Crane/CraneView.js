import * as React from 'react';
import {Text, View, ScrollView, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import ValidateButton from "../ValidateButton";
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import StopButtons from "../StopButtons";
import TruckArrivalTime from "./TruckArrivalTime";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

export default class CraneView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            socket : this.props.socket,
            myTrucks : this.props.users,
            nbTrucks : 0,
        }
        this.componentDidMount = this.componentDidMount.bind(this);
        this.filterTrucksComingMyWay = this.filterTrucksComingMyWay.bind(this);
        this.sortTruckByETA = this.sortTruckByETA.bind(this);
        this.handleCoordinates = this.handleCoordinates.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
    }

    async componentDidMount(){
      await this.state.socket.on("chantier/user/sentCoordinates", this.handleCoordinates);
        if(this.state.myTrucks.length != 0){
            const trucks = await this.filterTrucksComingMyWay(this.state.myTrucks);
            this.sortTruckByETA(trucks);
        }
      //this.setState({socket : this.props.socket})
    }

    async componentDidUpdate(prevProps){
        if(prevProps.users.length != this.props.users.length){
            const trucks = await this.filterTrucksComingMyWay(this.props.users);
            this.sortTruckByETA(trucks);
        }
    }

    async handleCoordinates(data){
        console.log("Crane: coordinates receive: " + JSON.stringify(data));
        var copy = this.state.myTrucks.slice();
        var index = copy.findIndex(s => s.userId == data.userId);
        if( index != -1){
          copy[index] = data;
          //this.setState({myTrucks : copy});
        }else{
          copy.push(data);
          //this.setState({myTrucks : copy});
        }
        const trucks = await this.filterTrucksComingMyWay(copy);
        this.sortTruckByETA(trucks);
    }

    async filterTrucksComingMyWay(tabUser){
        var i = -1;
        var res = [];
        await tabUser.map(user => {
            if(this.props.auChargement){
                if(user.etat === "déchargé"){
                    res[i+1] = user;
                    i = i+1;
                }
            }else{
                if(user.etat === "chargé"){
                    res[i+1] = user;
                    i = i+1;
                }
            }
        })
        return res
    }

    sortTruckByETA(trucks){
        const copy = trucks.sort(function(a , b){return a.ETA - b.ETA});
        this.setState({
            myTrucks : copy,
            nbTrucks : copy.length + 1
        })
    }

    render() {
        return (
            <View>
                <View style={styles.progressBar}>
                  <ScrollView horizontal={true}>
                    <Icon style={{paddingRight:5}} name="map-marker" size={45} color="green" />
                      {this.state.myTrucks.map(truck => {
                              return (<TruckArrivalTime key={truck.userId} truck={truck}/>)
                          }
                      )}
                  </ScrollView>
                </View>
                {/*<StopButtons/>*/}
            </View>
        );
    }
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    progressBar: {
        flexDirection : "row",
        position: "absolute",
        bottom: 80,
        alignItems:'center',
        justifyContent:'center',
        width: wp('100%'),
        backgroundColor : '#FFF',
        height: hp('10%')
    }
});
