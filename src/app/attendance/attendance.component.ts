import { CommonService } from './../services/common.service';
import { AlertService } from "./../services/alert.service";
import { Httpservice } from "./../services/httpservice.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { CalendarComponent } from "ng-fullcalendar";
import { Options } from "fullcalendar";
import { NgbModalConfig, NgbModal, NgbModalRef, NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";
import { GET_ATTENDANCE } from "../../constants";
import * as moment from "moment";
import * as _ from "lodash";

@Component({
  selector: "app-attendance",
  templateUrl: "./attendance.component.html",
  styleUrls: ["./attendance.component.css"]
})
export class AttendanceComponent implements OnInit {
  public calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
  @ViewChild("popup") popup;

  public menus = ["Calendar", "Inbox", "Approved Leaves", "Declined Leaves"];
  public selectedMenu = "Calendar";
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
  public leaveTypes = ["Sick Leave", "Casual Leave"];
  public selectedStatus = "Casual Leave";
  public minDate;

  constructor(public http: Httpservice, public alert: AlertService, public modalService: NgbModal, public common: CommonService) {
    this.getCalendar();
  }

  ngOnInit() {
    this.count = 0;
    const tomorrow = moment(new Date()).add(1, "days");
    this.minDate = this.convert(tomorrow.toDate());
  }

  public open(menu) {
    this.selectedMenu = menu;
    if (menu === "Approved Leaves") {
      this.leaves = this.approvedLeaves;
    } else if (menu === "Declined Leaves") {
      this.leaves = this.declinedLeaves;
    } else if (menu === "Inbox") {
      this.leaves = this.inboxLeaves;
    }
  }

  public getCalendar(str: string = "") {
    this.alert.showLoader(true);
    this.http.GET(`${GET_ATTENDANCE}${str}`).subscribe(res => {
      console.log(res);
      this.events = [];
      this.alert.showLoader(false);
      if (res) {
        this.data = res;
        for (let i = 0; i < res.length; i++) {
          res[i].appliedBy = this.common.getEmpData(res[i].appliedBy);
          res[i].approvedBy = this.common.getEmpData(res[i].approvedBy);
          if (res[i].status === "Approved") {
            this.approvedLeaves.push(res[i]);
            const tmp: any = {};
            tmp.id = res[i]._id;
            tmp.allDay = true;
            tmp.title = `${res[i].appliedBy.name}: ${res[i].title}`;
            tmp.start = moment(res[i].start, "YYYY-MM-DD");
            tmp.end = moment(res[i].end, "YYYY-MM-DD").add(1, "days");
            this.events.push(tmp);
          } else if (res[i].status === "Declined") {
            this.declinedLeaves.push(res[i]);
          } else if (!res[i].status) {
            this.inboxLeaves.push(res[i]);
            this.count++;
          }
        }
        console.log(this.events);
        this.calendarOptions = {
          defaultView: "month",
          editable: true,
          events: this.events,
          eventBackgroundColor: "green",
          eventTextColor: "white",
          fixedWeekCount: false
        };
        this.ucCalendar ? this.ucCalendar.fullCalendar("refetchEvents", this.events) : "";
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
    this.modalRef = this.modalService.open(elem, { centered: true, size: "lg" });
    this.modalRef.result.then(
      result => {
        console.log(result);
      },
      reason => {
        console.log(reason);
      }
    );
  }

  formatDate(date) {
    const d = new Date(date);
    return d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + (d.getDate());
  }

  openLeave(elem, item) {
    this.selectedItem = item;
    this.modalRef = this.modalService.open(elem, { centered: true, size: "lg" });
    this.modalRef.result.then(
      result => {
        console.log(result);
      },
      reason => {
        console.log(reason);
      }
    );
  }

  applyLeave(elem) {
    this.modalRef = this.modalService.open(elem, { centered: true, size: "lg" });
    this.modalRef.result.then(
      result => {
        console.log(result);
      },
      reason => {
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
    if (today.valueOf() > from.valueOf()) {
      this.alert.showAlert("Sorry, You cannot" + status + " Now!!!, Time has Elapsed", "warning");
      return false;
    }
    this.alert.showLoader(true);
    this.http.PUT(GET_ATTENDANCE, tmp).subscribe(res => {
      this.alert.showLoader(false);
      this.clearAll();
      this.getCalendar();
    });
  }

  onSubmit() {
    this.apply.type = this.selectedStatus;
    let from = this.apply.start;
    let to = this.apply.end;
    from = new Date(from.year, from.month, from.day);
    to = new Date(to.year, to.month, to.day);
    if (from.valueOf() > to.valueOf()) {
      this.alert.showAlert("Wrong Start date and End date selected", "warning");
      return false;
    }
    this.alert.showLoader(true);
    this.modalRef.close();
    this.apply.start = from;
    this.apply.end = to;
    console.log(this.apply);
    this.http.POST(GET_ATTENDANCE, this.apply).subscribe(res => {
      this.alert.showLoader(false);
      this.apply = {};
      this.clearAll();
      this.selectedMenu = "Calendar";
      this.getCalendar();
    });
  }

  applyType(item) {
    this.selectedStatus = item;
  }
}
