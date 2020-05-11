import {View, Text} from "react-native";
import {Button} from "react-native-elements";
import ValidateButton from "./ValidateButton";
import * as React from "react";

export default class StopButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            oneButtonIsActivate : false,
        }
    }
    render() {
            if(!this.state.oneButtonIsActivate){
                return (
                    <View style={{flex: 1, flexDirection: "row", alignContent: "flex-end"}}>
                        <View style={{flex: 2}}>
                            <ValidateButton text={"Pause"}  onPress={ () => {
                                this.props.changeEtat("pause");
                                this.setState({oneButtonIsActivate : true})
                            }}/>
                        </View>
                        <View style={{flex: 2}}>
                            <ValidateButton text={"Problème"}  onPress={ () => {
                                this.props.changeEtat("probleme");
                                this.setState({oneButtonIsActivate : true})
                            }}/>
                        </View>
                        <View style={{flex: 2}}>
                            <ValidateButton text={"Urgence"}  onPress={ () => {
                                this.props.changeEtat("urgence");
                                this.setState({oneButtonIsActivate : true})
                            }}/>
                        </View>
                    </View>
                );
            }else{
                return(
                    <View style={{flexDirection:"row", justifyContent:"center", textAlign: 'center'}}>
                        <ValidateButton text={"Reprendre"}  onPress={ () => {
                            this.props.rollBack();
                            this.setState({oneButtonIsActivate : false})
                        }}/>
                    </View>
                );
            }
        }

}
