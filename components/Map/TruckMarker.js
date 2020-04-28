import React from "react";
import { Marker } from 'react-native-maps'
import {Text, View, StyleSheet} from "react-native";
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export default class TruckMarker extends React.Component {
  constructor(props) {
      super(props);
      this.watchLocation = this.watchLocation.bind(this);
      this.state = {
        latitude: 43.8333,
        longitude : 4.35
      };
  }

  componentDidMount(){
    //this.requestLocationPermission();
    this.watchLocation();
  }

  async requestLocationPermission() {
    try {
      let {granted} = await Permissions.askAsync(Permissions.LOCATION);
      if (granted === "granted") {
        console.log("You can use locations ");
        this.watchLocation();
      } else {
        console.log("Location permission denied")
      }
    } catch (err) {
      console.log(err)
    }
  }

  async componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  watchLocation(){
    console.log("enter location")
    this.watchID = Location.watchPositionAsync(
      // option
      {
        accuracy: Location.Accuracy.Highest
      },
      position => {
        let { coords } = position;

        this.setState({
          latitude : coords.latitude,
          longitude : coords.longitude
        });
      },

      error => console.log(error)
    )

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
