import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { confirmPasswordValidator } from '../../../shared/customValidators/confirmPasswordValidator';
import { NgSelectModule } from '@ng-select/ng-select';
import { DepartmentService } from '../../../core/services/department.service';
import { EntityService } from '../../../core/services/entit.service';
import { forkJoin, of, take } from 'rxjs';
import { EntityInfoService } from '../../../core/services/entitIfo.service';
import { FndLookUpValuesSelect2RequestDto } from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { Select2Service } from '../../../core/services/Select2.service';
import { FilterUserDto } from '../../../core/dtos/search-user.dto';

@Component({
  selector: 'app-users-list',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
    FormsModule,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent implements OnInit {
  users: any[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  pages: number[] = [];
  searchValue: string = '';
  userForm: FormGroup;
  submitted: boolean = false;
  countries: any[] = [];
  entities: any[] = [];
  entitiesInfo: any[] = [];
  roles: any[] = [];
  mode: 'add' | 'edit' = 'add';
  editingUserId: any | null = null;
  showPassword: boolean = false;
  showCPassword: boolean = false;
  departments: any[] = [];
  userDepartmentForm: FormGroup;
  userEntityForm: FormGroup;
  selectedUserIdForDepartments: any;
  userPermissions: any[] = [];
  permissionTypes: string[] = [
    'View',
    'Create',
    'Update',
    'Delete',
    'Approve',
    'Reject',
  ];
  availablePermissionActions: string[] = [
    'Create',
    'View',
    'Update',
    'Delete',
    'Post',
    'UnPost',
  ];
  originalPermissions: string[] = [];
  filterForm: FormGroup;

  moduleOptions: { label: string; value: string }[] = [];
  screenOptions: { module: string; label: string; value: string }[] = [];

  filteredScreens: { label: string; value: string }[] = [];
  filteredPermissions: any[] = [];
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  countrySelect2: any[] = [];
  filterUserCriteria = new FilterUserDto();
  userStatusOptions: any[] = [];
  userTypesOptions: any[] = [];
  userRoles: any[] = [];

  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private entityService: EntityService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private entityInfoService: EntityInfoService,
    private select2Service: Select2Service,
  ) {



    this.userDepartmentForm = this.fb.group({
      departmentIds: [[], Validators.required],
    });
    this.userEntityForm = this.fb.group({
      entityIds: [[], Validators.required],
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
      userStatus: ["2"],
      serviceType: [null],
      roles: [null],
      id: [null],
      masterId: [null],
    }, {
      validators: confirmPasswordValidator('password', 'confirmPassword')
    });

    this.filterForm = this.fb.group({
      selectedModules: [[]],
      selectedScreens: [[]],
    });
  }
  ngOnInit(): void {
    this.getUsers(1);
    this.getDepartments();
    this.getEntitys();
    this.getEntitysInfo();
    this.fetchcountrySelect2();
    this.fetchUsersStatusSelect2();
    this.fetchUsersTypesSelect2();

    // watch for changes in selectedModules to filter screens accordingly
    this.filterForm
      .get('selectedModules')
      ?.valueChanges.subscribe((modules) => {
        this.filteredScreens = this.screenOptions.filter((screen) =>
          modules.includes(screen.module)
        );

        // optional: clear selectedScreens if not in filtered list
        const selected = this.filterForm.get('selectedScreens')?.value || [];
        const allowed = this.filteredScreens.map((s) => s.value);
        const updated = selected.filter((s: string) => allowed.includes(s));
        this.filterForm.get('selectedScreens')?.setValue(updated);
      });
  }


  getUsers(page: number): void {
    const skip = (page - 1) * this.itemsPerPage;
    this.spinnerService.show();
    this.userService.getUsers({ ...this.filterUserCriteria, skip,take:this.itemsPerPage }).subscribe({

      next: (data: any) => {
        this.users = data.data;
        this.totalCount = data.totalCount;
        this.calculatePages();
        this.spinnerService.hide();
      },
      error: (error) => {
        this.toastr.error(
          this.translate.instant('ERROR.FETCH_ROLES'),
          this.translate.instant('TOAST.TITLE.ERROR')
        );
        this.spinnerService.hide();
      },
    });
  }

  calculatePages(): void {
    const totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(event: any): void {
    if (event < 1) event = 1;
    if (event > this.pages.length) event = this.pages.length;

    this.currentPage = event;
    this.getUsers(event);

  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.itemsPerPage = perPage;
      this.calculatePages();
      this.getUsers(1);
    }
  }
  onSearch(): void {
    this.getUsers(1);
  }

  clear() {
    this.filterUserCriteria = new FilterUserDto();
    this.onSearch();
  }

  // submit(): void {
  //   this.submitted = true;

  //   if (this.userForm.invalid) {
  //     this.userForm.markAllAsTouched();
  //     this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
  //     return;
  //   }
  //   this.spinnerService.show();
  //   const formData = this.userForm.value;

  //   this.userService.createUser(formData).subscribe({
  //     next: (res) => {
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
          this.getUsers(1);
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error('Failed to create user');
          this.spinnerService.hide();
        },
        complete: () => this.spinnerService.hide(),
      });
    } else {
      this.userService.updateUser(formData).subscribe({
        next: (res) => {
          this.toastr.success(this.translate.instant('TOAST.USER_UPDATED'));
          this.getUsers(this.currentPage);
          this.closeModal();
        },
        error: (err) => {
          this.spinnerService.hide();
          this.toastr.error('Failed to update user');
        },
        complete: () => this.spinnerService.hide(),
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
      roles: [],
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
      masterId: user?.masterId ?? null,
    });
    this.togglePasswordFields(false);
  }

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
      password?.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/),
      ]);
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

    return (
      pass &&
      confirm &&
      pass === confirm &&
      !this.userForm.get('confirmPassword')?.errors?.['mismatch']
    );
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
  getDepartments() {
    this.departmentService.getDepartments(0, 600).subscribe({
      next: (res) => {
        this.departments = res?.results;
      },
      error: (err) => {},
    });
  }
  openAssignDepartmentsModal(user: any): void {
    this.selectedUserIdForDepartments = user.id;

    if (!this.departments?.length) this.getDepartments();
    this.getUserDepartments(user.id);

    this.userDepartmentForm.reset({
      departments: user.departments?.map((d: any) => d.id) || [],
    });
  }

  assignDepartments(): void {
    if (this.userDepartmentForm.invalid || !this.selectedUserIdForDepartments) {
      this.toastr.error('Please select at least one department');
      return;
    }

    const payload = {
      userId: this.selectedUserIdForDepartments,
      departmentIds: this.userDepartmentForm.value?.departmentIds,
    };

    this.spinnerService.show();

    this.userService.assignDepartments(payload).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('TOAST.DEPARTMENTS_ASSIGNED')
        );
        this.spinnerService.hide();
        const closeBtn = document.querySelector(
          '.closeDepartment.btn-close'
        ) as HTMLElement;

        closeBtn?.click();
        this.getUsers(this.currentPage); // refresh table
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('TOAST.DEPARTMENTS_ASSIGN_FAILED')
        );
        this.spinnerService.hide();
      },
    });
  }

  getUserDepartments(userId: string): void {
    this.userService.getUserDepartments({ userId }).subscribe({
      next: (res: any) => {
        const selected =
          res?.data?.map((d: any) => d?.departmentId.toString()) || [];
        this.userDepartmentForm.patchValue({ departmentIds: selected });
      },
      error: (err) => {
        console.error('Failed to load user departments', err);
      },
    });
  }

  // assign entity to user
  getEntitys() {
    this.entityService.GetSelect2List(0, 6000).subscribe({
      next: (res) => {
        this.entities = res?.results

      },
      error: (err) => {},
    });
  }

  openAssignIntitiesModal(user: any): void {
    this.selectedUserIdForDepartments = user.id;

    if (!this.entities?.length) this.getEntitys();

    this.getUserIntities(user.id);

    this.userEntityForm.reset({
      entityIds: user.departments?.map((d: any) => d.id) || [],
    });
  }

  getUserIntities(userId: string): void {
    this.userService.getUserIntities({ userId }).subscribe({
      next: (res: any) => {
        const selected = res?.map((d: any) => d?.entityId) || [];

        this.userEntityForm.patchValue({ entityIds: selected });
      },
      error: (err) => {
        console.error('Failed to load user entities', err);
      },
    });
  }

  assignIntities(): void {
    if (this.userEntityForm.invalid || !this.selectedUserIdForDepartments) {
      this.toastr.error('Please select at least one entity');
      return;
    }

    const payload = {
      userId: this.selectedUserIdForDepartments,
      entityIds: this.userEntityForm.value?.entityIds,
    };

    this.spinnerService.show();

    this.userService.assignEntities(payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('ENTITIES_ASSIGNED'));
        this.spinnerService.hide();
        const closeBtn = document.querySelector(
          '.closeEntity.btn-close'
        ) as HTMLElement;

        closeBtn?.click();
        this.getUsers(this.currentPage); // refresh table
      },
      error: () => {
        this.toastr.error(this.translate.instant('ENTITIES_ASSIGN_FAILED'));
        this.spinnerService.hide();
      },
    });
  }

  // Delete user
  selectUserToDelete(user: any) {
    this.selectedUserIdForDepartments = user.id;
  }

  deleteUser(): void {
    if (this.selectedUserIdForDepartments) {
      this.spinnerService.show();
      this.userService.deleteUser(this.selectedUserIdForDepartments).subscribe(
        (response) => {
          this.selectedUserIdForDepartments = null;
          this.spinnerService.hide(); // Hide spinner after deletion
          const closeBtn = document.querySelector(
            '.btn-delete.btn-close'
          ) as HTMLElement;

          closeBtn?.click();
        },
        (error) => {
          this.spinnerService.hide();
          console.error('Error deleting role:', error);
        }
      );
    }
  }

  // user permissions  start

  getUserPermissions(userId: string): void {
    this.selectedUserIdForDepartments = userId;

    this.userService.getUserPermission(userId).subscribe({
      next: (res: any) => {
        this.userPermissions = res || [];

        this.originalPermissions = res
          .flatMap((module: any) => module.screenPermissions)
          .flatMap((screen: any) =>
            screen.permissionValues
              .filter((p: any) => p.isAllowed)
              .map((p: any) => p.value)
          );
        this.filteredPermissions = [...this.userPermissions];
        this.populateModuleAndScreenOptions();
      },
      error: () => {
        this.toastr.error('Failed to load permissions');
      },
    });
  }
  hasPermission(perms: any[], type: string): boolean {
    return perms.some(
      (p) =>
        p.permissionName.toLowerCase() === type.toLowerCase() && p.isAllowed
    );
  }
  onTogglePermission(event: any, screenName: string, permission: string): void {
    const isChecked = event.target.checked;

    for (const module of this.userPermissions) {
      const screen = module.screenPermissions.find(
        (s: any) => s.screenName === screenName
      );
      if (screen) {
        const perm = screen.permissionValues.find(
          (p: any) => p.permissionName === permission
        );
        if (perm) {
          perm.isAllowed = isChecked;
        }
      }
    }
  }

  isPermissionAvailable(screen: any, action: string): boolean {
    return screen.permissionValues.some(
      (p: any) => p.permissionName === action
    );
  }

  saveUserPermissions(): void {
    const currentPermissions: string[] = this.userPermissions
      .flatMap((module: any) => module.screenPermissions)
      .flatMap((screen: any) =>
        this.availablePermissionActions
          .filter((action: string) =>
            this.isPermissionAvailable(screen, action)
          )
          .filter((action: string) =>
            this.hasPermission(screen.permissionValues, action)
          )
          .map((action: string) => `${screen.screenName}.${action}`)
      );

    const uniqueOriginal = Array.from(new Set(this.originalPermissions));
    const uniqueCurrent = Array.from(new Set(currentPermissions));

    const toCreate = uniqueCurrent.filter((p) => !uniqueOriginal.includes(p));

    const toDelete = uniqueOriginal.filter((p) => !uniqueCurrent.includes(p));

    // const toCreate = currentPermissions.filter(p => !this.originalPermissions.includes(p));

    // const toDelete = this.originalPermissions.filter(p => !currentPermissions.includes(p));

    const createPayload = {
      userId: this.selectedUserIdForDepartments,
      permissions: toCreate.map((p) => ({
        type: p.split('.')[0],
        value: p,
      })),
    };

    const deletePayload = {
      userId: this.selectedUserIdForDepartments,
      permissions: toDelete.map((p) => ({
        type: p.split('.')[0],
        value: p,
      })),
    };

    this.spinnerService.show();

    forkJoin([
      toCreate.length
        ? this.userService.createUserPermission(createPayload)
        : of(null),
      toDelete.length
        ? this.userService.deleteUserPermission(deletePayload)
        : of(null),
    ]).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('TOAST.PERMISSIONS_UPDATED')
        );
        this.spinnerService.hide();
        const closeBtn = document.querySelector(
          '.btn-close-user-permissions'
        ) as HTMLElement;
        closeBtn?.click();
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('TOAST.PERMISSIONS_UPDATE_FAILED')
        );
        this.spinnerService.hide();
      },
      complete: () => {
        this.selectedUserIdForDepartments = '';
      },
    });
  }

  populateModuleAndScreenOptions(): void {
    const allModulesSet = new Set<string>();

    this.userPermissions.forEach((module) => {
      allModulesSet.add(module.moduleName);

      module.screenPermissions.forEach((screen: any) => {
        this.screenOptions.push({
          module: module.moduleName,
          label: screen.screenName,
          value: screen.screenName,
        });
      });
    });

    this.moduleOptions = Array.from(allModulesSet).map((name) => ({
      label: name,
      value: name,
    }));

    this.filteredScreens = [...this.screenOptions]; // default all
  }

  applySearch(): void {
    const selectedModules = this.filterForm.get('selectedModules')?.value || [];
    const selectedScreens = this.filterForm.get('selectedScreens')?.value || [];


    this.filteredPermissions = this.userPermissions
      .filter(m => selectedModules.length === 0 || selectedModules.includes(m.moduleName))
      .map(m => ({
        ...m,
        screenPermissions: m.screenPermissions.filter((s: any) =>
          selectedScreens.length === 0 || selectedScreens.includes(s.screenName)
        )
      }))
      .filter(m => m.screenPermissions.length > 0);
  }

  // updates 
  getEntitysInfo() {
    this.entityInfoService.getEntitiesInfoSelect2(0, 6000).subscribe({
      next: (res) => {
        this.entitiesInfo = res?.results
        console.log(this.entitiesInfo);

      },
      error: (err) => {

      }
    })
  };

  fetchcountrySelect2(): void {
    this.select2Service.getCountrySelect2(this.searchSelect2Params).subscribe({
      next: (response: any) => {
        this.countrySelect2 = response?.results || [];
      },
      error: (err: any) => {
        this.toastr.error('Failed to load Country.', 'Error');
      }
    });
  }

  fetchUsersStatusSelect2(): void {
    this.userService.getUserStatusSelect2(0, 2000).subscribe({
      next: (response: any) => {
         let ress= response?.results || [];
        this.userStatusOptions = ress.map((item:any) => ({
          id: Number(item.id),
          text: item.text
        }));
      },
      error: (err: any) => {
        this.toastr.error('Failed to load Country.', 'Error');
      }
    });
  }

  fetchUsersTypesSelect2(): void {
    this.userService.getUserTypes().subscribe({
      next: (response: any) => {
        this.userTypesOptions = response || [];
        console.log(this.userTypesOptions, response);

      },
      error: (err: any) => {
        this.toastr.error('Failed to load Country.', 'Error');
      }
    });
  }

  // show user roles 
   openRolesModal(roles:any) {
    this.userRoles =roles
  }

}
