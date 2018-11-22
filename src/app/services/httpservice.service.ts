import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable({
  providedIn: 'root'
})
export class Httpservice {
  constructor(private http: HttpClient) { }
  BASE_URL = environment.baseUrl;      

  public GET(API_URL, data = ''): Observable<any> {      
    //httpOptions.set('Authorization', );
    return this.http
      .get(`${this.BASE_URL}${API_URL}`, { headers: this.getHeaders() })      
      .map(response => {
        return response;
      })
      .catch(this.handleError);
  };


  public POST(API_URL, data = ''): Observable<any> {
    //httpOptions.set('Authorization', );
    return this.http
      .post(`${this.BASE_URL}${API_URL}`, data, { headers: this.getHeaders() })
      .map(response => {
        return response;
      })
      .catch(this.handleError);
  };

  private handleError(error: Response | any) {
    console.error('ApiService::handleError', error);
    return Observable.throw(error);
  }

  private getHeaders() {    
    let httpOptions = new HttpHeaders();
    httpOptions.append('Content-Type', 'application/json'); 
    return httpOptions;   
  }
}
