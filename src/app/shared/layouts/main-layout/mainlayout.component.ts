import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationDto } from '../../../core/dtos/notifications/notification.dto';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, TranslateModule,CommonModule],
  templateUrl: 'main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = false;
  notifications: NotificationDto[] = [];
  unseenCount = 0;
  isNotificationDropdownOpen = false;

  selectedNotification: NotificationDto | null = null;

  constructor(
    private notificationService: NotificationService,
    public translate: TranslateService
    , private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // اشترك في آخر 30 إشعار (للأوفكانفس)
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => (this.notifications = list || []));

    // عدّاد غير المقروء
    this.notificationService.unseenCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => (this.unseenCount = count || 0));

    // حالة التحميل
    this.notificationService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => (this.loading = !!loading));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async markAsSeen(notification: NotificationDto): Promise<void> {
    if (!notification.isSeen) {
      try {
        const notificationId = notification.notificationId || notification.id;
        if (notificationId) {
          await this.notificationService.markAsSeen(notificationId);
          this.handleNotificationClick(notification);
        }
      } catch (error) {
        // Error marking notification as seen
      }
    }

    // Handle notification click - you can add navigation logic here
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

  closeNotificationDropdown(): void {
    this.isNotificationDropdownOpen = false;
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

  trackByNotificationId = (_: number, n: NotificationDto) => n.notificationId || n.id;

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

    onViewAllNotifications(): void {
    this.closeNotificationDropdown();
    this.router.navigate(['/notifications']);
  }

}
