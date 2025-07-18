import * as XLSX from 'xlsx';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExcelExportService {

  generateExcel(options: {
    title: string,
    filterFields: { key: string, label: string }[],
    filterObj: any,
    tableHeader: string[],
    tableRows: any[][],
    fileName?: string
  }): void {
    const { title, filterFields, filterObj, tableHeader, tableRows, fileName } = options;

    const filterRow = filterFields.map(field => {
      const value = filterObj?.[field.key];
      const displayValue = value !== null && value !== undefined && value !== '' ? value : '-';
      return `${field.label}: ${displayValue}`;
    });

    const wsData: any[][] = [
      [title],
      [],
      filterRow,
      [],
      [],
      tableHeader,
      ...tableRows
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: tableHeader.length - 1 } }
    ];

    ws['!cols'] = tableHeader.map((_, colIdx) => {
      const maxLen = wsData.map(row => row[colIdx]?.toString().length || 0).reduce((a, b) => Math.max(a, b), 10);
      return { wch: maxLen + 2 };
    });

    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        ws[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center' };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    const generatedFileName = fileName || `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, generatedFileName);
  }
}
