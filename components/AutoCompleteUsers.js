import React from 'react';
import { StyleSheet, TouchableOpacity , Text, ScrollView , View} from 'react-native';
import Autocomplete from "react-native-autocomplete-input";
import UserPreview from "./UserPreview";
import Style from "../Style";
import axios from "axios";
export default class AutoCompleteUsers extends React.Component {

    constructor (props) {
        super(props)
        this.state = {
            query: '',
            showPreview :false,
            camionneurs : [],
            grutiers : [],
            item : null
        }
    }

    componentDidMount() {
        axios({
            method: 'get',
            url: 'https://smtp-pi.herokuapp.com/camionneurs',
        })
            .then( response => {
                if(response.status != 200){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status)
                this.setState({camionneurs: response.data});
                return response.status;
            })
            .catch(function (error) {
                alert(error)
                console.log(error);
            })
        axios({
            method: 'get',
            url: 'https://smtp-pi.herokuapp.com/grutiers',
        })
            .then( response => {
                if(response.status != 200){
                    console.log(response.status);
                    alert(response.status);
                    return response.status;
                }
                console.log(response.status)
                this.setState({grutiers: response.data});
                return response.status;
            })
            .catch(function (error) {
                alert(error)
                console.log(error);
            })
    }

    findUsers(query) {
        if (query === '') {
            return [];
        }
        const regex = new RegExp(`${query.trim()}`, 'i');
        // only get the good filtered type of users
        if(this.props.currentIndex === 0){
            return this.state.camionneurs.filter(user => user.prenom.search(regex) >= 0);
        }else{
            return this.state.grutiers.filter(user => user.prenom.search(regex) >= 0);
        }
    }

    render() {
        const { query } = this.state;
        const users = this.findUsers(query);
        const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
        const placeHolderName = "Prenom Nom";
        if(!this.state.showPreview){
            return (
                <Autocomplete
                    autoCapitalize="none"
                    autoCorrect={false}
                    data={users.length === 1 && comp(query, users[0].prenom) ? [] : users}
                    defaultValue={query}
                    onChangeText={text => this.setState({ query: text })}
                    placeholder={placeHolderName}
                    style={{ paddingHorizontal : 150 , backgroundColor: "#FFF" }}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() =>
                        {
                            this.setState({ query: item.prenom , item : item });
                            this.props.changePlace(item);
                            this.props.changeFirstField(item.nom);
                            this.props.changeSecondField(item.prenom);
                            this.setState({showPreview : true});
                        }
                        }>
                            <Text> {item.prenom +" "+ item.nom} </Text>
                        </TouchableOpacity>
                    )}
                />
            );
        }else{
            return (
                <UserPreview user={this.state.item}
                              unShowPreview={() => this.setState({showPreview:false})}
                              changePlace={() => this.props.changePlace(this.state.query)}
                              changeQuery={(query => this.setState({query}))}
                              changeItem={() => this.props.setState({item : null})}
                />
            );
        }
    }
}
const styles = StyleSheet.create({
    autocompleteContainer: {
        backgroundColor: '#ffffff',
        borderWidth: 0,
        marginTop : 30,
    },
});