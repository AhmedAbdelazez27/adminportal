import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { aidRequestsComponent } from './aidRequests/aidRequests.component';
import { SpCasesComponent } from './spCases/spCases.component';

export const operationsRoutes: Routes = [

   {
    path: 'AidRequests', component: aidRequestsComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'AidRequest' } // AidRequest  ,   AidRequest.View
  },
  {
    path: 'SpCases', component: SpCasesComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'SpCases' } // SpCases  ,   SpCases.View
  },
];
