import { Injectable } from "@angular/core";
import {
  NgbDate,
  NgbCalendar
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import * as _ from "lodash";

@Injectable({
  providedIn: "root"
})
export class ResourcesService {

  constructor(private calendar: NgbCalendar) { }

  public crypto = {
    enabled: true,  // set enabled true to have enc/dec in our application
    privateKey: "AKNGaqN8+Y73V5BQOp5SUnk8hWss"
  };

  public filter = [{
    name: "T",
    label: "Today",
    selected: true,
    from: moment(),
    to: moment()
  },
  {
    name: "Y",
    label: "Yesterday",
    selected: false,
    from: moment().subtract(1, "day"),
    to: moment().subtract(1, "day")
  },
  {
    name: "Cw",
    label: "Current Week",
    selected: false,
    from: moment().startOf("isoWeek"),
    to: moment().endOf("isoWeek")
  },
  {
    name: "Lw",
    label: "Last Week",
    selected: false,
    from: moment().subtract(1, "weeks").startOf("isoWeek"),
    to: moment().subtract(1, "weeks").endOf("isoWeek")
  },
  {
    name: "Cm",
    label: "Current Month",
    selected: false,
    from: moment().startOf("month"),
    to: moment().endOf("month")
  },
  {
    name: "Lm",
    label: "Last Month",
    selected: false,
    from: moment().subtract(1, "month").startOf("month"),
    to: moment().subtract(1, "month").endOf("month")
  },
  {
    name: "3mn",
    label: "3 Months",
    selected: false,
    from: moment().subtract(2, "month").startOf("month"),
    to: moment().endOf("month")
  },
  {
    name: "6mn",
    label: "6 Months",
    selected: false,
    from: moment().subtract(5, "month").startOf("month"),
    to: moment().endOf("month")
  },
  {
    name: "1yr",
    label: "1 Year",
    selected: false,
    from: moment().subtract(1, "year"),
    to: moment()
  },
  {
    name: "Custom",
    label: "Custom Date",
    selected: false,
    from: this.calendar.getToday(),
    to: this.calendar.getNext(this.calendar.getToday(), "d", 2)
  }];

  getFilter(name) {
    return _.find(this.filter, ["label", name]);
  }

  formatDate(date) {
    return new Date(date);
    // let year = date.getFullYear();
    // let month = date.getMonth() + 1;
    // let day = date.getDate();
    // return new NgbDate(year, month, day);
  }
}
