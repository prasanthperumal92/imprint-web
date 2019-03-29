import { CommonService } from './../services/common.service';
import { ModalComponent } from './../helpers/modal/modal.component';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from './../services/alert.service';
import { Httpservice } from './../services/httpservice.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GET_CLIENTS, REFERENCE, SEARCH_CLIENT } from '../../constants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import * as moment from 'moment';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from 'exceljs';
import * as _ from 'lodash';
import { StoreService } from '../store/store.service';

@Component({
	selector: 'app-client',
	templateUrl: './client.component.html',
	styleUrls: [ './client.component.css' ]
})
export class ClientComponent implements OnInit {
	@ViewChild('modal') modal: ModalComponent;
	public clientList: any = [];
	public client: any = {};
	public available = false;
	public modalRef: NgbModalRef;
	public model: any = {};
	public clients = [];
	public employees = {};
	public selectedEmployee: any = {};
	public btn;
	public title;
	public type;
	public reference;
	public profile;
	public leads;
	public sales;
	public products;
	public leadStatus = [];
	public salesStatus = [];
	public productStatus = [];
	public selectedStatus;
	public selectedSales;
	public selectedProduct;
	public searchText;
	public details = {};

	search = (text: Observable<string>) => {
		console.log(JSON.stringify(text));
		return text.pipe(
			debounceTime(200),
			distinctUntilChanged(),
			map(
				(term) =>
					term.length < 2
						? []
						: this.clients.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)
			)
		);
	};

	constructor(
		public http: Httpservice,
		public alert: AlertService,
		public route: ActivatedRoute,
		public modalService: NgbModal,
		public store: StoreService,
		public common: CommonService
	) {
		this.employees = this.common.getOnlyMyEmpData();
		this.profile = this.store.get('profile');
		const lead = (this.leads = this.store.get('leads'));
		for (const prop in lead) {
			if (lead.hasOwnProperty(prop)) {
				this.leadStatus.push({ key: prop, value: lead[prop] });
			}
		}
		const sales = (this.sales = this.store.get('sales'));
		for (const prop in sales) {
			if (sales.hasOwnProperty(prop)) {
				this.salesStatus.push({ key: prop, value: sales[prop] });
			}
		}
		const products = (this.products = this.store.get('products'));
		for (const prop in products) {
			if (products.hasOwnProperty(prop)) {
				this.productStatus.push({ key: prop, value: products[prop] });
			}
		}
		const details = this.store.get('config');
		for (let i = 0; i < details.length; i++) {
			this.details[details[i].key] = details[i].value;
		}
	}

	ngOnInit() {
		this.route.params.subscribe((params) => {
			const id: any = params['id'];
			if (!id) {
				this.getClients();
			} else {
				this.openClient({ clientId: id });
			}
		});
	}

	getClients() {
		const self = this;
		this.alert.showLoader(true);
		setTimeout(function() {
			console.log('error1');
			self.alert.showLoader(true);
		}, 0);
		this.http.GET(GET_CLIENTS).subscribe((res) => {
			setTimeout(function() {
				console.log('error2');
				self.alert.showLoader(false);
			}, 0);
			this.available = true;
			for (let i = 0; i < res.length; i++) {
				res[i].assignedTo = this.common.getEmpData(res[i].assignedTo);
				res[i].createdBy = this.common.getEmpData(res[i].createdBy);
			}
			this.clientList = res;
			this.store.set('clients', res);
		});
	}

	clearFilter() {
		this.searchText = '';
		this.getClients();
	}

	download() {
		let workbook: ExcelProper.Workbook = new Excel.Workbook();
		let fileName;
		if (this.clientList.length > 0) {
			const tmp = JSON.parse(JSON.stringify(this.clientList));
			tmp.forEach((elem) => {
				elem.assignedTo = elem.assignedTo.name;
				elem.createdBy = elem.createdBy.name;
				elem.activity = this.sales[elem.activity];
				elem.status = this.leads[elem.status];
				elem.product = this.products[elem.product];
				elem['Sales status'] = elem.activity;
				elem['Client status'] = elem.status;
				delete elem.activity;
				delete elem.status;
			});
			let columns = this.getColumnNames(tmp[0]);
			let clientSheet = workbook.addWorksheet(this.details['Cterm']);
			clientSheet.columns = this.prepareColumns(columns);
			this.addRowData(clientSheet, tmp);
		}
		fileName = `${this.profile.employee.type}_${this.profile.employee.name}_${new Date().getTime()}.csv`;
		this.downloadFile(workbook, fileName);
	}

	prepareColumns(arr) {
		let tmp = [];
		arr.forEach((e) => {
			tmp.push({
				header: e.toUpperCase(),
				key: e,
				width: 20
			});
		});
		return tmp;
	}

	addRowData(sheet, data) {
		for (let i = 0; i < data.length; i++) {
			let obj = {};
			const item = data[i];
			for (const key in item) {
				if (item.hasOwnProperty(key)) {
					if (this.isDate(item[key])) {
						obj[key] = moment(item[key]).format('lll');
					} else {
						obj[key] = item[key] ? item[key].toString() : item[key];
					}
				}
			}
			sheet.addRow(obj);
		}
	}

	downloadFile(workbook, fileName) {
		workbook.csv.writeBuffer().then((data) => {
			const blob = new Blob([ data ], {
				type: 'text/csv' // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
			});
			let downloadLink = document.createElement('a');
			const url = URL.createObjectURL(blob);
			downloadLink.href = url;
			downloadLink.download = fileName;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		});
	}

	getColumnNames(obj) {
		let names = [];
		let key: any;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (key !== '__v' && key !== '_id' && key !== 'logs' && key !== 'reference' && key !== 'employeeId') {
					names.push(key);
				}
			}
		}
		return names;
	}

	searchClient() {
		if (this.searchText && this.searchText.length > 3) {
			this.alert.showLoader(true);
			this.http.GET(`${SEARCH_CLIENT}/${this.searchText}`).subscribe((res) => {
				this.alert.showLoader(false);
				this.available = true;
				this.clientList = res;
				for (let i = 0; i < res.length; i++) {
					res[i].assignedTo = this.common.getEmpData(res[i].assignedTo);
					res[i].createdBy = this.common.getEmpData(res[i].createdBy);
				}
				this.clientList = res;
			});
		} else {
			this.alert.showAlert('Client name should be minimum 3 chars length', 'warning');
		}
	}

	openClient(item) {
		this.alert.showLoader(true);
		this.http.GET(`${GET_CLIENTS}/${item.clientId}`).subscribe((res) => {
			this.alert.showLoader(false);
			if (res && res[0]) {
				this.available = true;
				res[0].assignedTo = this.common.getEmpData(res[0].assignedTo);
				res[0].createdBy = this.common.getEmpData(res[0].createdBy);
				let tmp = [ ...res[0].logs, ...res[0].reference ];
				tmp = _.sortBy(tmp, 'created');
				tmp = _.without(tmp, null);
				res[0].logs = tmp.reverse();
				this.client = res[0];
			} else {
				// this.alert.showAlert("Client Information is wrong!!!!", "warning");
				this.available = false;
				this.goBack();
			}
		});
	}

	goBack() {
		this.client = {};
		this.getClients();
	}

	applyLead(item) {
		this.model.status = this.selectedStatus = item.key;
		return false;
	}

	applySales(item) {
		this.model.activity = this.selectedSales = item.key;
		return false;
	}

	applyProduct(item) {
		this.model.product = this.selectedProduct = item.key;
		return false;
	}

	newClient(elem, type, model) {
		if (type === 'create') {
			this.btn = 'Create';
			this.title = 'Create Client';
			this.model = {};
			this.type = 'create';
		} else {
			this.model = model;
			this.btn = 'Update';
			this.title = 'Edit Client';
			this.type = 'edit';
			const tmp = parseInt(model.contact.split('+91')[1]);
			this.model.number = Number(tmp);
			if (model.contact2) {
				this.model.number2 = parseInt(model.contact.split('+91')[1]);
			}
			this.selectedEmployee = model.assignedTo;
			this.selectedStatus = model.status;
			this.selectedSales = model.activity;
			this.selectedProduct = model.product;
		}
		this.modalRef = this.modalService.open(elem, { centered: true, size: 'lg' });
		this.modalRef.result.then(
			(result) => {
				console.log(result);
			},
			(reason) => {
				console.log(reason);
				this.model = {};
				this.selectedEmployee = {};
				this.type = '';
			}
		);
	}

	getKey(obj, value) {
		for (const prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				if (obj[prop] === value) {
					return prop;
				}
			}
		}
	}

	selectEmp(item) {
		this.selectedEmployee = item;
	}

	openReference(elem, item) {
		this.modalRef = this.modalService.open(elem, { centered: true, size: 'lg' });
		this.modalRef.result.then(
			(result) => {
				console.log(result);
			},
			(reason) => {
				console.log(reason);
				this.model = {};
				this.selectedEmployee = {};
				this.type = '';
				this.reference = '';
			}
		);
	}

	addReference(client) {
		if (client && client._id && this.reference) {
			console.log(client, this.reference);
			this.modalRef.close();
			this.alert.showLoader(true);
			this.http.POST(REFERENCE, { _id: client._id, reference: this.reference }).subscribe((res) => {
				this.alert.showLoader(false);
				this.available = false;
				this.goBack();
			});
		} else if (!this.reference) {
			this.alert.showAlert('Please enter some feedback!', 'warning');
		} else {
			this.alert.showAlert('Cannot add Feedback Now! Try again after Refresh!', 'danger');
		}
	}

	validateEmail(email) {
		let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	onSubmit() {
		if (!this.model.address || !this.model.name || !this.model.person) {
			this.alert.showAlert('Fill all the details!', 'warning');
			return false;
		} else if (!this.selectedEmployee.name) {
			this.alert.showAlert('Please select an employee to assign the client!', 'warning');
			return false;
		}

		if (!this.model.number || this.model.number.toString().length !== 10) {
			this.alert.showAlert('Contact Number cannot be empty or less than 10 digits!', 'warning');
			return false;
		}

		if (this.model.number2) {
			if (this.model.number2.toString().length !== 10) {
				this.alert.showAlert('Contact Number 2 cannot be less than 10 digits!', 'warning');
				return false;
			}
		}

		if (this.model.mail) {
			if (!this.validateEmail(this.model.mail)) {
				this.alert.showAlert('Email Address is not a valid email address', 'warning');
				return false;
			}
		}

		if (this.model.mail2) {
			if (!this.validateEmail(this.model.mail2)) {
				this.alert.showAlert('Email Address 2 is not a valid email address', 'warning');
				return false;
			}
		}

		this.model.contact = '+91' + this.model.number;
		if (this.model.number2) {
			this.model.contact2 = '+91' + this.model.number2;
		}
		this.model.assignedTo = this.selectedEmployee.id;
		console.log(this.model);
		if (this.type === 'create') {
			this.alert.showLoader(true);
			this.modalRef.close();
			this.http.POST(GET_CLIENTS, this.model).subscribe((res) => {
				this.alert.showLoader(false);
				this.available = false;
				this.goBack();
			});
		} else if (this.type === 'edit') {
			this.alert.showLoader(true);
			this.modalRef.close();
			this.http.PUT(GET_CLIENTS, this.model).subscribe((res) => {
				this.alert.showLoader(false);
				this.available = false;
				this.goBack();
			});
		}
	}

	isDate(_date) {
		const _regExp = new RegExp(
			'^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$'
		);
		return _regExp.test(_date);
	}
}
