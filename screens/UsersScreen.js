import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import {Text, View, ScrollView } from 'react-native';

export default function UsersScreen() {
    return (
        <ScrollView>
            <View>
                <Text> A toi de jouer michel</Text>
            </View>
        </ScrollView>
    );
}

UsersScreen.navigationOptions = {
    header: null,
};