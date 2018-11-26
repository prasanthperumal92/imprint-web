import { Router } from '@angular/router';
import { StoreService } from './../../store/store.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private store: StoreService, private router: Router) { }

  ngOnInit() {
  }

  logout() {
    this.store.clear('isLoggedIn');
    setTimeout(() => {
      this.router.navigate(['login']);      
    }, 1000);
  }

}
