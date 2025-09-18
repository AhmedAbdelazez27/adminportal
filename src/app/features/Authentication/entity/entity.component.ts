import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
    BackendEntityDto,
    CreateEntityDto,
    UpdateEntityDto,
    EntityParameter,
    PagedResultDto,
    AttachmentDto,
    AttachmentBase64Dto,
} from '../../../core/dtos/Authentication/Entity/entity.dto';
import { ColDef, GridOptions } from 'ag-grid-community';
import { PagedDto, Pagination } from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { Subject } from 'rxjs';
import { AttachmentService } from '../../../core/services/attachments/attachment.service';
import { AttachmentsConfigType, AttachmentsConfigDto } from '../../../core/dtos/attachments/attachments-config.dto';
import { UpdateAttachmentBase64Dto } from '../../../core/dtos/attachments/attachment.dto';

declare var bootstrap: any;
@Component({
    selector: 'app-entity',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        NgSelectModule,
        GenericDataTableComponent
    ],
    templateUrl: './entity.component.html',
    styleUrl: './entity.component.scss',
})
export class EntityComponent implements OnInit, OnDestroy {
    @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent
    entities: EntityDto[] = [];
    loadgridData: EntityDto[] = [];
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
    selectedEntityObject: EntityDto | null = null;
    isActiveFilter: boolean | undefined = undefined;
    isLoading: boolean = false;
    Math = Math; // Make Math available in template
    environment = environment; // Make environment available in template

    // Attachment-related properties
    selectedFile: File | null = null;
    filePreview: string | null = null;
    existingAttachment: AttachmentDto | null = null;
    existingImageUrl: string | null = null;
    isDragOver: boolean = false;
    uploadProgress: number = 0;
    fileValidationErrors: string[] = [];
    fileValidationSuccess: boolean = false;
    selectedAttachmentToDelete: AttachmentDto | null = null;
    attachmentConfigs: AttachmentsConfigDto[] = [];
    isLoadingDropdowns: boolean = false;

    // Account Details dropdown options (static data as requested)
    accountDetailsOptions: any[] = [
        { id: 'ACC001', text: 'Account Details 1' },
        { id: 'ACC002', text: 'Account Details 2' },
        { id: 'ACC003', text: 'Account Details 3' },
        { id: 'ACC004', text: 'Account Details 4' },
        { id: 'ACC005', text: 'Account Details 5' },
    ];

    // Status options for ng-select
    statusOptions: any[] = [
        { id: undefined, text: 'All' },
        { id: true, text: 'Active' },
        { id: false, text: 'Inactive' }
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
        'ENTITY_NAME_EN',
        'ENTITY_NAME',
        'ENTITY_LOCALTION',
        'ENTITY_PHONE',
        'ENTITY_WEBSITE',
        'ENTITY_MAIL',
        'ACC_DETAILS_ID',
        'actions',
    ];
    showAction: boolean = true;
    actionTypes: string[] = ['view', 'edit', 'delete'];

    searchParams: EntityParameter = {
        searchValue: '',
        entityId: undefined,
        isShowInPortal: false,
        isDonation: undefined,
        active: undefined,
        skip: 0,
        take: 10
    };
    searchInput$ = new Subject<string>();
    translatedHeaders: string[] = [];
    pagination = new Pagination();

    columnDefs: ColDef[] = [];
    columnDefslineData: ColDef[] = [];
    gridOptions: GridOptions = { pagination: false };
    searchText: string = '';
    columnHeaderMap: { [key: string]: string } = {};
    rowActions: Array<{ label: string, icon?: string, action: string }> = [];

    // Modal instances for proper cleanup
    private mainModalInstance: any = null;
    private deleteModalInstance: any = null;
    private deleteAttachmentModalInstance: any = null;

    constructor(
        private entityService: EntityService,
        private spinnerService: SpinnerService,
        private toastr: ToastrService,
        public translate: TranslateService,
        private fb: FormBuilder,
        private attachmentService: AttachmentService
    ) {
        this.entityForm = this.fb.group({
            ENTITY_NAME: [
                '',
                [
                    Validators.required,
                    Validators.minLength(1),
                    Validators.maxLength(4000),
                    this.noWhitespaceValidator,
                ],
            ],
            ENTITY_NAME_EN: [
                '',
                [
                    Validators.required,
                    Validators.minLength(1),
                    Validators.maxLength(4000),
                    this.noWhitespaceValidator,
                ],
            ],
            ENTITY_LOCALTION: [
                '',
                [Validators.maxLength(4000), this.noWhitespaceValidator],
            ],
            ENTITY_PHONE: ['', [Validators.maxLength(100), this.phoneValidator]],
            ENTITY_WEBSITE: ['', [Validators.maxLength(100), this.websiteValidator]],
            ENTITY_MAIL: [
                '',
                [Validators.maxLength(100), Validators.email, this.emailValidator],
            ],
            ACC_DETAILS_ID: [null],
            ENTITY_ID: [null],
            DescriptionAr: ['', [Validators.maxLength(4000)]],
            DescriptionEn: ['', [Validators.maxLength(4000)]],
            IsShowInPortal: [false],
            IsDonation: [false],
            Active: [true],
            licenseNumber: ['', [Validators.maxLength(100), this.noWhitespaceValidator]],
            licenseEndDate: [null],
            foundationType: [null],
        });
    }

    ngOnInit(): void {
        // Remove the conflicting getEntities call and only use getLoadDataGrid
        this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
        this.loadAttachmentsConfig();

        // Build column definitions and row actions after a short delay to ensure translations are ready
        setTimeout(() => {
            this.buildColumnDefs();
            this.rowActions = [
                { label: this.translate.instant('COMMON.VIEW_INFO'), icon: 'icon-frame-view', action: 'onViewInfo' },
                { label: this.translate.instant('COMMON.EDIT_INFO'), icon: 'icon-frame-edit', action: 'onEditInfo' },
                { label: this.translate.instant('COMMON.DELETE_INFO'), icon: 'icon-frame-delete', action: 'onDeleteInfo' },
            ];
        }, 100);
    }

    ngOnDestroy(): void {
        // Clean up modal instances
        this.disposeAllModals();

        // Clear any remaining modal backdrops
        this.clearModalBackdrops();

        // Restore body scroll if locked
        this.restoreBodyScroll();
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
        const mandatoryFields = ['ENTITY_NAME', 'ENTITY_NAME_EN'];
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
        const mandatoryFields = ['ENTITY_NAME', 'ENTITY_NAME_EN'];
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
        if (fieldName === 'ENTITY_NAME' || fieldName === 'ENTITY_NAME_EN') {
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
        if (fieldName === 'ENTITY_NAME' || fieldName === 'ENTITY_NAME_EN') {
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
        const arabicNameControl = this.entityForm.get('ENTITY_NAME');
        const englishNameControl = this.entityForm.get('ENTITY_NAME_EN');

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
            'ENTITY_LOCALTION',
            'ENTITY_PHONE',
            'ENTITY_WEBSITE',
            'ENTITY_MAIL',
            'ACC_DETAILS_ID',
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

    private cleanFilterObject(obj: any): any {
        const cleaned = { ...obj };
        Object.keys(cleaned).forEach((key) => {
            if (cleaned[key] === '') {
                cleaned[key] = null;
            }
        });
        return cleaned;
    }

    // Helper method to transform backend data to expected format
    private transformBackendData(data: BackendEntityDto[]): EntityDto[] {
        const transformed = data.map(item => {
            const transformedItem: EntityDto = {
                ENTITY_ID: item.entitY_ID || (item as any).ENTITY_ID,
                ENTITY_NAME: item.entitY_NAME || (item as any).ENTITY_NAME,
                ENTITY_NAME_EN: item.entitY_NAME_EN || (item as any).ENTITY_NAME_EN,
                ENTITY_LOCALTION: item.entitY_LOCALTION || (item as any).ENTITY_LOCALTION,
                ENTITY_PHONE: item.entitY_PHONE || (item as any).ENTITY_PHONE,
                ENTITY_WEBSITE: item.entitY_WEBSITE || (item as any).ENTITY_WEBSITE,
                ENTITY_MAIL: item.entitY_MAIL || (item as any).ENTITY_MAIL,
                ACC_DETAILS_ID: item.acC_DETAILS_ID || (item as any).ACC_DETAILS_ID,
                DescriptionAr: item.descriptionAr || (item as any).DescriptionAr,
                DescriptionEn: item.descriptionEn || (item as any).DescriptionEn,
                IsShowInPortal: item.isShowInPortal !== undefined ? item.isShowInPortal : (item as any).IsShowInPortal,
                IsDonation: item.isDonation !== undefined ? item.isDonation : (item as any).IsDonation,
                Active: item.active !== undefined ? item.active : (item as any).Active,
                MasterId: item.masterId || (item as any).MasterId,
                // Handle single attachment object
                Attachment: item.attachment || (item as any).attachment,
                licenseNumber: (item as any).licenseNumber ?? (item as any).LicenseNumber ?? (item as any).LICENSE_NUMBER,
                licenseEndDate: (item as any).licenseEndDate ?? (item as any).LicenseEndDate ?? (item as any).LICENSE_END_DATE,
                foundationType: (item as any).foundationType ?? (item as any).FoundationType ?? (item as any).FOUNDATION_TYPE,
            };
            return transformedItem;
        });

        return transformed;
    }

    getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
        this.pagination.currentPage = event.pageNumber;
        this.pagination.take = event.pageSize;
        const skip = (event.pageNumber - 1) * event.pageSize;
        this.searchParams.skip = skip;
        this.searchParams.take = event.pageSize;
        this.searchParams.active = this.isActiveFilter;
        this.searchParams.searchValue = this.searchValue;
        const cleanedFilters = this.cleanFilterObject(this.searchParams);
        cleanedFilters.searchValue = cleanedFilters.searchValue != null ? cleanedFilters.searchValue : '';

        this.spinnerService.show();
        this.entityService.getAllEntities(cleanedFilters).subscribe(
            (data: any) => {

                // Handle different response formats
                let allData: EntityDto[] = [];
                let totalCount: number = 0;

                if (data && data.data) {
                    // API response with data property
                    allData = this.transformBackendData(data.data);
                    totalCount = data.totalCount || data.total || data.data.length || 0;
                } else if (data && data.items) {
                    // Standard PagedResultDto format
                    allData = this.transformBackendData(data.items);
                    totalCount = data.totalCount || 0;
                } else if (data && Array.isArray(data)) {
                    // Direct array response
                    allData = this.transformBackendData(data);
                    totalCount = data.length;
                } else if (data && data.results) {
                    // Select2 format
                    allData = this.transformBackendData(data.results);
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
                            ENTITY_ID: 'ENT001',
                            ENTITY_NAME: 'شركة تجريبية',
                            ENTITY_NAME_EN: 'Test Company',
                            ENTITY_LOCALTION: 'Dubai, UAE',
                            ENTITY_PHONE: '+971-50-123-4567',
                            ENTITY_WEBSITE: 'www.testcompany.com',
                            ENTITY_MAIL: 'info@testcompany.com',
                            ACC_DETAILS_ID: 'ACC001',
                            IsShowInPortal: true,
                            IsDonation: false,
                            MasterId: 1,
                        },
                        {
                            ENTITY_ID: 'ENT002',
                            ENTITY_NAME: 'مؤسسة تجريبية',
                            ENTITY_NAME_EN: 'Test Foundation',
                            ENTITY_LOCALTION: 'Abu Dhabi, UAE',
                            ENTITY_PHONE: '+971-2-123-4567',
                            ENTITY_WEBSITE: 'www.testfoundation.com',
                            ENTITY_MAIL: 'contact@testfoundation.com',
                            ACC_DETAILS_ID: 'ACC002',
                            IsShowInPortal: false,
                            IsDonation: true,
                            MasterId: 2,
                        },
                    ];
                    totalCount = 2;
                }

                // Update component properties
                this.loadgridData = allData;
                this.pagination.totalCount = totalCount;

                this.spinnerService.hide();
            },
            (error) => {
                this.toastr.error(
                    this.translate.instant('ERROR.FETCH_ROLES'),
                    this.translate.instant('TOAST.TITLE.ERROR')
                );
                this.spinnerService.hide();
            }
        );
    }

    getEntities(page: number, searchValue: string = ''): void {
        const skip = (page - 1) * this.itemsPerPage;
        this.isLoading = true;
        this.spinnerService.show();

        const parameters: EntityParameter = {
            skip: skip,
            take: this.itemsPerPage,
            searchValue: searchValue,
            isShowInPortal: false,
            isDonation: undefined,
            active: this.isActiveFilter,
        };

        this.entityService.getAllEntities(parameters).subscribe({
            next: (data: any) => {
                // Handle different response formats
                let allData: EntityDto[] = [];
                let totalCount: number = 0;

                if (data && data.data) {
                    // API response with data property
                    allData = this.transformBackendData(data.data);
                    totalCount = data.totalCount || data.total || data.data.length || 0;
                } else if (data && data.items) {
                    // Standard PagedResultDto format
                    allData = this.transformBackendData(data.items);
                    totalCount = data.totalCount || 0;
                } else if (data && Array.isArray(data)) {
                    // Direct array response
                    allData = this.transformBackendData(data);
                    totalCount = data.length;
                } else if (data && data.results) {
                    // Select2 format
                    allData = this.transformBackendData(data.results);
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
                            ENTITY_ID: 'ENT001',
                            ENTITY_NAME: 'شركة تجريبية',
                            ENTITY_NAME_EN: 'Test Company',
                            ENTITY_LOCALTION: 'Dubai, UAE',
                            ENTITY_PHONE: '+971-50-123-4567',
                            ENTITY_WEBSITE: 'www.testcompany.com',
                            ENTITY_MAIL: 'info@testcompany.com',
                            ACC_DETAILS_ID: 'ACC001',
                            IsShowInPortal: true,
                            MasterId: 1,
                        },
                        {
                            ENTITY_ID: 'ENT002',
                            ENTITY_NAME: 'مؤسسة تجريبية',
                            ENTITY_NAME_EN: 'Test Foundation',
                            ENTITY_LOCALTION: 'Abu Dhabi, UAE',
                            ENTITY_PHONE: '+971-2-123-4567',
                            ENTITY_WEBSITE: 'www.testfoundation.com',
                            ENTITY_MAIL: 'contact@testfoundation.com',
                            ACC_DETAILS_ID: 'ACC002',
                            IsShowInPortal: false,
                            MasterId: 2,
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

        this.getLoadDataGrid({ pageNumber: page, pageSize: this.pagination.take });
    }

    changePerPage(event: any): void {
        const perPage = parseInt(event.target.value, 10);
        if (!isNaN(perPage) && perPage > 0) {
            this.pagination.take = perPage;
            this.pagination.currentPage = 1; // Reset to first page
            this.getLoadDataGrid({ pageNumber: 1, pageSize: perPage });
        }
    }

    onSearch(): void {
        this.searchParams.searchValue = this.searchValue;
        this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
    }

    clear(): void {
        this.searchValue = '';
        this.isActiveFilter = undefined;
        this.searchParams.searchValue = '';
        this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
    }

    // Form submission
    async submit(): Promise<void> {
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

        // Attachment validation (similar to locations component)
        const entityImageConfig = this.getEntityImageConfig();
        const hasExistingAttachment = !!this.existingAttachment;
        const hasNewFile = !!this.selectedFile;

        if (entityImageConfig) {
            if (this.mode === 'add' && !hasNewFile) {
                this.toastr.error(this.translate.instant('FILE.ENTITY_IMAGE_REQUIRED'));
                return;
            }
            if (this.mode === 'edit' && !hasExistingAttachment && !hasNewFile) {
                this.toastr.error(this.translate.instant('FILE.ENTITY_IMAGE_REQUIRED'));
                return;
            }
        }

        this.spinnerService.show();

        try {
            let attachmentDto: AttachmentBase64Dto | null = null;

            if (this.selectedFile && entityImageConfig) {
                const fileBase64 = await this.fileToBase64(this.selectedFile);
                const masterId = this.mode === 'edit' && this.selectedEntityObject?.MasterId ? this.selectedEntityObject.MasterId : 0;
                // Creating attachment DTO
                attachmentDto = {
                    fileBase64,
                    fileName: this.selectedFile.name,
                    masterId: masterId,
                    attConfigID: entityImageConfig.id,
                };
            }
            // Note: If no new file is selected, attachmentDto remains null,
            // which means "don't change the existing attachment" for edit mode

            if (this.mode === 'add') {
                const createData: CreateEntityDto = {
                    ENTITY_NAME: formData.ENTITY_NAME?.trim(),
                    ENTITY_NAME_EN: formData.ENTITY_NAME_EN?.trim(),
                    ENTITY_LOCALTION: formData.ENTITY_LOCALTION?.trim() || null,
                    ENTITY_PHONE: formData.ENTITY_PHONE?.trim() || null,
                    ENTITY_WEBSITE: formData.ENTITY_WEBSITE?.trim() || null,
                    ENTITY_MAIL: formData.ENTITY_MAIL?.trim() || null,
                    ACC_DETAILS_ID: formData.ACC_DETAILS_ID,
                    DescriptionAr: formData.DescriptionAr?.trim() || null,
                    DescriptionEn: formData.DescriptionEn?.trim() || null,
                    IsShowInPortal: formData.IsShowInPortal || false,
                    IsDonation: formData.IsDonation || false,
                    Active: formData.Active !== undefined ? formData.Active : true,
                    Attachment: attachmentDto || undefined,
                    licenseNumber: formData.licenseNumber?.trim() || null,
                    licenseEndDate: this.toIsoOrNull(formData.licenseEndDate), // أو ابعتها كما هي لو الـ API عايز YYYY-MM-DD
                    foundationType: formData.foundationType ?? null,
                };

                this.entityService.createEntity(createData).subscribe({
                    next: (res) => {
                        this.toastr.success(this.translate.instant('TOAST.ENTITY_CREATED'));
                        this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take });
                        this.closeModal();
                        this.spinnerService.hide();
                    },
                    error: (err) => {
                        this.toastr.error(this.translate.instant('TOAST.CREATE_ERROR'));
                        this.spinnerService.hide();
                    },
                });
            } else if (this.mode === 'edit') {
                // Ensure we have the correct ENTITY_ID for update
                const entityId = formData.ENTITY_ID || this.editingEntityId || this.selectedEntityObject?.ENTITY_ID;
                
                if (!entityId) {
                    this.toastr.error(this.translate.instant('TOAST.ENTITY_ID_MISSING_ERROR'));
                    this.spinnerService.hide();
                    return;
                }

                const updateData: UpdateEntityDto = {
                    ENTITY_ID: entityId,
                    ENTITY_NAME: formData.ENTITY_NAME?.trim(),
                    ENTITY_NAME_EN: formData.ENTITY_NAME_EN?.trim(),
                    ENTITY_LOCALTION: formData.ENTITY_LOCALTION?.trim() || null,
                    ENTITY_PHONE: formData.ENTITY_PHONE?.trim() || null,
                    ENTITY_WEBSITE: formData.ENTITY_WEBSITE?.trim() || null,
                    ENTITY_MAIL: formData.ENTITY_MAIL?.trim() || null,
                    ACC_DETAILS_ID: formData.ACC_DETAILS_ID,
                    DescriptionAr: formData.DescriptionAr?.trim() || null,
                    DescriptionEn: formData.DescriptionEn?.trim() || null,
                    IsShowInPortal: formData.IsShowInPortal || false,
                    IsDonation: formData.IsDonation || false,
                    Active: formData.Active !== undefined ? formData.Active : true,
                    licenseNumber: formData.licenseNumber?.trim() || null,
                    licenseEndDate: this.toIsoOrNull(formData.licenseEndDate),
                    foundationType: formData.foundationType ?? null,
                };

                this.entityService.updateEntity(updateData).subscribe({
                    next: (res) => {
                        this.toastr.success(this.translate.instant('TOAST.ENTITY_UPDATED'));

                        // Handle attachment update separately
                        if (attachmentDto) {
                            if (this.existingAttachment) {
                                // Update existing attachment
                                this.updateAttachmentSeparately(attachmentDto);
                            } else {
                                // Create new attachment with correct masterId
                                attachmentDto.masterId = this.selectedEntityObject?.MasterId || 0;
                                this.createAttachmentSeparately(attachmentDto);
                            }
                        } else {
                            // No attachment change, just refresh and close
                            this.refreshImageAfterUpdate();
                            this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take });
                            this.closeModal();
                            this.spinnerService.hide();
                        }
                    },
                    error: (err) => {
                        this.spinnerService.hide();
                        this.toastr.error(this.translate.instant('TOAST.UPDATE_ERROR'));
                    },
                });
            }
        } catch (error) {
            this.toastr.error(this.translate.instant('FILE.ERROR_PROCESSING_FILE'));
            this.spinnerService.hide();
        }
    }


    private toIsoOrNull(d: string | Date | null | undefined): string | null {
        if (!d) return null;

        if (typeof d === 'string') {
            const [y, m, day] = d.split('-').map(Number);
            if (!y || !m || !day) return null;
            const date = new Date(y, m - 1, day);
            return isNaN(date.getTime()) ? null : date.toISOString();
        }

        return isNaN(d.getTime()) ? null : d.toISOString();
    }

    // Helper method to get the first validation error
    getFirstValidationError(): string {
        // First check mandatory fields
        const mandatoryFields = ['ENTITY_NAME', 'ENTITY_NAME_EN'];
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
        this.resetModalState('add').then(() => {
            this.entityForm.enable();
            this.showModal();
        });
    }

    openEditModal(entity: EntityDto): void {
        this.entityService.getEntityById(entity.ENTITY_ID).subscribe({
            next: async (fullEntity: any) => {
                // Transform the API response to expected format
                const transformedEntity = this.transformApiResponse(fullEntity);
                // Set the selectedEntityObject with the full entity data including MasterId
                this.selectedEntityObject = transformedEntity;
                await this.resetModalState('edit', transformedEntity);
                if (!transformedEntity.Attachment && entity.ENTITY_ID) {
                    this.fetchAttachmentData(entity.ENTITY_ID);
                }
                this.populateForm(transformedEntity);
                this.entityForm.enable();
                this.showModal();
            },
            error: async (error: any) => {
                this.toastr.error(this.translate.instant('TOAST.ERROR_LOADING_ENTITY_DETAILS'));
                // Set the selectedEntityObject with the original entity data
                this.selectedEntityObject = entity;
                await this.resetModalState('edit', entity);
                if (!entity.Attachment && entity.ENTITY_ID) {
                    this.fetchAttachmentData(entity.ENTITY_ID);
                }
                this.populateForm(entity);
                this.entityForm.enable();
                this.showModal();
            },
        });
    }
    private toDateInputValue(d: string | Date | null | undefined): string | null {
        if (!d) return null;
        const date = typeof d === 'string' ? new Date(d) : d;
        if (isNaN(date.getTime())) return null;
        return date.toISOString().slice(0, 10); // YYYY-MM-DD
    }
    openViewModal(entity: EntityDto): void {
        this.entityService.getEntityById(entity.ENTITY_ID).subscribe({
            next: async (fullEntity: any) => {
                // Transform the API response to expected format
                const transformedEntity = this.transformApiResponse(fullEntity);
                await this.resetModalState('view', transformedEntity);
                if (entity.ENTITY_ID) {
                    this.fetchAttachmentData(entity.ENTITY_ID);
                }
                this.populateForm(transformedEntity);
                this.entityForm.disable();
                this.showModal();
            },
            error: async (error: any) => {
                this.toastr.error(this.translate.instant('TOAST.ERROR_LOADING_ENTITY_DETAILS'));
                await this.resetModalState('view', entity);
                if (entity.ENTITY_ID) {
                    this.fetchAttachmentData(entity.ENTITY_ID);
                }
                this.populateForm(entity);
                this.entityForm.disable();
                this.showModal();
            },
        });
    }

    private populateForm(entity: EntityDto): void {
        this.entityForm.patchValue({
            ENTITY_ID: entity.ENTITY_ID,
            ENTITY_NAME: entity.ENTITY_NAME,
            ENTITY_NAME_EN: entity.ENTITY_NAME_EN,
            ENTITY_LOCALTION: entity.ENTITY_LOCALTION,
            ENTITY_PHONE: entity.ENTITY_PHONE,
            ENTITY_WEBSITE: entity.ENTITY_WEBSITE,
            ENTITY_MAIL: entity.ENTITY_MAIL,
            ACC_DETAILS_ID: entity.ACC_DETAILS_ID,
            DescriptionAr: entity.DescriptionAr,
            DescriptionEn: entity.DescriptionEn,
            IsShowInPortal: entity.IsShowInPortal,
            IsDonation: entity.IsDonation,
            Active: entity.Active,
            licenseNumber: entity.licenseNumber || null,
            licenseEndDate: this.toDateInputValue(entity.licenseEndDate),
            foundationType: entity.foundationType || null,
        });
    }

    /**
     * Transforms API response to match the expected EntityDto format
     */
    private transformApiResponse(apiResponse: any): EntityDto {
        const transformed = {
            ENTITY_ID: apiResponse.entitY_ID || apiResponse.ENTITY_ID,
            ENTITY_NAME: apiResponse.entitY_NAME || apiResponse.ENTITY_NAME,
            ENTITY_NAME_EN: apiResponse.entitY_NAME_EN || apiResponse.ENTITY_NAME_EN,
            ENTITY_LOCALTION: apiResponse.entitY_LOCALTION || apiResponse.ENTITY_LOCALTION,
            ENTITY_PHONE: apiResponse.entitY_PHONE || apiResponse.ENTITY_PHONE,
            ENTITY_WEBSITE: apiResponse.entitY_WEBSITE || apiResponse.ENTITY_WEBSITE,
            ENTITY_MAIL: apiResponse.entitY_MAIL || apiResponse.ENTITY_MAIL,
            ACC_DETAILS_ID: apiResponse.acC_DETAILS_ID || apiResponse.ACC_DETAILS_ID,
            DescriptionAr: apiResponse.descriptionAr || apiResponse.DescriptionAr,
            DescriptionEn: apiResponse.descriptionEn || apiResponse.DescriptionEn,
            IsShowInPortal: apiResponse.isShowInPortal || apiResponse.IsShowInPortal,
            IsDonation: apiResponse.isDonation || apiResponse.IsDonation,
            Active: apiResponse.active !== undefined ? apiResponse.active : apiResponse.Active,
            MasterId: apiResponse.masterId || apiResponse.MasterId,
            Attachment: apiResponse.attachment || apiResponse.Attachment,
            licenseNumber: apiResponse.licenseNumber ?? apiResponse.LicenseNumber ?? apiResponse.LICENSE_NUMBER,
            licenseEndDate: apiResponse.licenseEndDate ?? apiResponse.LicenseEndDate ?? apiResponse.LICENSE_END_DATE,
            foundationType: apiResponse.foundationType ?? apiResponse.FoundationType ?? apiResponse.FOUNDATION_TYPE,
        };

        return transformed;
    }

    private showModal(): void {
        const modal = document.getElementById('Entity');
        if (modal) {
            // Dispose existing instance if any
            if (this.mainModalInstance) {
                this.mainModalInstance.dispose();
            }

            this.mainModalInstance = new (window as any).bootstrap.Modal(modal, {
                backdrop: 'static',
                keyboard: false
            });

            // Add proper event listeners for cleanup
            modal.addEventListener('hidden.bs.modal', () => {
                this.onModalHidden();
            });

            this.mainModalInstance.show();
        }
    }

    closeModal(): void {
        this.resetModalState('add').then(() => {
            this.entityForm.enable();

            // Properly close the modal using Bootstrap API
            if (this.mainModalInstance) {
                this.mainModalInstance.hide();
            } else {
                // Fallback if instance is not available
                const modal = document.getElementById('Entity');
                if (modal) {
                    const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
                    if (bootstrapModal) {
                        bootstrapModal.hide();
                    }
                }
            }
        });
    }

    // Delete operations
    selectEntityToDelete(entity: EntityDto): void {
        this.selectedEntityToDelete = entity.ENTITY_ID;
        this.selectedEntityObject = entity;
    }

    deleteEntity(): void {
        if (this.selectedEntityToDelete) {
            this.spinnerService.show();
            this.entityService.deleteEntity(this.selectedEntityToDelete).subscribe({
                next: (response) => {
                    this.selectedEntityToDelete = null;
                    this.selectedEntityObject = null;
                    this.spinnerService.hide();
                    this.toastr.success(this.translate.instant('TOAST.ENTITY_DELETED'));

                    // Properly close the delete modal
                    if (this.deleteModalInstance) {
                        this.deleteModalInstance.hide();
                    }

                    this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take });
                },
                error: (error) => {
                    this.spinnerService.hide();
                    this.toastr.error(this.translate.instant('TOAST.ENTITY_DELETE_ERROR'));
                },
            });
        }
    }

    // Table event handlers
    onViewDetails(entity: EntityDto): void {
        this.openViewModal(entity);
        // Modal will be shown by the openViewModal method
    }

    onEdit(entity: EntityDto): void {
        this.openEditModal(entity);
        // Modal will be shown by the openEditModal method
    }

    onDelete(entity: EntityDto): void {
        this.selectEntityToDelete(entity);
        this.showDeleteModal();
    }

    // Helper methods
    getSerialNumber(index: number): number {
        return (this.currentPage - 1) * this.itemsPerPage + index + 1;
    }

    getEntityProperty(entity: any, propertyName: string): string {
        // Try different case variations of the property name
        const variations: string[] = [
            propertyName, // Original case (ENTITY_NAME_EN)
            propertyName.toLowerCase(), // lowercase (entity_name_en)
            propertyName.charAt(0).toLowerCase() + propertyName.slice(1), // camelCase (entityNameEn)
        ];

        // Handle the specific backend format
        if (propertyName === 'ENTITY_ID') variations.push('entitY_ID');
        if (propertyName === 'ENTITY_NAME') variations.push('entitY_NAME');
        if (propertyName === 'ENTITY_NAME_EN') variations.push('entitY_NAME_EN');
        if (propertyName === 'ENTITY_LOCALTION') variations.push('entitY_LOCALTION');
        if (propertyName === 'ENTITY_PHONE') variations.push('entitY_PHONE');
        if (propertyName === 'ENTITY_WEBSITE') variations.push('entitY_WEBSITE');
        if (propertyName === 'ENTITY_MAIL') variations.push('entitY_MAIL');
        if (propertyName === 'ACC_DETAILS_ID') variations.push('acC_DETAILS_ID');

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


    private buildColumnDefs(): void {
        this.columnDefs = [
            {
                headerName: '#',
                valueGetter: (params) =>
                    (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
                width: 60,
                colId: 'serialNumber'
            },
            { headerName: this.translate.instant('ENTITY.ENGLISH_NAME'), field: 'ENTITY_NAME_EN', width: 200 },
            { headerName: this.translate.instant('ENTITY.ARABIC_NAME'), field: 'ENTITY_NAME', width: 200 },
            { headerName: this.translate.instant('ENTITY.LOCATION'), field: 'ENTITY_LOCALTION', width: 200 },
            { headerName: this.translate.instant('ENTITY.PHONE'), field: 'ENTITY_PHONE', width: 200 },
            { headerName: this.translate.instant('ENTITY.WEBSITE'), field: 'ENTITY_WEBSITE', width: 200 },
            { headerName: this.translate.instant('ENTITY.EMAIL'), field: 'ENTITY_MAIL', width: 200 },
            { headerName: this.translate.instant('ENTITY.ACCOUNT_DETAILS'), field: 'ACC_DETAILS_ID', width: 200 },
            {
                field: 'Active',
                headerName: this.translate.instant('ENTITY.STATUS'),
                width: 100,
                sortable: true,
                filter: true,
                cellRenderer: (params: any) => {
                    const isActive = params.value;
                    return `<span class="badge ${isActive ? 'status-approved' : 'status-rejected'
                        }">${isActive ? 'Active' : 'Inactive'}</span>`;
                },
            }
        ];
    }

    onTableAction(event: { action: string, row: any }) {
        if (event.action === 'onViewInfo') {
            this.onViewDetails(event.row);
        }

        if (event.action === 'onEditInfo') {
            this.onEdit(event.row);
        }

        if (event.action === 'onDeleteInfo') {
            this.onDelete(event.row);
        }
    }

    onPageChange(event: { pageNumber: number; pageSize: number }): void {
        this.pagination.currentPage = event.pageNumber;
        this.pagination.take = event.pageSize;
        this.getLoadDataGrid({ pageNumber: event.pageNumber, pageSize: event.pageSize });
    }

    onTableSearch(text: string): void {
        this.searchText = text;
        this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
    }

    // Attachment methods
    private loadAttachmentsConfig(): void {
        this.attachmentService
            .getAttachmentsConfigByType(AttachmentsConfigType.Entity)
            .subscribe({
                next: (result: AttachmentsConfigDto[]) => {
                    this.attachmentConfigs = result || [];
                },
                error: (error) => {
                    this.toastr.error(this.translate.instant('FILE.ERROR_LOADING_ATTACHMENT_CONFIG'));
                    this.attachmentConfigs = [];
                },
            });
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (!file) return;
        this.validateAndSetFile(file);
    }

    removeFile(): void {
        this.selectedFile = null;
        this.filePreview = null;
        this.fileValidationErrors = [];
        this.fileValidationSuccess = false;
        this.uploadProgress = 0;
        const fileInput = document.getElementById('entityImage') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    removeExistingImage(): void {
        this.selectedAttachmentToDelete = this.existingAttachment;
        this.showDeleteAttachmentModal();
    }

    confirmDeleteAttachment(): void {
        if (!this.selectedAttachmentToDelete) return;

        this.spinnerService.show();
        this.attachmentService
            .deleteAsync(this.selectedAttachmentToDelete.id)
            .subscribe({
                next: () => {
                    this.toastr.success(this.translate.instant('FILE.ATTACHMENT_DELETED_SUCCESS'));
                    this.existingAttachment = null;
                    this.existingImageUrl = null;
                    this.selectedAttachmentToDelete = null;

                    // Properly close the delete attachment modal
                    if (this.deleteAttachmentModalInstance) {
                        this.deleteAttachmentModalInstance.hide();
                    }

                    this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take });
                    this.spinnerService.hide();
                },
                error: (error) => {
                    this.toastr.error(this.translate.instant('FILE.ERROR_DELETING_ATTACHMENT'));
                    this.spinnerService.hide();
                },
            });
    }

    cancelDeleteAttachment(): void {
        this.selectedAttachmentToDelete = null;
    }

    closeDeleteModal(): void {
        if (this.deleteModalInstance) {
            this.deleteModalInstance.hide();
        }
        this.selectedEntityToDelete = null;
        this.selectedEntityObject = null;
    }

    closeDeleteAttachmentModal(): void {
        if (this.deleteAttachmentModalInstance) {
            this.deleteAttachmentModalInstance.hide();
        }
        this.selectedAttachmentToDelete = null;
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];
            this.validateAndSetFile(file);
        }
    }

    confirmFileSelection(): void {
        if (this.selectedFile) {
            this.fileValidationSuccess = true;
            this.toastr.success(this.translate.instant('FILE.FILE_VALID_READY'));
        }
    }

    private validateAndSetFile(file: File): void {
        this.fileValidationErrors = [];
        this.fileValidationSuccess = false;

        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/pdf',
        ];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!allowedTypes.includes(file.type)) {
            this.fileValidationErrors.push(
                'Invalid file type. Only PDF, JPG, and PNG files are allowed.'
            );
            return;
        }

        if (file.size > maxSize) {
            this.fileValidationErrors.push('File size must be less than 2MB.');
            return;
        }

        this.selectedFile = file;
        this.fileValidationSuccess = true;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.filePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            this.filePreview = null;
        }

        if (this.mode === 'edit' && this.existingImageUrl) {
            this.toastr.info(
                this.translate.instant('FILE.NEW_IMAGE_SELECTED')
            );
        }
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => reject(error);
        });
    }

    private getEntityImageConfig(): any {
        return this.attachmentConfigs.find(
            (config) =>
                config.attachmentsConfigType === AttachmentsConfigType.Entity
        );
    }

    private constructImageUrl(imgPath: string): string {
        if (!imgPath) return '';

        const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;

        if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
            return imgPath;
        }

        let fullUrl: string;

        if (cleanPath.startsWith('Uploads/')) {
            const baseUrl = environment.apiBaseUrl.replace('/api', '');
            fullUrl = `${baseUrl}/${cleanPath}`;
        } else {
            fullUrl = `${environment.apiBaseUrl}/${cleanPath}`;
        }

        const cacheBuster = `?t=${Date.now()}`;
        const urlWithCacheBuster = `${fullUrl}${cacheBuster}`;

        return urlWithCacheBuster;
    }

    onImageLoad(event: any): void {
        // Image loaded successfully
        const imgElement = event.target;
        if (imgElement) {
            imgElement.style.display = 'block';
        }
    }

    onImageError(event: any): void {
        const imgElement = event.target;
        if (imgElement) {
            imgElement.style.display = 'none';
        }
        this.existingImageUrl = null;
        this.toastr.error(
            this.translate.instant('FILE.IMAGE_LOAD_ERROR'),
            this.translate.instant('FILE.IMAGE_LOAD_ERROR_TITLE')
        );
    }

    openImageInNewTab(): void {
        if (this.existingImageUrl) {
            window.open(this.existingImageUrl, '_blank');
        }
    }

    private async resetModalState(
        mode: 'add' | 'edit' | 'view',
        entity?: EntityDto
    ): Promise<void> {
        this.mode = mode;
        this.editingEntityId = entity?.ENTITY_ID || null;
        this.submitted = false;
        this.selectedFile = null;
        this.filePreview = null;
        // Handle single attachment object
        this.existingAttachment = entity?.Attachment || null;
        this.existingImageUrl = null;
        this.isDragOver = false;
        this.uploadProgress = 0;
        this.fileValidationErrors = [];
        this.fileValidationSuccess = false;

        if (mode === 'add') {
            this.entityForm.reset({
                IsShowInPortal: false, IsDonation: false, Active: true, licenseNumber: '',
                licenseEndDate: null,
                foundationType: null,
            });
            this.selectedEntityObject = null;
        }

        if (this.existingAttachment?.imgPath) {
            // Improved image URL construction with validation
            const imageUrl = this.constructImageUrl(this.existingAttachment.imgPath);

            // Validate the image URL before setting it
            const isValid = await this.validateImageUrl(imageUrl);
            if (isValid) {
                this.existingImageUrl = imageUrl;
            } else {
                this.existingImageUrl = null;
            }
        }
    }

    private fetchAttachmentData(entityId: string): void {
        if (!entityId) return;

        // Use MasterId if available, otherwise fall back to entityId
        const masterId = this.selectedEntityObject?.MasterId || parseInt(entityId);

        // Try to fetch attachment data using the attachment service
        this.attachmentService
            .getListByMasterId(masterId, AttachmentsConfigType.Entity)
            .subscribe({
                next: async (attachments: AttachmentDto[]) => {
                    if (attachments && attachments.length > 0) {
                        this.existingAttachment = attachments[0];

                        if (this.existingAttachment?.imgPath) {
                            // Use force refresh to ensure we get the latest image
                            this.forceRefreshImage();
                        }
                    } else {
                        this.existingAttachment = null;
                        this.existingImageUrl = null;
                    }
                },
                error: (error) => {
                    // Handle error silently or add error handling as needed
                },
            });
    }

    private updateAttachmentSeparately(attachmentDto: AttachmentBase64Dto): void {
        if (!this.existingAttachment?.masterId) {
            this.spinnerService.hide();
            return;
        }

        const updateAttachmentDto: UpdateAttachmentBase64Dto = {
            id: this.existingAttachment.id,
            fileBase64: attachmentDto.fileBase64,
            fileName: attachmentDto.fileName,
            masterId: this.existingAttachment.masterId,
            attConfigID: attachmentDto.attConfigID,
        };

        this.attachmentService.updateAsync(updateAttachmentDto).subscribe({
            next: (response) => {
                this.toastr.success(this.translate.instant('FILE.IMAGE_UPDATED_SUCCESS'));
                this.refreshImageAfterUpdate();
                this.closeModal();
                this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take });
                this.spinnerService.hide();
            },
            error: (error) => {
                this.toastr.error(this.translate.instant('FILE.ERROR_UPDATING_IMAGE'));
                this.spinnerService.hide();
            },
        });
    }

    private createAttachmentSeparately(attachmentDto: AttachmentBase64Dto): void {
        // Ensure we have the correct masterId - this should already be set by the caller
        if (attachmentDto.masterId === 0 && this.mode === 'edit' && this.selectedEntityObject?.MasterId) {
            attachmentDto.masterId = this.selectedEntityObject.MasterId;
        }

        this.attachmentService.saveAttachmentFileBase64(attachmentDto).subscribe({
            next: (response) => {
                this.toastr.success(this.translate.instant('FILE.IMAGE_UPLOADED_SUCCESS'));
                this.refreshImageAfterUpdate();
                this.closeModal();
                this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take });
                this.spinnerService.hide();
            },
            error: (error) => {
                this.toastr.error(this.translate.instant('FILE.ERROR_UPLOADING_IMAGE'));
                this.spinnerService.hide();
            },
        });
    }

    /**
     * Manually refreshes the image display after updates
     */
    private refreshImageAfterUpdate(): void {
        if (this.editingEntityId) {
            // Clear current image
            this.existingImageUrl = null;

            // Use MasterId if available, otherwise fall back to editingEntityId
            const masterId = this.selectedEntityObject?.MasterId || parseInt(this.editingEntityId);

            // Fetch fresh attachment data
            this.attachmentService
                .getListByMasterId(masterId, AttachmentsConfigType.Entity)
                .subscribe({
                    next: (attachments: AttachmentDto[]) => {
                        if (attachments && attachments.length > 0) {
                            this.existingAttachment = attachments[0];
                            if (this.existingAttachment?.imgPath) {
                                // Force refresh with new timestamp
                                this.forceRefreshImage();
                            }
                        }
                    },
                    error: (error) => {
                        // Error refreshing image after update
                    },
                });
        }
    }

    /**
     * Forces a refresh of the image by clearing and rebuilding the URL
     */
    private forceRefreshImage(): void {
        if (this.existingAttachment?.imgPath) {
            // Clear the current URL first
            const oldUrl = this.existingImageUrl;
            this.existingImageUrl = null;

            // Clear browser cache for the old URL
            if (oldUrl) {
                this.clearImageCache(oldUrl);
            }

            // Force a small delay to ensure the DOM updates
            setTimeout(() => {
                const imageUrl = this.constructImageUrl(this.existingAttachment!.imgPath!);
                this.existingImageUrl = imageUrl;
            }, 200);
        }
    }

    /**
     * Clears browser cache for images by creating a new Image object
     */
    private clearImageCache(imageUrl: string): void {
        if ('caches' in window) {
            // Clear cache for the specific image URL
            caches.keys().then((cacheNames) => {
                cacheNames.forEach((cacheName) => {
                    caches.open(cacheName).then((cache) => {
                        cache.delete(imageUrl);
                    });
                });
            });
        }
    }

    /**
     * Validates if an image URL is accessible
     */
    private validateImageUrl(url: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (!url) {
                resolve(false);
                return;
            }

            const img = new Image();
            img.onload = () => {
                resolve(true);
            };
            img.onerror = () => {
                resolve(false);
            };
            img.src = url;
        });
    }

    // Modal management helper methods
    private showDeleteModal(): void {
        const modal = document.getElementById('deleteEntityModal');
        if (modal) {
            // Dispose existing instance if any
            if (this.deleteModalInstance) {
                this.deleteModalInstance.dispose();
            }

            this.deleteModalInstance = new (window as any).bootstrap.Modal(modal, {
                backdrop: 'static',
                keyboard: false
            });

            // Add proper event listeners for cleanup
            modal.addEventListener('hidden.bs.modal', () => {
                this.onDeleteModalHidden();
            });

            this.deleteModalInstance.show();
        }
    }

    private showDeleteAttachmentModal(): void {
        const modal = document.getElementById('deleteAttachmentModal');
        if (modal) {
            // Dispose existing instance if any
            if (this.deleteAttachmentModalInstance) {
                this.deleteAttachmentModalInstance.dispose();
            }

            this.deleteAttachmentModalInstance = new (window as any).bootstrap.Modal(modal, {
                backdrop: 'static',
                keyboard: false
            });

            // Add proper event listeners for cleanup
            modal.addEventListener('hidden.bs.modal', () => {
                this.onDeleteAttachmentModalHidden();
            });

            this.deleteAttachmentModalInstance.show();
        }
    }

    private onModalHidden(): void {
        // Clean up main modal
        if (this.mainModalInstance) {
            this.mainModalInstance.dispose();
            this.mainModalInstance = null;
        }

        // Clean up any remaining backdrops
        this.clearModalBackdrops();

        // Restore body scroll
        this.restoreBodyScroll();
    }

    private onDeleteModalHidden(): void {
        // Clean up delete modal
        if (this.deleteModalInstance) {
            this.deleteModalInstance.dispose();
            this.deleteModalInstance = null;
        }

        // Clean up any remaining backdrops
        this.clearModalBackdrops();

        // Restore body scroll
        this.restoreBodyScroll();
    }

    private onDeleteAttachmentModalHidden(): void {
        // Clean up delete attachment modal
        if (this.deleteAttachmentModalInstance) {
            this.deleteAttachmentModalInstance.dispose();
            this.deleteAttachmentModalInstance = null;
        }

        // Clean up any remaining backdrops
        this.clearModalBackdrops();

        // Restore body scroll
        this.restoreBodyScroll();
    }

    private disposeAllModals(): void {
        // Dispose main modal
        if (this.mainModalInstance) {
            this.mainModalInstance.dispose();
            this.mainModalInstance = null;
        }

        // Dispose delete modal
        if (this.deleteModalInstance) {
            this.deleteModalInstance.dispose();
            this.deleteModalInstance = null;
        }

        // Dispose delete attachment modal
        if (this.deleteAttachmentModalInstance) {
            this.deleteAttachmentModalInstance.dispose();
            this.deleteAttachmentModalInstance = null;
        }
    }

    private clearModalBackdrops(): void {
        // Remove any remaining modal backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach((backdrop) => {
            backdrop.remove();
        });

        // Also remove any fade backdrops
        const fadeBackdrops = document.querySelectorAll('.modal-backdrop.fade');
        fadeBackdrops.forEach((backdrop) => {
            backdrop.remove();
        });
    }

    private restoreBodyScroll(): void {
        // Remove modal-open class from body
        document.body.classList.remove('modal-open');

        // Remove any inline styles that might lock scrolling
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');

        // Ensure the html element is also not locked
        document.documentElement.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('padding-right');
    }
}
