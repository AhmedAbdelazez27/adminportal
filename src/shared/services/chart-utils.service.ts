import { Injectable } from '@angular/core';

export interface ChartSeriesData {
  name: string;
  data: number[];
  color: string;
}

export interface ChartDataItem {
  id?: string;
  nameAr?: string;
  nameEn?: string;
  value1?: number;
  value2?: number;
  value3?: number;
  value4?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChartUtilsService {

  constructor() { }

  generateDynamicColor(index: number, totalCount: number): string {
    const hue = (index * 360) / totalCount;
    const saturation = 70 + (index % 3) * 10; 
    const lightness = 45 + (index % 4) * 10;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  adjustColorForNegative(color: string): string {
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const hue = parseInt(hslMatch[1]);
      const saturation = parseInt(hslMatch[2]);
      const lightness = parseInt(hslMatch[3]);
      
      const newSaturation = Math.max(30, saturation - 20);
      const newLightness = Math.max(25, lightness - 15);
      
      return `hsl(${hue}, ${newSaturation}%, ${newLightness}%)`;
    }
    
    return color;
  }

  parseChartData(
    res: any, 
    currentLang: string = 'en',
    options: {
      useIndividualSeries?: boolean;
      valueFields?: string[];
      categoryField?: string;
    } = {}
  ): { categories: string[], seriesData: ChartSeriesData[] } {
    
    const {
      useIndividualSeries = true,
      valueFields = ['value1', 'value2', 'value3', 'value4'],
      categoryField = 'nameAr'
    } = options;

    if (!res || !res.data || res.data.length === 0) {
      return this.getDefaultChartData(currentLang);
    }

    const categories = res.data.map((item: any) => {
      if (currentLang === 'ar') {
        return item.nameAr || item.nameEn || 'غير محدد';
      } else {
        return item.nameEn || item.nameAr || 'Unknown';
      }
    });

    let seriesData: ChartSeriesData[] = [];
    if (useIndividualSeries) {
      seriesData = res.data.map((item: any, index: number) => {
        const seriesName = currentLang === 'ar' ? 
          (item.nameAr || item.nameEn || `المنظمة ${index + 1}`) : 
          (item.nameEn || item.nameAr || `Organization ${index + 1}`);
        
        const data = res.data.map((dataItem: any, dataIndex: number) => {
          if (dataIndex === index) {
            const value = dataItem.value1 || 0;
            return value;
          }
          return 0;
        });

        const baseColor = this.generateDynamicColor(index, res.data.length);
        const itemValue = item.value1 || 0;
        const color = itemValue < 0 ? this.adjustColorForNegative(baseColor) : baseColor;

        return {
          name: seriesName,
          data: data,
          color: color
        };
      });
    } else {
      valueFields.forEach((valueField, fieldIndex) => {
        const hasValue = res.data.some((item: any) => 
          item[valueField] != null && item[valueField] !== 0
        );

        if (hasValue) {
          const seriesName = this.getSeriesName(valueField, currentLang);
          const data = res.data.map((item: any) => item[valueField] || 0);
          const color = this.generateDynamicColor(fieldIndex, valueFields.length);

          seriesData.push({
            name: seriesName,
            data: data,
            color: color
          });
        }
      });

      if (seriesData.length === 0) {
        const seriesName = currentLang === 'ar' ? 'القيمة الأولى' : 'Value 1';
        const data = res.data.map((item: any) => item.value1 || 0);
        const color = this.generateDynamicColor(0, 1);

        seriesData.push({
          name: seriesName,
          data: data,
          color: color
        });
      }
    }

    return { categories, seriesData };
  }


  private getSeriesName(valueField: string, currentLang: string): string {
    const seriesNames: { [key: string]: { ar: string, en: string } } = {
      'value1': { ar: 'القيمة الأولى', en: 'Value 1' },
      'value2': { ar: 'القيمة الثانية', en: 'Value 2' },
      'value3': { ar: 'القيمة الثالثة', en: 'Value 3' },
      'value4': { ar: 'القيمة الرابعة', en: 'Value 4' }
    };

    const names = seriesNames[valueField];
    if (names) {
      return currentLang === 'ar' ? names.ar : names.en;
    }

    return valueField;
  }


  private getDefaultChartData(currentLang: string): { categories: string[], seriesData: ChartSeriesData[] } {
    const defaultCategories = ['Cat 1', 'Cat 2', 'Cat 3'];
    
    const seriesData = defaultCategories.map((categoryName, index) => ({
      name: categoryName,
      data: defaultCategories.map((_, dataIndex) => 
        dataIndex === index ? Math.floor(Math.random() * 1001) : 0
      ),
      color: this.generateDynamicColor(index, defaultCategories.length)
    }));

    return {
      categories: defaultCategories,
      seriesData: seriesData
    };
  }

  generateRandomValues(count: number): number[] {
    const randomValues: number[] = [];
    for (let i = 0; i < count; i++) {
      randomValues.push(Math.floor(Math.random() * 1001));
    }
    return randomValues;
  }
}
