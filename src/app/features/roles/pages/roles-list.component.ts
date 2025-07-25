import { Component } from '@angular/core';
import { RoleService } from '../../../core/services/role.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CreateRoleDto } from '../../../core/dtos/create-role.dto';
import { UserService } from '../../../core/services/user.service';
import { AssignRoleDto } from '../../../core/dtos/assign-role.dto';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../../core/services/spinner.service';
import { EntityService } from '../../../core/services/entit.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-roles-list',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    TranslateModule,
  ],
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss'],
})
export class RolesListComponent {
  roles: any[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  pages: number[] = [];
  searchValue: string = '';
  newRole: CreateRoleDto = { name: '' };
  selectedRole: any = {};
  roleToSelected: any;
  userList: any[] = [];
  selectedRoleId: string = '';
  selectedUser: string[] = [];
  userDropdowns: any[] = [{ selectedUserIds: [] }];
  selectedUserIds: string[] = [];
  userEntityForm: FormGroup;
  usersForm: FormGroup;
  entities: any[] = [];
  modules: any[] = [];
  searchKeyword: string = '';
  selectedModuleFilter: string = 'all';
  originalModules: any[] = [];
  selectedUsers: any[] = [];
  originalUsers: any[] = [];

  constructor(
    private roleService: RoleService,
    private _UserService: UserService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private entityService: EntityService,
    private fb: FormBuilder
  ) {
    this.userEntityForm = this.fb.group({
      entityIds: [[], Validators.required],
    });
    this.usersForm = this.fb.group({
      userIds: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    this.getRoles(this.currentPage, this.searchValue);
    this.getUsersList();
  }

  getRoles(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.itemsPerPage;
    this.spinnerService.show();
    this.roleService.getRoles(skip, this.itemsPerPage, searchValue).subscribe(
      (data: any) => {
        this.roles = data.data;
        this.totalCount = data.totalCount;
        this.calculatePages();
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
  calculatePages(): void {
    const totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(event: any): void {
    if (event < 1) event = 1;
    if (event > this.pages.length) event = this.pages.length;

    this.currentPage = event;
    this.getRoles(event, this.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.itemsPerPage = perPage;
      this.calculatePages();
      this.getRoles(1, this.searchValue);
    }
  }
  onSearch(): void {
    this.getRoles(1, this.searchValue);
  }

  clear() {
    this.searchValue = '';
    this.onSearch();
  }
  // Save new role
  saveRole(): void {
    this.spinnerService.show(); // Show spinner before saving role
    this.roleService.createRole(this.newRole).subscribe(
      (response) => {
        this.toastr.success(
          this.translate.instant('ROLE.CREATED.SUCCESS'),
          this.translate.instant('TOAST.TITLE.SUCCESS')
        );
        this.spinnerService.hide(); // Hide spinner after saving role
        this.getRoles(1);
        this.newRole = { name: '' };
      },
      (error) => {
        this.toastr.error(
          this.translate.instant('ROLE.CREATED.FAIL'),
          this.translate.instant('TOAST.TITLE.ERROR')
        );
        this.spinnerService.hide(); // Hide spinner on failure
        console.error('Error saving role:', error);
      }
    );
  }
  openEditModal(role: any): void {
    this.selectedRole = { ...role };
  }

  // Update existing role
  updateRole(): void {
    this.spinnerService.show(); // Show spinner before updating role
    this.roleService.updateRole(this.selectedRole).subscribe(
      (response) => {
        this.toastr.success(
          this.translate.instant('ROLE.UPDATED.SUCCESS'),
          this.translate.instant('TOAST.TITLE.SUCCESS')
        );
        this.spinnerService.hide(); // Hide spinner after updating role
        const closeBtn = document.querySelector(
          '.closeUpdate.btn-close'
        ) as HTMLElement;
        closeBtn?.click();
        this.getRoles(1);
      },
      (error) => {
        this.toastr.error(
          this.translate.instant('ROLE.UPDATED.FAIL'),
          this.translate.instant('TOAST.TITLE.ERROR')
        );
        this.spinnerService.hide();
      }
    );
  }
  selectCurrentRole(role: any): void {
    this.roleToSelected = role;
  }
  // Delete role
  deleteRole(): void {
    if (this.roleToSelected) {
      this.spinnerService.show(); // Show spinner before deleting role
      this.roleService.deleteRole(this.roleToSelected.id).subscribe(
        (response) => {
          this.roles = this.roles.filter(
            (role) => role.id !== this.roleToSelected.id
          );
          this.roleToSelected = null;
          this.toastr.success(
            this.translate.instant('ROLE.DELETED.SUCCESS'),
            this.translate.instant('TOAST.TITLE.SUCCESS')
          );
          this.spinnerService.hide(); // Hide spinner after deletion
        },
        (error) => {
          this.toastr.error(
            this.translate.instant('ROLE.DELETED.FAIL'),
            this.translate.instant('TOAST.TITLE.ERROR')
          );
          this.spinnerService.hide(); // Hide spinner on failure
          console.error('Error deleting role:', error);
        }
      );
    }
  }

  // assign users to some role start

  getUsersList() {
    this._UserService
      .getUsersForSelect2({
        searchValue: '',
        skip: 0,
        take: 10000,
        orderByValue: null,
      })
      .subscribe({
        next: (res) => {
          this.userList = res?.results;
        },
        error: (err) => {},
        complete: () => {},
      });
  }

  getUsersRoleById(role: any) {
    this.selectedRoleId = role?.id;
    this.roleService.getUsersRoleById(role.id).subscribe({
      next: (res) => {
        const selected = res?.map((d: any) => d?.id) || [];
        this.originalUsers = selected;
        this.usersForm.patchValue({ userIds: selected });
      },
      error: (err) => {},
      complete: () => {},
    });
  }

  assignRole(): void {
    if (this.usersForm.invalid || !this.selectedRoleId) {
      this.toastr.error('Please select at least one User');
      return;
    }

    const currentUsers = this.usersForm.value.userIds;
    // Determine which users to add and which ones to remove
    const toAdd = currentUsers.filter(
      (userId: any) => !this.originalUsers.includes(userId)
    );
    const toRemove = this.originalUsers.filter(
      (userId) => !currentUsers.includes(userId)
    );

    const addPayload = {
      roleId: this.selectedRoleId,
      userIds: toAdd,
    };

    const removePayload = {
      roleId: this.selectedRoleId,
      userIds: toRemove,
    };

    this.spinnerService.show(); // Show spinner before assigning role
    // this.roleService.assignRole(payload).subscribe(
    //   {
    //     next: (response) => {
    //       this.toastr.success(this.translate.instant('ASSIGN.SUCCESS'), this.translate.instant('TOAST.TITLE.SUCCESS'));
    //       this.spinnerService.hide();  // Hide spinner after assigning role
    //     },
    //     error: (error) => {
    //       this.toastr.error(this.translate.instant('ASSIGN.FAIL'), this.translate.instant('TOAST.TITLE.ERROR'));
    //       this.spinnerService.hide();  // Hide spinner on failure
    //       console.error('Error assigning role:', error);
    //     },
    //     complete: () => {

    //     }
    //   },
    // );
    forkJoin([
      toAdd.length ? this.roleService.assignRole(addPayload) : of(null),
      toRemove.length ? this.roleService.unAssignRole(removePayload) : of(null),
    ]).subscribe({
      next: () => {
        this.toastr.success('Role updated successfully');
        this.spinnerService.hide();
        const closeBtn = document.querySelector(
          '.btn-close-user-permissions'
        ) as HTMLElement;
        closeBtn?.click();
        this.getRoles(1);
      },
      error: () => {
        this.toastr.error('Failed to update the role');
        this.spinnerService.hide();
      },
      complete: () => {
        this.usersForm.reset();
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

  openAssignIntitiesModal(role: any): void {
    this.selectedRoleId = role.id;

    if (!this.entities?.length) this.getEntitys();

    this.getUserIntities(role.id);

    this.userEntityForm.reset({
      entityIds: role?.departments?.map((d: any) => d.id) || [],
    });
  }

  getUserIntities(roleId: string): void {
    this._UserService.getUserIntities({ userId: null, roleId }).subscribe({
      next: (res: any) => {
        const selected = res?.map((d: any) => d?.entityId) || [];

        this.userEntityForm.patchValue({ entityIds: selected });
      },
      error: (err) => {
        console.error('Failed to load role entities', err);
      },
    });
  }

  assignIntities(): void {
    if (this.userEntityForm.invalid || !this.selectedRoleId) {
      this.toastr.error('Please select at least one entity');
      return;
    }

    const payload = {
      roleId: this.selectedRoleId,
      entityIds: this.userEntityForm.value?.entityIds,
    };

    this.spinnerService.show();

    this._UserService.AssignRoleEntities(payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('ENTITIES_ASSIGNED'));
        this.spinnerService.hide();
        const closeBtn = document.querySelector(
          '.closeEntity.btn-close'
        ) as HTMLElement;
        closeBtn?.click();
        this.getRoles(this.currentPage); // refresh table
      },
      error: () => {
        this.toastr.error(this.translate.instant('ENTITIES_ASSIGN_FAILED'));
        this.spinnerService.hide();
      },
    });
  }
  // screens permission
  getScreensList(roleId: any) {
    this.selectedRoleId = roleId;
    this.roleService.getScreensList({ roleId }).subscribe({
      next: (res) => {
        this.originalModules = res?.data || [];
        this.modules = [...this.originalModules];
      },
      error: (err) => {},
      complete: () => {},
    });
  }

  applyFilter(): void {
    const keyword = this.searchKeyword.toLowerCase().trim();
    const selectedModule = this.selectedModuleFilter;

    this.modules = this.originalModules
      .filter((module) => {
        const matchesModule =
          selectedModule === 'all' ||
          module.module.toString() === selectedModule;

        const filteredScreens = module.screens.filter((screen: any) =>
          screen.name.toLowerCase().includes(keyword)
        );

        return matchesModule && filteredScreens.length > 0;
      })
      .map((module) => {
        const filteredScreens = module.screens.filter((screen: any) =>
          screen.name.toLowerCase().includes(keyword)
        );
        return {
          ...module,
          screens: filteredScreens,
        };
      });
  }

  onScreenToggle(screen: any) {}

  saveScreensPermissions(): void {
    if (!this.selectedRoleId) {
      this.toastr.error(this.translate.instant('TOAST.ROLE_REQUIRED'));
      return;
    }

    const selectedScreens = this.modules
      .flatMap((m) => m.screens)
      .filter((screen) => screen.selected === true)
      .map((screen) => screen.name);

    const payload = {
      roleId: this.selectedRoleId,
      claimType: '',
      claimValues: selectedScreens,
    };

    this.spinnerService.show();

    this.roleService.assignScreens(payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('TOAST.SCREENS_ASSIGNED'));
        this.spinnerService.hide();
        const closeBtn = document.querySelector(
          '.btn-screen.btn-close'
        ) as HTMLElement;
        closeBtn?.click();
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('TOAST.SCREENS_ASSIGN_FAILED')
        );
        this.spinnerService.hide();
      },
    });
  }
}
