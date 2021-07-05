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

export default class AddGPSLocation extends React.Component {
    constructor(props) {
        super(props);
        this.componentDidMount =this.componentDidMount.bind(this);
        this.confirm = this.confirm.bind(this);
        this.state = {
          currentRegion : {
            latitude: this.props.route.params.latitude,
            longitude: this.props.route.params.longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.0421,
          },
          marker: {
            coordinate: {
              latitude: this.props.route.params.latitude,
              longitude: this.props.route.params.longitude,
            }
          }
        };
    }

    //initialise location
    async componentDidMount(){

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
      //this.props.navigation.goBack();
      RootNavigation.navigate("AddPlace", {marker : this.state.marker} )
      //this.props.route.params.setLocation(this.state.marker);
      //RootNavigation.goBack();
    }

    render() {
        console.log("Root navigation:" + JSON.stringify(this.props));
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
