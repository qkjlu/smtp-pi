import {AsyncStorage} from "react-native";
import Config from "react-native-config";
import axios from "axios";

module.exports =  async function(lieuID){
    const token = await AsyncStorage.getItem('token');
    let url = Config.API_URL+ "lieux/" + lieuID;
    return await axios({
        method : 'get',
        url : url,
        headers: {'Authorization': 'Bearer ' + token},
    })
        .then( response => {
            if(response.status != 200){
                alert(response.status);
                return response.status;
            }
            console.log(response.status);
            return response.data;
        })
        .catch(function (error) {
            alert(error)
            console.log(error);
        });
}

export async function getChantiers() {
    const token = await AsyncStorage.getItem('token');
    let url = Config.API_URL+ "chantiers";
    return await axios({
        method : 'get',
        url : url,
        headers: {'Authorization': 'Bearer ' + token},
    })
        .then( response => {
            if(response.status != 200){
                alert(response.status);
                return response.status;
            }
            console.log(response.status);
            return response.data;
        })
        .catch(function (error) {
            alert(error)
            console.log(error);
        });
}

export async function getChantier(chantierId){
    const token = await AsyncStorage.getItem('token');
    let url = Config.API_URL+ "chantiers/"+ chantierId;
    await axios({
        method : 'get',
        url : url,
        headers: {'Authorization': 'Bearer ' + token},
    })
        .then( response => {
            if(response.status !== 200){
                alert(response.status);
                return response.status;
            }
            console.log(response.status);
            return response.data;
        })
        .catch(function (error) {
            alert(error)
            console.log(error);
        });
}

export async function getCamionneur(camionneurId){
    const token = await AsyncStorage.getItem('token');
    let url = Config.API_URL+ "camionneurs/"+ camionneurId;
    await axios({
        method : 'get',
        url : url,
        headers: {'Authorization': 'Bearer ' + token},
    })
        .then( response => {
            if(response.status !== 200){
                alert(response.status);
                return response.status;
            }
            console.log(response.status);
            return response.data;
        })
        .catch(function (error) {
            alert(error)
            console.log(error);
        });
}