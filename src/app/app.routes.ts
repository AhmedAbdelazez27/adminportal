import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home/home.component';
import { authGuard } from './core/guards/auth/auth-guars';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/mainlayout.component';
import { InvoiceComponent } from './features/Invoice/invoice.component';
import { GLJEComponent } from './features/gl-je/gl-je.component';
import { ArMiscReceiptHeaderComponent } from './features/ArMiscReceiptHeader/Pages/ArMiscReceiptHeader.component';
import { ApPaymentsTransactionHDRComponent } from './features/ApPaymentsTransactionHDR/Pages/ApPaymentsTransactionHDR.component';
import { PaymentVoucherComponent } from './features/payment-voucher/payment-voucher.component';

import { VendorComponent } from './features/vendor/vendor.component';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'invoice', component: InvoiceComponent },
      { path: 'ArMiscReceiptHeader', component: ArMiscReceiptHeaderComponent },
      { path: 'ApPaymentsTransactionHDR', component: ApPaymentsTransactionHDRComponent },
      { path: 'payment-voucher', component: PaymentVoucherComponent },

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
    { path: 'GL_JE', component: GLJEComponent },

  { path: 'vendor', component: VendorComponent },

  { path: '**', component: PageNotFoundComponent }
];
