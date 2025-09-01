import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const token = localStorage.getItem('access_token');
    
    const isAssetReq = req.url.includes('/assets/');
    if (token && !isAssetReq) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(cloned);
    }

    return next(req);
};
