import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceiptvoucherReportService } from '../../../core/services/receiptvoucher-report.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-receiptvoucher-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receiptvoucher-report.component.html',
  styleUrl: './receiptvoucher-report.component.scss'
})
export class ReceiptvoucherReportComponent implements OnInit {
  cachReceiptRptList: any[] = [];
  categoryList: any[] = [];
  collectorList: any[] = [];
  entityList: any[] = [];

  filterModel = {
    entityId: '',
    FromDate: null,
    ToDate: null,
    FromNo: '',
    ToNo: '',
    CollectorName: '',
    Type: ''
  };

  constructor(private readonly apiService: ReceiptvoucherReportService) {}

  ngOnInit(): void {}

  getCachReceiptRpt(): void {
    const filter = { ...this.filterModel };
    if (!filter.entityId) {
      alert('Please select an entity before searching.');
      return;
    }
    this.apiService.getCachReceiptRpt(filter).subscribe({
      next: (response: any[]) => {
        this.cachReceiptRptList = (response || []).map((item: any) => {
          if (item.misC_RECEIPT_DATE) {
            item.misC_RECEIPT_DATE = this.formatDate(item.misC_RECEIPT_DATE);
          }
          return item;
        });
      },
      error: (err) => console.error('API error:', err)
    });
  }

  loadCollector(): void {
    if (this.collectorList.length > 0) return;
    const request = { searchTerm: '', take: 100, skip: 0 };
    this.apiService.getCollector(request).subscribe({
      next: (response: any) => (this.collectorList = response?.results || []),
      error: (err) => console.error('Collector list load error', err)
    });
  }

  loadCategory(): void {
    if (this.categoryList.length > 0) return;
    const request = { searchTerm: '', take: 100, skip: 0 };
    this.apiService.getCategory(request).subscribe({
      next: (response: any) => (this.categoryList = response?.results || []),
      error: (err) => console.error('Category list load error', err)
    });
  }

  loadEntities(): void {
    if (this.entityList.length > 0) return;
    this.apiService.getEntities().subscribe({
      next: (response: any) => (this.entityList = response?.data || []),
      error: (err) => console.error('Entity load error', err)
    });
  }

  applyFilter(): void {
    this.getCachReceiptRpt();
  }

  clearFilter(): void {
    this.filterModel = {
      entityId: '',
      FromDate: null,
      ToDate: null,
      FromNo: '',
      ToNo: '',
      CollectorName: '',
      Type: ''
    };
  }

  downloadPDF(): void {
    this.printCachReceiptRpt();
  }

  printCachReceiptRpt(): void {
    const filter = { ...this.filterModel };
    if (!filter.entityId) {
      alert('Please select an entity before printing.');
      return;
    }
    this.apiService.printCachReceiptRpt(filter).subscribe({
      next: (response: any[]) => {
        this.cachReceiptRptList = Array.isArray(response) ? response : [];
        this.cachReceiptRptList.forEach(item => {
          if (item.misC_RECEIPT_DATE) {
            item.misC_RECEIPT_DATE = this.formatDate(item.misC_RECEIPT_DATE);
          }
        });
        this.openPrintPreview();
      },
      error: (err) => console.error('API error:', err)
    });
  }

  getEntityName(): string {
    const selected = this.entityList.find(e => e.entitY_ID === this.filterModel.entityId);
    return selected ? selected.entitY_NAME : '';
  }

  getType(): string {
    const selected = this.categoryList.find(c => c.id === this.filterModel.Type);
    return selected ? selected.text : '';
  }

  openPrintPreview(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const additionalStyles = `
      <link href="${window.location.origin}/assets/css/bootstrap.min.css" rel="stylesheet" />
      <link href="${window.location.origin}/assets/css/styles.css" rel="stylesheet" />
      <script src="${window.location.origin}/assets/js/bootstrap.bundle.min.js"></script>
    `;

    const tableRows = this.cachReceiptRptList.map((receipt, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${receipt.banK_ACCOUNT_NAME || ''}</td>
        <td>${receipt.beneficiarY_NAME || ''}</td>
        <td>${receipt.notes || ''}</td>
        <td>${receipt.transactioN_TYPE_DESC || ''}</td>
        <td>${receipt.receipT_NUMBER || ''}</td>
        <td>${receipt.misC_RECEIPT_DATE || ''}</td>
        <td>${receipt.receipT_AMOUNT || '0.00'}</td>
        <td>${receipt.chequE_AMOUNT || '0.00'}</td>
        <td>${receipt.casH_AMOUNT || '0.00'}</td>
        <td>${receipt.administrativE_AMOUNT || '0.00'}</td>
        <td>${receipt.collectoR_NAME || ''}</td>
      </tr>
    `).join('');

    const totalReceiptAmount = this.getTotal('receipT_AMOUNT');
    const totalChequeAmount = this.getTotal('chequE_AMOUNT');
    const totalCashAmount = this.getTotal('casH_AMOUNT');
    const totalAdminAmount = this.getTotal('administrativE_AMOUNT');

    printWindow.document.write(`
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Receipt Voucher Report</title>
${additionalStyles}
<style>
  body { padding: 20px; font-family: Arial, sans-serif; }
  .report-header img { margin-right: 10px; }
  .title { color: #b68d40; font-weight: bold; font-size: 24px; }
  .border-bottom { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
  label.bold { font-weight: bold; display: block; }
  p { margin: 0 0 8px 0; }
  .new-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 14px;
    text-align: center;
    border-radius: 10px;
    overflow: hidden;
  }
  .new-table thead th {
    background-color: #f2f2f2;
    color: #000;
    font-weight: bold;
    padding: 12px;
    border-bottom: 1px solid #ddd;
  }
  .new-table tbody td {
    padding: 10px;
    border-bottom: 1px solid #e0e0e0;
    color: #333;
  }
  .new-table tbody tr:nth-child(even) {
    background-color: #fafafa;
  }
  .new-table tfoot td {
    padding: 10px;
    font-weight: bold;
    background-color: #f2f2f2;
    border-top: 1px solid #ddd;
  }
</style>
</head>
<body>
  <div class="report-header mb-4 d-flex justify-content-between align-items-center">
    <h2 class="title">Receipt Voucher</h2>
    <div class="d-flex align-items-center gap-3">
      <img src="${window.location.origin}/assets/img/logo.png" width="100px" />
    </div>
  </div>

  <div class="container-fluid">
    <div class="border-bottom mb-4">
      <div class="row" style="display:flex; flex-wrap:wrap;">
        <div class="col-6 mb-3" style="width:50%;">
          <label class="bold black">Entity</label>
          <p>${this.getEntityName() || ''}</p>
        </div>
        <div class="col-6 mb-3" style="width:50%;">
          <label class="bold black">Category</label>
          <p>${this.getType() || ''}</p>
        </div>
        <div class="col-6 mb-3" style="width:50%;">
          <label class="bold black">From Date</label>
          <p>${this.filterModel.FromDate || ''}</p>
        </div>
        <div class="col-6 mb-3" style="width:50%;">
          <label class="bold black">To Date</label>
          <p>${this.filterModel.ToDate || ''}</p>
        </div>
        <div class="col-6 mb-3" style="width:50%;">
          <label class="bold black">From Document No</label>
          <p>${this.filterModel.FromNo || ''}</p>
        </div>
        <div class="col-6 mb-3" style="width:50%;">
          <label class="bold black">To Document No</label>
          <p>${this.filterModel.ToNo || ''}</p>
        </div>
        <div class="col-6 mb-3" style="width:50%;">
          <label class="bold black">Collector</label>
          <p>${this.filterModel.CollectorName || ''}</p>
        </div>
      </div>
    </div>

    <div class="report-section">
      <table class="new-table mb-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Bank Account Name</th>
            <th>Beneficiary Name</th>
            <th>Notes</th>
            <th>Transaction Type</th>
            <th>Receipt Number</th>
            <th>Receipt Date</th>
            <th>Receipt Amount</th>
            <th>Cheque Amount</th>
            <th>Cash Amount</th>
            <th>Administrative Amount</th>
            <th>Collector Name</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="7" style="text-align:right;">Total</td>
            <td>${totalReceiptAmount}</td>
            <td>${totalChequeAmount}</td>
            <td>${totalCashAmount}</td>
            <td>${totalAdminAmount}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

<script>
  window.onload = function() {
    setTimeout(() => {
      window.print();
      window.close();
    }, 500);
  }
</script>
</body>
</html>
    `);

    printWindow.document.close();
  }

  getTotal(field: string): string {
    return this.cachReceiptRptList
      .reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0)
      .toFixed(2);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  downloadExcel(): void {
    this.getexcelCachReceiptRpt();
  }

  getexcelCachReceiptRpt(): void {
    const filter = { ...this.filterModel };
    if (!filter.entityId) {
      alert('Please select an entity before printing.');
      return;
    }
    this.apiService.excelCachReceiptRpt(filter).subscribe({
      next: (response: any[]) => {
        this.cachReceiptRptList = Array.isArray(response) ? response : [];
        this.cachReceiptRptList.forEach(item => {
          if (item.misC_RECEIPT_DATE) {
            item.misC_RECEIPT_DATE = this.formatDate(item.misC_RECEIPT_DATE);
          }
        });
        this.excelCachReceiptRpt();
      },
      error: (err) => console.error('API error:', err)
    });
  }

  excelCachReceiptRpt(): void {
    if (!this.cachReceiptRptList || this.cachReceiptRptList.length === 0) {
      alert('No data available to export');
      return;
    }

    const exportData = this.cachReceiptRptList.map((receipt, index) => ({
      'Bank Account Name': receipt.banK_ACCOUNT_NAME || '',
      'Beneficiary Name': receipt.beneficiarY_NAME || '',
      'Notes': receipt.notes || '',
      'Transaction Type': receipt.transactioN_TYPE_DESC || '',
      'Receipt Number': receipt.receipT_NUMBER || '',
      'Receipt Date': receipt.misC_RECEIPT_DATE || '',
      'Receipt Amount': receipt.receipT_AMOUNT || '0.00',
      'Cheque Amount': receipt.chequE_AMOUNT || '0.00',
      'Cash Amount': receipt.casH_AMOUNT || '0.00',
      'Administrative Amount': receipt.administrativE_AMOUNT || '0.00',
      'Collector Name': receipt.collectoR_NAME || ''
    }));

    exportData.push({
      'Bank Account Name': '',
      'Beneficiary Name': '',
      'Notes': '',
      'Transaction Type': '',
      'Receipt Number': '',
      'Receipt Date': 'Total',
      'Receipt Amount': this.getTotal('receipT_AMOUNT'),
      'Cheque Amount': this.getTotal('chequE_AMOUNT'),
      'Cash Amount': this.getTotal('casH_AMOUNT'),
      'Administrative Amount': this.getTotal('administrativE_AMOUNT'),
      'Collector Name': ''
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Receipt Voucher': worksheet }, SheetNames: ['Receipt Voucher'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileName = `Receipt_Voucher_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
  }

}
