import { Httpservice } from './../../services/httpservice.service';
import { AlertService } from './../../services/alert.service';
import { StoreService } from './../../store/store.service';
import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { NOTIFICATION, EMPLOYEE_PROFILE } from '../../../constants';

@Component({
	selector: 'header',
	templateUrl: './header.component.html',
	styleUrls: [ './header.component.css' ]
})
export class HeaderComponent implements OnInit {
	public name: string;
	public photo: string;
	@Input() title: string;

	public showNotification = false;
	public count = 0;
	public nots = [];

	constructor(
		public router: Router,
		public store: StoreService,
		public alert: AlertService,
		public http: Httpservice
	) {
		let tmp = this.store.get('profile');
		this.name = tmp.employee.name;
		this.photo = tmp.employee.photo;
		this.getNotifications();
	}

	ngOnInit() {}

	goto(path: string) {
		this.router.navigate([ path ]);
	}

	getNotifications() {
		this.http.GET(NOTIFICATION).subscribe((res) => {
			console.log(res);
			this.count = 0;
			this.nots = [];
			for (let i = 0; i < res.length; i++) {
				if (!res[i].isRead) {
					this.count++;
					this.nots.push(res[i]);
				}
			}
			this.nots.reverse();
		});
	}

	logout() {
		this.store.clear('isLoggedIn');
		this.http.DELETE(EMPLOYEE_PROFILE).subscribe((res) => {
			this.goto('login');
			this.alert.showAlert('Logged Out Successfully', 'success');
		});
	}

	show() {
		this.showNotification = !this.showNotification;
	}

	openNot(item) {
		this.show();
		this.nots = this.nots.filter((e) => e._id !== item._id);
		this.count--;
		this.http.PUT(`${NOTIFICATION}/${item._id}`).subscribe((res) => {
			console.log(res);
			this.router.navigate([ 'dashboard/' + item.category ]);
		});
	}
}
