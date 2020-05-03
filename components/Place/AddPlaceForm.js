import React from 'react'
import {StyleSheet, TextInput, Modal, Text, TouchableOpacity, AsyncStorage, View} from 'react-native'
import ValidateButton from "../ValidateButton";
import axios from 'axios'
import style from './../../Style'
import {MaterialIcons} from "@expo/vector-icons";

export default class AddWorkSiteForm extends React.Component {

    constructor() {
        super();
        this.state = {
            adress: '',
            city: '',
            lon:'',
            lat:'',
        }
    }

    getLieu(){
        axios({
            method: 'get',
            url: 'https://nominatim.openstreetmap.org/search?q='+this.state.adress.replace(/ /g, '+')+','+this.state.city+'&format=json',
        })
            .then( response => {
                console.log('https://nominatim.openstreetmap.org/search?q='+this.state.adress.replace(/ /g, '+')+','+this.state.city+'&format=json')
                console.log(response.status);
                console.log(response.data);
                this.setState({lon : response.data[0].lon});
                this.setState({lat : response.data[0].lat});
                return response.status;
            })
            .catch((error) => {
                console.log(error);
            }).then(() => this.postPlace())
    }

    async postPlace(){
        const token  = await AsyncStorage.getItem('token');
        const data = {
            "adresse": this.state.adress,
            "longitude": parseFloat(this.state.lon),
            "latitude": parseFloat(this.state.lat),
        };
        console.log(this.state.lon+" => "+parseFloat(this.state.lon))
        axios({
            method: 'post',
            url: 'https://smtp-pi.herokuapp.com/lieux',
            data : data,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status != 201){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                this.props.toggleShow();
                console.log(response.status);
                return response.status;
            })
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        return(
                <Modal visible={this.props.show}>
                    <MaterialIcons
                        name={'close'}
                        size={24}
                        onPress={() => this.props.toggleShow()}
                    />
                    <TextInput style={style.textinput} onChangeText={(adress) => this.setState({adress})}
                               value={this.state.adress} placeholder={"Adresse exemple : 570 Route De Ganges"}/>
                    <TextInput style={style.textinput} onChangeText={(city) => this.setState({city})}
                               value={this.state.city} placeholder={"Ville"}/>
                    <ValidateButton text={"Ajouter le lieu"} onPress={() => this.getLieu()}/>
                </Modal>
            );
    }
}