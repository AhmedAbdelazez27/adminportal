import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { ColDef } from 'ag-grid-community';
import { ServiceSettingService } from '../../../../core/services/serviceSetting.service';
import { DepartmentService } from '../../../../core/services/department.service';
import {
  ServiceDepartmentDto,
  ServiceDto,
  UpdateServiceDto,
  CreateServiceDepartmentDto,
  UpdateServiceDepartmentDto,
} from '../../../../core/dtos/serviceSetting/serviceSetting.dto';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { FndLookUpValuesSelect2RequestDto } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';

@Component({
  selector: 'app-service-workflow',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GenericDataTableComponent,
    NgSelectModule,
    TranslateModule,
  ],
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
})
export class WorkflowComponent implements OnInit, OnDestroy, AfterViewInit {
  serviceId!: number;
  serviceDetails!: ServiceDto;
  departments: ServiceDepartmentDto[] = [];

  columnDefs: ColDef[] = [];
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string; icon?: string; action: string }> = [];

  // Form and modal properties
  serviceDepartmentForm: FormGroup;
  submitted: boolean = false;
  isSubmitting: boolean = false;
  mode: 'add' | 'edit' | 'view' = 'add';
  editingDepartmentId: number | null = null;
  selectedDepartmentToDelete: ServiceDepartmentDto | null = null;

  // Dropdown options
  departmentOptions: any[] = [];
  departmentActions: any[] = [
    { value: 1, label: 'Approve' },
    { value: 2, label: 'Reject' },
    { value: 3, label: 'Review' },
    { value: 4, label: 'Return' },
  ];
  departmentActionsSelect2: any[] = [];
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();

  // Modal instances
  private serviceDepartmentModal: any = null;
  private deleteModal: any = null;
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceSettingService: ServiceSettingService,
    private departmentService: DepartmentService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private spinnerService: SpinnerService,
    private fb: FormBuilder,
    private select2Service: Select2Service
  ) {
    this.serviceDepartmentForm = this.fb.group({
      deptId: ['', [Validators.required]],
      serviceLevel: ['', [Validators.required, Validators.min(1)]],
      departmentAction: [null, [Validators.required]],
      stepName: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  ngOnInit(): void {
    // Force hide any existing spinner first
    this.spinnerService.forceHide();
    this.fetchdepartmentActionsSelect2();

    // Also force hide after a short delay to ensure it's hidden
    setTimeout(() => {
      this.spinnerService.forceHide();
    }, 100);

    // Subscribe to route parameter changes
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.serviceId = +id;

        if (!this.serviceId || isNaN(this.serviceId)) {
          this.toastr.error('Invalid service ID');
          this.router.navigate(['/serviceSetting2']);
          return;
        }

        this.initializeColumnDefs();
        this.initializeRowActions();
        this.initializeModals();
        this.loadDepartments();
        this.fetchServiceDetails();
      }
    });
  }

  ngAfterViewInit(): void {
    // Force hide spinner after view is initialized
    setTimeout(() => {
      this.spinnerService.forceHide();
    }, 500);
  }

  ngOnDestroy(): void {
    this.cleanupModals();
    // Ensure spinner is hidden when component is destroyed
    this.spinnerService.forceHide();

    // Unsubscribe from route subscription
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  fetchdepartmentActionsSelect2(): void {
    this.select2Service.getDepartmentActionsSelect2List().subscribe({
      next: (response: any) => {
        this.departmentActionsSelect2 = response || [];
      },
      error: (err: any) => {
        this.toastr.error('Failed to load Country.', 'Error');
      }
    });
  }


  private initializeModals(): void {
    // Initialize Bootstrap modals
    this.serviceDepartmentModal = new (window as any).bootstrap.Modal(
      document.getElementById('ServiceDepartmentModal')
    );
    this.deleteModal = new (window as any).bootstrap.Modal(
      document.getElementById('deleteServiceDepartmentModal')
    );

    // Add event listeners
    const modalElement = document.getElementById('ServiceDepartmentModal');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () =>
        this.onModalHidden()
      );
      modalElement.addEventListener('shown.bs.modal', () =>
        this.onModalShown()
      );
    }
  }

  private cleanupModals(): void {
    if (this.serviceDepartmentModal) {
      this.serviceDepartmentModal.dispose();
    }
    if (this.deleteModal) {
      this.deleteModal.dispose();
    }
  }

  private onModalHidden(): void {
    this.submitted = false;
    this.isSubmitting = false;

    // Only reset form if we're not in the middle of adding/editing
    if (!this.isSubmitting) {
      this.serviceDepartmentForm.reset();
    }
  }

  private onModalShown(): void {
    // Focus on first field when modal opens
    setTimeout(() => {
      const firstField = document.querySelector(
        '#ServiceDepartmentModal input'
      );
      if (firstField) {
        (firstField as HTMLElement).focus();
      }
    }, 100);
  }

  private initializeColumnDefs(): void {
    this.columnDefs = [
      {
        field: 'serviceLevel',
        headerName: this.translate.instant('SERVICE_SETTING.SERVICE_LEVEL'),
      },
      {
        field: 'department.aname',
        headerName: this.translate.instant('SERVICE_SETTING.DEPARTMENT'),
      },
      {
        field: 'departmentActionName',
        headerName: this.translate.instant('SERVICE_SETTING.DEPARTMENT_ACTION'),
      },
      {
        field: 'stepName',
        headerName: this.translate.instant('SERVICE_SETTING.STEP_NAME'),
      },
    ];
  }

  private initializeRowActions(): void {
    this.rowActions = [
      {
        label: this.translate.instant('COMMON.VIEW'),
        icon: 'icon-frame-view',
        action: 'view',
      },
      {
        label: this.translate.instant('COMMON.UPDATE'),
        icon: 'icon-frame-edit',
        action: 'edit',
      },
      {
        label: this.translate.instant('COMMON.DELETE'),
        icon: 'icon-frame-delete',
        action: 'delete',
      },
    ];
  }

  private loadDepartments(): void {
    this.spinnerService.show();

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      this.spinnerService.forceHide();
    }, 10000); // 10 seconds timeout

    this.departmentService
      .getAllDepartments({
        skip: 0,
        take: 1000,
        searchValue: '',
        isActive: true,
      })
      .subscribe({
        next: (response) => {
          clearTimeout(timeout);

          // Add null check to prevent the error
          if (response && response.data && Array.isArray(response.data)) {
            this.departmentOptions = response.data.map((dept: any) => ({
              value: dept.dept_ID,
              text: dept.aname,
              data: dept,
            }));
          } else {
            this.departmentOptions = [];
          }

          this.spinnerService.hide();

          // Force hide spinner after a short delay to ensure it's hidden
          setTimeout(() => {
            this.spinnerService.forceHide();
          }, 200);
        },
        error: (error) => {
          clearTimeout(timeout);
          this.toastr.error(
            this.translate.instant('COMMON.ERROR_LOADING_DATA')
          );
          this.spinnerService.hide();

          // Force hide spinner after a short delay to ensure it's hidden
          setTimeout(() => {
            this.spinnerService.forceHide();
          }, 200);
        },
      });
  }

  private fetchServiceDetails(): void {
    this.spinnerService.show();
    this.departments = []; // reset

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      this.spinnerService.forceHide();
      // Show dummy data for testing
      this.showDummyData();
    }, 10000); // 10 seconds timeout

    this.serviceSettingService.getById(this.serviceId).subscribe({
      next: (res) => {
        clearTimeout(timeout);
        this.serviceDetails = res;
        // order by serviceLevel asc
        this.departments = (res.serviceDepartments || []).sort(
          (a, b) => (a.serviceLevel || 0) - (b.serviceLevel || 0)
        );
        this.spinnerService.hide();

        // Force hide spinner after a short delay to ensure it's hidden
        setTimeout(() => {
          this.spinnerService.forceHide();
        }, 200);
      },
      error: (error) => {
        clearTimeout(timeout);
        this.toastr.error(this.translate.instant('COMMON.ERROR_LOADING_DATA'));
        this.spinnerService.hide();
        // Show dummy data for testing
        this.showDummyData();
      },
    });
  }

  private showDummyData(): void {
    this.serviceDetails = {
      serviceId: this.serviceId,
      serviceName: 'Test Service',
      serviceNameEn: 'Test Service',
      active: true,
    } as ServiceDto;

    this.departments = [
      {
        serviceDeptId: 1,
        serviceId: this.serviceId,
        deptId: 1,
        serviceLevel: 1,
        departmentAction: 1,
        departmentActionName: undefined,
        stepName: 'Initial Review',
        department: {
          dept_ID: 1,
          aname: 'قسم التكنولوجيا',
          ename: 'Technology Department',
          isActive: true,
        },
      },
      {
        serviceDeptId: 2,
        serviceId: this.serviceId,
        deptId: 2,
        serviceLevel: 2,
        departmentAction: 3,
        departmentActionName: undefined,
        stepName: 'Final Approval',
        department: {
          dept_ID: 2,
          aname: 'قسم تقنية المعلومات',
          ename: 'IT Department',
          isActive: true,
        },
      },
    ];

    // Force hide spinner after showing dummy data
    setTimeout(() => {
      this.spinnerService.forceHide();
    }, 100);
  }

  onActionClick(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'view':
        this.openViewModal(event.row);
        break;
      case 'edit':
        this.openEditModal(event.row);
        break;
      case 'delete':
        this.selectDepartmentToDelete(event.row);
        break;
    }
  }

  addNewDepartment(): void {
    this.mode = 'add';
    this.editingDepartmentId = null;
    this.submitted = false;
    this.isSubmitting = false;

    // Ensure form is enabled (might be disabled after view mode)
    this.serviceDepartmentForm.enable();

    // Reset form to initial state
    this.serviceDepartmentForm.reset();

    // Set only the service level
    this.serviceDepartmentForm.patchValue({
      serviceLevel: this.departments.length + 1,
    });

    // Ensure departmentAction is properly initialized
    const departmentActionControl =
      this.serviceDepartmentForm.get('departmentAction');
    if (departmentActionControl) {
      departmentActionControl.setValue(null);
      departmentActionControl.markAsUntouched();
      departmentActionControl.markAsPristine();
    }

    this.serviceDepartmentModal.show();
  }

  openViewModal(department: ServiceDepartmentDto): void {
    this.mode = 'view';
    this.submitted = false;
    this.isSubmitting = false;
    this.setFormValues(department);
    this.serviceDepartmentForm.disable();
    this.serviceDepartmentModal.show();
  }

  openEditModal(department: ServiceDepartmentDto): void {
    this.mode = 'edit';
    this.editingDepartmentId = department.serviceDeptId;
    this.submitted = false;
    this.isSubmitting = false;
    this.setFormValues(department);
    this.serviceDepartmentForm.enable();
    this.serviceDepartmentModal.show();
  }

  private setFormValues(department: ServiceDepartmentDto): void {
    this.serviceDepartmentForm.patchValue({
      deptId: department.deptId,
      serviceLevel: department.serviceLevel,
      departmentAction: Number(department.departmentAction),
      stepName: department.stepName,
    });
  }

  submit(): void {
    // Prevent multiple submissions
    if (this.isSubmitting) {
      return;
    }

    this.submitted = true;

    if (this.serviceDepartmentForm.invalid) {
      this.toastr.error(
        this.translate.instant('COMMON.PLEASE_FILL_REQUIRED_FIELDS')
      );
      return;
    }

    this.isSubmitting = true;
    this.spinnerService.show();
    const formValue = this.serviceDepartmentForm.value;

    // Ensure departmentAction is a number
    const departmentAction = Number(formValue.departmentAction);

    // Note: departmentActionName will be set by the backend based on departmentAction value
    // We send undefined to let the backend handle the mapping from the enum

    const selectedDepartment = this.departmentOptions.find(
      (d) => d.value === formValue.deptId
    );

    if (this.mode === 'add') {
      // Create new service department
      const newServiceDepartment: ServiceDepartmentDto = {
        serviceDeptId: 0, // Will be set by backend
        serviceId: this.serviceId,
        deptId: formValue.deptId,
        serviceLevel: formValue.serviceLevel,
        departmentAction: departmentAction,
        departmentActionName: undefined, // Let backend set this based on departmentAction
        stepName: formValue.stepName,
        department: selectedDepartment?.data,
      };

      // Add to current service departments
      if (!this.serviceDetails.serviceDepartments) {
        this.serviceDetails.serviceDepartments = [];
      }
      this.serviceDetails.serviceDepartments.push(newServiceDepartment);
    } else if (this.mode === 'edit') {
      // Update existing service department
      const deptIndex = this.serviceDetails.serviceDepartments!.findIndex(
        (d) => d.serviceDeptId === this.editingDepartmentId
      );

      if (deptIndex !== -1) {
        this.serviceDetails.serviceDepartments![deptIndex] = {
          ...this.serviceDetails.serviceDepartments![deptIndex],
          deptId: formValue.deptId,
          serviceLevel: formValue.serviceLevel,
          departmentAction: departmentAction,
          departmentActionName: undefined, // Let backend set this based on departmentAction
          stepName: formValue.stepName,
          department: selectedDepartment?.data,
        };
      }
    }

    // Update the service
    const updateDto: UpdateServiceDto = {
      serviceId: this.serviceDetails.serviceId,
      serviceName: this.serviceDetails.serviceName,
      serviceNameEn: this.serviceDetails.serviceNameEn,
      descriptionAr: this.serviceDetails.descriptionAr,
      descriptionEn: this.serviceDetails.descriptionEn,
      mainServiceClassificationId:
        this.serviceDetails.mainServiceClassificationId,
      subServiceClassificationId:
        this.serviceDetails.subServiceClassificationId,
      serviceRefrenceNo: this.serviceDetails.serviceRefrenceNo,
      serviceType: this.serviceDetails.serviceType,
      active: this.serviceDetails.active,
      lastModified: this.serviceDetails.lastModified,
      attributes: this.serviceDetails.attributes,
      attachmentsConfigs: this.serviceDetails.attachmentsConfigs,
      serviceDepartments: this.serviceDetails.serviceDepartments,
    } as UpdateServiceDto;

    this.serviceSettingService.updateAsync(updateDto).subscribe({
      next: () => {
        this.toastr.success(
          this.mode === 'add'
            ? this.translate.instant(
                'SERVICE_SETTING.SERVICE_DEPARTMENT_ADDED_SUCCESS'
              )
            : this.translate.instant(
                'SERVICE_SETTING.SERVICE_DEPARTMENT_UPDATED_SUCCESS'
              )
        );
        this.closeModal();
        this.fetchServiceDetails();
        this.spinnerService.hide();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
        this.spinnerService.hide();
        this.isSubmitting = false;
      },
    });
  }

  selectDepartmentToDelete(department: ServiceDepartmentDto): void {
    this.selectedDepartmentToDelete = department;
    this.deleteModal.show();
  }

  deleteDepartment(): void {
    if (!this.selectedDepartmentToDelete) return;

    // Prevent multiple submissions
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.spinnerService.show();

    // Build new serviceDepartments array without the deleted one
    const updatedDepartments = (
      this.serviceDetails.serviceDepartments || []
    ).filter(
      (d) => d.serviceDeptId !== this.selectedDepartmentToDelete!.serviceDeptId
    );

    const updateDto: UpdateServiceDto = {
      serviceId: this.serviceDetails.serviceId,
      serviceName: this.serviceDetails.serviceName,
      serviceNameEn: this.serviceDetails.serviceNameEn,
      descriptionAr: this.serviceDetails.descriptionAr,
      descriptionEn: this.serviceDetails.descriptionEn,
      mainServiceClassificationId:
        this.serviceDetails.mainServiceClassificationId,
      subServiceClassificationId:
        this.serviceDetails.subServiceClassificationId,
      serviceRefrenceNo: this.serviceDetails.serviceRefrenceNo,
      serviceType: this.serviceDetails.serviceType,
      active: this.serviceDetails.active,
      lastModified: this.serviceDetails.lastModified,
      attributes: this.serviceDetails.attributes,
      attachmentsConfigs: this.serviceDetails.attachmentsConfigs,
      serviceDepartments: updatedDepartments,
    } as UpdateServiceDto;

    this.serviceSettingService.updateAsync(updateDto).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant(
            'SERVICE_SETTING.SERVICE_DEPARTMENT_DELETED_SUCCESS'
          )
        );
        this.cancelDelete();
        this.fetchServiceDetails();
        this.spinnerService.hide();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_DELETING_DATA'));
        this.spinnerService.hide();
        this.isSubmitting = false;
      },
    });
  }

  cancelDelete(): void {
    this.selectedDepartmentToDelete = null;
    this.isSubmitting = false;
    this.deleteModal.hide();
  }

  closeModal(): void {
    this.isSubmitting = false;
    this.serviceDepartmentModal.hide();
  }

  getDepartmentName(deptId: number): string {
    const dept = this.departmentOptions.find((d) => d.value === deptId);
    return dept ? dept.text : '';
  }

  getFieldError(fieldName: string): string {
    const field = this.serviceDepartmentForm.get(fieldName);
    if (field?.errors && this.submitted) {
      if (field.errors['required']) {
        return this.translate.instant('COMMON.FIELD_REQUIRED');
      }
      if (field.errors['min']) {
        return this.translate.instant('COMMON.MIN_VALUE_ERROR', {
          min: field.errors['min'].min,
        });
      }
      if (field.errors['maxlength']) {
        return this.translate.instant('COMMON.MAX_LENGTH_ERROR', {
          max: field.errors['maxlength'].requiredLength,
        });
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.serviceDepartmentForm.get(fieldName);
    return !!(
      field?.invalid &&
      (field?.dirty || field?.touched || this.submitted)
    );
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.serviceDepartmentForm.get(fieldName);
    return !!(field?.valid && (field?.dirty || field?.touched));
  }

  onFieldBlur(fieldName: string): void {
    const field = this.serviceDepartmentForm.get(fieldName);
    if (field) {
      field.markAsTouched();
    }
  }

  onDepartmentActionChange(event: any): void {
    // Method kept for potential future use
  }

  backToList(): void {
    this.router.navigate(['/serviceSetting2']);
  }

  // Method to force hide spinner - can be called from template if needed
  forceHideSpinner(): void {
    this.spinnerService.forceHide();
  }

  // Debug method to test form state
  debugFormState(): void {
    // Method kept for potential future use
  }
}
