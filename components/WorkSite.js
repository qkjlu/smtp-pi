import React from 'react'
import {Text , TextInput, View, Button, Alert } from 'react-native'
import style from '../Style'
export default class WorkSite extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name : "Chantier1",
            circuitToDump : "url",
            circuitToLoad : "url",
            truckDriver : [],
            craneDriver : []
        }
    }
    render() {
        return (
            <View style = {style.worksite}>
                <Text> {this.state.name} </Text>
                <View style={style.button} >
                    <Button
                        color = 'green'
                        onPress={() => Alert.alert("woow")}
                        title="go"
                        accessibilityLabel="Learn more about this purple button"
                    />
                </View>

            </View>
        )
    }
}