import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject } from 'rxjs';
import {ArMiscReceiptDetailsDto, ArMiscReceiptHeaderDto, ArMiscReceiptLinesDto, FilterArMiscReceiptHeaderByIdDto,FilterArMiscReceiptHeaderDto} from '../../../core/dtos/ArMiscReceiptHeaderdtos/ArMiscReceiptHeader.dto';
import { ArMiscReceiptHeaderService } from '../../../core/services/ArMiscReceiptHeader.service';
import {FndLookUpValuesSelect2RequestDto,Pagination,SelectdropdownResult,SelectdropdownResultResults, reportPrintConfig} from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import * as XLSX from 'xlsx';
import { takeUntil } from 'rxjs/operators';
import { openStandardReportService } from '../../../core/services/openStandardReportService.service';

@Component({
  selector: 'app-ArMiscReceiptHeader',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ArMiscReceiptHeader.component.html',
  styleUrls: ['./ArMiscReceiptHeader.component.scss']
})

export class ArMiscReceiptHeaderComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  private destroy$ = new Subject<void>();

  pagination = new Pagination();
  entitySelect2: SelectdropdownResultResults[] = [];
  statusSelect2: SelectdropdownResultResults[] = [];
  projectNameSelect2: SelectdropdownResultResults[] = [];
  benNameSelect2: SelectdropdownResultResults[] = [];
  arMiscReceiptHeaderListData: ArMiscReceiptHeaderDto[] = [];
  arMiscReceiptHeaderData: ArMiscReceiptHeaderDto = {} as ArMiscReceiptHeaderDto;
  arMiscReceiptLineData: ArMiscReceiptLinesDto[] = [];
  arMiscReceiptDetailsData: ArMiscReceiptDetailsDto[] = [];
  filterArMiscReceiptHeaderObj = new FilterArMiscReceiptHeaderDto();
  searchFndLookUpValuesSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  filterArMiscReceiptHeaderByIdObj = new FilterArMiscReceiptHeaderByIdDto();

  loading = false;
  selectedentitySelect2Obj: any = null;
  selectedstatusSelect2Obj: any = null;
  selectedprojectNameSelect2Obj: any = null;
  selectedbenNameSelect2Obj: any = null;

  constructor(
    private ArMiscReceiptHeaderService: ArMiscReceiptHeaderService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService
  )
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.fetchEntityList();
    this.fetchStatusList();
    this.fetchProjectNameList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchEntityList(): void {
    this.ArMiscReceiptHeaderService.getEntityList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.entitySelect2 = response?.results || [];
      },
      error: (err) => {
        this.toastr.error('Failed to load Entity.', 'Error');
      }
    });
  }

  fetchStatusList(): void {
    this.ArMiscReceiptHeaderService.getStatusList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.statusSelect2 = response?.results || [];
      },
      error: (err) => {
        this.toastr.error('Failed to load Status.', 'Error');
      }
    });
  } 

  fetchProjectNameList(): void {
    this.ArMiscReceiptHeaderService.getProjectNameList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.projectNameSelect2 = response?.results || [];
      },
      error: (err) => {
        this.toastr.error('Failed to load Project.', 'Error');
      }
    });
  }

  fetchBenNameList(): void {
    this.ArMiscReceiptHeaderService.getBenNameList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.benNameSelect2 = response?.results || [];
      },
      error: (err) => {
        this.toastr.error('Failed to load BenName.', 'Error');
      }
    });
  }

  getArMiscReceiptHeader(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.pagination.itemsPerPage;
    if (!this.filterArMiscReceiptHeaderObj.entityId) return;
    this.loading = true;
    this.ArMiscReceiptHeaderService.getArMiscReceiptHeaders(this.filterArMiscReceiptHeaderObj)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.arMiscReceiptHeaderListData = response || [];
        this.pagination.totalCount = response?.totalCount || 0;
          this.calculatePages();
          this.loading = false;
      },
        error: (error) => {
          this.loading = false;
          this.toastr.error('Error fetching Data.', 'Error');
      }
    });
  }

  calculatePages(): void {
    const totalPages = Math.ceil(this.pagination.totalCount / this.pagination.itemsPerPage);
    this.pagination.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(event: any): void {
    if (event < 1) event = 1;
    if (event > this.pagination.pages.length) event = this.pagination.pages.length;
    this.pagination.currentPage = event;
    this.getArMiscReceiptHeader(event, this.pagination.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.pagination.itemsPerPage = perPage;
      this.calculatePages();
      this.getArMiscReceiptHeader(1, this.pagination.searchValue);
    }
  }

  onstatusSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterArMiscReceiptHeaderObj.status = selectedVendor.id;
      this.filterArMiscReceiptHeaderObj.statusStr = selectedVendor.text;
    } else {
      this.filterArMiscReceiptHeaderObj.status = null;
      this.filterArMiscReceiptHeaderObj.statusStr = null;
    }
  }

  onentitySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterArMiscReceiptHeaderObj.entityId = selectedVendor.id;
      this.filterArMiscReceiptHeaderObj.entityIdStr = selectedVendor.text;
    } else {
      this.filterArMiscReceiptHeaderObj.entityId = null;
      this.filterArMiscReceiptHeaderObj.entityIdStr = null;
    }
  }

  onprojectNameSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterArMiscReceiptHeaderObj.projectName = selectedVendor.id;
      this.filterArMiscReceiptHeaderObj.projectNameStr = selectedVendor.text;
    } else {
      this.filterArMiscReceiptHeaderObj.projectName = null;
      this.filterArMiscReceiptHeaderObj.projectNameStr = null;
    }
  }

  onbenNameSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterArMiscReceiptHeaderObj.benName = selectedVendor.id;
      this.filterArMiscReceiptHeaderObj.benNameStr = selectedVendor.text;
    } else {
      this.filterArMiscReceiptHeaderObj.benName = null;
      this.filterArMiscReceiptHeaderObj.benNameStr = null;
    }
  }

  onSearch(): void {
    this.pagination.currentPage = 1;
    const cleanedFilters = this.cleanFilterObject(this.filterArMiscReceiptHeaderObj);
    if (!this.filterArMiscReceiptHeaderObj.entityId) {
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.loading = true;

    this.ArMiscReceiptHeaderService.getArMiscReceiptHeaders(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.arMiscReceiptHeaderListData = response || [];
        this.pagination.totalCount = response?.totalCount || 0;
          this.calculatePages();
          this.loading = false;
      },
        error: (error) => {
          this.loading = false;
          this.toastr.error('Error fetching Data.', 'Error');
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
    this.filterArMiscReceiptHeaderObj = new FilterArMiscReceiptHeaderDto();
    this.arMiscReceiptHeaderListData = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  getArMiscReceiptHeaderDetailById(tr_Id: string, entitY_ID: string): void {
    const params: FilterArMiscReceiptHeaderByIdDto = {
      entityId: entitY_ID,
      miscReceiptId: tr_Id
    };
    this.loading = true;
    forkJoin({
      mischeaderdata: this.ArMiscReceiptHeaderService.getArMiscReceiptHeaderDatabyId(params) as Observable<ArMiscReceiptHeaderDto | ArMiscReceiptHeaderDto[]>,
      miscdetaildata: this.ArMiscReceiptHeaderService.getArMiscReceiptDetailDatabyId(params) as Observable<ArMiscReceiptDetailsDto[]>,
      misclinedata: this.ArMiscReceiptHeaderService.getArMiscReceiptLineDatabyId(params) as Observable<ArMiscReceiptLinesDto[]>
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.arMiscReceiptDetailsData = result.miscdetaildata ?? [];
        this.arMiscReceiptLineData = result.misclinedata ?? [];
        this.arMiscReceiptHeaderData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as ArMiscReceiptHeaderDto)
          : result.mischeaderdata;
        this.loading = false
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Error fetching Data.', 'Error');
     }
    });
  }


  printExcel(): void {
    this.filterArMiscReceiptHeaderObj.take = 999999;
    this.loading = true;
    const cleanedFilters = this.cleanFilterObject(this.filterArMiscReceiptHeaderObj);
    if (!this.filterArMiscReceiptHeaderObj.entityId) {
      this.toastr.warning('Please Select EntityID', 'Warning');
      return;
    }
    this.ArMiscReceiptHeaderService.getArMiscReceiptHeaders(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const data = response?.items || response || [];

          const reportConfig: reportPrintConfig = {
            title: this.translate.instant('ArMiscReceiptHeaderResourceName.catchReceipt_Title'),
            reportTitle: this.translate.instant('ArMiscReceiptHeaderResourceName.catchReceipt_Title'),
            fileName: `${this.translate.instant('ArMiscReceiptHeaderResourceName.catchReceipt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
            fields: [
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.EntityId'), value: this.filterArMiscReceiptHeaderObj.entityIdStr },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.DocumentNumber'), value: this.filterArMiscReceiptHeaderObj.receiptNumber },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.ChequeNo'), value: this.filterArMiscReceiptHeaderObj.checkNumber },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.BeneficiaryName'), value: this.filterArMiscReceiptHeaderObj.benificaryNamestr },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Status'), value: this.filterArMiscReceiptHeaderObj.statusStr },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.ProjectName'), value: this.filterArMiscReceiptHeaderObj.projectNameStr },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Sponsor'), value: this.filterArMiscReceiptHeaderObj.benNameStr },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Amount'), value: this.filterArMiscReceiptHeaderObj.amount },
            ],

            columns: [
              { label: '#', key: 'rowNo', title: '#' },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.DocumentNumber'), key: 'receipT_NUMBER' },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.MISC_RECEIPT_DATE'), key: 'misC_RECEIPT_DATEstr' },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.beneficiarY_NAME'), key: 'beneficiarY_NAME' },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.AMOUNT'), key: 'amounTstr' },
              { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Status'), key: 'posted' },
            ],
            data: data.map((item: any, index: number) => ({
              ...item,
              rowNo: index + 1
            })),
            totalLabel: this.translate.instant('Common.Total'),
            totalKeys: ['receiptAmountstr', 'chequeAmountstr', 'cashAmountstr', 'administrativeAmountstr']
          };

          this.openStandardReportService.openStandardReportExcel(reportConfig);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Failed to export Excel');
        }
      });
  }
}

