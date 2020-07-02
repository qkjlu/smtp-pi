import {Alert, AsyncStorage, View} from "react-native";
import style from "../../Style";
import React from "react";
import * as RootNavigation from '../../navigation/RootNavigation.js';
import {Icon, Button, Image, Badge} from 'react-native-elements'
import ActivityStarter from "../../ActivityStarter";
import axios from "axios";
import Config from "react-native-config";

export default class WorkSiteAccessButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            typeUser : "",
            chargement : null,
            dechargement : null,
        }
    }

    componentDidMount() {
        this.getUser().then( res => this.setState({typeUser : res }))
    }

    AdminAccess() {
        const hasRoutes = this.props.worksite.allerId !== null && this.props.worksite.retourId !== null
        const success = <Badge status="success" containerStyle={{ position: 'absolute', top: 2, right: 1 }} />
        const error = <Badge status="error" containerStyle={{ position: 'absolute', top: 2, right: 1 }} />

        return (
            <View style={{flexDirection:"row", flex :6}}>
                <View style={style.button} >
                    <Button
                        icon={<Icon name='map' type='font-awesome' color="green"/>}
                        onPress={() => { RootNavigation.navigate('WorkSite', { worksite : this.props.worksite })}}
                        title=""
                        type="clear"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
                <View style={style.button} >
                    <Button
                        icon={<Icon name='road' type='font-awesome' color="black"/>}
                        onPress={() => { RootNavigation.navigate('Road', { worksite : this.props.worksite })}}
                        title=""
                        type="clear"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                    {hasRoutes ? success : error}
                </View>
                <View style={style.button} >
                    <Button
                        icon={<Icon name='cog' type='font-awesome' color="orange"/>}
                        onPress={() => { RootNavigation.navigate('Settings', { worksite : this.props.worksite })}}
                        title=""
                        type="clear"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
                <View style={style.button} >
                    <Button
                        icon={<Icon name='trash' type='font-awesome' color="red"/>}
                        onPress={() => { this.props.onDelete(this.props.worksite.id) }}
                        title=""
                        type="clear"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
            </View>
        )
    }
    async uploadLieux(){
        const token = await AsyncStorage.getItem('token');
        //get chargement
        await axios({
            method : 'get',
            url : Config.API_URL + 'lieux/'+this.props.worksite.lieuChargementId,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status != 200){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status);
                this.setState({chargement : response.data});
                return response.status;
            })
            .catch((error) => {
                console.log(error);
            });
        //get dechargement
        await axios({
            method : 'get',
            url : Config.API_URL + 'lieux/'+this.props.worksite.lieuDéchargementId,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status != 200){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status);
                this.setState({dechargement : response.data});
                return response.status;
            })
            .catch((error) => {
                console.log(error);
            })
    }

    async startNavigation(myEtat) {
        if (this.props.worksite.allerId === null || this.props.worksite.retourId === null) {
            Alert.alert(
                'Les routes personalisées n\'ont pas encore été créées ',
                'Contactez un administrateur',
            );
        } else {
            const userId  = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
            await this.uploadLieux();

            await ActivityStarter.startNavigation(
                [this.state.chargement.longitude, this.state.chargement.latitude],
                [this.state.dechargement.longitude, this.state.dechargement.latitude],
                userId,
                this.props.worksite.id,
                myEtat,
                token
            );
        }
    }

    TruckAccess() {
        return (
            <View style={{flexDirection: "row"}}>
                <View style={style.buttonIcon} >
                    <Button
                        icon={<Image source={require('./../../assets/images/loaded_truck.png')}
                                     style={{ width: 50, height: 50 }}
                        />}
                        onPress={() => this.startNavigation("chargé") }
                        title=""
                        style={{paddingVertical : 100}}
                        type={"clear"}
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
                <View style={style.buttonIcon} >
                    <Button
                        icon={<Image source={require('./../../assets/images/empty_truck.png')}
                                     style={{ width: 50, height: 50 }}
                        />}
                        onPress={() =>  this.startNavigation("déchargé")}
                        title=""
                        type={"clear"}
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
            </View>
        )
    }

    CraneAccess() {
        return (
            <View style={{flexDirection: "row"}}>
                <View style={style.button} >
                    <Button
                        icon={<Image source={require('./../../assets/images/crane.png')}
                                     style={{ width: 45, height: 45 }}
                        />}
                        onPress={() => { RootNavigation.navigate('CraneView', { worksite : this.props.worksite, auChargement:true })}}
                        title=""
                        type={"clear"}
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
                <View style={style.button} >
                    <Button
                        icon={<Image source={require('./../../assets/images/bull.png')}
                                     style={{ width: 50, height: 50 }}
                        />}
                        onPress={() => { RootNavigation.navigate('CraneView', { worksite : this.props.worksite, auChargement:false })}}
                        title=""
                        type={"clear"}
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
            </View>
        )
    }

    async getUser(){
        const typeUser = await AsyncStorage.getItem('typeUser');
        console.log(typeUser);
        return typeUser
    }

    render() {
        if (this.state.typeUser === "admin") {
            return this.AdminAccess();
        }else if (this.state.typeUser === "crane"){
            return this.CraneAccess()
        }else if (this.state.typeUser === "truck"){
            return this.TruckAccess()
        }else {
            return null
        }
    }
}
