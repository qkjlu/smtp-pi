import * as React from 'react';
import {Text, View, StyleSheet } from 'react-native';
import style from '../../Style'

export default class TruckView extends React.Component{

    constructor(props) {
        super(props);
    }

    getTimeBetween(){
        var time = null;
        for (const user of this.props.users){
            if (user.etat === this.props.etat && user.ETA < this.props.ETA){
                if(time === null || time >= Math.abs(user.ETA - this.props.ETA) ){
                    time = Math.abs(user.ETA - this.props.ETA)
                }
            }
        }
        if(time === null){
            // pas de camion devant lui donc on renvoie l'ETA
            console.log("pas de camion devant lui donc on renvoie ETA")
            time = this.props.ETA
        }
        return time
    }

    render() {
        return (
            <View style={styles.contain}>
                <Text style={styles.text}> à {this.getTimeBetween()} minutes du camion devant </Text>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    text: {
        fontWeight: 'bold',
        fontSize: 20,
        paddingTop : 15,
    },
    contain: {
        alignItems : 'center',
        backgroundColor : '#FFF',
        borderWidth: 1,
        height : 60,
    }
});