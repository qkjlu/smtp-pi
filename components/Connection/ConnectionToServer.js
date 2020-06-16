import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import io from "socket.io-client";
import Config from "react-native-config";

export default class ConnectionToServer{
  constructor() {

      //bind function
      this.watchLocation = this.watchLocation.bind(this);
      this.connectToServer = this.connectToServer.bind(this);
      this.initConnection = this.initConnection.bind(this);
      this.connectToServer = this.connectToServer.bind(this);
      this.listenConnection = this.listenConnection.bind(this);
      this.listenCoordinates = this.listenCoordinates.bind(this);
      this.submitPosition = this.submitPosition.bind(this);
      this.requestLocationPermission = this.requestLocationPermission.bind(this);
      this.socket = io(Config.API_URL);
  }

  async initConnection(userId,chantierId){
    await this.connectToServer(userId,chantierId);
    //this.requestLocationPermission();
    this.watchLocation();
  }

  connectToServer(userId,chantierId){
    this.socket.emit("chantier/connect", {
          "userId" : userId,
          "chantierId" : chantierId,
          "coordinates": {
            "longitude": 43.8333,
            "latitude": 4.35
          }
    });
    console.log("socket demand send")
  }

  // listen user who connect
  // append callback
  listenConnection(callback){
    this.socket.on("chantier/user/connected", function (data) {
      callback(data);
    });
    console.log("listen connection enabled")
  }

  //listenCoordinates
  listenCoordinates(callback){
    this.socket.on("chantier/user/sentCoordinates", function (data) {
      callback(data);
    });
    console.log("listen connection coordinate enabled")
  }

  submitPosition(coords){
    this.socket.emit("chantier/sendCoordinates", coords);
    console.log(coords + " sended")
  }

  async requestLocationPermission() {
    try {
      let {granted} = await Permissions.askAsync(Permissions.LOCATION);
      if (granted == "granted") {
        this.watchLocation();
      } else {
        console.log("Location permission denied")
      }
    } catch (err) {
      console.log(err)
    }
  }


  // plus besoin de set les states
  watchLocation(){
    console.log("enter location")
    this.watchID = Location.watchPositionAsync(
      // option
      {
        accuracy: Location.Accuracy.Highest,
      },
      position => {
        let { coords } = position;

        let toSubmit = {
              "longitude": coords.longitude,
              "latitude" : coords.latitude
            }

        this.submitPosition(toSubmit);

      },
      error => console.log(error)
    )

  }

}
