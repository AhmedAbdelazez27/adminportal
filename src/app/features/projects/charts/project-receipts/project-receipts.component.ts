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
import { ChartSeriesData, ChartUtilsService } from '../../../../../shared/services/chart-utils.service';

@Component({
  selector: 'app-project-receipts',
  standalone: true,
  imports: [BarChartComponent, PieChartComponent, CommonModule, FormsModule, NgSelectModule, TranslateModule, RouterModule],
  templateUrl: './project-receipts.component.html',
  styleUrls: ['./project-receipts.component.scss'],
  providers: [Select2Service]
})
export class ProjectReceiptsComponents implements OnInit {
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
    private route: ActivatedRoute,
    private chartUtils: ChartUtilsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.defaultChartType = params['chartType'] || 'Country';
      this.getYearAndChartTypesList();
    });
  }

  getYearAndChartTypesList() {
    forkJoin({
      years: this._Select2Service.getGlPeriodYearsSelect2List(),
      chartTypes: this._Select2Service.getProjectsChartTypeSelect2(),
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
          case 'Country':
            this.pageTitle = `${this.translate.instant('ProjectCharts.titleForprojectReceipt')} ${this.translate.instant('ProjectCharts.menubyCountry')}`;
            this.selectedChart1 = this.findChartTypeId("ByType");
            this.selectedChart2 = this.findChartTypeId("ByType");
            break;
          case 'Type':
            this.pageTitle = `${this.translate.instant('ProjectCharts.titleForprojectReceipt')} ${this.translate.instant('ProjectCharts.menubyCountry')}`;
            this.selectedChart1 = this.findChartTypeId("ByType");
            this.selectedChart2 = this.findChartTypeId("ByType");
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
      chartType: 2,
      parameters: {
        language: 'en',
        periodYearId: this.selectedYearId.toString(),
        type: 1,
        entityId: this.selectedEntity ? this.selectedEntity.toString() : null,
        userId: null,
        countryCode: null,
      }
    };

    if (typeChange == 'changeEntit') {
      this.spinnerService.show();
      this.onTypeChange(this.selectedChart1, "categories2", "seriesData2");
      this.onTypeChange(this.selectedChart2, "categories3", "seriesData3");
    } else {
      this._ChartsService.getProjectChart(payload).subscribe({
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
        type: 1,
        entityId: this.selectedEntity ? this.selectedEntity.toString() : null,
        userId: null,
        countryCode: null,
      }
    };

    this._ChartsService.getProjectChart(payload).subscribe({
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
    const data = res?.data || [];
    if (data.length === 0) {
      this[categoriesName] = [];
      this[seriesDataName] = [];
      return;
    }
    if (data.length > 0) {
      const result = this.chartUtils.parseChartData(res, this.translate.currentLang || 'en', {
        useIndividualSeries: true,
        valueFields: ['value1', 'value2', 'value3', 'value4']
      });

      const mappedSeriesData: ChartSeriesData[] = [];
      result.seriesData.forEach((series, index) => {
        if (index === 0) {
          mappedSeriesData.push({ ...series, name: 'Revenue' });
        } else if (index === 1) {
          mappedSeriesData.push({ ...series, name: 'Expense' });
        }
      });
      this[categoriesName] = result.categories;
      this[seriesDataName] = mappedSeriesData;
    } else {
      this[categoriesName] = [];
      this[seriesDataName] = [];
    }
  }

  setDefaultValues(categoriesName: string, seriesDataName: string) {
    const result = this.chartUtils.parseChartData(null, this.translate.currentLang || 'en');
    this[categoriesName] = result.categories;
    this[seriesDataName] = result.seriesData;
  }

  generateRandomValues(count: number): number[] {
    const randomValues: number[] = [];
    for (let i = 0; i < count; i++) {
      randomValues.push(Math.floor(Math.random() * 1001));
    }
    return randomValues;
  }
}
