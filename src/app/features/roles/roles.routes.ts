import { Routes } from '@angular/router';
import { RolesListComponent } from './pages/roles-list.component';
import { authGuard } from '../../core/guards/auth/auth-guars';

export const rolesRoutes: Routes = [
  {
    path: '',
    component: RolesListComponent,
  }
];
