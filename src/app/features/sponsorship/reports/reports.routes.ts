import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { benifcientTotalRptComponent } from '../../sponsorship/reports/benifcientTotalRpt/benifcientTotalRpt.component';
import { caseAidEntitiesRptComponent } from '../../sponsorship/reports/caseAidEntitiesRpt/caseAidEntitiesRpt.component';
import { caseSearchListRptComponent } from '../../sponsorship/reports/caseSearchListRpt/caseSearchListRpt.component';
import { caseSearchRptComponent } from '../../sponsorship/reports/caseSearchRpt/caseSearchRpt.component';
import { getBeneficentsRptComponent } from '../../sponsorship/reports/getBeneficentsRPT/getBeneficentsRpt.component';


export const ReportsRoutes: Routes = [
  {
    path: 'GetBeneficents', component: getBeneficentsRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'BeneficentsRpt' } // BeneficentsRpt  ,   caseSearchListRpt.View
  },
  {
    path: 'GetCases', component: caseSearchRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'CaseSearchRpt' } // CaseSearchRpt  ,   caseSearchListRpt.View
  },
  {
    path: 'BenifcientTotla', component: benifcientTotalRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'BenifcientTotalRpt' } // BenifcientTotalRpt  ,   BenifcientTotalRpt.View
  },
  {
    path: 'caseSearchListRpt', component: caseSearchListRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'CaseSearchListRpt' } // caseSearchListRpt  ,   caseSearchListRpt.View
  },
  {
    path: 'GetCaseAIDEntities', component: caseAidEntitiesRptComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'CaseAidEntitiesRpt' } // CaseAidEntitiesRpt  ,   caseAidEntitiesRpt.View
  },
];
