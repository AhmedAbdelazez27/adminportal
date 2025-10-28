import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const loginGuard: CanActivateFn = () : boolean | UrlTree => {
  const router = inject(Router);
  const auth = inject(AuthService);
  let isLogin ;
 auth.user$.subscribe(p => {
      isLogin = p?.userId ? true : false ;
    });

  if (!isLogin) return true;
  try {
    // const payload = JSON.parse(atob(token.split('.')[1]));
    // const expMs = (payload?.exp ?? 0) * 1000;
    // return Date.now() < expMs ? router.createUrlTree(['/home']) : true;
    router.navigate(['/home']);
    return false;
  } catch { return true; }
};
     