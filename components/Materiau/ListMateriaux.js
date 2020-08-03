import React from "react";
import style from "../../Style";
import axios from 'axios'
import {Text, ActivityIndicator, View, FlatList, ScrollView, AsyncStorage, Alert, TextInput} from "react-native";
import Config from "react-native-config";
import MateriauRow from "./MateriauRow";
import ValidateButton from "../ValidateButton";

export default class ListMateriaux extends React.Component {
    constructor(props) {
        super(props);
        this.deleteMateriau = this.deleteMateriau.bind(this);
        this.reloadData = this.reloadData.bind(this);
        this.postMateriau = this.postMateriau.bind(this);
        this.state = {
            report: null,
            nom : null
        };
    }

    async componentDidMount() {
        await this.reloadData();
    }

    async deleteMateriau(id) {
        const token = await AsyncStorage.getItem('token');
        let data = { "id" : id};
        await axios({
            method : 'delete',
            url : Config.API_URL + 'materiaux/'+id,
            headers: {'Authorization': 'Bearer ' + token},
            data: data
        })
            .then( response => {
                if(response.status !== 204){
                    console.log(response.status);
                    console.log(response.data);
                }
                let copy = this.state.report.slice();
                let index = copy.findIndex(place => place.id === id);
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

    async postMateriau(){
        const token  = await AsyncStorage.getItem('token');
        const nom = this.state.nom
        const data = {
            "nom" : nom
        };
        axios({
            method: 'post',
            url: Config.API_URL + 'materiaux',
            data : data,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status !== 201){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                let copy = this.state.report.slice();
                copy.push(response.data);
                this.setState({report : copy})
                alert("le matériau "+ nom +" a bien été créé");
                console.log(response.status);
                return response.status;
            })
            .catch((error) => {
                console.log(error);
            })
    }

    onPressDeleteMateriau(id){
        Alert.alert(
            'Supprimer un matériau',
            'Etes-vous sûr de vouloir supprimer ce matériau ?',
            [
                {
                    text: 'OUI',
                    onPress: () => this.deleteMateriau(id)
                },
                {
                    text: 'Non',
                    style: 'cancel'
                },
            ],
            { cancelable: false }
        );
    }

    async reloadData() {
        const token = await AsyncStorage.getItem('token');
        await axios({
            method : 'get',
            url : Config.API_URL + 'materiaux',
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status !== 200){
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
                        <Text style={style.getStartedText}> Ajouter un matériau :</Text>
                        <View style={{paddingVertical : 10}}>
                            <TextInput style={style.textinput} onChangeText={(nom) => this.setState({nom})}
                                       value={this.state.nom} placeholder={"Nom du matériau"}/>
                        </View>
                        <View style={{alignItems :"center"}}>
                            <ValidateButton text={"Ajouter le matériau"} onPress={() => this.postMateriau()}/>
                        </View>
                        <Text style={style.getStartedText}> Liste des matériaux :</Text>
                        <FlatList
                            data={this.state.report}
                            renderItem={({item}) => <MateriauRow materiau={item} onDelete={(id) => this.onPressDeleteMateriau(id)}/>}
                        />
                    </ScrollView>
                </View>
            )
        }
    }
}