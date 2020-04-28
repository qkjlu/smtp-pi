import {Button, View} from "react-native";
import style from "../Style";
import React from "react";

export default class extends React.Component {
    constructor(props) {
        super(props);
    }
    AdminAccess() {
        return (
            <View>
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

    TruckAccess() {
        return (
            <View style={style.button} >
                <Button
                    color = 'blue'
                    onPress={() => { this.props.navigation.navigate('TruckView', { worksite : this.props.worksite })}}
                    title="connexion"
                    accessibilityLabel="redirection vers la page du chantier"
                />
            </View>
        )
    }

    CraneAccess() {
        return (
            <View style={style.button} >
                <Button
                    color = 'orange'
                    onPress={() => { this.props.navigation.navigate('CraneView', { worksite : this.props.worksite })}}
                    title="connexion"
                    accessibilityLabel="redirection vers la page du chantier"
                />
            </View>
        )
    }

    render() {
        if (this.props.loggedIn === "admin") {
            return this.AdminAccess();
        }else if (this.props.loggedIn === "crane"){
            return this.CraneAccess()
        }else if (this.props.loggedIn === "truck"){
            return this.TruckAccess()
        }
    }
}
