import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guars';
import { totalRequestsEntitiesRPTComponent } from './totalRequestsEntitiesRPT/totalRequestsEntitiesRPT.component';
import { requestDetailsEntitiesRPTComponent } from './requestDetailsEntitiesRPT/requestDetailsEntitiesRPT.component';


export const reportsRoutes: Routes = [
  {
    path: 'RequestDetailsReport', component: requestDetailsEntitiesRPTComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'ServiceRequestsDetailsRpt' }  //ServiceRequestsDetailsRpt.view
  },

  {
    path: 'TotalRequestsReport', component: totalRequestsEntitiesRPTComponent
    , canActivate: [authGuard],
    data: { pagePermission: 'TotalServiceRequestsRpt' }  //TotalServiceRequestsRpt.view
  },
];
