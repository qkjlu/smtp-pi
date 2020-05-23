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
            socket : this.props.socket,
            myTrucks : this.props.users,
            nbTrucks : 0,
        }
        this.componentDidMount = this.componentDidMount.bind(this);
        this.filterTrucksComingMyWay = this.filterTrucksComingMyWay.bind(this);
        this.sortTruckByETA = this.sortTruckByETA.bind(this);
        this.handleCoordinates = this.handleCoordinates.bind(this);
    }

    async componentDidMount(){
        if(this.state.myTrucks.length != 0){
            const trucks = await this.filterTrucksComingMyWay();
            this.sortTruckByETA(trucks);
            console.log("heho")
        }
        await this.state.socket.on("chantier/user/sentCoordinates", this.handleCoordinates);
    }

    async componentDidUpdate(prevProps){
        if(prevProps.users.length != this.props.users.length){

            console.log("heeeeeeeeeeeeeeeeeeeeeeeeereeeeeeeeeeeeeeeeeeeeeeeee")
            const trucks = await this.filterTrucksComingMyWay();
            console.log("trucks :" + trucks);
            this.sortTruckByETA(trucks);
        }
    }

    async handleCoordinates(data){
        console.log("Crane: coordinates receive: " + JSON.stringify(data));
        var copy = this.state.myTrucks.slice();
        copy.push(data);
        this.setState({myTrucks : copy});
        // var index = copy.findIndex(s => s.userId == data.userId);
        // if( index != -1){
        //   copy[index] = data;
        //   this.setState({myTrucks : copy});
        // }else{
        //   copy.push(data);
        //   this.setState({myTrucks : copy});
        // }
    }

    async filterTrucksComingMyWay(){
        var i = -1;
        var res = [];
        await this.props.users.map(user => {
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

        console.log("res : "+res);
        console.log("i : "+i);
        return res
        // this.setState({
        //     myTrucks : res,
        //     nbTrucks : i+1
        // })
    }

    sortTruckByETA(trucks){
        const copy = trucks.sort(function(a , b){return a.ETA - b.ETA});
        this.setState({
            myTrucks : copy,
            nbTrucks : copy.length + 1
        })
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
