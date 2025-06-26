import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home/home.component';
import { authGuard } from './core/guards/auth/auth-guars';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/mainlayout.component';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      {
        path: 'authentication',
        children: [
          {
            path: 'roles',
            loadChildren: () =>
              import('./features/roles/roles.routes').then((m) => m.rolesRoutes),
          },
          {
            path: 'users',
            loadChildren: () =>
              import('./features/users/users.routes').then((m) => m.usersRoutes),
          }
        ]
      }
    ],
  },

  { path: '**', component: PageNotFoundComponent }
];
