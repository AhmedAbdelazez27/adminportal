import { Data } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DepartmentService } from '../../../core/services/department.service';
import { UserDepartmentService } from '../../../core/services/Authentication/Department/user-department.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { environment } from '../../../../environments/environment';
import {
  DepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentParameter,
  PagedResultDto,
} from '../../../core/dtos/Authentication/Department/department.dto';
import { UserDepartmentDto } from '../../../core/dtos/Authentication/Department/user-department.dto';
import { ColDef, GridOptions } from 'ag-grid-community';
import { PagedDto, Pagination } from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { Subject } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-department',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
    GenericDataTableComponent
  ],
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss',
})
export class DepartmentComponent implements OnInit {
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;
  departments: DepartmentDto[] = [];
  loadgridData: DepartmentDto[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pages: number[] = [];
  searchValue: string = '';
  departmentForm: FormGroup;
  submitted: boolean = false;
  mode: 'add' | 'edit' | 'view' = 'add';
  editingDepartmentId: number | null = null;
  selectedDepartmentToDelete: number | null = null;
  isActiveFilter: boolean | undefined = undefined;
  isLoading: boolean = false;
  Math = Math; // Make Math available in template

  // Users in Department properties
  usersInDepartment: UserDepartmentDto[] = [];
  selectedDepartment: DepartmentDto | null = null;
  isLoadingUsers: boolean = false;

  // Status options for ng-select
  statusOptions: any[] = [
    { id: undefined, text: 'All' },
    { id: true, text: 'Active' },
    { id: false, text: 'Inactive' }
  ];

  // Table configuration
  headers: string[] = [
    '#',
    'Arabic Name',
    'English Name',
    'Status',
    'Actions',
  ];
  headerKeys: string[] = [
    'serial',
    'aname',
    'ename',
    'isActive',
    'actions',
  ];
  showAction: boolean = true;
  actionTypes: string[] = ['view', 'edit', 'delete'];

  searchParams = new PagedDto();
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();

  columnDefs: ColDef[] = [];
  columnDefslineData: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];


  constructor(
    private departmentService: DepartmentService,
    private userDepartmentService: UserDepartmentService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.departmentForm = this.fb.group({
      aname: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ],
      ],
      ename: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ],
      ],
      isActive: [true],
      dept_ID: [null],
    });
  }

  ngOnInit(): void {
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });

        this.buildColumnDefs();
        this.rowActions = [
            { label: this.translate.instant('Common.ViewInfo'), icon: 'icon-frame-view', action: 'onViewInfo' },
            { label: this.translate.instant('Common.edit'), icon: 'icon-frame-edit', action: 'onEditInfo' },
            { label: this.translate.instant('Common.userdept'), icon: 'icon-frame-user', action: 'onUsersInfo' },
            { label: this.translate.instant('Common.deletd'), icon: 'icon-frame-delete', action: 'onDeletdInfo' },
        ];
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

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    this.searchParams.isActive = this.isActiveFilter;
    this.searchParams.searchValue = this.searchValue;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    cleanedFilters.searchValue = cleanedFilters.searchValue != null ? cleanedFilters.searchValue : '';

    this.spinnerService.show();
    this.departmentService.getAllDepartments(cleanedFilters).subscribe(
      (data: any) => {
        this.loadgridData = data.data;
        this.pagination.totalCount = data.totalCount;
        this.spinnerService.hide();
      },
      (error) => {
        this.toastr.error();
        this.spinnerService.hide();
      }
    );
  }

  getDepartments(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.itemsPerPage;
    this.isLoading = true;
    this.spinnerService.show();

    const parameters: DepartmentParameter = {
      skip: skip,
      take: this.itemsPerPage,
      searchValue: searchValue,
      isActive: this.isActiveFilter,
    };

    this.departmentService.getAllDepartments(parameters).subscribe({
      next: (data: any) => {
        // Handle different response formats
        let allData: DepartmentDto[] = [];
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
        this.departments = allData;
        this.totalCount = totalCount;
        this.currentPage = page;

        this.calculatePages();
        this.isLoading = false;
        this.spinnerService.hide();
      },
      error: (error) => {
        console.error('Error fetching departments:', error);
        this.toastr.error(
          this.translate.instant('ERROR.FETCH_DEPARTMENTS'),
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
      this.itemsPerPage = perPage;
      this.currentPage = 1; // Reset to first page
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
  submit(): void {
    this.submitted = true;

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return;
    }

    const formData = this.departmentForm.value;
    this.spinnerService.show();

    if (this.mode === 'add') {
      const createData: CreateDepartmentDto = {
        aname: formData.aname,
        ename: formData.ename,
        isActive: formData.isActive,
      };

      this.departmentService.createDepartment(createData).subscribe({
        next: (res) => {
          this.toastr.success(
            this.translate.instant('TOAST.DEPARTMENT_CREATED')
          );
          this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take });
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error('Failed to create department');
          this.spinnerService.hide();
        },
        complete: () => this.spinnerService.hide(),
      });
    } else if (this.mode === 'edit') {
      const updateData: UpdateDepartmentDto = {
        dept_ID: formData.dept_ID,
        aname: formData.aname,
        ename: formData.ename,
        isActive: formData.isActive,
      };

      this.departmentService.updateDepartment(updateData).subscribe({
        next: (res) => {
          this.toastr.success(
            this.translate.instant('TOAST.DEPARTMENT_UPDATED')
          );
          this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take });
          this.closeModal();
        },
        error: (err) => {
          this.spinnerService.hide();
          this.toastr.error('Failed to update department');
        },
        complete: () => this.spinnerService.hide(),
      });
    }
  }

  // Modal operations
  openAddModal(): void {
    this.mode = 'add';
    this.submitted = false;
    // Ensure form is enabled for adding
    this.departmentForm.enable();
    this.departmentForm.reset({
      isActive: true,
    });
  }

  openEditModal(department: DepartmentDto): void {
    this.mode = 'edit';
    this.editingDepartmentId = department.dept_ID;
    this.submitted = false;
    // Ensure form is enabled for editing
    this.departmentForm.enable();
    this.departmentForm.patchValue({
      dept_ID: department.dept_ID,
      aname: department.aname,
      ename: department.ename,
      isActive: department.isActive,
    });
  }

  openViewModal(department: DepartmentDto): void {
    this.mode = 'view';
    this.submitted = false;
    this.departmentForm.patchValue({
      dept_ID: department.dept_ID,
      aname: department.aname,
      ename: department.ename,
      isActive: department.isActive,
    });
    this.departmentForm.disable();
  }

  closeModal(): void {
    this.departmentForm.reset();
    this.departmentForm.enable();
    this.submitted = false;
    const closeBtn = document.querySelector(
      '#Department .btn-close'
    ) as HTMLElement;
    closeBtn?.click();
  }

  // Delete operations
  selectDepartmentToDelete(department: DepartmentDto): void {
    this.selectedDepartmentToDelete = department.dept_ID;
  }

  deleteDepartment(): void {
    if (this.selectedDepartmentToDelete) {
      this.spinnerService.show();
      this.departmentService
        .deleteDepartment(this.selectedDepartmentToDelete)
        .subscribe({
          next: (response) => {
            this.selectedDepartmentToDelete = null;
            this.spinnerService.hide();
            this.toastr.success(
              this.translate.instant('TOAST.DEPARTMENT_DELETED')
            );
            const closeBtn = document.querySelector(
              '.btn-delete.btn-close'
            ) as HTMLElement;
            closeBtn?.click();
            this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take });
          },
          error: (error) => {
            this.spinnerService.hide();
            this.toastr.error('Failed to delete department');
            console.error('Error deleting department:', error);
          },
        });
    }
  }

  // Table event handlers
  onViewDetails(department: DepartmentDto): void {
    this.openViewModal(department);
    const modalElement = document.getElementById('Department');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    };
  }

  onEdit(department: DepartmentDto): void {
    this.openEditModal(department);
    const modalElement = document.getElementById('Department');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    };
  }

  onDelete(department: DepartmentDto): void {
    this.selectDepartmentToDelete(department);
    const modalElement = document.getElementById('deleteDepartmentModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    };
  }

  onViewUsersInDepartment(department: DepartmentDto): void {
    this.selectedDepartment = department;
    this.loadUsersInDepartment(department.dept_ID);
    const modalElement = document.getElementById('usersInDepartmentModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    };
  }

  loadUsersInDepartment(departmentId: number): void {
    this.isLoadingUsers = true;
    this.usersInDepartment = [];

    this.userDepartmentService.getUsersByDepartment(departmentId).subscribe({
      next: (response) => {
        // Handle different response formats
        const responseAny = response as any;
        if (responseAny && responseAny.data) {
          // API response with data property
          this.usersInDepartment = responseAny.data;
        } else if (responseAny && responseAny.items) {
          // Standard PagedResultDto format
          this.usersInDepartment = responseAny.items;
        } else {
          // Fallback to empty array
          this.usersInDepartment = [];
        }

        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users in department:', error);
        this.toastr.error('Failed to load users in department');
        this.isLoadingUsers = false;
      },
    });
  }

  // Helper methods
  getSerialNumber(index: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + index + 1;
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return '-';
    }
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
      { headerName: this.translate.instant('AuthenticationResorceName.nameAr'), field: 'aname', width: 200 },
      { headerName: this.translate.instant('AuthenticationResorceName.nameEn'), field: 'ename', width: 200 },
      {
        field: 'isActive',
        headerName: this.translate.instant('AuthenticationResorceName.status'),
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params: any) => {
          const isActive = params.value;
          return `<span class="badge ${isActive ? 'status-approved' : 'status-rejected'
            }">${isActive ? this.translate.instant('AuthenticationResorceName.ACTIVE') : this.translate.instant('AuthenticationResorceName.INACTIVE') }</span>`;
        },
      },
    ];
  }

  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      this.onViewDetails(event.row);
    }

    if (event.action === 'onEditInfo') {
      this.onEdit(event.row);
    }

    if (event.action === 'onUsersInfo') {
      this.onViewUsersInDepartment(event.row);
    }

    if (event.action === 'onDeletdInfo') {
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
}
