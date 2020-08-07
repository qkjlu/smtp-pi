import React from "react";
import MapView, {Marker} from 'react-native-maps'
import {
    View,
    Dimensions,
    StyleSheet,
    AppState, AsyncStorage,
} from "react-native";
import KeepAwake from 'react-native-keep-awake';
import Config from "react-native-config";
import axios from "axios";
import TabBarIcon from "../TabBarIcon";

const { width, height } = Dimensions.get("window");


export default class MapHistory extends React.Component {
    constructor(props) {
        super(props);
        this.getPoints = this.getPoints.bind(this)
        this.componentDidMount =this.componentDidMount.bind(this);
        this.sortie = this.props.route.params.sortie;
        this.chantier = this.props.route.params.chantier;
        this.camionneur = this.props.route.params.camionneur;
        this.state = {
            points : [],
            showFuelForm : false,
            connected : false,
            users: [],
            etat : null,
            appState: AppState.currentState,
        };
    }

    async getPoints(){
        const token = await AsyncStorage.getItem('token');
        let url = Config.API_URL+ "sorties/"+ this.sortie.id +"/points";
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
                this.setState({points : response.data}) ;
            })
            .catch(function (error) {
                alert(error)
                console.log(error);
            });
    }

    async componentDidMount(){
        await this.getPoints()
    }

    render() {
        console.log("points : "+ JSON.stringify(this.state.points))
        console.log("points[0] : "+ this.state.points[0])
        if(this.state.points.length < 1){
            return null
        }else{
            return(
                <View style={{flex : 1}}>
                    <KeepAwake/>
                    <MapView
                        style={styles.map}
                        region={{
                            latitude: this.state.points[0].latitude,
                            longitude: this.state.points[0].longitude,
                            latitudeDelta: 0.15,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        {this.state.points.map((waypoint) => {
                            return <Marker key={"chargementMarker"+ waypoint.ordre}
                                           image={require("./../../assets/images/point.png")}
                                           coordinate={{latitude : waypoint.latitude, longitude : waypoint.longitude}}
                                           pinColor={"#e05050"}
                            />

                        })
                        }
                        {/*<Marker coordinate={chargement} title={"chargement"} pinColor={"#000eff"}/>
                    <Marker coordinate={dechargement} title={"dechargement"} pinColor={"#000eff"}/>
                    <Circle key={"chargementCircle"} center={chargement} radius={this.props.chargement.rayon}/>
                    <Circle key={"dechargementCircle"} center={dechargement} radius={this.props.dechargement.rayon}/>*/}
                    </MapView>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    map: {
        width : width,
        height: height,
    },
    mapCrane: {
        width : width,
        height: height,
    },
});
