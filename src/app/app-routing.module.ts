import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { StatisticBinaryComponent } from './components/menus/all-responses/statistic-binary.component'
import { SearchUserComponent } from './components/menus/search-user/search-user.component';
import { SearchQuestionComponent } from './components/menus/search-response/search-question.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'statistics-binary', component: StatisticBinaryComponent, canActivate: [AuthGuard]},
  {path: 'search-user', component: SearchUserComponent, canActivate: [AuthGuard]},
  {path: 'search-question', component: SearchQuestionComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
