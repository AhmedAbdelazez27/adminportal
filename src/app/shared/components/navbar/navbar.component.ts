import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpinnerService } from '../../../core/services/spinner.service';
import { UserService } from '../../../core/services/user.service';
import { confirmPasswordValidator } from '../../customValidators/confirmPasswordValidator';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  providers: [ToastrService]
})
export class NavbarComponent {
  open = false;
  private timeoutId: any;
  changePasswordForm: FormGroup;
  showCurrentPassword: boolean = false;
  showPassword: boolean = false;
  showCPassword: boolean = false;
  submitted: boolean = false;
  currentLang: string = 'en';

  constructor(public translation: TranslationService, private authService: AuthService, private toastr: ToastrService, private fb: FormBuilder, private spinnerService: SpinnerService,
    private translate: TranslateService, private userService: UserService) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(1)]],
      newPassword: ['', [Validators.required, Validators.minLength(1)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(1)]]
    }, {
      validators: confirmPasswordValidator('newPassword', 'confirmPassword')
    });

    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';

    this.translate.onLangChange.subscribe(lang => {
      this.currentLang = lang.lang;
    });

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

  logout() {
    this.authService.logout();
    this.toastr.success('You have been logged out', 'Success');
  }
  // change password
  showPasswordMatch(): boolean {
    const pass = this.changePasswordForm.get('password')?.value;
    const confirm = this.changePasswordForm.get('confirmPassword')?.value;

    return pass && confirm && pass === confirm && !this.changePasswordForm.get('confirmPassword')?.errors?.['mismatch'];
  }

  submitChangePassword(): void {
    this.submitted = true;
    console.log(this.changePasswordForm);

    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return;
    }

    const formData = this.changePasswordForm.value;

    this.spinnerService.show();
    const userId = localStorage.getItem('userId')

    this.userService.changeUserPassword({ ...formData, userId }).subscribe({
      next: (res) => {
        this.toastr.success(this.translate.instant('TOAST.USER_UPDATED'));
        const closeBtn = document.querySelector('.changepassword.btn-close') as HTMLElement;
        closeBtn?.click();
      },
      error: (err) => {
        this.spinnerService.hide();
        this.toastr.error('Failed to update user');
      },
      complete: () => this.spinnerService.hide()
    });
  }



}
