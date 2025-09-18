import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private toastr: ToastrService, private t: TranslateService) {}

  private tr(key: string) { return this.t.instant(key); }
  private hasKey(key: string) { return this.tr(key) !== key; }

  warnBusiness(reason?: string, statusTitle?: string) {
    this.toastr.warning(
      reason ?? this.tr('ERRORS.GENERIC_BODY'),
      statusTitle ?? this.tr('ERRORS.BUSINESS_TITLE')
    );
  }

  errorHttp(status: number, message?: string) {
    const titleKey = `ERRORS.HTTP_${status}_TITLE`;
    const title = this.hasKey(titleKey) ? this.tr(titleKey) : this.tr('ERRORS.GENERIC_TITLE');
    this.toastr.error(message || this.tr('ERRORS.GENERIC_BODY'), title);
  }

  network() {
    this.toastr.error(this.tr('ERRORS.NETWORK_BODY'), this.tr('ERRORS.NETWORK_TITLE'));
  }
}
