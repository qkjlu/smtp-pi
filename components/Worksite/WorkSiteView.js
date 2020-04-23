import React from "react";
import Style from "../../Style";
import axios from 'axios'
import {Text, ActivityIndicator, View, FlatList, ListView, ScrollView} from "react-native";
import TrucksWorkSite from "../Truck/TrucksWorkSite";
import WorkSiteMap from "./WorkSiteMap";
export default class ListWorkSite extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chargement: null,
            dechargement: null,
        };
    }

    componentDidMount() {
        //get chargement
        axios({
            method : 'get',
            url :'https://smtp-pi.herokuapp.com/lieux/'+this.props.idChargement,
            headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI'}
        })
            .then( response => {
                if(response.status != 200){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status);
                this.setState({chargement : response.data});
                return response.status;
            })
            .catch((error) => {
                console.log(error);
            });
        //get dechargement
        axios({
            method : 'get',
            url :'https://smtp-pi.herokuapp.com/lieux/'+this.props.idDechargement,
            headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI'}
        })
            .then( response => {
                if(response.status != 200){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status);
                this.setState({dechargement : response.data});
                return response.status;
            })
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        if (this.state.chargement === null || this.state.dechargement === null) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 30,}}>
                    <ActivityIndicator color="red" size="large"/>
                </View>
            )
        } else {
            return (
                <View>
                    <View style={{alignItems: 'center', justifyContent: 'center', paddingTop: 10,}}>
                        <WorkSiteMap/>
                    </View>
                    <TrucksWorkSite/>
                    <Text> adresse de chargement : {this.state.chargement.adresse}</Text>
                    <Text> longitude : {this.state.chargement.longitude} latitude : {this.state.chargement.latitude}</Text>
                    <Text> adresse de dechargement : {this.state.dechargement.adresse}</Text>
                    <Text> longitude : {this.state.dechargement.longitude} latitude : {this.state.dechargement.latitude}</Text>
                </View>
            )
        }
    }
}
