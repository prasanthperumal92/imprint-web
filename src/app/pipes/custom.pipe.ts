import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";

@Pipe({
  name: "custom"
})
export class CustomPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (this.isDate(value)) {
      return moment(value).format("lll");
    } else if (typeof value === "string") {
      return value.length > 30 ? value.substr(0, 30) + "..." : value;
    } else {
      return value;
    }
  }

  isDate(_date) {
    const _regExp = new RegExp('^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$');
    return _regExp.test(_date);
  }

}
