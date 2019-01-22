import { Httpservice } from "./../services/httpservice.service";
import { StoreService } from "./../store/store.service";
import { AlertService } from "./../services/alert.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { EMPLOYEE_PROFILE } from "../../constants";
import * as _ from "lodash";
import { NgbTabset } from "@ng-bootstrap/ng-bootstrap";

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
  public logs: any = [];
  public pass: any = {};
  public fileToUpload: File = null;
  public edit: Boolean = false;
  public model: any = {};
  @ViewChild("tabRef") public tabs: NgbTabset;

  constructor(public alert: AlertService, public store: StoreService, public http: Httpservice) {
    this.profile = this.store.get("profile");
    this.getProfile();
    this.employees = this.store.get("photos");
    this.manager = _.find(this.employees, { id: this.profile.employee.reportingTo }) || this.employees[0];
  }

  ngOnInit() {
  }

  editForm() {
    this.edit = true;
    this.model.phone = this.profile.employee.phone;
    this.model.email = this.profile.employee.email;
    this.model.address = this.profile.employee.address;
  }

  updatePass() {
    if (!this.pass.old || this.pass.old.length === 0) {
      this.alert.showAlert("Enter your Old Password!!", "warning");
      return false;
    } else if (this.pass.new !== this.pass.confirm) {
      this.alert.showAlert("New and Confirm Password are not Matching!!", "warning");
      return false;
    }
    this.alert.showLoader(true);
    this.http.PUT(EMPLOYEE_PROFILE, this.pass).subscribe((res) => {
      this.profile.employee.modified = new Date();
      this.pass = {};
      this.tabs.select("about");
      this.alert.showLoader(false);
    });
  }

  updateForm() {
    console.log(this.model);
    const emailValid = /\S+@\S+\.\S+/.test(this.model.email);
    if (!emailValid) {
      this.alert.showAlert("Email address entered is Invalid!!", "warning");
      return false;
    } else if (this.model.phone.toString().length !== 10) {
      this.alert.showAlert("Phone number should be 10 digit number", "warning");
      return false;
    } else if (!this.model.address.street || !this.model.address.city || !this.model.address.state || !this.model.address.pincode) {
      this.alert.showAlert("Address is Required!!", "warning");
      return false;
    } else if (this.model.address.pincode.toString().length !== 6) {
      this.alert.showAlert("Check the Pincode Entered!!!", "warning");
      return false;
    }

    this.model.address.country = "India";
    this.alert.showLoader(true);
    this.http.POST(EMPLOYEE_PROFILE, this.model).subscribe((res) => {
      this.profile.employee.modified = new Date();
      this.profile.employee.phone = this.model.phone;
      this.profile.employee.email = this.model.email;
      this.profile.employee.address = this.model.address;
      this.edit = false;
      this.alert.showLoader(false);
    });
  }

  getProfile() {
    this.alert.showLoader(true);
    this.http.GET(EMPLOYEE_PROFILE).subscribe((res) => {
      this.profile = res;
      this.photo = this.profile.employee.photo;
      this.profile.employee.address = {};
      this.store.set("profile", res);
      this.alert.showLoader(false);
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    console.log(this.fileToUpload);
  }

}
