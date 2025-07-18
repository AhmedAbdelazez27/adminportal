import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home/home.component';
import { authGuard } from './core/guards/auth/auth-guars';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/mainlayout.component';
// import { InvoiceComponent } from './features/Invoice/invoice.component';
// import { GLJEComponent } from './features/gl-je/gl-je.component';
// import { ArMiscReceiptHeaderComponent } from './features/ArMiscReceiptHeader/Pages/ArMiscReceiptHeader.component';
// import { ApPaymentsTransactionHDRComponent } from './features/ApPaymentsTransactionHDR/Pages/ApPaymentsTransactionHDR.component';
// import { PaymentVoucherComponent } from './features/payment-voucher/payment-voucher.component';

// import { VendorComponent } from './features/vendor/vendor.component';
import { NoPermissionComponent } from './shared/components/no-permission/no-permission.component';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },

      // { path: 'invoice', component: InvoiceComponent }, //  invoice
      // { path: 'ArMiscReceiptHeader', component: ArMiscReceiptHeaderComponent }, // Receipt voucher
      // { path: 'ApPaymentsTransactionHDR', component: ApPaymentsTransactionHDRComponent }, //Receipt operations
      // { path: 'payment-voucher', component: PaymentVoucherComponent }, // Payment voucher
      // { path: 'GL_JE', component: GLJEComponent }, // General Journal
      // { path: 'vendor', component: VendorComponent }, // vendor


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
          }
        ]
      }
    ],
  },

  { path: 'no-permission', component: NoPermissionComponent },
  { path: '**', component: PageNotFoundComponent },
];
