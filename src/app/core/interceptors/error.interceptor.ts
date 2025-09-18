import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, throwError, from, switchMap } from 'rxjs';
import { ApiError } from '../dtos/api-error.model';
import { NotificationService } from '../services/errorNotify.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  // مهم: لا تعترض ملفات الترجمة/الأصول لكسر الـ circular DI
  const isAssetReq = req.url.includes('/assets/');
  if (isAssetReq) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // نجيب NotificationService عند الحاجة فقط (lazy) لتجنّب الدائرة
      const notify = injector.get(NotificationService);

      // Network / CORS
      if (err.status === 0) {
        notify.network();
        return throwError(() => unify(err));
      }

      // Blob
      if (err.error instanceof Blob) {
        return from(err.error.text()).pipe(
          switchMap(text => {
            let api: ApiError | null = null;
            try { api = JSON.parse(text) as ApiError; } catch {}
            showError(notify, err, api);
            return throwError(() => unify(err, api));
          })
        );
      }

      // JSON Object
      if (typeof err.error === 'object' && err.error) {
        const api = err.error as ApiError;
        showError(notify, err, api);
        return throwError(() => unify(err, api));
      }

      // String
      if (typeof err.error === 'string') {
        showError(notify, err, { reason: err.error });
        return throwError(() => unify(err, { reason: err.error }));
      }

      // Fallback
      showError(notify, err, null);
      return throwError(() => unify(err));
    })
  );
};

// --- Helpers ---
function showError(notify: NotificationService, httpErr: HttpErrorResponse, api: ApiError | null) {
  const reason = api?.reason?.toString().trim();
  const statusTitle = api?.status;

  // أخطاء Business (من الباك راجعة مترجمة) كتحذير
  if (httpErr.status === 400 && (reason || statusTitle)) {
    notify.warnBusiness(reason, statusTitle);
    return;
  }

  const msg = reason || statusTitle || httpErr.message;
  notify.errorHttp(httpErr.status, msg);
}

function unify(httpErr: HttpErrorResponse, api?: ApiError | null) {
  return {
    httpStatus: httpErr.status,
    url: httpErr.url ?? undefined,
    backend: api ?? undefined,
    message: api?.reason || api?.status || api?.note || httpErr.message
  };
}
