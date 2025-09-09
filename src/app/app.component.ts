import { Component, TemplateRef, ViewChild } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { TranslationService } from './core/services/translation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { confirmPasswordValidator } from './shared/customValidators/confirmPasswordValidator';
import { SpinnerService } from './core/services/spinner.service';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  imports: [TranslateModule, RouterModule, NgxSpinnerModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('customSpinner', { static: true }) customSpinnerTemplate!: TemplateRef<any>;
  currentLang: string = 'en';

  changePasswordForm: FormGroup;
  showCurrentPassword: boolean = false;
  showPassword: boolean = false;
  showCPassword: boolean = false;
  submitted: boolean = false;

  constructor(public translation: TranslationService, private spinner: NgxSpinnerService, private toastr: ToastrService, private fb: FormBuilder, private translate: TranslateService,private spinnerService :SpinnerService, private userService: UserService) {


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

  showLoader() {
    this.spinner.show();
    setTimeout(() => this.spinner.hide(), 4000);
  }

  toggleLang() {
    this.translation.toggleLanguage();
  }
  showSuccess() {
    this.toastr.success('تمت العملية بنجاح', 'نجاح');
  }

  showError() {
    this.toastr.error('حدث خطأ أثناء العملية', 'خطأ');
  }

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
