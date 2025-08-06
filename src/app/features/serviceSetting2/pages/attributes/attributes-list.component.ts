import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceSettingService } from '../../../../core/services/serviceSetting.service';
import {
  ServiceDto,
  AttributeDto,
  UpdateServiceDto,
  CreateAttributeValueDto,
} from '../../../../core/dtos/serviceSetting/serviceSetting.dto';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { ColDef } from 'ag-grid-community';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormsModule,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-attributes-list',
  standalone: true,
  imports: [
    CommonModule,
    GenericDataTableComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './attributes-list.component.html',
  styleUrls: ['./attributes-list.component.scss'],
})
export class AttributesListComponent implements OnInit, OnDestroy {
  serviceId!: number;
  serviceDetails!: ServiceDto;
  attributes: AttributeDto[] = [];
  @Input() isEditMode: boolean = true;

  columnDefs: ColDef[] = [];
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string; icon?: string; action: string }> = [];

  // Modal properties
  showAttributeModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selectedAttribute?: AttributeDto;
  attributeForm!: FormGroup;
  attributeValueForm!: FormGroup;
  attributeModal: any;
  currentAttributeValues: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceSettingService: ServiceSettingService,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.serviceId = +this.route.snapshot.paramMap.get('id')!;

    this.initColumns();
    this.initActions();
    this.loadServiceDetails();
    this.buildForm();
    this.initializeModal();
  }

  ngOnDestroy(): void {
    this.cleanupModal();
  }

  // Permission checking methods
  hasPermission(permission: string): boolean {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    return permissions.includes(permission);
  }

  hasPagePermission(pagePermission: string): boolean {
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');
    return pages.includes(pagePermission);
  }

  // Check if user can add attributes
  canAddAttribute(): boolean {
    // For now, allow if user has any service-related permission or if no specific permissions are set
    const hasSpecificPermission =
      this.hasPermission('ServiceSetting.Create') ||
      this.hasPermission('Service.Create') ||
      this.hasPermission('Services.Create');
    const hasPagePermission =
      this.hasPagePermission('ServiceSetting') ||
      this.hasPagePermission('Service') ||
      this.hasPagePermission('Services');

    // If no specific permissions are configured, allow by default
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');

    // Allow by default if no permissions are set
    if (permissions.length === 0 && pages.length === 0) {
      return true; // Allow if no permissions are configured
    }

    // Allow if any permissions exist
    if (permissions.length > 0 || pages.length > 0) {
      return true; // Allow if any permissions exist
    }

    return hasSpecificPermission || hasPagePermission;
  }

  // Check if user can edit attributes
  canEditAttribute(): boolean {
    const hasSpecificPermission =
      this.hasPermission('ServiceSetting.Update') ||
      this.hasPermission('Service.Update') ||
      this.hasPermission('Services.Update');
    const hasPagePermission =
      this.hasPagePermission('ServiceSetting') ||
      this.hasPagePermission('Service') ||
      this.hasPagePermission('Services');

    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');

    if (permissions.length === 0 && pages.length === 0) {
      return true;
    }

    // Allow if any permissions exist
    if (permissions.length > 0 || pages.length > 0) {
      return true; // Allow if any permissions exist
    }

    return hasSpecificPermission || hasPagePermission;
  }

  // Check if user can delete attributes
  canDeleteAttribute(): boolean {
    const hasSpecificPermission =
      this.hasPermission('ServiceSetting.Delete') ||
      this.hasPermission('Service.Delete') ||
      this.hasPermission('Services.Delete');
    const hasPagePermission =
      this.hasPagePermission('ServiceSetting') ||
      this.hasPagePermission('Service') ||
      this.hasPagePermission('Services');

    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');

    if (permissions.length === 0 && pages.length === 0) {
      return true;
    }

    // Allow if any permissions exist
    if (permissions.length > 0 || pages.length > 0) {
      return true; // Allow if any permissions exist
    }

    return hasSpecificPermission || hasPagePermission;
  }

  // Check if user can view attributes
  canViewAttribute(): boolean {
    const hasSpecificPermission =
      this.hasPermission('ServiceSetting.View') ||
      this.hasPermission('Service.View') ||
      this.hasPermission('Services.View');
    const hasPagePermission =
      this.hasPagePermission('ServiceSetting') ||
      this.hasPagePermission('Service') ||
      this.hasPagePermission('Services');

    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');

    if (permissions.length === 0 && pages.length === 0) {
      return true;
    }

    // Allow if any permissions exist
    if (permissions.length > 0 || pages.length > 0) {
      return true; // Allow if any permissions exist
    }

    return hasSpecificPermission || hasPagePermission;
  }

  private initializeModal(): void {
    const modalElement = document.getElementById('AttributeModal');
    if (modalElement) {
      this.attributeModal = new (window as any).bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
      });

      modalElement.addEventListener('hidden.bs.modal', () => {
        this.onModalHidden();
      });
    }
  }

  private cleanupModal(): void {
    if (this.attributeModal) {
      this.attributeModal.dispose();
    }
  }

  private onModalHidden(): void {
    this.showAttributeModal = false;
    this.resetForm();
  }

  private buildForm() {
    this.attributeForm = this.fb.group({
      nameAr: ['', Validators.required],
      nameEn: [''],
      viewOrder: [1, [Validators.required, Validators.min(1)]],
      values: this.fb.array([]),
    });

    this.attributeValueForm = this.fb.group({
      valueAr: ['', Validators.required],
      valueEn: [''],
      viewOrder: [1, [Validators.required, Validators.min(1)]],
    });
  }

  get values(): FormArray {
    return this.attributeForm.get('values') as FormArray;
  }

  addValueRow(value?: CreateAttributeValueDto) {
    this.values.push(
      this.fb.group({
        valueAr: [value?.valueAr || '', Validators.required],
        valueEn: [value?.valueEn || ''],
        viewOrder: [
          value?.viewOrder || 1,
          [Validators.required, Validators.min(1)],
        ],
      })
    );
  }

  removeValueRow(index: number) {
    this.values.removeAt(index);
  }

  // Attribute value management methods
  addAttributeValue(): void {
    if (this.attributeValueForm.valid) {
      const formValue = this.attributeValueForm.value;
      const newValue = {
        id: 0,
        valueAr: formValue.valueAr,
        valueEn: formValue.valueEn,
        viewOrder: formValue.viewOrder,
        attributeId: this.selectedAttribute?.id || 0,
      };

      this.currentAttributeValues.push(newValue);
      this.attributeValueForm.reset({
        valueAr: '',
        valueEn: '',
        viewOrder: 1,
      });
    } else {
      this.attributeValueForm.markAllAsTouched();
    }
  }

  removeAttributeValue(index: number): void {
    this.currentAttributeValues.splice(index, 1);
  }

  // Validation methods
  getAttributeFieldError(fieldName: string): string {
    const control = this.attributeForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) {
        return this.translate.instant('VALIDATION.REQUIRED');
      }
      if (control.errors['min']) {
        return this.translate.instant('VALIDATION.MIN_VALUE', {
          value: control.errors['min'].min,
        });
      }
    }
    return '';
  }

  isAttributeFieldInvalid(fieldName: string): boolean {
    const control = this.attributeForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  isAttributeFieldValid(fieldName: string): boolean {
    const control = this.attributeForm.get(fieldName);
    return !!(control?.valid && control?.touched);
  }

  getAttributeValueFieldError(fieldName: string): string {
    const control = this.attributeValueForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) {
        return this.translate.instant('VALIDATION.REQUIRED');
      }
      if (control.errors['min']) {
        return this.translate.instant('VALIDATION.MIN_VALUE', {
          value: control.errors['min'].min,
        });
      }
    }
    return '';
  }

  isAttributeValueFieldInvalid(fieldName: string): boolean {
    const control = this.attributeValueForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  isAttributeValueFieldValid(fieldName: string): boolean {
    const control = this.attributeValueForm.get(fieldName);
    return !!(control?.valid && control?.touched);
  }

  private resetForm() {
    this.attributeForm.reset({
      nameAr: '',
      nameEn: '',
      viewOrder: 1,
    });
    this.attributeValueForm.reset({
      valueAr: '',
      valueEn: '',
      viewOrder: 1,
    });
    this.currentAttributeValues = [];
    while (this.values.length !== 0) {
      this.values.removeAt(0);
    }
  }

  private initColumns() {
    this.columnDefs = [
      {
        field: 'nameAr',
        headerName: this.translate.instant('SERVICE_SETTING.ATTRIBUTE_NAME_AR'),
      },
      {
        field: 'nameEn',
        headerName: this.translate.instant('SERVICE_SETTING.ATTRIBUTE_NAME_EN'),
      },
      {
        field: 'viewOrder',
        headerName: this.translate.instant('SERVICE_SETTING.VIEW_ORDER'),
      },
    ];
  }

  private initActions() {
    this.rowActions = [];

    // Always add view action if user has permission
    if (this.canViewAttribute()) {
      this.rowActions.push({
        label: this.translate.instant('COMMON.VIEW'),
        icon: 'fas fa-eye',
        action: 'view',
      });
    }

    // Only add edit and delete actions if in edit mode and user has permissions
    if (this.isEditMode) {
      if (this.canEditAttribute()) {
        this.rowActions.push({
          label: this.translate.instant('COMMON.UPDATE'),
          icon: 'fas fa-edit',
          action: 'edit',
        });
      }

      if (this.canDeleteAttribute()) {
        this.rowActions.push({
          label: this.translate.instant('COMMON.DELETE'),
          icon: 'fas fa-trash',
          action: 'delete',
        });
      }
    }
  }

  private loadServiceDetails() {
    this.serviceSettingService.getById(this.serviceId).subscribe({
      next: (res) => {
        this.serviceDetails = res;
        this.attributes = res.attributes || [];
      },
    });
  }

  onActionClick(event: { action: string; row: any }) {
    switch (event.action) {
      case 'view':
        if (this.canViewAttribute()) {
          this.openViewAttributeModal(event.row);
        }
        break;
      case 'edit':
        if (this.canEditAttribute()) {
          this.openEditAttributeModal(event.row);
        }
        break;
      case 'delete':
        if (this.canDeleteAttribute()) {
          this.deleteAttribute(event.row);
        }
        break;
    }
  }

  addAttribute() {
    if (!this.canAddAttribute()) {
      return;
    }
    this.modalMode = 'add';
    this.selectedAttribute = undefined;
    this.resetForm();
    this.currentAttributeValues = [];
    this.showAttributeModal = true;
    this.attributeModal?.show();
  }

  openViewAttributeModal(attribute: AttributeDto) {
    if (!this.canViewAttribute()) {
      return;
    }
    this.modalMode = 'view';
    this.selectedAttribute = attribute;
    this.resetForm();
    this.attributeForm.patchValue({
      nameAr: attribute.nameAr,
      nameEn: attribute.nameEn,
      viewOrder: attribute.viewOrder,
    });
    this.currentAttributeValues = [...(attribute.attributeValues || [])];
    this.attributeForm.disable();
    this.showAttributeModal = true;
    this.attributeModal?.show();
  }

  openEditAttributeModal(attribute: AttributeDto) {
    if (!this.canEditAttribute()) {
      return;
    }
    this.modalMode = 'edit';
    this.selectedAttribute = attribute;
    this.resetForm();
    this.attributeForm.patchValue({
      nameAr: attribute.nameAr,
      nameEn: attribute.nameEn,
      viewOrder: attribute.viewOrder,
    });
    this.currentAttributeValues = [...(attribute.attributeValues || [])];
    this.attributeForm.enable();
    this.showAttributeModal = true;
    this.attributeModal?.show();
  }

  submitAttribute() {
    if (this.attributeForm.invalid || this.modalMode === 'view') return;

    // Check permissions based on modal mode
    if (this.modalMode === 'add' && !this.canAddAttribute()) {
      return;
    }
    if (this.modalMode === 'edit' && !this.canEditAttribute()) {
      return;
    }

    const formVal = this.attributeForm.value;
    const attributes: AttributeDto[] = [
      ...(this.serviceDetails.attributes || []),
    ];

    if (this.modalMode === 'edit' && this.selectedAttribute) {
      const idx = attributes.findIndex(
        (a) => a.id === this.selectedAttribute!.id
      );
      if (idx !== -1) {
        attributes[idx] = {
          ...attributes[idx],
          nameAr: formVal.nameAr,
          nameEn: formVal.nameEn,
          viewOrder: formVal.viewOrder,
          attributeValues: this.currentAttributeValues,
        } as AttributeDto;
      }
    } else if (this.modalMode === 'add') {
      const newAttr: AttributeDto = {
        id: 0,
        nameAr: formVal.nameAr,
        nameEn: formVal.nameEn,
        referenceAttributeId: this.serviceId,
        referenceAttributeType: 1,
        viewOrder: formVal.viewOrder,
        attributeValues: this.currentAttributeValues,
      } as AttributeDto;
      attributes.push(newAttr);
    }

    // Include all main service information to preserve it during update
    const updateDto: UpdateServiceDto = {
      serviceId: this.serviceId,
      serviceName: this.serviceDetails.serviceName,
      serviceNameEn: this.serviceDetails.serviceNameEn,
      serviceRefrenceNo: this.serviceDetails.serviceRefrenceNo,
      serviceType: this.serviceDetails.serviceType,
      descriptionAr: this.serviceDetails.descriptionAr,
      descriptionEn: this.serviceDetails.descriptionEn,
      active: this.serviceDetails.active,
      mainServiceClassificationId:
        this.serviceDetails.mainServiceClassificationId,
      subServiceClassificationId:
        this.serviceDetails.subServiceClassificationId,
      attributes: attributes,
      serviceDepartments: this.serviceDetails.serviceDepartments,
      attachmentsConfigs: this.serviceDetails.attachmentsConfigs,
    };

    this.serviceSettingService.updateAsync(updateDto).subscribe({
      next: () => {
        this.loadServiceDetails();
        this.attributeModal?.hide();
      },
    });
  }

  closeAttributeModal() {
    this.attributeModal?.hide();
  }

  private deleteAttribute(attr: AttributeDto) {
    if (!this.canDeleteAttribute()) {
      return;
    }
    if (!confirm(this.translate.instant('COMMON.CONFIRM_DELETE'))) return;
    const updatedAttributes = (this.attributes || []).filter(
      (a) => a.id !== attr.id
    );

    // Include all main service information to preserve it during update
    const updateDto: UpdateServiceDto = {
      serviceId: this.serviceId,
      serviceName: this.serviceDetails.serviceName,
      serviceNameEn: this.serviceDetails.serviceNameEn,
      serviceRefrenceNo: this.serviceDetails.serviceRefrenceNo,
      serviceType: this.serviceDetails.serviceType,
      descriptionAr: this.serviceDetails.descriptionAr,
      descriptionEn: this.serviceDetails.descriptionEn,
      active: this.serviceDetails.active,
      mainServiceClassificationId:
        this.serviceDetails.mainServiceClassificationId,
      subServiceClassificationId:
        this.serviceDetails.subServiceClassificationId,
      attributes: updatedAttributes,
      serviceDepartments: this.serviceDetails.serviceDepartments,
      attachmentsConfigs: this.serviceDetails.attachmentsConfigs,
    };

    this.serviceSettingService.updateAsync(updateDto).subscribe({
      next: () => {
        this.loadServiceDetails();
      },
    });
  }
}
