import { AlertService } from './../../services/alert.service';
import { StoreService } from './../../store/store.service';
import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: "header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {
  public name: string;
  public photo: string;
  @Input() title: string;

  public showNotification = false;
  public count = 1;

  constructor(
    public router: Router,
    public store: StoreService,
    public alert: AlertService
  ) {
    let tmp = this.store.get('profile');
    this.name = tmp.employee.name;
    this.photo = tmp.employee.photo;
  }

  ngOnInit() { }

  goto(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.store.clear("isLoggedIn");
    setTimeout(() => {
      this.goto("login");
      this.alert.showAlert("Logged Out Successfully", "success");
    }, 1000);
  }

  show() {
    this.showNotification = !this.showNotification;
  }
}
