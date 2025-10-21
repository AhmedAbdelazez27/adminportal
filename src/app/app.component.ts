import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { TranslationService } from './core/services/translation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { confirmPasswordValidator } from './shared/customValidators/confirmPasswordValidator';
import { SpinnerService } from './core/services/spinner.service';
import { UserService } from './core/services/user.service';
import { AuthService } from './core/services/auth.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  imports: [TranslateModule, RouterModule, NgxSpinnerModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit , OnDestroy{
  @ViewChild('customSpinner', { static: true }) customSpinnerTemplate!: TemplateRef<any>;
  currentLang: string = 'en';

  changePasswordForm: FormGroup;
  showCurrentPassword: boolean = false;
  showPassword: boolean = false;
  showCPassword: boolean = false;
  submitted: boolean = false;
  private destroy$ = new Subject<void>();
  private lastLoggedInUserId: string | null = null;

  constructor(public translation: TranslationService, private spinner: NgxSpinnerService, private toastr: ToastrService, private fb: FormBuilder, private translate: TranslateService, private spinnerService: SpinnerService, private userService: UserService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router) {


    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(1)]],
      newPassword: ['', [Validators.required, Validators.minLength(1)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(1)]]
    }, {
      validators: confirmPasswordValidator('newPassword', 'confirmPassword')
    });

    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';

    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.currentLang = lang.lang;
      });



  }
  ngOnInit(): void {
    // Setup authentication state monitoring for session-based initialization
    this.setupAuthStateMonitoring();

    // Initialize notifications for current session if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.initializeUserNotificationSession();
    }
  }

  /**
   * Setup monitoring of authentication state and route changes
   * This ensures notifications are initialized when user logs in
   */
  private setupAuthStateMonitoring(): void {
    // Monitor route changes to detect login/logout
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.checkAndInitializeNotificationSession();
      });
  }

  /**
   * Check current auth state and initialize notification session if needed
   */
  private checkAndInitializeNotificationSession(): void {
    const currentUserId = this.authService.getUserId();
    const isLoggedIn = this.authService.isLoggedIn();

    // Check if user logged in (new session or different user)
    if (isLoggedIn && currentUserId && currentUserId !== this.lastLoggedInUserId) {
      console.log('🔔 New user session detected:', currentUserId);
      this.initializeUserNotificationSession();
      this.lastLoggedInUserId = currentUserId;
    }
    // Check if user logged out
    else if (!isLoggedIn && this.lastLoggedInUserId) {
      console.log('🔔 User session ended');
      this.lastLoggedInUserId = null;
      // Notification service will be cleared by navbar component on logout
    }
  }

  /**
   * Initialize user notification session (called once per login session)
   */
  private async initializeUserNotificationSession(): Promise<void> {
    try {
      console.log('🔔 App-level: Initializing user notification session...');

      // Request notification permission if needed
      const permissionGranted = await this.notificationService.requestPermission();

      if (permissionGranted) {
        console.log('🔔 Notification permission granted');

        // Initialize the user session (this will only run once per session)
        await this.notificationService.initializeUserSession();

        // Setup global notification listeners (once per session)
        this.setupGlobalNotificationListeners();
      } else {
        console.warn('🔔 Notification permission denied');
      }
    } catch (error) {
      console.error('🔔 Error initializing user notification session:', error);
    }
  }

  /**
   * Setup global notification listeners (called once per session)
   */
  private setupGlobalNotificationListeners(): void {
    // Only setup if not already listening for this session
    if (this.lastLoggedInUserId === this.authService.getUserId()) {
      // Subscribe to notification updates for global app behavior
      this.notificationService.notifications$
        .pipe(takeUntil(this.destroy$))
        .subscribe(notifications => {
          console.log('🔔 App received notifications update:', notifications?.length || 0);
          // You can add global notification handling here (e.g., update window title badge)
        });

      // Subscribe to unseen count updates for global app behavior
      this.notificationService.unseenCount$
        .pipe(takeUntil(this.destroy$))
        .subscribe(count => {
          console.log('🔔 App received unseen count update:', count);
          // You can update global UI elements here (e.g., page title, favicon badge)
          this.updatePageTitle(count);
        });
    }
  }

  /**
   * Update page title with notification count
   */
  private updatePageTitle(unseenCount: number): void {
    const baseTitle = 'CCC Services Portal';
    if (unseenCount > 0) {
      document.title = `(${unseenCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
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

    ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
