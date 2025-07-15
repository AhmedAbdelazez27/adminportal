import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,NgxSpinnerModule,CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

form !:FormGroup;
submitted:boolean = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private spinnerService: SpinnerService, private toastr: ToastrService, private translate: TranslateService) {
    this.form = this.fb.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
  });

  }

submit(): void {
  this.submitted = true;
  if (this.form.invalid) return;
  this.spinnerService.show();

  this.auth.login(this.form.value).subscribe({
    next: (res) => {
      console.log(res?.token );
      
      this.auth.saveToken(res?.Token);
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
