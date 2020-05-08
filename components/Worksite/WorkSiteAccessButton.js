import {AsyncStorage, View} from "react-native";
import style from "../../Style";
import React from "react";
import * as RootNavigation from '../../navigation/RootNavigation.js';
import { Icon, Button } from 'react-native-elements'

export default class WorkSiteAccessButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            typeUser : ""
        }
    }

    componentDidMount() {
        this.getUser().then( res => this.setState({typeUser : res }))
    }

    AdminAccess() {
        return (
            <View style={{flexDirection:"row", flex :6}}>
                <View style={style.button} >
                    <Button
                        icon={<Icon name='map' type='font-awesome' color="green"/>}
                        onPress={() => { RootNavigation.navigate('WorkSite', { worksite : this.props.worksite })}}
                        title=""
                        type="clear"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
                <View style={style.button} >
                    <Button
                        icon={<Icon name='trash' type='font-awesome' color="red"/>}
                        onPress={() => { this.props.onDelete(this.props.worksite.id) }}
                        title=""
                        type="clear"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
            </View>
        )
    }

    TruckAccess() {
        return (
            <View style={{flexDirection:"row", flex :6}}>
                <View style={style.button} >
                    <Button
                        color = 'blue'
                        onPress={() => { RootNavigation.navigate('TruckView', { worksite : this.props.worksite })}}
                        title="Go"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
            </View>
        )
    }

    CraneAccess() {
        return (
            <View style={{ flex : 1}}>
                <View style={style.button} >
                    <Button
                        color = 'orange'
                        onPress={() => { RootNavigation.navigate('CraneView', { worksite : this.props.worksite })}}
                        title="Go"
                        accessibilityLabel="redirection vers la page du chantier"
                    />
                </View>
            </View>
        )
    }
    async getUser(){
        const typeUser = await AsyncStorage.getItem('typeUser');
        console.log(typeUser);
        return typeUser
    }

    render() {
        if (this.state.typeUser === "admin") {
            return this.AdminAccess();
        }else if (this.state.typeUser === "crane"){
            return this.CraneAccess()
        }else if (this.state.typeUser === "truck"){
            return this.TruckAccess()
        }else {
            return null
        }
    }
}
