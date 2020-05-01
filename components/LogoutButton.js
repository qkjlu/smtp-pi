import React from "react";
import { Button} from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';
import * as RootNavigation from '../navigation/RootNavigation.js';
export default function LogoutButton({navigation, route}) {
    return (
        <Button
            icon = {
                <Icon
                    name="power-off"
                    type='font-awesome'
                    size={25}
                    color="red"
                />
            }
            type={"clear"}
            title="      "
            onPress={() => RootNavigation.navigate("Login")}
        />
    );
}