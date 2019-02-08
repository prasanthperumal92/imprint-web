import { CommonService } from './../services/common.service';
import { Httpservice } from "./../services/httpservice.service";
import { AlertService } from "./../services/alert.service";
import { StoreService } from "./../store/store.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Chart } from "chart.js";
import * as html2canvas from "html2canvas";
import { Router } from "@angular/router";
import { TEAM, TEAM_CHART } from "../../constants";
import * as moment from "moment";
import { ResourcesService } from "../config/resources.service";

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.css"]
})
export class AnalyticsComponent implements OnInit {

  public dailyChart: Array<any> = [];
  public weeklyChart: Array<any> = [];
  public monthlyChart: Array<any> = [];
  public teamData: Array<any> = [];
  public filters = this.resources.filter;
  public profile;
  public employees = [];
  public teams = [];

  constructor(public store: StoreService, public router: Router, public alert: AlertService, public http: Httpservice,
    public resources: ResourcesService, public common: CommonService) {
    if (!this.store.get("isLoggedIn")) {
      this.router.navigate(["login"]);
    }
    this.profile = this.store.get("profile");
    this.employees = this.common.getAllEmpData();
    this.dailyChart = [
      { "key": "Task", "value": 12 },
      { "key": "Client", "value": 10 },
      { "key": "DSR", "value": 19 }
    ];

    this.weeklyChart = [
      { "key": "Task", "value": 42 },
      { "key": "Client", "value": 56 },
      { "key": "DSR", "value": 70 }
    ];

    this.getTeams();
  }

  ngOnInit() {
  }

  downloadImage(id) {
    let element = document.querySelector("#" + id);
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

  getTeams() {
    this.alert.showLoader(true);
    this.http.GET(TEAM).subscribe(res => {
      console.log(res);
      this.teams = res;
      this.teams.forEach(team => {
        this.getTeamChart(team);
      });
      this.alert.showLoader(false);
    });
  }

  getTeamChart(team) {
    this.alert.showLoader(true);
    const filter = this.resources.getFilter("Current Week");
    const start = filter.from.format("YYYY-MM-DD");
    const end = filter.to.format("YYYY-MM-DD");
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

}
