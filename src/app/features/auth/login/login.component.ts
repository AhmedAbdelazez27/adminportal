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
import { UserProfile } from '../../../core/dtos/user-profile';
import { ProfileDbService } from '../../../core/services/profile-db.service';
declare var bootstrap: any;

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
  lang: string | null = null;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private translation: TranslationService,
    private profileDb: ProfileDbService,
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

      if (this.state != undefined || this.code != undefined) {
        if (this.isValidCodeState(this.code, this.state)) {
          this.uaepassCheckCode(this.code!, this.state!);
        } else {
          const redirectUri = window.location.origin + '/login';
          const logoutURL =
            'https://stg-id.uaepass.ae/idshub/logout?redirect_uri=' +
            encodeURIComponent(redirectUri);

          this.translate
            .get(['Common.UAEPassCancelRequest'])
            .subscribe(translations => {
              this.toastr.error(translations['Common.UAEPassCancelRequest']);
            });

          setTimeout(() => {
            window.location.href = logoutURL;
            this.spinnerService.hide();
          }, 2000);
        }
      }
    });
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.spinnerService.show();

    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        console.log("res = ", res);
        if (res?.isTwoFactorEnabled) {
          localStorage.setItem('comeFromisTwoFactorEnabled', JSON.stringify({ isTwoFactorEnabled: true}))
          this.router.navigate(['/verify-otp']);
          this.spinnerService.hide();
        } else {
          // this.auth.saveToken(res?.token);
          // const decodedData = this.auth.decodeToken();
          // if (decodedData && decodedData.Permissions) {
          //   localStorage.setItem('departmentId', decodedData.DepartmentId);
          //   const permissions = decodedData.Permissions;
          //   localStorage.setItem('userName', decodedData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'])
          //   localStorage.setItem('permissions', JSON.stringify(permissions));
          //   localStorage.setItem('pages', JSON.stringify(decodedData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']));
          //   localStorage.setItem('userId', decodedData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
          // }
                  this.auth.GetMyProfile().subscribe({
                    next: async (profile: UserProfile) => {
                     await this.profileDb.saveProfile(profile);  
                     this.auth.setProfile(profile);
          
                      this.toastr.success(
                        this.translate.instant('OTP.VERIFY_SUCCESS'),
                        this.translate.instant('TOAST.TITLE.SUCCESS')
                      );
                      this.spinnerService.hide();
                      this.router.navigate(['/home']);
                    },
                    error: (err) => {
                      this.spinnerService.hide();
                      this.toastr.error(this.translate.instant('OTP.VERIFY_FAILED'), this.translate.instant('TOAST.TITLE.ERROR'));
                      console.debug('GetMyProfile error:', err);
                    }
                  });
          


          this.toastr.success(this.translate.instant('LOGIN.SUCCESS'), this.translate.instant('TOAST.TITLE.SUCCESS'));
          this.spinnerService.hide();
          this.router.navigate(['/home']);
        }

        // this.auth.saveToken(res?.token);
        // const decodedData = this.auth.decodeToken();
        // if (decodedData && decodedData.Permissions) {
        //   localStorage.setItem('departmentId', decodedData.DepartmentId);
        //   const permissions = decodedData.Permissions;
        //   localStorage.setItem('userName',decodedData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'])
        //   localStorage.setItem('permissions', JSON.stringify(permissions));
        //   localStorage.setItem('pages', JSON.stringify(decodedData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']));
        //   localStorage.setItem('userId', decodedData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
        // }

        // this.toastr.success(this.translate.instant('LOGIN.SUCCESS'), this.translate.instant('TOAST.TITLE.SUCCESS'));
        this.spinnerService.hide();
        // this.router.navigate(['/home']);
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
    var UAEPassURL = 'https://stg-id.uaepass.ae/idshub/authorize?response_type=code&client_id=sandbox_stage&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&redirect_uri=http://compassint.ddns.net:2036/login&acr_values=urn:safelayer:tws:policies:authentication:level:low';
    var LocalUAEPassURL = 'https://stg-id.uaepass.ae/idshub/authorize?response_type=code&client_id=sandbox_stage&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&redirect_uri=http://localhost:64088/login&acr_values=urn:safelayer:tws:policies:authentication:level:low';
    var ProdUAEPassURL = 'https://stg-id.uaepass.ae/idshub/authorize?response_type=code&client_id=ccc_web_stg&scope=urn:uae:digitalid:profile:general&state=Q9pOTvlchYARcSFL&redirect_uri=https://192.168.51.130:2002/login&acr_values=urn:safelayer:tws:policies:authentication:level:low';
    window.location.href = `${LocalUAEPassURL}&ui_locales=${this.currentlang}`;
  }



  uaepassCheckCode(code: string, state: string) {
    const params: LoginUAEPassDto = {
      code: code,
      state: state,
      lang: localStorage.getItem('lang')
    };

    this.spinnerService.show();

    this.auth.UAEPasslogin(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.auth.saveToken(res?.token);
          const decodedData = this.auth.decodeToken();

          if (decodedData) {
            if (decodedData.Permissions) {
              localStorage.setItem('permissions', JSON.stringify(decodedData.Permissions));
              localStorage.setItem('pages', JSON.stringify(decodedData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']));
              localStorage.setItem('userId', decodedData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
            }

            this.toastr.success(
              this.translate.instant('LOGIN.SUCCESS'),
              this.translate.instant('TOAST.TITLE.SUCCESS')
            );

            setTimeout(() => {
              this.spinnerService.hide();
              this.router.navigate(['/home']);
            }, 1500);

          } else {
            this.showErrorAndRedirect('AUTH.MESSAGES.INVALID_TOKEN_ERROR');
          }
        },
        error: (err) => {
          console.log('UAEPass Error:', err);

          const notVerifiedText = this.translate.instant('Common.notVerifiedUser');
          const errorMsg = err?.message || err?.reason || 'LOGIN.FAILED';

          if (errorMsg === notVerifiedText) {
            const modalElement = document.getElementById('notVerifiedUser');
            if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            }
            this.spinnerService.hide();
          } else {
            this.showErrorAndRedirect(errorMsg);
          }
        }
      });
  }

  private showErrorAndRedirect(messageKey: string) {
    alert(messageKey);
    this.toastr.error(
      this.translate.instant(messageKey),
      this.translate.instant('TOAST.TITLE.ERROR')
    );

    setTimeout(() => {
      this.spinnerService.hide();
      const redirectUri = window.location.origin + '/login';
      const logoutURL = `https://stg-id.uaepass.ae/idshub/logout?redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = logoutURL;
    }, 1500);
  }


  logout(): void {
    const logoutUrl = 'https://stg-id.uaepass.ae/idshub/logout?redirect_uri=' + encodeURIComponent(window.location.origin + '/login');
    window.location.href = logoutUrl;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
