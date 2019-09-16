import { StoreService } from './../store/store.service';
import { CommonService } from './../services/common.service';
import { AlertService } from './../services/alert.service';
import { Httpservice } from './../services/httpservice.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import { NgbModalConfig, NgbModal, NgbModalRef, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { GET_ATTENDANCE } from '../../constants';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from 'exceljs';

@Component({
	selector: 'app-attendance',
	templateUrl: './attendance.component.html',
	styleUrls: [ './attendance.component.css' ]
})
export class AttendanceComponent implements OnInit {
	public calendarOptions: Options;
	@ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
	@ViewChild('popup') popup;

	public menus = [ 'Calendar', 'Inbox', 'Approved Leaves', 'Declined Leaves' ];
	public selectedMenu = 'Calendar';
	public events = [];
	public data = [];
	public leaves = [];
	public count = 0;
	public inboxLeaves = [];
	public approvedLeaves = [];
	public declinedLeaves = [];
	public selectedItem;
	public modalRef: NgbModalRef;
	public comments;
	public apply: any = {};
	public leaveTypes = [ 'Sick Leave', 'Casual Leave' ];
	public selectedStatus = 'Casual Leave';
	public minDate;
	public profile;
	public leaveColumn;

	constructor(
		public http: Httpservice,
		public alert: AlertService,
		public modalService: NgbModal,
		public common: CommonService,
		public store: StoreService
	) {
		this.getCalendar();
		this.profile = this.store.get('profile');
	}

	ngOnInit() {
		this.count = 0;
		const tomorrow = moment(new Date()).add(1, 'days');
		this.minDate = this.convert(tomorrow.toDate());
	}

	public open(menu) {
		this.selectedMenu = menu;
		if (menu === 'Approved Leaves') {
			this.leaves = this.approvedLeaves;
		} else if (menu === 'Declined Leaves') {
			this.leaves = this.declinedLeaves;
		} else if (menu === 'Inbox') {
			this.leaves = this.inboxLeaves;
		}
	}

	public getCalendar(str: string = '') {
		this.alert.showLoader(true);
		this.http.GET(`${GET_ATTENDANCE}${str}`).subscribe((res) => {
			console.log(res);
			this.events = [];
			this.alert.showLoader(false);
			if (res) {
				this.data = res;
				this.leaveColumn = this.getColumnNames(this.data[0]);
				for (let i = 0; i < res.length; i++) {
					res[i].appliedBy = this.common.getEmpData(res[i].appliedBy);
					res[i].approvedBy = this.common.getEmpData(res[i].approvedBy);
					if (res[i].status === 'Approved') {
						this.approvedLeaves.push(res[i]);
						const tmp: any = {};
						tmp.id = res[i]._id;
						tmp.allDay = true;
						tmp.title = `${res[i].appliedBy.name}: ${res[i].title}`;
						tmp.start = moment(res[i].start, 'YYYY-MM-DD').add(1, 'days');
						tmp.end = moment(res[i].end, 'YYYY-MM-DD').add(res[i].days, 'days');
						this.events.push(tmp);
					} else if (res[i].status === 'Declined') {
						this.declinedLeaves.push(res[i]);
					} else if (!res[i].status) {
						this.inboxLeaves.push(res[i]);
						this.count++;
					}
				}
				console.log(this.events);
				this.calendarOptions = {
					defaultView: 'month',
					editable: true,
					events: this.events,
					eventBackgroundColor: 'green',
					eventTextColor: 'white',
					fixedWeekCount: false
				};
				this.ucCalendar ? this.ucCalendar.fullCalendar('refetchEvents', this.events) : '';
			}
		});
	}

	public clearAll() {
		this.leaves = [];
		this.approvedLeaves = [];
		this.declinedLeaves = [];
		this.inboxLeaves = [];
		this.count = 0;
	}

	eventClick(elem, detail) {
		console.log(detail);
		let id = detail.event.id;
		this.selectedItem = _.find(this.data, { _id: id });
		this.modalRef = this.modalService.open(elem, { centered: true, size: 'lg' });
		this.modalRef.result.then(
			(result) => {
				console.log(result);
			},
			(reason) => {
				console.log(reason);
			}
		);
	}

	formatDate(date) {
		const d = new Date(date);
		return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getDate();
	}

	openLeave(elem, item) {
		this.selectedItem = item;
		this.modalRef = this.modalService.open(elem, { centered: true, size: 'lg' });
		this.modalRef.result.then(
			(result) => {
				console.log(result);
			},
			(reason) => {
				console.log(reason);
			}
		);
	}

	applyLeave(elem) {
		this.modalRef = this.modalService.open(elem, { centered: true, size: 'lg' });
		this.modalRef.result.then(
			(result) => {
				console.log(result);
			},
			(reason) => {
				console.log(reason);
			}
		);
	}

	convert(d) {
		return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
	}

	updateLeave(status) {
		const tmp = {
			_id: this.selectedItem._id,
			status: status,
			comments: this.comments
		};
		const today = new Date();
		const from = new Date(this.selectedItem.start);
		this.alert.showLoader(true);
		this.http.PUT(GET_ATTENDANCE, tmp).subscribe((res) => {
			location.reload();
		});
	}

	onSubmit() {
		this.apply.type = this.selectedStatus;
		let from = this.apply.start;
		let to = this.apply.end;
		from = new Date(from.year, from.month - 1, from.day);
		to = new Date(to.year, to.month - 1, to.day);
		if (from.valueOf() > to.valueOf()) {
			this.alert.showAlert('Wrong Start date and End date selected', 'warning');
			return false;
		}
		this.alert.showLoader(true);
		this.modalRef.close();
		this.apply.start = from;
		this.apply.end = to;
		console.log(this.apply);
		this.http.POST(GET_ATTENDANCE, this.apply).subscribe((res) => {
			this.alert.showLoader(false);
			this.apply = {};
			this.clearAll();
			this.selectedMenu = 'Calendar';
			this.getCalendar();
		});
	}

	applyType(item) {
		this.selectedStatus = item;
	}

	download() {
		let workbook: ExcelProper.Workbook = new Excel.Workbook();
		let fileName = `Leaves_${this.profile.employee.name}_${new Date().getTime()}.csv`;
		if (this.data.length > 0 && this.leaveColumn.length > 0) {
			let data = JSON.parse(JSON.stringify(this.data));
			let jobSheet = workbook.addWorksheet('Leaves');
			jobSheet.columns = this.prepareColumns(this.leaveColumn);
			this.addRowData(jobSheet, this.data);
			this.downloadFile(workbook, fileName);
		} else {
			this.alert.showAlert('No data to download!!! Please Refresh and Try again!!', 'warning');
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
				if (key !== '__v' && key !== '_id') {
					names.push(key);
				}
			}
		}
		return names;
	}

	addRowData(sheet, data) {
		for (let i = 0; i < data.length; i++) {
			let obj = {};
			const item = data[i];
			for (const key in item) {
				if (item.hasOwnProperty(key)) {
					if (this.isDate(item[key])) {
						obj[key] = moment(item[key]).format('lll');
					} else if (typeof item[key] === 'object') {
						obj[key] = item[key].name;
					} else {
						obj[key] = item[key] ? item[key].toString() : item[key];
					}
				}
			}
			sheet.addRow(obj);
		}
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

	isDate(_date) {
		const _regExp = new RegExp(
			'^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$'
		);
		return _regExp.test(_date);
	}
}
