import React from 'react';
import { StyleSheet, TouchableOpacity , Text, ScrollView , View} from 'react-native';
import Autocomplete from "react-native-autocomplete-input";
import PlacePreview from "../Place/PlacePreview";
export default class AutoCompleteMateriaux extends React.Component {

    constructor (props) {
        super(props)
        this.state = {
            query: '',
            showPreview :false,
        }
    }

    findPlace(query) {
        if (query === '') {
            return [];
        }
        const { places } = this.props.materiaux;
        const regex = new RegExp(`${query.trim()}`, 'i');
        return this.props.materiaux.filter(place => place.nom.search(regex) >= 0);
    }

    render() {
        const { query } = this.state;
        const places = this.findPlace(query);
        const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
        const placeHolderName = " type du materiau";
        if(!this.state.showPreview){
            return (
                <ScrollView>
                    <Autocomplete
                        autoCapitalize="none"
                        autoCorrect={false}
                        data={places.length === 1 && comp(query, places[0].nom) ? [] : places}
                        defaultValue={query}
                        onChangeText={text => this.setState({ query: text })}
                        placeholder={placeHolderName}
                        containerStyle={styles.autocompleteContainer}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() =>
                            {
                                this.setState({ query: item.nom });
                                this.props.changeMateriau(item.id);
                                this.setState({showPreview : true});
                            }
                            }>
                                <Text> { item.nom } </Text>
                            </TouchableOpacity>
                        )}
                    />
                </ScrollView>
            );
        }else{
            return (
                <PlacePreview idPlace={this.state.query}
                              unShowPreview={() => this.setState({showPreview:false})}
                              changePlace={(idPlace) => this.props.changeMateriau({idPlace})}
                              changeQuery={(query => this.setState({query}))}
                />
            );
        }
    }
}
const styles = StyleSheet.create({
    autocompleteContainer: {
        borderWidth: 0,
    },
});