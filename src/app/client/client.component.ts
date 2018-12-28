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

  constructor(public http: Httpservice, public alert: AlertService) {
    this.getClients();
  }

  ngOnInit() {
  }

  getClients() {
    this.alert.showLoader(true);
    this.http.GET(GET_CLIENTS).subscribe(res => {
      this.alert.showLoader(false);
      this.clientList = res;
    });
  }

  openClient(item) {
    this.alert.showLoader(true);
    this.client = item;
    this.http.GET(`${GET_CLIENTS}/${item.clientId}`).subscribe(res => {
      this.alert.showLoader(false);
      this.client = res[0] || {};
    });
  }

  goBack() {
    this.client = {};
    this.getClients();
  }

}
