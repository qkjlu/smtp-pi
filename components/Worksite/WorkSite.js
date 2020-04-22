import React from 'react'
import {Text , TextInput, View, Button, Alert } from 'react-native'
import style from '../../Style'

export default class WorkSite extends React.Component {
    render() {
        return (
            <View style = {style.worksite}>
                <Text> {this.props.worksite.nom} </Text>
                <View style={style.button} >
                    <Button
                        color = 'green'
                        onPress={() => { this.props.navigation.navigate('WorkSite', { worksite : this.props.worksite })}}
                        title="go"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
            </View>
        )
    }
}