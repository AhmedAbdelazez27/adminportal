import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guars';
import { MainApplyServiceComponent } from './mainApplyService/mainApplyService.component';

export const servicesRoutes: Routes = [
    {
        path: 'services', component: MainApplyServiceComponent, 
        canActivate: [authGuard],
        data: {pagePermission: 'GlJeHeader' } // GlJeHeader  ,   GlJeHeader.View
    },
];
