import React from "react";
import Style from "../../Style";
import axios from 'axios'
import {Text, ActivityIndicator, View, FlatList, ListView, ScrollView} from "react-native";
import WorkSite from "./WorkSite";
export default class ListWorkSite extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: null
        };
    }

    componentDidMount() {
        axios.get('https://smtp-pi.herokuapp.com/chantiers')
            .then((response) =>{
                this.setState({report : response.data})
            })
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        if (this.state.report === null) {
            return (<ActivityIndicator color="red" size="large"/>)
        } else {
            return (
                    <View>
                        <FlatList
                            data={this.state.report}
                            renderItem={({item}) =>
                                <View>
                                    <WorkSite name={`${item.nom}`}/>
                                </View>
                            }
                        />
                    </View>
            )
        }
    }
}