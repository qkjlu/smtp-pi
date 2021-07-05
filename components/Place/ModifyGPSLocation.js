import React from "react";
import MapView from 'react-native-maps'
import { UrlTile} from 'react-native-maps'
import {Text, View, FlatList, Dimensions, StyleSheet,PermissionsAndroid,AsyncStorage } from "react-native";
import {Marker, Circle} from "react-native-maps";
import axios from 'axios';
import Config from "react-native-config";
import * as RootNavigation from '../../navigation/RootNavigation.js';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {Button} from 'react-native-elements';
import InputText from '../InputText';

export default class ModifyGPSLocation extends React.Component {
    constructor(props) {
        super(props);
        this.componentDidMount =this.componentDidMount.bind(this);
        this.confirm = this.confirm.bind(this);
        this.updateLieu = this.updateLieu.bind(this);
        this.state = {
          currentRegion : {
            latitude: this.props.route.params.lieu.latitude,
            longitude: this.props.route.params.lieu.longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.0421,
          },
          marker: {
            coordinate: {
              latitude: this.props.route.params.lieu.latitude,
              longitude: this.props.route.params.lieu.longitude,
            }
          }
        };
    }

    //initialise location
    async componentDidMount(){

    }

    async updateLieu(){
        let token  = await AsyncStorage.getItem('token');
        let adresse = this.props.route.params.lieu.adresse;
        let rayon = this.props.route.params.lieu.rayon;
        let id = this.props.route.params.lieu.id;
        let data = {
            "adresse": adresse,
            "longitude": parseFloat(this.state.marker.coordinate.longitude),
            "latitude": parseFloat(this.state.marker.coordinate.latitude),
            "rayon" : rayon,
        };
        console.log(data)
        axios({
            method: 'put',
            url: Config.API_URL + 'lieux/'+ id,
            data : data,
            headers: {'Authorization': 'Bearer ' + token},
        })
            .then( response => {
                if(response.status != 204){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status);
                alert("Le lieu a bien été modifié");
                return response.status;
            })
            .catch((error) => {
                console.log(error.toString());
            })
    }

    onMapPress(e) {
      this.setState({
         marker:
         {
            coordinate: e.nativeEvent.coordinate,
         },
      });
    }

    onUserPinDragEnd(e){
      this.setState({
        marker:
        {
          coordinate: e.nativeEvent.coordinate,
        }
      });
    }

    confirm(){
      this.updateLieu()
      RootNavigation.navigate("Settings", {marker : this.state.marker, type : this.props.route.params.type}, )
      //this.props.route.params.setLocation(this.state.marker);
      //RootNavigation.goBack();
    }

    render() {
        console.log("Root navigation:" + JSON.stringify(this.props));
        console.log("Root navigation:" + typeof this.state.marker.coordinate.longitude);
        return(
          <View>
            <MapView
                style={styles.map}
                initialRegion={this.state.currentRegion}
                onPress={e => this.onMapPress(e)}
            >
            <Marker
              draggable
              key={this.state.marker.key}
              coordinate={this.state.marker.coordinate}
              onDragEnd={ e => this.onUserPinDragEnd(e)}
            >
            </Marker>
            </MapView>
            <View>
            <Button
              onPress={() => this.confirm()}
              title={"Valider"}
            />
            </View>
          </View>
        )
    }
}

const styles = StyleSheet.create({
    map: {
        width : wp('100%'),
        height: hp('70%'),
    }
});
