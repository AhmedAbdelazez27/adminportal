import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Pagination, SelectdropdownResultResults, FndLookUpValuesSelect2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { generalLJournalRptInputDto } from '../../../../core/dtos/Reports/FinancialReportsInput.dto';
import { generalLJournalRptOutputDto } from '../../../../core/dtos/Reports/FinancialReportsOutput.dto';
import { FinancialReportService } from '../../../../core/services/FinancialReport.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service'
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { CustomTableComponent } from '../../../../../shared/custom-table/custom-table.component';

@Component({
  selector: 'app-generalLJournalRpt',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CustomTableComponent],
  templateUrl: './generalLJournalRpt.component.html',
  styleUrls: ['./generalLJournalRpt.component.scss']
})

export class generalLJournalRptComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  private destroy$ = new Subject<void>();

  pagination = new Pagination();

  entitySelect2: SelectdropdownResultResults[] = [];
  countrySelect2: SelectdropdownResultResults[] = [];
  branchSelect2: SelectdropdownResultResults[] = [];
  deptSelect2: SelectdropdownResultResults[] = [];
  fromAccSelect2: SelectdropdownResultResults[] = [];
  toAccSelect2: SelectdropdownResultResults[] = [];

  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParams = new generalLJournalRptInputDto();
  getAllDataForReports: generalLJournalRptOutputDto[] = [];

  loading = false;
  selectedentitySelect2Obj: any = null
  selecteddeptSelect2Obj: any = null;
  selectedbranchSelect2Obj: any = null;
  selectedcountrySelect2Obj: any = null
  selectedfromAccSelect2Obj: any = null;
  selectedtoAccSelect2Obj: any = null;

  translatedHeaders$: Observable<string[]> | undefined;
  headerKeys: string[] = [];
  constructor(
    private financialReportService: FinancialReportService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service
  )
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.fetchentitySelect2();
    this.fetchdeptSelect2();
    this.fetchbranchSelect2();
    this.fetchcountrySelect2();
    this.fetchfromAccSelect2();
    this.fetchtoAccSelect2();

    this.translatedHeaders$ = combineLatest([
      this.translate.get('FinancialReportResourceName.accountT_CODE'),
      this.translate.get('FinancialReportResourceName.accounT_NAME'),
      this.translate.get('FinancialReportResourceName.jE_NAME'),
      this.translate.get('FinancialReportResourceName.jE_DATE'),
      this.translate.get('FinancialReportResourceName.jE_SOURCE_DESC'),
      this.translate.get('FinancialReportResourceName.notes'),
      this.translate.get('FinancialReportResourceName.debiT_AMOUNT'),
      this.translate.get('FinancialReportResourceName.crediT_AMOUNT')
    ]).pipe(
      map(translations => translations)
    );

    this.headerKeys = [
      'accountT_CODE',
      'accounT_NAME',
      'jE_NAME',
      'jE_DATEstr',
      'jE_SOURCE_DESC',
      'notes',
      'debiT_AMOUNT',
      'crediT_AMOUNT'
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchentitySelect2(): void {
    this.Select2Service.getEntitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.entitySelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Entity.', 'Error');
        }
      });
  }

  fetchdeptSelect2(): void {
    this.Select2Service.getDeptSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.deptSelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Department.', 'Error');
        }
      });
  }

  fetchbranchSelect2(): void {
    this.Select2Service.getBranchSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.branchSelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Branch.', 'Error');
        }
      });
  }

  fetchcountrySelect2(): void {
    this.Select2Service.getCountrySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.countrySelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load Country.', 'Error');
        }
      });
  }

  fetchfromAccSelect2(): void {
    this.Select2Service.getAccountSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.fromAccSelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load FromAcc.', 'Error');
        }
      });
  }
  fetchtoAccSelect2(): void {
    this.Select2Service.getAccountSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.toAccSelect2 = response?.results || [];
        },
        error: (err) => {
          this.toastr.error('Failed to load ToAcc.', 'Error');
        }
      });
  }


  getLoadDataGrid(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.pagination.itemsPerPage;
    if (!this.searchParams.entityId) return;
    this.spinnerService.show();

    this.financialReportService.getgeneralLJournalRptData(this.searchParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.getAllDataForReports = response || [];
          this.pagination.totalCount = response?.totalCount || 0;
          this.spinnerService.hide();
        },
        error: (error) => {
          this.spinnerService.hide();
          this.toastr.error('Error fetching Data.', 'Error');
        }
      });
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

  ondeptSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.att3 = selectedVendor.id;
      this.searchParams.att3str = selectedVendor.text;
    } else {
      this.searchParams.att3 = null;
      this.searchParams.att3str = null;
    }
  }

  onbranchSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.att2 = selectedVendor.id;
      this.searchParams.att2str = selectedVendor.text;
    } else {
      this.searchParams.att2 = null;
      this.searchParams.att2str = null;
    }
  }

  oncountrySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.att1 = selectedVendor.id;
      this.searchParams.att1str = selectedVendor.text;
    } else {
      this.searchParams.att1 = null;
      this.searchParams.att1str = null;
    }
  }

  onfromAccSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.att5From = selectedVendor.id;
      this.searchParams.att5Fromstr = selectedVendor.text;
    } else {
      this.searchParams.att5From = null;
      this.searchParams.att5Fromstr = null;
    }
  }

  ontoAccSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.att5To = selectedVendor.id;
      this.searchParams.att5Tostr = selectedVendor.text;
    } else {
      this.searchParams.att5To = null;
      this.searchParams.att5Tostr = null;
    }
  }

  onSearch(): void {
    this.getLoadDataGrid(1);
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
    this.searchParams = new generalLJournalRptInputDto();
    this.getAllDataForReports = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  printExcel(): void {
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.financialReportService.getgeneralLJournalRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgeneralLJournalRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('FinancialReportResourceName.country'), value: this.searchParams.att1str },
                    { label: this.translate.instant('FinancialReportResourceName.branch'), value: this.searchParams.att2str },
                    { label: this.translate.instant('FinancialReportResourceName.department'), value: this.searchParams.att3str },
                    { label: this.translate.instant('FinancialReportResourceName.fromAccNo'), value: this.searchParams.att5Fromstr },
                    { label: this.translate.instant('FinancialReportResourceName.toAccNo'), value: this.searchParams.att5Tostr },
                    { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
                    { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.accountT_CODE'), key: 'accountT_CODE' },
                    { label: this.translate.instant('FinancialReportResourceName.accounT_NAME'), key: 'accounT_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_NAME'), key: 'jE_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATE'), key: 'jE_DATE' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATEstr'), key: 'jE_DATEstr' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), key: 'jE_SOURCE_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
                    { label: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), key: 'debiT_AMOUNTstr' },
                    { label: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), key: 'crediT_AMOUNTstr' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNTstr', 'crediT_AMOUNTstr']
                };

                this.openStandardReportService.openStandardReportExcel(reportConfig);
                this.spinnerService.hide();
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
        },

      });
  }

  printPDF(): void {
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    if (!this.searchParams.entityId) {
      this.spinnerService.hide();
      this.toastr.warning('Please Select Entity', 'Warning');
      return;
    }
    this.financialReportService.getgeneralLJournalRptData({ ...cleanedFilters })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

          this.financialReportService.getgeneralLJournalRptData({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title'),
                  reportTitle: this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title'),
                  fileName: `${this.translate.instant('FinancialReportResourceName.generalLJournalRpt_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('FinancialReportResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('FinancialReportResourceName.country'), value: this.searchParams.att1str },
                    { label: this.translate.instant('FinancialReportResourceName.branch'), value: this.searchParams.att2str },
                    { label: this.translate.instant('FinancialReportResourceName.department'), value: this.searchParams.att3str },
                    { label: this.translate.instant('FinancialReportResourceName.fromAccNo'), value: this.searchParams.att5Fromstr },
                    { label: this.translate.instant('FinancialReportResourceName.toAccNo'), value: this.searchParams.att5Tostr },
                    { label: this.translate.instant('FinancialReportResourceName.fromDate'), value: this.searchParams.fromDate },
                    { label: this.translate.instant('FinancialReportResourceName.toDate'), value: this.searchParams.toDate },
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('FinancialReportResourceName.accountT_CODE'), key: 'accountT_CODE' },
                    { label: this.translate.instant('FinancialReportResourceName.accounT_NAME'), key: 'accounT_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_NAME'), key: 'jE_NAME' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATE'), key: 'jE_DATE' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_DATEstr'), key: 'jE_DATEstr' },
                    { label: this.translate.instant('FinancialReportResourceName.jE_SOURCE_DESC'), key: 'jE_SOURCE_DESC' },
                    { label: this.translate.instant('FinancialReportResourceName.notes'), key: 'notes' },
                    { label: this.translate.instant('FinancialReportResourceName.debiT_AMOUNT'), key: 'debiT_AMOUNTstr' },
                    { label: this.translate.instant('FinancialReportResourceName.crediT_AMOUNT'), key: 'crediT_AMOUNTstr' },
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: ['debiT_AMOUNT', 'crediT_AMOUNT']
                };

                this.openStandardReportService.openStandardReportPDF(reportConfig);
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
        },

      });
  }
}

