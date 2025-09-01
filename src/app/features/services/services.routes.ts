import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guars';
import { MainApplyServiceComponent } from './mainApplyService/mainApplyService.component';
import { ServiceConfirmationComponent } from './serviceConfirmation/serviceConfirmation.component';
import { ServiceInqueryComponent } from './serviceInquery/serviceInquery.component';
import { FastingServiceInqueryComponent } from './fastingServiceInquery/fastingServiceInquery.component';

export const servicesRoutes: Routes = [
  {
    path: 'services', component: MainApplyServiceComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View
  },

  {
    path: 'services/serviceconfirmation/:id', component: ServiceConfirmationComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View
  },

  {
    path: 'services/serviceinquery/:id', component: ServiceInqueryComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View
  },

  {
    path: 'services/fastingserviceinquery/:id', component: FastingServiceInqueryComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View
  },
];
