import React from 'react'
import {StyleSheet, TextInput, ScrollView, Text, TouchableOpacity, AsyncStorage, View } from 'react-native'
import axios from 'axios'
import {Button} from 'react-native-elements'
import AutoCompletePlaces from "../Place/AutoCompletePlaces";
import AddPlaceForm from "../Place/AddPlaceForm";
import style from "../../Style";
import {MaterialIcons, Ionicons} from "@expo/vector-icons";
import Config from "react-native-config";

export default class AddWorkSiteForm extends React.Component {

    constructor() {
        super();
        this.state = {
            name: '',
            idPlace1: '',
            idPlace2: '',
            chargementRayon : null,
            dechargementRayon : null,
            places : [],
            showNewPlaceForm : false
        }
    }

    componentDidMount() {
        axios({
            method: 'get',
            url: Config.API_URL + 'lieux',
            headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI'}            })
            .then( response => {
                this.setState({places: response.data});
            })
            .catch((error) => {
                console.log(error);
            })
    }

    async formSubmit(){
        const token  = await AsyncStorage.getItem('token');
        if (this.state.name == "" || this.state.idPlace1 == "" || this.state.idPlace2 == "") {
            console.log(this.state);
            alert('Tous les champs sont requis');
        }else{
            console.log(this.state);
            const data = {
                "nom": this.state.name,
                "lieuChargementId": this.state.idPlace1,
                "lieuDéchargementId": this.state.idPlace2,
            };
            axios({
                method: 'post',
                url: Config.API_URL+'chantiers',
                data : data,
                headers: {'Authorization': 'Bearer ' + token},
            })
                .then( response => {
                    if(response.status != 201){
                        console.log(response.status);
                        alert(response.status);
                        return response.status;
                    }
                    console.log(response.status);
                    this.setState({name : '',idPlace1:'',idPlace2: '', showNewPlaceForm : false});
                    this.props.unShowForm();
                    return response.status;
                })
                .catch((error) => {
                    console.log(error);
                })
        }
    }

    handleChargementText(text){
      this.setState({chargementRayon : text});
    }

    handleDechargementText(text){
      this.setState({dechargementRayon : text});
    }

    render() {
            return (
                <View style={{padding : 20}}>
                    <View style={{ flexDirection:"row" , paddingTop :10}}>
                        <Text style={styles.header}> Ajout d'un chantier</Text>
                        <View style={{flex:2, flexDirection:"row", paddingTop :5}}>
                            <MaterialIcons
                                name={'add'}
                                size={24}
                                onPress={() => this.setState({ showNewPlaceForm: !this.state.showNewPlaceForm }) }
                            />
                            <Text style={{fontWeight:"bold"}}> lieu </Text>
                        </View>
                    </View>
                    <View style={{padding : 20}}>
                    <TextInput style={styles.textinput} onChangeText={(name) => this.setState({name})}
                               value={this.state.name} placeholder={" Nom du chantier"}/>

                    <AddPlaceForm  style={{padding: 20}} show={this.state.showNewPlaceForm} toggleShow={() => this.setState({showNewPlaceForm:false})} />

                    <AutoCompletePlaces changePlace={(idPlace1) => this.setState({idPlace1})} name={"chargement"} places={this.state.places}/>

                    <AutoCompletePlaces changePlace={(idPlace2) => this.setState({idPlace2})} name={"déchargement"} places={this.state.places}/>

                    <Text>Rayon de chargement:</Text>
                    <InputText placeholder="chargement" />
                    <ValidateButton text={"Modifier"} onPress={this.handleModifyChargement}/>
                    <Text>Rayon de déchargement:</Text>
                    <InputText placeholder="dechargement" />
                    <ValidateButton text={"Modifier"} onPress={this.handleModifyDechargement}/>

                    </View>
                    <Button
                            buttonStyle={styles.button}
                            onPress={() => this.formSubmit().then(this.props.onReload)}
                            title={"Valider"}
                    />
                </View>
            );
    }
}

const styles = StyleSheet.create({
    addForm : {
       alignSelf: 'stretch'
    },
    pad:{
      paddingVertical : 10
    },
    header : {
        fontSize: 24,
        color: '#1f1f1f',
        marginBottom : 10,
        flex :8,
        borderBottomColor : '#199187',
    },
    textinput : {
        alignSelf: 'stretch',
        height: 40,
        color: "black",
        backgroundColor: '#ffffff',
        borderWidth : 1,
        borderColor : '#abb0b0',
    },
    button: {
        alignSelf: 'stretch',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#59cbbd',
        marginTop: 20,
    },
    txtbutton:{
        color: '#fff',
        fontWeight: 'bold',
    }
});
