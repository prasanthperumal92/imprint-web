import { Component, OnInit, ViewChild } from "@angular/core";
import { CalendarComponent } from "ng-fullcalendar";
import { Options } from "fullcalendar";
import { AlertService } from "./../services/alert.service";
import { Httpservice } from "./../services/httpservice.service";
import { NgbModalConfig, NgbModal, NgbModalRef, NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";
import { CALENDAR } from "../../constants";
import * as moment from "moment";
import * as _ from "lodash";
import { CommonService } from '../services/common.service';

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.css"]
})
export class MyCalendarComponent implements OnInit {
  public calendarOptions: Options;
  public data: any = [];
  public events: any = [];
  public date: Date;
  public selectedEvent: any = {};
  public eventType: String = "";
  public photos = {};

  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
  constructor(public http: Httpservice, public alert: AlertService, public modalService: NgbModal, public common: CommonService) {
    const tmp = this.common.getAllEmpData();
    for (let i = 0; i < tmp.length; i++) {
      this.photos[tmp[i].id] = {
        name: tmp[i].name, photo: tmp[i].photo
      };
    }
  }

  ngOnInit() {
    const d = new Date();
    this.date = d;
    this.getCalendar();
  }

  renderCalendar(events) {
    const self = this;
    this.calendarOptions = {
      header: {
        left: "",
        center: "title",
        right: "customLeft, customRight"   // customLeft,customRight
      },
      customButtons: {
        customLeft: {
          text: "Prev",
          click: function () {
            self.date = moment(self.date).subtract(1, "month").toDate();
            self.ucCalendar.fullCalendar("prev");
            self.getCalendar();
          }
        },
        customRight: {
          text: "Next",
          click: function () {
            self.date = moment(self.date).add(1, "month").toDate();
            self.ucCalendar.fullCalendar("next");
            self.getCalendar();
          }
        },
      },
      defaultView: "month",
      editable: true,
      events: events,
      eventBackgroundColor: "green",
      eventTextColor: "white",
      fixedWeekCount: false,
      eventClick: function (calEvent, jsEvent, view) {

        console.log("Event: " + calEvent.title);
        console.log("Coordinates: " + jsEvent.pageX + "," + jsEvent.pageY);
        console.log("View: " + view.name);

      }
    };
    // this.ucCalendar.fullCalendar("refetchEvents");
  }

  public getCalendar() {
    const self = this;
    this.alert.showLoader(true);
    this.events = [];
    this.http.GET(`${CALENDAR}/${this.date.getFullYear()}/${this.date.getMonth() + 1}`).subscribe(res => {
      console.log(res);
      this.alert.showLoader(false);
      // this.ucCalendar.fullCalendar("removeEventSource", this.events);
      if (res) {
        this.data = [...this.data, ...res.dsr, ...res.task, ...res.leave];
        for (let i = 0; i < this.data.length; i++) {
          const item = this.data[i];
          let tmp: any = {};
          if (item.effort) {
            tmp.id = item._id;
            tmp.allDay = true;
            tmp.title = `DSR: ${item.name}, ${item.effort.client}`;
            tmp.start = moment(item.effort.followup, "YYYY-MM-DD").toDate();
            tmp.end = moment(item.effort.followup, "YYYY-MM-DD").add(1, "days").toDate();
            tmp.color = "green";
          } else if (item.days) {
            if (item.status) {
              tmp.id = item._id;
              tmp.allDay = true;
              tmp.title = `Leave: ${this.photos[item.appliedBy].name}, ${item.type}`;
              tmp.start = moment(item.start, "YYYY-MM-DD").toDate();
              tmp.end = moment(item.end, "YYYY-MM-DD").add(1, "days").toDate();
              tmp.color = "purple";
            }
          } else {
            tmp.id = item._id;
            tmp.allDay = true;
            tmp.title = `Task: ${this.photos[item.assignedTo].name}, ${item.status}`;
            tmp.start = moment(item.created, "YYYY-MM-DD").toDate();
            tmp.end = moment(item.created, "YYYY-MM-DD").add(1, "days").toDate();
            tmp.color = "blue";
          }
          this.events.push(tmp);
        }
      }
      this.renderCalendar(this.events);
      // setTimeout(() => {
      //   self.alert.hideLoader();
      // }, 2000);
    });
  }

  eventClick(popup, detail) {
    console.log(detail);
    this.selectedEvent = _.find(this.data, { _id: detail.event.id });
    if (this.selectedEvent.effort) {
      this.eventType = "dsr";
    } else if (this.selectedEvent.due) {
      this.eventType = "task";
    } else if (this.selectedEvent.days) {
      this.eventType = "leave";
    }
    this.modalService.open(popup, { centered: true, size: "lg" }).result.then(
      result => {
        console.log(result);
      },
      reason => {
        console.log(reason);
      }
    );
  }
}
