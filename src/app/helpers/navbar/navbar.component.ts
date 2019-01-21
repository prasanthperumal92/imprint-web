import { Httpservice } from "./../../services/httpservice.service";
import { AlertService } from "./../../services/alert.service";
import { Router } from "@angular/router";
import { StoreService } from "./../../store/store.service";
import { Component, OnInit } from "@angular/core";
import { EMPLOYEE_PROFILE } from "../../../constants";

@Component({
  selector: "navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
  public name: string;
  public photo: string;
  constructor(public store: StoreService, public router: Router, public alert: AlertService, public http: Httpservice) {
    const pro = this.store.get("profile");
    if (pro) {
      this.name = pro.employee.name;
      this.photo = pro.employee.photo;
    } else {
      this.store.changes.subscribe(data => {
        console.log("From header", data);
        if (data.type === "profile") {
          this.name = data.value.employee.name;
          this.photo = data.value.employee.photo;
        }
      });
    }
  }

  ngOnInit() {
  }

  logout() {
    this.alert.showLoader(true);
    this.alert.showLoader(true);
    this.http.DELETE(EMPLOYEE_PROFILE).subscribe((res) => {
      this.store.clear("isLoggedIn");
      this.router.navigate(["login"]);
      this.alert.showAlert("Logged Out Successfully", "success");
      this.alert.showLoader(false);
    });
  }

}
