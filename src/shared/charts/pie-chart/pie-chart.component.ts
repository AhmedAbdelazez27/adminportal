import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts, { Options, SeriesOptionsType } from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import HC_accessibility from 'highcharts/modules/accessibility';
import { ChartUtilsService } from '../../services/chart-utils.service';
import { TranslateModule } from '@ngx-translate/core';
const initExporting = (typeof HC_exporting === 'function' ? HC_exporting : (HC_exporting as any)?.default);
if (typeof initExporting === 'function') {
  initExporting(Highcharts);
}
const initAccessibility = (typeof HC_accessibility === 'function' ? HC_accessibility : (HC_accessibility as any)?.default);
if (typeof initAccessibility === 'function') {
  initAccessibility(Highcharts);
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule, TranslateModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptionsPie: Options = {};
  chart: Highcharts.Chart | undefined;
  previewChart: Highcharts.Chart | undefined;
  isPreviewOpen = false;
  
  private chartUtils = inject(ChartUtilsService);

  @Input() categories: string[] = [];
  @Input() seriesData: { name: string; data: number[]; color?: string }[] = [];
  @Input() direction: 'rtl' | 'ltr' = 'rtl';
  @Input() chartType: 'column' | 'line' | 'pie' = 'column';
  @Input() showValues: boolean = true;
  @Input() enablePreview: boolean = true;
  @Input() piePoints: { name: string; y: number; color?: string }[] = [];
  @Input() valueColor: string = '#dc3545';
  @Input() donut: boolean = false;
  @Input() enableExport: boolean = true;
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() useGradient: boolean = true;
  @Input() useDynamicColors: boolean = false;
  @Input() pageTitle: string = '';

  ngOnChanges(_: SimpleChanges): void {
    console.log("categories ", this.categories);
    console.log("seriesData ", this.seriesData);
    this.buildChartOptions();
  }

  addComponentRef(chart: Highcharts.Chart) {
    this.chart = chart;
  }

  addPreviewComponentRef(chart: Highcharts.Chart) {
    this.previewChart = chart;
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
    const isRtl = this.direction === 'rtl';
    const isDark = this.theme === 'dark';
    const textColor = isDark ? '#f1f1f1' : '#333333';
    const bgColor = isDark ? '#1f2d3d' : 'transparent';
    const H = Highcharts;
    const baseColors = H.getOptions().colors || [
      '#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
      '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'
    ];
    const gradientColors = this.useGradient ? baseColors.map(col => ({
      radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
      stops: [ [0, col], [1, H.color(col).brighten(-0.25).get('rgb')] ]
    })) : undefined;
    const NULL_TEXT = null as unknown as string;

    if (this.chartType === 'pie') {
      const categories = isRtl ? [...this.categories].reverse() : this.categories;
      const firstSeries = this.seriesData[0] ?? { name: 'Data', data: [] };
      const values = isRtl ? [...(firstSeries.data ?? [])].reverse() : (firstSeries.data ?? []);

      let pieData: { name: string; y: number; color?: string }[] = [];
      if (this.piePoints && this.piePoints.length) {
        pieData = this.piePoints.map((p, index) => {
          let color = p.color;
          if (this.useDynamicColors && !p.color) {
            color = this.chartUtils.generateDynamicColor(index, this.piePoints.length);
          }
          return { name: p.name, y: Number(p.y ?? 0), color: color };
        });
      } else if (categories.length) {
        pieData = categories.map((label, i) => {
          let color: string | undefined;
          if (this.useDynamicColors) {
            color = this.chartUtils.generateDynamicColor(i, categories.length);
          }
          return { name: label, y: Number(values[i] ?? 0), color: color };
        });
      } else if (this.seriesData && this.seriesData.length) {
        pieData = this.seriesData.map((s, index) => {
          let color = s.color;
          if (this.useDynamicColors && !s.color) {
            color = this.chartUtils.generateDynamicColor(index, this.seriesData.length);
          }
          return { name: s.name, y: Number((s.data?.[0]) ?? 0), color: color };
        });
      } else if (values && values.length) {
        pieData = values.map((v, i) => {
          let color: string | undefined;
          if (this.useDynamicColors) {
            color = this.chartUtils.generateDynamicColor(i, values.length);
          }
          return { name: `Slice ${i + 1}` , y: Number(v ?? 0), color: color };
        });
      }

      this.chartOptionsPie = {
        chart: { type: 'pie', style: { direction: isRtl ? 'rtl' : 'ltr' }, backgroundColor: bgColor, spacingBottom: 60 },
        title: { text: NULL_TEXT },
        subtitle: { text: NULL_TEXT },
        xAxis: undefined,
        yAxis: undefined,
        tooltip: {
          pointFormatter() {
            return `<span style="color:${this.color}">●</span> ${this.name}: <b>${H.numberFormat(Number(this.y), 0, '.', ',')}</b>`;
          },
          useHTML: true
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: this.showValues,
              formatter: function() {
                const anyThis = this as unknown as { y?: number; percentage?: number };
                const v = Number(anyThis.y ?? 0);
                if (isNaN(v) || v === 0) return '';
                const percent = typeof anyThis.percentage === 'number' ? ` (${Highcharts.numberFormat(anyThis.percentage, 1)}%)` : '';
                return Highcharts.numberFormat(v, 0, '.', ',') + percent;
              },
              style: { fontSize: '14px', fontWeight: 'normal', color: this.valueColor }
            },
            showInLegend: true
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
        symbolRadius: 6,
        useHTML: true,
        labelFormatter() {
          return `<span style=\"font-size:14px;color:#1f2d3d;${isRtl ? 'direction:rtl;' : ''}\">${escapeHtml(this.name)}</span>`;
        }
      },
        colors: gradientColors as any,
        series: [
          {
            type: 'pie',
            name: firstSeries.name,
            data: pieData as unknown as Highcharts.SeriesPieOptions['data'],
            innerSize: this.donut ? '50%' : undefined
          }
        ],
        exporting: { enabled: this.enableExport },
        responsive: {
          rules: [
            {
              condition: { maxWidth: 500 },
              chartOptions: { legend: { layout: 'vertical', align: 'center', verticalAlign: 'bottom' } }
            }
          ]
        },
        credits: { enabled: false }
      } as Options;
      return;
    }

    const categories = isRtl ? [...this.categories].reverse() : this.categories;
    const mapSeries = (arr: typeof this.seriesData): SeriesOptionsType[] =>
      arr.map<SeriesOptionsType>((s, index) => {
        let color = s.color;
        
        if (this.useDynamicColors && !s.color) {
          color = this.chartUtils.generateDynamicColor(index, arr.length);
        }
        
        return {
          name: s.name,
          type: this.chartType,
          data: (isRtl ? [...s.data].reverse() : s.data) as any,
          color: color,
          dataLabels: { enabled: false, style: { fontSize: '14px', fontWeight: 'bold' } }
        };
      });

    this.chartOptionsPie = {
      chart: { type: this.chartType, style: { direction: isRtl ? 'rtl' : 'ltr' }, backgroundColor: bgColor, spacingBottom: 60 },
      title: { text: NULL_TEXT },
      subtitle: { text: NULL_TEXT },
      xAxis: {
        categories,
        reversed: isRtl,
        labels: { style: { fontSize: '14px', color: textColor, textAlign: isRtl ? 'right' : 'left' } },
        title: { text: NULL_TEXT }
      },
      yAxis: {
        title: { text: NULL_TEXT },
        gridLineWidth: 1,
        gridLineColor: isDark ? '#444' : '#ccc',
        labels: { formatter() { return H.numberFormat(Number(this.value), 0, '.', ','); }, style: { fontSize: '14px', color: textColor } },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080',
          zIndex: 4
        }]
      },
      series: mapSeries(this.seriesData),
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><br>',
        pointFormatter() { return `<span style=\"color:${this.color}\">●</span> ${this.series.name}: <b>${H.numberFormat(Number(this.y), 0, '.', ',')}</b><br>`; },
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          groupPadding: 0.05,
          pointPadding: 0,
          borderWidth: 0,
          dataLabels: {
            enabled: this.showValues,
            formatter() {
              const v = Number(this.y);
              if (isNaN(v) || v === 0) return '';
              return H.numberFormat(v, 0, '.', ',');
            },
            style: { fontSize: '14px', fontWeight: 'normal', color: this.valueColor }
          }
        },
        line: {
          marker: { enabled: true, symbol: 'circle' },
          dataLabels: {
            enabled: this.showValues,
            formatter() {
              const v = Number(this.y);
              if (isNaN(v) || v === 0) return '';
              return H.numberFormat(v, 0, '.', ',');
            },
            style: { fontSize: '14px', fontWeight: 'normal', color: this.valueColor }
          }
        },
        series: { cursor: 'pointer' }
      },
       legend: {
        enabled: true,
        layout: 'horizontal',
        verticalAlign: 'bottom',
        align: 'center',
          itemMarginTop: 6,
        itemMarginBottom: 6,
        itemDistance: 24,
        symbolRadius: 6,
        useHTML: true,
        labelFormatter() {
          return `<span style=\"font-size:14px;color:#1f2d3d;${isRtl ? 'direction:rtl;' : ''}\">${escapeHtml(this.name)}</span>`;
        }},
      colors: gradientColors as any,
      exporting: { enabled: this.enableExport },
      responsive: {
        rules: [
          {
            condition: { maxWidth: 500 },
            chartOptions: { legend: { layout: 'vertical', align: 'center', verticalAlign: 'bottom' } }
          }
        ]
      },
      credits: { enabled: false }
    } as Options;
  }
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
