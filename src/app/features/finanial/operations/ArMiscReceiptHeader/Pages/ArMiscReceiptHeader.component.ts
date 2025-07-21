import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { takeUntil } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomTableComponent } from '../../../../../../shared/custom-table/custom-table.component';
import { ArMiscReceiptHeaderDto, ArMiscReceiptLinesDto, ArMiscReceiptDetailsDto, FilterArMiscReceiptHeaderDto, FilterArMiscReceiptHeaderByIdDto } from '../../../../../core/dtos/ArMiscReceiptHeaderdtos/ArMiscReceiptHeader.dto';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { ArMiscReceiptHeaderService } from '../../../../../core/services/ArMiscReceiptHeader.service';
import { SpinnerService } from '../../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../../core/services/Select2.service';

@Component({
  selector: 'app-ArMiscReceiptHeader',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CustomTableComponent],
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

  loadgridData: ArMiscReceiptHeaderDto[] = [];
  loadformData: ArMiscReceiptHeaderDto = {} as ArMiscReceiptHeaderDto;
  loadformLineData: ArMiscReceiptLinesDto[] = [];
  loadformDetailsData: ArMiscReceiptDetailsDto[] = [];

  searchParams = new FilterArMiscReceiptHeaderDto();
  searchSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new FilterArMiscReceiptHeaderByIdDto();

  selectedentitySelect2Obj: any = null;
  selectedstatusSelect2Obj: any = null;
  selectedprojectNameSelect2Obj: any = null;
  selectedbenNameSelect2Obj: any = null;
  userEntityForm: FormGroup | undefined;
  translatedHeaders$: Observable<string[]> | undefined;
  headerKeys: string[] = [];
  constructor(
    private arMiscReceiptHeaderService: ArMiscReceiptHeaderService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder
  )
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.userEntityForm = this.fb.group({
      entityIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchEntityList();
    this.fetchStatusList();
    this.fetchProjectNameList();

    this.translatedHeaders$ = combineLatest([
      this.translate.get('ArMiscReceiptHeaderResourceName.DocumentNumber'),
      this.translate.get('ArMiscReceiptHeaderResourceName.MISC_RECEIPT_DATE'),
      this.translate.get('ArMiscReceiptHeaderResourceName.beneficiarY_NAME'),
      this.translate.get('ArMiscReceiptHeaderResourceName.AMOUNT'),
      this.translate.get('ArMiscReceiptHeaderResourceName.Status'),
    ]).pipe(
      map(translations => translations)
    );

    this.headerKeys = [
      'receipT_NUMBER',
      'misC_RECEIPT_DATEstr',
      'beneficiarY_NAME',
      'amounTstr',
      'posted'
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchEntityList(): void {
    this.Select2Service.getEntitySelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.entitySelect2 = response?.results || [];
      },
    });
  }

  fetchStatusList(): void {
    this.Select2Service.getArMiscStatusSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.statusSelect2 = response?.results || [];
      },
    });
  } 

  fetchProjectNameList(): void {
    this.Select2Service.getProjectNameSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.projectNameSelect2 = response?.results || [];
      },
    });
  }

  fetchBenNameList(): void {
    this.Select2Service.getBenNameSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.benNameSelect2 = response?.results || [];
      },
    });
  }

  onstatusSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.status = selectedVendor.id;
      this.searchParams.statusStr = selectedVendor.text;
    } else {
      this.searchParams.status = null;
      this.searchParams.statusStr = null;
    }
  }

  onentitySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.entityId = selectedVendor.id;
      this.searchParams.entityIdStr = selectedVendor.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdStr = null;
    }
  }

  onprojectNameSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.projectName = selectedVendor.id;
      this.searchParams.projectNameStr = selectedVendor.text;
    } else {
      this.searchParams.projectName = null;
      this.searchParams.projectNameStr = null;
    }
  }

  onbenNameSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.benName = selectedVendor.id;
      this.searchParams.benNameStr = selectedVendor.text;
    } else {
      this.searchParams.benName = null;
      this.searchParams.benNameStr = null;
    }
  }

  onSearch(): void {
    this.getLoadDataGrid(1);

  }

  getLoadDataGrid(page: number, searchValue: string = ''): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['ArMiscReceiptHeaderResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['ArMiscReceiptHeaderResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    const skip = (page - 1) * this.pagination.take;
    this.searchParams.skip = skip;
    this.searchParams.take = this.pagination.take;

    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();

    this.arMiscReceiptHeaderService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
          this.loadgridData = response?.data || [];
          this.pagination = { ...this.pagination, totalCount: response.totalCount || 0 };
          this.spinnerService.hide();
      },
        error: (error) => {
          this.spinnerService.hide();;
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
    this.searchParams = new FilterArMiscReceiptHeaderDto();
    this.loadgridData = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  getFormDatabyId(tr_Id: string, entitY_ID: string): void {
    const params: FilterArMiscReceiptHeaderByIdDto = {
      entityId: entitY_ID,
      miscReceiptId: tr_Id
    };
    this.spinnerService.show();;
    forkJoin({
      mischeaderdata: this.arMiscReceiptHeaderService.getDetailById(params) as Observable<ArMiscReceiptHeaderDto | ArMiscReceiptHeaderDto[]>,
      miscdetaildata: this.arMiscReceiptHeaderService.getReceiptDetailsListDataById(params) as Observable<ArMiscReceiptDetailsDto[]>,
      misclinedata: this.arMiscReceiptHeaderService.getReceiptLinesListDataById(params) as Observable<ArMiscReceiptLinesDto[]>
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadformDetailsData = result.miscdetaildata ?? [];
        this.loadformLineData = result.misclinedata ?? [];
        this.loadformData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as ArMiscReceiptHeaderDto)
          : result.mischeaderdata;
        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();;
        this.toastr.error('Error fetching Data.', 'Error');
     }
    });
  }


  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['ArMiscReceiptHeaderResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['ArMiscReceiptHeaderResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.spinnerService.show();;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
   
    this.arMiscReceiptHeaderService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.arMiscReceiptHeaderService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('ArMiscReceiptHeaderResourceName.catchReceipt_Title'),
                  reportTitle: this.translate.instant('ArMiscReceiptHeaderResourceName.catchReceipt_Title'),
                  fileName: `${this.translate.instant('ArMiscReceiptHeaderResourceName.catchReceipt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.EntityId'), value: this.searchParams.entityIdStr },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.DocumentNumber'), value: this.searchParams.receiptNumber },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.ChequeNo'), value: this.searchParams.checkNumber },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.BeneficiaryName'), value: this.searchParams.benificaryNamestr },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Status'), value: this.searchParams.statusStr },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.ProjectName'), value: this.searchParams.projectNameStr },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Sponsor'), value: this.searchParams.benNameStr },
                    { label: this.translate.instant('ArMiscReceiptHeaderResourceName.Amount'), value: this.searchParams.amount },
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
                this.spinnerService.hide();;
              },
              error: () => {
                this.spinnerService.hide();
                this.toastr.error('Failed to export Excel');
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
          this.toastr.error('Failed to retrieve data count');
        }
      });
  }
}

