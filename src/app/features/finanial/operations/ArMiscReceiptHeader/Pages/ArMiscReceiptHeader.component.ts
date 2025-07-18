import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject } from 'rxjs';
import {ArMiscReceiptDetailsDto, ArMiscReceiptHeaderDto, ArMiscReceiptLinesDto, FilterArMiscReceiptHeaderByIdDto,FilterArMiscReceiptHeaderDto} from '../../../../../core/dtos/ArMiscReceiptHeaderdtos/ArMiscReceiptHeader.dto';
import { ArMiscReceiptHeaderService } from '../../../../../core/services/ArMiscReceiptHeader.service';
import {FndLookUpValuesSelect2RequestDto,Pagination,SelectdropdownResult,SelectdropdownResultResults} from '../../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import * as XLSX from 'xlsx';
import { takeUntil } from 'rxjs/operators';
import { ExcelExportService } from '../../../../../core/services/excel-export.service';

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
  EntityList: SelectdropdownResultResults[] = [];
  StatusList: SelectdropdownResultResults[] = [];
  ProjectNameList: SelectdropdownResultResults[] = [];
  BenNameList: SelectdropdownResultResults[] = [];
  arMiscReceiptHeaderListData: ArMiscReceiptHeaderDto[] = [];
  arMiscReceiptHeaderData: ArMiscReceiptHeaderDto = {} as ArMiscReceiptHeaderDto;
  arMiscReceiptLineData: ArMiscReceiptLinesDto[] = [];
  arMiscReceiptDetailsData: ArMiscReceiptDetailsDto[] = [];
  filterArMiscReceiptHeaderObj = new FilterArMiscReceiptHeaderDto();
  searchFndLookUpValuesSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  filterArMiscReceiptHeaderByIdObj = new FilterArMiscReceiptHeaderByIdDto();

  loading = false;
  selectedEntityObj: any = null;
  selectedStatusObj: any = null;
  selectedProjectNameObj: any = null;
  selectedBenNameObj: any = null;

  constructor(
    private ArMiscReceiptHeaderService: ArMiscReceiptHeaderService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private excelExportService: ExcelExportService
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
        this.EntityList = response?.results || [];
      },
      error: (err) => {
        console.error('Entity list load error', err);
      }
    });
  }

  fetchStatusList(): void {
    this.ArMiscReceiptHeaderService.getStatusList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.StatusList = response?.results || [];
      },
      error: (err) => {
        console.error('Status list load error', err);
      }
    });
  } 

  fetchProjectNameList(): void {
    this.ArMiscReceiptHeaderService.getProjectNameList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.ProjectNameList = response?.results || [];
      },
      error: (err) => {
        console.error('Project name list load error', err);
      }
    });
  }

  fetchBenNameList(): void {
    this.ArMiscReceiptHeaderService.getBenNameList(this.searchFndLookUpValuesSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.BenNameList = response?.results || [];
      },
      error: (err) => {
        console.error('Ben name list load error', err);
      }
    });
  }


  focused(event: any): void {
    const label = event.target.parentElement.querySelector('label');
    if (label && !label.classList.contains('label-over')) {
      label.classList.add('label-over');
    }
  }

  blured(event: FocusEvent, value: string | null): void {
    const target = event.target as HTMLElement;
    const label = target.parentElement?.querySelector('label');
    if (label && label.classList.contains('label-over') && (!value || value === '')) {
      label.classList.remove('label-over');
    }
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
          console.error('Error fetching ArMiscReceiptHeaders:', error);
          this.toastr.error('Error fetching ArMiscReceiptHeaders details.', 'Error');
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

  onStatusChange(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterArMiscReceiptHeaderObj.status = selectedVendor.id;
      this.filterArMiscReceiptHeaderObj.statusStr = selectedVendor.text;
    } else {
      this.filterArMiscReceiptHeaderObj.status = null;
      this.filterArMiscReceiptHeaderObj.statusStr = null;
    }
  }

  onEntityChange(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterArMiscReceiptHeaderObj.entityId = selectedVendor.id;
      this.filterArMiscReceiptHeaderObj.entityIdStr = selectedVendor.text;
    } else {
      this.filterArMiscReceiptHeaderObj.entityId = null;
      this.filterArMiscReceiptHeaderObj.entityIdStr = null;
    }
  }

  onProjectNameChange(selectedVendor: any): void {
    if (selectedVendor) {
      this.filterArMiscReceiptHeaderObj.projectName = selectedVendor.id;
      this.filterArMiscReceiptHeaderObj.projectNameStr = selectedVendor.text;
    } else {
      this.filterArMiscReceiptHeaderObj.projectName = null;
      this.filterArMiscReceiptHeaderObj.projectNameStr = null;
    }
  }

  onBenNameChange(selectedVendor: any): void {
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
      this.toastr.warning('Please Select EntityID', 'Warning');
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
          this.toastr.error('Failed to fetch data for ArMiscReceiptHeader');
        console.error('Error fetching ArMiscReceiptHeaders:', error);
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
        this.toastr.error('Failed to fetch data for ArMiscReceiptHeader'); 
        console.error('Error fetching ArMiscReceiptHeader details:', err);
      }
    });
  }


  printExcel(): void {
    this.loading = true;
    const cleanedFilters = this.cleanFilterObject(this.filterArMiscReceiptHeaderObj);

    this.ArMiscReceiptHeaderService.getArMiscReceiptHeaders(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const data = response?.items || response || [];

          const title = this.translate.instant('ArMiscReceiptHeaderResourceName.Title');

          const filterFields = [
            { key: 'entityIdStr', label: this.translate.instant('ArMiscReceiptHeaderResourceName.EntityId') },
            { key: 'receiptNumber', label: this.translate.instant('ArMiscReceiptHeaderResourceName.DocumentNumber') },
            { key: 'checkNumber', label: this.translate.instant('ArMiscReceiptHeaderResourceName.ChequeNo') },
            { key: 'benificaryNameStr', label: this.translate.instant('ArMiscReceiptHeaderResourceName.BeneficiaryName') },
            { key: 'statusStr', label: this.translate.instant('ArMiscReceiptHeaderResourceName.Status') },
            { key: 'projectNameStr', label: this.translate.instant('ArMiscReceiptHeaderResourceName.ProjectName') },
            { key: 'benNameStr', label: this.translate.instant('ArMiscReceiptHeaderResourceName.Sponsor') },
            { key: 'amount', label: this.translate.instant('ArMiscReceiptHeaderResourceName.Amount') }
          ];

          const tableHeader = [
            '#',
            this.translate.instant('ArMiscReceiptHeaderResourceName.DocumentNumber'),
            this.translate.instant('ArMiscReceiptHeaderResourceName.MISC_RECEIPT_DATE'),
            this.translate.instant('ArMiscReceiptHeaderResourceName.beneficiarY_NAME'),
            this.translate.instant('ArMiscReceiptHeaderResourceName.AMOUNT'),
            this.translate.instant('ArMiscReceiptHeaderResourceName.Status')
          ];

          const tableRows = data.map((item: any, index: number) => [
            (index + 1).toString(),
            item.receipT_NUMBER || '',
            item.misC_RECEIPT_DATEstr || '',
            item.beneficiarY_NAME || '',
            item.amounTstr || '',
            item.posted || ''
          ]);
          const fileName = `${this.translate.instant('ArMiscReceiptHeaderResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
          this.excelExportService.generateExcel({
            title,
            filterFields: filterFields,
            filterObj: this.filterArMiscReceiptHeaderObj,
            tableHeader,
            tableRows,
            fileName
          });

          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Failed to fetch data for Excel export');
        }
      });
  }

}

