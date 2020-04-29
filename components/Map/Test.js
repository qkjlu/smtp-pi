watchLocation(){
  console.log("enter location")
  this.watchID = Geolocation.watchPosition(
    position => {
      const { latitude, longitude } = position.coords;
      console.log("latitude: " +latitude);

      this.setState({
        latitude : latitude,
        longitude : longitude
      });
    },

    error => console.log(error),

    // option
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000,
    }

  )

}

{
  accuracy: Location.Accuracy.Highest,
  timeInterval: 5000,
  distanceInterval: 10
},

// Connection to server: socket
// passer la socket(fonction lister) dans les props du marker dans le marker
//
