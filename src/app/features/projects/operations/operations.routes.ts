import { Routes } from '@angular/router';
import { projectsComponent } from './projects/projects.component';
import { authGuard } from '../../../core/guards/auth/auth-guars';

export const operationsRoutes: Routes = [
  {
    path: 'Projects', component: projectsComponent,
    canActivate: [authGuard],
    data: { pagePermission: 'ScProject' } // ScProject  ,   ScProject.View
  },
];
