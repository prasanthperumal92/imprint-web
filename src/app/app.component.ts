import { AlertService } from './services/alert.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'imprint';
  message: string;
  type: string;

  constructor(private alert: AlertService) {
    // Alert observable
    this.alert.getAlert().subscribe(alert => {
      this.message = alert ? alert.message : null;
      this.type = alert ? alert.type : null;
      // Clear after 3 seconds
      setTimeout(() => {
        this.alert.clearAlert();
      }, 3000);      
    });    
  }


}
