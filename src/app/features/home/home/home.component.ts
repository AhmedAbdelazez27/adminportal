import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HomeService, HomeKpiApiItem } from '../../../core/services/home.service';
import { ShortcutService } from '../../../core/services/shortcut/shortcut.service';
import { RouteMappingValidatorService } from '../../../core/services/shortcut/route-mapping-validator.service';
import { ShortcutDto, CreateShortcutDto } from '../../../core/dtos/shortcut/shortcut.dto';
import { PieChartComponent } from "../../../../shared/charts/pie-chart/pie-chart.component";
import { BarChartComponent } from "../../../../shared/charts/bar-chart/bar-chart.component";
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { HomeTotalRequestSummaryDto, HomeRequestSummaryDto } from '../../../core/dtos/home/home-request-summary.dto';
import { ChartUtilsService } from '../../../../shared/services/chart-utils.service';

interface ChartDataItem {
  chartTitle: string;
  chartType: string;
  module: string;
  data: Array<{
    id: string;
    nameAr: string;
    nameEn: string | null;
    value1: number;
    value2: number;
  }>;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, BarChartComponent, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  kpiItems: HomeKpiApiItem[] = [];
  charts: any[] = [];
  chartData: any[] = [];   
  chartsRawData: ChartDataItem[] = [];  
  processedCharts: any[] = [];  

  // Shortcuts properties
  shortcuts: ShortcutDto[] = [];
  availableShortcuts: ShortcutDto[] = [];
  selectedShortcuts: string[] = [];
  isLoadingShortcuts = false;
  isSavingShortcuts = false;
  isDeletingShortcut = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  showValidationMessage = false;
  showShortcutModal = false;
  errorMessage = '';

  categories: string[] = [];
  seriesData: any[] = [];
  kpiCards: Array<{
    topLabel: string;
    topValueStr?: string | null;
    topValueNum?: number | null;
    bottomLabel: string;
    bottomValueStr?: string | null;
    bottomValueNum?: number | null;
    progressPercent: number;
    color: 'purple'|'blue'|'red'|'teal';
  }>=[];
  currentYear: number = new Date().getFullYear();
  currentLang: string = 'en';
  totalRequests: number = 0;
  completedPercentage: number = 0;
  
  // Request summary properties
  requestSummaryData: HomeTotalRequestSummaryDto | null = null;
  requestSummaryList: HomeRequestSummaryDto[] = [];
  isLoadingRequestSummary = false;

  @ViewChild('kpiScroll', { static: false }) kpiScroll?: ElementRef<HTMLDivElement>;

  constructor(
    private homeService: HomeService, 
    public translate: TranslateService,
    private shortcutService: ShortcutService,
    private router: Router,
    private routeValidator: RouteMappingValidatorService,
    private chartUtils: ChartUtilsService
  ) { }

  ngOnInit(): void {
    this.loadKpis();
    this.loadCharts();
    this.loadShortcuts();
    this.loadRequestSummary();

    this.translate.onLangChange.subscribe(ev => {
      this.currentLang = ev.lang || this.currentLang;
      this.buildKpiCards();
      // Recalculate completed percentage when language changes
      if (this.requestSummaryData) {
        this.calculateCompletedPercentage();
      }
    });
  }
  leftExpanded = false;

  toggleLeftPanel() {
    this.leftExpanded = !this.leftExpanded;
  }
  // Shortcuts methods
  loadShortcuts(): void {
    this.isLoadingShortcuts = true;
    this.shortcutService.getAll().subscribe({
      next: (shortcuts) => {
        this.availableShortcuts = shortcuts;
        this.shortcuts = shortcuts.filter(s => s.isSelected);
        this.isLoadingShortcuts = false;
        
        // Generate route mapping validation report in development
        if (!environment.production) {
          this.routeValidator.generateUnmappedReport(shortcuts);
        }
      },
      error: (error) => {
        this.isLoadingShortcuts = false;
      }
    });
  }

  openAddShortcutModal(): void {
    // Reset selected shortcuts to currently selected ones
    this.selectedShortcuts = this.shortcuts.map(s => s.pageName);
    // Reload available shortcuts to ensure we have latest data
    this.loadShortcuts();
    // Show the modal
    this.showShortcutModal = true;
    // Clear any previous validation messages
    this.showValidationMessage = false;
  }

  onShortcutSelectionChange(pageName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    
    if (isChecked) {
      // Add to selected shortcuts if not already present
      if (!this.selectedShortcuts.includes(pageName)) {
        this.selectedShortcuts.push(pageName);
      }
    } else {
      // Remove from selected shortcuts
      this.selectedShortcuts = this.selectedShortcuts.filter(name => name !== pageName);
    }
    
    // Clear validation message when user makes a selection
    if (this.showValidationMessage) {
      this.showValidationMessage = false;
    }
  }

  toggleShortcutSelection(pageName: string): void {
    if (this.selectedShortcuts.includes(pageName)) {
      // Remove from selected shortcuts
      this.selectedShortcuts = this.selectedShortcuts.filter(name => name !== pageName);
    } else {
      // Add to selected shortcuts
      this.selectedShortcuts.push(pageName);
    }
    
    // Clear validation message when user makes a selection
    if (this.showValidationMessage) {
      this.showValidationMessage = false;
    }
  }

  saveShortcuts(): void {
    if (this.selectedShortcuts.length === 0) {
      this.showValidationMessage = true;
      setTimeout(() => {
        this.showValidationMessage = false;
      }, 3000);
      return;
    }

    this.isSavingShortcuts = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.showValidationMessage = false;
    
    const shortcutsToCreate: CreateShortcutDto[] = this.selectedShortcuts.map(pageName => ({
      pageName
    }));

    this.shortcutService.createRange(shortcutsToCreate).subscribe({
      next: (updatedShortcuts) => {
        this.shortcuts = updatedShortcuts.filter(s => s.isSelected);
        this.availableShortcuts = updatedShortcuts;
        this.isSavingShortcuts = false;
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
        this.closeModal();
      },
      error: (error) => {
        this.isSavingShortcuts = false;
        this.showErrorMessage = true;
        this.errorMessage = 'Failed to save shortcuts. Please try again.';
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
      }
    });
  }

  deleteShortcut(shortcut: ShortcutDto): void {
    const confirmMessage = `Are you sure you want to delete the "${shortcut.displayName || shortcut.pageName}" shortcut?`;
    if (confirm(confirmMessage)) {
      this.isDeletingShortcut = true;
      this.showSuccessMessage = false;
      this.showErrorMessage = false;
      
      this.shortcutService.delete(shortcut.id).subscribe({
        next: () => {
          this.shortcuts = this.shortcuts.filter(s => s.id !== shortcut.id);
          // Also update available shortcuts to reflect the change
          this.availableShortcuts = this.availableShortcuts.map(s => 
            s.id === shortcut.id ? { ...s, isSelected: false } : s
          );
          this.isDeletingShortcut = false;
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        },
        error: (error) => {
          this.isDeletingShortcut = false;
          this.showErrorMessage = true;
          this.errorMessage = 'Failed to delete shortcut. Please try again.';
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 5000);
        }
      });
    }
  }

  navigateToShortcut(shortcut: ShortcutDto): void {
    // Use the enhanced shortcut service for navigation
    this.shortcutService.navigateToShortcut(shortcut).catch(error => {
      // Show user-friendly error message
      this.errorMessage = `Unable to navigate to ${shortcut.displayName || shortcut.pageName}. Please try again.`;
      this.showErrorMessage = true;
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);
    });
  }

  closeModal(): void {
    // Close the modal
    this.showShortcutModal = false;
  }

  onModalBackdropClick(event: Event): void {
    // Close modal when clicking on backdrop
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showShortcutModal) {
      this.closeModal();
    }
  }

  @HostListener('document:keydown.control.a', ['$event'])
  onSelectAllKey(event: KeyboardEvent): void {
    if (this.showShortcutModal && !this.isLoadingShortcuts) {
      event.preventDefault();
      this.selectAllShortcuts();
    }
  }

  @HostListener('document:keydown.control.d', ['$event'])
  onDeselectAllKey(event: KeyboardEvent): void {
    if (this.showShortcutModal && !this.isLoadingShortcuts) {
      event.preventDefault();
      this.deselectAllShortcuts();
    }
  }

  trackByShortcut(index: number, shortcut: ShortcutDto): number {
    return shortcut.id;
  }

  selectAllShortcuts(): void {
    this.selectedShortcuts = this.availableShortcuts.map(s => s.pageName);
    this.showValidationMessage = false;
  }

  deselectAllShortcuts(): void {
    this.selectedShortcuts = [];
    this.showValidationMessage = false;
  }

  get isAllSelected(): boolean {
    return this.availableShortcuts.length > 0 && 
           this.selectedShortcuts.length === this.availableShortcuts.length;
  }

  get isSomeSelected(): boolean {
    return this.selectedShortcuts.length > 0 && 
           this.selectedShortcuts.length < this.availableShortcuts.length;
  }

  private loadKpis(): void {
    this.homeService.getHomePageKpisData().subscribe({
      next: (arr: HomeKpiApiItem[]) => {
        this.kpiItems = Array.isArray(arr) ? arr : [];
        this.buildKpiCards();
      },
      error: () => {}
    });
  }

  private buildKpiCards(): void {
    const colors: Array<'purple'|'blue'|'red'|'teal'> = ['purple','blue','red','teal'];
    const cards: typeof this.kpiCards = [];
    this.kpiItems.forEach((item, index) => {
      const color = colors[index % colors.length];
      const percentRaw = typeof item.value3 === 'number' ? item.value3 : Number(item.value3str ?? 0);
      const progressPercent = Math.max(0, Math.min(100, isNaN(percentRaw) ? 0 : percentRaw));
      cards.push({
        topLabel: item.nameAr ?? '',
        topValueStr: item.value1str,
        topValueNum: item.value1,
        bottomLabel: item.nameEn ?? '',
        bottomValueStr: item.value2str,
        bottomValueNum: item.value2,
        progressPercent,
        color
      });
    });
    this.kpiCards = cards;
  }

  scrollKpi(direction: number): void {
    const container = this.kpiScroll?.nativeElement;
    if (!container) return;
    const firstCard = container.querySelector('.kpi-modern__card') as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 16 : Math.ceil(container.clientWidth * 0.9);
    container.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  private loadCharts(): void {
    this.homeService.getHomeChartData().subscribe({
      next: (arr: any[]) => {
        this.chartsRawData = Array.isArray(arr) ? arr : [];
        this.processChartsData();
      },
      error: (error) => {
        // Handle error silently
      }
    });
  }

  private loadRequestSummary(): void {
    //
    this.isLoadingRequestSummary = true;
    this.homeService.getHomeTotalRequestSummary().subscribe({
      next: (data: HomeTotalRequestSummaryDto) => {
        this.requestSummaryData = data;
        this.requestSummaryList = data.requestSummary || [];
        this.totalRequests = data.totalRequests;
        
        // Calculate completed percentage using language-aware status comparison
        this.calculateCompletedPercentage();
        
        this.isLoadingRequestSummary = false;
      },
      error: (error) => {
        
        this.isLoadingRequestSummary = false;
      }
    });
  }

  private calculateCompletedPercentage(): void {
    // Define status mappings for both languages
    const statusMappings = {
      en: {
        completed: ['Accept', 'Accepted', 'Completed', 'Approved']
      },
      ar: {
        completed: ['موافق', 'مقبول', 'مكتمل', 'معتمد']
      }
    };
    
    // Get current language statuses
    const currentLangStatuses = statusMappings[this.currentLang as keyof typeof statusMappings] || statusMappings.en;
    
    // Also include the translated status from the translation service
    const translatedAcceptedStatus = this.translate.instant('WORKFLOW.STATUS_ACCEPT');
    const allCompletedStatuses = [...currentLangStatuses.completed, translatedAcceptedStatus];
    
    const completedCount = this.requestSummaryList
      .filter(item => allCompletedStatuses.some(status => 
        item.status.toLowerCase().includes(status.toLowerCase())
      ))
      .reduce((sum, item) => sum + item.totalRequest, 0);
    
    this.completedPercentage = this.totalRequests > 0 
      ? Math.round((completedCount / this.totalRequests) * 100) 
      : 0;
  }

  private processChartsData(): void {
    this.processedCharts = this.chartsRawData.map(chart => {
       if (!chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
        return null;  
      }

      const result = this.chartUtils.parseChartData({ data: chart.data }, this.currentLang, {
        useIndividualSeries: false,
        valueFields: ['value1', 'value2']
      });

      return {
        title: chart.chartTitle,
        chartType: chart.chartType,
        module: chart.module,
        categories: result.categories,
        seriesData: result.seriesData,
        originalData: chart.data
      };
    }).filter(chart => chart !== null);  
  }

    trackByChart(index: number, chart: any): any {
     return chart?.title || index;
  }

  trackByRequestSummary(index: number, item: HomeRequestSummaryDto): string {
    return item.status;
  }

  getChartType(chart: any): 'bar' | 'pie' {
     return chart.categories.length <= 5 ? 'pie' : 'bar';
  }

  getPieChartData(chart: any): any[] {
    if (!chart.originalData) return [];
    
    return chart.originalData.map((item: any) => ({
      name: this.currentLang === 'ar' ? item.nameAr : (item.nameEn || item.nameAr),
      y: item.value1 + item.value2 
    }));
  }
}
