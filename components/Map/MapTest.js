import React from "react";
import MapView from 'react-native-maps'
import { UrlTile} from 'react-native-maps'
import {
    View,
    StyleSheet,
    AsyncStorage,
    AppState,
    ActivityIndicator
} from "react-native";
import TruckMarker from './TruckMarker';
import {Marker, Circle} from "react-native-maps";
import axios from 'axios';
import io from "socket.io-client";
import KeepAwake from 'react-native-keep-awake';
import Config from "react-native-config";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import DetournementCard from "./DetournementCard";
let func = require('../globalHelper/axios');


export default class MapTest extends React.Component {
    constructor(props) {
        super(props);
        this.handleConnection = this.handleConnection.bind(this);
        this.handleProbleme = this.handleProbleme.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.handleDisconnection = this.handleDisconnection.bind(this);
        this.handleCoordinates = this.handleCoordinates.bind(this);
        this.componentDidMount =this.componentDidMount.bind(this);
        this.succesConnection = this.succesConnection.bind(this);
        this.enableConnection = this.enableConnection.bind(this);
        this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this)
        this.getChantiers = this.getChantiers.bind(this)
        this.socket = io(Config.API_URL);
        this.color = ["#4eb621", "#c6aba4", "#a721b6", "#21a5b6", "#b6a221" , "#db7d0b"]
        this.state = {
            socket : null,
            currentRegion : {
                latitude: 43.6398211,
                longitude: 3.8553607,
                latitudeDelta: 0.15,
                longitudeDelta: 0.0421,
            },
            connected : false,
            users: [],
            etat : null,
            appState: AppState.currentState,
            chantiers : [],
            ready : false,
            showDetournementCard : false,
            userDetournementCard : null,
        };
    }

    async componentDidMount(){
        this.setState({chantiers : await this.getChantiers()});
        await this.enableConnection();
        AppState.addEventListener('change', this.handleAppStateChange);
    }

    async getChantiers() {
        const token = await AsyncStorage.getItem('token');
        let url = Config.API_URL+ "chantiers";
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
                return response.data;
            })
            .catch(function (error) {
                alert(error)
                console.log(error);
            });
    }

    // enable socket connection
    async enableConnection(){
        const userId  = await AsyncStorage.getItem('userId');
        for (let i = 0; i < this.state.chantiers.length  ; i++){
            let chantiers = [...this.state.chantiers]
            let chantier =  {...chantiers[i]}
            console.log("chantier : " + chantier + " n° " + i)
            chantier.chargement = await func(chantier.lieuChargementId)
            chantier.dechargement = await func(chantier.lieuDéchargementId)
            chantiers[i] = chantier
            this.setState({chantiers : chantiers})
            await this.socket.emit("chantier/connect", {
                "userId" : userId,
                "chantierId" : this.state.chantiers[i].id,
            });
            await this.socket.on("chantier/connect/success", this.succesConnection);
            await this.socket.on("chantier/user/connected", this.handleConnection);
            await this.socket.on("chantier/user/disconnected", this.handleDisconnection);
            await this.socket.on("chantier/user/sentCoordinates", this.handleCoordinates);
        }
        this.setState({ready : true})
    }

    // close connection to socket
    async closeConnection(){
        await this.socket.emit("chantier/disconnect","")
        console.log("Admin : Close connection to socket");
        this.socket.close();
    }

    async componentWillUnmount(){
        this.closeConnection();
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    //update map when an user connect or disconnect
    shouldComponentUpdate(nextProps, nextState) {
        return (nextState.users.length !== this.state.users.length)
            || (nextState.ready !== this.state.ready)
            || (nextState.chantiers.length !== this.state.chantiers.length)
            || (nextState.showDetournementCard !== this.state.showDetournementCard);
    }

    // handle when app is in foreground/background
    // return in list of worksite if back to foreground
    handleAppStateChange = async (nextAppState) => {
        if (nextAppState === "active" ) {
            const userId  = await AsyncStorage.getItem('userId');
            console.log(this.socket.connected);
            for (let i = 0; i < this.state.chantiers.length ; i++) {
                await this.socket.emit("chantier/connect", {
                    "userId": userId,
                    "chantierId": this.state.chantiers[i].id,
                });
            }
        }
        this.setState({appState: nextAppState});
    }


    // delete in user array the user disconnecting
    handleDisconnection(data){
        console.log("Admin:" + data.userId + " disconnect");
        let copy = this.state.users.slice();
        let index = copy.findIndex(s => s.userId == data.userId);
        if (index > -1) {
            copy.splice(index, 1);
            this.setState({
                users : copy
            })
        }
    }

    succesConnection(data){
        console.log("Admin: ACK connection");
    }

    handleConnection(data){
        // check if the user connecting is an admin
        console.log("data : "+ JSON.stringify(data))
        let isAdmin = Object.keys(data.coordinates).length === 0 && data.coordinates.constructor === Object;
        if(!isAdmin){
            let copy = this.state.users.slice();
            let index = copy.findIndex(s => s.userId == data.userId);
            if (index > -1) {
                copy.splice(index, 1);
            }
            copy.push(data);
            this.setState({
                users : copy
            });
        }
    }

    async handleProbleme(userId,etat){
        // get Info of user
        let userInfo = await this.getUserInfo("camionneurs",userId);
        if(userInfo == -1){
            userInfo = await this.getUserInfo("grutiers",userId);
        }
        console.log(userInfo);
        let msg = userInfo.prenom + " " + userInfo.nom;
        if(etat == "probleme"){
            msg = msg + " a un problème ! Veuillez le contactez au plus vite !"
        }else{
            msg = msg + " a une urgence ! Veuillez le contactez au plus vite !"
        }
        alert(msg);
    }

    async getUserInfo(typeUser,userId){
        const token  = await AsyncStorage.getItem('token');
        return axios({
            method: 'get',
            url: Config.API_URL + typeUser + '/' + userId,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status != 200){
                    console.log(response.status);
                    return -1
                }
                console.log(response.status)
                return response.data.rayon
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    onRegionChangeComplete(region){
        this.setState({currentRegion : region})
    }

    async handleCoordinates(data){
        //console.log("Admin: coordinates receive: " + JSON.stringify(data));
        // handle if receive probleme:
        if(data.etat == "probleme" || data.etat == "urgence"){
            this.handleProbleme(data.userId,data.etat);
        }
        let copy = this.state.users.slice();
        let index = copy.findIndex(s => s.userId == data.userId);
        if( index != -1){
            copy[index] = data;
            this.setState({users : copy});
        }else{
            copy.push(data);
            this.setState({users : copy});
        }
    }


    render() {
        if (!this.state.ready){
            return (<ActivityIndicator color="red" size="large"/>);
        }else {
            return (
                <View style={{flex : 1}}>
                    <KeepAwake/>
                    <MapView
                        style={styles.map}
                        region={this.state.currentRegion}
                        onRegionChangeComplete={this.onRegionChangeComplete}
                    >
                        {this.state.chantiers.map((chantier, index) => {
                                let chargement = {latitude : chantier.chargement.latitude, longitude : chantier.chargement.longitude};
                                    return <Marker key={"chargementMarker"+ index} coordinate={chargement} title={"chargement "+chantier.nom} pinColor={this.color[index]}/>
                                    })
                        }
                        {this.state.chantiers.map((chantier, index) => {
                                    let dechargement = {latitude : chantier.dechargement.latitude, longitude : chantier.dechargement.longitude};
                                    return <Marker key={"dechargementMarker"+ index} coordinate={dechargement} title={"dechargement "+chantier.nom} pinColor={this.color[index]}/>
                                })
                        }
                        {this.state.chantiers.map((chantier, index) => {
                            let chargement = {latitude : chantier.chargement.latitude, longitude : chantier.chargement.longitude};
                            return <Circle key={"chargementCircle" + index} center={chargement} radius={chantier.chargement.rayon}/>
                                })
                        }
                        {this.state.chantiers.map((chantier, index) => {
                            let dechargement = {latitude : chantier.dechargement.latitude, longitude : chantier.dechargement.longitude};
                            return <Circle key={"dechargementCircle" + index} center={dechargement} radius={chantier.dechargement.rayon}/>
                            })
                        }
                        {this.state.users.map(marker => {
                                return (
                                    <TruckMarker key={marker.userId}
                                                    user={marker}
                                                    socket={this.socket}
                                                    singleChantier = {false}
                                                    editUser={ () => this.setState({userDetournementCard: marker})}
                                                    toggleShow = { () => this.setState(prevState => ({showDetournementCard : !prevState.showDetournementCard})) }
                                    />
                                )
                            })
                        }
                    </MapView>
                    {(this.state.showDetournementCard && this.state.userDetournementCard !== null) &&
                    <DetournementCard
                        showDetournementCard={ this.state.showDetournementCard }
                        user={ this.state.userDetournementCard }
                        chantiers = { this.state.chantiers }
                        toggleShow={() => this.setState(prevState => ({showDetournementCard: !prevState.showDetournementCard}))}
                    />
                    }
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    map: {
        width : wp('100%'),
        height: hp('100%'),
        flex : 1,
    },
    mapCrane: {
        width : wp('100%'),
        height: hp('77%'),
    },
    progressBar: {
        height: hp('23%')
    }
});
