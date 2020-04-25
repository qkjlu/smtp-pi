import React from "react";
import style from "../../Style";
import axios from 'axios'
import {Text, ActivityIndicator, View, FlatList, ListView, ScrollView} from "react-native";
import WorkSiteRow from "./WorkSiteRow";
import ButtonGroupAdmin from "../ButtonGroupAdmin";
import Search from "../Search";

export default class ListWorkSite extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report: null
        };
    }

    componentDidMount() {
        axios({
            method : 'get',
            url :'https://smtp-pi.herokuapp.com/chantiers',
            headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI'}
            })
            .then( response => {
                if(response.status != 200){
                console.log(response.status);
                alert(response.status);
                return response.status;
                }
                console.log(response.status);
                this.setState({report : response.data});
                return response.status;
                })
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        if (this.state.report === null) {
            return (
                <View>
                    <ActivityIndicator color="red" size="large"/>
                </View>
        )
        } else {
            return (
                <View>
                    <ButtonGroupAdmin/>
                    <Text style={style.getStartedText}>Liste des chantier:</Text>
                    <Search/>
                    <ScrollView>
                        <FlatList
                            data={this.state.report}
                            renderItem={({item}) =>
                                <View>
                                    <WorkSiteRow worksite={item} navigation={this.props.navigation}/>
                                </View>
                            }
                        />
                    </ScrollView>
                </View>
            )
        }
    }
}
