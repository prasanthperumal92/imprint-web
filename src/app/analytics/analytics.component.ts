import { CommonService } from "./../services/common.service";
import { Httpservice } from "./../services/httpservice.service";
import { AlertService } from "./../services/alert.service";
import { StoreService } from "./../store/store.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Chart } from "chart.js";
import * as html2canvas from "html2canvas";
import { Router } from "@angular/router";
import { TEAM, TEAM_CHART, CHART } from "../../constants";
import * as moment from "moment";
import { ResourcesService } from "../config/resources.service";

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.css"]
})
export class AnalyticsComponent implements OnInit {

  public dailyChartData: Array<any>;
  public weeklyChartData: Array<any>;
  public monthlyChartData: Array<any>;
  public teamData: Array<any> = [];
  public filters = this.resources.filter;
  public profile;
  public employees = [];
  public teams = [];
  public fromDate;
  public toDate;
  public show = false;

  constructor(public store: StoreService, public router: Router, public alert: AlertService, public http: Httpservice,
    public resources: ResourcesService, public common: CommonService) {
    if (!this.store.get("isLoggedIn")) {
      this.router.navigate(["login"]);
    }
    this.profile = this.store.get("profile");
    this.employees = this.common.getAllEmpData();
    this.getMyChart("Today");
    this.getMyChart("Current Week");
    this.getMyChart("Current Month");
    this.filters.pop();
    this.getTeams();
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
      if (type === "Today") {
        this.dailyChartData = res;
      } else if (type === "Current Week") {
        this.weeklyChartData = res;
      } else {
        this.monthlyChartData = res;
      }
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
    this.http.GET(`${TEAM_CHART}${team._id}/${start}/${end}`).subscribe(res => {
      res.data = this.getNames(res.data);
      this.teamData.push(res);
      console.log(res);
      this.alert.showLoader(false);
    });
  }

  getNames(data) {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < this.employees.length; j++) {
        if (data[i].name === this.employees[j].id) {
          data[i].name = this.employees[j].name;
        }
      }
    }
    return data;
  }

  getElement(id) {
    return document.getElementsByClassName(id);
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

  toggle() {
    this.show = !this.show;
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

}
