import { Httpservice } from "./services/httpservice.service";
import { AlertService } from "./services/alert.service";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HttpClientModule } from "@angular/common/http";
import { Cloudinary as CloudinaryCore } from "cloudinary-core";
import { CloudinaryConfiguration, CloudinaryModule } from "@cloudinary/angular-5.x";
import { Cloudinary } from "@cloudinary/angular-5.x/src/cloudinary.service";
import { FileUploadModule } from "ng2-file-upload";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { AlertsComponent } from "./helpers/alerts/alerts.component";
import { FormsModule } from "@angular/forms";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { NavbarComponent } from "./helpers/navbar/navbar.component";
import { DsrComponent } from "./dsr/dsr.component";
import { HeaderComponent } from "./helpers/header/header.component";
import { DatepickerComponent } from "./helpers/datepicker/datepicker.component";
import { ModalComponent } from "./helpers/modal/modal.component";
import { ShareComponent } from "./helpers/share/share.component";
import { TaskComponent } from "./task/task.component";
import { TruncatePipe } from "./pipes/truncate.pipe";
import { AttendanceComponent } from "./attendance/attendance.component";
import { FullCalendarModule } from "ng-fullcalendar";
import { TrackComponent } from "./track/track.component";
import { ClientComponent } from "./client/client.component";
import { MyCalendarComponent } from "./calendar/calendar.component";
import { ProfileComponent } from "./profile/profile.component";
import { AnalyticsComponent } from "./analytics/analytics.component";

import { CLOUDINARY_NAME, CLOUDINARY_PRESET } from "../constants";
import { BarchartComponent } from "./chart/barchart/barchart.component";
import { PiechartComponent } from './chart/piechart/piechart.component';

export const cloudinary = {
  Cloudinary: CloudinaryCore
};
export const config: CloudinaryConfiguration = {
  cloud_name: CLOUDINARY_NAME,
  upload_preset: CLOUDINARY_PRESET
};


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AlertsComponent,
    DashboardComponent,
    NavbarComponent,
    DsrComponent,
    HeaderComponent,
    DatepickerComponent,
    ModalComponent,
    ShareComponent,
    TaskComponent,
    TruncatePipe,
    AttendanceComponent,
    TrackComponent,
    ClientComponent,
    MyCalendarComponent,
    ProfileComponent,
    AnalyticsComponent,
    BarchartComponent,
    PiechartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    FormsModule,
    HttpClientModule,
    FullCalendarModule,
    CloudinaryModule.forRoot(cloudinary, config),
    FileUploadModule
  ],
  providers: [AlertService, Httpservice],
  bootstrap: [AppComponent]
})
export class AppModule { }
