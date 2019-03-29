import { StoreService } from './../store/store.service';
import { Httpservice } from './../services/httpservice.service';
import { AlertService } from './../services/alert.service';
import { Component, OnInit } from '@angular/core';
import { LOGIN, FORGOT_PASSWORD } from '../../constants';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
	public model: any = {};
	public isForgot: Boolean = false;
	public isOTP: Boolean = false;

	constructor(
		private alert: AlertService,
		private http: Httpservice,
		private router: Router,
		private store: StoreService
	) {
		if (this.store.get('isLoggedIn')) {
			this.router.navigate([ 'dashboard' ]);
		} else {
			this.store.clear();
			document.getElementsByTagName('body')[0].click();
		}
	}

	ngOnInit() {}

	onSubmit() {
		console.log(this.model);
		if (!this.model.phone || this.model.phone.length < 3) {
			this.alert.showAlert('Please Enter a valid Phone Number ', 'warning');
			return false;
		} else if (!this.model.password || this.model.password.length < 3) {
			this.alert.showAlert("Password doesn't match the requirement", 'warning');
			return false;
		}

		this.alert.showLoader(true);

		this.http.LOGIN(LOGIN, this.model).subscribe((res) => {
			if (res.status) {
				this.alert.showLoader(false);
				this.store.set('isLoggedIn', res.status);
				this.store.set('token', res.accessToken);
				this.store.set('apps', res.appList);
				this.store.set('config', res.keys);
				const tmp = res.keys;
				let details = {},
					leads = {},
					sales = {},
					products = {};
				for (let i = 0; i < tmp.details.length; i++) {
					details[tmp.details[i].key] = tmp.details[i].value;
				}
				for (let i = 0; i < tmp.lead.length; i++) {
					leads[tmp.lead[i].key] = tmp.lead[i].value;
				}
				for (let i = 0; i < tmp.sales.length; i++) {
					sales[tmp.sales[i].key] = tmp.sales[i].value;
				}
				for (let i = 0; i < tmp.product.length; i++) {
					products[tmp.product[i].key] = tmp.product[i].value;
				}
				this.store.set('details', details);
				this.store.set('leads', leads);
				this.store.set('sales', sales);
				this.store.set('products', products);
				this.router.navigate([ 'dashboard' ]);
				this.alert.showAlert('Success', 'success');
			} else {
				this.store.clear();
				this.alert.showAlert('Authentication Failed! Invalid Credentials', 'warning');
				this.alert.showLoader(false);
			}
		});
	}

	validateEmail(email) {
		let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	openForgot() {
		this.isForgot = true;
	}

	sendOTP() {
		this.model.password = '';
		if (!this.model.email || !this.validateEmail(this.model.email)) {
			this.alert.showAlert('Email Address entered is Invalid', 'warning');
			return false;
		}
		this.alert.showLoader(true);
		this.http.GET(`${FORGOT_PASSWORD}/${this.model.email}`).subscribe((res) => {
			this.alert.showLoader(false);
			if (res && res.key) {
				this.isOTP = true;
				this.store.set('otpkey', res.key);
			} else {
				this.alert.showAlert('Server is Busy, Try again!', 'warning');
				window.location.reload();
			}
		});
	}

	updatePassword() {
		if (this.model.password !== this.model.confirm) {
			this.alert.showAlert('New and Confirm Password are not Matching!!', 'warning');
			return false;
		}
		this.alert.showLoader(true);
		let tmp = {
			otp: this.model.otp.toString(),
			password: this.model.password,
			email: this.model.email
		};
		this.http.POST(FORGOT_PASSWORD, tmp).subscribe((res) => {
			this.alert.showAlert('Password Updated Successfully', 'success');
			this.alert.showLoader(false);
			setTimeout(() => {
				this.isOTP = false;
				this.isForgot = false;
			}, 1000);
		});
	}
}
