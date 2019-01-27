import { AlertService } from './../services/alert.service';
import { StoreService } from "./../store/store.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Chart } from "chart.js";
import * as html2canvas from "html2canvas";
import { Router } from "@angular/router";

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.css"]
})
export class AnalyticsComponent implements OnInit {

  public dailyChart: Array<any>;
  public weeklyChart: Array<any>;
  public monthlyChart: Array<any>;
  public profile;

  constructor(public store: StoreService, public router: Router, public alert: AlertService) {
    if (!this.store.get("isLoggedIn")) {
      this.router.navigate(["login"]);
    }
    this.profile = this.store.get("profile");

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

}
