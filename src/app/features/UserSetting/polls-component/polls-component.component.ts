import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ColDef } from 'ag-grid-community';
import { NgSelectModule } from '@ng-select/ng-select';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { PollService } from '../../../core/services/UserSetting/poll.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import {
  PollDto,
  CreatePollDto,
  UpdatePollDto,
  GetAllPollRequestDto,
  PagedResultDto,
} from '../../../core/dtos/polls/poll.dto';

@Component({
  selector: 'app-polls-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
    GenericDataTableComponent,
  ],
  templateUrl: './polls-component.component.html',
  styleUrl: './polls-component.component.scss',
})
export class PollsComponentComponent implements OnInit {
  polls: PollDto[] = [];
  totalCount: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  searchValue: string = '';
  pollForm: FormGroup;
  submitted: boolean = false;
  mode: 'add' | 'edit' | 'view' = 'add';
  editingPollId: number | null = null;
  selectedPollToDelete: PollDto | null = null;
  isLoading: boolean = false;

  // Filter properties
  selectedStatusFilter: boolean | null = null;

  // Enhanced dropdown properties for pagination
  statusOptions: any[] = [];

  // AG Grid column definitions
  columnDefs: ColDef[] = [];

  rowActions: any[] = [];

  constructor(
    private pollService: PollService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.pollForm = this.fb.group({
      titleAr: ['', [Validators.required, Validators.minLength(2)]],
      titleEn: ['', [Validators.minLength(2)]],
      descriptionAr: ['', [Validators.required, Validators.minLength(2)]],
      descriptionEn: ['', [Validators.minLength(2)]],
      link: ['', [Validators.required, Validators.pattern('https?://.+')]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.initializeColumnDefinitions();
    this.initializeRowActions();
    this.initializeStatusOptions();
    this.loadPolls();
    
    // Listen for language changes
    this.translate.onLangChange.subscribe(() => {
      this.initializeColumnDefinitions();
      this.initializeRowActions();
      this.initializeStatusOptions();
    });
  }

  initializeColumnDefinitions(): void {
    this.columnDefs = [
      {
        headerName: '#',
        width: 80,
        sortable: false,
        valueGetter: (params: any) => {
          return this.currentPage * this.pageSize + params.node.rowIndex + 1;
        },
      },
      {
        field: 'titleAr',
        headerName: this.translate.instant('POLLS.ARABIC_TITLE'),
        sortable: true,
        filter: true,
      },
      {
        field: 'titleEn',
        headerName: this.translate.instant('POLLS.ENGLISH_TITLE'),
        sortable: true,
        filter: true,
      },
      {
        field: 'descriptionAr',
        headerName: this.translate.instant('POLLS.ARABIC_DESCRIPTION'),
        sortable: true,
        filter: true,
      },
      {
        field: 'descriptionEn',
        headerName: this.translate.instant('POLLS.ENGLISH_DESCRIPTION'),
        sortable: true,
        filter: true,
      },
      {
        field: 'link',
        headerName: this.translate.instant('POLLS.LINK'),
        width: 150,
        sortable: true,
        cellRenderer: (params: any) => {
          if (params.value) {
            return `<a href="${params.value}" target="_blank" style="color: #8D734D !important; text-decoration: none; font-weight: 500;" onmouseover="this.style.color='#a7895d'; this.style.textDecoration='underline';" onmouseout="this.style.color='#8D734D'; this.style.textDecoration='none';">${this.translate.instant('POLLS.VIEW_LINK')}</a>`;
          }
          return '';
        },
      },
      {
        field: 'isActive',
        headerName: this.translate.instant('POLLS.STATUS'),
        width: 100,
        sortable: true,
        cellRenderer: (params: any) => {
          return params.value
            ? `<span class="badge status-approved">${this.translate.instant('POLLS.ACTIVE')}</span>`
            : `<span class="badge status-rejected">${this.translate.instant('POLLS.INACTIVE')}</span>`;
        },
      },
    ];
  }

  initializeRowActions(): void {
    this.rowActions = [
      { label: this.translate.instant('COMMON.VIEW'), action: 'view', icon: 'icon-frame-view' },
      { label: this.translate.instant('COMMON.EDIT'), action: 'edit', icon: 'icon-frame-edit' },
      { label: this.translate.instant('COMMON.DELETE'), action: 'delete', icon: 'icon-frame-delete' },
    ];
  }

  initializeStatusOptions(): void {
    this.statusOptions = [
      { value: null, label: this.translate.instant('COMMON.ALL'), icon: 'fas fa-list' },
      { value: true, label: this.translate.instant('POLLS.ACTIVE'), icon: 'fas fa-check-circle' },
      { value: false, label: this.translate.instant('POLLS.INACTIVE'), icon: 'fas fa-times-circle' },
    ];
  }

  loadPolls(): void {
    this.isLoading = true;
    this.spinnerService.show();

    const parameters: GetAllPollRequestDto = {
      skip: this.currentPage * this.pageSize,
      take: this.pageSize,
      searchValue: this.searchValue,
      isActive:
        this.selectedStatusFilter !== null
          ? this.selectedStatusFilter
          : undefined,
    };

    this.pollService.getAllAsync(parameters).subscribe({
      next: (data: any) => {
        // Handle different response formats
        let allData: PollDto[] = [];
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

        // Update component properties
        this.polls = allData;
        this.totalCount = totalCount;
        this.isLoading = false;
        this.spinnerService.hide();
      },
      error: (error) => {
        this.toastr.error(
          this.translate.instant('ERROR.FETCH_POLLS') ||
            'Error loading polls',
          this.translate.instant('TOAST.TITLE.ERROR') || 'Error'
        );
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.currentPage = event.pageNumber - 1;
    this.pageSize = event.pageSize;
    this.loadPolls();
  }

  onSearch(searchText?: string): void {
    if (searchText !== undefined) {
      this.searchValue = searchText;
    }
    this.currentPage = 0;
    this.loadPolls();
  }

  clear(): void {
    this.searchValue = '';
    this.selectedStatusFilter = null;
    this.currentPage = 0;
    this.loadPolls();
  }

  onActionClick(event: { action: string; row: any }): void {
    const poll = event.row as PollDto;

    switch (event.action) {
      case 'view':
        this.openViewModal(poll);
        break;
      case 'edit':
        this.openEditModal(poll);
        break;
      case 'delete':
        this.selectPollToDelete(poll);
        break;
    }
  }

  openAddModal(): void {
    this.mode = 'add';
    this.pollForm.reset({ isActive: true });
    this.submitted = false;
    this.editingPollId = null;
  }

  openEditModal(poll: PollDto): void {
    this.mode = 'edit';
    this.editingPollId = poll.id;
    this.pollForm.patchValue({
      titleAr: poll.titleAr,
      titleEn: poll.titleEn,
      descriptionAr: poll.descriptionAr,
      descriptionEn: poll.descriptionEn,
      link: poll.link,
      isActive: poll.isActive,
    });
    this.submitted = false;
    this.pollForm.enable();

    // Trigger the modal
    const modal = document.getElementById('pollModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  openViewModal(poll: PollDto): void {
    this.mode = 'view';
    this.editingPollId = poll.id;
    this.pollForm.patchValue({
      titleAr: poll.titleAr,
      titleEn: poll.titleEn,
      descriptionAr: poll.descriptionAr,
      descriptionEn: poll.descriptionEn,
      link: poll.link,
      isActive: poll.isActive,
    });
    this.pollForm.disable();

    // Trigger the modal
    const modal = document.getElementById('pollModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  closeModal(): void {
    this.mode = 'add';
    this.pollForm.reset({ isActive: true });
    this.pollForm.enable();
    this.submitted = false;
    this.editingPollId = null;
    this.selectedPollToDelete = null;
  }

  submit(): void {
    this.submitted = true;

    if (this.pollForm.invalid) {
      this.pollForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return;
    }

    this.spinnerService.show();

    if (this.mode === 'add') {
      const createDto: CreatePollDto = this.pollForm.value;
      this.pollService.createAsync(createDto).subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('TOAST.POLL_CREATED') ||
              'Poll created successfully'
          );
          this.closeModal();
          this.loadPolls();
          this.spinnerService.hide();
        },
        error: (error) => {
          this.toastr.error(
            this.translate.instant('TOAST.POLL_CREATE_FAILED') ||
              'Error creating poll'
          );
          this.spinnerService.hide();
        },
      });
    } else if (this.mode === 'edit' && this.editingPollId) {
      const updateDto: UpdatePollDto = {
        id: this.editingPollId,
        ...this.pollForm.value,
      };
      this.pollService.updateAsync(updateDto).subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('TOAST.POLL_UPDATED') ||
              'Poll updated successfully'
          );
          this.closeModal();
          this.loadPolls();
          this.spinnerService.hide();
        },
        error: (error) => {
          this.toastr.error(
            this.translate.instant('TOAST.POLL_UPDATE_FAILED') ||
              'Error updating poll'
          );
          this.spinnerService.hide();
        },
      });
    }
  }

  selectPollToDelete(poll: PollDto): void {
    this.selectedPollToDelete = poll;
    // Trigger the delete modal
    const deleteModal = document.getElementById('deletePollModal');
    if (deleteModal) {
      const modal = new (window as any).bootstrap.Modal(deleteModal);
      modal.show();
    }
  }

  deletePoll(): void {
    if (!this.selectedPollToDelete) return;

    this.spinnerService.show();
    this.pollService.deleteAsync(this.selectedPollToDelete.id).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('TOAST.POLL_DELETED') ||
            'Poll deleted successfully'
        );
        this.closeModal();
        this.loadPolls();
        this.spinnerService.hide();
      },
      error: (error) => {
        this.toastr.error(
          this.translate.instant('TOAST.POLL_DELETE_FAILED') ||
            'Error deleting poll'
        );
        this.spinnerService.hide();
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pollForm.get(fieldName);
    return field
      ? field.invalid && (field.dirty || field.touched || this.submitted)
      : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.pollForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength'])
        return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      if (field.errors['pattern'])
        return 'Please enter a valid URL (starting with http:// or https://)';
    }
    return '';
  }

  // Enhanced validation methods
  hasFormErrors(): boolean {
    return this.pollForm.invalid && this.submitted;
  }

  getTotalErrors(): number {
    let errorCount = 0;
    Object.keys(this.pollForm.controls).forEach((key) => {
      const control = this.pollForm.get(key);
      if (control && control.errors) {
        errorCount++;
      }
    });
    return errorCount;
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.pollForm.get(fieldName);
    return field ? field.valid && field.touched && !field.pristine : false;
  }

  onFieldBlur(fieldName: string): void {
    const field = this.pollForm.get(fieldName);
    if (field) {
      field.markAsTouched();
    }
  }
}
