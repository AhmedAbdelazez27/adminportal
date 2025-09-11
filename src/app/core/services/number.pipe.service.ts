import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'numberFormat',
  standalone: true

})
export class NumberFormatPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: number | string, fractionDigits: number = 2): string {
    if (value == null || value === '') return '';

    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;

    // Force English-style formatting (1,932.00) regardless of language
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(num);
  }
}
