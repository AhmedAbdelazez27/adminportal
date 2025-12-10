import { Component, ViewChild } from '@angular/core';
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
import { Subject, forkJoin, of } from 'rxjs';
import { ColDef, GridOptions } from 'ag-grid-community';
import { PagedDto, Pagination } from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
declare var bootstrap: any;

@Component({
    selector: 'app-roles-list',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        TranslateModule,
        GenericDataTableComponent
    ],
    templateUrl: './roles-list.component.html',
    styleUrls: ['./roles-list.component.scss'],
})
export class RolesListComponent {
    @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;

    roles: any[] = [];
    loadgridData: any[] = [];
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
    moduleOptions: any[] = [];
    selectedUsers: any[] = [];
    originalUsers: any[] = [];
    allScreensSelected: boolean = false;

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
        // Initialize search parameters
        this.searchParams.searchValue = '';
        this.searchText = '';

        this.getRoles(this.currentPage, this.searchValue);
        this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
        this.getUsersList();

        this.buildColumnDefs();
        this.rowActions = [
            { label: this.translate.instant('Common.users'), icon: 'icon-frame-user', action: 'onUsersInfo' },
            { label: this.translate.instant('Common.screens'), icon: 'icon-frame-screens', action: 'onScreensInfo' },
            // { label: this.translate.instant('Common.entities'), icon: 'icon-frame-entities', action: 'onEntitiesInfo' },
            { label: this.translate.instant('Common.edit'), icon: 'icon-frame-edit', action: 'onEditInfo' },
            { label: this.translate.instant('Common.deletd'), icon: 'icon-frame-delete', action: 'onDeletdInfo' },
        ];
    }


    getRoles(page: number, searchValue: string = ''): void {

      this.searchParams.skip = (page - 1) * this.itemsPerPage;
      this.searchParams.take = this.itemsPerPage;
      this.searchParams.searchValue = searchValue;
      const cleanedFilters = this.cleanFilterObject(this.searchParams);
      cleanedFilters.searchValue = cleanedFilters.searchValue != null ? cleanedFilters.searchValue : '';

        this.spinnerService.show();
      this.roleService.getAllRoles(cleanedFilters).subscribe(
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
        const cleanedFilters = this.cleanFilterObject(this.searchParams);
        cleanedFilters.searchValue = cleanedFilters.searchValue != null ? cleanedFilters.searchValue : '';

        this.spinnerService.show();
        this.roleService.getAllRoles(cleanedFilters).subscribe(
            (data: any) => {
                this.loadgridData = data.data;
                this.pagination.totalCount = data.totalCount;
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
        this.pagination.currentPage = event;
        this.getLoadDataGrid({ pageNumber: event, pageSize: this.pagination.take });
    }

    changePerPage(event: any): void {
        const perPage = parseInt(event.target.value, 10);
        if (!isNaN(perPage)) {
            this.itemsPerPage = perPage;
            this.pagination.take = perPage;
            this.calculatePages();
            this.getLoadDataGrid({ pageNumber: 1, pageSize: perPage });
        }
    }
    onSearch(): void {
        this.searchText = this.searchValue;
        this.searchParams.searchValue = this.searchValue;
        this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
    }

    clear() {
        this.searchValue = '';
        this.searchText = '';
        this.searchParams.searchValue = '';
        this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
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
                this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
                this.newRole = { name: '' };
            },
            (error) => {
                this.toastr.error(
                    this.translate.instant('ROLE.CREATED.FAIL'),
                    this.translate.instant('TOAST.TITLE.ERROR')
                );
                this.spinnerService.hide(); // Hide spinner on failure
            }
        );
    }
    openEditModal(role: any): void {
        this.selectedRole = { ...role };
        const modalElement = document.getElementById('Role');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        };
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
                this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
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
        const modalElement = document.getElementById('deleteRoleModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        };
    }
    // Delete role
    deleteRole(): void {
        if (this.roleToSelected) {
            this.spinnerService.show(); // Show spinner before deleting role
            this.roleService.deleteRole(this.roleToSelected.id).subscribe({
                next: (response) => {
                    // Close the delete modal
                    const modalElement = document.getElementById('deleteRoleModal');
                    if (modalElement) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        modal?.hide();
                    }

                    // Refresh the table data
                    this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take });

                    this.roleToSelected = null;
                    this.toastr.success(
                        this.translate.instant('ROLE.DELETED.SUCCESS'),
                        this.translate.instant('TOAST.TITLE.SUCCESS')
                    );
                    this.spinnerService.hide(); // Hide spinner after deletion
                },
                error: (error) => {
                    this.toastr.error(
                        this.translate.instant('ROLE.DELETED.FAIL'),
                        this.translate.instant('TOAST.TITLE.ERROR')
                    );
                    this.spinnerService.hide(); // Hide spinner on failure
                }
            });
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
                error: (err) => { },
                complete: () => { },
            });
    }

    getUsersRoleById(role: any) {
        this.selectedRoleId = role?.id;
        this.roleService.getUsersRoleById(role.id).subscribe({
            next: (res) => {
                const selected = res?.map((d: any) => d?.id) || [];
                this.originalUsers = selected;
                this.usersForm.patchValue({ userIds: selected });

                const modalElement = document.getElementById('users');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                };
            },
            error: (err) => { },
            complete: () => { },
        });
    }

    assignRole(): void {
  

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
                this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
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
            error: (err) => { },
        });
    }

    openAssignIntitiesModal(role: any): void {
        this.selectedRoleId = role.id;

        if (!this.entities?.length) this.getEntitys();

        this.getUserIntities(role.id);

        this.userEntityForm.reset({
            entityIds: role?.departments?.map((d: any) => d.id) || [],
        });
        const modalElement = document.getElementById('Entities');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        };
    }

    getUserIntities(roleId: string): void {
        this._UserService.getUserIntities({ userId: null, roleId }).subscribe({
            next: (res: any) => {
                const selected = res?.map((d: any) => d?.entityId) || [];

                this.userEntityForm.patchValue({ entityIds: selected });
            },
            error: (err) => {
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
                this.getLoadDataGrid({ pageNumber: this.pagination.currentPage, pageSize: this.pagination.take }); // refresh table
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

                // Create module options for ng-select
                this.moduleOptions = [
                    { id: 'all', text: this.translate.instant('AuthenticationResorceName.allModule') },
                    ...this.originalModules.map(module => ({
                        id: module.module,
                        text: module.moduleName
                    }))
                ];

                this.updateAllScreensSelectedState();
                const modalElement = document.getElementById('screens');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                };
            },
            error: (err) => { },
            complete: () => { },
        });
    }

    applyFilter(): void {
        const keyword = this.searchKeyword.trim();
      const selectedModule = this.selectedModuleFilter;

      // Normalize Arabic text for better search
        const normalizeText = (text: string) => {
            if (!text) return '';
            return text.toLowerCase()
                .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // Remove Arabic diacritics
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
        };

        const normalizedKeyword = normalizeText(keyword);

        this.modules = this.originalModules
          .filter((module) => {
                const matchesModule =
                    selectedModule === 'all' ||
                    module.module === selectedModule;

                const filteredScreens = module.screens.filter((screen: any) => {
                    if (!normalizedKeyword) return true; // Show all if no search term

                    // Search in both name and localizedName
                    const nameMatch = normalizeText(screen.name || '').includes(normalizedKeyword);
                    const localizedNameMatch = normalizeText(screen.localizedName || '').includes(normalizedKeyword);

                    return nameMatch || localizedNameMatch;
                });

                return matchesModule && filteredScreens.length > 0;
            })
            .map((module) => {
                const filteredScreens = module.screens.filter((screen: any) => {
                    if (!normalizedKeyword) return true; // Show all if no search term

                    // Search in both name and localizedName
                    const nameMatch = normalizeText(screen.name || '').includes(normalizedKeyword);
                    const localizedNameMatch = normalizeText(screen.localizedName || '').includes(normalizedKeyword);

                    return nameMatch || localizedNameMatch;
                });
                return {
                    ...module,
                    screens: filteredScreens,
                };
            });

        this.updateAllScreensSelectedState();
    }

    clearScreenFilter(): void {
        this.searchKeyword = '';
        this.selectedModuleFilter = 'all';
        this.modules = [...this.originalModules];
        this.updateAllScreensSelectedState();
    }

    onScreenToggle(screen: any) {
        this.updateAllScreensSelectedState();
    }

    // selectAllScreens(): void {
    //     const shouldSelectAll = !this.allScreensSelected;

    //     this.modules.forEach(module => {
    //         module.screens.forEach((screen: any) => {
    //             screen.selected = shouldSelectAll;
    //         });
    //     });

    //     this.allScreensSelected = shouldSelectAll;
    // }
    selectAllScreens(forceValue?: boolean): void {
        const shouldSelectAll =
            typeof forceValue === 'boolean' ? forceValue : !this.allScreensSelected;

        this.modules.forEach(module => {
            module.screens.forEach((screen: any) => {
                screen.selected = shouldSelectAll;
            });
        });

        this.allScreensSelected = shouldSelectAll;
    }


    updateAllScreensSelectedState(): void {
        const allScreens = this.modules.flatMap(module => module.screens);
        this.allScreensSelected = allScreens.length > 0 && allScreens.every(screen => screen.selected);
    }

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


    private buildColumnDefs(): void {
        this.columnDefs = [
            {
                headerName: '#',
                valueGetter: (params) =>
                    (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
                width: 60,
                colId: 'serialNumber'
            },
            { headerName: this.translate.instant('AuthenticationResorceName.name'), field: 'name', width: 200 },
            { headerName: this.translate.instant('AuthenticationResorceName.totalusers'), field: 'userCount', width: 200 },
        ];
    }

    onTableAction(event: { action: string, row: any }) {
        if (event.action === 'onUsersInfo') {
            this.getUsersRoleById(event.row);
        }
        if (event.action === 'onScreensInfo') {
            this.getScreensList(event.row?.id);
        }
        if (event.action === 'onEntitiesInfo') {
            this.openAssignIntitiesModal(event.row);
        }
        if (event.action === 'onEditInfo') {
            this.openEditModal(event.row);
        }
        if (event.action === 'onDeletdInfo') {
            this.selectCurrentRole(event.row);
        }
    }

    onPageChange(event: { pageNumber: number; pageSize: number }): void {
        this.pagination.currentPage = event.pageNumber;
        this.pagination.take = event.pageSize;
        this.getLoadDataGrid({ pageNumber: event.pageNumber, pageSize: event.pageSize });
    }

    onTableSearch(text: string): void {
        this.searchText = text;
        this.searchParams.searchValue = text;
        this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
    }
}
