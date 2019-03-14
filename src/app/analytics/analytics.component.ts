import { CommonService } from "./../services/common.service";
import { Httpservice } from "./../services/httpservice.service";
import { AlertService } from "./../services/alert.service";
import { StoreService } from "./../store/store.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Chart } from "chart.js";
import * as html2canvas from "html2canvas";
import { Router } from "@angular/router";
import { TEAM, TEAM_CHART, CHART, DOWNLOAD, LEAD, LEAD_DATA } from "../../constants";
import * as moment from "moment";
import { ResourcesService } from "../config/resources.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.css"]
})
export class AnalyticsComponent implements OnInit {

  public monthlyLeadData: Array<any>;
  public dailyChartData: Array<any>;
  public weeklyChartData: Array<any>;
  public monthlyChartData: Array<any>;
  public teamData: Array<any> = [];
  public filters = this.resources.filter;
  public modalRef: NgbModalRef;
  public profile;
  public employees = [];
  public teams = [];
  public fromDate;
  public toDate;
  public show = false;
  public details = {};
  public leads = {};
  public selectedFilter;
  public columnNames;
  public selectedData;
  public user = {};
  public leadChart;

  constructor(public store: StoreService, public router: Router, public alert: AlertService, public http: Httpservice,
    public resources: ResourcesService, public common: CommonService, public modalService: NgbModal, ) {
    if (!this.store.get("isLoggedIn")) {
      this.router.navigate(["login"]);
    }
    this.profile = this.store.get("profile");
    this.details = this.store.get("details");
    this.leads = this.store.get("leads");
    this.employees = this.common.getAllEmpData();
    let tmp: any;
    tmp = this.common.getAllEmpData();
    for (let i = 0; i < tmp.length; i++) {
      this.user[tmp[i].id] = tmp[i].name;
    }
    // if (this.profile.employee.type === "employee" || this.profile.employee.type === "leader") {
    //   this.getMyChart("Today");
    //   this.getMyChart("Current Week");
    //   this.getMyChart("Current Month");
    // }
    // // this.filters.pop();
    // this.getMyLead("Current Month");
    // this.getTeams();
    this.leadChart = {
      id: "leadChart",
      title: "Lead Status",
      description: "Number of leads completed in the selected time period.",
      xAxisName: "Count",
      yAxisName: "Activity",
      type: "lead"
    };
  }

  ngOnInit() {
  }

  downloadImage(id) {
    const element = document.querySelector("#" + id);
    const name = `${this.profile.employee.name}_${id.toUpperCase()}_${new Date().getTime()}.png`;
    this.alert.showLoader(true);
    const self = this;
    setTimeout(() => {
      html2canvas(element).then(canvas => {
        self.alert.showLoader(false);
        const a = document.createElement("a");
        a.setAttribute("download", name);
        a.setAttribute("href", canvas.toDataURL());
        a.click();
      });
    }, 1000);
  }

  getMyChart(type) {
    this.alert.showLoader(true);
    const filter = this.resources.getFilter(type);
    const start = filter.from.format("YYYY-MM-DD");
    const end = filter.to.format("YYYY-MM-DD");
    this.http.GET(`${CHART}/${type}/${start}/${end}`).subscribe(res => {
      console.log(res);
      const tmp = this.getLabels(this.checkEmpty(res));
      if (type === "Today") {
        tmp.length > 0 ? this.dailyChartData = tmp : '';
      } else if (type === "Current Week") {
        tmp.length > 0 ? this.weeklyChartData = tmp : '';
      } else {
        tmp.length > 0 ? this.monthlyChartData = tmp : '';
      }
      this.alert.showLoader(false);
    });
  }

  getMyLead(type) {
    this.alert.showLoader(true);
    const filter = this.resources.getFilter(type);
    const start = filter.from.format("YYYY-MM-DD");
    const end = filter.to.format("YYYY-MM-DD");
    this.http.GET(`${LEAD}/${start}/${end}`).subscribe(res => {
      console.log(res);
      const tmp = this.getLeadLabels(this.checkEmpty(res));
      tmp.length > 0 ? this.monthlyLeadData = tmp : '';
      this.alert.showLoader(false);
    });
  }

  getTeams() {
    this.alert.showLoader(true);
    this.http.GET(TEAM).subscribe(res => {
      console.log(res);
      this.teams = res;
      this.selected("Current Week");
      this.alert.showLoader(false);
    });
  }

  getTeamChart(team) {
    this.alert.showLoader(true);
    const start = moment(this.fromDate).format("YYYY-MM-DD");
    const end = moment(this.toDate).format("YYYY-MM-DD");
    const self = this;
    this.http.GET(`${TEAM_CHART}${team._id}/${start}/${end}`).subscribe(res => {
      res.data = this.getNames(res.data);
      const data = this.checkEmpty(res.data);
      if (data.length > 0) {
        this.teamData.push(res);
      }
      console.log(res);
      this.alert.showLoader(false);
    });
  }

  getNames(data) {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < this.employees.length; j++) {
        if (data[i].name === this.employees[j].id) {
          data[i].name = this.employees[j].name;
          data[i].type = this.details[data[i].type];
        }
      }
    }
    return data;
  }

  getLabels(data) {
    for (let j = 0; j < data.length; j++) {
      data[j].key = this.details[data[j].key];
    }
    return data;
  }

  getLeadLabels(data) {
    for (const prop in this.leads) {
      if (this.leads.hasOwnProperty(prop)) {
        let found = false;
        for (let j = 0; j < data.length; j++) {
          if (data[j].key === prop) {
            data[j].key = this.leads[data[j].key];
            data[j].other = prop;
            found = true;
          }
        }
        if (!found) {
          data.push({ key: this.leads[prop], value: 0, other: prop });
        }
      }
    }
    return data;
  }

  getElement(id) {
    return document.getElementsByClassName(id);
  }

  selected(filter: string, open?: any) {
    this.selectedFilter = filter;
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

  toggle() {
    this.show = !this.show;
  }

  checkEmpty(arr) {
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].value === 0) {
        count++;
      }
    }
    if (count === arr.length) {
      return [];
    } else {
      return arr;
    }
  }

  dateFilter(filter) {
    const choosen = this.resources.getFilter(filter);
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
    this.teamData = [];
    this.teams.forEach(team => {
      this.getTeamChart(team);
    });
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
  }

  showData(type, id?) {
    this.alert.showLoader(true);
    let query;
    if (type === 'team') {
      const start = moment(this.fromDate).format("YYYY-MM-DD");
      const end = moment(this.toDate).format("YYYY-MM-DD");
      query = `${DOWNLOAD}/${type}/${start}/${end}/${id}`;
    } else {
      const choosen = this.resources.getFilter(type);
      const start = moment(choosen.from).format("YYYY-MM-DD");
      const end = moment(choosen.to).format("YYYY-MM-DD");
      query = `${DOWNLOAD}/${type}/${start}/${end}`;
    }
    this.http.GET(query).subscribe(res => {
      console.log(res);
      this.router.navigate(["dashboard/search", { type: type, data: JSON.stringify(res) }]);
      this.alert.showLoader(false);
    });
  }

  openModal(elem, data) {
    this.alert.showLoader(true);
    const filter = this.resources.getFilter("Current Month");
    const start = filter.from.format("YYYY-MM-DD");
    const end = filter.to.format("YYYY-MM-DD");
    this.http.GET(`${LEAD_DATA}/${start}/${end}/${data.other}`).subscribe(res => {
      console.log(res);
      this.alert.showLoader(false);
      if (res && res[0]) {
        this.columnNames = this.getColumnNames(res[0]);
        this.selectedData = this.getTableData(res);
        this.modalRef = this.modalService.open(elem, { centered: true, size: "lg", backdrop: "static" });
        this.modalRef.result.then(
          result => {
            console.log(result);
          },
          reason => {
            console.log(reason);
          }
        );
      }
    });
  }

  closeModal() {
    this.modalRef.close();
  }

  getColumnNames(obj) {
    let names = [];
    let key: any;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key !== "__v" && key !== "_id" && key !== "logs" && key !== "reference" && key !== "employeeId") {
          if (key === "status") {
            const tmp = names[1];
            names[1] = key;
            names.push(tmp);
          } else {
            names.push(key);
          }
        }
      }
    }
    return names;
  }

  getTableData(data) {
    for (let j = 0; j < data.length; j++) {
      for (let key in data[j]) {
        if (key === "assignedTo" || key === "assignedBy" || key === "createdBy" || key === "status") {
          if (key === "status") {
            data[j][key] = this.leads[data[j][key]];
          } else {
            data[j][key] = this.user[data[j][key]];
          }
        }
      }
    }
    return data;
  }
}
