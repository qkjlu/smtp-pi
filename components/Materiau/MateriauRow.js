import React from 'react'
import {Text, View, AsyncStorage} from 'react-native'
import {Button} from "react-native-elements";
import style from "../../Style";
import {Icon} from "react-native-elements";

export default class MateriauRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            typeUser : ""
        }
    }

    render() {
        return (
            <View style = {style.worksite}>
                <View style={{flex : 6}}>
                    <Text style={{paddingTop:10}}> {this.props.materiau.nom} </Text>
                </View>
                <View style={{ flex: 2 }}>
                    <View style={{flexDirection:"row", flex :6}}>
                        <View style={style.button} >
                            <Button
                                icon={<Icon name='trash' type='font-awesome' color="red"/>}
                                onPress={() => { this.props.onDelete(this.props.materiau.id) }}
                                title=""
                                type="clear"
                                accessibilityLabel="suppression du lieu"
                            />
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}