import { Component } from '@angular/core';
import { RoleService } from '../../../core/services/role.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateRoleDto } from '../../../core/dtos/create-role.dto';
import { UserService } from '../../../core/services/user.service';
import { AssignRoleDto } from '../../../core/dtos/assign-role.dto';

@Component({
  selector: 'app-roles-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss'
})
export class RolesListComponent {
  roles: any[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 2;
  pages: number[] = [];
  searchValue: string = '';
  newRole: CreateRoleDto = { name: '', aspNetUsersRoleCount: 1 };
  selectedRole: any = {};
  roleToSelected: any;
  userList: any[] = [];
  selectedRoleId: string = '';
  selectedUser: string[] = [];

  constructor(private roleService: RoleService, private _UserService: UserService) { }

  ngOnInit(): void {

    this.getRoles(this.currentPage, this.searchValue);
    this.getUsersList();
  }


  getRoles(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.itemsPerPage;
    this.roleService.getRoles(skip, this.itemsPerPage, searchValue).subscribe(
      (data: any) => {
        this.roles = data.data;
        this.totalCount = data.totalCount;
        this.calculatePages();
      },
      (error) => {
        console.error('Error fetching roles:', error);
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
    this.getRoles(this.currentPage, this.searchValue);
  }

  clear() {
    this.searchValue = '';
    this.onSearch();
  }
  saveRole(): void {
    this.roleService.createRole(this.newRole).subscribe(
      (response) => {
        console.log('Role saved successfully', response);
        this.getRoles(1);
        this.newRole = { name: '', aspNetUsersRoleCount: 0 };
      },
      (error) => {
        console.error('Error saving role:', error);
      }
    );
  }

  openEditModal(role: any): void {
    this.selectedRole = { ...role };
  }

  updateRole(): void {
    this.roleService.updateRole(this.selectedRole).subscribe(
      (response) => {
        console.log('Role updated successfully', response);
        this.getRoles(1);
      },
      (error) => {
        console.error('Error updating role:', error);
      }
    );
  }
  selectCurrentRole(role: any): void {
    this.roleToSelected = role;
  }

  deleteRole(): void {
    if (this.roleToSelected) {
      this.roleService.deleteRole(this.roleToSelected.id).subscribe(
        (response) => {
          this.roles = this.roles.filter(role => role.id !== this.roleToSelected.id);
          this.roleToSelected = null;
        },
        (error) => {
          console.error('Error deleting role:', error);
        }
      );
    }
  }

  getUsersList() {
    this._UserService.getUsersForSelect2({
      searchValue: '', skip: 0, take: 10000,
      orderByValue: null
    }).subscribe({
      next: (res) => {
        this.userList = res?.results;
        console.log(this.userList);

      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log("complete");
      }
    })
  }

  assignRole(): void {
    const payload: AssignRoleDto = {
      userIds: this.selectedUser,
      roleId: this.roleToSelected.id
    };

    this.roleService.assignRole(payload).subscribe(
      {
        next: (response) => {
          console.log('Role assigned successfully', response);
        },
        error: (error) => {
          console.error('Error assigning role:', error);
        }
      }
    );
  }
}
