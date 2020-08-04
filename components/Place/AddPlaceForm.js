import React from 'react'
import {TextInput, Text, AsyncStorage, View} from 'react-native'
import ValidateButton from "../ValidateButton";
import axios from 'axios'
import style from './../../Style'
import Config from "react-native-config";
import {Button} from 'react-native-elements';
import * as RootNavigation from '../../navigation/RootNavigation.js';
import { RadioButton } from 'react-native-paper';


export default class AddWorkSiteForm extends React.Component {

    constructor(props) {
        super(props);
        this.setLocation = this.setLocation.bind(this);
        this.setGPSLocationPage = this.setGPSLocationPage.bind(this);
        this.state = {
            adress: '',
            city: '',
            lon: 3.87671,
            lat: 43.610769,
            rayon: '',
            checked : 'first'
        }
    }

    componentDidUpdate(prevProps){
      console.log(prevProps.route.params);
      if(prevProps.route.params?.marker.coordinate.longitude !== this.props.route.params?.marker.coordinate.longitude){
        this.setState({
          lon : this.props.route.params?.marker.coordinate.longitude,
          lat : this.props.route.params?.marker.coordinate.latitude
        })
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
                "rayon": parseInt(this.state.rayon),
                "type": this.state.checked === 'second' ? "carriere" : null,
            }
        ;
        console.log(this.state.lon+" => "+ parseFloat(this.state.lon))
        axios({
            method: 'post',
            url: Config.API_URL + 'lieux',
            data : data,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status != 201){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                //this.props.toggleShow();
                alert("le lieu a bien été crée");

                console.log(response.status);
                return response.status;
            })
            .catch((error) => {
                console.log(error);
            })
    }

    setGPSLocationPage(){
      RootNavigation.navigate("setGPSLocation", {longitude:this.state.lon, latitude: this.state.lat, origin:"AddPlace", type: "add" });
    }

    setLocation(marker){
      this.setState({
        lat : marker.coordinate.latitude,
        lon: marker.coordinate.longitude
      })
    }


    render() {
        return(
                    <View style={style.container}>
                        <Text style={style.getStartedText}> Création d'un lieu :</Text>
                        <View style={{flexDirection:"row"}}>
                            <Text style={{paddingTop : 7}}> Chantier </Text>
                            <RadioButton
                                value="first"
                                status={ this.state.checked === 'first' ? 'checked' : 'unchecked' }
                                onPress={() => this.setState({checked : 'first'})}
                            />
                            <RadioButton
                                value="second"
                                status={ this.state.checked === 'second' ? 'checked' : 'unchecked' }
                                onPress={() => this.setState({checked : 'second'})}
                            />
                            <Text style={{paddingTop : 7}}> Carrière </Text>
                        </View>

                        <TextInput style={style.textinput} onChangeText={(adress) => this.setState({adress})}
                                   value={this.state.adress} placeholder={" libellé adresse"}/>
                        <TextInput style={style.textinput} onChangeText={(rayon) => this.setState({rayon})}
                                   value={this.state.rayon} placeholder={" Rayon du lieu en mètre : exemple 50"}/>
                        <Button
                          onPress={() => this.setGPSLocationPage()}
                          title={"Placer le lieu"}
                        />
                        <ValidateButton text={"Ajouter le lieu"} onPress={() => this.postPlace()}/>
                        {/* CODE LIEU AUTOMATIQUE
                            <Text style={style.getStartedText}> Création d'un lieu automatique en fonction d'une adresse :</Text>
                            <TextInput style={style.textinput} onChangeText={(adress) => this.setState({adress})}
                            value={this.state.adress} placeholder={" Adresse exemple : 570 Route De Ganges"}/>
                            <TextInput style={style.textinput} onChangeText={(city) => this.setState({city})}
                            value={this.state.city} placeholder={" Ville"}/>
                            <TextInput style={style.textinput} onChangeText={(rayon) => this.setState({rayon})}
                            value={this.state.rayon} placeholder={" Rayon du lieu en mètre : exemple 50"}/>
                            <ValidateButton text={"Ajouter le lieu"} onPress={() => this.getLieu()}/>
                            */
                        }
                    </View>
            );
    }
}
