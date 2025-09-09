import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContactInformationService } from '../../../core/services/UserSetting/contact-information.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ContactInformationDto,
  UpdateContactInformationDto,
  GetAllContactInformationParameters,
  PagedResultDto,
} from '../../../core/dtos/UserSetting/contact-information.dto';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-contact-information',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    GenericDataTableComponent,
  ],
  templateUrl: './contact-information.component.html',
  styleUrl: './contact-information.component.scss',
})
export class ContactInformationComponent implements OnInit, OnDestroy {
  // Data
  allContactInformations: ContactInformationDto[] = []; // store full dataset
  contactInformations: ContactInformationDto[] = [];    // filtered dataset for grid
  totalCount: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  // Form
  contactInformationForm: FormGroup;
  submitted: boolean = false;
  mode: 'edit' | 'view' = 'view';
  editingContactInformationId: number | null = null;
  selectedContactInformationToDelete: ContactInformationDto | null = null;
  isLoading: boolean = false;

  // Modals
  private contactInformationModal: any = null;
  private deleteModal: any = null;

  // Table
  columnDefs: ColDef[] = [];
  rowActions: Array<{ label: string; icon?: string; action: string }> = [];
  columnHeaderMap: { [key: string]: string } = {};

  constructor(
    private contactInformationService: ContactInformationService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.contactInformationForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required]],
      title: [''],
      message: [''],
    });
  }

  ngOnInit(): void {
    this.initializeModals();
    this.initializeTableConfiguration();
    this.getContactInformations(1);
  }

  ngOnDestroy(): void {
    this.cleanupModals();
  }

  initializeModals(): void {
    this.contactInformationModal = new (window as any).bootstrap.Modal(
      document.getElementById('ContactInformation')
    );
    this.deleteModal = new (window as any).bootstrap.Modal(
      document.getElementById('DeleteContactInformation')
    );

    document
      .getElementById('ContactInformation')
      ?.addEventListener('hidden.bs.modal', () => this.onModalHidden());
  }

  cleanupModals(): void {
    if (this.contactInformationModal) this.contactInformationModal.dispose();
    if (this.deleteModal) this.deleteModal.dispose();
  }

  onModalHidden(): void {
    this.resetForm();
    this.mode = 'view';
    this.editingContactInformationId = null;
    this.submitted = false;
  }

  // ------------------- FORM HELPERS -------------------
  getFieldError(fieldName: string): string {
    const field = this.contactInformationForm.get(fieldName);
    if (field && field.errors && this.submitted) {
      if (field.errors['required']) {
        return this.translate.instant('VALIDATION.REQUIRED');
      }
      if (field.errors['email']) {
        return this.translate.instant('VALIDATION.INVALID_EMAIL');
      }
    }
    return '';
  }

  onFieldBlur(fieldName: string): void {
    this.contactInformationForm.get(fieldName)?.markAsTouched();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactInformationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.contactInformationForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  areMandatoryFieldsValid(): boolean {
    const mandatoryFields = ['name', 'email', 'mobileNumber'];
    return mandatoryFields.every((field) => {
      const control = this.contactInformationForm.get(field);
      return control && control.valid;
    });
  }

  getContactInformations(page: number): void {
    this.spinnerService.show();
    this.isLoading = true;

    const params: GetAllContactInformationParameters = {
      name: null, // Removed filter functionality
      email: null, // Removed filter functionality
      mobileNumber: null, // Removed filter functionality
      title: null, // Removed filter functionality
      skip: (page - 1) * this.itemsPerPage,
      take: this.itemsPerPage,
      orderByValue: null, // Removed filter functionality
    };

    this.contactInformationService.getAllContactInformation(params).subscribe({
      next: (response: PagedResultDto<ContactInformationDto>) => {
        this.allContactInformations = response.data;   // keep all
        this.contactInformations = [...this.allContactInformations]; // bind copy
        this.totalCount = response.totalCount;
        this.currentPage = page;
        this.spinnerService.hide();
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('COMMON.ERROR_OCCURRED'),
          this.translate.instant('COMMON.ERROR')
        );
        this.spinnerService.hide();
        this.isLoading = false;
      },
    });
  }

  refreshContactInformationData(): void {
    this.getContactInformations(this.currentPage);
  }

  // ------------------- SEARCH (FRONTEND) -------------------
onTableSearch(searchText: string): void {
  if (!searchText) {
    this.contactInformations = [...this.allContactInformations];
    return;
  }

  const terms = searchText.toLowerCase().split(' ').filter(t => t.trim() !== '');

  this.contactInformations = this.allContactInformations.filter(item =>
    terms.every(term =>
      (item.name?.toLowerCase().includes(term) ||
       item.email?.toLowerCase().includes(term) ||
       item.title?.toLowerCase().includes(term) ||
       item.message?.toLowerCase().includes(term))
    )
  );
}

  // ------------------- CRUD -------------------
  submit(): void {
    this.submitted = true;
    if (this.contactInformationForm.invalid) return;

    this.spinnerService.show();

    if (this.mode === 'edit' && this.editingContactInformationId) {
      const updateDto: UpdateContactInformationDto = {
        id: this.editingContactInformationId,
        name: this.contactInformationForm.value.name,
        email: this.contactInformationForm.value.email,
        mobileNumber: this.contactInformationForm.value.mobileNumber,
        title: this.contactInformationForm.value.title || null,
        message: this.contactInformationForm.value.message || null,
      };

      this.contactInformationService.updateContactInformation(updateDto).subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('CONTACT_INFORMATION.UPDATE_SUCCESS'),
            this.translate.instant('COMMON.SUCCESS')
          );
          this.closeModal();
          this.getContactInformations(this.currentPage);
          this.spinnerService.hide();
        },
        error: () => {
          this.toastr.error(
            this.translate.instant('COMMON.ERROR_OCCURRED'),
            this.translate.instant('COMMON.ERROR')
          );
          this.spinnerService.hide();
        },
      });
    }
  }

  openEditModal(contactInformation: ContactInformationDto): void {
    this.mode = 'edit';
    this.editingContactInformationId = contactInformation.id;
    this.setFormValues(contactInformation);
    this.submitted = false;
    this.contactInformationModal.show();
  }

  openViewModal(contactInformation: ContactInformationDto): void {
    this.mode = 'view';
    this.setFormValues(contactInformation);
    this.contactInformationForm.disable();
    this.contactInformationModal.show();
  }

  private setFormValues(contactInformation: ContactInformationDto): void {
    this.contactInformationForm.patchValue({
      name: contactInformation.name,
      email: contactInformation.email,
      mobileNumber: contactInformation.mobileNumber,
      title: contactInformation.title || '',
      message: contactInformation.message || '',
    });
  }

  closeModal(): void {
    this.contactInformationModal.hide();
  }

  selectContactInformationToDelete(contactInformation: ContactInformationDto): void {
    this.selectedContactInformationToDelete = contactInformation;
    this.deleteModal.show();
  }

  deleteContactInformation(): void {
    if (!this.selectedContactInformationToDelete) return;

    this.spinnerService.show();
    this.contactInformationService
      .deleteContactInformation(this.selectedContactInformationToDelete.id)
      .subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('CONTACT_INFORMATION.DELETE_SUCCESS'),
            this.translate.instant('COMMON.SUCCESS')
          );
          this.deleteModal.hide();
          this.getContactInformations(this.currentPage);
          this.spinnerService.hide();
        },
        error: () => {
          this.toastr.error(
            this.translate.instant('COMMON.ERROR_OCCURRED'),
            this.translate.instant('COMMON.ERROR')
          );
          this.spinnerService.hide();
        },
      });
  }

  cancelDelete(): void {
    this.deleteModal.hide();
    this.selectedContactInformationToDelete = null;
  }

  // ------------------- TABLE -------------------
  formatDate(date: Date | string | null): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString();
  }

  initializeTableConfiguration(): void {
    this.columnDefs = [
     {
        headerName: '#',
        field: 'index',
        width: 80,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          return (this.currentPage - 1) * this.itemsPerPage + params.node.rowIndex + 1;
        },
      },
      {
        headerName: this.translate.instant('CONTACT_INFORMATION.NAME'),
        field: 'name',
        flex: 1,
      },
      {
        headerName: this.translate.instant('CONTACT_INFORMATION.EMAIL'),
        field: 'email',
        flex: 1,
      },
      {
        headerName: this.translate.instant('CONTACT_INFORMATION.MOBILE_NUMBER'),
        field: 'mobileNumber',
        sortable: true,
        filter: true,
        flex: 1,
      },
      {
        headerName: this.translate.instant('CONTACT_INFORMATION.FIELD_TITLE'),
        field: 'title',
        flex: 1,
      },
      {
        headerName: this.translate.instant('CONTACT_INFORMATION.MESSAGE'),
        field: 'message',
        flex: 1,
      },
      {
        headerName: this.translate.instant('CONTACT_INFORMATION.CREATED_DATE'),
        field: 'creationDate',
        flex: 1,
        valueFormatter: (params: any) => this.formatDate(params.value),
      },
    ];

    this.rowActions = [
      { label: this.translate.instant('COMMON.VIEW'), icon: 'icon-frame-view', action: 'view' },
      { label: this.translate.instant('COMMON.DELETE'), icon: 'icon-frame-delete', action: 'delete' },
    ];

    this.columnHeaderMap = {
      name: this.translate.instant('CONTACT_INFORMATION.NAME'),
      email: this.translate.instant('CONTACT_INFORMATION.EMAIL'),
      mobileNumber: this.translate.instant('CONTACT_INFORMATION.MOBILE_NUMBER'),
      title: this.translate.instant('CONTACT_INFORMATION.FIELD_TITLE'),
      message: this.translate.instant('CONTACT_INFORMATION.MESSAGE'),
      creationDate: this.translate.instant('CONTACT_INFORMATION.CREATED_DATE'),
    };
  }

  onTableAction(event: { action: string; row: any }): void {
    const contactInformation = event.row as ContactInformationDto;
    switch (event.action) {
      case 'view': this.openViewModal(contactInformation); break;
      case 'delete': this.selectContactInformationToDelete(contactInformation); break;
    }
  }

onPageChange(event: { pageNumber: number; pageSize: number }): void {
  this.currentPage = event.pageNumber;
  this.itemsPerPage = event.pageSize;
  this.getContactInformations(this.currentPage);
}

  private resetForm(): void {
    this.contactInformationForm.reset();
    this.contactInformationForm.enable();
    this.submitted = false;
  }
}
