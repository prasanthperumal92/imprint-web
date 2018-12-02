import { Httpservice } from './../../services/httpservice.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DSR_SHARE} from '../../../constants';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {
  id: number;
  private sub: any;
  public data;
  constructor(public http: Httpservice, public route: ActivatedRoute) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      console.log(this.id);
      this.http.GET(`${DSR_SHARE}${this.id}`).subscribe((res) => {
        this.data = res;
        if (Object.keys(this.data).length === 0) {
          this.data.nothing = true;
        }
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
