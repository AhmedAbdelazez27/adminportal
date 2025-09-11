import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BarChartComponent } from '../../../../../shared/charts/bar-chart/bar-chart.component';
import { ChartsService } from '../../../../core/services/Financial/charts/charts.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { EntityService } from '../../../../core/services/entit.service';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { PieChartComponent } from '../../../../../shared/charts/pie-chart/pie-chart.component';

@Component({
  selector: 'app-requests-statistics',
  standalone: true,
  imports: [BarChartComponent, PieChartComponent, CommonModule, FormsModule, NgSelectModule, TranslateModule, RouterModule],
  templateUrl: './requests-statistics.component.html',
  styleUrls: ['./requests-statistics.component.scss'],
  providers: [Select2Service]
})
export class RequestsStatisticsComponents implements OnInit {
  [key: string]: any;
  entities: any[] = [];
  yearsList: any = [];
  selectedYearId: any = '1';
  selectedEntity: any;
  defaultChartType: string = '';
  pageTitle: string = '';

  chartTypes: any = [];
  selectedChart1: string | null = null;
  selectedChart2: string | null = null;

  categories: string[] = [];
  seriesData: any[] = [];

  categories2: string[] = [];
  seriesData2: any[] = [];

  categories3: string[] = [];
  seriesData3: any[] = [];

  constructor(
    private _Select2Service: Select2Service,
    private _ChartsService: ChartsService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private entityService: EntityService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.defaultChartType = params['chartType'] || 'Nationality';
      this.getYearAndChartTypesList();
    });
  }

  getYearAndChartTypesList() {
    forkJoin({
      years: this._Select2Service.getGlPeriodYearsSelect2List(),
      chartTypes: this._Select2Service.getSocialCasesChartTypeSelect2(),
      entities: this.entityService.GetSelect2List(0, 6000)
    }).subscribe({
      next: (res) => {
        this.yearsList = res.years.results;
        this.chartTypes = res.chartTypes;
        this.entities = [{ id: "", text: this.translate.instant('Common.Select') }, ...res.entities?.results];
        this.selectedEntity = "";

        const maxIdItem = res.years.results.reduce((maxItem: any, currentItem: any) => {
          return (parseInt(currentItem.id) > parseInt(maxItem.id)) ? currentItem : maxItem;
        });

        if (maxIdItem) {
          this.selectedYearId = maxIdItem.id;
          this.onYearChange();
        }

        switch (this.defaultChartType) {
          case 'Nationality':
            this.pageTitle = "SocialServiceCharts.menubyNationality";
            this.selectedChart1 = this.findChartTypeId("TotalCasesByCity");
            this.selectedChart2 = this.findChartTypeId("TotalCases");
            break;
          case 'Region':
            this.pageTitle = "SocialServiceCharts.menubyRegions";
            this.selectedChart1 = this.findChartTypeId("TotalCasesByCity");
            this.selectedChart2 = this.findChartTypeId("TotalCasesByCity");
            break;
          case 'Branches':
            this.pageTitle = "SocialServiceCharts.menubyBranch";
            this.selectedChart1 = this.findChartTypeId("TotalCasesByCity");
            this.selectedChart2 = this.findChartTypeId("TotalCasesByBranch");
            break;
        }
      },
      error: (err: any) => {
        this.toastr.error("Error loading dropdown lists");
      }
    });
  }

  findChartTypeId(value: string): string | null {
    const item = this.chartTypes.find((x: any) => x.value === value);
    return item ? item.id : null;
  }
  onYearChange(typeChange?: string) {
    if (!this.selectedYearId) return;
    this.spinnerService.show();
    const payload = {
      chartType: 5,
      parameters: {
        language: 'en',
        periodYearId: this.selectedYearId.toString(),
        entityId: this.selectedEntity,
        periodId: null,
        departmentId: null,
        countryId: null,
        branchId: null,
        userId: null,
        level: null
      }
    };

    if (typeChange == 'changeEntit') {
      this.spinnerService.show();
      this.onTypeChange(this.selectedChart1, "categories2", "seriesData2");
      this.onTypeChange(this.selectedChart2, "categories3", "seriesData3");
    } else {
      this._ChartsService.getSocialCasesChart(payload).subscribe({
        next: (res) => {
          this.parseChartData(res, 'categories', 'seriesData');
          this.onTypeChange(this.selectedChart1, "categories2", "seriesData2");
          this.onTypeChange(this.selectedChart2, "categories3", "seriesData3");
          this.spinnerService.forceHide();
        },
        error: (err) => console.error(err)
      });
    }
  }


  onTypeChange(chartType: any, categoriesName: string, seriesDataName: string) {
    if (!this.selectedYearId) return;

    const payload = {
      chartType: chartType,
      parameters: {
        language: 'en',
        periodYearId: this.selectedYearId.toString(),
        entityId: this.selectedEntity,
        periodId: null,
        departmentId: null,
        countryId: null,
        branchId: null,
        userId: null,
        level: null
      }
    };

    this._ChartsService.getSocialCasesChart(payload).subscribe({
      next: (res) => {
        this.parseChartData(res, categoriesName, seriesDataName);
        this.spinnerService.forceHide();
      },
      error: (err) => {
        console.error(err);
        this.spinnerService.forceHide();
      }
    });
  }

  parseChartData(res: any, categoriesName: string, seriesDataName: string) {
    if (!res || !res.data || res.data.length === 0) {
      this.setDefaultValues(categoriesName, seriesDataName);
    } else {

      this[categoriesName] = res.data.map((item: any) => item.nameEn);


      const seriesAData = res.data.map((item: any) => item.value1);
      const seriesBData = res.data.map((item: any) => item.value2);


      this[seriesDataName] = [
        { name: 'Series A', data: seriesAData, color: '#72C5C2' },
        { name: 'Series B', data: seriesBData, color: '#114D7D' }
      ];
    }
  }


  setDefaultValues(categoriesName: string, seriesDataName: string) {
    this[categoriesName] = ['Category 1', 'Category 2', 'Category 3'];
    this[seriesDataName] = [
      { name: 'Series A', data: this.generateRandomValues(3), color: '#72C5C2' },
      { name: 'Series B', data: this.generateRandomValues(3), color: '#114D7D' }
    ];
  }

  generateRandomValues(count: number): number[] {
    const randomValues: number[] = [];
    for (let i = 0; i < count; i++) {
      randomValues.push(Math.floor(Math.random() * 1001));
    }
    return randomValues;
  }
}
