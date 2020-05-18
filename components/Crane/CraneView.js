import * as React from 'react';
import {Text, View, ScrollView } from 'react-native';
import ValidateButton from "../ValidateButton";
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import StopButtons from "../StopButtons";
import TruckArrivalTime from "./TruckArrivalTime";
export default class CraneView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            myTrucks : [],
            nbTrucks : 0
        }
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    componentDidMount(){
        this.filterTrucksComingMyWay();
        this.sortTruckByETA();
        console.log("heho")
    }

    filterTrucksComingMyWay(){
        var i = -1;
        var res = [];
        for (const filteredTrucks of this.props.users) {
            if(this.props.auChargement){
                if(filteredTrucks.etat === "déchargé"){
                    res[i+1] = filteredTrucks;
                    i = i+1;
                }
            }else{
                if(filteredTrucks.etat === "chargé"){
                    res[i+1] = filteredTrucks;
                    i = i+1;
                }
            }
        }
        console.log("res : "+res);
        console.log("i : "+i);
        this.setState({
            myTrucks : res,
            nbTrucks : i+1
        })
    }

    sortTruckByETA(){
        this.state.myTrucks.sort(function(a , b){return a.ETA - b.ETA});
        console.log("tri : "+this.state.myTrucks)
    }

    render() {
        return (
            <View>
                <View style={{flexDirection:'row',  justifyContent:'center', alignItems: 'center' , backgroundColor : '#FFF' }}>
                    <Icon style={{paddingRight:5}} name="map-marker" size={45} color="green" />
                    <TruckArrivalTime truck={this.state.myTrucks[0]}/>
                    <TruckArrivalTime truck={this.state.myTrucks[1]}/>
                    <TruckArrivalTime truck={this.state.myTrucks[2]}/>
                    <TruckArrivalTime truck={this.state.myTrucks[3]}/>
                    <TruckArrivalTime truck={this.state.myTrucks[4]}/>
                </View>
                <StopButtons/>
            </View>
        );
    }
}
