import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts, { Options, SeriesOptionsType } from 'highcharts';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptionsBar: Options = {};
  chart: Highcharts.Chart | undefined;

  @Input() categories: string[] = [];
  @Input() seriesData: { name: string; data: number[]; color?: string }[] = [];
  @Input() direction: 'rtl' | 'ltr' = 'rtl';
  @Input() chartType: 'column' | 'line' = 'column';

  ngOnChanges(_: SimpleChanges): void {
    console.log("categories ", this.categories);
    console.log("seriesData ", this.seriesData);
    this.buildChartOptions();
  }

  addComponentRef(chart: Highcharts.Chart) {
    this.chart = chart;
  }

  private buildChartOptions() {
    const isRtl = this.direction === 'rtl';
    const H = Highcharts;
    const cats = isRtl ? [...this.categories].reverse() : this.categories;
    const NULL_TEXT = null as unknown as string;

    const mapSeries = (arr: typeof this.seriesData): SeriesOptionsType[] =>
      arr.map<SeriesOptionsType>(s => ({
        name: s.name,
        type: this.chartType,
        data: (isRtl ? [...s.data].reverse() : s.data) as any,
        color: s.color,
        dataLabels: {
          enabled: false,
          style: { fontSize: '12px', fontWeight: 'bold' }
        }
      }));

    const axesOptions: Pick<Options, 'xAxis' | 'yAxis' | 'chart'> = {
      chart: {
        type: this.chartType,
        style: { direction: isRtl ? 'rtl' : 'ltr' }
      },
      xAxis: {
        categories: cats,
        reversed: isRtl,
        labels: {
          style: {
            fontSize: '14px',
            color: '#333333',
            textAlign: isRtl ? 'right' : 'left'
          }
        },
        title: { text: NULL_TEXT }
      },
      yAxis: {
        min: undefined,
        title: { text: NULL_TEXT },
        gridLineWidth: 1,
        gridLineColor: '#ccc',
        labels: {
          formatter: function () {
            return H.numberFormat(Number(this.value), 0, '.', ',');
          },
          style: { fontSize: '12px', color: '#777' }
        }
      }
    };

    this.chartOptionsBar = {
      ...axesOptions,

      title: { text: NULL_TEXT },
      subtitle: { text: NULL_TEXT },

      series: mapSeries(this.seriesData),

      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><br>',
        pointFormatter: function () {
          return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${H.numberFormat(Number(this.y), 0, '.', ',')}</b><br>`;
        },
        shared: true,
        useHTML: true
      },

      plotOptions: {
        column: {
          groupPadding: 0.05,
          pointPadding: 0,
          borderWidth: 0
        },
        line: {
          marker: {
            enabled: true,
            symbol: 'circle'
          }
        },
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: function () {
                
              }
            }
          }
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
        labelFormatter: function () {
          return `<span style="font-size:14px;color:#1f2d3d;${isRtl ? 'direction:rtl;' : ''}">${escapeHtml(this.name)}</span>`;
        }
      },

      credits: { enabled: false }
    };
  }
}

// Helper function to escape HTML special characters
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


 /* private buildChartOptions() {
  const isRtl = this.direction === 'rtl';
  const H = Highcharts;

  const NULL_TEXT = null as unknown as string;

  
  const baseCats = this.categories ?? [];
 
  const shouldCatsBeOnYAxis = this.chartType === 'bar';
  const catAxisReversed = isRtl; 
  const cats = catAxisReversed ? [...baseCats].reverse() : baseCats;


  const xAxis: Highcharts.XAxisOptions = shouldCatsBeOnYAxis
    ? {
        //bar
        title: { text: NULL_TEXT },
        gridLineWidth: 1,
        gridLineColor: '#ccc',
        labels: {
          formatter() { return H.numberFormat(Number(this.value), 0, '.', ','); },
          style: { fontSize: '12px', color: '#777' }
        }
      }
    : {
        //other types
        categories: cats,
        reversed: catAxisReversed,
        title: { text: NULL_TEXT },
        labels: {
          style: { fontSize: '14px', color: '#333333', textAlign: isRtl ? 'right' : 'left' }
        }
      };

  const yAxis: Highcharts.YAxisOptions = shouldCatsBeOnYAxis
    ? {
        // bar
        categories: cats,
        reversed: false, 
        title: { text: NULL_TEXT },
        gridLineWidth: 1,
        gridLineColor: '#eee',
        labels: {
          useHTML: true,
          align: isRtl ? 'right' : 'left',
          x: isRtl ? -10 : 10,
          formatter() {
            const value = String(this.value ?? '');
            return `<span style="display:inline-block;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;color:#333;${isRtl ? 'text-align:right;' : 'text-align:left;'}">${escapeHtml(value)}</span>`;
          }
        }
      }
    : {
        // other types
        min: 0,
        title: { text: NULL_TEXT },
        gridLineWidth: 1,
        gridLineColor: '#ccc',
        labels: {
          formatter() { return H.numberFormat(Number(this.value), 0, '.', ','); },
          style: { fontSize: '12px', color: '#777' }
        }
      };

  
  const series = this.seriesData.map<SeriesOptionsType>(s => ({
    name: s.name,
    type: this.chartType,
    data: catAxisReversed ? [...s.data].reverse() as any : (s.data as any),
    color: s.color,
    dataLabels: { enabled: false, style: { fontSize: '12px', fontWeight: 'bold' } }
  }));

  this.chartOptionsBar = {
    chart: {
      type: this.chartType,
      style: { direction: isRtl ? 'rtl' : 'ltr' },
      
      marginLeft: shouldCatsBeOnYAxis && !isRtl ? 120 : undefined,
      marginRight: shouldCatsBeOnYAxis && isRtl ? 120 : undefined
    },

    
    title: { text: NULL_TEXT },
    subtitle: { text: NULL_TEXT },

    xAxis,
    yAxis,

    series,

    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><br>',
      pointFormatter() {
        return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${H.numberFormat(Number(this.y), 0, '.', ',')}</b><br>`;
      },
      shared: true,
      useHTML: true
    },

    plotOptions: {
      column: { groupPadding: 0.05, pointPadding: 0, borderWidth: 0 },
      bar:    { groupPadding: 0.05, pointPadding: 0, borderWidth: 0 },
      line:   { marker: { enabled: true, symbol: 'circle' } },
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
        return `<span style="font-size:14px;color:#1f2d3d;${isRtl ? 'direction:rtl;' : ''}">${escapeHtml(this.name)}</span>`;
      }
    },

    credits: { enabled: false }
  };
} */

/*
private buildChartOptions() {
  const isRtl = this.direction === 'rtl';
  const H = Highcharts;

  const NULL_TEXT = null as unknown as string;

  
  const baseCats = this.categories ?? [];
 
  const shouldCatsBeOnYAxis = this.chartType === 'bar';
  const catAxisReversed = isRtl; 
  const cats = catAxisReversed ? [...baseCats].reverse() : baseCats;

 
  const xAxis: Highcharts.XAxisOptions = shouldCatsBeOnYAxis
    ? {
       
        title: { text: NULL_TEXT },
        gridLineWidth: 1,
        gridLineColor: '#ccc',
        labels: {
          formatter() { return H.numberFormat(Number(this.value), 0, '.', ','); },
          style: { fontSize: '12px', color: '#777' }
        }
      }
    : {
       
        categories: cats,
        reversed: catAxisReversed,
        title: { text: NULL_TEXT },
        labels: {
          style: { fontSize: '14px', color: '#333333', textAlign: isRtl ? 'right' : 'left' }
        }
      };

  const yAxis: Highcharts.YAxisOptions = shouldCatsBeOnYAxis
    ? {
      type: 'category',            
      categories: cats,           
      tickInterval: 1,              
      reversed: false,
      // title: { text: NULL_TEXT },
      gridLineWidth: 1,
      gridLineColor: '#eee',
      labels: {
        useHTML: true,
        align: isRtl ? 'right' : 'left',
        x: isRtl ? -10 : 10,
        formatter: function () {
        
          const axis = this.axis as Highcharts.Axis & { categories?: (string | number)[] };
          const idx =
            typeof this.value === 'number'
              ? this.value
              : (this as unknown as { pos?: number }).pos ?? 0;
          const label = axis.categories?.[idx] ?? this.value;
          console.log("label ",label);
          
          console.log("axis.categories?.[idx]",axis.categories?.[idx]);
          console.log( this.value);
          
          return `<span style="display:inline-block;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;color:#333;${isRtl ? 'text-align:right;' : 'text-align:left;'}">
            ${escapeHtml(String(label ?? ''))}
          </span>`;
        }
      }
    }
    : {
      
        min: 0,
        title: { text: NULL_TEXT },
        gridLineWidth: 1,
        gridLineColor: '#ccc',
        labels: {
          formatter() { return H.numberFormat(Number(this.value), 0, '.', ','); },
          style: { fontSize: '12px', color: '#777' }
        }
      };

 
  const series = this.seriesData.map<SeriesOptionsType>(s => ({
    name: s.name,
    type: this.chartType,
    data: catAxisReversed ? [...s.data].reverse() as any : (s.data as any),
    color: s.color,
    dataLabels: { enabled: false, style: { fontSize: '12px', fontWeight: 'bold' } }
  }));

  this.chartOptionsBar = {
    chart: {
      type: this.chartType,
      style: { direction: isRtl ? 'rtl' : 'ltr' },
     
      marginLeft: shouldCatsBeOnYAxis && !isRtl ? 120 : undefined,
      marginRight: shouldCatsBeOnYAxis && isRtl ? 120 : undefined
    },

    
    title: { text: NULL_TEXT },
    // subtitle: { text: NULL_TEXT },

    xAxis,
    yAxis,

    series,

    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><br>',
      pointFormatter() {
        return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${H.numberFormat(Number(this.y), 0, '.', ',')}</b><br>`;
      },
      shared: true,
      useHTML: true
    },

    plotOptions: {
      column: { groupPadding: 0.05, pointPadding: 0, borderWidth: 0 },
      bar:    { groupPadding: 0.05, pointPadding: 0, borderWidth: 0 },
      line:   { marker: { enabled: true, symbol: 'circle' } },
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
        return `<span style="font-size:14px;color:#1f2d3d;${isRtl ? 'direction:rtl;' : ''}">${escapeHtml(this.name)}</span>`;
      }
    },

    credits: { enabled: false }
  };
} */

  // pure column chart
  // import { CommonModule } from '@angular/common';
// import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// import { HighchartsChartModule } from 'highcharts-angular';
// import Highcharts, { Options, SeriesColumnOptions } from 'highcharts';

// @Component({
//   selector: 'app-bar-chart',
//   standalone: true,
//   imports: [CommonModule, HighchartsChartModule],
//   templateUrl: './bar-chart.component.html',
//   styleUrls: ['./bar-chart.component.scss']
// })
// export class BarChartComponent implements OnChanges {
//   Highcharts: typeof Highcharts = Highcharts;
//   chartOptionsBar: Options = {};
//   chart: Highcharts.Chart | undefined;

//   @Input() categories: string[] = [];
//   @Input() seriesData: { name: string; data: number[]; color?: string }[] = [];
//   @Input() direction: 'rtl' | 'ltr' = 'rtl';

//   ngOnChanges(changes: SimpleChanges): void {
//     console.log(this.categories );

//     this.buildChartOptions();
//   }
//     addComponentRef(chart: Highcharts.Chart) {
//     this.chart = chart;
//   }

//   private buildChartOptions() {
//     const isRtl = this.direction === 'rtl';

//     this.chartOptionsBar = {
//       chart: {
//         type: 'column',
//         style: {
//           direction: isRtl ? 'rtl' : 'ltr' 
//         }
//       },
//       title: { text: '' },
//       xAxis: {
//         categories: isRtl ? [...this.categories].reverse() : this.categories,
//         reversed: isRtl, 
//         labels: {
//           style: {
//             fontSize: '14px',
//             color: '#333333',
//             textAlign: isRtl ? 'right' : 'left'
//           }
//         }
//       },
//       yAxis: {
//         min: 0,
//         title: { text: '' },
//         gridLineWidth: 1,
//         gridLineColor: '#ccc',
//         labels: {
//           style: {
//             fontSize: '12px',
//             color: '#777'
//           }
//         }
//       },
//       series: this.seriesData.map(s => ({
//         name: s.name,
//         type: 'column',
//         data: isRtl ? [...s.data].reverse() : s.data, 
//         color: s.color,
//         dataLabels: {
//           enabled: false,
//           color: '#FFFFFF',
//           style: {
//             fontSize: '12px',
//             fontWeight: 'bold'
//           }
//         }
//       })) as SeriesColumnOptions[],
//       tooltip: {
//         headerFormat: '<span style="font-size: 10px">{point.key}</span><br>',
//         pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br>',
//         valueSuffix: ' units',
//         shared: true,
//         useHTML: true
//       },
//       plotOptions: {
//         column: {
//           groupPadding: 0.05,
//           pointPadding: 0,
//           borderWidth: 0
//         },
//         series: {
//           cursor: 'pointer',
//           point: {
//             events: {
//               click: function () {
//                 alert('تم النقر على: ' + this.category);
//               }
//             }
//           }
//         }
//       },
//       legend: {
//        enabled: false
//       },
//       credits: { enabled: false }
//     };
//   }
// }