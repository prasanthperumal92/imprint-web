import { ProfileComponent } from './profile/profile.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { MyCalendarComponent } from './calendar/calendar.component';
import { ClientComponent } from './client/client.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { TaskComponent } from "./task/task.component";
import { ShareComponent } from "./helpers/share/share.component";
import { DsrComponent } from "./dsr/dsr.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { NgModule, Component } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { TrackComponent } from './track/track.component';
import { TeamComponent } from './team/team.component';

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
  },
  {
    path: "dashboard/tracking",
    component: TrackComponent
  },
  {
    path: "dashboard/client",
    component: ClientComponent
  },
  {
    path: "dashboard/client/:id",
    component: ClientComponent
  },
  {
    path: "dashboard/calendar",
    component: MyCalendarComponent
  },
  {
    path: "dashboard/analytics",
    component: AnalyticsComponent
  },
  {
    path: "dashboard/profile",
    component: ProfileComponent
  },
  {
    path: "dashboard/team",
    component: TeamComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
