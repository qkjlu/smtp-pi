import React from "react";
import { Marker } from 'react-native-maps'
import {Text, View, StyleSheet} from "react-native";
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export default class TruckMarker extends React.Component {
  constructor(props) {
      super(props);
      this.handleCoordinates = this.handleCoordinates.bind(this);
      this.state = {
        latitude: 43.8333,
        longitude : 4.35
      };
  }

  componentDidMount(){
    console.log("enter here")
    this.props.socket.listenCoordinates(this.handleCoordinates);
  }

  handleCoordinates(data){
    console.log(data)
    this.setState({
      latitude : data.coordinates.coordinates.latitude,
      longitude : data.coordinates.coordinates.longitude
    });
  }


  render() {
    return(
      <Marker
        coordinate={{
          latitude: this.state.latitude,
          longitude: this.state.longitude,
        }}
        title={"marker test"}
        description={"marker description"}
      />
    );
  }

}
