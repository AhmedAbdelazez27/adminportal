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
  itemsPerPage: number = 2;
  pages: number[] = [];  

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
    this.getRoles(event); 

}
}