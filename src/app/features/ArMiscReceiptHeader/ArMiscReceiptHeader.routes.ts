import { Routes } from '@angular/router';
import { ArMiscReceiptHeaderComponent } from './Pages/ArMiscReceiptHeader.component';
import { authGuard } from '../../core/guards/auth/auth-guars';

export const ArMiscReceiptHeaderRoutes: Routes = [
  {
    path: '',
    component: ArMiscReceiptHeaderComponent,
  }
];
