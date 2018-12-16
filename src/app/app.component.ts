import { Router, NavigationEnd } from '@angular/router';
import { AlertService } from './services/alert.service';
import { Component } from '@angular/core';
import { StoreService } from './store/store.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'imprint';
  message: string;
  type: string;
  loader: boolean = false;

  constructor(private alert: AlertService, private router: Router, private store: StoreService) {
    router.events.subscribe((event: any) => {
      console.log(event);
      if (event instanceof NavigationEnd) {
        if (event.url !== '/login' && !this.store.get('isLoggedIn')) {
          this.router.navigate(['login']);
        }
      }
    });

    // Alert observable
    this.alert.getAlert().subscribe(alert => {
      this.message = alert ? alert.message : null;
      this.type = alert ? alert.type : null;
      // Clear after 3 seconds
      setTimeout(() => {
        this.alert.clearAlert();
      }, 10000);
    });

    this.alert.getLoader().subscribe(loader => {
      this.loader = loader;
    });
  }


}
