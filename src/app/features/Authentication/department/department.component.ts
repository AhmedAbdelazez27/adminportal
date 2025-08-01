import { Data } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-department',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
  ],
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss',
})
export class DepartmentComponent implements OnInit {
  departments: DepartmentDto[] = [];
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

  // Table configuration
  headers: string[] = [
    '#',
    'Arabic Name',
    'English Name',
    'Status',
    'Last Modified',
    'Actions',
  ];
  headerKeys: string[] = [
    'serial',
    'aname',
    'ename',
    'isActive',
    'last_Modify',
    'actions',
  ];
  showAction: boolean = true;
  actionTypes: string[] = ['view', 'edit', 'delete'];

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
    this.getDepartments(1);
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
        console.log('Department API Response:', data);

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

    this.getDepartments(page, this.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage) && perPage > 0) {
      this.itemsPerPage = perPage;
      this.currentPage = 1; // Reset to first page
      this.getDepartments(1, this.searchValue);
    }
  }

  onSearch(): void {
    this.getDepartments(1, this.searchValue);
  }

  clear(): void {
    this.searchValue = '';
    this.isActiveFilter = undefined;
    this.getDepartments(1, '');
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
          this.getDepartments(this.currentPage, this.searchValue);
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
          this.getDepartments(this.currentPage, this.searchValue);
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
            this.getDepartments(this.currentPage, this.searchValue);
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
  }

  onEdit(department: DepartmentDto): void {
    this.openEditModal(department);
  }

  onDelete(department: DepartmentDto): void {
    this.selectDepartmentToDelete(department);
  }

  onViewUsersInDepartment(department: DepartmentDto): void {
    this.selectedDepartment = department;
    this.loadUsersInDepartment(department.dept_ID);
  }

  loadUsersInDepartment(departmentId: number): void {
    this.isLoadingUsers = true;
    this.usersInDepartment = [];

    this.userDepartmentService.getUsersByDepartment(departmentId).subscribe({
      next: (response) => {
        console.log(
          'Users in Department API Response: check mohamed ',
          response
        );
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

        console.log(
          'Users in Department API Response: check mohamed ',
          this.usersInDepartment
        );
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
}
