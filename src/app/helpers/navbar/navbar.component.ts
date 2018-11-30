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

  constructor(public store: StoreService, public router: Router, public alert: AlertService) { }

  ngOnInit() {
  }

  logout() {
    this.store.clear('isLoggedIn');
    setTimeout(() => {
      this.router.navigate(['login']);   
      this.alert.showAlert('Logged Out Successfully', 'success');   
    }, 1000);
  }

}
