import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const permissionsPages = JSON.parse(localStorage.getItem('pages') || '[]');
  const requiredPermission = route.data['permission'] || null;
  const requiredpagePermission = route.data['pagePermission'] || null;

  if (requiredpagePermission) {
    if (permissionsPages.includes(requiredpagePermission)) {
      return true;
    } else {
      router.navigate(['/no-permission']);
      return false;
    }
  } else if (requiredPermission == 'Main') {
    return true;

  } else if (requiredPermission) {

    if (permissions.includes(requiredPermission)) {
      return true;
    } else {
      router.navigate(['/no-permission']);
      return false;
    }
  } else {
    return false;
  }
};
