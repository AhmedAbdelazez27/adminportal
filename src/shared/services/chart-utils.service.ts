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
      const valueFields = ['value1', 'value2', 'value3', 'value4'];

      valueFields.forEach((field, fieldIndex) => {
        const seriesName = currentLang === 'ar'
          ? this.getSeriesName(field, 'ar')
          : this.getSeriesName(field, 'en');

        const colorForField = this.generateDynamicColor(fieldIndex, valueFields.length);

        const data = res.data.map((item: any) => {
          const value = item[field] || 0;
          return value <= 0 ? null : value; 
        });

        seriesData.push({
          name: seriesName,
          data: data,
          color: colorForField
        });
      });
    }
    else {
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


  parseChartDataforSpons(
    res: any,
    currentLang: string = 'en',
    options: {
      useIndividualSeries?: boolean;
      valueFields?: string[];
      categoryField?: string;
    } = {}
  ): { categories: string[], seriesData: ChartSeriesData[] } {
    const {
      useIndividualSeries = false, // Default to false for 4 value series
      valueFields = ['value1', 'value2', 'value3', 'value4'],
      categoryField = 'nameAr'
    } = options;

    if (!res || !res.data || res.data.length === 0) {
      return this.getDefaultChartData(currentLang);
    }

    // Build categories from data items
    const categories = res.data.map((item: any) => {
      if (currentLang === 'ar') {
        return item.nameAr || item.nameEn || 'غير محدد';
      } else {
        return item.nameEn || item.nameAr || 'Unknown';
      }
    });

    let seriesData: ChartSeriesData[] = [];

    if (useIndividualSeries) {
      // Original individual series logic (one series per data item)
      seriesData = res.data.map((item: any, index: number) => {
        const seriesName = currentLang === 'ar' ?
          (item.nameAr || item.nameEn || `المنظمة ${index + 1}`) :
          (item.nameEn || item.nameAr || `Organization ${index + 1}`);

        const data = res.data.map((dataItem: any, dataIndex: number) => {
          if (dataIndex === index) {
            const value = dataItem.value1 || 0;
            return value == 0 ? null : value;
          }
          return null;
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
      // New logic: Create 4 series (one for each value field) with fixed colors
      const fixedColors = ['#DC2626', '#3B82F6', '#10B981', '#F59E0B']; // Red, Blue, Green, Yellow

      valueFields.forEach((valueField, fieldIndex) => {
        // Always create series for all 4 value fields
        const seriesName = this.getSeriesName(valueField, currentLang, fieldIndex);
        const data = res.data.map((item: any) => {
          const value = item[valueField] || 0;
          return value === 0 ? null : value; // Return null for zero values to hide them
        });

        // Use fixed color for each value field
        const color = fixedColors[fieldIndex % fixedColors.length];

        seriesData.push({
          name: seriesName,
          data: data,
          color: color
        });
      });

      // Remove series that have no data at all
      seriesData = seriesData.filter(series =>
        series.data.some(value => value !== null && value !== 0)
      );

      // Fallback: if no series have data, create at least one with value1
      if (seriesData.length === 0) {
        const seriesName = currentLang === 'ar' ? 'القيمة الأولى' : 'Value 1';
        const data = res.data.map((item: any) => item.value1 || 0);

        seriesData.push({
          name: seriesName,
          data: data,
          color: fixedColors[0] // Red for fallback
        });
      }
    }

    return { categories, seriesData };
  }

  private getSeriesName(valueField: string, currentLang: string, index?: number): string {
    const seriesNames = {
      en: ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
      ar: ['القيمة الأولى', 'القيمة الثانية', 'القيمة الثالثة', 'القيمة الرابعة']
    };

    // If index is provided, use it; otherwise parse from valueField
    const fieldIndex = index !== undefined ? index : parseInt(valueField.replace('value', '')) - 1;

    if (currentLang === 'ar') {
      return seriesNames.ar[fieldIndex] || `القيمة ${fieldIndex + 1}`;
    } else {
      return seriesNames.en[fieldIndex] || `Value ${fieldIndex + 1}`;
    }
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
