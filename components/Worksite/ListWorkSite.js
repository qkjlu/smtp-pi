import React from "react";
import style from "../../Style";
import axios from 'axios'
import {Text, ActivityIndicator, View, FlatList, ScrollView, AsyncStorage, Alert} from "react-native";
import WorkSiteRow from "./WorkSiteRow";
import ButtonGroupAdmin from "../ButtonGroupAdmin";
import Config from "react-native-config";


export default class ListWorkSite extends React.Component {
    constructor(props) {
        super(props);
        this.deleteWorkSite = this.deleteWorkSite.bind(this);
        this.reloadData = this.reloadData.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.state = {
            report: null
        };
    }

    async componentDidMount() {
        await this.reloadData();
    }

    async handleDelete(id){
      Alert.alert(
        'Suppresion de chantier',
        'Etes-vous sûr de vouloir supprimer ce chantier ?',
        [
          {
            text: 'OUI',
            onPress: () => this.deleteWorkSite(id)
          },
          {
            text: 'NON',
            style: 'cancel'
          },
        ],
        { cancelable: false }
      );
    }

    async deleteWorkSite(id) {
        console.log(id);
        const token = await AsyncStorage.getItem('token');
        var data = { "id" : id};
        await axios({
            method : 'delete',
            url : Config.API_URL +'chantiers',
            headers: {'Authorization': 'Bearer ' + token},
            data: data
        })
            .then( response => {
                if(response.status !== 204){
                    console.log(response.status);
                    console.log(response.data);
                }
                let copy = this.state.report.slice();
                let index = copy.findIndex(worksite => worksite.id === id);
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
        const token = await AsyncStorage.getItem('token');
        await axios({
            method : 'get',
            url : Config.API_URL + 'chantiers',
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status !== 200){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status);
                this.setState({report : response.data});
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
                    <ActivityIndicator color="green" size="large"/>
                </View>
            )
        } else {
            return (
                <View>
                    <ScrollView>
                    <ButtonGroupAdmin onReload={this.reloadData}/>
                    <Text style={style.getStartedText}>Liste des chantiers :</Text>
                        <FlatList
                            data={this.state.report}
                            renderItem={({item}) => <WorkSiteRow worksite={item} onDelete={(id) =>this.handleDelete(id)}/>}
                        />
                    </ScrollView>
                </View>
            )
        }
    }
}
