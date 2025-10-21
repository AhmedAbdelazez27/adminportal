import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpinnerService } from '../../../core/services/spinner.service';
import { UserService } from '../../../core/services/user.service';
import { confirmPasswordValidator } from '../../customValidators/confirmPasswordValidator';
import { ExportToolbarComponent } from '../../../../shared/export-toolbar/export-toolbar.component';
import { ProfileDbService } from '../../../core/services/profile-db.service';
import { ApiEndpoints } from '../../../core/constants/api-endpoints';

import { NotificationService } from '../../../core/services/notification.service';
import { NotificationDto} from '../../../core/dtos/notifications/notification.dto';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ExportToolbarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  providers: [ToastrService]
})
export class NavbarComponent implements OnInit {
  open = false;
  private timeoutId: any;
  changePasswordForm: FormGroup;
  showCurrentPassword: boolean = false;
  showPassword: boolean = false;
  showCPassword: boolean = false;
  submitted: boolean = false;
  currentLang: string = 'en';
  userName: string = "";
  notifications: NotificationDto[] = [];
  unseenCount = 0;
  loading = false;
  isNotificationDropdownOpen = false;
  
  private destroy$ = new Subject<void>();
  private isSubscribed = false; // Prevent duplicate subscripti

  constructor(public translation: TranslationService, private authService: AuthService, private toastr: ToastrService, private fb: FormBuilder, private spinnerService: SpinnerService,
    private translate: TranslateService, private userService: UserService, private profileDb: ProfileDbService, private router: Router,private notificationService: NotificationService) {


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

ngOnInit(): void {
  // (اختياري) تحميل اسم المستخدم من كاشك الحالي
  this.profileDb.getProfile().then(cached => this.userName = cached?.userName ?? '');

  // راقب حالة الأوث زي السيرفيس بورتال
  this.authService.user$
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      this.userName = user?.userName ?? '';

      if (user?.userId) {
        // Logged in
        if (!this.isSubscribed) {
          this.subscribeToNotifications();   // اشتراك واحد للإشعارات والعداد
          this.isSubscribed = true;
        }
        this.ensureUserSessionInitialized();  // طلب إذن + تهيئة جلسة الإشعارات
        this.setupPageFocusListener();        // تحديث عند الرجوع للفوكس
      } else {
        // Logged out
        this.notifications = [];
        this.unseenCount = 0;
        this.isNotificationDropdownOpen = false;
        this.isSubscribed = false;
        this.notificationService.clearNotifications(); // يفضّل تصفير الخدمة
      }
    });

  // حافظ على نفس منطق اللغة
  this.translate.onLangChange
    .pipe(takeUntil(this.destroy$))
    .subscribe(lang => {
      this.currentLang = lang.lang;
      // (اختياري) أي تأثير مرتبط باللغة
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
  // hasPermission(permission: string): boolean {
  //   const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  //   const result = permissions.includes(permission);

  //   return result;
  // }
  // hasPagePermission(pagePermission: string): boolean {
  //   const pages = JSON.parse(localStorage.getItem('pages') || '[]');
  //   return pages.includes(pagePermission);
  // }
  hasPermission(code: string) {
    return (this.authService.snapshot?.permissions ?? []).includes(code);
  }
  hasPagePermission(code: string) {
    return (this.authService.snapshot?.pages ?? []).includes(code);
  }

  hasAnyAuthenticationPermission(): boolean {
    // const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    // console.log('Authentication permissions check:', {
    //   permissions: permissions,
    //   hasRoleView: this.hasPermission('Role.View'),
    //   hasUserView: this.hasPermission('User.View'),
    //   hasEntityView: this.hasPermission('Entity.View'),
    //   hasDepartmentsView: this.hasPermission('Departments.View')
    // });
    return this.hasPermission('Role.View') ||
      this.hasPermission('User.View') ||
      this.hasPermission('Entity.View') ||
      this.hasPermission('Departments.View') ||
      this.hasPermission('DataTransLogs.View');
  }

  hasAnyFinancialPermission(): boolean {
    return this.hasPermission('VwApInvoiceHd.View') ||
      this.hasPermission('GlJeHeader.View') ||
      this.hasPermission('ApMiscPaymentHeader.View') ||
      this.hasPermission('ArMiscReciptHeader.View') ||
      this.hasPermission('ApPaymentTransactionsHdr.View') ||
      this.hasPermission('ApVendor.View') ||
      this.hasAnyFinancialReportsPermission() ||
      this.hasAnyFinancialChartsPermission();
  }

  hasAnySponsorshipPermission(): boolean {
    return this.hasPermission('SpCasesPayment.View') ||
      this.hasPermission('SpBeneficents.View') ||
      this.hasPermission('SpContracts.View') ||
      this.hasPermission('SpCases.View') ||
      this.hasPermission('BeneficentsRpt.View') ||
      this.hasPermission('CaseSearchRpt.View') ||
      this.hasPermission('BenifcientTotalRpt.View') ||
      this.hasPermission('CaseAidEntitiesRpt.View') ||
      this.hasPermission('CaseSearchListRpt.View');
  }

  hasAnySocialCasesPermission(): boolean {
    return this.hasPermission('AidRequest.View') ||
      this.hasPermission('SpCases.View') ||
      this.hasPermission('OrdersListRpt.View') ||
      this.hasPermission('CasesEntitiesRpt.View') ||
      this.hasPermission('CaseAidEntitiesRpt.View');
  }

  hasAnyProjectsPermission(): boolean {
    return this.hasPermission('ScProject.View') ||
      this.hasPermission('ProjectsHdr.View');
  }

  hasAnyServicesPermission(): boolean {
    return this.hasPermission('ServiceRequestsDetailsRpt.View') ||
      this.hasPermission('TotalServiceRequestsRpt.View') ||
      this.hasPermission('Services.View') ||
      this.hasPermission('MainApplyRequestService.View');
  }

  hasAnyFinancialReportsPermission(): boolean {
    return this.hasPermission('CatchReceiptRpt.View') ||
      this.hasPermission('GeneralGlJournalRpt.View') ||
      this.hasPermission('BalanceReviewRpt.View') ||
      this.hasPermission('ReceiptRpt.View') ||
      this.hasPermission('VendorsPayRpt.View') ||
      this.hasPermission('TotalBenDonationsRpt.View');
  }

  hasAnyFinancialChartsPermission(): boolean {
    return this.hasPermission('FinancialCharts.View') ||
      this.hasPermission('RevenueAndExpensesCharts.View') ||
      this.hasPermission('ReceiptPaymentCharts.View') ||
      this.hasPermission('ReceiptsAndPaymentsCharts.View') ||
      this.hasPermission('RevenueComparisonCharts.View');
  }
  hasAnyFinancialComparisonChartsPermission(): boolean {
    return this.hasPermission('ReceiptsComparisonCharts.View') ||
      this.hasPermission('PaymentsComparisonCharts.View')
  }
  hasAnyFinancialExpensesRevenueComparisonChartsPermission(): boolean {
    return this.hasPermission('RevenueComparisonCharts.View') ||
      this.hasPermission('ExpensesComparisonCharts.View')
  }
  hasAnyGeneralSettingsPermission(): boolean {
    return this.hasPermission('Attachment.View') ||
      this.hasPermission('ContactInformation.View') ||
      this.hasPermission('Initiative.View') ||
      this.hasPermission('HeroSectionSetting.View') ||
      this.hasPermission('AvailableNumber.View') ||
      this.hasPermission('Location.View') ||
      this.hasPermission('Region.View');
  }

  logout() {
    this.authService.logout().subscribe({
      next: (res) => {
        console.log("reslogout  ___ ", res);

        this.toastr.success('You have been logged out', 'Success');
        const redirectUri = window.location.origin + '/login';
        const logoutURL = `${ApiEndpoints.UAE_PASS_CONFIG.baseUrl}/logout?redirect_uri=${encodeURIComponent(redirectUri)}`;
        setTimeout(() => (window.location.href = logoutURL), 500);
       // this.router.navigate(['/login']);
      },
      error: () => {
        this.toastr.error('Logout failed', 'Error');
      }
    });
  }
  // change password
  showPasswordMatch(): boolean {
    const pass = this.changePasswordForm.get('password')?.value;
    const confirm = this.changePasswordForm.get('confirmPassword')?.value;

    return pass && confirm && pass === confirm && !this.changePasswordForm.get('confirmPassword')?.errors?.['mismatch'];
  }

  submitChangePassword(): void {
    this.submitted = true;

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


  // starting notifications 
  
  /**
   * ✅ NEW: Ensure user session is initialized (called once per login session)
   * This replaces the old startNotificationPolling approach
   */
  private async ensureUserSessionInitialized(): Promise<void> {
    try {
      // Check if session is already initialized for current user
      const isSessionInitialized = this.notificationService.isSessionInitialized();
      const currentUserId = this.authService.getUserId();
      const serviceUserId = this.notificationService.getCurrentUserId();

      // Only initialize if not already initialized for this user
      if (!isSessionInitialized || currentUserId !== serviceUserId) {
        await this.notificationService.initializeUserSession();
      }
    } catch (error) {
      // Error ensuring user session initialized
    }
  }


    isLoggedIn(): boolean {
    // snapshot بيتحدّث من الـ AuthService بعد hydrate + أي setProfile
    return !!this.authService.snapshot?.userId || this.authService.isLoggedIn();
  }
  /**
   * ✅ OPTIMIZED: Refresh notifications only when user returns to the page AND cache is stale
   * This ensures users see new notifications without constant API calls
   */
  @HostListener('window:focus', [])
  onPageFocus(): void {
    if (this.isLoggedIn()) {
      // This will only refresh if cache is stale (older than 5 minutes)
      this.notificationService.refreshOnEvent('focus');
    }
  }

  /**
   * Setup smart page focus handling
   */
  private setupPageFocusListener(): void {
    // Additional focus handling can be added here if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.isSubscribed = false; // Reset subscription flag
  }

  private subscribeToNotifications(): void {
    // Subscribe to notifications
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications || [];
        console.log("this.notifications ",this.notifications);
        
      });

    // Subscribe to unseen count
    this.notificationService.unseenCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        const previousCount = this.unseenCount;
        this.unseenCount = count || 0;
        console.log("unseenCount = ", this.unseenCount);
        
      });

    // Subscribe to loading state
    this.notificationService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading || false;
      });
  }

  /**
   * ✅ OPTIMIZED: Smart dropdown toggle with session-aware loading
   */
  async toggleNotificationDropdown(): Promise<void> {
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;

    // ✅ Only ensure notifications are loaded when opening dropdown
    if (this.isNotificationDropdownOpen) {
      try {
        // First ensure session is initialized
        await this.ensureUserSessionInitialized();

        // Uses cache-first approach - only fetches if cache is empty or stale (5+ minutes old)
        await this.notificationService.ensureNotificationsLoaded();
      } catch (error) {
        // Error ensuring notifications are loaded
      }
    }
  }

  closeNotificationDropdown(): void {
    this.isNotificationDropdownOpen = false;
  }

  async markAsSeen(notification: NotificationDto): Promise<void> {
    if (!notification.isSeen) {
      try {
        const notificationId = notification.notificationId || notification.id;
        if (notificationId) {
          await this.notificationService.markAsSeen(notificationId);
        }
      } catch (error) {
        // Error marking notification as seen
      }
    }

    // Handle notification click - you can add navigation logic here
    this.handleNotificationClick(notification);
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(notification: NotificationDto): void {
    // Close the dropdown
    this.closeNotificationDropdown();

    // You can add navigation logic based on notification type
    // For example, navigate to specific pages based on workFlowStepsId
    if (notification.workFlowStepsId) {
      // Navigate based on workflow step
      // this.router.navigate(['/service-details', notification.workFlowStepsId]);
    }

    // Show a toast message for now
    this.toastr.info(
      `Notification: ${this.getNotificationTitle(notification)}`,
      'Notification Clicked'
    );
  }

  async markAllAsSeen(): Promise<void> {
    if (!this.notifications) {
      return;
    }

    const unseenNotifications = this.notifications.filter(n => !n.isSeen);

    for (const notification of unseenNotifications) {
      try {
        const notificationId = notification.notificationId || notification.id;
        if (notificationId) {
          await this.notificationService.markAsSeen(notificationId);
        }
      } catch (error) {
        // Error marking notification as seen
      }
    }
  }

  /**
   * ✅ OPTIMIZED: Manual refresh triggered by user action (bypasses cache)
   */
  async refreshNotifications(): Promise<void> {
    try {
      // Force refresh regardless of cache status
      await this.notificationService.refreshNotifications();
    } catch (error) {
      // Error refreshing notifications
    }
  }

  getNotificationTitle(notification: NotificationDto): string {
    // Return Arabic or English title based on current language
    const currentLang = localStorage.getItem('currentLang') || 'en';
    return currentLang === 'ar' ? notification.titleAr : notification.titleEn;
  }

  getNotificationMessage(notification: NotificationDto): string {
    // Return Arabic or English message based on current language
    const currentLang = localStorage.getItem('currentLang') || 'en';
    const message = currentLang === 'ar' ? notification.messageAr : notification.messageEn;
    return message || '';
  }

  formatDate(date: Date | string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  }

  trackByNotificationId(index: number, notification: NotificationDto): string {
    return notification.notificationId || notification.id || `notification-${index}`;
  }

  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const notificationContainer = target.closest('.notification-container');

    // Close dropdown if clicking outside the notification container
    if (!notificationContainer && this.isNotificationDropdownOpen) {
      this.closeNotificationDropdown();
    }
  }

  /**
   * Handle "View All" notifications button click
   */
  onViewAllNotifications(): void {
    // Close the dropdown
    this.closeNotificationDropdown();

    // Navigate to a notifications page or show all notifications
    // You can implement this based on your routing structure
    this.router.navigate(['/notifications']);

    // Alternative: Show a toast message if no dedicated page exists
    // this.toastr.info('Viewing all notifications', 'Notifications');
  }



  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef<HTMLDivElement>;

  closeNavbar() {
    if (window.innerWidth < 992 && this.navbarCollapse) {
      const el = this.navbarCollapse.nativeElement;
      if (!el.classList.contains('show')) return;


      const startHeight = el.scrollHeight;
      el.style.height = startHeight + 'px';
      el.style.overflow = 'hidden';
      el.style.transition = 'height 300ms ease';

      void el.offsetHeight;

      el.style.height = '0px';

      const onEnd = () => {
        el.style.removeProperty('height');
        el.style.removeProperty('overflow');
        el.style.removeProperty('transition');
        el.classList.remove('show');
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);

      const toggler = document.querySelector<HTMLButtonElement>('.navbar-toggler[aria-controls="navbarSupportedContent"]');
      if (toggler) toggler.setAttribute('aria-expanded', 'false');
    }
  }



}
