import { Httpservice } from './../services/httpservice.service';
import { Router } from '@angular/router';
import { StoreService } from './../store/store.service';
import { Component, OnInit } from '@angular/core';
import { EMPLOYEE_PROFILE, ALL_EMPLOYEE } from '../../constants';
import * as _ from 'lodash';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public apps: any = [];

  constructor(public store: StoreService, public router: Router, public http: Httpservice) {
    if (!this.store.get('isLoggedIn')) {
      this.router.navigate(['login']);
    }
    this.apps = _.orderBy(this.store.get('config').appList, ['id'], ['asc']);
    this.getProfile();
    this.getEmployees();
  }

  ngOnInit() {
  }

  goto(path: string) {
    this.router.navigate(['dashboard/' + path]);
  }

  getProfile() {
    this.http.GET(EMPLOYEE_PROFILE).subscribe((res) => {
      this.store.set('profile', res);
    });
  }

  getEmployees() {
    this.http.GET(ALL_EMPLOYEE).subscribe(res => {
      this.store.set('photos', res);
    });
  }
}
