import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { CostofProjectComponents } from './cost-of-project/cost-of-project.component';
import { NumberOfProjectComponents } from './no-of-project/no-of-project.component';
import { ProjectReceiptsComponents } from './project-receipts/project-receipts.component';

export const chartsRoutes: Routes = [

  {
    path: 'no-of-project/:chartType',
    component: NumberOfProjectComponents
  },

  {
    path: 'cost-of-project/:chartType',
    component: CostofProjectComponents
  },

  {
    path: 'project-receipts/:chartType',
    component: ProjectReceiptsComponents
  },
];
