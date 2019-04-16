import { Component } from "@angular/core";
import { NavController } from "ionic-angular";

import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationResponse,
  BackgroundGeolocationEvents
} from "@ionic-native/background-geolocation";
import { HTTP } from "@ionic-native/http";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  gps_update_link: string = "your_http_request_link";

  constructor(
    public navCtrl: NavController,
    private http: HTTP,
    private backgroundGeolocation: BackgroundGeolocation
  ) {}

  startBackgroundGeolocation() {
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: true, //  enable this hear sounds for background-geolocation life-cycle.
      stopOnTerminate: false // enable this to clear background location settings when the app terminates
    };

    this.backgroundGeolocation.configure(config).then(() => {
      this.backgroundGeolocation
        .on(BackgroundGeolocationEvents.location)
        .subscribe((location: BackgroundGeolocationResponse) => {
          console.log(location);
          this.sendGPS(location);
        });
    });
    // start recording location
    this.backgroundGeolocation.start();
  }

  sendGPS(location) {
    if (location.speed == undefined) {
      location.speed = 0;
    }
    let timestamp = new Date(location.time);
    this.http
      .post(
        this.gps_update_link, // backend api to post
        {
          lat: location.latitude,
          lng: location.longitude,
          speed: location.speed,
          timestamp: timestamp
        },
        {}
      )
      .then(data => {
        console.log("POST Request is successful ", data);
        this.backgroundGeolocation.finish(); // FOR IOS ONLY
        // BackgroundGeolocation.endTask(taskKey);
      })
      .catch(error => {
        this.backgroundGeolocation.finish(); // FOR IOS ONLY
        console.log(error);
      });
  }
}
