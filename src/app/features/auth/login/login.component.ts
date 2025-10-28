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
import { ApiEndpoints } from '../../../core/constants/api-endpoints';
declare var bootstrap: any;
type ModalMode = 'login';

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
  modalMode: ModalMode = 'login';

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
      const code = params['code'];
      const state = params['state'];
      this.uaePassParams = { code, state, lang: this.lang };
      if (code != undefined || state != undefined) {
        if (this.isValidCodeState(this.uaePassParams)) {
          this.spinnerService.show();
          this.getUAEPassInfo(this.uaePassParams);
        } else {
  
          this.translate
            .get(['COMMON.UAEPassCancelRequest'])
            .subscribe(translations => {
              this.toastr.error(translations['COMMON.UAEPassCancelRequest']);
            });

          setTimeout(() => {
            this.redirectToLogout();
            this.spinnerService.hide();
          }, 2000);
        }
      }
    });

    //this.route.queryParams.subscribe(params => {
    //  this.code = params['code'];
    //  this.state = params['state'];

    //  if (this.state != undefined || this.code != undefined) {
    //    if (this.isValidCodeState(this.code, this.state)) {
    //      this.uaepassCheckCode(this.code!, this.state!);
    //    } else {
    //      const redirectUri = window.location.origin + '/login';
    //      const logoutURL = 'https://stg-id.uaepass.ae/idshub/logout?redirect_uri=' + encodeURIComponent(redirectUri);
    //      const prodlogoutUrl = 'https://id.uaepass.ae/idshub/logout?redirect_uri=' + encodeURIComponent(redirectUri);
    //      this.translate
    //        .get(['Common.UAEPassCancelRequest'])
    //        .subscribe(translations => {
    //          this.toastr.error(translations['Common.UAEPassCancelRequest']);
    //        });

    //      setTimeout(() => {
    //        window.location.href = prodlogoutUrl;
    //        this.spinnerService.hide();
    //      }, 2000);
    //    }
    //  }
    //});
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.spinnerService.show();

    this.auth.login(this.form.value).subscribe({
      next: (res) => {
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

  loginByUAEPass(): void {
    this.modalMode = 'login';
    this.redirectToUAEPass();
  }

  private redirectToUAEPass(): void {
    this.spinnerService.show();

    const config = ApiEndpoints.UAE_PASS_CONFIG.getURLCredention;
    const baseUrl = ApiEndpoints.UAE_PASS_CONFIG.baseUrl;

    const uaePassURL =
      `${baseUrl}/authorize` +
      `?response_type=code` +
      `&client_id=${config.clientId}` +
      `&scope=urn:uae:digitalid:profile:general` +
      `&state=${config.clientsecret}` +
      `&redirect_uri=${encodeURIComponent(config.redirectUri)}` +
      `&acr_values=urn:safelayer:tws:policies:authentication:level:low` +
      `&ui_locales=${this.lang}`;

    sessionStorage.setItem('uae_pass_mode', this.modalMode);
    sessionStorage.setItem('uae_pass_state', config.clientsecret);

    window.location.href = uaePassURL;
  }

  getUAEPassInfo(params: LoginUAEPassDto): void {
    const storedState = sessionStorage.getItem('uae_pass_state');

    if (storedState && storedState !== params.state) {
      this.toastr.error('Security validation failed', 'Error');
      this.spinnerService.hide();
      return;
    }

    const storedMode = sessionStorage.getItem('uae_pass_mode') as ModalMode;
    if (storedMode) this.modalMode = storedMode;

    switch (this.modalMode) {
      case 'login':
        this.handleUAEPassLogin(params);
        break;
    }

    sessionStorage.removeItem('uae_pass_mode');
    sessionStorage.removeItem('uae_pass_state');
  }

  private handleUAEPassLogin(params: LoginUAEPassDto): void {
    this.auth.UAEPasslogin(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.handleLoginSuccess(res);
          this.spinnerService.hide();
        },
        error: (err) => {
          this.handleUAEPassError(err);
          this.spinnerService.hide();
        }
      });
  }


  private handleLoginSuccess(res: any): void {
    if (res?.isTwoFactorEnabled) {
      localStorage.setItem('comeFromisTwoFactorEnabled', JSON.stringify({ isTwoFactorEnabled: true }))
      this.router.navigate(['/verify-otp']);
      this.spinnerService.hide();
    } else {
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
        }
      });
      this.toastr.success(this.translate.instant('LOGIN.SUCCESS'), this.translate.instant('TOAST.TITLE.SUCCESS'));
      this.spinnerService.hide();
      this.router.navigate(['/home']);
    }
    this.spinnerService.hide();
  }


  private handleUAEPassError(err: any): void {
    const notVerifiedText = this.translate.instant('Common.notVerifiedUser');
    const message = err.message.message || err.backend.reason || 'UAE Pass authentication failed';

    if (message === notVerifiedText) {
      const modalElement = document.getElementById('notVerifiedUser');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
      this.spinnerService.hide();
    } else {
      this.toastr.error(this.translate.instant(message), this.translate.instant('TOAST.TITLE.ERROR'));
      this.redirectToLogout();
    }
    this.spinnerService.hide();
  }

  private redirectToLogout(): void {
    const redirectUri = window.location.origin + '/login';
    const logoutURL = `${ApiEndpoints.UAE_PASS_CONFIG.baseUrl}/logout?redirect_uri=${encodeURIComponent(redirectUri)}`;
    setTimeout(() => (window.location.href = logoutURL), 2000);
  }

  logout(): void {
    this.redirectToLogout();
  }

  isValidCodeState(params: any): boolean {
    return !!(params.code && params.state && params.code.trim() !== '' && params.state.trim() !== '');
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
