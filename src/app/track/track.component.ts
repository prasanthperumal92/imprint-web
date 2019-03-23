import { CommonService } from './../services/common.service';
import { AlertService } from './../services/alert.service';
import { Httpservice } from './../services/httpservice.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StoreService } from '../store/store.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import {} from 'googlemaps';
import { GET_TRACKING, LIVE_TRACKING } from '../../constants';
import { ResourcesService } from '../config/resources.service';
import { NgbModalConfig, NgbModal, NgbModalRef, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-track',
	templateUrl: './track.component.html',
	styleUrls: [ './track.component.css' ]
})
export class TrackComponent implements OnInit {
	@ViewChild('gmap') gmapElement: any;
	@ViewChild('live') liveElement: any;
	@ViewChild('dp') datepicker: any;
	map: google.maps.Map;
	liveMap: google.maps.Map;

	public employees: any = [];
	public selectedEmployee: any = {};
	public coords: any = [];
	public markerArray: any = [];
	public data: any = [];
	public done: Boolean = false;
	public filters = _.filter(this.resources.filter, function(o) {
		return o.name === 'T' || o.name === 'Y' || o.name === 'Custom';
	});
	public show: Boolean = false;
	public labelDate = new Date();
	public distance: any = 0;
	public maxDate;
	public selectedDate;
	public sortedData = {};
	public position = 0;
	public defaultPosition = {
		lat: 11.0448,
		lng: 76.91613
	};
	public counter = 0;
	public mapIcons = {
		start: 'https://i.imgur.com/AOFp7p7.png',
		end: 'https://i.imgur.com/N6XrXFs.png',
		other: 'https://i.imgur.com/fDqUDzo.png',
		default: 'https://i.imgur.com/bEejbiY.png'
	};
	public profile;
	public liveData = [];
	public liveTracking = false;

	constructor(
		public store: StoreService,
		public http: Httpservice,
		public alert: AlertService,
		public resources: ResourcesService,
		public common: CommonService,
		private elRef: ElementRef
	) {
		const pro = (this.profile = this.store.get('profile'));
		let tmp: any = this.common.getOnlyMyEmpData();
		if (pro.employee.type === 'employee') {
			this.employees = _.filter(this.common.getOnlyMyEmpData(), function(o) {
				return o.name === pro.employee.name;
			});
		} else {
			this.employees = tmp;
		}
		this.selectedEmployee = this.employees[0];
		this.selected(this.filters[0]);
		tmp = moment(this.filters[0].from).startOf('day').toDate();
		this.maxDate = this.convert(tmp);
	}

	ngOnInit() {}

	showLiveTracks() {
		this.liveTracking = !this.liveTracking;
		if (this.liveTracking) {
			if (this.profile.employee.type === 'manager') {
				this.initLiveTracking();
			}
		}
	}

	initLiveTracking() {
		this.alert.showLoader(true);
		this.http.GET(`${LIVE_TRACKING}`).subscribe((res) => {
			console.log(res);
			this.alert.showLoader(false);
			this.done = true;
			let self = this;
			if (Object.keys(res).length > 0) {
				this.liveData = res;
				this.getPhotos();
				setTimeout(function() {
					self.initLiveMap();
				}, 100);
			} else {
				this.liveData = [];
				this.alert.showAlert('No Data available!!!', 'warning');
				setTimeout(function() {
					self.initLiveMap();
				}, 100);
			}
		});
	}

	getPhotos() {
		const tmp = this.common.getOnlyMyEmpData();
		let data = {};
		for (let i = 0; i < tmp.length; i++) {
			data[tmp[i].id] = tmp[i];
		}
		this.liveData.forEach((elem) => {
			elem.photo = data[elem.id].photo;
			elem.name = data[elem.id].name;
		});
	}

	initLiveMap() {
		const lat = this.liveData.length > 0 ? this.liveData[0].location.coordinates[0] : this.defaultPosition.lat;
		const lng = this.liveData.length > 0 ? this.liveData[0].location.coordinates[1] : this.defaultPosition.lng;
		const mapProp: any = {
			center: new google.maps.LatLng(lat, lng),
			zoom: 15,
			gestureHandling: 'cooperative',
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		this.liveMap = new google.maps.Map(this.liveElement.nativeElement, mapProp);
		this.showLivemarks(this.liveMap, this.liveData);
	}

	initMap() {
		const lat = this.coords.length > 0 ? this.coords[0].coordinates[0] : this.defaultPosition.lat;
		const lng = this.coords.length > 0 ? this.coords[0].coordinates[1] : this.defaultPosition.lng;
		const mapProp: any = {
			center: new google.maps.LatLng(lat, lng),
			zoom: 15,
			gestureHandling: 'cooperative',
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

		// Google Direction Service allows only 23 waypoints maximum per request so if we have more waypoints we have to make multiple calls
		const slice = 23;
		if (this.coords && this.coords.length > 0) {
			this.alert.showLoader(true);
			const length = this.coords.length;
			if (length > 23) {
				const counter = (this.counter = Math.ceil(length / slice));
				const self = this;
				this.asyncLoop(
					counter,
					function(loop) {
						const tmp = self.coords.splice(0, slice);
						self.draw(tmp, loop.iteration() + 1);
						setTimeout(() => {
							loop.next();
						}, 1000);
					},
					function(final) {
						// do nothing
						self.alert.showLoader(false);
					}
				);
			} else {
				this.counter = 1;
				this.draw(this.coords, 1); // less than 23 points
				this.alert.showLoader(false);
			}
		}
	}

	asyncLoop(iterations, func, callback) {
		let index = 0;
		let done = false;
		let loop = {
			next: function() {
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

			iteration: function() {
				return index - 1;
			},

			break: function() {
				done = true;
				callback();
			}
		};
		loop.next();
		return loop;
	}

	draw(location, loop) {
		const coords = [];

		for (let i = 0; i < location.length; i++) {
			console.log(location[i].coordinates[0], location[i].coordinates[1]);
			coords.push({
				location: new google.maps.LatLng(location[i].coordinates[0], location[i].coordinates[1]),
				stopover: true
			});
		}

		const directionsService = new google.maps.DirectionsService();
		const directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(this.map);
		directionsDisplay.setOptions({ suppressMarkers: true });

		const start = coords[0].location;
		const end = coords[coords.length - 1].location;
		coords.splice(0, 1);
		// coords.splice(coords.length - 1, 1);
		this.drawPath(directionsService, directionsDisplay, start, end, coords, loop);
	}

	showLivemarks(map, data) {
		for (let i = 0; i < data.length; i++) {
			const each = data[i];
			const loc = new google.maps.LatLng(each.location.coordinates[0], each.location.coordinates[1]);
			let marker = new google.maps.Marker({
				position: loc,
				icon: this.mapIcons['default'],
				map: map,
				visible: true
			});
			const latlng = { lat: each.location.coordinates[0], lng: each.location.coordinates[1] };
			marker.addListener('click', function(e) {
				let geocoder = new google.maps.Geocoder();
				geocoder.geocode({ location: latlng }, function(results, status) {
					const address = results[0].formatted_address || 'Not Available';
					const content = `<div>
							<p style="display:inline-flex"><img style="width: 40px; height: 40px; border-radius: 50%;" src="${each.photo}" /><span style="padding:10px">${each.name}</span></p>
							<p> <strong>Address: </strong> <span>${address}</span></p>
							<p> <strong>Battery (%): </strong> <span>${each.location.battery || 'Not Available'}</span></p>
							<p> <strong>Updated Time: </strong> <span>${each.location.datetime
								? moment(each.location.datetime).format('lll')
								: 'Not Available'}</span></p>
							</div>`;
					let infowindow = new google.maps.InfoWindow({
						content: content,
						position: loc,
						maxWidth: 250
					});
					infowindow.open(map, marker);
					setTimeout(() => {
						infowindow.close();
					}, 3000);
				});
			});
			marker.setMap(map);
		}
	}

	showSteps(directionResult, map, loop) {
		// For each step, place a marker, and add the text to the marker's infowindow.
		// Also attach the marker to an array so we can keep track of it and remove it
		// when calculating new routes.
		let start = false;
		let end = false;
		let other = false;
		let icon = 'other';
		const myRoute = directionResult.routes[0].legs;

		if (loop === 1 && loop === this.counter) {
			start = true;
			end = true;
		} else {
			if (loop === 1) {
				start = true;
				end = false;
			} else if (loop < this.counter || loop > this.counter) {
				start = false;
				end = false;
			} else if (loop === this.counter) {
				start = false;
				end = true;
			}
		}

		for (let j = 0; j < myRoute.length; j++) {
			if (start && j === 0) {
				icon = 'start';
			} else if (end && j === myRoute.length - 1) {
				icon = 'end';
			} else {
				icon = 'other';
			}
			const route = myRoute[j].start_location.toJSON();
			const address = myRoute[j].start_address;
			const loc = new google.maps.LatLng(route.lat, route.lng);
			const content = `<div>
          <p> <strong>Address: </strong> <span>${address || 'Not Available'}</span></p>
          <p> <strong>Battery (%): </strong> <span>${this.sortedData[this.position].battery ||
				'Not Available'}</span></p>
          <p> <strong>Updated Time: </strong> <span>${this.sortedData[this.position].datetime
				? moment(this.sortedData[this.position].datetime).format('lll')
				: 'Not Available'}</span></p>
        </div>`;
			this.position++;
			let infowindow = new google.maps.InfoWindow({
				content: content,
				position: loc,
				maxWidth: 250
			});
			let marker = new google.maps.Marker({
				position: loc,
				icon: this.mapIcons[icon],
				map: map,
				visible: true
			});
			marker.addListener('click', function(e) {
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
		map.setZoom(15);
	}

	drawPath(directionsService, directionsDisplay, start, end, waypoints, loop) {
		let self = this;
		directionsService.route(
			{
				origin: start,
				destination: end,
				waypoints: waypoints,
				travelMode: google.maps.TravelMode.WALKING
			},
			function(response, status) {
				if (status === 'OK') {
					const tmp = response.routes[0].legs;
					let dis = 0;
					for (let i = 0; i < tmp.length; i++) {
						dis += tmp[i].distance.value;
					}
					dis = parseFloat((dis / 1000).toFixed(1));
					self.distance += dis || 0;
					self.data.distance = self.distance.toFixed(2);
					directionsDisplay.setDirections(response);
					self.showSteps(response, self.map, loop);
				} else {
					console.log('Problem in showing direction due to ' + status);
				}
			}
		);
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
		this.http.GET(`${GET_TRACKING}/${item.id}/${date}`).subscribe((res) => {
			console.log(res);
			this.alert.showLoader(false);
			this.done = true;
			if (Object.keys(res).length > 0) {
				this.coords = res.location;
				this.data = res;
				this.data.distance = 0;
				this.distance = 0;
				this.position = 0;
				this.sortData(res);
				setTimeout(function() {
					self.initMap();
				}, 0);
			} else {
				this.data = [];
				this.alert.showAlert('No Data available!!!', 'warning');
				setTimeout(function() {
					self.initMap();
				}, 0);
			}
		});
	}

	selected(label) {
		this.selectActive(label.name);
		if (label.name === 'Custom') {
			this.toggle();
		} else {
			this.labelDate = moment(label.from).startOf('day').toDate();
			this.getCoords(this.selectedEmployee);
			this.selectedDate = this.convert(this.labelDate);
		}
		console.log(label);
	}

	selectActive(i) {
		for (let k = 0; k < this.filters.length; k++) {
			if (this.filters.hasOwnProperty(k)) {
				this.filters[k].name === i ? (this.filters[k].selected = true) : (this.filters[k].selected = false);
			}
		}
	}

	calendarData(label, event) {
		this.selectActive(label.name);
		this.labelDate = moment(new Date(event.year, event.month - 1, event.day, 1, 0, 0)).startOf('day').toDate();
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
		if (Object.keys(data).length > 0 && data.location) {
			const tmp = data.location;
			for (let i = 0; i < tmp.length; i++) {
				this.sortedData[i] = tmp[i];
			}
		}
	}
}
