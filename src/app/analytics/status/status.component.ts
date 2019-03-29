import { CommonService } from './../../services/common.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Httpservice } from './../../services/httpservice.service';
import { AlertService } from './../../services/alert.service';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from 'src/app/store/store.service';
import { ResourcesService } from 'src/app/config/resources.service';
import { CHART_TYPE_DATA, CHART_TABLE_DATA, CHART_DOWNLOAD_DATA } from '../../../constants';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as html2canvas from 'html2canvas';

@Component({
	selector: 'app-status',
	templateUrl: './status.component.html',
	styleUrls: [ './status.component.css' ]
})
export class StatusComponent implements OnInit {
	@Input() public id: string;
	@Input() public title: string;
	@Input() public description: string;
	@Input() public type: string;
	@Input() public xAxisName: string = 'Count';
	@Input() public yAxisName: string = 'Activity';

	public details;
	public leads;
	public sales;
	public products;
	public profile;
	public employees;
	public selectedEmployee: any = {};
	public chartData = [];
	public filters;
	public selectedFilter;
	public show = false;
	public start;
	public end;
	public columnNames;
	public selectedData;
	public modalRef: NgbModalRef;
	public user = {};
	public filter;
	public filterType;
	public currentLabel;
	public dataForChart = false;

	constructor(
		public store: StoreService,
		public router: Router,
		public alert: AlertService,
		public http: Httpservice,
		public resources: ResourcesService,
		public common: CommonService,
		public modalService: NgbModal
	) {
		let tmp: any;
		tmp = this.resources.filter;
		this.filters = JSON.parse(JSON.stringify(tmp));
		this.profile = this.store.get('profile');
		this.details = this.store.get('details');
		this.leads = this.store.get('leads');
		this.sales = this.store.get('sales');
		this.products = this.store.get('products');
		this.employees = this.common.getOnlyMyEmpData();
		let all: any;
		if (this.profile.employee.type !== 'employee') {
			all = {
				id: 'all',
				name: 'All Employees',
				designation: 'all',
				photo: '/assets/images/default_user.png'
			};
			this.employees.splice(0, 0, all);
			this.selectEmp(all);
		} else {
			all = _.find(this.employees, { id: this.profile.employee._id });
			this.selectEmp(all);
		}
		tmp = this.common.getOnlyMyEmpData();
		for (let i = 0; i < tmp.length; i++) {
			this.user[tmp[i].id] = tmp[i].name;
		}
	}

	ngOnInit() {
		this.selected('Today');
	}

	getMyChart(type) {
		this.dataForChart = false;
		this.alert.showLoader(true);
		// this.filterType = type;
		// if (this.filterType !== "Custom Date") {
		//   this.filter = this.resources.getFilter(type);
		// }
		// this.start = this.filter.from;
		// this.end = this.filter.to;
		// const start = this.filter.from.format("YYYY-MM-DD");
		// const end = this.filter.to.format("YYYY-MM-DD");
		this.http.GET(`${CHART_TYPE_DATA}/${this.type}/${this.selectedEmployee.id}`).subscribe((res) => {
			console.log(res);
			const tmp = this.getLabels(this.checkEmpty(res));
			this.chartData = tmp;
			let counter = 0;
			for (let i = 0; i < this.chartData.length; i++) {
				if (this.chartData[i].value === 0) {
					counter++;
				}
			}
			if (counter !== this.chartData.length) {
				this.dataForChart = true;
			}
			this.alert.showLoader(false);
		});
	}

	getLabels(data) {
		this.currentLabel = [];
		if (this.type === 'lead') {
			this.currentLabel = this.leads;
		} else if (this.type === 'sales') {
			this.currentLabel = this.sales;
		} else if (this.type === 'product') {
			this.currentLabel = this.products;
		}
		for (let j = 0; j < data.length; j++) {
			data[j].other = data[j].key;
			data[j].key = this.currentLabel[data[j].key];
		}
		return data;
	}

	checkEmpty(arr) {
		let count = 0;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].value === 0) {
				count++;
			}
		}
		if (count === arr.length) {
			return [];
		} else {
			return arr;
		}
	}

	selected(filter: string, open?) {
		this.selectedFilter = filter;
		this.selectButton(filter);
		if (filter === 'Custom Date') {
			this.toggle();
		} else {
			this.getMyChart(filter);
		}
	}

	selectButton(filter) {
		const self = this;
		this.filters.forEach(function(item, i) {
			if (item.label === filter) {
				item.selected = true;
			} else {
				item.selected = false;
			}
		});
	}

	toggle() {
		this.show = !this.show;
	}

	calendarData(obj) {
		this.filter = this.resources.getFilter('Custom Date');
		this.filter.from = moment(new Date(obj.from.year, obj.from.month - 1, obj.from.day));
		this.filter.to = moment(new Date(obj.to.year, obj.to.month - 1, obj.to.day));
		this.getMyChart('Custom Date');
		this.toggle();
	}

	downloadImage() {
		const id = this.id;
		const element = document.querySelector('#' + id);
		const name = `${this.profile.employee.name}_${id.toUpperCase()}_${new Date().getTime()}.png`;
		this.alert.showLoader(true);
		const self = this;
		setTimeout(() => {
			html2canvas(element).then((canvas) => {
				self.alert.showLoader(false);
				const a = document.createElement('a');
				a.setAttribute('download', name);
				a.setAttribute('href', canvas.toDataURL());
				a.click();
			});
		}, 1000);
	}

	showData() {
		this.alert.showLoader(true);
		let query;
		// const choosen = this.filter;
		// const start = moment(choosen.from).format("YYYY-MM-DD");
		// const end = moment(choosen.to).format("YYYY-MM-DD");
		query = `${CHART_DOWNLOAD_DATA}/${this.selectedEmployee.id}`;
		this.http.GET(query).subscribe((res) => {
			console.log(res);
			this.store.set('moreData', { type: 'lead', data: res });
			this.router.navigate([ 'dashboard/search' ]);
			this.alert.showLoader(false);
		});
	}

	openModal(elem, data) {
		this.alert.showLoader(true);
		// const filter = this.resources.getFilter(this.filterType);
		// const start = filter.from.format("YYYY-MM-DD");
		// const end = filter.to.format("YYYY-MM-DD");
		this.http.GET(`${CHART_TABLE_DATA}/${this.type}/${data.other}`).subscribe((res) => {
			console.log(res);
			this.alert.showLoader(false);
			if (res && res[0]) {
				this.columnNames = this.getColumnNames(res[0]);
				this.selectedData = this.getTableData(res);
				this.modalRef = this.modalService.open(elem, { centered: true, size: 'lg', backdrop: 'static' });
				this.modalRef.result.then(
					(result) => {
						console.log(result);
					},
					(reason) => {
						console.log(reason);
					}
				);
			}
		});
	}

	closeModal() {
		this.modalRef.close();
	}

	getColumnNames(obj) {
		let names = [];
		let key: any;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (key !== '__v' && key !== '_id' && key !== 'logs' && key !== 'reference' && key !== 'employeeId') {
					if (key === 'status' || key === 'activity' || key === 'product') {
						const tmp = names[1];
						if (tmp) {
							names[1] = key;
							names.push(tmp);
						} else {
							names.push(key);
						}
					} else {
						names.push(key);
					}
				}
			}
		}
		return names;
	}

	getTableData(data) {
		for (let j = 0; j < data.length; j++) {
			for (const key in data[j]) {
				if (
					key === 'assignedTo' ||
					key === 'assignedBy' ||
					key === 'createdBy' ||
					key === 'status' ||
					key === 'activity' ||
					key === 'product'
				) {
					if (key === 'status') {
						data[j][key] = this.currentLabel[data[j][key]];
					} else {
						data[j][key] = this.user[data[j][key]];
					}
				}
			}
		}
		return data;
	}

	selectEmp(emp, event?) {
		this.selectedEmployee = emp;
		if (event) {
			this.getMyChart(this.filterType);
		}
	}
}
