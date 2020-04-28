import React from 'react'
import {StyleSheet, TextInput, ScrollView, Text, TouchableOpacity, AsyncStorage} from 'react-native'
import axios from 'axios'
import AutoCompletePlaces from "../Place/AutoCompletePlaces";
export default class AddWorkSiteForm extends React.Component {

    constructor() {
        super();
        this.state = {
            name: '',
            idPlace1: '',
            idPlace2: '',
        }
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
                url: 'https://smtp-pi.herokuapp.com/chantiers',
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
                    this.setState({report : response.data});
                    return response.status;
                })
                .catch((error) => {
                    console.log(error);
                })
        }
    }

    render() {
            return (
                <ScrollView style={styles.addForm}>
                    <Text style={styles.header}> Ajout d'un chantier</Text>

                    <TextInput style={styles.textinput} onChangeText={(name) => this.setState({name})}
                               value={this.state.name} placeholder={"Nom du chantier"}
                    />

                    <AutoCompletePlaces changePlace={(idPlace1) => this.setState({idPlace1})} name={"chargement"}/>

                    <AutoCompletePlaces changePlace={(idPlace2) => this.setState({idPlace2})} name={"déchargement"}/>

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.txtbutton} onPress={() => this.formSubmit()}> Valider </Text>
                    </TouchableOpacity>
                </ScrollView>
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