import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import {Text, View, ScrollView } from 'react-native';
import UserList from "../components/User/UserList";
import UpdateUser from "../components/User/UpdateUser";
import AddUser from "../components/User/AddUser";
import style from "../Style";


export default function UsersScreen() {
    return (
        <ScrollView>
            <View>
                <UpdateUser />
            </View>
        </ScrollView>
    );
}

UsersScreen.navigationOptions = {
    header: null,
};
