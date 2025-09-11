import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ShortcutDto, CreateShortcutDto } from '../../dtos/shortcut/shortcut.dto';
import { EnhancedRouteMappingService } from './enhanced-route-mapping.service';

@Injectable({
  providedIn: 'root'
})
export class ShortcutService {
  private readonly BASE_URL = `${environment.apiBaseUrl}/Shortcut`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private routeMappingService: EnhancedRouteMappingService
  ) { }

  // Get all shortcuts for the current user
  getAll(): Observable<ShortcutDto[]> {
    return this.http.get<ShortcutDto[]>(`${this.BASE_URL}/GetAll`);
  }

  // Create or update shortcuts in bulk
  createRange(shortcuts: CreateShortcutDto[]): Observable<ShortcutDto[]> {
    return this.http.post<ShortcutDto[]>(`${this.BASE_URL}/CreateRange`, shortcuts);
  }

  // Delete a shortcut by ID
  delete(id: number): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/Delete/${id}`, {});
  }

  /**
   * Navigate to a shortcut using enhanced route mapping
   */
  navigateToShortcut(shortcut: ShortcutDto): Promise<boolean> {
    const navigationPath = this.routeMappingService.getNavigationPath(shortcut.pageName);
    
    if (navigationPath) {
       
      if (navigationPath.queryParams) {
        return this.router.navigate([navigationPath.path], { 
          queryParams: navigationPath.queryParams 
        });
      } else {
        return this.router.navigate([navigationPath.path]);
      }
    } else {
      // Fallback navigation
      console.warn(`No route mapping found for ${shortcut.pageName}, using fallback`);
      const fallbackRoute = this.routeMappingService.getFallbackRoute(shortcut.pageName);
      return this.router.navigate([fallbackRoute]);
    }
  }

  /**
   * Get route information for a shortcut
   */
  getShortcutRouteInfo(pageName: string): { path: string; queryParams?: any } | null {
    return this.routeMappingService.getNavigationPath(pageName);
  }

  /**
   * Check if a shortcut is valid for navigation
   */
  isValidShortcut(pageName: string): boolean {
    return this.routeMappingService.isValidNavigation(pageName);
  }

  /**
   * Get all available page names for shortcuts
   */
  getAvailablePageNames(): string[] {
    return this.routeMappingService.getAllPageNames();
  }
}
