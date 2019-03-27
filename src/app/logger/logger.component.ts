import { Component, OnInit } from '@angular/core';
import { StoreService } from '../store/store.service';
import { Httpservice } from '../services/httpservice.service';
import { AlertService } from '../services/alert.service';
import { CommonService } from '../services/common.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { EMPLOYEE_LOGS } from '../../constants';

@Component({
	selector: 'app-logger',
	templateUrl: './logger.component.html',
	styleUrls: [ './logger.component.css' ]
})
export class LoggerComponent implements OnInit {
	public employees: any = [];
	public selectedEmployee: any = {};
	public data: any = [];
	public dates = {};
	public details = {};

	constructor(
		public store: StoreService,
		public http: Httpservice,
		public alert: AlertService,
		public common: CommonService
	) {
		this.details = this.store.get('details');
		const pro = this.store.get('profile');
		const tmp: any = this.common.getOnlyMyEmpData();
		if (pro.employee.type === 'employee') {
			this.employees = _.filter(this.common.getOnlyMyEmpData(), function(o) {
				return o.name === pro.employee.name;
			});
		} else {
			this.employees = tmp;
		}
		this.selectedEmployee = this.employees[0];
		this.selected(this.selectedEmployee);
	}

	ngOnInit() {}

	selected(employee) {
		console.log(employee);
		this.alert.showLoader(true);
		this.http.GET(`${EMPLOYEE_LOGS}/${employee.id}`).subscribe((res) => {
			console.log(res);
			if (res && res.length > 0) {
				let data = this.sortByDate(res);
				this.data = data.data;
				this.dates = data.dates;
				console.log(res);
			} else {
				this.data = [];
			}
			this.alert.showLoader(false);
		});
	}

	sortByDate(arr) {
		let alldates = {},
			tmp = [];
		let data = _.sortBy(arr, function(obj) {
			return new Date(obj.created);
		});

		data.forEach((obj) => {
			const date = new Date(obj.created);
			const key = date.getDate();
			const value = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
			alldates[key] = value;
		});

		let dateGroups = _.groupBy(arr, function(obj) {
			return new Date(obj.created).getDate();
		});

		for (let prop in dateGroups) {
			if (dateGroups.hasOwnProperty(prop)) {
				tmp.push({
					key: prop,
					value: dateGroups[prop].reverse()
				});
			}
		}

		return { data: tmp.reverse(), dates: alldates };
	}
}
