import { ActivatedRoute } from "@angular/router";
import { AlertService } from "./../services/alert.service";
import { Httpservice } from "./../services/httpservice.service";
import { Component, OnInit } from "@angular/core";
import { GET_CLIENTS } from "../../constants";

@Component({
  selector: "app-client",
  templateUrl: "./client.component.html",
  styleUrls: ["./client.component.css"]
})
export class ClientComponent implements OnInit {
  public clientList: any = [];
  public client: any = {};
  public available = false;

  constructor(public http: Httpservice, public alert: AlertService, public route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id: any = params["id"];
      if (!id) {
        this.getClients();
      } else {
        this.openClient({ clientId: id });
      }
    });
  }

  getClients() {
    this.alert.showLoader(true);
    this.http.GET(GET_CLIENTS).subscribe(res => {
      this.alert.showLoader(false);
      this.available = true;
      this.clientList = res;
    });
  }

  openClient(item) {
    this.alert.showLoader(true);
    this.client = item;
    this.http.GET(`${GET_CLIENTS}/${item.clientId}`).subscribe(res => {
      this.alert.showLoader(false);
      if (res && res[0]) {
        this.available = true;
        this.client = res[0];
        this.client.logs.reverse();
      } else {
        // this.alert.showAlert("Client Information is wrong!!!!", "warning");
        this.available = false;
        this.goBack();
      }
    });
  }

  goBack() {
    this.client = {};
    this.getClients();
  }

}
