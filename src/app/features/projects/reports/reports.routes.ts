import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { projectTypeListRptComponent } from './projectTypeListRpt/projectTypeListRpt.component';
import { projectCountryListRptComponent } from './projectCountryListRpt/projectCountryListRpt.component';

export const reportsRoutes: Routes = [
  {
    path: 'CountryProjectList', component: projectCountryListRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'ProjectsHdr' } //ProjectsHdr.view
  },

  {
    path: 'TypeProjectList', component: projectTypeListRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'ProjectsHdr' }
  },
];
