import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { orderListBranchRptComponent } from '../../socialcases/reports/orderListBranchRpt/orderListBranchRpt.component';
import { ordersListCityRptComponent } from '../../socialcases/reports/ordersListCityRpt/ordersListCityRpt.component';
import { casesEntitiesRptComponent } from '../../socialcases/reports/casesEntitiesRpt/casesEntitiesRpt.component';
import { caseHelpRptComponent } from '../../socialcases/reports/caseHelpRpt/caseHelpRpt.component';

export const ReportsRoutes: Routes = [
  {
    path: 'BranchOrdersList', component: orderListBranchRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'OrderListBranchRpt' } // OrderListBranchRpt  ,   OrderListBranchRpt.View
  },
  {
    path: 'EmiratesOrdersList', component: ordersListCityRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'ordersListCityRpt' } // ordersListCityRpt  ,   ordersListCityRpt.View
  },
  {
    path: 'CasesEntities', component: casesEntitiesRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'CasesEntitiesRpt' } // CasesEntitiesRpt  ,   CasesEntitiesRpt.View
  },
  {
    path: 'CasesHelp', component: caseHelpRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'CaseHelpRpt' } // CaseHelpRpt  ,   CaseHelpRpt.View
  },
];
