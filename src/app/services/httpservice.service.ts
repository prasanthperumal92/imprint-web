import { Router } from "@angular/router";
import { AlertService } from "./alert.service";
import { StoreService } from "./../store/store.service";
import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpEvent,
  HttpInterceptor
} from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";

@Injectable({
  providedIn: "root"
})
export class Httpservice {
  constructor(
    public http: HttpClient,
    public store: StoreService,
    public alert: AlertService,
    public router: Router
  ) { }
  MASTER_URL = environment.masterURL;
  BASE_URL = environment.baseUrl;
  self = this;

  public GET(API_URL): Observable<any> {
    return this.http
      .get(`${this.BASE_URL}${API_URL}`, { headers: this.getHeaders() })
      .map(response => {
        return response;
      })
      .catch((err, caught) => this.handleError(this, err, caught));
  }

  public POST(API_URL, data = {}): Observable<any> {
    return this.http
      .post(`${this.BASE_URL}${API_URL}`, data, {
        headers: this.getHeaders()
      })
      .map(response => {
        return response;
      })
      .catch((err, caught) => this.handleError(this, err, caught));
  }

  public PUT(API_URL, data = {}): Observable<any> {
    return this.http
      .put(`${this.BASE_URL}${API_URL}`, data, {
        headers: this.getHeaders()
      })
      .map(response => {
        return response;
      })
      .catch((err, caught) => this.handleError(this, err, caught));
  }

  public DELETE(API_URL): Observable<any> {
    return this.http
      .delete(`${this.BASE_URL}${API_URL}`, { headers: this.getHeaders() })
      .map(response => {
        return response;
      })
      .catch((err, caught) => this.handleError(this, err, caught));
  }

  public LOGIN(API_URL, data = {}): Observable<any> {
    return this.http
      .post(`${this.MASTER_URL}${API_URL}`, data, {
        headers: this.getHeaders()
      })
      .map(response => {
        return response;
      })
      .catch((err, caught) => this.handleError(this, err, caught));
  }

  private handleError(inst, error: Response | any, caught) {
    if (error.status === 401) {
      inst.store.clear();
      inst.router.navigate(["login"]);
      inst.alert.showAlert("Session Timeout,! Please Login again.", "danger");
    } else if (error.status === 400) {
      inst.alert.showAlert(error.error.message || "Server is Busy! Please try again.", "warning");
    } else {
      inst.alert.showAlert("Server is Busy! Please try again.", "danger");
    }
    inst.alert.showLoader(false);

    return Observable.throw(error);
  }

  private getHeaders() {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append("Content-Type", "application/json");
    this.store.get("token")
      ? (headers = headers.append("Authorization", this.store.get("token")))
      : "";
    return headers;
  }
}
