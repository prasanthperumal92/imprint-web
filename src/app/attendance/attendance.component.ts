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

  constructor(public http: Httpservice, public alert: AlertService, public modalService: NgbModal) {
    this.getCalendar();
  }

  ngOnInit() {
    this.count = 0;
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
      this.alert.showLoader(false);
      if (res) {
        this.data = res;
        for (let i = 0; i < res.length; i++) {
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
          eventTextColor: "white"
        };
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

  updateLeave(status) {
    const tmp = {
      _id: this.selectedItem._id,
      status: status,
      comments: this.comments
    };
    this.alert.showLoader(true);
    this.http.PUT(GET_ATTENDANCE, tmp).subscribe(res => {
      this.alert.showLoader(false);
      this.clearAll();
      this.selectedMenu = "Calendar";
      this.getCalendar();
    });
  }
}
