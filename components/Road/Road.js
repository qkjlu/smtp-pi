import React from "react";
import style from "../../Style";
import axios from 'axios'
import {Text, ActivityIndicator, View, FlatList, ScrollView, AsyncStorage, Dimensions} from "react-native";
import {Button, Icon} from "react-native-elements";
import * as RootNavigation from "../../navigation/RootNavigation";
import ActivityStarter from "../../ActivityStarter";

export default class Road extends React.Component {
    constructor(props) {
        super(props);
    }

    startNavigation(){
        ActivityStarter.startRoad()
    }

    render() {
            return (
                    <ScrollView>
                        <View style = {style.worksite}>
                            <View style={{flex : 6}}>
                                <Text style={{paddingTop:10}}> Chargement -> Déchargement</Text>
                            </View>
                            <View style={{ flex: 6  }}>
                                <View style={{flexDirection:"row", flex :6}}>
                                    <View style={style.button} >
                                        <Button
                                            icon={<Icon name='road' type='font-awesome' color="green"/>}
                                            onPress={() => { RootNavigation.navigate('WorkSite', { worksite : this.props.worksite })}}
                                            title="aller"
                                            type="clear"
                                            accessibilityLabel="redirection vers la page du chantier"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style = {style.worksite}>
                            <View style={{flex : 6}}>
                                <Text style={{paddingTop:10}}>  Déchargement -> Chargement </Text>
                            </View>
                            <View style={{ flex: 6  }}>
                                <View style={{flexDirection:"row", flex :6}}>
                                    <View style={style.button}>
                                        <Button
                                            icon={<Icon name='road' type='font-awesome' color="red"/>}
                                            onPress={() => { RootNavigation.navigate('Road', { worksite : this.props.worksite })}}
                                            title="retour"
                                            type="clear"
                                            accessibilityLabel="redirection vers la page du chantier"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
            )
        }
}
