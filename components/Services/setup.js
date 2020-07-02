/*
Class to check if the app is updated and have all permissions
*/

import axios from 'axios';
import VersionCheck from 'react-native-version-check';
import Config from "react-native-config";
import {AsyncStorage,Alert,BackHandler,Linking} from 'react-native';


export default class Setup{
  constructor() {
  }


  async initSetup(){
    this.checkUpdate()
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
        console.log(response.status);
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
      if(v1[i] > v2[i]){
        updateNeeded = true;
      }
    }
    return updateNeeded;
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
}
