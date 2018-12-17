import { AlertService } from './../../services/alert.service';
import { Router } from '@angular/router';
import { StoreService } from './../../store/store.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public name: string;
  public photo: string;
  constructor(public store: StoreService, public router: Router, public alert: AlertService) {
    const pro = this.store.get('profile');
    if (pro) {
      this.name = pro.employee.name;
      this.photo = pro.employee.photo;
    } else {
      this.store.changes.subscribe(data => {
        console.log('From header', data);
        if (data.type === 'profile') {
          this.name = data.value.employee.name;
          this.photo = data.value.employee.photo;
        }
      });
    }
  }

  ngOnInit() {
  }

  logout() {
    this.alert.showLoader(true);
    this.store.clear('isLoggedIn');
    setTimeout(() => {
      this.router.navigate(['login']);
      this.alert.showAlert('Logged Out Successfully', 'success');
      this.alert.showLoader(false);
    }, 1000);
  }

}
