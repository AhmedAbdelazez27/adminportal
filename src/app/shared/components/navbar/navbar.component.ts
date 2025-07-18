import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  providers:[ToastrService]
})
export class NavbarComponent {
open = false;
private timeoutId: any;
 constructor(public translation: TranslationService, private authService: AuthService,private toastr:ToastrService){
  console.log(this.hasPermission("Role.View"));
  
 }

   toggleLang() {
    this.translation.toggleLanguage();
  }

onMouseEnter() {
  clearTimeout(this.timeoutId);
  this.open = true;
}

onMouseLeave() {
  this.timeoutId = setTimeout(() => {
    this.open = false;
  }, 200);
}
  hasPermission(permission: string): boolean {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    return permissions.includes(permission);
  }
    hasPagePermission(pagePermission: string): boolean {
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');
    return pages.includes(pagePermission);
  }

  logout(){
    this.authService.logout();
    this.toastr.success('You have been logged out', 'Success');
  }
}
