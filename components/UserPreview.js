import React from 'react'
import {View, Text} from 'react-native'
import style from "../Style";
import {Button, Icon} from "react-native-elements"
export default class UserPreview extends React.Component {

    render() {
        return (
            <View style={style.previewPlace}>
                <Text style={style.previewText}> {" "+this.props.user.prenom+" "+this.props.user.nom} </Text>
                <View style={style.button}>
                    <Button
                        icon={<Icon name='trash' type='font-awesome' color="red"/>}
                        onPress={() => {
                            this.props.unShowPreview();
                            this.props.changePlace("");
                            this.props.changeQuery("");
                            this.props.changeItem()
                        }
                        }
                        type="clear"
                        title=""
                    />
                </View>
            </View>
        )
    }
}