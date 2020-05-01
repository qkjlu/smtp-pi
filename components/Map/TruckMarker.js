import React from "react";
import { Marker } from 'react-native-maps'
import {Text, View, StyleSheet} from "react-native";

export default class TruckMarker extends React.Component {
  constructor(props) {
      super(props);
  }


  render() {
    return(
      <Marker
        coordinate={{
          latitude: this.props.coords.latitude,
          longitude: this.props.coords.longitude,
        }}
        title={"marker test"}
        description={"marker description"}
      />
    );
  }

}
