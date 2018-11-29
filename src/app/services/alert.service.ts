import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class AlertService {

  private alert = new Subject<any>();
  private loader = new Subject<any>();
  
  showAlert(message: string, type: string) {
    this.alert.next({
      message: message,
      type: type
    });
  }

  getAlert(): Observable<any> {
    return this.alert.asObservable();
  }

  clearAlert() {
    this.alert.next();
  }

  showLoader(message: boolean) {
    this.loader.next(message);
  }

  hideLoader(){
    this.loader.next();
  }

  getLoader(){
    return this.loader.asObservable();
  }
 
}