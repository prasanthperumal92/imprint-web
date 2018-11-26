import { DsrComponent } from './dsr/dsr.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '', redirectTo: '/login', pathMatch: 'full' 
  },
  {
    path: 'login', component: LoginComponent  
  }, 
  {
    path: 'dashboard', component: DashboardComponent
  },
  {
    path: 'dashboard/dsr', component: DsrComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }