import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, from, switchMap } from 'rxjs';
import { ApiError } from '../dtos/api-error.model';
import { NotificationService } from '../services/errorNotify.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  // circular DI
  const isAssetReq = req.url.includes('/assets/');
  if (isAssetReq) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const notify = injector.get(NotificationService);
      const router = injector.get(Router);

      // Network / CORS
      if (err.status === 0) {
        notify.network();
        return throwError(() => unify(err));
      }

      // Blob (application/problem+json  as Blob)
      if (err.error instanceof Blob) {
        return from(err.error.text()).pipe(
          switchMap(text => {
            let api: ApiError | null = null;
            try { api = JSON.parse(text) as ApiError; } catch {}
            showErrorAndMaybeRedirect(notify, router, err, api);
            return throwError(() => unify(err, api));
          })
        );
      }

      // JSON Object
      if (typeof err.error === 'object' && err.error) {
        const api = err.error as ApiError;
        showErrorAndMaybeRedirect(notify, router, err, api);
        return throwError(() => unify(err, api));
      }

      // String
      if (typeof err.error === 'string') {
        showErrorAndMaybeRedirect(notify, router, err, { reason: err.error } as ApiError);
        return throwError(() => unify(err, { reason: err.error }));
      }

      // Fallback
      showErrorAndMaybeRedirect(notify, router, err, null);
      return throwError(() => unify(err));
    })
  );
};

// --- Helpers ---

/**
 * show message and if the 403 return to /nopermission
 */
function showErrorAndMaybeRedirect(
  notify: NotificationService,
  router: Router,
  httpErr: HttpErrorResponse,
  api: ApiError | null
) {
  const reason = api?.reason?.toString().trim();
  const statusTitle = api?.status?.toString().trim();


  if (httpErr.status === 400 && (reason || statusTitle)) {
    notify.warnBusiness(reason, statusTitle);
    return;
  }

  // ===  403 ===
  if (httpErr.status === 403) {
    const msg = reason || statusTitle || "Permission denied.";
    notify.errorHttp(403, msg);

    setTimeout(() => {
      if (router.url !== '/no-permission') {
        router.navigate(['/no-permission']);
      }
    }, 0);

    return;
  }

  // general case to show error message
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
