import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileDbService } from '../../services/profile-db.service';

export const authGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const profileDb = inject(ProfileDbService);

  let profile = auth.snapshot;

  if (!profile) {
    profile = await profileDb.getProfile();
    if (profile) {
      auth.setProfile(profile);
    }
  }

  if (!profile || !profile.userId) {
    return router.createUrlTree(['/login']);
  }

  const permissions = Array.isArray(profile.permissions) ? profile.permissions : [];
  const permissionsPages = Array.isArray(profile.pages) ? profile.pages : [];

  const requiredPermission = route.data?.['permission'] ?? null;
  const requiredPagePermission = route.data?.['pagePermission'] ?? null;

  if (requiredPagePermission) {
    return permissionsPages.includes(requiredPagePermission)
      ? true
      : router.createUrlTree(['/no-permission']);
  }

  if (requiredPermission === 'Main') {
    return true;
  }

  if (requiredPermission) {
    return permissions.includes(requiredPermission)
      ? true
      : router.createUrlTree(['/no-permission']);
  }

  return false;
};
