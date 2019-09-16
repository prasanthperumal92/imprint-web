import { CommonService } from './../services/common.service';
import { ModalComponent } from './../helpers/modal/modal.component';
import { AlertService } from './../services/alert.service';
import { StoreService } from './../store/store.service';
import { ResourcesService } from './../config/resources.service';
import { Httpservice } from './../services/httpservice.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DSR, DSR_FILTER, DSR_DELETE } from '../../constants';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-dsr',
	templateUrl: './dsr.component.html',
	styleUrls: [ './dsr.component.css' ]
})
export class DsrComponent implements OnInit {
	public data: any = [];
	public show = false;
	public filters = this.resources.filter;
	public fromDate;
	public toDate;
	public sort = 'created';
	public skip = 0;
	public limit = 20;
	public label;
	public order = -1;
	public sorted = 'Visited';
	public dsrList: any = [];
	public page: Number = 1;
	public sortBy: any = [
		{ key: 'Visited', value: 'created' },
		{ key: 'Client', value: 'effort.client' },
		{ key: 'Status', value: 'effort.sales' },
		{ key: 'Followup', value: 'effort.followup' },
		{ key: 'Employee', value: 'name' }
	];
	public filterBy: any = {
		employee: [],
		status: [],
		client: []
	};
	public filterSelected = {
		Employee: 'Employee',
		Client: 'Client',
		Status: 'Status'
	};
	public query: any = {};
	public filter: any = null;
	@ViewChild('modal') modal: ModalComponent;
	@ViewChild('sharemodal') sharemodal: ModalComponent;
	@ViewChild('popup') popup;
	public modalTitle;
	public modalContent;
	public modalBtnText;
	public selectedItem;
	public photos = [];
	public leads;
	public sales;
	public products;
	public salesStatus = [];
	public shareUrl;

	toggle() {
		this.show = !this.show;
	}

	calendarData(obj) {
		let choosen = this.resources.getFilter('Custom Date');
		choosen.from = new Date(obj.from.year, obj.from.month - 1, obj.from.day);
		choosen.to = new Date(obj.to.year, obj.to.month - 1, obj.to.day);
		this.fromDate = moment(choosen.from).startOf('day').toDate();
		this.toDate = moment(choosen.to).endOf('day').toDate();
		this.store.set('dateFilter', choosen);
		this.label = choosen.label;
		this.toggle();
		this.setProps();
		this.saveProps();
	}

	constructor(
		public http: Httpservice,
		public calendar: NgbCalendar,
		public resources: ResourcesService,
		public store: StoreService,
		public alert: AlertService,
		public modalService: NgbModal,
		public common: CommonService
	) {
		this.query = this.store.get('dsrquery');
		let tmp = this.common.getAllEmpData();
		for (let i = 0; i < tmp.length; i++) {
			this.photos[tmp[i].name] = tmp[i].photo;
		}
		this.leads = this.store.get('leads');
		this.sales = this.store.get('sales');
		this.products = this.store.get('products');
		for (const prop in this.sales) {
			if (this.sales.hasOwnProperty(prop)) {
				this.salesStatus.push({ key: prop, value: this.sales[prop] });
			}
		}

		if (this.query) {
			this.selected(this.query.label, true);
			this.fromDate = this.query.fromDate;
			this.toDate = this.query.toDate;
		} else {
			this.query = {};
			this.selected('Today', false); // By default choose Today
		}
		this.getFilter();
	}

	getFilter() {
		this.http.GET(DSR_FILTER).subscribe((res) => {
			console.log(res);
			this.filterBy.employee = res.name.sort();
			this.filterBy.client = res.client.sort();
			this.filterBy.status = this.salesStatus;
		});
	}

	getJobs(query) {
		this.alert.showLoader(true);
		this.http.POST(DSR, query).subscribe((res) => {
			console.log(res);
			this.alert.showLoader(false);
			this.dsrList = res;
		});
	}

	public applyFilters(type, key, value, value2?) {
		this.clearFils();
		if (key === 'effort.sales') {
			this.filterSelected[type] = value2;
		} else {
			this.filterSelected[type] = value;
		}
		this.query.filter = this.filter = {};
		this.filter = { key: key, value: value };
		this.query.filter = this.filter;
		this.setProps();
		this.saveProps();
	}

	public applySort(item) {
		this.sort = item.value;
		this.sorted = item.key;
		this.setProps();
		this.saveProps();
	}

	public applyorder(order) {
		this.order = order;
		this.setProps();
		this.saveProps();
	}

	clearFilter() {
		this.filter = null;
		this.query.filter = this.filter;
		this.page = 1;
		this.setProps();
		this.saveProps();
		this.clearFils();
	}

	clearFils() {
		for (let k in this.filterSelected) {
			if (this.filterSelected.hasOwnProperty(k)) {
				this.filterSelected[k] = k;
			}
		}
	}

	loadPage(page: any) {
		this.page = page;
		this.query.skip = this.skip = page === 1 ? 0 : (page - 1) * this.limit;
		this.saveProps();
	}

	setProps() {
		this.query.fromDate = this.fromDate;
		this.query.toDate = this.toDate;
		this.query.skip = this.skip;
		this.query.limit = this.limit;
		this.query.sort = this.sort;
		this.query.filter = this.filter;
		this.query.label = this.label;
		this.query.order = this.order;
		this.store.set('dsrquery', this.query);
	}

	selected(filter: string, open?: any) {
		this.selectButton(filter);
		if (filter === 'Custom Date') {
			if (!open) {
				this.toggle();
			} else {
				this.dateFilter(filter);
			}
		} else {
			this.dateFilter(filter);
		}
	}

	dateFilter(filter) {
		let choosen = this.resources.getFilter(filter);
		this.label = filter;
		if (typeof choosen.from.year == 'number') {
			let from = new Date(choosen.from.year, choosen.from.month, choosen.from.day);
			let to = new Date(choosen.to.year, choosen.to.month, choosen.to.day);
			this.fromDate = moment(from).startOf('day').toDate();
			this.toDate = moment(to).endOf('day').toDate();
		} else {
			this.fromDate = moment(choosen.from).startOf('day').toDate();
			this.toDate = moment(choosen.to).endOf('day').toDate();
		}
		this.page = 1;
		this.setProps();
		this.saveProps();
	}

	saveProps() {
		this.getJobs(this.query);
	}

	selectButton(filter) {
		let self = this;
		this.filters.forEach(function(item, i) {
			item.selected = false;
			self.filters[i].label === filter ? (self.filters[i].selected = true) : (self.filters[i].selected = false);
		});
	}

	ngOnInit() {}

	delete(item) {
		this.selectedItem = item;
		this.modalTitle = 'Delete Confirmation';
		this.modalContent = 'Are you sure, you want to delete?';
		this.modalBtnText = 'Delete';
		this.modal.open();
	}

	deleteDSR() {
		this.alert.showLoader(true);
		this.http.DELETE(`${DSR_DELETE}${this.selectedItem._id}`).subscribe((res) => {
			console.log(res);
			this.alert.showLoader(false);
			this.modal.close();
			this.saveProps();
		});
	}

	share(item) {
		this.shareUrl =
			location.protocol +
			'//' +
			location.hostname +
			(location.port ? ':' + location.port : '') +
			'/share/dsr/' +
			item._id;
		this.selectedItem = item;
		this.modalTitle = 'Share';
		this.modalBtnText = 'Copy To Clipboard';
		this.modalContent =
			'Copy the URL to share it!' + '\n' + '<span><strong>' + this.shareUrl + '</strong></span><br>';
		this.sharemodal.open();
	}

	copyToClipboard() {
		let dummy = document.createElement('input');
		document.body.appendChild(dummy);
		dummy.setAttribute('value', this.shareUrl);
		dummy.select();
		document.execCommand('copy');
		document.body.removeChild(dummy);
	}

	openDSR(elem, item) {
		this.selectedItem = item;
		this.selectedItem.showMenu = true;
		this.modalService.open(elem, { centered: true, size: 'lg' }).result.then(
			(result) => {
				console.log(result);
			},
			(reason) => {
				console.log(reason);
			}
		);
	}
}
