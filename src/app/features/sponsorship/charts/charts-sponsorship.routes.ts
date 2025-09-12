import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth/auth-guars';
import { SponsorshipChartsComponent } from './sponsorship-charts/sponsorship-charts.component';
export const chartsSponsorshipRoutes: Routes = [
    {
        path: ':chartType',
        component: SponsorshipChartsComponent,
        // canActivate: [authGuard]
    }, // sub routing  :  /CasesNumberBySponsorShip  /byperiodandtypeofsponsorship /bytypeofsponsorshipandnationality   /revenueByAccount
       // sub routing  :  /Totaldonationsbytypeofsponsorship  /Contractstatisticsbypaymentmethod  /noofsponsorsbyentityandtypeofsponsorship   /nofsponsorsinoutcountry /comparisonofCasesbytypeofsponsorship /comparisonofCasesaccordingtonationality   /casesavailableforsponsorship

];