import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { confirmPasswordValidator } from '../../../shared/customValidators/confirmPasswordValidator';
import { NgSelectModule } from '@ng-select/ng-select';
import { DepartmentService } from '../../../core/services/department.service';


@Component({
  selector: 'app-users-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule,NgSelectModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {

  users: any[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 2;
  pages: number[] = [];
  searchValue: string = '';
  userForm: FormGroup;
  submitted: boolean = false;
  countries: any[] = [];
  entities: any[] = [];
  roles: any[] = [];
  mode: 'add' | 'edit' = 'add';
  editingUserId: any | null = null;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  departments :any[]=[];
  userDepartmentForm: FormGroup;
  selectedUserIdForDepartments: any;



  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private fb: FormBuilder,
  ) {
this.userDepartmentForm = this.fb.group({
  departmentIds: [[], Validators.required]
});

    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      nameEn: ['', [Validators.required, Validators.minLength(1)]],
      telNumber: [null, [Validators.maxLength(50)]],
      address: [null, [Validators.maxLength(1000)]],
      gender: [false],
      cityId: [null, [Validators.maxLength(50)]],
      countryId: [null, [Validators.maxLength(50)]],
      entityIdInfo: [null, [Validators.maxLength(50)]],
      userName: ['', [Validators.required, Validators.minLength(1)]],
      password: [''],
      confirmPassword: [''],
      phoneNumber: [null, [Validators.maxLength(50)]],
      email: [null, [Validators.pattern(/^[^@]+@[^@]+$/)]],
      userType: [1, [Validators.required, Validators.min(1)]],
      foundationType: [null, [Validators.maxLength(100)]],
      foundationName: [null, [Validators.maxLength(100)]],
      licenseNumber: [null, [Validators.maxLength(100)]],
      licenseEndDate: [null],
      civilId: [null, [Validators.maxLength(20)]],
      fax: [null, [Validators.maxLength(50)]],
      boxNo: [null, [Validators.maxLength(50)]],
      entityId: [null, [Validators.maxLength(20)]],
      applyDate: [null],
      userStatus: [null],
      serviceType: [null],
      roles: [null],
      id: [null],
      masterId: [null],
    }, {
      validators: confirmPasswordValidator('password', 'confirmPassword')
    });

  }
  ngOnInit(): void {
    this.getUsers(1, '');
    this.getDepartments();
  }


  getUsers(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.itemsPerPage;
    this.spinnerService.show();
    this.userService.getUsers(skip, this.itemsPerPage, searchValue).subscribe({

      next: (data: any) => {
        this.users = data.data;
        this.totalCount = data.totalCount;
        this.calculatePages();
        this.spinnerService.hide();
      },
      error: (error) => {
        this.toastr.error(this.translate.instant('ERROR.FETCH_ROLES'), this.translate.instant('TOAST.TITLE.ERROR'));
        this.spinnerService.hide();
      }
    }
    );
  }

  calculatePages(): void {
    const totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }


  changePage(event: any): void {
    console.log(event);
    console.log(typeof event);


    if (event < 1) event = 1;
    if (event > this.pages.length) event = this.pages.length;

    this.currentPage = event;
    this.getUsers(event, this.searchValue);

  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.itemsPerPage = perPage;
      this.calculatePages();
      this.getUsers(1, this.searchValue);
    }
  }
  onSearch(): void {
    this.getUsers(1, this.searchValue);
  }

  clear() {
    this.searchValue = '';
    this.onSearch();
  }

  // submit(): void {
  //   this.submitted = true;

  //   if (this.userForm.invalid) {
  //     this.userForm.markAllAsTouched();
  //     console.log(this.userForm.value);
  //     this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
  //     return;
  //   }
  //   this.spinnerService.show();
  //   const formData = this.userForm.value;

  //   this.userService.createUser(formData).subscribe({
  //     next: (res) => {
  //       console.log('User created successfully', res);
  //       this.toastr.success(this.translate.instant('TOAST.USER_CREATED'));
  //       this.userForm.reset();
  //       this.submitted = false;
  //       const closeBtn = document.querySelector('.users.btn-close') as HTMLElement;
  //       closeBtn?.click();
  //       this.getUsers(1, this.searchValue);
  //     },
  //     error: (err) => {
  //       console.error('Error creating user', err);
  //     },
  //     complete: () => {
  //       this.spinnerService.hide();
  //     }
  //   });

  // }
  submit(): void {
    this.submitted = true;

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return;
    }

    const formData = this.userForm.value;
    if (this.mode === 'edit') {
      delete formData.password;
      delete formData.confirmPassword;

    } else {
      delete formData.id;
      delete formData.masterId;

    }
    this.spinnerService.show();

    if (this.mode === 'add') {
      this.userService.createUser(formData).subscribe({
        next: (res) => {
          this.toastr.success(this.translate.instant('TOAST.USER_CREATED'));
          this.getUsers(1, this.searchValue);
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error('Failed to create user');
          this.spinnerService.hide()
        },
        complete: () => this.spinnerService.hide()
      });
    } else {
      this.userService.updateUser(formData).subscribe({
        next: (res) => {
          this.toastr.success(this.translate.instant('TOAST.USER_UPDATED'));
          this.getUsers(this.currentPage, this.searchValue);
          this.closeModal();
        },
        error: (err) => {
          this.spinnerService.hide();
          this.toastr.error('Failed to update user');
        },
        complete: () => this.spinnerService.hide()
      });
    }
  }

  // start edit user
  openAddModal(): void {
    this.mode = 'add';
    this.submitted = false;
    this.userForm.reset({
      gender: false,
      userType: 1,
      roles: []
    });
    this.togglePasswordFields(true);
  }

  openEditModal(user: any): void {
    this.mode = 'edit';
    this.editingUserId = user.id;
    this.submitted = false;
    this.userForm.patchValue({
      ...user,
      roles: user.roles?.map((r: any) => r.id) || [],
      gender: user.gender ?? false,
      id: user.id ?? null,
      masterId: user?.masterId ?? null
    });
    this.togglePasswordFields(false);
  };

  closeModal(): void {
    this.userForm.reset();
    this.submitted = false;
    const closeBtn = document.querySelector('#Users .btn-close') as HTMLElement;
    closeBtn?.click();
  }

  private togglePasswordFields(valid: boolean): void {
    const password = this.userForm.get('password');
    const confirmPassword = this.userForm.get('confirmPassword');

    if (valid) {
      password?.setValidators([Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/)]);
      confirmPassword?.setValidators([Validators.required]);
    } else {
      password?.clearValidators();
      confirmPassword?.clearValidators();
    }

    password?.updateValueAndValidity();
    confirmPassword?.updateValueAndValidity();
  }

  showPasswordMatch(): boolean {
    const pass = this.userForm.get('password')?.value;
    const confirm = this.userForm.get('confirmPassword')?.value;

    return pass && confirm && pass === confirm && !this.userForm.get('confirmPassword')?.errors?.['mismatch'];
  }

toggleDropdown(event: MouseEvent, select: any): void {
  event.preventDefault();

  setTimeout(() => {
    if (select.isOpen) {
      select.close();
    } else {
      select.open();
    }
  }, 100);
}
// assign department to user
getDepartments(){
  this.departmentService.getDepartments(0,600).subscribe({
    next: (res)=>{
      console.log(res);
      this.departments = res?.results
    },
    error: (err)=>{
      console.log(err);
      
    }
  })
}
openAssignDepartmentsModal(user: any): void {
  this.selectedUserIdForDepartments = user.id;

  if (!this.departments?.length) this.getDepartments();
  this.getUserDepartments(user.id);

  this.userDepartmentForm.reset({
    departments: user.departments?.map((d: any) => d.id) || []
  });
}

assignDepartments(): void {
  if (this.userDepartmentForm.invalid || !this.selectedUserIdForDepartments) {
    this.toastr.error('Please select at least one department');
    return;
  }
  console.log(this.userDepartmentForm.value);
  
  const payload = {
    userId: this.selectedUserIdForDepartments,
    departmentIds: this.userDepartmentForm.value.departmentIds
  };

  this.spinnerService.show();

  this.userService.assignDepartments(payload).subscribe({
    next: () => {
      this.toastr.success(this.translate.instant('TOAST.DEPARTMENTS_ASSIGNED'));
      this.spinnerService.hide();
      const closeBtn = document.querySelector('.closeDepartment.btn-close') as HTMLElement;
      console.log(closeBtn);
      
    closeBtn?.click();
      this.getUsers(this.currentPage); // refresh table
    },
    error: () => {
      this.toastr.error(this.translate.instant('TOAST.DEPARTMENTS_ASSIGN_FAILED'));
      this.spinnerService.hide();
    }
  });
}

getUserDepartments(userId: string): void {
  this.userService.getUserDepartments({ userId }).subscribe({
    next: (res:any) => {
      const selected = res?.data?.map((d: any) => d.departmentId.toString()) || [];
      this.userDepartmentForm.patchValue({ departmentIds: selected });
    },
    error: (err) => {
      console.error('Failed to load user departments', err);
    }
  });
}



}
