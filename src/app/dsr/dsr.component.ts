import { AlertService } from './../services/alert.service';
import { StoreService } from './../store/store.service';
import { ResourcesService } from './../config/resources.service';
import { Httpservice } from './../services/httpservice.service';
import { Component, OnInit } from '@angular/core';
import { DSR } from '../../constants';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-dsr',
  templateUrl: './dsr.component.html',
  styleUrls: ['./dsr.component.css']
})
export class DsrComponent implements OnInit {

  private data: any = [];
  public show = false;
  private filters = this.resources.filter;
  private fromDate;
  private toDate;
  private sort = 'created';
  private skip = 0;
  private limit = 20;
  private label;
  private order = -1;
  private sorted = 'Visited';
  private dsrList: any = [];
  private page: Number = 1;
  private sortBy: any = [{ key: 'Visited', value: 'created' }, { key: 'Client', value: 'effort.client' }, { key: 'Status', value: 'effort.sales' }, { key: 'Followup', value: 'effort.followup' }, { key: 'Employee', value: 'name' }];
  private filterBy: any = {
    employees: [],
    status: [],
    client: []
  };
  private filterSelected = {
    Employee: 'Employee',
    Client: 'Client',
    Status: 'Status'
  };
  private query: any = {};
  private filter: any = null;

  toggle() {
    this.show = !this.show;
  }

  calendarData(obj) {
    let choosen = this.resources.getFilter('Custom Date');
    choosen.from = new Date(obj.from.year, obj.from.month, obj.from.day);
    choosen.to = new Date(obj.to.year, obj.to.month, obj.to.day);
    this.fromDate = choosen.from;
    this.toDate = choosen.to;
    this.store.set('dateFilter', choosen);
    this.toggle();
  }

  constructor(private http: Httpservice, private calendar: NgbCalendar, private resources: ResourcesService, private store: StoreService, private alert: AlertService) {
    this.query = this.store.get('query');
    if (this.query) {
      this.selected(this.query.label);
      this.fromDate = this.query.fromDate;
      this.toDate = this.query.toDate;
    } else {
      this.query = {};
      this.selected('Today'); // By default choose Today
    }
  }

  getJobs(query) {
    this.alert.showLoader(true);
    this.http.POST(DSR, query).subscribe(res => {
      console.log(res);
      this.alert.showLoader(false);
      this.dsrList = res;
      this.filterBy.employees = _.uniqBy(res, 'name');
      this.filterBy.status = _.uniqBy(res, 'effort.sales');
      this.filterBy.client = _.uniqBy(res, 'effort.client');
    });
  }

  public applyFilters(type, key, value) {
    this.filterSelected[type] = value;
    this.query.filter = this.filter = {};
    this.filter = { key: key, value: value };
    this.query.filter = this.filter;
    this.saveProps();
  }

  public applySort(item) {
    this.sort = item.value;
    this.sorted = item.key;
    this.saveProps();
  }

  public applyorder(order){
    this.order = order;
    this.saveProps();
  }

  clearFilter() {
    this.filter = null;
    this.query.filter = this.filter;
    this.saveProps();
    this.filterSelected = {
      Employee: 'Employee',
      Client: 'Client',
      Status: 'Status'
    };
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
    this.store.set('query', this.query);
  }


  selected(filter: string) {
    if (filter === 'Custom Date') {
      this.toggle();
    } else {
      this.selectButton(filter);
      let choosen = this.resources.getFilter(filter);
      this.label = filter;
      this.fromDate = choosen.from;
      this.toDate = choosen.to;
      this.saveProps();
    }
  }

  saveProps() {
    this.setProps();
    this.getJobs(this.query);
  }

  selectButton(filter) {
    let self = this;
    this.filters.forEach(function (item, i) {
      item.selected = false;
      self.filters[i].label === filter ? self.filters[i].selected = true : self.filters[i].selected = false;
    });
  }

  ngOnInit() {
  }

}
