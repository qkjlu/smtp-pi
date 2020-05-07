import React from 'react'
import {StyleSheet, TextInput, View, Text, TouchableOpacity, Alert} from 'react-native'
import style from "../../Style";
import {Button, Icon} from "react-native-elements"
export default class PlacePreview extends React.Component {

    render() {
            return (
                <View style={style.previewPlace}>

                    <Text style={style.getStartedText}> Lieu sélectionné :  {this.props.idPlace} </Text>

                    <View style={style.button}>
                        <Button
                            icon={<Icon name='trash' type='font-awesome' color="red"/>}
                            onPress={() => {
                                    this.props.unShowPreview();
                                    this.props.changePlace("");
                                    this.props.changeQuery("");
                                }
                            }
                            type="clear"
                            title=""
                        />
                    </View>
                </View>
            )
    }
}