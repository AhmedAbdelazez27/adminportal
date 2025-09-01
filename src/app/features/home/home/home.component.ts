import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HomeService, HomeKpiApiItem } from '../../../core/services/home.service';
import { PieChartComponent } from "../../../../shared/charts/pie-chart/pie-chart.component";
import { BarChartComponent } from "../../../../shared/charts/bar-chart/bar-chart.component";
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
  imports: [CommonModule,    BarChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  kpiItems: HomeKpiApiItem[] = [];
  charts: any[] = [];
   chartData: any[] = [];   
 chartsRawData: ChartDataItem[] = [];  
  processedCharts: any[] = [];  

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

  @ViewChild('kpiScroll', { static: false }) kpiScroll?: ElementRef<HTMLDivElement>;

  constructor(private homeService: HomeService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.loadKpis();
      this.loadCharts();   // ✅ استدعاء charts

    this.translate.onLangChange.subscribe(ev => {
      this.currentLang = ev.lang || this.currentLang;
      this.buildKpiCards();
    });
  }

  private loadKpis(): void {
   // const userId = localStorage.getItem('userId') || '';
 //  const userId =   '70a40b73-20c3-4fd7-a975-01197a545769';
  //  const uiLang = this.translate.currentLang || localStorage.getItem('lang') || 'en';
  //  this.currentLang = uiLang;
   // const language = uiLang.startsWith('ar') ? 'ar-EG' : 'en-US';
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

 

  private loadCharts2(): void {
    this.homeService.getHomeChartData().subscribe({
      next: (arr: HomeKpiApiItem[]) => {
        this.charts = Array.isArray(arr) ? arr : [];
     //   this.buildKpiCards();
      },
      error: () => {}
    });



    
}


 private loadCharts(): void {
    this.homeService.getHomeChartData().subscribe({
      next: (arr: any[]) => {
        console.log('Raw charts data:', arr); // للتأكد من البيانات
        this.chartsRawData = Array.isArray(arr) ? arr : [];
        this.processChartsData();
      },
      error: (error) => {
        console.error('Error loading charts:', error);
      }
    });
  }

  private processChartsData(): void {
    this.processedCharts = this.chartsRawData.map(chart => {
       if (!chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
        return null;  
      }

       const categories = chart.data.map(item => 
        this.currentLang === 'ar' ? item.nameAr : (item.nameEn || item.nameAr)
      );
 
       const seriesData = [
        {
           
          data: chart.data.map(item => item.value1),
          color: '#af0b0bff'
        },
        {
         
          data: chart.data.map(item => item.value2),
            color: '#72C5C2'
        }
      ];

      return {
        title: chart.chartTitle,
        chartType: chart.chartType,
        module: chart.module,
        categories: categories,
        seriesData: seriesData,
        originalData: chart.data
      };
    }).filter(chart => chart !== null);  
  }

 

  trackByChart(index: number, chart: any): any {
    return chart?.title || index;
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
