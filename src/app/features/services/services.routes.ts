import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guars';
import { MainApplyServiceComponent } from './mainApplyService/mainApplyService.component';
import { ServiceConfirmationComponent } from './serviceConfirmation/serviceConfirmation.component';
import { ServiceInqueryComponent } from './serviceInquery/serviceInquery.component';
import { FastingServiceInqueryComponent } from './fastingServiceInquery/fastingServiceInquery.component';
import { ViewFastingTentRequestComponent } from './view-fasting-tent-request/view-fasting-tent-request.component';
import { ViewDistributionSitePermitComponent } from './view-distribution-site-permit/view-distribution-site-permit.component';
import { ViewCharityEventPermitComponent } from './view-charity-event-permit/view-charity-event-permit.component';
import { ViewComplaintrequestComponent } from './view-complaintrequest/view-complaintrequest.component';
import { ViewRequesteventpermitComponent } from './view-requesteventpermit/view-requesteventpermit.component';
import { ViewRequestplaintComponent } from './view-requestplaint/view-requestplaint.component';
import { ViewAdvertisementComponent } from './view-advertisement/view-advertisement.component';

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

  {
    path: 'services/view-fasting-tent-request/:id', component: ViewFastingTentRequestComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View  //serviceId = 1
  },

  {
    path: 'services/charity-event-permit/:id', component: ViewCharityEventPermitComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View  //serviceId = 2
  },

  {
    path: 'services/advertisement/:id', component: ViewAdvertisementComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View  //serviceId = 5
  },

  {
    path: 'services/request-event-permit/:id', component: ViewRequesteventpermitComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View  //serviceId = 6
  },

  {
    path: 'services/plaint-request/:id', component: ViewRequestplaintComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View  //serviceId = 7
  },

  {
    path: 'services/view-distribution-site-permit/:id', component: ViewDistributionSitePermitComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View  //serviceId = 1001
  },

  {
    path: 'services/complaint-request/:id', component: ViewComplaintrequestComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'MainApplyRequestService' } // MainApplyRequestService  ,   MainApplyRequestService.View  //serviceId = 1002
  },
];
