import React from 'react'
import {Text , TextInput, View, Button, Alert } from 'react-native'
import style from '../../Style'
export default class WorkSite extends React.Component {
    render() {
        return (
            <View style = {style.worksite}>
                <Text style = { style.title}> {this.props.name} </Text>
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