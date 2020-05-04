import React from "react";
import { Marker } from 'react-native-maps'
import {Text, View, StyleSheet} from "react-native";

export default class TruckMarker extends React.Component {
  constructor(props) {
      super(props);
  }


  render() {
    console.log("props:" + JSON.stringify(this.props))
    return(
      <Marker
        coordinate={{
          latitude: this.props.coords.coordinates.latitude,
          longitude: this.props.coords.coordinates.longitude,
        }}
        title={"marker test"}
        description={"marker description"}
      />
    );
  }

}
