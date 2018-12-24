import { Httpservice } from './../services/httpservice.service';
import { Component, OnInit, ViewChild } from "@angular/core";
import { StoreService } from "../store/store.service";
import * as _ from "lodash";
import { } from "googlemaps";
import { GET_TRACKING } from "../../constants";

@Component({
  selector: "app-track",
  templateUrl: "./track.component.html",
  styleUrls: ["./track.component.css"]
})
export class TrackComponent implements OnInit {
  @ViewChild("gmap") gmapElement: any;
  map: google.maps.Map;

  public employees: any = [];
  public selectedEmployee: any = {};
  public coords: any = [];
  public markerArray: any = [];
  public data: any = [];

  constructor(public store: StoreService, public http: Httpservice) {
    const pro = this.store.get("profile");
    const tmp = _.filter(this.store.get("photos"), function (o) { return o.name !== pro.employee.name; });
    this.employees = tmp;
    this.selectedEmployee = this.employees[0];
    this.getCoords(this.selectedEmployee);
  }

  ngOnInit() {

  }

  initMap() {
    const mapProp = {
      center: new google.maps.LatLng(11.0448, 76.91613),
      zoom: 15,
      gestureHandling: "cooperative",
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    google.maps.event.addListener(google.maps.Marker, "click", function () {
      alert("Hi");
    });
    this.draw(this.coords);
  }

  draw(location) {
    const coords = [];

    for (let i = 0; i < location.length; i++) {
      console.log(location[i].coordinates[0], location[i].coordinates[1]);
      coords.push({ location: new google.maps.LatLng(location[i].coordinates[0], location[i].coordinates[1]), stopover: true });
      // let co = new google.maps.Marker({
      //   position: { lat: location[i].coordinates[0], lng: location[i].coordinates[1] },
      //   map: this.map
      // });
      // co.addListener("click", function () {
      //   alert("hi");
      // });
      // coords.push(co);
    }

    const directionsService = new google.maps.DirectionsService;
    const directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(this.map);

    const start = coords[0].location;
    const end = coords[coords.length - 1].location;
    coords.splice(0, 1);
    coords.splice(coords.length - 1, 1);
    this.drawPath(directionsService, directionsDisplay, start, end, coords);
  }

  showSteps(directionResult, map) {
    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    const myRoute = directionResult.routes[0].legs[0];
    for (let i = 0; i < myRoute.steps.length; i++) {
      const marker = this.markerArray[i] = this.markerArray[i] || new google.maps.Marker;
      marker.addListener("click", function () {
        alert("hi");
      });
      marker.setMap(map);
      marker.setPosition(myRoute.steps[i].start_location);
    }
  }

  drawPath(directionsService, directionsDisplay, start, end, waypoints) {
    let self = this;
    directionsService.route({
      origin: start,
      destination: end,
      waypoints: waypoints,
      travelMode: "DRIVING"
    }, function (response, status) {
      if (status === "OK") {
        console.log(response);
        directionsDisplay.setDirections(response);
        self.showSteps(response, this.map);
      } else {
        window.alert("Problem in showing direction due to " + status);
      }
    });
  }

  selectEmp(item) {
    this.selectedEmployee = item;
    this.getCoords(item);
  }

  getCoords(item) {
    this.coords = [];
    let self = this;
    this.http.GET(`${GET_TRACKING}/${item.id}`).subscribe(res => {
      console.log(res);
      this.coords = res.location;
      this.data = res;
      setTimeout(function () {
        self.initMap();
      }, 0);
    });
  }

}
