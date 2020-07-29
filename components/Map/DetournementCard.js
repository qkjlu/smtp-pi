import React from "react";
import {Text, View, Button, AsyncStorage } from "react-native";
import Style from "../../Style";
import Config from "react-native-config";
import axios from "axios";
import CustomPicker from "../CustomPicker";
import io from "socket.io-client";

export default class DetournementCard extends React.Component {
    constructor(props) {
        super(props);
        this.socket = io(Config.API_URL);
        this.handlePickerChange = this.handlePickerChange.bind(this);
        this.state = {
            chantier : null,
            nom : "",
            prenom : "",
            origin : null,
            destination : null,
            chantiers : [],
            pickerSelected : null,
        }
    };

    async componentDidMount() {
        this.setState({ chantier : await this.getChantier(this.props.user.chantierId)})
        await this.getCamionneurInfo();
        await this.getChantiersExceptCurrent();

    }

    async getChantier(chantierId){
        const token = await AsyncStorage.getItem('token');
        let url = Config.API_URL+ "chantiers/"+ chantierId;
        return await axios({
            method : 'get',
            url : url,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status != 200){
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status);
                return response.data;
            })
            .catch(function (error) {
                alert(error)
                console.log(error);
            });
    }

    handlePickerChange(value){
        console.log("value picker : "+value)
        this.setState({pickerSelected : this.state.chantiers[value]})
        console.log(" picker : "+ JSON.stringify(this.state.pickerSelected))
    }

    async getChantiersExceptCurrent(){
        let res = []
        let index = 0
        console.log("CHANTIERS2 : "+ JSON.stringify(this.props.chantiers))
        for (let i = 0; i < this.props.chantiers.length  ; i++){
            if(this.props.chantiers[i].id !== this.props.user.chantierId){
                res[index] = this.props.chantiers[i]
                index++
            }
        }
        console.log("RES : "+ res)
        await this.setState({pickerSelected : res[0]});
        await this.setState({chantiers : res})

    }

    async sendDetournement(){
        let chargementLong = this.state.pickerSelected.chargement.longitude;
        let chargementLat = this.state.pickerSelected.chargement.latitude;
        let dechargementLong = this.state.pickerSelected.dechargement.longitude;
        let dechargementLat = this.state.pickerSelected.dechargement.latitude;
        let chantierId = this.state.pickerSelected.id;
        let userId = this.props.user.userId;
        let obj = {
            "chantierId" : chantierId,
            "userId" : userId,
            "originLong" :chargementLong,
            "originLat" : chargementLat,
            "destinationLong" : dechargementLong,
            "destinationLat" : dechargementLat,
        }
        await this.socket.emit("chantier/detournement",obj)
    }


    async getCamionneurInfo(){
        const token  = await AsyncStorage.getItem('token');
        axios({
            method: 'get',
            url: Config.API_URL + "camionneurs/" +this.props.user.userId,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status != 200){
                    console.log(response.status);
                }
                console.log(response.status)
                this.setState({
                    nom: response.data.nom,
                    prenom : response.data.prenom
                });
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    render() {
        if(this.props.showDetournementCard && this.state.chantiers.length > 0){
            let selected = this.state.pickerSelected.nom
            let pickerData = this.state.chantiers.map(item => item.nom)
            return(
                <View style={Style.card}>
                    <View style={Style.textContent}>
                        <Text numberOfLines={1} style={Style.cardTitle}>{ this.state.prenom + " " + this.state.nom } </Text>
                        <Text numberOfLines={1} style={Style.cardDescription}>{ this.state.chantier ? this.state.chantier.nom : "null" }</Text>
                        <CustomPicker titleContent="Nouveau chantier :" data={pickerData}
                                      selectedValue= {selected} onValueChange= {this.handlePickerChange}/>
                        <View style={{flexDirection : "row", alignContent:"flex-start"}}>
                            <Button  title={"Annuler"} color={"#d9cfcf"} onPress={this.props.toggleShow}/>
                            <View style={{flex:0.9}}/>
                            <Button title={"Détourner"} onPress={null}/>
                        </View>
                    </View>
                </View>
            )
        }else{
            return null
        }
    }
}