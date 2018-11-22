import { AlertService } from './../services/alert.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public model: any = {};
  constructor(private alert:AlertService) { }

  ngOnInit() {
  }

  onSubmit() {
    console.log(this.model);
    this.alert.showAlert("Hello World", "success");
  }
}
