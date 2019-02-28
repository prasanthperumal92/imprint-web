import { CommonService } from './../../services/common.service';
import { Httpservice } from './../../services/httpservice.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DSR_SHARE, TASK_SHARE } from '../../../constants';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {
  id: string;
  type: string;
  private sub: any;
  public data: any = {};
  public task;
  constructor(public http: Httpservice, public route: ActivatedRoute, public common: CommonService) { }

  ngOnInit() {
    let url;
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.type = params['type'];
      console.log(this.id, this.type);
      if (this.type === 'task') {
        url = TASK_SHARE;
      } else {
        url = DSR_SHARE;
      }
      this.http.GET(`${url}${this.id}`).subscribe((res) => {
        if (res) {
          this.data = res;
          this.data.assignedBy = this.common.getEmpData(this.data.assignedBy);
          this.data.assignedTo = this.common.getEmpData(this.data.assignedTo);
        }
        if (Object.keys(this.data).length === 0) {
          this.data = {};
          this.data.nothing = true;
        }
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
