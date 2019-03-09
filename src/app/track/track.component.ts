import { CommonService } from './../services/common.service';
import { AlertService } from "./../services/alert.service";
import { Httpservice } from "./../services/httpservice.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { StoreService } from "../store/store.service";
import * as _ from "lodash";
import * as moment from "moment";
import { } from "googlemaps";
import { GET_TRACKING } from "../../constants";
import { ResourcesService } from "../config/resources.service";
import { NgbModalConfig, NgbModal, NgbModalRef, NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-track",
  templateUrl: "./track.component.html",
  styleUrls: ["./track.component.css"]
})
export class TrackComponent implements OnInit {
  @ViewChild("gmap") gmapElement: any;
  @ViewChild("dp") datepicker: any;
  map: google.maps.Map;

  public employees: any = [];
  public selectedEmployee: any = {};
  public coords: any = [];
  public markerArray: any = [];
  public data: any = [];
  public done: Boolean = false;
  public filters = _.filter(this.resources.filter, function (o) {
    return (o.name === "T" || o.name === "Y" || o.name === "Custom");
  });
  public show: Boolean = false;
  public labelDate = new Date();
  public distance: any = 0;
  public maxDate;
  public selectedDate;
  public sortedData = {};
  public position = 0;

  constructor(public store: StoreService, public http: Httpservice, public alert: AlertService, public resources: ResourcesService,
    public common: CommonService) {
    const pro = this.store.get("profile");
    let tmp: any = this.common.getAllEmpData();
    if (pro.employee.type === "employee") {
      this.employees = _.filter(this.common.getAllEmpData(), function (o) { return o.name === pro.employee.name; });
    } else {
      this.employees = tmp;
    }
    this.selectedEmployee = this.employees[0];
    this.selected(this.filters[0]);
    tmp = moment(this.filters[0].from).startOf("day").toDate();
    this.maxDate = this.convert(tmp);
  }

  ngOnInit() {

  }

  initMap() {
    const mapProp: any = {
      center: new google.maps.LatLng(11.0448, 76.91613),
      zoom: 15,
      gestureHandling: "cooperative",
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    google.maps.event.addListener(google.maps.Marker, "click", function () {
      alert("Hi");
    });

    // Google Direction Service allows only 23 waypoints maximum per request so if we have more waypoints we have to make multiple calls
    const slice = 23;
    if (this.coords && this.coords.length > 0) {
      this.alert.showLoader(true);
      const length = this.coords.length;
      if (length > 23) {
        const counter = Math.ceil(length / slice);
        const self = this;
        this.asyncLoop(counter, function (loop) {
          const tmp = self.coords.splice(0, slice);
          self.draw(tmp);
          setTimeout(() => {
            loop.next();
          }, 1000);
        }, function (final) {
          // do nothing
          self.alert.showLoader(false);
        });
      } else {
        this.draw(this.coords); // less than 23 points
        this.alert.showLoader(false);
      }
    }
  }

  asyncLoop(iterations, func, callback) {
    let index = 0;
    let done = false;
    let loop = {
      next: function () {
        if (done) {
          return;
        }

        if (index < iterations) {
          index++;
          func(loop);

        } else {
          done = true;
          callback();
        }
      },

      iteration: function () {
        return index - 1;
      },

      break: function () {
        done = true;
        callback();
      }
    };
    loop.next();
    return loop;
  }

  draw(location) {
    const coords = [];

    for (let i = 0; i < location.length; i++) {
      console.log(location[i].coordinates[0], location[i].coordinates[1]);
      coords.push({ location: new google.maps.LatLng(location[i].coordinates[0], location[i].coordinates[1]), stopover: true });
    }

    const directionsService = new google.maps.DirectionsService;
    const directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(this.map);
    directionsDisplay.setOptions({ suppressMarkers: true });

    const start = coords[0].location;
    const end = coords[coords.length - 1].location;
    coords.splice(0, 1);
    // coords.splice(coords.length - 1, 1);
    this.drawPath(directionsService, directionsDisplay, start, end, coords);
  }

  showSteps(directionResult, map) {
    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.

    const myRoute = directionResult.routes[0].legs;
    for (let j = 0; j < myRoute.length; j++) {
      const route = myRoute[j].start_location.toJSON();
      const address = myRoute[j].start_address;
      const loc = new google.maps.LatLng(route.lat, route.lng);
      const content = `<div>
          <p> <strong>Address: </strong> <span>${address || "Not Available"}</span></p>
          <p> <strong>Battery (%): </strong> <span>${this.sortedData[this.position].battery || "Not Available"}</span></p>
          <p> <strong>Updated Time: </strong> <span>${this.sortedData[this.position].datetime ?
          moment(this.sortedData[this.position].datetime).format("lll") : "Not Available"}</span></p>
        </div>`;
      this.position++;
      let infowindow = new google.maps.InfoWindow({
        content: content,
        position: loc,
        maxWidth: 250
      });
      let marker = new google.maps.Marker({
        position: loc,
        icon: "https://i.imgur.com/bEejbiY.png",
        map: map,
        visible: true
      });
      marker.addListener("click", function (e) {
        infowindow.open(map, marker);
        setTimeout(() => {
          infowindow.close();
        }, 3000);
      });
      marker.setMap(map);
      // for (let i = 0; i < myRoute[j].steps.length; i++) {
      // const route = myRoute[j].steps[i].start_location.toJSON();
      // const address = myRoute[j].steps[i].start_address;
      // }
    }
  }

  drawPath(directionsService, directionsDisplay, start, end, waypoints) {
    let self = this;
    directionsService.route({
      origin: start,
      destination: end,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.WALKING
    }, function (response, status) {
      if (status === "OK") {
        const tmp = response.routes[0].legs;
        let dis = 0;
        for (let i = 0; i < tmp.length; i++) {
          dis += tmp[i].distance.value;
        }
        dis = parseFloat((dis / 1000).toFixed(1));
        self.distance += dis || 0;
        self.data.distance = self.distance.toFixed(2);
        directionsDisplay.setDirections(response);
        self.showSteps(response, self.map);
      } else {
        console.log("Problem in showing direction due to " + status);
      }
    });
  }

  selectEmp(item) {
    this.selectedEmployee = item;
    this.getCoords(item);
  }

  getCoords(item) {
    this.alert.showLoader(true);
    this.coords = [];
    const self = this;
    const date = `${this.labelDate.getFullYear()}-${this.labelDate.getMonth() + 1}-${this.labelDate.getDate()}`;
    this.http.GET(`${GET_TRACKING}/${item.id}/${date}`).subscribe(res => {
      console.log(res);
      this.alert.showLoader(false);
      this.done = true;
      if (res) {
        this.coords = res.location;
        this.data = res;
        this.data.distance = 0;
        this.distance = 0;
        this.position = 0;
        this.sortData(res);
        setTimeout(function () {
          self.initMap();
        }, 0);
      } else {
        this.data = [];
        this.alert.showAlert("No Data available!!!", "warning");
        setTimeout(function () {
          self.initMap();
        }, 0);
      }
    });
  }

  selected(label) {
    this.selectActive(label.name);
    if (label.name === "Custom") {
      this.toggle();
    } else {
      this.labelDate = moment(label.from)
        .startOf("day")
        .toDate();
      this.getCoords(this.selectedEmployee);
      this.selectedDate = this.convert(this.labelDate);
    }
    console.log(label);
  }

  selectActive(i) {
    for (let k = 0; k < this.filters.length; k++) {
      if (this.filters.hasOwnProperty(k)) {
        this.filters[k].name === i ? this.filters[k].selected = true : this.filters[k].selected = false;
      }
    }
  }

  calendarData(label, event) {
    this.selectActive(label.name);
    this.labelDate = moment(new Date(event.year, event.month - 1, event.day, 1, 0, 0)).startOf("day").toDate();
    this.toggle();
    this.getCoords(this.selectedEmployee);
    this.selectedDate = this.convert(this.labelDate);
  }

  toggle() {
    this.show = !this.show;
  }

  convert(d) {
    return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
  }

  sortData(data) {
    this.sortedData = {};
    if (Object.keys(data).length > 0) {
      const tmp = data.location;
      for (let i = 0; i < tmp.length; i++) {
        this.sortedData[i] = tmp[i];
      }
    }
  }

}
