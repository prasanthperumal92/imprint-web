import { AlertService } from './../../services/alert.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'alert',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  @Input() type: String;
  @Input() message: String;

  constructor(private alert: AlertService) { }

  ngOnInit() {
    console.log(this.type, this.message);
  }

  close() {
    this.alert.clearAlert();
  }

}
