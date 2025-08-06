import { Routes } from '@angular/router';
import { ServiceSetting2Component } from './pages/serviceSetting2.component';

export const serviceSetting2Routes: Routes = [
  {
    path: '',
    component: ServiceSetting2Component,
  },
  {
    path: ':id/attributes',
    loadComponent: () =>
      import('./pages/attributes/attributes-list.component').then(
        (m) => m.AttributesListComponent
      ),
  },
  {
    path: ':id/attachments',
    loadComponent: () =>
      import('./pages/attachments/attachments-list.component').then(
        (m) => m.AttachmentsListComponent
      ),
  },
  {
    path: ':id/workflow',
    loadComponent: () =>
      import('./pages/workflow/workflow.component').then(
        (m) => m.WorkflowComponent
      ),
  },
  {
    path: ':id/workflow/add',
    loadComponent: () =>
      import(
        './pages/service-department-form/service-department-form.component'
      ).then((m) => m.ServiceDepartmentFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/service-main/service-main.component').then(
        (m) => m.ServiceMainComponent
      ),
  },
  {
    path: ':id/view',
    loadComponent: () =>
      import('./pages/service-main/service-main.component').then(
        (m) => m.ServiceMainComponent
      ),
  },
  {
    path: ':id/workflow/:deptId/edit',
    loadComponent: () =>
      import(
        './pages/service-department-form/service-department-form.component'
      ).then((m) => m.ServiceDepartmentFormComponent),
  },
];
