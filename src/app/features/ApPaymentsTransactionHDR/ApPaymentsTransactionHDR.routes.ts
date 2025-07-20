import { Routes } from '@angular/router';
import { ApPaymentsTransactionHDRComponent } from './Pages/ApPaymentsTransactionHDR.component';
import { authGuard } from '../../core/guards/auth/auth-guars';

export const ApPaymentsTransactionHDRRoutes: Routes = [
  {
    path: '',
    component: ApPaymentsTransactionHDRComponent,
  }
];
