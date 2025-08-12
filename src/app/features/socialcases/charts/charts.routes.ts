import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { StatisticsOfBeneficiaryFamiliesComponents } from './statistics-Benf-Families/statistics-Benf-Families.component';
import { RequestsStatisticsComponents } from './requests-statistics/requests-statistics.component';

export const chartsRoutes: Routes = [

  {
    path: 'statistics-benf-families/:chartType',
    component: StatisticsOfBeneficiaryFamiliesComponents
  },

  {
    path: 'requests-statistics/:chartType',
    component: RequestsStatisticsComponents
  },
];
