import React from "react";
import style from "../../Style";
import axios from 'axios'
import {Text, ActivityIndicator, View, FlatList, ScrollView, AsyncStorage, Dimensions} from "react-native";
import {Button, Icon} from "react-native-elements";
import * as RootNavigation from "../../navigation/RootNavigation";
import ActivityStarter from "../../ActivityStarter";
import InputText from "../InputText";

export default class Road extends React.Component {
    constructor(props) {
        super(props);
        this.worksite = this.props.route.params.worksite;
    }

    render() {
            return (
                    <ScrollView>
                        <View style = {style.worksite}>
                            <View style={{flex : 8}}>
                                <Text style={{paddingTop:10}}> Chargement -> Déchargement</Text>
                            </View>
                            <View style={{ flex: 4  }}>
                                <View style={{flexDirection:"row", flex :6}}>
                                    <View style={style.button} >
                                        <Button
                                            icon={<Icon name='road' type='font-awesome' color="green"/>}
                                            onPress={async () => {
                                                ActivityStarter.editRoad(
                                                    this.worksite.id,
                                                    "aller",
                                                    this.worksite.nom,
                                                    await AsyncStorage.getItem('token'))
                                            }}
                                            title="aller"
                                            type="clear"
                                            accessibilityLabel="redirection vers la page du chantier"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style = {style.semaines}>
                            <Text style={style.jours}> coefficient : </Text>
                            <Text style={style.jours}>  Lundi : 1.25 </Text>
                            <Text style={style.jours}> Mardi : 1.25 </Text>
                            <Text style={style.jours}> Mercredi : 1.25 </Text>
                            <Text style={style.jours}> Jeudi : 1.25 </Text>
                            <Text style={style.jours}> Vendredi : 1.25 </Text>
                            <Text style={style.jours}> VALIDER  </Text>
                        </View>
                        <View style = {style.worksite}>
                            <View style={{flex : 8}}>
                                <Text style={{paddingTop:10}}>  Déchargement -> Chargement </Text>
                            </View>
                            <View style={{ flex: 4  }}>
                                <View style={{flexDirection:"row", flex :6}}>
                                    <View style={style.button}>
                                        <Button
                                            icon={<Icon name='road' type='font-awesome' color="red"/>}
                                            onPress={async () => { 
                                                ActivityStarter.editRoad(
                                                    this.worksite.id,
                                                    "retour", 
                                                    this.worksite.nom,
                                                    await AsyncStorage.getItem('token'))
                                                }}
                                            title="retour"
                                            type="clear"
                                            accessibilityLabel="redirection vers la page du chantier"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style = {style.semaines}>
                            <Text style={style.jours}> coefficient : </Text>
                            <Text style={style.jours}> Lundi : 1.25 </Text>
                            <Text style={style.jours}> Mardi : 1.25 </Text>
                            <Text style={style.jours}> Mercredi : 1.25 </Text>
                            <Text style={style.jours}> Jeudi : 1.25 </Text>
                            <Text style={style.jours}> Vendredi : 1.25 </Text>
                            <Text style={style.jours}> VALIDER  </Text>
                        </View>
                    </ScrollView>
            )
        }
}
