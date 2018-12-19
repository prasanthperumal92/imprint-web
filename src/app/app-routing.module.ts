import { AttendanceComponent } from './attendance/attendance.component';
import { TaskComponent } from "./task/task.component";
import { ShareComponent } from "./helpers/share/share.component";
import { DsrComponent } from "./dsr/dsr.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { NgModule, Component } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full"
  },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "dashboard",
    component: DashboardComponent
  },
  {
    path: "dashboard/dsr",
    component: DsrComponent
  },
  {
    path: "share/:type/:id",
    component: ShareComponent
  },
  {
    path: "dashboard/task",
    component: TaskComponent
  },
  {
    path: "dashboard/attendance",
    component: AttendanceComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
