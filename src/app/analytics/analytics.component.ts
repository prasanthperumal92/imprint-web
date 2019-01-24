import { Component, OnInit, ViewChild } from "@angular/core";
import { Chart } from "chart.js";

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.css"]
})
export class AnalyticsComponent implements OnInit {

  public chartData: Array<any>;
  public firstdata: Array<any>;
  public secondData: Array<any>;

  constructor() {
    this.chartData = [
      { "key": "Task", "value": 12 },
      { "key": "Client", "value": 10 },
      { "key": "DSR", "value": 19 }
    ];
  }

  ngOnInit() {
  }

}
