import { StoreService } from "./../store/store.service";
import { Httpservice } from "./../services/httpservice.service";
import { AlertService } from "./../services/alert.service";
import { Component, OnInit } from "@angular/core";
import { LOGIN } from "../../constants";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {

  public model: any = {};
  constructor(private alert: AlertService, private http: Httpservice, private router: Router, private store: StoreService) {
    if (this.store.get("isLoggedIn")) {
      this.router.navigate(["dashboard"]);
    } else {
      this.store.clear();
      document.getElementsByTagName("body")[0].click();
    }
  }

  ngOnInit() {
  }

  onSubmit() {
    console.log(this.model);
    if (!this.model.phone || this.model.phone.length < 3) {
      this.alert.showAlert("Please Enter a valid Phone Number ", "warning");
      return false;
    } else if (!this.model.password || this.model.password.length < 3) {
      this.alert.showAlert("Password doesn't match the requirement", "warning");
      return false;
    }

    this.alert.showLoader(true);

    this.http.LOGIN(LOGIN, this.model)
      .subscribe((res) => {
        if (res.status) {
          this.alert.showLoader(false);
          this.store.set("isLoggedIn", res.status);
          this.store.set("token", res.accessToken);
          this.store.set("apps", res.appList);
          this.store.set("config", res.keys);
          const tmp = res.keys;
          let details = {}, leads = {}, sales = {}, products = {};
          for (let i = 0; i < tmp.details.length; i++) {
            details[tmp.details[i].key] = tmp.details[i].value;
          }
          for (let i = 0; i < tmp.lead.length; i++) {
            leads[tmp.lead[i].key] = tmp.lead[i].value;
          }
          for (let i = 0; i < tmp.sales.length; i++) {
            sales[tmp.sales[i].key] = tmp.sales[i].value;
          }
          for (let i = 0; i < tmp.product.length; i++) {
            products[tmp.product[i].key] = tmp.product[i].value;
          }
          this.store.set("details", details);
          this.store.set("leads", leads);
          this.store.set("sales", sales);
          this.store.set("products", products);
          this.router.navigate(["dashboard"]);
          this.alert.showAlert("Success", "success");
        } else {
          this.store.clear();
          this.alert.showAlert("Authentication Failed! Invalid Credentials", "error");
        }
      });
  }
}
