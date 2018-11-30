import { Router } from '@angular/router';
import { StoreService } from './../store/store.service';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public apps: any = [];

  constructor(public store: StoreService, public router: Router) { 
    if(!this.store.get('isLoggedIn')) {
      this.router.navigate(['login']);
    }   
    
    this.apps = _.orderBy(this.store.get('config').appList, ['id'], ['asc']);       
  }

  ngOnInit() {
  }

  goto(path: string) {
    this.router.navigate(['dashboard/'+path]);
  }
}
