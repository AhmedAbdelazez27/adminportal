import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/services/translation.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoginUAEPassDto, ReturnUAEPassDto, UAEPassDto } from '../../../core/dtos/uaepass.dto';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgxSpinnerModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  form !: FormGroup;
  submitted: boolean = false;
  currentLang: string = 'ar';

  uaePassParams = new LoginUAEPassDto();
  loadformData = new UAEPassDto();
  loadData = new ReturnUAEPassDto();

  code: string | null = null;
  state: string | null = null;
  destroy$ = new Subject<boolean>();
  currentlang: any;
  UAEPassURL: any;
  lang: string | null = null;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private translation: TranslationService
  ) {
    this.form = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
    this.translate.onLangChange.subscribe(e => {
      this.currentLang = e.lang;
    });

  }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      this.code = params['code'];
      this.state = params['state'];
      // debugger;

      if (this.isValidCodeState(this.code, this.state)) {
        this.uaepassCheckCode(this.code!, this.state!);
      } else {
        console.log('Code or state is invalid. API call not made.');
      }
    });
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.spinnerService.show();

    this.auth.login(this.form.value).subscribe({
      next: (res) => {

        this.auth.saveToken(res?.token);
        const decodedData = this.auth.decodeToken();

        if (decodedData && decodedData.Permissions) {
          localStorage.setItem('departmentId', decodedData.DepartmentId);
          const permissions = decodedData.Permissions;
          localStorage.setItem('userName',decodedData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'])
          localStorage.setItem('permissions', JSON.stringify(permissions));
          localStorage.setItem('pages', JSON.stringify(decodedData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']));
          localStorage.setItem('userId', decodedData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
        }

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

  routeToForgetPassword() {
    this.router.navigate(['/forgot-password']);
  }
  toggleLang() {
    this.translation.toggleLanguage();
  }

  isValidCodeState(code: string | null, state: string | null): boolean {
    return !!(code && state && code.trim() !== '' && state.trim() !== '');
  }

  loginByUAEPassURL(): void {
    this.lang = localStorage.getItem('lang');
    if (this.lang === "ar") {
      this.currentlang = "ar";
    } else {
      this.currentlang = "en";
    }
    this.UAEPassURL = 'https://stg-id.uaepass.ae/idshub/authorize?response_type=code&client_id=sandbox_stage&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&redirect_uri=http://localhost:4200/login&acr_values=urn:safelayer:tws:policies:authentication:level:low';
    window.location.href = `${this.UAEPassURL}&ui_locales=${this.currentlang}`;
  }


 
  uaepassCheckCode(code: string, state: string) {
    // debugger;

    const params: LoginUAEPassDto =
    {
      code : code,
      state : state,
      lang : localStorage.getItem('lang')
    }
   
    this.spinnerService.show();

    this.auth.UAEPasslogin(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {

          this.auth.saveToken(res?.token);
          const decodedData = this.auth.decodeToken();

          if (decodedData && decodedData.Permissions) {
            const permissions = decodedData.Permissions;
            localStorage.setItem('permissions', JSON.stringify(permissions));
            localStorage.setItem('pages', JSON.stringify(decodedData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']));
            localStorage.setItem('userId', decodedData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
          }

          this.toastr.success(this.translate.instant('LOGIN.SUCCESS'), this.translate.instant('TOAST.TITLE.SUCCESS'));
          this.spinnerService.hide();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.toastr.error(this.translate.instant('LOGIN.FAILED'), this.translate.instant('TOAST.TITLE.ERROR'));
          this.toastr.info(this.translate.instant(err.error.reason));
          const logoutURL = 'https://stg-id.uaepass.ae/idshub/logout?redirect_uri=http://localhost:4200/login'
          window.location.href = `${logoutURL}`;
          this.spinnerService.hide();
        },

        complete: () => {
          this.spinnerService.hide();
        }
      });
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
