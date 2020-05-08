import * as React from 'react';
import {Text, View, StyleSheet } from 'react-native';
import style from '../../Style'

export default function TruckView({navigation, route}) {

    return (
        <View style={styles.contain}>
            <Text style={styles.text}> Vous êtes à 5 minutes du prochain camion </Text>
        </View>
    );
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