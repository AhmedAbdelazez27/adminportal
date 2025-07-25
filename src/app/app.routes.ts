import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home/home.component';
import { authGuard } from './core/guards/auth/auth-guars';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/mainlayout.component';
import { NoPermissionComponent } from './shared/components/no-permission/no-permission.component';
import { ForgetpasswordComponent } from './features/auth/forgetpassword/forgetpassword.component';
import { VerifyotpComponent } from './features/auth/verifyotp/verifyotp.component';
import { ResetpasswordComponent } from './features/auth/resetpassword/resetpassword.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgetpasswordComponent },
  { path: 'verify-otp', component: VerifyotpComponent },
  { path: 'reset-password', component: ResetpasswordComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      {
        path: 'authentication',
        children: [
          { path: '', redirectTo: 'roles', pathMatch: 'full' },
          {
            path: 'roles',
            loadChildren: () =>
              import('./features/roles/roles.routes').then((m) => m.rolesRoutes),
            canActivate: [authGuard],
            data: { permission: 'Role.View' }
          },
          {
            path: 'users',
            loadChildren: () =>
              import('./features/users/users.routes').then((m) => m.usersRoutes),
            canActivate: [authGuard],
            data: { permission: 'User.View' }
          }
        ]
      },
      {
        path: 'financial',
        children: [
          {
            path: 'operations',
            loadChildren: () =>
              import('./features/finanial/operations/operations.routes').then((m) => m.operationsRoutes),
            // canActivate: [authGuard],
            // data: { permission: 'Financial.View' }
          },
          {
            path: 'reports',
            loadChildren: () =>
              import('./features/finanial/reports/reports.routes').then((m) => m.reportsRoutes),
            // canActivate: [authGuard],
            // data: { permission: 'Financial.View' }
          }
        ]
      }
    ],
  },

  
 
  
  
  { path: 'no-permission', component: NoPermissionComponent },
  { path: '**', component: PageNotFoundComponent }
];
