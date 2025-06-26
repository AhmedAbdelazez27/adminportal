import { Routes } from '@angular/router';
import { UsersListComponent } from './pages/users-list.component';
import { authGuard } from '../../core/guards/auth/auth-guars';

export const usersRoutes: Routes = [
  {
    path: '',
    component: UsersListComponent,
  }
];
