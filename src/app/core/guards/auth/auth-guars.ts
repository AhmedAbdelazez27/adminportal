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
  const requiredPermission = route.data['permission'];  

  if (permissions.includes(requiredPermission)) {
    return true;
  } else {
    router.navigate(['/no-permission']);
    return false;
  }
};
