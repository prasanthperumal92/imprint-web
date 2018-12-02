import { AlertService } from './alert.service';
import { StoreService } from './../store/store.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable({
  providedIn: "root"
})
export class Httpservice {
  constructor(
    private http: HttpClient,
    private store: StoreService,
    private alert: AlertService
  ) {}
  MASTER_URL = environment.masterURL;
  BASE_URL = environment.baseUrl;
  self = this;

  public GET(API_URL): Observable<any> {
    //httpOptions.set('Authorization', );
    return this.http
      .get(`${this.BASE_URL}${API_URL}`, { headers: this.getHeaders() })
      .map(response => {
        return response;
      })
      .catch(this.handleError);
  }

  public POST(API_URL, data = {}): Observable<any> {
    //httpOptions.set('Authorization', );
    return this.http
      .post(`${this.BASE_URL}${API_URL}`, data, { headers: this.getHeaders() })
      .map(response => {
        return response;
      })
      .catch(this.handleError);
  }

  public DELETE(API_URL): Observable<any> {
    //httpOptions.set('Authorization', );
    return this.http
      .delete(`${this.BASE_URL}${API_URL}`, { headers: this.getHeaders() })
      .map(response => {
        return response;
      })
      .catch(this.handleError);
  }

  public LOGIN(API_URL, data = {}): Observable<any> {
    //httpOptions.set('Authorization', );
    return this.http
      .post(`${this.MASTER_URL}${API_URL}`, data, {
        headers: this.getHeaders()
      })
      .map(response => {
        return response;
      })
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
    this.self.alert.showLoader(false);
    this.self.alert.showAlert("Server Error", "error");
    console.error("ApiService::handleError", error);
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
