import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { aidRequestsComponent } from './aidRequests/aidRequests.component';

export const operationsRoutes: Routes = [

   {
    path: 'AidRequests', component: aidRequestsComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'AidRequest' } // AidRequest  ,   AidRequest.View
  },
];
