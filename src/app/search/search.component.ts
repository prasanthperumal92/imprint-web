import { StoreService } from './../store/store.service';
import { CommonService } from './../services/common.service';
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as moment from "moment";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.css"]
})
export class SearchComponent implements OnInit {
  public data;
  public taskColumn;
  public jobColumn;
  public clientColumn;
  public employees = {};
  public taskData = [];
  public jobData = [];
  public clientData = [];
  public type;
  public details = {};
  public profile;
  public leads = [];

  constructor(public route: ActivatedRoute, public common: CommonService, public store: StoreService) {
    this.profile = this.store.get("profile");
    let tmp: any;
    tmp = this.common.getAllEmpData();
    for (let i = 0; i < tmp.length; i++) {
      this.employees[tmp[i].id] = tmp[i].name;
    }
    tmp = this.store.get("config");
    for (let i = 0; i < tmp.details.length; i++) {
      this.details[tmp.details[i].key] = tmp.details[i].value;
    }
    this.leads = this.store.get("leads");
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const data: any = JSON.parse(params["data"]);
      this.type = params["type"];
      this.data = data;
      if (this.type === "team") {
        this.taskData = this.getLabels(this.data.data.task);
        this.jobData = this.getLabels(this.data.data.job);
        this.clientData = this.getLabels(this.data.data.client);
      } else if (this.type === "Today" || this.type === "Current Month" || this.type === "Current Week") {
        this.taskData = this.getLabels(this.data.task);
        this.jobData = this.getLabels(this.data.job);
        this.clientData = this.getLabels(this.data.client);
      }
      this.taskColumn = this.getColumnNames(this.taskData[0]);
      this.jobColumn = this.getColumnNames(this.jobData[0]);
      this.clientColumn = this.getColumnNames(this.clientData[0]);
      this.removeItem(this.jobColumn, "clientId");
    });
  }

  removeItem(arr, item) {
    const index = arr.indexOf(item);
    if (index !== -1) {
      arr.splice(index, 1);
    }
  }

  getColumnNames(obj) {
    let names = [];
    let key: any;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key !== "__v" && key !== "_id" && key !== "logs" && key !== "reference" && key !== "employeeId") {
          if (key === "status" || key === "lead") {
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

  getLabels(data) {
    for (let j = 0; j < data.length; j++) {
      for (let key in data[j]) {
        if (key === "assignedTo" || key === "assignedBy" || key === "createdBy" || key === "status") {
          if (key === "status") {
            data[j][key] = this.leads[data[j][key]];
          } else {
            data[j][key] = this.employees[data[j][key]];
          }
        }
      }
    }
    return data;
  }

  download() {
    let workbook: ExcelProper.Workbook = new Excel.Workbook();
    let fileName;
    if (this.type === "team" || this.type === "Today" || this.type === "Current Month" || this.type === "Current Week") {
      if (this.jobData.length > 0 && this.jobColumn.length > 0) {
        let jobSheet = workbook.addWorksheet(this.details["Aterm"]);
        jobSheet.columns = this.prepareColumns(this.jobColumn);
        this.addRowData(jobSheet, this.jobData);
      }
      if (this.taskData.length > 0 && this.taskColumn.length > 0) {
        let taskSheet = workbook.addWorksheet(this.details["Bterm"]);
        taskSheet.columns = this.prepareColumns(this.taskColumn);
        this.addRowData(taskSheet, this.taskData);
      }
      if (this.clientData.length > 0 && this.clientColumn.length > 0) {
        let clientSheet = workbook.addWorksheet(this.details["Cterm"]);
        clientSheet.columns = this.prepareColumns(this.clientColumn);
        this.addRowData(clientSheet, this.clientData);
      }

      if (this.type === "team") {
        fileName = `${this.data.title}_${this.profile.employee.name}_${new Date().getTime()}.xlsx`;
      } else {
        fileName = `${this.type}_${this.profile.employee.name}_${new Date().getTime()}.xlsx`;
      }
      this.downloadFile(workbook, fileName);
    }
  }

  downloadFile(workbook, fileName) {
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      let downloadLink = document.createElement("a");
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  prepareColumns(arr) {
    let tmp = [];
    arr.forEach(e => {
      tmp.push({
        header: e.toUpperCase(),
        key: e,
        width: 20
      });
    });
    return tmp;
  }

  addRowData(sheet, data) {
    for (let i = 0; i < data.length; i++) {
      let obj = {};
      const item = data[i];
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          if (this.isDate(item[key])) {
            obj[key] = moment(item[key]).format("lll");
          } else {
            obj[key] = item[key].toString();
          }
        }
      }
      sheet.addRow(obj);
    }
  }

  isDate(_date) {
    const _regExp = new RegExp('^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$');
    return _regExp.test(_date);
  }

}
