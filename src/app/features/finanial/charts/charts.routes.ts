import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { RevenueGeneralComponent } from './revenuesExpenses/revenue-general/revenue-general.component';
import { ComparisonsRevenueseExpensesComponent } from './comparisonsRevenueseExpenses/comparisons-revenuese-expenses/comparisons-revenuese-expenses.component';

export const chartsRoutes: Routes = [
    {
        path: 'revenue-expenses/:chartType',
        component: RevenueGeneralComponent
    },// sub routing  : /General , /Period-Dapartment , /Period-Branches , /Branches-Accounts
    {
        path: 'comparisons-revenue-expenses/:chartType',
        component: ComparisonsRevenueseExpensesComponent
    }, // sub routing  :  /revenueByEntit  /revenueByDepartment /revenueByBranch   /revenueByAccount
       // sub routing  :  /expensesByEntit  /expensesByBranch  /expensesByDepartment   /expensesByAccount

];