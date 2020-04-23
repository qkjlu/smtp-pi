import React from 'react'
import {View} from 'react-native'
import {ButtonGroup} from "react-native-elements";
export default class TrucksWorkSite extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: null
        };
        this.updateIndex = this.updateIndex.bind(this)
    }

    updateIndex (selectedIndex) {
        if(selectedIndex == this.state.selectedIndex){
            this.setState({selectedIndex : null})
        }else{
            this.setState({selectedIndex})
        }
    }


    render () {
        const buttons = ['Chargés', 'Déchargés', 'Pause'];
        const { selectedIndex } = this.state;

        return (
            <View>
                <ButtonGroup
                    onPress={this.updateIndex}
                    selectedIndex={selectedIndex}
                    buttons={buttons}
                    containerStyle={{height: 30}}
                />
            </View>

        )
    }
}