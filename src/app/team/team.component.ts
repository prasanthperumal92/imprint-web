import { AlertService } from "./../services/alert.service";
import { Httpservice } from "./../services/httpservice.service";
import { Component, OnInit } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TEAM } from "../../constants";
import { StoreService } from "../store/store.service";

@Component({
  selector: "app-team",
  templateUrl: "./team.component.html",
  styleUrls: ["./team.component.css"]
})
export class TeamComponent implements OnInit {
  public teams: any = [];
  public employees: any = [];
  public selectedTeam: any = {};
  public levelA: any = [];
  public levelB: any = [];
  public levelC: any = [];

  public modalRef: NgbModalRef;

  constructor(public http: Httpservice, public alert: AlertService, public store: StoreService, public modalService: NgbModal) {
    this.employees = this.store.get("photos");
    this.getTeams();
  }

  ngOnInit() {
  }

  openCreate(elem) {
    this.modalRef = this.modalService.open(elem, { centered: true, size: "lg" });
    this.modalRef.result.then(
      result => {
        console.log(result);
      },
      reason => {
        console.log(reason);
      }
    );
  }

  getTeams() {
    this.alert.showLoader(true);
    this.http.GET(TEAM).subscribe(res => {
      console.log(res);
      this.teams = res;
      if (this.teams.length > 0) {
        this.selectTeam(this.teams[0]);
      }
      this.alert.showLoader(false);
    });
  }

  selectTeam(team) {
    this.selectedTeam = team;
    this.clearLevels();
    for (let i = 0; i < team.members.length; i++) {
      const member = team.members[i];
      if (member.level === "1") {
        this.levelA.push(member);
      } else if (member.level === "2") {
        this.levelB.push(member);
      } else if (member.level === "3") {
        this.levelC.push(member);
      }
    }
    this.mergeEmployeeData(this.levelA);
    this.mergeEmployeeData(this.levelB);
    this.mergeEmployeeData(this.levelC);
  }

  mergeEmployeeData(team) {
    for (let i = 0; i < team.length; i++) {
      for (let j = 0; j < this.employees.length; j++) {
        if (team[i].userId === this.employees[j].id) {
          team[i].name = this.employees[j].name;
          team[i].photo = this.employees[j].photo;
          team[i].designation = this.employees[j].designation;
        }
      }
    }
  }

  clearLevels() {
    this.levelA = [];
    this.levelB = [];
    this.levelC = [];
  }
}
