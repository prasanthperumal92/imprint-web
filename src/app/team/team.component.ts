import { AlertService } from "./../services/alert.service";
import { Httpservice } from "./../services/httpservice.service";
import { Component, OnInit } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TEAM } from "../../constants";
import { StoreService } from "../store/store.service";
import * as _ from "lodash";

@Component({
  selector: "app-team",
  templateUrl: "./team.component.html",
  styleUrls: ["./team.component.css"]
})
export class TeamComponent implements OnInit {
  public teams: any = [];
  public employees: any = [];
  public plannedEmps: any = [];
  public selectedTeam: any = {};
  public leader: any = [];
  public levelA: any = [];
  public levelB: any = [];
  public levelC: any = [];
  public isEdit = false;

  public modalRef: NgbModalRef;
  public selected: any = {
    name: "",
    leader: [],
    levelA: [],
    levelB: [],
    levelC: []
  };

  constructor(public http: Httpservice, public alert: AlertService, public store: StoreService, public modalService: NgbModal) {
    this.employees = this.store.get("photos");
    this.plannedEmps = this.store.get("photos");
    this.getTeams();
  }

  ngOnInit() {
  }

  openCreate(elem) {
    this.plannedEmps = this.store.get("photos");
    this.selected = {
      name: "",
      leader: [],
      levelA: [],
      levelB: [],
      levelC: []
    };
    this.isEdit = false;
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

  openEdit(elem, selectedTeam) {
    let emps = this.store.get("photos");
    this.selected = {
      name: selectedTeam.name,
      leader: [],
      levelA: [],
      levelB: [],
      levelC: []
    };
    this.isEdit = true;
    this.selectEmp(_.remove(emps, function (e) { return e.id === selectedTeam.leaderId; })[0], "0");
    for (let i = 0; i < selectedTeam.members.length; i++) {
      emps = this.store.get("photos");
      const arr = _.remove(emps, function (e) { return e.id === selectedTeam.members[i].userId; });
      this.selectEmp(
        arr[0],
        selectedTeam.members[i].level);
    }
    console.log(this.selected);
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
    this.leader = [{ userId: team.leaderId }];
    this.mergeEmployeeData(this.leader);
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

  selectEmp(emp, pointer) {
    if (pointer === "0") {
      if (this.selected.leader.length > 0) {
        this.alert.showAlert("Cannot Add Multiple Leader to Same Team!", "warning");
        return;
      } else {
        this.selected.leader.push(emp);
      }
    } else if (pointer === "1") {
      this.selected.levelA.push(emp);
    } else if (pointer === "2") {
      this.selected.levelB.push(emp);
    } else if (pointer === "3") {
      this.selected.levelC.push(emp);
    }
    this.plannedEmps = _.remove(this.plannedEmps, function (e) { return e.id !== emp.id; });
  }

  removeEmp(emp, pointer) {
    let key = "";
    if (pointer === "0") {
      key = "leader";
    } else if (pointer === "1") {
      key = "levelA";
    } else if (pointer === "2") {
      key = "levelB";
    } else if (pointer === "3") {
      key = "levelC";
    }
    const itemRemoved = _.remove(this.selected[key], function (e) { return e.id !== emp.id; });
    this.selected[key] = itemRemoved;
    const arr = this.store.get("photos");
    const item = _.remove(arr, function (e) { return e.id === emp.id; });
    this.plannedEmps.push(item[0]);
  }

  onSubmit() {
    if (!this.selected.name) {
      this.alert.showAlert("Please enter a title to your team", "warning");
      return;
    } else if (this.selected.leader.length === 0) {
      this.alert.showAlert("Please select a Leader to your team", "warning");
      return;
    } else if (this.selected.levelA.length === 0 && (this.selected.levelB.length > 0 || this.selected.levelC.length > 0)) {
      this.alert.showAlert("Level 1 cannot be empty!!", "warning");
      return;
    } else if (this.selected.levelB.length === 0 && this.selected.levelC.length > 0) {
      this.alert.showAlert("Add Level 2 before adding Level 3!!", "warning");
      return;
    }

    if (!this.isEdit) {
      let found = false;
      for (let i = 0; i < this.teams.length; i++) {
        if (this.teams[i].name === this.selected.name) {
          found = true;
        }
      }
      if (found) {
        this.alert.showAlert("Cannot Use Same Name Again!! Please try different..", "warning");
        return;
      }
    }

    this.modalRef.close();
    this.alert.showLoader(true);

    const data: any = {};
    data.name = this.selected.name;
    data.leaderId = this.selected.leader[0].id;
    data.members = [...this.getIdName(this.selected.levelA, "1"),
    ...this.getIdName(this.selected.levelB, "2"),
    ...this.getIdName(this.selected.levelC, "3")];
    console.log(data, this.isEdit);
    if (this.isEdit) {
      data._id = this.selectedTeam._id;
      this.http.PUT(TEAM, data).subscribe(res => {
        console.log(res);
        this.getTeams();
        this.alert.showLoader(false);
      });
    } else {
      this.http.POST(TEAM, data).subscribe(res => {
        console.log(res);
        this.getTeams();
        this.alert.showLoader(false);
      });
    }
  }

  getIdName(arr, level) {
    let res = [];
    for (let i = 0; i < arr.length; i++) {
      res.push({ userId: arr[i].id, level: level });
    }
    return res;
  }

  openDelete(elem, item) {
    this.modalRef = this.modalService.open(elem, { centered: true, size: "sm" });
    this.modalRef.result.then(
      result => {
        console.log(result);
      },
      reason => {
        console.log(reason);
      }
    );
  }

  deleteTeam() {
    this.modalRef.close();
    this.alert.showLoader(true);
    this.http.DELETE(`${TEAM}/${this.selectedTeam._id}`).subscribe(res => {
      console.log(res);
      this.getTeams();
      this.alert.showLoader(false);
    });
  }

}
