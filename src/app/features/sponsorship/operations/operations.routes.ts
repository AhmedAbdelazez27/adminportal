import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { BeneficentComponent } from './beneficent/beneficent.component';

export const operationsRoutes: Routes = [
  {
    path: 'Beneficent', component: BeneficentComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'Beneficent' } // Beneficent  ,   Beneficent.View
  },
];
