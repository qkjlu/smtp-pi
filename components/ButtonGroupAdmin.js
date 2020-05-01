import React from 'react'
import {AsyncStorage, View} from 'react-native'
import {ButtonGroup} from "react-native-elements";
import ButtonAdminSelected from "./ButtonAdminSelected";

export default class ButtonGroupAdmin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: null,
            typeUser : ""
        };
        this.updateIndex = this.updateIndex.bind(this)
    }

    componentDidMount() {
        this.getUser().then( res => this.setState({typeUser : res }))
    }

    async getUser(){
        const typeUser = await AsyncStorage.getItem('typeUser');
        return typeUser;
    }
    updateIndex (selectedIndex) {
        if(selectedIndex == this.state.selectedIndex){
            this.setState({selectedIndex : null})
        }else{
            this.setState({selectedIndex})
        }
    }



    render () {
        const buttons = ['Ajouter Chantier', 'Ajouter Utilisateur', 'Ajouter Entreprise'];
        const { selectedIndex } = this.state;

        if(this.state.typeUser !== "admin"){
            return null
        }else{
            return (
                <View>
                    <ButtonGroup
                        onPress={this.updateIndex}
                        selectedIndex={selectedIndex}
                        buttons={buttons}
                        containerStyle={{height: 100}}
                    />
                    <ButtonAdminSelected index={this.state.selectedIndex}/>
                </View>
            )
        }
    }
}