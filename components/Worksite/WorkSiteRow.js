import React from 'react'
import {Text , TextInput, View, Button, Alert } from 'react-native'
import style from "../../Style";
import axios from 'axios'

export default class WorkSiteRow extends React.Component {
    deleteWorkSite(){
        axios({
            method : 'delete',
            url :'https://smtp-pi.herokuapp.com/chantiers/'+this.props.worksite.id,
            headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI'}
        })
            .then( response => {
                if(response.status != 200){
                    console.log(response.status);
                }
                console.log(response.status);
            })
            .catch((error) => {
                console.log(error);
            })
}

    render() {
        return (
            <View style = {style.worksite}>
                <View style={{flex : 6}}>
                <Text> {this.props.worksite.nom} </Text>
                </View>
                <View style={style.button} >
                    <Button
                        color = 'green'
                        onPress={() => { this.props.navigation.navigate('WorkSite', { worksite : this.props.worksite })}}
                        title="go"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
                <View style={style.button} >
                    <Button
                        color = 'red'
                        onPress={() => { this.deleteWorkSite(this.props.worksite.id)}}
                        title="x"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
            </View>
        )
    }
}