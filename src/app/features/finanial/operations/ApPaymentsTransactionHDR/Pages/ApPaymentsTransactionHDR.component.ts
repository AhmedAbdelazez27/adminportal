import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject, take } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApPaymentsTransactionHDRDto, FilterApPaymentsTransactionHDRByIdDto, FilterApPaymentsTransactionHDRDto } from '../../../../../core/dtos/ApPaymentsTransactionHDRdtos/ApPaymentsTransactionHDR.dto';
import { ApPaymentsTransactionHDRService } from '../../../../../core/services/ApPaymentsTransactionHDR.service';
import { FndLookUpValuesSelect2RequestDto, Pagination, SelectdropdownResult, SelectdropdownResultResults } from '../../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-ApPaymentsTransactionHDR',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ApPaymentsTransactionHDR.component.html',
  styleUrls: ['./ApPaymentsTransactionHDR.component.scss']
})

export class ApPaymentsTransactionHDRComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  public pagination = new Pagination();

  public EntityList: SelectdropdownResultResults[] = [];
  public PaymentTypeDescList: SelectdropdownResultResults[] = [];
  public VendorNameList: SelectdropdownResultResults[] = [];

  public filterApPaymentsTransactionHDRObj = new FilterApPaymentsTransactionHDRDto();
  public searchFndLookUpValuesSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  public filterApPaymentsTransactionHDRByIdObj = new FilterApPaymentsTransactionHDRByIdDto();

  public apPaymentsTransactionHDRListData: ApPaymentsTransactionHDRDto[] = [];
  public apPaymentsTransactionHDRData: ApPaymentsTransactionHDRDto = {} as ApPaymentsTransactionHDRDto;

  private destroy$ = new Subject<void>();
  public loading = false;
  public selectedVendorObj: any = null;
  public selectedEntityObj: any = null;
  public selectedPaymentTypeObj: any = null;

  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  constructor(
    private apPaymentsTransactionHDRService: ApPaymentsTransactionHDRService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private fb: FormBuilder
  )
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.fetchEntityList();
    this.fetchVendorNameList();
    this.fetchPaymentTypeDescList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public fetchEntityList(): void {
    this.apPaymentsTransactionHDRService.getEntityList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.EntityList = response?.results || [];
      },
      error: (err) => {
        this.toastr.error('Failed to load entity list.', 'Error');
        console.error('Entity list load error', err);
      }
    });
  }

  public fetchVendorNameList(): void {
    this.apPaymentsTransactionHDRService.getApVendorList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.VendorNameList = response?.results || [];
      },
        error: (err) => {
          this.toastr.error('Failed to load Vendor list.', 'Error');
          console.error('Vendor list load error', err);
      }
    });
  }
  public fetchPaymentTypeDescList(): void {
    this.apPaymentsTransactionHDRService.getPaymentTypeList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.PaymentTypeDescList = response?.results || [];
      },
        error: (err) => {
          this.toastr.error('Failed to load PaymentType list.', 'Error');
          console.error('PaymentType  list load error', err);
      }
    });
  }

  public focused(event: any): void {
    const label = event.target.parentElement.querySelector('label');
    if (label && !label.classList.contains('label-over')) {
      label.classList.add('label-over');
    }
  }

  public blured(event: FocusEvent, value: string | null): void {
    const target = event.target as HTMLElement;
    const label = target.parentElement?.querySelector('label');
    if (label && label.classList.contains('label-over') && (!value || value === '')) {
      label.classList.remove('label-over');
    }
  }

  public getApPaymentsTransactionHDR(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.pagination.itemsPerPage;
    if (!this.filterApPaymentsTransactionHDRObj.EntityId) return;
    this.loading = true;

    this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRs(this.filterApPaymentsTransactionHDRObj)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.apPaymentsTransactionHDRListData = response || [];
        this.pagination.totalCount = response?.totalCount || 0;
        this.calculatePages();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Error fetching ApPaymentsTransactionHDRs details.', 'Error');
        console.error('Error fetching ApPaymentsTransactionHDRs:', error);
      }
    });
  }

  public calculatePages(): void {
    const totalPages = Math.ceil(this.pagination.totalCount / this.pagination.itemsPerPage);
    this.pagination.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  public changePage(event: any): void {
    if (event < 1) event = 1;
    if (event > this.pagination.pages.length) event = this.pagination.pages.length;
    this.pagination.currentPage = event;
    this.getApPaymentsTransactionHDR(event, this.pagination.searchValue);
  }

  public changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.pagination.itemsPerPage = perPage;
      this.calculatePages();
      this.getApPaymentsTransactionHDR(1, this.pagination.searchValue);
    }
  }


  public onVendorNameChange(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterApPaymentsTransactionHDRObj.VendorName = selectedVendor.id;
      this.filterApPaymentsTransactionHDRObj.VendorNamestr = selectedVendor.text;
    } else {
      this.filterApPaymentsTransactionHDRObj.VendorName = null;
      this.filterApPaymentsTransactionHDRObj.VendorNamestr = null;
    }
  }

  public onEntityChange(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterApPaymentsTransactionHDRObj.EntityId = selectedVendor.id;
      this.filterApPaymentsTransactionHDRObj.EntityIdstr = selectedVendor.text;
    } else {
      this.filterApPaymentsTransactionHDRObj.EntityId = null;
      this.filterApPaymentsTransactionHDRObj.EntityIdstr = null;
    }
  }

  public onPaymentTypeChange(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterApPaymentsTransactionHDRObj.PaymentTypeDesc = selectedVendor.id;
      this.filterApPaymentsTransactionHDRObj.PaymentTypeDescstr = selectedVendor.text;
    } else {
      this.filterApPaymentsTransactionHDRObj.PaymentTypeDesc = null;
      this.filterApPaymentsTransactionHDRObj.PaymentTypeDescstr = null;
    }
  }


  public onSearch(): void {
    this.pagination.currentPage = 1;

    const cleanedFilters = this.cleanFilterObject(this.filterApPaymentsTransactionHDRObj);
    if (!this.filterApPaymentsTransactionHDRObj.EntityId) {
      this.toastr.warning('Please Select EntityID', 'Warning');
      return;
    }
    this.loading = true;
    this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRs(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.apPaymentsTransactionHDRListData = response || [];
        this.pagination.totalCount = response?.totalCount || 0;
          this.calculatePages();
          this.loading = false;
      },
        error: (error) => {
          this.toastr.error('Error fetching ApPaymentsTransactionHDRs details.', 'Error');
        console.error('Error fetching ApPaymentsTransactionHDRs:', error);
      }
    });
  }

  private cleanFilterObject(obj: any): any {
    const cleaned = { ...obj };
    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] === '') {
        cleaned[key] = null;
      }
    });
    return cleaned;
  }

  clear(): void {
    this.filterApPaymentsTransactionHDRObj = new FilterApPaymentsTransactionHDRDto();
    this.apPaymentsTransactionHDRListData = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  public getApPaymentsTransactionHDRDetailById(tr_Id: string, entitY_ID: string): void {
    const params: FilterApPaymentsTransactionHDRByIdDto = {
      EntityId: entitY_ID,
      PaymentId: tr_Id
    };
    this.loading = true;
    forkJoin({
      mischeaderdata: this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRDatabyId(params) as Observable<
        ApPaymentsTransactionHDRDto | ApPaymentsTransactionHDRDto[]>,
    })
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.apPaymentsTransactionHDRData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as ApPaymentsTransactionHDRDto)
          : result.mischeaderdata;
          this.loading = false;
      },
        error: (err) => {
          this.loading = false;
          this.toastr.error('Error fetching PaymentsTransaction details.', 'Error');
          console.error('Error fetching PaymentsTransaction details:', err);
      }
    });
  }

  printExcel(): void {
    this.filterApPaymentsTransactionHDRObj.Take = 999999;
    const cleanedFilters = this.cleanFilterObject(this.filterApPaymentsTransactionHDRObj);
    this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRs(cleanedFilters).subscribe({
      next: (response: any) => {
        const data = response?.items || response || [];

        const title = this.translate.instant('ApPaymentsTransactionHDRResourceName.Title');

        const filterFields = [
          { key: 'EntityIdstr', label: this.translate.instant('ApPaymentsTransactionHDRResourceName.EntityId') },
          { key: 'PaymentNumber', label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentNumber') },
          { key: 'PaymentDate', label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentDate') },
          { key: 'VendorNumber', label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorNumber') },
          { key: 'VendorNamestr', label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorName') },
          { key: 'PaymentTypeDescstr', label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentTypeDesc') }
        ];

        const filterObj = this.filterApPaymentsTransactionHDRObj;

        const filterRow = filterFields.map(field => {
          const value = filterObj && (filterObj as any)[field.key];
          const displayValue = value !== null && value !== undefined && value !== '' ? value : '-';
          return `${field.label}: ${displayValue}`;
        });

        const tableHeader = [
          '#',
          this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentNumber'),
          this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentDate'),
          this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentTypeDesc'),
          this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorNumber'),
          this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorName'),
          this.translate.instant('ApPaymentsTransactionHDRResourceName.Amount')
        ];

        const tableRows = data.map((item: any, index: number) => [
          (index + 1).toString(),
          item.paymenT_NUMBER || '',
          item.paymenT_DATEstr || '',
          item.paymenT_TYPE_DESC || '',
          item.vendoR_NUMBER || '',
          item.vendoR_NAME || '',
          item.paymenT_AMOUNTstr || ''
        ]);

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
        const fileName = `${this.translate.instant('ApPaymentsTransactionHDRResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
      },
      error: (error) => {
        this.toastr.error('Failed to fetch data for Excel export');
        console.error('Error fetching data for Excel export:', error);
      }
    });
  }
}

