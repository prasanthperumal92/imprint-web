import { AlertService } from './../../services/alert.service';
import { StoreService } from './../../store/store.service';
import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() title: string;
  constructor(public router: Router, public store: StoreService, public alert: AlertService) {
  }

  ngOnInit() {
  }

  goto(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.store.clear('isLoggedIn');
    setTimeout(() => {
      this.goto('login');
      this.alert.showAlert('Logged Out Successfully', 'success');
    }, 1000);
  }
}
