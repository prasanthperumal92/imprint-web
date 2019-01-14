import { Httpservice } from "./../services/httpservice.service";
import { StoreService } from "./../store/store.service";
import { AlertService } from "./../services/alert.service";
import { Component, OnInit } from "@angular/core";
import { EMPLOYEE_PROFILE } from "../../constants";
import * as _ from "lodash";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  public profile: any;
  public photo = "/assets/images/default_user.png";
  public employees: any = [];
  public manager: any = {};

  constructor(public alert: AlertService, public store: StoreService, public http: Httpservice) {
    this.profile = this.store.get("profile");
    this.getProfile();
    this.employees = this.store.get("photos");
    this.manager = _.find(this.employees, { id: this.profile.employee.reportingTo });
  }

  ngOnInit() {
  }

  getProfile() {
    this.alert.showLoader(true);
    this.http.GET(EMPLOYEE_PROFILE).subscribe((res) => {
      this.profile = res;
      this.photo = this.profile.employee.photo;
      this.store.set("profile", res);
      this.alert.showLoader(false);
    });
  }

}
