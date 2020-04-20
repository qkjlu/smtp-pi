import React from 'react';
import { StyleSheet, TouchableOpacity , Text} from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import Autocomplete from "react-native-autocomplete-input";
import PlacePreview from "./PlacePreview";
export default class AutoCompletePlaces extends React.Component {

    constructor (props) {
        super(props)
        this.state = {
            query: '',
            places : [],
            showPreview :false
        }
    }

    componentDidMount() {
        axios.get('https://smtp-pi.herokuapp.com/lieux')
            .then((response) =>{
                this.setState({places : response.data})
            })
            .catch((error) => {
                console.log(error);
            })
    }

    findPlace(query) {
        if (query === '') {
            return [];
        }
        const { places } = this.state;
        const regex = new RegExp(`${query.trim()}`, 'i');
        return places.filter(place => place.adresse.search(regex) >= 0);
    }

    render() {
        const { query } = this.state;
        const places = this.findPlace(query);
        const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
        const placeHolderName = "addresse du lieu de "+ this.props.name;
        if(!this.state.showPreview){
            return (
                <Autocomplete
                    autoCapitalize="none"
                    autoCorrect={false}
                    data={places.length === 1 && comp(query, places[0].adresse) ? [] : places}
                    defaultValue={query}
                    onChangeText={text => this.setState({ query: text })}
                    placeholder={placeHolderName}
                    containerStyle={styles.autocompleteContainer}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() =>
                        {
                            this.setState({ query: item.adresse });
                            this.props.changePlace(item.id);
                            this.setState({showPreview : true})
                        }
                        }>
                            <Text>
                                {item.adresse}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            );
        }else{
            return (
                <PlacePreview idPlace={this.state.query}
                              showPreview={(showPreview) => this.setState({showPreview})}
                              changePlace={(idPlace) => this.props.changePlace({idPlace})}
                              changeQuery={(query => this.setState({query}))}
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