import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RegionsComponentComponent } from '../regions-component/regions-component.component';
import { LocationsComponentComponent } from '../locations-component/locations-component.component';
import { AvailableNumberComponent } from '../available-number/available-number.component';
import { ContactInformationComponent } from '../contact-information/contact-information.component';
import { AttachmentsConfigComponent } from '../attachments-config/attachments-config.component';
import { InitiativeComponentComponent } from '../initiative-component/initiative-component.component';
import { PollsComponentComponent } from '../polls-component/polls-component.component';
import { HeroSectionSettingComponent } from '../hero-section-setting/hero-section-setting.component';

@Component({
  selector: 'app-setting-regions-component',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RegionsComponentComponent,
    LocationsComponentComponent,
    AvailableNumberComponent,
    ContactInformationComponent,
    AttachmentsConfigComponent,
    InitiativeComponentComponent,
    PollsComponentComponent,
    HeroSectionSettingComponent
  ],
  templateUrl: './setting-regions-component.component.html',
  styleUrl: './setting-regions-component.component.scss',
})
export class SettingRegionsComponentComponent implements OnInit, OnDestroy {
  activeTab: 'regions' | 'locations' | 'other' | 'contact-information' | 'attachments-config' | 'initiatives' | 'polls' | 'hero-section-setting' =
    'regions';

  private queryParamsSubscription?: Subscription;
  private validTabs = ['regions', 'locations', 'other', 'contact-information', 'attachments-config', 'initiatives', 'polls', 'hero-section-setting'];
  showTab : boolean = false ;
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to query parameters to handle tab navigation
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && this.validTabs.includes(tab)) {
        this.activeTab = tab as typeof this.activeTab;
      } else {
        // If no valid tab specified, default to 'regions'
        this.activeTab = 'regions';
      }

      if (tab == 'other' ||tab == 'locations'  || tab == 'regions'  ) {
        this.showTab = true;
      }else{
        this.showTab = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  setActiveTab(tab: 'regions' | 'locations' | 'other' | 'contact-information' | 'attachments-config' | 'initiatives' | 'polls' | 'hero-section-setting') {
    this.activeTab = tab;
    
    // Update the URL with the new tab parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Check if a tab is valid
   */
  isValidTab(tab: string): boolean {
    return this.validTabs.includes(tab);
  }

  /**
   * Get the default tab
   */
  getDefaultTab(): string {
    return 'regions';
  }
}
