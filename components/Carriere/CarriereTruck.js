import React from "react";
import style from "../../Style";
import axios from 'axios'
import {
    ActivityIndicator,
    View,
    ScrollView,
    AsyncStorage,
    TextInput
} from "react-native";

import Config from "react-native-config";
import AutoCompletePlaces from "../Place/AutoCompletePlaces";
import ValidateButton from "../ValidateButton";
import AutoCompleteMateriaux from "../Materiau/AutoCompleteMateriaux";


export default class CarriereTruck extends React.Component {
    constructor(props) {
        super(props);
        this.getLieux = this.getLieux.bind(this);
        this.getMateriaux = this.getMateriaux.bind(this);
        this.state = {
            report: null,
            idPlace1 : null,
            idPlace2 : null,
            qte : null,
            materiaux : [],
        };
    }

    async componentDidMount() {
        await this.getLieux();
        await this.getMateriaux();
    }

    async getLieux() {
        const token = await AsyncStorage.getItem('token');
        await axios({
            method : 'get',
            url : Config.API_URL + 'lieux',
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

    async getMateriaux() {
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
                this.setState({materiaux : response.data});
                return response.status;
            })
            .catch((error) => {
                console.log(error);
            })
    }


    async postPrelevement(){
        const token  = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        const data = {
            "lieuChargementId": this.state.idPlace1,
            "lieuDechargementId": this.state.idPlace2,
            "quantite": parseFloat(this.state.qte),
            "camionneur": userId,
            "materiau" : this.state.materiau,
            };
        axios({
            method: 'post',
            url: Config.API_URL + 'prelevements',
            data : data,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status !== 201){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                alert("le prélevement a bien été enregistré");

                console.log(response.status);
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
                        <View style={{paddingHorizontal : 14}}>
                            <View style={{paddingVertical : 10}}>
                                <AutoCompletePlaces changePlace={(idPlace1) => this.setState({idPlace1})} name={"chargement"} places={this.state.report}/>
                            </View>
                            <View style={{paddingVertical : 10}}>
                            <AutoCompletePlaces changePlace={(idPlace2) => this.setState({idPlace2})} name={"déchargement"} places={this.state.report}/>
                            </View>

                            <View style={{paddingVertical : 10}}>
                                <AutoCompleteMateriaux changeMateriau={(materiau) => this.setState({materiau})} materiaux ={this.state.materiaux}/>
                            </View>
                        </View>
                        <View style={{paddingVertical : 10}}>
                            <TextInput style={style.textinput} onChangeText={(qte) => this.setState({qte})}
                                       value={this.state.qte} placeholder={"Quantité en tonne"}/>
                        </View>
                        <View style={{alignItems :"center"}}>
                            <ValidateButton text={"Ajouter le lieu"} onPress={() => this.postPrelevement()}/>
                        </View>
                    </ScrollView>
                </View>
            )
        }
    }
}