import { OnInit, OnDestroy, inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

/**
 * Base class for components that manage tabs and respond to query parameters
 */
@Injectable()
export abstract class TabBasedComponentBase implements OnInit, OnDestroy {
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  
  abstract activeTab: string;
  abstract validTabs: string[];
  abstract defaultTab: string;
  
  private queryParamsSubscription?: Subscription;

  ngOnInit(): void {
    this.initializeTabFromQueryParams();
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  /**
   * Initialize tab state from query parameters
   */
  private initializeTabFromQueryParams(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && this.isValidTab(tab)) {
        this.setActiveTabInternal(tab);
      } else {
        // If no valid tab specified, use default
        this.setActiveTabInternal(this.defaultTab);
      }
    });
  }

  /**
   * Set the active tab and update URL
   */
  setActiveTab(tab: string): void {
    if (!this.isValidTab(tab)) {
      console.warn(`Invalid tab: ${tab}. Using default tab: ${this.defaultTab}`);
      tab = this.defaultTab;
    }

    this.setActiveTabInternal(tab);
    
    // Update the URL with the new tab parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Set the active tab without updating URL (internal use)
   */
  protected setActiveTabInternal(tab: string): void {
    this.activeTab = tab;
    // Call hook for derived classes
    this.onTabChanged(tab);
  }

  /**
   * Check if a tab is valid
   */
  isValidTab(tab: string): boolean {
    return this.validTabs.includes(tab);
  }

  /**
   * Get the current active tab
   */
  getActiveTab(): string {
    return this.activeTab;
  }

  /**
   * Get all valid tabs
   */
  getValidTabs(): string[] {
    return [...this.validTabs];
  }

  /**
   * Hook called when tab changes - override in derived classes
   */
  protected onTabChanged(tab: string): void {
    // Override in derived classes if needed
  }

  /**
   * Navigate to a specific tab programmatically
   */
  navigateToTab(tab: string): void {
    this.setActiveTab(tab);
  }

  /**
   * Check if a specific tab is currently active
   */
  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }
}
