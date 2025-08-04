import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { BeneficentComponent } from './beneficent/beneficent.component';
import { casePaymentComponent } from './casePayment/casePayment.component';
import { caseSearchComponent } from './caseSearch/caseSearch.component';

export const operationsRoutes: Routes = [
  {
    path: 'Beneficent', component: BeneficentComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'SpBeneficents' } // Beneficent  ,   Beneficent.View
  },
   {
     path: 'CasePayments', component: casePaymentComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'SpCasesPayment' } // casePayment  ,   SpCasesPayment.View
  },
  {
    path: 'Contracts', component: casePaymentComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'SpContracts' } // SpContracts  ,   SpContracts.View
  },
  {
    path: 'CasesSearch', component: caseSearchComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'SpCases' } // SpCases  ,   SpCases.View
  },
];
