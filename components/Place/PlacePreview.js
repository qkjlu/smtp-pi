import React from 'react'
import {StyleSheet, TextInput, View, Text, TouchableOpacity, Button, Alert} from 'react-native'
import style from "../../Style";
export default class PlacePreview extends React.Component {

    render() {
            return (
                <View style={style.previewPlace}>
                    <Text style={style.title}>  {this.props.idPlace} </Text>
                    <View style={style.button}>
                        <Button
                            color='red'
                            onPress={() => {
                                    this.props.showPreview(false);
                                    this.props.changePlace("");
                                    this.props.changeQuery("");
                                }
                            }
                            title="x"
                        />
                    </View>
                </View>
            )
    }
}