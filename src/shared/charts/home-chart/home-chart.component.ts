import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts, { Options, SeriesOptionsType } from 'highcharts';
import { ChartUtilsService } from '../../services/chart-utils.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../app/core/services/translation.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, HighchartsChartModule, TranslateModule],
  templateUrl: './home-chart.component.html',
  styleUrls: ['./home-chart.component.scss']
})
export class HomeChartComponent implements OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptionsBar: Options = {};
  chart: Highcharts.Chart | undefined;
  previewChart: Highcharts.Chart | undefined;
  isPreviewOpen = false;
  currentLang: string = "en";

  private chartUtils = inject(ChartUtilsService);

  @Input() categories: string[] = [];
  @Input() seriesData: { name: string; data: number[]; color?: string }[] = [];
  @Input() direction: 'rtl' | 'ltr' = 'rtl';
  @Input() chartType: 'column' | 'line' | 'bar' | 'area' | 'pie' | 'piechart' | 'table' = 'column';
  @Input() showValues: boolean = true;
  @Input() enablePreview: boolean = true;
  @Input() seriesColor: string = '#dc3545';
  @Input() valueColor: string = '#dc3545';
  @Input() useDynamicColors: boolean = false;
  @Input() pageTitle: string = '';
  @Input() enableChartTypeSelection: boolean = true;

  selectedChartType: 'column' | 'line' | 'bar' | 'area' | 'pie' | 'piechart' | 'table' = this.chartType;
  availableChartTypes: { value: string; label: string }[] = [];

  constructor(
    private translate: TranslateService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    this.translate.onLangChange.subscribe(() => {
      setTimeout(() => {
        this.updateChartTypes();
      }, 500);
    });
    this.selectedChartType = this.chartType;
    this.updateChartTypes();
    this.buildChartOptions();
  }

  private updateChartTypes() {
    this.currentLang = this.translationService.currentLang;

    const chartTypes = [
      { value: 'column', en: 'Column Chart', ar: 'رسم بياني عمودي' },
      { value: 'bar', en: 'Bar Chart', ar: 'رسم بياني أفقي' },
      { value: 'line', en: 'Line Chart', ar: 'رسم بياني خطي' },
      { value: 'area', en: 'Area Chart', ar: 'رسم بياني مساحي' },
       { value: 'pie', en: 'Pie Chart', ar: 'رسم بياني دائري' },
      { value: 'piechart', en: 'Pie Chart (New)', ar: 'رسم بياني دائري (جديد)' },
      { value: 'table', en: 'Table View', ar: 'عرض جدولي' }
    ];

    this.availableChartTypes = chartTypes.map(type => ({
      value: type.value,
      label: this.currentLang === 'ar' ? type.ar : type.en
    }));
  }

  ngOnChanges(_: SimpleChanges): void {
    this.selectedChartType = this.chartType;
    this.buildChartOptions();
  }

  onChartTypeChange(newType: 'column' | 'line' | 'bar' | 'area' | 'pie' | 'piechart' | 'table') {
    if (newType && this.availableChartTypes.some(type => type.value === newType)) {
      this.selectedChartType = newType;
      this.buildChartOptions();
    }
  }

  addComponentRef(chart: Highcharts.Chart) {
    if (chart) this.chart = chart;
  }

  addPreviewComponentRef(chart: Highcharts.Chart) {
    if (chart) this.previewChart = chart;
  }

  onChartClick(event: MouseEvent) {
    if (!this.enablePreview) return;
    const target = event.target as HTMLElement | null;
    if (target && target.closest('.highcharts-legend')) return;
    this.isPreviewOpen = true;
    setTimeout(() => this.previewChart?.reflow(), 0);
  }

  closePreview() {
    this.isPreviewOpen = false;
  }

  private buildChartOptions() {
    try {
      const isRtl = this.direction === 'rtl';
      const H = Highcharts;
      const NULL_TEXT = null as unknown as string;

      // Table view
      if (this.selectedChartType === 'table') {
        this.chartOptionsBar = {
          chart: { type: 'line' }, // placeholder
          title: { text: NULL_TEXT },
          credits: { enabled: false }
        };
        return;
      }

      // Piechart (new) - same design as PieChartComponent
      // Piechart (new) - same design as PieChartComponent
      // Piechart (new) - same design as PieChartComponent
      // Piechart (new) - same design as PieChartComponent
      // Piechart (new) - same design as PieChartComponent
      // Piechart (new) - same design as PieChartComponent
      if (this.selectedChartType === 'piechart') {
        const isDark = false;
        const textColor = isDark ? '#f1f1f1' : '#333333';
        const bgColor = isDark ? '#1f2d3d' : 'transparent';
        const baseColors = H.getOptions().colors || [
          '#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
          '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'
        ];

        const firstSeries = this.seriesData[0] ?? { name: 'Data', data: [] };
        const categories = isRtl ? [...this.categories].reverse() : this.categories;
        const values = isRtl ? [...(firstSeries.data ?? [])].reverse() : (firstSeries.data ?? []);

        const pieData: Highcharts.PointOptionsObject[] = categories.map((label, i) => {
          // Use dynamic colors or fallback to Highcharts default colors
          let color: any;
          if (this.useDynamicColors) {
            color = this.chartUtils.generateDynamicColor(i, categories.length);
          } else {
            // Use Highcharts default color palette
            color = baseColors[i % baseColors.length] || '#7cb5ec';
          }

          return {
            name: label,
            y: Number(values[i] ?? 0),
            color: color
          };
        });

        this.chartOptionsBar = {
          chart: { type: 'pie', style: { direction: isRtl ? 'rtl' : 'ltr' }, backgroundColor: bgColor },
          title: { text: NULL_TEXT },
          series: [
            {
              type: 'pie',
              name: firstSeries.name,
              data: pieData,
              innerSize: '50%' // donut style
            }
          ],
          tooltip: {
            pointFormatter() {
              return `<span style="color:${this.color}">●</span> ${this.name}: <b>${H.numberFormat(Number(this.y ?? 0), 0, '.', ',')}</b>`;
            },
            useHTML: true
          },
          plotOptions: {
            pie: {
              dataLabels: {
                enabled: true,
                distance: 40,
                connectorPadding: 8,
                connectorColor: '#666666',
                connectorWidth: 2,
                style: {
                  textOutline: '1px contrast',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#333333',
                  textAlign: 'center'
                },
                formatter: function () {
                  const point = (this as any).point;
                  const percentage = ((Number(point.y) / (this.series.data.reduce((sum: number, p: any) => sum + Number(p.y), 0))) * 100).toFixed(1);
                  return `<div style="text-align: center; min-width: 60px;">
              <strong>${point.name}</strong><br/>
              <span style="color: #666;">${Highcharts.numberFormat(Number(point.y ?? 0), 0, '.', ',')}</span><br/>
              <span style="color: #999; font-size: 10px;">${percentage}%</span>
            </div>`;
                },
                useHTML: true
              },
              allowPointSelect: true,
              cursor: 'pointer',
              showInLegend: false,
              size: '65%',
              borderWidth: 2,
              borderColor: 'white'
            }
          },
          legend: {
            enabled: true,
            layout: 'horizontal',
            verticalAlign: 'bottom',
            align: 'center',
            itemMarginTop: 6,
            itemMarginBottom: 6,
            itemDistance: 24,
            useHTML: true,
            labelFormatter: function () {
              const point = this as Highcharts.Point;
              return `<span style="font-size:14px; color:#000; font-weight:bold;">
          ${point.name} (${Highcharts.numberFormat(Number(point.y ?? 0), 0, '.', ',')})
        </span>`;
            }
          },
          credits: { enabled: false }
        };
        return;
      }
      const areCategoriesReversed = isRtl;
      const categories = areCategoriesReversed ? [...this.categories].reverse() : this.categories;

      const series: SeriesOptionsType[] = this.selectedChartType === 'pie'
        ? this.buildPieSeries()
        : this.buildStandardSeries(areCategoriesReversed);

      this.chartOptionsBar = {
        chart: { type: this.selectedChartType === 'pie' ? undefined : this.selectedChartType },
        title: { text: NULL_TEXT },
        xAxis: this.buildXAxisConfig(categories, areCategoriesReversed),
        yAxis: this.buildYAxisConfig(),
        series,
        tooltip: { shared: true, useHTML: true },
        plotOptions: this.buildPlotOptions(),
        legend: { enabled: false },  // CHANGE THIS from true to false
        credits: { enabled: false }
      };

    } catch (error) {
      console.error('Error building chart options:', error);
      this.chartOptionsBar = {
        chart: { type: 'column' },
        title: { text: '' },
        credits: { enabled: false }
      };
    }
  }

  private buildPieSeries(): SeriesOptionsType[] {
    const firstSeries = this.seriesData[0] ?? { name: 'Data', data: [] };
    const categories = this.direction === 'rtl' ? [...this.categories].reverse() : this.categories;
    const values = this.direction === 'rtl' ? [...(firstSeries.data ?? [])].reverse() : (firstSeries.data ?? []);

    const pieData: Highcharts.PointOptionsObject[] = categories.map((label, i) => ({
      name: label,
      y: Number(values[i] ?? 0),
      color: firstSeries.color ?? this.seriesColor
    }));

    return [{
      type: 'pie',                 
      name: firstSeries.name,
      data: pieData,               
      innerSize: '50%'            
    } as Highcharts.SeriesPieOptions];
  }


  private buildStandardSeries(areCategoriesReversed: boolean): SeriesOptionsType[] {
    const H = Highcharts;
    const baseColors = H.getOptions().colors || [
      '#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
      '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'
    ];

    return this.seriesData.map((seriesItem, seriesIndex) => {
      const dataPoints = (areCategoriesReversed ? [...seriesItem.data].reverse() : seriesItem.data).map((value, pointIndex) => {
        let color;
        if (this.useDynamicColors) {
          color = this.chartUtils.generateDynamicColor(pointIndex, seriesItem.data.length);
        } else {
          // Use Highcharts default color palette
          color = baseColors[pointIndex % baseColors.length];
        }
        return { y: value, color: color };
      });

      return {
        name: seriesItem.name,
        type: this.selectedChartType,
        data: dataPoints,
        showInLegend: false,
        colorByPoint: true
      } as SeriesOptionsType;
    });
  }

  private buildXAxisConfig(categories: any[], areCategoriesReversed: boolean) {
    if (this.selectedChartType === 'pie' || this.selectedChartType === 'piechart') return undefined;
    return { categories, reversed: areCategoriesReversed, title: { text: null as unknown as string } };
  }

  private buildYAxisConfig() {
    if (this.selectedChartType === 'pie' || this.selectedChartType === 'piechart') return undefined;
    return {
      title: { text: null as unknown as string },
      gridLineWidth: 1,
      labels: { enabled: false },
      plotLines: [{ value: 0, width: 1, color: '#000' }]
    };
  }

  private buildPlotOptions() {
    return {
      column: {
        borderWidth: 0,
        pointPadding: 0.1,
        groupPadding: 0.05,
        maxPointWidth: 40,
        colorByPoint: true,  // ADD THIS LINE for different colors per point
        dataLabels: {
          enabled: true,
          formatter(this: any) { return this.y; }
        }
      },
      bar: {
        borderWidth: 0,
        pointPadding: 0.1,
        groupPadding: 0.05,
        pointWidth: 35,
        colorByPoint: true,  // ADD THIS LINE for different colors per point
        dataLabels: {
          enabled: true,
          formatter(this: any) { return this.y; }
        }
      },
      line: {
        marker: { enabled: true },
        dataLabels: { enabled: true, format: '{point.y}' }
      },
      area: {
        marker: { enabled: true },
        dataLabels: { enabled: true, format: '{point.y}' }
      },
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}'
        }
      }
    };
  }
}
