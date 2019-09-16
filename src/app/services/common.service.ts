import { StoreService } from "./../store/store.service";
import { Injectable } from "@angular/core";

@Injectable()
export class CommonService {

  public empData = [];
  constructor(public store: StoreService) {
    this.empData = this.store.get("photos");
  }

  getAllEmpData() {
    this.empData = this.store.get("photos");
    for (let i = 0; i < this.empData.length; i++) {
      if (!this.empData[i].photo) {
        this.empData[i].photo = "/assets/images/default_user.png";
      }
    }
    return this.empData;
  }

  getOnlyMyEmpData() {
    let result = [];
    this.empData = this.store.get("photos");
    for (let i = 0; i < this.empData.length; i++) {
      if (this.empData[i].show) {
        if (!this.empData[i].photo) {
          this.empData[i].photo = "/assets/images/default_user.png";
        }
        result.push(this.empData[i]);
      }
    }
    return result;
  }

  getEmpData(id) {
    this.empData = this.store.get("photos");
    let found = false;
    for (let i = 0; i < this.empData.length; i++) {
      if (this.empData[i].id === id) {
        found = true;
        if (!this.empData[i].photo) {
          this.empData[i].photo = "/assets/images/default_user.png";
        }
        return this.empData[i];
      }
    }
    if (!found) {
      return {
        id: id,
        name: "Not Available",
        designation: "Not Available",
        photo: "/assets/images/default_user.png"
      };
    }
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }
}
