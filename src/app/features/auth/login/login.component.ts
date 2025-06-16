import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,NgxSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

form !:FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private spinnerService: SpinnerService, private toastr: ToastrService, private translate: TranslateService) {
    this.form = this.fb.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
  });

  }

submit(): void {
  if (this.form.invalid) return;
  this.spinnerService.show();

  this.auth.login(this.form.value).subscribe({
    next: (res) => {
      this.auth.saveToken(res?.token);
      this.toastr.success(this.translate.instant('LOGIN.SUCCESS'), this.translate.instant('TOAST.TITLE.SUCCESS'));
      this.spinnerService.hide();
      this.router.navigate(['/home']);
    },
    error: () => {
      this.toastr.error(this.translate.instant('LOGIN.FAILED'), this.translate.instant('TOAST.TITLE.ERROR'));
      this.spinnerService.hide();
    },
    complete: () => {
      this.spinnerService.hide();
    }
  });
}

}
