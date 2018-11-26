import { StoreService } from './../store/store.service';
import { ResourcesService } from './../config/resources.service';
import { Httpservice } from './../services/httpservice.service';
import { Component, OnInit } from '@angular/core';
import { DSR } from '../../constants';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

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

  constructor(private http: Httpservice, private calendar: NgbCalendar, private resources: ResourcesService, private store: StoreService) {
    let choosen = this.store.get('dateFilter');
    if (choosen) {
      this.selectButton(choosen.label);
      this.fromDate = choosen.from;
      this.toDate = choosen.to;
    } else {
      this.selected('Today'); // By default choose Today
    }
    this.http.GET(DSR).subscribe(res => {
      console.log(res);
    });

  }

  selected(filter: string) {
    if (filter === 'Custom Date') {
      this.toggle();
    } else {
      this.selectButton(filter);
      let choosen = this.resources.getFilter(filter);
      this.fromDate = choosen.from;
      this.toDate = choosen.to;
      this.store.set('dateFilter', choosen);
    }
  }

  selectButton(filter){
    let self = this;  
    this.filters.forEach(function (item, i) {
      item.selected = false;
      self.filters[i].label === filter ? self.filters[i].selected = true : self.filters[i].selected = false;
    });
  }

  ngOnInit() {
  }

}
