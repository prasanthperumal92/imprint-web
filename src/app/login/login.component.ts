import { Httpservice } from './../services/httpservice.service';
import { AlertService } from './../services/alert.service';
import { Component, OnInit } from '@angular/core';
import { LOGIN } from '../../constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public model: any = {};
  constructor(private alert: AlertService, private http: Httpservice) { }

  ngOnInit() {
  }

  onSubmit() {
    console.log(this.model);
    if(!this.model.phone || this.model.phone.length < 3) {
      this.alert.showAlert("Please Enter a valid Phone Number ", "warning");  
      return false;
    } else if (!this.model.password || this.model.password.length < 3) {
      this.alert.showAlert("Password doesn't match the requirement", "warning");
      return false;
    }
    
    this.http.POST(LOGIN, this.model)
    .subscribe((res) => {
      console.log(res);
      if(res.status){
        this.alert.showAlert("Success", "success");
      } else {
        this.alert.showAlert("Authentication Failed! Invalid Credentials", "error");
      }
    });        
  }
}
