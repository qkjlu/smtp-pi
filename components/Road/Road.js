import React from "react";
import style from "../../Style";
import {Text, View, ScrollView, AsyncStorage, ActivityIndicator, TextInput, StyleSheet} from "react-native";
import {Badge, Button, Icon} from "react-native-elements";
import ActivityStarter from "../../ActivityStarter";
let func = require('../globalHelper/axios');
import CoefForm from './CoefForm';

export default class Road extends React.Component {
    constructor(props) {
        super(props);
        this.worksite = this.props.route.params.worksite;
        this.state = {
            chargement :null,
            dechargement : null
        }
    }

    async componentDidMount() {
        this.setState({chargement : await func(this.worksite.lieuChargementId)})
        this.setState({dechargement : await func(this.worksite.lieuDéchargementId)})
    }

    render() {
            if (this.state.chargement == null || this.state.dechargement == null){
                return (<ActivityIndicator color="red" size="large"/>);
            }else {
                const hasRouteAller = this.worksite.allerId !== null
                const hasRouteRetour = this.worksite.retourId !== null
                const success = <Badge status="success" containerStyle={{position: 'absolute', top: 2, right: 1}}/>
                const error = <Badge status="error" containerStyle={{position: 'absolute', top: 2, right: 1}}/>
                return (
                    <ScrollView>
                        <View style={style.worksite}>
                            <View style={{flex: 8}}>
                                <Text style={{paddingTop: 10}}> Chargement -> Déchargement</Text>
                            </View>
                            <View style={{flex: 4}}>
                                <View style={{flexDirection: "row", flex: 6}}>
                                    <View style={style.button}>
                                        <Button
                                            icon={<Icon name='road' type='font-awesome' color="green"/>}
                                            onPress={async () => {
                                                ActivityStarter.editRoad(
                                                    this.worksite.id,
                                                    "aller",
                                                    this.worksite.nom,
                                                    await AsyncStorage.getItem('token'),
                                                    [this.state.chargement.longitude, this.state.chargement.latitude],
                                                    [this.state.dechargement.longitude, this.state.dechargement.latitude]
                                                )
                                            }}
                                            title="aller"
                                            type="clear"
                                            accessibilityLabel="redirection vers la page du chantier"
                                        />
                                        {hasRouteAller ? success : error}
                                    </View>
                                </View>
                            </View>
                        </View>
                        <CoefForm chantier={this.worksite.id} type="aller"/>
                        <View style={style.worksite}>
                            <View style={{flex: 8}}>
                                <Text style={{paddingTop: 10}}> Déchargement -> Chargement </Text>
                            </View>
                            <View style={{flex: 4}}>
                                <View style={{flexDirection: "row", flex: 6}}>
                                    <View style={style.button}>
                                        <Button
                                            icon={<Icon name='road' type='font-awesome' color="red"/>}
                                            onPress={async () => {
                                                ActivityStarter.editRoad(
                                                    this.worksite.id,
                                                    "retour",
                                                    this.worksite.nom,
                                                    await AsyncStorage.getItem('token'),
                                                    [this.state.chargement.longitude, this.state.chargement.latitude],
                                                    [this.state.dechargement.longitude, this.state.dechargement.latitude]
                                                )
                                            }}
                                            title="retour"
                                            type="clear"
                                            accessibilityLabel="redirection vers la page du chantier"
                                        />
                                        {hasRouteRetour ? success : error}
                                    </View>
                                </View>
                            </View>
                        </View>
                        <CoefForm chantier={this.worksite.id} type="retour"/>
                    </ScrollView>
                )
            }
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coef : {
    flex: 1,
  }
});
