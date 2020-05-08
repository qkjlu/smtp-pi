import React from 'react'
import {Text, TextInput, View, Button, Alert, AsyncStorage} from 'react-native'
import style from "../../Style";
import axios from 'axios'
import WorkSiteAccessButton from "./WorkSiteAccessButton";

export default class WorkSiteRow extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style = {style.worksite}>
                <View style={{flex : 6}}>
                    <Text style={{paddingTop:10}}> {this.props.worksite.nom} </Text>
                </View>
                <View style={{ flex: 2  }}>
                    <WorkSiteAccessButton  worksite={this.props.worksite} onDelete={(id) => this.props.onDelete(id)}/>
                </View>
            </View>
        )
    }
}

