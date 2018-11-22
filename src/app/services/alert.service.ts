import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class AlertService {

  private alert = new Subject<any>();
  
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
 
}