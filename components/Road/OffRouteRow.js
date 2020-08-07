import React from 'react'
import {AsyncStorage, Text, View} from 'react-native'
import style from "../../Style";
import {Button, Icon} from "react-native-elements";
import Config from "react-native-config";
import axios from "axios";
import * as RootNavigation from "../../navigation/RootNavigation";

export default class OffRouteRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chantier : null,
            camionneur : null,
        }
    }

    async componentDidMount() {
        await this.getChantier(this.props.item.ChantierId);
        console.log("this.props.item " + JSON.stringify(this.props.item.ChantierId));
        await this.setState({camionneur : await this.getCamionneur(this.props.item.CamionneurId)});
    }

    async getChantier(chantierId){
        const token = await AsyncStorage.getItem('token');
        let url = Config.API_URL+ "chantiers/"+ chantierId;
        await axios({
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
                this.setState({chantier : response.data});
            })
            .catch(function (error) {
                alert(error)
                console.log(error);
            });
    }

    async getCamionneur(camionneurId){
        const token = await AsyncStorage.getItem('token');
        let url = Config.API_URL+ "camionneurs/"+ camionneurId;
        await axios({
            method : 'get',
            url : url,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status !== 200){
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status);
                this.setState({camionneur : response.data}) ;
            })
            .catch(function (error) {
                alert(error)
                console.log(error);
            });
    }

    render() {
        console.log("this.props.item " + JSON.stringify(this.props.item));
        if(this.state.chantier === null){
            return null
        }else{
            return (
                <View style = {style.worksite}>
                    <View style={{flex : 6}}>
                        <Text> {this.state.chantier.nom}</Text>
                    </View>
                    <View style={{ flex: 2 }}>
                        <View style={{flexDirection:"row", flex :6}}>
                            <View style={style.button} >
                                <Button
                                    icon={<Icon name='eye' type='font-awesome' color="blue"/>}
                                    onPress={() => { RootNavigation.navigate('mapHistory', {
                                        sortie : this.props.item ,
                                        chantier : this.state.chantier,
                                        camionneur : this.state.camionneur
                                    })}}
                                    title=""
                                    type="clear"
                                    accessibilityLabel="visualisation de la sortie de route"
                                />
                            </View>
                            <View style={style.button} >
                                <Button
                                    icon={<Icon name='trash' type='font-awesome' color="red"/>}
                                    onPress={() => { this.props.onDelete(this.props.item.id) }}
                                    title=""
                                    type="clear"
                                    accessibilityLabel="suppression du lieu"
                                />
                            </View>
                        </View>
                    </View>
                </View>
            )
        }
    }
}

