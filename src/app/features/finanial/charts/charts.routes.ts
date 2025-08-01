import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { RevenueGeneralComponent } from './revenuesExpenses/revenue-general/revenue-general.component';

export const chartsRoutes: Routes = [
    {
        path: 'revenue-expenses/:chartType',
        component: RevenueGeneralComponent
    },
    // sub routing  : /General , /Period-Dapartment , /Period-Branches , /Branches-Accounts
];