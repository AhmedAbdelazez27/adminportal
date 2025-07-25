import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { EntityService } from '../../../core/services/entit.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/constants/api-endpoints';
import {
  EntityDto,
  CreateEntityDto,
  UpdateEntityDto,
  EntityParameter,
  PagedResultDto,
} from '../../../core/dtos/Authentication/Entity/entity.dto';

@Component({
  selector: 'app-entity',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
  ],
  templateUrl: './entity.component.html',
  styleUrl: './entity.component.scss',
})
export class EntityComponent implements OnInit {
  entities: EntityDto[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pages: number[] = [];
  searchValue: string = '';
  entityForm: FormGroup;
  submitted: boolean = false;
  mode: 'add' | 'edit' | 'view' = 'add';
  editingEntityId: string | null = null;
  selectedEntityToDelete: string | null = null;
  isLoading: boolean = false;
  Math = Math; // Make Math available in template

  // Account Details dropdown options (static data as requested)
  accountDetailsOptions: any[] = [
    { id: 'ACC001', text: 'Account Details 1' },
    { id: 'ACC002', text: 'Account Details 2' },
    { id: 'ACC003', text: 'Account Details 3' },
    { id: 'ACC004', text: 'Account Details 4' },
    { id: 'ACC005', text: 'Account Details 5' },
  ];

  // Table configuration
  headers: string[] = [
    '#',
    'English Name',
    'Arabic Name',
    'Location',
    'Phone',
    'Website',
    'Email',
    'Account Details',
    'Actions',
  ];
  headerKeys: string[] = [
    'serial',
    'entity_NAME_EN',
    'entity_NAME',
    'entity_LOCALTION',
    'entity_PHONE',
    'entity_WEBSITE',
    'entity_MAIL',
    'acC_DETAILS_ID',
    'actions',
  ];
  showAction: boolean = true;
  actionTypes: string[] = ['view', 'edit', 'delete'];

  constructor(
    private entityService: EntityService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.entityForm = this.fb.group({
      entitY_NAME: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(4000),
          this.noWhitespaceValidator,
        ],
      ],
      entitY_NAME_EN: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(4000),
          this.noWhitespaceValidator,
        ],
      ],
      entitY_LOCALTION: [
        '',
        [Validators.maxLength(4000), this.noWhitespaceValidator],
      ],
      entitY_PHONE: ['', [Validators.maxLength(100), this.phoneValidator]],
      entitY_WEBSITE: ['', [Validators.maxLength(100), this.websiteValidator]],
      entitY_MAIL: [
        '',
        [Validators.maxLength(100), Validators.email, this.emailValidator],
      ],
      acC_DETAILS_ID: [null],
      entitY_ID: [null],
    });
  }

  ngOnInit(): void {
    this.getEntities(1);
  }

  // Custom validators
  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const phoneRegex = /^[\+]?[0-9\s\-\(\)\.]{7,}$/;
    if (!phoneRegex.test(control.value)) {
      return { invalidPhone: true };
    }
    return null;
  }

  websiteValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const websiteRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!websiteRegex.test(control.value)) {
      return { invalidWebsite: true };
    }
    return null;
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(control.value)) {
      return { invalidEmail: true };
    }
    return null;
  }

  // Validation helper methods
  getFieldError(fieldName: string): string {
    const control = this.entityForm.get(fieldName);
    if (!control || !control.errors || !this.submitted) return '';

    const errors = control.errors;

    if (errors['required']) {
      return this.translate.instant('VALIDATION.REQUIRED');
    }
    if (errors['minlength']) {
      return this.translate.instant('VALIDATION.MIN_LENGTH', {
        min: errors['minlength'].requiredLength,
      });
    }
    if (errors['maxlength']) {
      return this.translate.instant('VALIDATION.MAX_LENGTH', {
        max: errors['maxlength'].requiredLength,
      });
    }
    if (errors['email']) {
      return this.translate.instant('VALIDATION.INVALID_EMAIL');
    }
    if (errors['whitespace']) {
      return this.translate.instant('VALIDATION.NO_WHITESPACE');
    }
    if (errors['invalidPhone']) {
      return this.translate.instant('VALIDATION.INVALID_PHONE');
    }
    if (errors['invalidWebsite']) {
      return this.translate.instant('VALIDATION.INVALID_WEBSITE');
    }
    if (errors['invalidEmail']) {
      return this.translate.instant('VALIDATION.INVALID_EMAIL');
    }

    return '';
  }

  // Real-time validation feedback
  onFieldBlur(fieldName: string): void {
    const control = this.entityForm.get(fieldName);
    if (control) {
      control.markAsTouched();
    }
  }

  // Check if form has any validation errors
  hasFormErrors(): boolean {
    if (!this.submitted) return false;

    // Check if mandatory fields have errors
    const mandatoryFields = ['entitY_NAME', 'entitY_NAME_EN'];
    for (const fieldName of mandatoryFields) {
      const control = this.entityForm.get(fieldName);
      if (control && control.invalid) {
        return true;
      }
    }

    // Check if optional fields with data have errors
    const optionalFieldsWithErrors = this.getOptionalFieldsWithErrors();
    return optionalFieldsWithErrors.length > 0;
  }

  // Get total number of validation errors
  getTotalErrors(): number {
    let errorCount = 0;

    // Count errors in mandatory fields
    const mandatoryFields = ['entitY_NAME', 'entitY_NAME_EN'];
    for (const fieldName of mandatoryFields) {
      const control = this.entityForm.get(fieldName);
      if (control && control.errors) {
        errorCount++;
      }
    }

    // Count errors in optional fields that have data
    const optionalFieldsWithErrors = this.getOptionalFieldsWithErrors();
    errorCount += optionalFieldsWithErrors.length;

    return errorCount;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.entityForm.get(fieldName);

    // For mandatory fields, show errors if invalid and touched/submitted
    if (fieldName === 'entitY_NAME' || fieldName === 'entitY_NAME_EN') {
      return !!(
        control &&
        control.invalid &&
        (control.dirty || control.touched || this.submitted)
      );
    }

    // For optional fields, only show errors if they have data and are invalid
    return !!(
      control &&
      control.invalid &&
      control.value &&
      control.value.trim() &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.entityForm.get(fieldName);

    // Only show "Looks good" for mandatory fields when they have valid data
    if (fieldName === 'entitY_NAME' || fieldName === 'entitY_NAME_EN') {
      return !!(
        control &&
        control.valid &&
        (control.dirty || control.touched) &&
        control.value &&
        control.value.trim()
      );
    }

    // For optional fields, only show "Looks good" if they have data and are valid
    return !!(
      control &&
      control.valid &&
      (control.dirty || control.touched) &&
      control.value &&
      control.value.trim()
    );
  }

  // Check if mandatory fields are valid for enabling create/update button
  areMandatoryFieldsValid(): boolean {
    const arabicNameControl = this.entityForm.get('entitY_NAME');
    const englishNameControl = this.entityForm.get('entitY_NAME_EN');

    return !!(
      arabicNameControl &&
      englishNameControl &&
      arabicNameControl.valid &&
      englishNameControl.valid &&
      arabicNameControl.value &&
      arabicNameControl.value.trim() &&
      englishNameControl.value &&
      englishNameControl.value.trim()
    );
  }

  // Get optional fields that have validation errors
  getOptionalFieldsWithErrors(): string[] {
    const optionalFields = [
      'entitY_LOCALTION',
      'entitY_PHONE',
      'entitY_WEBSITE',
      'entitY_MAIL',
      'acC_DETAILS_ID',
    ];
    const fieldsWithErrors: string[] = [];

    optionalFields.forEach((fieldName) => {
      const control = this.entityForm.get(fieldName);
      if (control && control.value && control.value.trim() && control.invalid) {
        fieldsWithErrors.push(fieldName);
      }
    });

    return fieldsWithErrors;
  }

  getEntities(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.itemsPerPage;
    this.isLoading = true;
    this.spinnerService.show();

    const parameters: EntityParameter = {
      skip: skip,
      take: this.itemsPerPage,
      searchValue: searchValue,
    };

    this.entityService.getAllEntities(parameters).subscribe({
      next: (data: any) => {
        // Handle different response formats
        let allData: EntityDto[] = [];
        let totalCount: number = 0;

        if (data && data.data) {
          // API response with data property
          allData = data.data;
          totalCount = data.totalCount || data.total || data.data.length || 0;
        } else if (data && data.items) {
          // Standard PagedResultDto format
          allData = data.items;
          totalCount = data.totalCount || 0;
        } else if (data && Array.isArray(data)) {
          // Direct array response
          allData = data;
          totalCount = data.length;
        } else if (data && data.results) {
          // Select2 format
          allData = data.results;
          totalCount = data.total || data.results.length;
        } else {
          // Empty or unexpected format
          allData = [];
          totalCount = 0;
        }

        // If no data and we're in development, show some mock data for testing
        if (allData.length === 0 && !environment.production) {
          allData = [
            {
              entitY_ID: 'ENT001',
              entitY_NAME: 'شركة تجريبية',
              entitY_NAME_EN: 'Test Company',
              entitY_LOCALTION: 'Dubai, UAE',
              entitY_PHONE: '+971-50-123-4567',
              entitY_WEBSITE: 'www.testcompany.com',
              entitY_MAIL: 'info@testcompany.com',
              acC_DETAILS_ID: 'ACC001',
            },
            {
              entitY_ID: 'ENT002',
              entitY_NAME: 'مؤسسة تجريبية',
              entitY_NAME_EN: 'Test Foundation',
              entitY_LOCALTION: 'Abu Dhabi, UAE',
              entitY_PHONE: '+971-2-123-4567',
              entitY_WEBSITE: 'www.testfoundation.com',
              entitY_MAIL: 'contact@testfoundation.com',
              acC_DETAILS_ID: 'ACC002',
            },
          ];
          totalCount = 2;
        }

        // Update component properties
        this.entities = allData;
        this.totalCount = totalCount;
        this.currentPage = page;

        this.calculatePages();
        this.isLoading = false;
        this.spinnerService.hide();
      },
      error: (error) => {
        this.toastr.error(
          this.translate.instant('ERROR.FETCH_ENTITIES'),
          this.translate.instant('TOAST.TITLE.ERROR')
        );
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }

  calculatePages(): void {
    const totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.pages.length) {
      return;
    }

    this.getEntities(page, this.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage) && perPage > 0) {
      this.itemsPerPage = perPage;
      this.currentPage = 1; // Reset to first page
      this.getEntities(1, this.searchValue);
    }
  }

  onSearch(): void {
    this.getEntities(1, this.searchValue);
  }

  clear(): void {
    this.searchValue = '';
    this.getEntities(1, '');
  }

  // Form submission
  submit(): void {
    this.submitted = true;

    // Mark all fields as touched to trigger validation display
    this.entityForm.markAllAsTouched();

    // Check if mandatory fields are valid
    if (!this.areMandatoryFieldsValid()) {
      this.toastr.error(
        this.translate.instant('VALIDATION.MANDATORY_FIELDS_REQUIRED')
      );
      return;
    }

    // Check for validation errors in optional fields (only if they have data)
    const optionalFieldsWithErrors = this.getOptionalFieldsWithErrors();
    if (optionalFieldsWithErrors.length > 0) {
      const firstError = this.getFieldError(optionalFieldsWithErrors[0]);
      if (firstError) {
        this.toastr.error(firstError);
      } else {
        this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      }
      return;
    }

    const formData = this.entityForm.value;
    this.spinnerService.show();

    if (this.mode === 'add') {
      const createData: CreateEntityDto = {
        entitY_ID: formData.entitY_ID,
        entitY_NAME: formData.entitY_NAME?.trim(),
        entitY_NAME_EN: formData.entitY_NAME_EN?.trim(),
        entitY_LOCALTION: formData.entitY_LOCALTION?.trim() || null,
        entitY_PHONE: formData.entitY_PHONE?.trim() || null,
        entitY_WEBSITE: formData.entitY_WEBSITE?.trim() || null,
        entitY_MAIL: formData.entitY_MAIL?.trim() || null,
        acC_DETAILS_ID: formData.acC_DETAILS_ID,
      };

      this.entityService.createEntity(createData).subscribe({
        next: (res) => {
          this.toastr.success(this.translate.instant('TOAST.ENTITY_CREATED'));
          this.getEntities(this.currentPage, this.searchValue);
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error(this.translate.instant('TOAST.CREATE_ERROR'));
          this.spinnerService.hide();
        },
        complete: () => this.spinnerService.hide(),
      });
    } else if (this.mode === 'edit') {
      const updateData: UpdateEntityDto = {
        entitY_ID: formData.entitY_ID,
        entitY_NAME: formData.entitY_NAME?.trim(),
        entitY_NAME_EN: formData.entitY_NAME_EN?.trim(),
        entitY_LOCALTION: formData.entitY_LOCALTION?.trim() || null,
        entitY_PHONE: formData.entitY_PHONE?.trim() || null,
        entitY_WEBSITE: formData.entitY_WEBSITE?.trim() || null,
        entitY_MAIL: formData.entitY_MAIL?.trim() || null,
        acC_DETAILS_ID: formData.acC_DETAILS_ID,
      };

      this.entityService.updateEntity(updateData).subscribe({
        next: (res) => {
          this.toastr.success(this.translate.instant('TOAST.ENTITY_UPDATED'));
          this.getEntities(this.currentPage, this.searchValue);
          this.closeModal();
        },
        error: (err) => {
          this.spinnerService.hide();
          this.toastr.error(this.translate.instant('TOAST.UPDATE_ERROR'));
        },
        complete: () => this.spinnerService.hide(),
      });
    }
  }

  // Helper method to get the first validation error
  getFirstValidationError(): string {
    // First check mandatory fields
    const mandatoryFields = ['entitY_NAME', 'entitY_NAME_EN'];
    for (const fieldName of mandatoryFields) {
      const control = this.entityForm.get(fieldName);
      if (control && control.errors) {
        return this.getFieldError(fieldName);
      }
    }

    // Then check optional fields that have data
    const optionalFieldsWithErrors = this.getOptionalFieldsWithErrors();
    if (optionalFieldsWithErrors.length > 0) {
      return this.getFieldError(optionalFieldsWithErrors[0]);
    }

    return '';
  }

  // Modal operations
  openAddModal(): void {
    this.mode = 'add';
    this.submitted = false;
    // Ensure form is enabled for adding
    this.entityForm.enable();
    this.entityForm.reset({
      acC_DETAILS_ID: null,
    });
  }

  openEditModal(entity: EntityDto): void {
    this.mode = 'edit';
    this.editingEntityId = entity.entitY_ID;
    this.submitted = false;
    // Ensure form is enabled for editing
    this.entityForm.enable();
    this.entityForm.patchValue({
      entitY_ID: entity.entitY_ID,
      entitY_NAME: entity.entitY_NAME,
      entitY_NAME_EN: entity.entitY_NAME_EN,
      entitY_LOCALTION: entity.entitY_LOCALTION,
      entitY_PHONE: entity.entitY_PHONE,
      entitY_WEBSITE: entity.entitY_WEBSITE,
      entitY_MAIL: entity.entitY_MAIL,
      acC_DETAILS_ID: entity.acC_DETAILS_ID,
    });
  }

  openViewModal(entity: EntityDto): void {
    this.mode = 'view';
    this.submitted = false;
    this.entityForm.patchValue({
      entitY_ID: entity.entitY_ID,
      entitY_NAME: entity.entitY_NAME,
      entitY_NAME_EN: entity.entitY_NAME_EN,
      entitY_LOCALTION: entity.entitY_LOCALTION,
      entitY_PHONE: entity.entitY_PHONE,
      entitY_WEBSITE: entity.entitY_WEBSITE,
      entitY_MAIL: entity.entitY_MAIL,
      acC_DETAILS_ID: entity.acC_DETAILS_ID,
    });
    this.entityForm.disable();
  }

  closeModal(): void {
    this.entityForm.reset();
    this.entityForm.enable();
    this.submitted = false;
    const closeBtn = document.querySelector(
      '#Entity .btn-close'
    ) as HTMLElement;
    closeBtn?.click();
  }

  // Delete operations
  selectEntityToDelete(entity: EntityDto): void {
    this.selectedEntityToDelete = entity.entitY_ID;
  }

  deleteEntity(): void {
    if (this.selectedEntityToDelete) {
      this.spinnerService.show();
      this.entityService.deleteEntity(this.selectedEntityToDelete).subscribe({
        next: (response) => {
          this.selectedEntityToDelete = null;
          this.spinnerService.hide();
          this.toastr.success(this.translate.instant('TOAST.ENTITY_DELETED'));
          const closeBtn = document.querySelector(
            '.btn-delete.btn-close'
          ) as HTMLElement;
          closeBtn?.click();
          this.getEntities(this.currentPage, this.searchValue);
        },
        error: (error) => {
          this.spinnerService.hide();
          this.toastr.error('Failed to delete entity');
        },
      });
    }
  }

  // Table event handlers
  onViewDetails(entity: EntityDto): void {
    this.openViewModal(entity);
  }

  onEdit(entity: EntityDto): void {
    this.openEditModal(entity);
  }

  onDelete(entity: EntityDto): void {
    this.selectEntityToDelete(entity);
  }

  // Helper methods
  getSerialNumber(index: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + index + 1;
  }

  getEntityProperty(entity: any, propertyName: string): string {
    // Try different case variations of the property name
    const variations = [
      propertyName, // Original case
      propertyName.toLowerCase(), // Lowercase
      propertyName.charAt(0).toLowerCase() + propertyName.slice(1), // camelCase
    ];

    for (const variation of variations) {
      if (entity[variation] !== undefined && entity[variation] !== null) {
        return entity[variation];
      }
    }

    return '-';
  }

  getAccountDetailsName(accDetailsId: string): string {
    if (!accDetailsId || accDetailsId === '-') return '-';
    const account = this.accountDetailsOptions.find(
      (acc) => acc.id === accDetailsId
    );
    return account ? account.text : accDetailsId;
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge bg-success' : 'badge bg-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
