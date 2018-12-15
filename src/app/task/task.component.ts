import { ModalComponent } from "../helpers/modal/modal.component";
import { AlertService } from "./../services/alert.service";
import { StoreService } from "../store/store.service";
import { Httpservice } from "./../services/httpservice.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ResourcesService } from "../config/resources.service";
import { DSR_FILTER, GET_TASK } from "../../constants";
import { NgbDate, NgbCalendar } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import * as _ from "lodash";
import {
  NgbModalConfig,
  NgbModal,
  NgbModalRef
} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-task",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.css"]
})
export class TaskComponent implements OnInit {
  public data: any = [];
  public show = false;
  public filters = this.resources.filter;
  public fromDate;
  public toDate;
  public sort = "modified";
  public skip = 0;
  public limit = 20;
  public label;
  public order = -1;
  public sorted = "Visited";
  public taskList: any = [];
  public page: Number = 1;
  public filterBy: any = {
    employee: [],
    status: ["New", "Progress", "Done", "Completed", "Removed"]
  };
  public filterSelected = {
    Employee: "Employee",
    Status: "Status"
  };
  public query: any = {};
  public filter: any = null;
  @ViewChild("modal") modal: ModalComponent;
  @ViewChild("popup") popup;
  public modalTitle;
  public modalContent;
  public modalBtnText;
  public selectedItem;

  toggle() {
    this.show = !this.show;
  }

  calendarData(obj) {
    let choosen = this.resources.getFilter("Custom Date");
    choosen.from = new Date(obj.from.year, obj.from.month - 1, obj.from.day);
    choosen.to = new Date(obj.to.year, obj.to.month - 1, obj.to.day);
    this.fromDate = moment(choosen.from)
      .startOf("day")
      .toDate();
    this.toDate = moment(choosen.to)
      .endOf("day")
      .toDate();
    this.store.set("dateFilter", choosen);
    this.label = choosen.label;
    this.toggle();
    this.setProps();
    this.saveProps();
  }

  getTasks(query) {
    this.alert.showLoader(true);
    this.http.POST(GET_TASK, query).subscribe(res => {
      console.log(res);
      this.alert.showLoader(false);
      this.taskList = res;
    });
  }

  getFilter() {
    this.http.GET(DSR_FILTER).subscribe(res => {
      console.log(res);
      this.filterBy.employee = res.name.sort();
    });
  }

  selected(filter: string, open?: any) {
    this.selectButton(filter);
    if (filter === "Custom Date") {
      if (!open) {
        this.toggle();
      } else {
        this.dateFilter(filter);
      }
    } else {
      this.dateFilter(filter);
    }
  }

  public applyFilters(type, key, value) {
    this.clearFils();
    this.filterSelected[type] = value;
    this.query.filter = this.filter = {};
    this.filter = { key: key, value: value };
    this.query.filter = this.filter;
    this.setProps();
    this.saveProps();
  }

  dateFilter(filter) {
    let choosen = this.resources.getFilter(filter);
    this.label = filter;
    if (typeof choosen.from.year === "number") {
      let from = new Date(
        choosen.from.year,
        choosen.from.month,
        choosen.from.day
      );
      let to = new Date(choosen.to.year, choosen.to.month, choosen.to.day);
      this.fromDate = moment(from)
        .startOf("day")
        .toDate();
      this.toDate = moment(to)
        .endOf("day")
        .toDate();
    } else {
      this.fromDate = moment(choosen.from)
        .startOf("day")
        .toDate();
      this.toDate = moment(choosen.to)
        .endOf("day")
        .toDate();
    }
    this.page = 1;
    this.setProps();
    this.saveProps();
  }

  public applyorder(order) {
    this.order = order;
    this.setProps();
    this.saveProps();
  }

  saveProps() {
    console.log("query", this.query);
    this.getTasks(this.query);
  }

  selectButton(filter) {
    let self = this;
    this.filters.forEach(function(item, i) {
      item.selected = false;
      self.filters[i].label === filter
        ? (self.filters[i].selected = true)
        : (self.filters[i].selected = false);
    });
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
    this.store.set("taskquery", this.query);
  }

  constructor(
    public http: Httpservice,
    public calendar: NgbCalendar,
    public resources: ResourcesService,
    public store: StoreService,
    public alert: AlertService,
    public modalService: NgbModal
  ) {
    this.query = this.store.get("taskquery");
    // this.selected("Today", false); // By default choose Today000000........0
    if (this.query) {
      this.selected(this.query.label, true);
      this.fromDate = this.query.fromDate;
      this.toDate = this.query.toDate;
    } else {
      this.query = {};
      this.selected("Today", false); // By default choose Today
    }
    this.getFilter();
  }

  ngOnInit() {}

  clearFilter() {
    this.filter = null;
    this.query.filter = this.filter;
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

  openTask(elem, item) {
    this.selectedItem = item;
    this.selectedItem.showMenu = true;
    this.modalService.open(elem, { centered: true, size: "lg" }).result.then(
      result => {
        console.log(result);
      },
      reason => {
        console.log(reason);
      }
    );
  }

  shareTask(item) {
    let shareURL =
      location.protocol +
      "//" +
      location.hostname +
      (location.port ? ":" + location.port : "") +
      "/share/task/" +
      item._id;
    this.selectedItem = item;
    this.modalTitle = "Share";
    this.modalContent =
      "Copy the URL to share it!" +
      "\n" +
      "<span><strong>" +
      shareURL +
      "</strong></span>";
    this.modal.open();
  }

  loadPage(page: any) {
    this.page = page;
    this.query.skip = this.skip = page === 1 ? 0 : (page - 1) * this.limit;
    this.saveProps();
  }

  createTask(elem, type) {
    this.modalService.open(elem, { centered: true, size: "lg" }).result.then(
      result => {
        console.log(result);
      },
      reason => {
        console.log(reason);
      }
    );
  }
}
