/*
Class to check if the app is updated and have all permissions (location an internet enabled)
*/

import axios from 'axios';
import VersionCheck from 'react-native-version-check';
import Config from "react-native-config";
import {AsyncStorage,Alert,BackHandler,Linking} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import RNExitApp from 'react-native-exit-app';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';

export default class Setup{
  constructor() {
  }


  async initSetup(){
    await this.internetCheck();
    await this.checkUpdate();
    await this.requestLocationPermission();
  }

  // request for get the latest version of the app by type
  // type is "beta" or "production"
  async getLatestVersion(type){
    //let url = "http://192.168.56.1:3000/versions/type/" + type
    let url = Config.API_URL + 'versions/type/' + type;
    return await axios({
      method : 'get',
      url : url,
    })
    .then( response => {
        if(response.status != 200){
          alert(response.status);
          return response.status;
        }
        console.log("Setup | getLatestVersion : " + response.status);
        return response.data;
      })
      .catch(function (error) {
        alert(error)
        console.log(error);
      });
  }

  async compareVersion(v1,v2){
    var updateNeeded = false
    for (var i = 0; i < v1.length; i++) {
      let numb1 = parseInt(v1[i]);
      let numb2 = parseInt(v2[i]);
      if(numb1 > numb2){
        updateNeeded = true;
      }
    }
    return updateNeeded;
  }

  async getCurrentVersion(){
    let currentVersion = await VersionCheck.getCurrentVersion();
    return currentVersion;
  }

  // check if the current version of app is the latest.
  async checkUpdate(){
    try{

      // get and split request version
      let query = await this.getLatestVersion(Config.VERSION);
      let serverVersion = query.numero;
      let currentVersion = await VersionCheck.getCurrentVersion();
      const splitedServerVersion = serverVersion.split('.');
      const splitedCurrentVersion = currentVersion.split('.');
      var updateNeeded = await this.compareVersion(splitedServerVersion,splitedCurrentVersion);

      // print alert if update is required
      if(updateNeeded){
        Alert.alert(
          'Vérification',
          'Votre application n\'est pas a jour. ',
          [
            {
              text: 'Mettre a jour',
              onPress: () => {
                BackHandler.exitApp();
                Linking.openURL('https://play.google.com/store/apps/details?id=com.smtp.smtp&hl=fr')
              }
            },
          ],
          { cancelable: false }
        );
      }

    }catch (error){
      console.log(error);
    }
  }

  // Check if we have acces to internet
  async internetCheck(){
    NetInfo.fetch().then(state => {
      if (state.type === 'cellular' || state.type === 'wifi') {
        axios({
          method: 'get',
          url: Config.API_URL + 'entreprises',
          timeout: 10000,
        })
          .then( response => {
            console.log("Setup | internetCheck : internet check passed !");
            }
          ).catch(function (error) {
            alert("Erreur réseau ! Vérifier que les données mobiles sont activées");
          });
      }else{
        alert("Erreur réseau ! Vérifier que les données mobiles sont activées");
      }
    }).catch(function (error){
      alert("error")
    });
  }

  async accesLocation(){
    let acces = false;
    while (!acces){
      await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
      .then(data => {
        console.log("Setup | accesLocation : " + data);
        acces = true
      }).catch(err => {
        console.log("Setup | accesLocation : error " + err)
      });
    }
  }

  // ask location to GPS and get current position if granted
  async requestLocationPermission() {
    let permission = false;
      try {
          let {granted} = await Permissions.askAsync(Permissions.LOCATION);
          if (granted) {
              console.log("Setup | requestLocationPermission : permission to location granted");
              permission = true;
              acces = await this.accesLocation();
          } else {
            console.log(" Setup | requestLocationPermission : Location permission denied");
            // print alert not cancelable
            Alert.alert(
                'Autorisation',
                "Veuillez modifier les paramètres pour autoriser l'application à accéder à la position ou relancer l'application",
                [
                  {
                    text: 'Quitter',
                    onPress: () => {
                      RNExitApp.exitApp();
                    },
                  },
                ],
                { cancelable: false },
              );
          }
      } catch (err) {
          console.log(" Setup | requestLocationPermission : error "+err)
      }
  }
}
