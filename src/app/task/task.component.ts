import { ModalComponent } from "../helpers/modal/modal.component";
import { AlertService } from "./../services/alert.service";
import { StoreService } from "../store/store.service";
import { Httpservice } from "./../services/httpservice.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ResourcesService } from "../config/resources.service";
import { DSR_FILTER, GET_TASK, CREATE_TASK, GET_CLIENTS } from "../../constants";
import { NgbDate, NgbCalendar } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import * as _ from "lodash";
import { NgbModalConfig, NgbModal, NgbModalRef, NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";
import { Observable, Subject, merge } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, map } from "rxjs/operators";
import { Router } from '@angular/router';

@Component({
  selector: "app-task",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.css"]
})
export class TaskComponent implements OnInit {
  @ViewChild("modal") modal: ModalComponent;
  @ViewChild("popup") popup;
  @ViewChild("instance") instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
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
  public modalTitle;
  public modalContent;
  public modalBtnText;
  public selectedItem;
  public model: any = {};
  public employees = {};
  public selectedEmployee = {
    name: "Select Employee",
    photo: "/assets/images/default_user.png"
  };
  public selectedDate: any = {};
  public clients = [];
  public taskModalTitle;
  public taskModalBtn;
  public clientName;
  public type;
  public selectedStatus;
  public modalRef: NgbModalRef;

  search = (text: Observable<string>) => {
    console.log(JSON.stringify(text));
    return text.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.clients.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );
  }

  constructor(
    public http: Httpservice,
    public calendar: NgbCalendar,
    public resources: ResourcesService,
    public store: StoreService,
    public alert: AlertService,
    public modalService: NgbModal,
    public router: Router
  ) {
    this.query = this.store.get("taskquery");
    this.employees = this.store.get("photos");
    this.clients = this.store.get("clients") ? _.map(this.store.get("clients"), "name") : [];
    if (this.query) {
      this.selected(this.query.label, true);
      this.fromDate = this.query.fromDate;
      this.toDate = this.query.toDate;
    } else {
      this.query = {};
      this.selected("Today", false); // By default choose Today
    }
    this.getFilter();
    this.getClients();
  }

  toggle() {
    this.show = !this.show;
  }

  calendarData(obj) {
    const choosen = this.resources.getFilter("Custom Date");
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

  public applyEditFilters(value) {
    this.model.status = value;
    this.selectedStatus = value;
  }

  dateFilter(filter) {
    const choosen = this.resources.getFilter(filter);
    this.label = filter;
    if (typeof choosen.from.year === "number") {
      const from = new Date(
        choosen.from.year,
        choosen.from.month,
        choosen.from.day
      );
      const to = new Date(choosen.to.year, choosen.to.month, choosen.to.day);
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
    const self = this;
    this.filters.forEach(function (item, i) {
      item.selected = false;
      self.filters[i].label === filter
        ? (self.filters[i].selected = true)
        : (self.filters[i].selected = false);
    });
  }

  goto(page) {
    this.router.navigate(["dashboard/" + page]);
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

  ngOnInit() { }

  clearFilter() {
    this.filter = null;
    this.query.filter = this.filter;
    this.setProps();
    this.saveProps();
    this.clearFils();
  }

  clearFils() {
    for (const k in this.filterSelected) {
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
    const shareURL =
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

  createTask(elem, type, item) {
    this.type = type;
    this.getClients();
    this.taskModalTitle = "Add Task";
    this.taskModalBtn = "Create Task";
    if (type === "edit") {
      this.taskModalTitle = "Edit Task";
      this.taskModalBtn = "Update Task";
      this.model = item;
      this.selectedStatus = this.model.status;
      this.model.contact = this.model.contact.length > 10 ? this.model.contact.substr(3, this.model.contact.length) : this.model.contact;
      this.selectedEmployee = _.find(this.employees, { id: this.model.assignedTo.id });
      this.selectedDate = {
        year: new Date(this.model.due).getFullYear(),
        month: new Date(this.model.due).getMonth() + 1,
        day: new Date(this.model.due).getDate()
      };
    }
    this.selectedItem = this.model;
    this.modalRef = this.modalService.open(elem, { centered: true, size: "lg" });
    this.modalRef.result.then(
      result => {
        console.log(result);
      },
      reason => {
        console.log(reason);
        if (reason === 0) { this.model = {}; }
      }
    );
  }

  clientSubmit(elem, type, item) {
    this.alert.showLoader(true);
    this.http.POST(GET_CLIENTS, { name: this.clientName }).subscribe(res => {
      console.log(res);
      this.alert.showLoader(false);
      this.createTask(elem, type, item);
    });
  }

  getClients() {
    this.http.GET(GET_CLIENTS).subscribe((res) => {
      this.clients = res ? _.map(res, "name") : [];
      this.store.set("clients", res);
    });
  }

  onSubmit() {
    if (!this.model.assignedTo) {
      this.alert.showAlert("Please select a Employee to assign the Task", "warning");
      return false;
    } else if (!this.selectedDate.day) {
      this.alert.showAlert("Please select due date for the Task", "warning");
      return false;
    } else if (this.clients.indexOf(this.model.client) === -1) {
      this.alert.showAlert("Your client is not available, So click 'Add  Client' button to add one", "warning");
      return false;
    } else if (this.model.contact.toString().length !== 10) {
      this.alert.showAlert("Phone number should be 10 digit number", "warning");
      return false;
    }
    this.modalRef.close();
    if (!this.model._id) {
      this.model.due = new Date(this.selectedDate.year, this.selectedDate.month - 1, this.selectedDate.day, 23, 59);
      this.model.status = "New";
    }
    this.model.contact = "+91" + this.model.contact;
    console.log(this.model);
    this.alert.showLoader(true);
    let tmp = JSON.parse(JSON.stringify(this.model));
    tmp.assignedTo = tmp.assignedTo.id;
    this.http.POST(CREATE_TASK, tmp).subscribe(res => {
      console.log(res);
      if (!this.model._id) {
        this.alert.showAlert("Task Created SuccessFully", "success");
      } else {
        this.alert.showAlert("Task Updated SuccessFully", "success");
      }
      this.alert.showLoader(false);
      this.saveProps();
    });
  }

  selectEmp(item) {
    this.selectedEmployee = item;
    this.model.assignedTo = item.id;
  }

  createClient(elem) {
    this.taskModalTitle = "Add Client";
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
