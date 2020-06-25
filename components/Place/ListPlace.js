import React from "react";
import style from "../../Style";
import axios from 'axios'
import {Text, ActivityIndicator, View, FlatList, ScrollView, AsyncStorage, Dimensions} from "react-native";
import PlaceRow from "./PlaceRow";
import Search from "../Search";
import Config from "react-native-config"; 

export default class ListWorkSite extends React.Component {
    constructor(props) {
        super(props);
        this.deletePlace = this.deletePlace.bind(this);
        this.reloadData = this.reloadData.bind(this);
        this.state = {
            report: null
        };
    }

     async componentDidMount() {
        this.reloadData();
    }

    async deletePlace(id) {
        console.log(id);
        const token = await AsyncStorage.getItem('token');
        var data = { "id" : id};
        axios({
            method : 'delete',
            url : Config.API_URL + 'lieux/'+id,
            headers: {'Authorization': 'Bearer ' + token},
            data: data
        })
            .then( response => {
                if(response.status != 204){
                    console.log(response.status);
                    console.log(response.data);
                }
                var copy = this.state.report.slice();
                var index = copy.findIndex(place => place.id === id);
                if (index > -1) {
                    copy.splice(index, 1);
                    this.setState({
                        report : copy
                    })
                }
                console.log(response.data);
                console.log(response.status);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    async reloadData() {
        console.log("get started")
        const token = await AsyncStorage.getItem('token');
        axios({
            method : 'get',
            url : Config.API_URL + 'lieux',
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status != 200){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status);
                this.setState({report:response.data})
                return response.status;
            })
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        if (this.state.report === null) {
            return (
                <View style={{paddingTop: 30}}>
                    <ActivityIndicator color="orange" size="large"/>
                </View>
            )
        } else {
            return (
                <View>
                    <ScrollView>
                    <Text style={style.getStartedText}>Liste des lieux:</Text>
                    <Search/>
                    <FlatList
                        data={this.state.report}
                        renderItem={({item}) => <PlaceRow place={item} onDelete={(id) =>this.deletePlace(id)}/>}
                    />
                    </ScrollView>
                </View>
            )
        }
    }
}
