import { Component, OnInit, ViewChild } from "@angular/core";
import { CalendarComponent } from "ng-fullcalendar";
import { Options } from "fullcalendar";
import { AlertService } from "./../services/alert.service";
import { Httpservice } from "./../services/httpservice.service";
import { NgbModalConfig, NgbModal, NgbModalRef, NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";
import { CALENDAR } from "../../constants";
import * as moment from "moment";
import * as _ from "lodash";

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

  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
  constructor(public http: Httpservice, public alert: AlertService, public modalService: NgbModal) {

  }

  ngOnInit() {
    const d = new Date();
    this.date = d;
    this.getCalendar();
    const self = this;
    this.calendarOptions = {
      header: {
        left: "",
        center: "title",
        right: "customLeft,customRight"
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
      events: this.events,
      eventBackgroundColor: "green",
      eventTextColor: "white",
      eventClick: function (calEvent, jsEvent, view) {

        console.log("Event: " + calEvent.title);
        console.log("Coordinates: " + jsEvent.pageX + "," + jsEvent.pageY);
        console.log("View: " + view.name);

      }
    };
  }

  public getCalendar() {
    const self = this;
    this.alert.showLoader(true);
    this.events = [];
    this.http.GET(`${CALENDAR}/${this.date.getFullYear()}/${this.date.getMonth() + 1}`).subscribe(res => {
      console.log(res);
      if (res) {
        this.data = [...res.dsr, ...res.task, ...res.leave];
        for (let i = 0; i < this.data.length; i++) {
          const item = this.data[i];
          let tmp: any = {};
          if (item.effort) {
            tmp.id = item._id;
            tmp.allDay = true;
            tmp.title = `DSR: ${item.name}, ${item.effort.client}`;
            tmp.start = moment(item.created, "YYYY-MM-DD");
            tmp.end = moment(item.created, "YYYY-MM-DD").add(1, "days");
            tmp.color = "green";
            this.events.push(tmp);
          } else if (item.days) {
            tmp.id = item._id;
            tmp.allDay = true;
            tmp.title = `Leave: ${item.appliedBy.name}, ${item.type}`;
            tmp.start = moment(item.start, "YYYY-MM-DD");
            tmp.end = moment(item.end, "YYYY-MM-DD").add(1, "days");
            tmp.color = "purple";
          } else {
            tmp.id = item._id;
            tmp.allDay = true;
            tmp.title = `Task: ${item.assignedTo.name}, ${item.client}`;
            tmp.start = moment(item.created, "YYYY-MM-DD");
            tmp.end = moment(item.created, "YYYY-MM-DD").add(1, "days");
            tmp.color = "blue";
          }
          this.events.push(tmp);
        }
      }
      this.ucCalendar.fullCalendar("renderEvents", this.events);
      setTimeout(() => {
        self.alert.hideLoader();
      }, 2000);
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
