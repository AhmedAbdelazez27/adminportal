import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject, take } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { CustomTableComponent } from '../../../../../../shared/custom-table/custom-table.component';
import { ApPaymentsTransactionHDRService } from '../../../../../core/services/ApPaymentsTransactionHDR.service';
import { SpinnerService } from '../../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../../core/services/openStandardReportService.service';
import { FndLookUpValuesSelect2RequestDto, Pagination, Selectdropdown, SelectdropdownResult, SelectdropdownResultResults, reportPrintConfig } from '../../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { FilterApPaymentsTransactionHDRDto, FilterApPaymentsTransactionHDRByIdDto, ApPaymentsTransactionHDRDto } from '../../../../../core/dtos/ApPaymentsTransactionHDRdtos/ApPaymentsTransactionHDR.dto';
import { Select2Service } from '../../../../../core/services/Select2.service';

@Component({
  selector: 'app-ApPaymentsTransactionHDR',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CustomTableComponent],
  templateUrl: './ApPaymentsTransactionHDR.component.html',
  styleUrls: ['./ApPaymentsTransactionHDR.component.scss']
})

export class ApPaymentsTransactionHDRComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  private destroy$ = new Subject<void>();
  pagination = new Pagination();

  entitySelect2: SelectdropdownResultResults[] = [];
  paymentTypeSelect2: SelectdropdownResultResults[] = [];
  vendorSelect2: SelectdropdownResultResults[] = [];

  searchParams = new FilterApPaymentsTransactionHDRDto();
  searchSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new FilterApPaymentsTransactionHDRByIdDto();

  loadgridData: ApPaymentsTransactionHDRDto[] = [];
  loadformData: ApPaymentsTransactionHDRDto = {} as ApPaymentsTransactionHDRDto;

  selectedvendorSelect2Obj: any = null;
  selectedentitySelect2Obj: any = null;
  selectpaymentTypeSelect2Obj: any = null;
  userEntityForm: FormGroup;
  translatedHeaders$: Observable<string[]> | undefined;
  headerKeys: string[] = [];

  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  constructor(
    private apPaymentsTransactionHDRService: ApPaymentsTransactionHDRService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService:SpinnerService,
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
    this.translatedHeaders$ = combineLatest([
      this.translate.get('ApPaymentsTransactionHDRResourceName.PaymentNumber'),
      this.translate.get('ApPaymentsTransactionHDRResourceName.PaymentDate'),
      this.translate.get('ApPaymentsTransactionHDRResourceName.PaymentTypeDesc'),
      this.translate.get('ApPaymentsTransactionHDRResourceName.VendorNumber'),
      this.translate.get('ApPaymentsTransactionHDRResourceName.VendorName'),
      this.translate.get('ApPaymentsTransactionHDRResourceName.Amount'),
    ]).pipe(
      map(translations => translations)
    );

    this.headerKeys = [
      'paymenT_NUMBER',
      'paymenT_DATEstr',
      'paymenT_TYPE_DESC',
      'vendoR_NUMBER',
      'vendoR_NAME',
      'paymenT_AMOUNTstr'
    ];
    this.fetchEntitySelect2();
    this.fetchApVendorSelect2();
    this.fetchPaymentTypeSelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchEntitySelect2(): void {
    this.Select2Service.getEntitySelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.entitySelect2 = response?.results || [];
      },
    });
  }

  fetchApVendorSelect2(): void {
    this.Select2Service.getApVendorSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
          this.vendorSelect2 = response?.results || [];
      },
    });
  }
  fetchPaymentTypeSelect2(): void {
    this.Select2Service.getPaymentTypeSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SelectdropdownResult) => {
        this.paymentTypeSelect2 = response?.results || [];
      },
    });
  }

  onSearch(): void {
    this.getLoadDataGrid(1);
  }

  getLoadDataGrid(page: number): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['ApPaymentsTransactionHDRResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['ApPaymentsTransactionHDRResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    const skip = (page - 1) * this.pagination.take;
    this.searchParams.skip = skip;
    this.searchParams.take = this.pagination.take;

    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();
   

    this.apPaymentsTransactionHDRService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.loadgridData = response?.data || [];
          this.pagination = {...this.pagination,totalCount: response.totalCount || 0};
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
  }

  onvendorSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.vendorName = selectedVendor.id;
      this.searchParams.vendorNamestr = selectedVendor.text;
    } else {
      this.searchParams.vendorName = null;
      this.searchParams.vendorNamestr = null;
    }
  }

  onentitySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.entityId = selectedVendor.id;
      this.searchParams.entityIdstr = selectedVendor.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }

  onpaymentTypeSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.paymentTypeDesc = selectedVendor.id;
      this.searchParams.paymentTypeDescstr = selectedVendor.text;
    } else {
      this.searchParams.paymentTypeDesc = null;
      this.searchParams.paymentTypeDescstr = null;
    }
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
    this.searchParams = new FilterApPaymentsTransactionHDRDto();
    this.loadgridData = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  getFormDatabyId(tr_Id: string, entitY_ID: string): void {
    const params: FilterApPaymentsTransactionHDRByIdDto = {
      entityId: entitY_ID,
      paymentId: tr_Id
    };
    this.spinnerService.show();
    forkJoin({
      mischeaderdata: this.apPaymentsTransactionHDRService.getDetailById(params) as Observable<
        ApPaymentsTransactionHDRDto | ApPaymentsTransactionHDRDto[]>,
    })
      .pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadformData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as ApPaymentsTransactionHDRDto)
          : result.mischeaderdata;
          this.spinnerService.hide();
      },
        error: (err) => {
          this.spinnerService.hide();
      }
    });
  }

  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate.get(['ApPaymentsTransactionHDRResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(`${translations['ApPaymentsTransactionHDRResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
        });
      return;
    }
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.apPaymentsTransactionHDRService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.apPaymentsTransactionHDRService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('ApPaymentsTransactionHDRResourceName.Title'),
                  reportTitle: this.translate.instant('ApPaymentsTransactionHDRResourceName.Title'),
                  fileName: `${this.translate.instant('ApPaymentsTransactionHDRResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.EntityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentNumber'), value: this.searchParams.paymentNumber },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentDate'), value: this.searchParams.paymentDate },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorNumber'), value: this.searchParams.vendorNumber },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorName'), value: this.searchParams.vendorNamestr },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentTypeDesc'), value: this.searchParams.paymentTypeDescstr },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentNumber'), key: 'paymenT_NUMBER' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentDate'), key: 'paymenT_DATEstr' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.PaymentTypeDesc'), key: 'paymenT_TYPE_DESC' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorNumber'), key: 'vendoR_NUMBER' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.VendorName'), key: 'vendoR_NAME' },
                    { label: this.translate.instant('ApPaymentsTransactionHDRResourceName.Amount'), key: 'paymenT_AMOUNTstr' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['receiptAmountstr', 'chequeAmountstr', 'cashAmountstr', 'administrativeAmountstr']
                };

                this.openStandardReportService.openStandardReportExcel(reportConfig);
                this.spinnerService.hide();
              },
              error: () => {
                this.spinnerService.hide();
              }
            });
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
  }

}

