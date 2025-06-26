import { Component } from '@angular/core';
import { RoleService } from '../../../core/services/role.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roles-list',
  imports: [CommonModule],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss'
})
export class RolesListComponent {
  roles: any[] = []; 
  totalCount: number = 0;  
  currentPage: number = 1;
  itemsPerPage: number = 10; 

  constructor(private roleService: RoleService) { }

  ngOnInit(): void {
    
    this.getRoles(this.currentPage);
  }

 
  getRoles(page: number): void {
    const skip = (page - 1) * this.itemsPerPage;
    this.roleService.getRoles(skip, this.itemsPerPage).subscribe(
      (data: any) => {
        this.roles = data.data; 
        this.totalCount = data.totalCount; 
      },
      (error) => {
        console.error('Error fetching roles:', error);
      }
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.getRoles(page); 

}
}