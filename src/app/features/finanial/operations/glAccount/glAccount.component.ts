import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import {
  Pagination,
  FndLookUpValuesSelect2RequestDto,
  SelectdropdownResultResults,
  Select2RequestDto,
  SelectdropdownResult,
  reportPrintConfig
} from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { GlAccountService } from '../../../../core/services/Financial/Operation/glAccount.service';
import {
  CreateGlAccountDto,
  FilterGlAccountByCodeDto,
  FilterGlAccountDto,
  GlAccountDto
} from '../../../../core/dtos/FinancialDtos/OperationDtos/glAccount.dto';

import 'jquery';
import { isDisabledType } from '../../../../core/enum/user-type.enum';
declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-glAccount',
  standalone: true,
  imports: [CommonModule,FormsModule,TranslateModule, NgSelectComponent,GenericDataTableComponent,ReactiveFormsModule,NgSelectModule],
  templateUrl: './glAccount.component.html',
  styleUrls: ['./glAccount.component.scss']
})
export class GlAccountComponent implements OnInit, OnDestroy {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;
  @ViewChild('jstreeForm', { static: false }) jstreeForm!: ElementRef;

  glAccountForm: FormGroup;
  submitted = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';

  private destroy$ = new Subject<void>();
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();

  columnDefs: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string; icon?: string; action: string }> = [];

  searchParams = new FilterGlAccountDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new FilterGlAccountDto();

  loadgridData: GlAccountDto[] = [];
  loadformData: GlAccountDto = {} as GlAccountDto;
  createData: CreateGlAccountDto = {} as CreateGlAccountDto;

  accountCodeSelect2: SelectdropdownResultResults[] = [];
  loadingaccountCode = false;
  accountCodesearchParams = new Select2RequestDto();
  selectedaccountCodeSelect2Obj: any = null;
  accountCodeSearchInput$ = new Subject<string>();

  parentCodeSelect2: SelectdropdownResultResults[] = [];
  loadingparentCode = false;
  parentCodesearchParams = new Select2RequestDto();
  selectedparentCodeSelect2Obj: any = null;
  parentCodeSearchInput$ = new Subject<string>();

  jstreeData: any[] = [];
  showTree = false;
  currentLang = 'en';
  parentTextPath:any;

  constructor(
    private glAccountService: GlAccountService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder
  ) {
    this.glAccountForm = this.fb.group({
      accountCode: [null],
      parentCode: [null],
      accountDescription: [null],
      arabicDescription: [null],
      isDisabled: [false],
      natureOfAccount: [null],
      trialBalance: [null],
      profitLoss: [null],
      balanceSheet: [null]
    });
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'icon-frame-view', action: 'onViewInfo' },
      { label: this.translate.instant('Common.edit'), icon: 'icon-frame-edit', action: 'onEditInfo' },
    ];


    this.accountCodeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchaccountCodeSelect2());

    this.fetchaccountCodeSelect2();

    this.parentCodeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchparentCodeSelect2());

    this.fetchparentCodeSelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  onaccountCodeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.accountCodesearchParams.skip = 0;
    this.accountCodesearchParams.searchValue = search;
    this.accountCodeSelect2 = [];
    this.accountCodeSearchInput$.next(search);
  }

  loadMoreaccountCode(): void {
    this.accountCodesearchParams.skip++;
    this.fetchaccountCodeSelect2();
  }

  fetchaccountCodeSelect2(): void {
    this.loadingaccountCode = true;
    this.searchSelect2Params.searchValue = this.accountCodesearchParams.searchValue;
    this.searchSelect2Params.skip = this.accountCodesearchParams.skip;
    this.searchSelect2Params.take = this.accountCodesearchParams.take;

    this.Select2Service.getAccountSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.accountCodeSelect2 = [...this.accountCodeSelect2, ...newItems];
          this.loadingaccountCode = false;
        },
        error: () => this.loadingaccountCode = false
      });
  }

  onaccountCodeSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.accountCode = selectedvendor.id;
      this.searchParams.accountCode = selectedvendor.id;
    } else {
      this.searchParams.accountCode = null;
      this.searchParams.accountCode = null;
    }
  }

  onparentCodeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.parentCodesearchParams.skip = 0;
    this.parentCodesearchParams.searchValue = search;
    this.parentCodeSelect2 = [];
    this.parentCodeSearchInput$.next(search);
  }

  loadMoreparentCode(): void {
    this.parentCodesearchParams.skip++;
    this.fetchparentCodeSelect2();
  }

  fetchparentCodeSelect2(): void {
    this.loadingparentCode = true;
    this.searchSelect2Params.searchValue = this.parentCodesearchParams.searchValue;
    this.searchSelect2Params.skip = this.parentCodesearchParams.skip;
    this.searchSelect2Params.take = this.parentCodesearchParams.take;

    this.Select2Service.getAccountSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.parentCodeSelect2 = [...this.parentCodeSelect2, ...newItems];
          this.loadingparentCode = false;
        },
        error: () => this.loadingparentCode = false
      });
  }



  onSearch(): void {
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    this.getLoadDataGrid({ pageNumber: event.pageNumber, pageSize: event.pageSize });
  }

  onTableSearch(text: string): void {
    this.searchText = text;
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
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
    this.searchParams = new FilterGlAccountDto();
    this.loadgridData = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
  }

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();
    this.glAccountService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.loadgridData = response || [];
          this.pagination.totalCount = response[0]?.rowsCount || 0;
          this.spinnerService.hide();
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
  }


  onSubmit(): void {
    this.submitted = true;

    if (this.glAccountForm.invalid) {
      this.glAccountForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return;
    }
    const formData = this.glAccountForm.value;
    if (formData.isDisabled == true) {
      formData.isDisabled = isDisabledType.isDisabledTypeTrue
    }
    else {
      formData.isDisabled = isDisabledType.isDisabledTypeFalse
    }

    if (formData.profitLoss == true) {
      formData.profitLoss = isDisabledType.isDisabledTypeTrue
    }
    else if (formData.profitLoss == false) {
      formData.profitLoss = isDisabledType.isDisabledTypeFalse
    }
    else {
      formData.profitLoss = null
    }

    if (formData.balanceSheet == true) {
      formData.balanceSheet = isDisabledType.isDisabledTypeTrue
    }
    else if (formData.balanceSheet == false) {
      formData.balanceSheet = isDisabledType.isDisabledTypeFalse
    }
    else {
      formData.balanceSheet = null
    }

    if (formData.trialBalance == true) {
      formData.trialBalance = isDisabledType.isDisabledTypeTrue
    }
    else if (formData.trialBalance == false) {
      formData.trialBalance = isDisabledType.isDisabledTypeFalse
    }
    else {
      formData.trialBalance = null
    }

    this.spinnerService.show();
    if (this.modalMode === 'add') {
      this.glAccountService.create(formData)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: (response: any) => {
            this.toastr.success(this.translate.instant('Common.addedSuccessfully'));

            this.spinnerService.hide();
            this.closeModal();
            this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
          },
          error: () => {
            this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
            this.spinnerService.hide();
          }
        });
    }
    else if (this.modalMode === 'edit') {
      this.glAccountService.update(formData)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: (response: any) => {
            this.toastr.success(this.translate.instant('Common.addedSuccessfully'));

            this.spinnerService.hide();
            this.closeModal();
            this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
          },
          error: () => {
            this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
            this.spinnerService.hide();
          }
        });
    }
  }


  closeModal(): void {
    this.glAccountForm.reset();
    this.submitted = false;
    const closeBtn = document.querySelector('#glAccountModal .btn-close') as HTMLElement;
    closeBtn?.click();
  }



  getTextPathFromIds(idPath: string, treeData: any[]): string {
    const ids = idPath.split('/');
    const names = [];

    let currentNodes = treeData;

    for (const id of ids) {
      const node = currentNodes.find((n: any) => n.id === id);
      if (!node) break;

      names.push(node.text);
      currentNodes = node.children || [];
    }

    return names.join(' / ');
  }



  getFormDataWithDetailsbyId(accountCode: string): void {
    const params: FilterGlAccountByCodeDto = {
      accountCode: accountCode
    };
    this.spinnerService.show();
    forkJoin({
      returnData: this.glAccountService.getWithDetailsById(params) as Observable<GlAccountDto>,
    })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (result) => {
          this.loadformData = result.returnData;
          const modalElement = document.getElementById('glAccountModal');;
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          };

          this.spinnerService.hide();
        },
        error: (err) => {
          this.spinnerService.hide();
        }
      });
  }

  public buildColumnDefs(): void {
    this.columnDefs = [
      { headerName: this.translate.instant('glAccountResourceName.accountCode'), field: 'accountCode', width: 200 },
      { headerName: this.translate.instant('glAccountResourceName.parentCode'), field: 'parentCode', width: 200 },
      { headerName: this.translate.instant('glAccountResourceName.accountDescription'), field: 'accountDescription', width: 200 },
      { headerName: this.translate.instant('glAccountResourceName.arabicDescription'), field: 'arabicDescription', width: 200 },
      { headerName: this.translate.instant('glAccountResourceName.natureOfAccount'), field: 'natureOfAccount', width: 200 },
      { headerName: this.translate.instant('glAccountResourceName.isDisabled'), field: 'isDisabled', width: 200 },
      { headerName: this.translate.instant('glAccountResourceName.trialBalance'), field: 'trialBalance', width: 200 },
      { headerName: this.translate.instant('glAccountResourceName.profitLoss'), field: 'profitLoss', width: 200 },
      { headerName: this.translate.instant('glAccountResourceName.balanceSheet'), field: 'balanceSheet', width: 200 }
    ];
  }
getFormDatabyId(accountCode: string, mode: 'edit' | 'view'): void {
  this.modalMode = mode;

  const params: FilterGlAccountByCodeDto = { accountCode };
  this.spinnerService.show();

  this.glAccountService.getDetailById(params)
    .pipe(
      takeUntil(this.destroy$),
      switchMap((detail: GlAccountDto) => {
        this.loadformData = detail;

        // patch form
        this.glAccountForm.patchValue(this.loadformData);
        if (this.modalMode === 'view') {
          this.glAccountForm.disable();
        } else {
          this.glAccountForm.enable();
        }

        const filterParams = new FilterGlAccountDto();
        //filterParams.accountCode = detail.accountCode ?? "0";

        return this.glAccountService.geGlAccountsTree(filterParams)
          .pipe(map(treeData => ({ detail, treeData })));
      })
    )
    .subscribe({
      next: (result) => {
        // ✅ map to jsTree format
        this.jstreeData = this.mapToJsTreeData(result.treeData);
        this.showTree = true;
        this.createJSTreeForm(this.jstreeData);

        setTimeout(() => {
          const treeElement = $('#jstreeForm');
        }, 200);

        const parentCodeIdPath = this.glAccountForm.get('parentCode')?.value;
        if (parentCodeIdPath) {
          this.parentTextPath = this.getTextPathFromIds(parentCodeIdPath, this.jstreeData);
        }

        const modalElement = document.getElementById('glAccountModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }

        this.spinnerService.hide();
      },
      error: () => this.spinnerService.hide()
    });
}

openAddNew(): void {
  this.modalMode = 'add';
  this.glAccountForm.reset();
  this.currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';

  this.spinnerService.show();
  const params = new FilterGlAccountDto();

  forkJoin({
    returnData: this.glAccountService.geGlAccountsTree(params)
  })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        // ✅ map to jsTree format
        this.jstreeData = this.mapToJsTreeData(result.returnData);
        this.showTree = true;
        this.createJSTreeForm(this.jstreeData);

        const modalElement = document.getElementById('glAccountModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }

        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();
      }
    });
}


// ✅ Mapping function for jsTree
private mapToJsTreeData(data: any[]): any[] {
  return data.map(item => ({
    id: item.accountCode,   // unique id
text: `${item.accountCode} / ${item.arabicDescription}`,
    children: item.children ? this.mapToJsTreeData(item.children) : [] // recursive children
  }));
}


createJSTreeForm(data: any): void {
  setTimeout(() => {
    const treeElement = $('#jstreeForm');

    if (treeElement && treeElement.jstree(true)) {
      treeElement.jstree('destroy');
    }

    treeElement.jstree({
      core: {
        check_callback: true,
        themes: { responsive: false },
         expand_selected_onload: false, 
        data
      },
      plugins: ['wholerow', 'checkbox', 'types', 'search'],
      types: {
       default: { icon: 'fa fa-folder text-secondary fa-lg' }, // ash/gray folder
           file:    { icon: 'fa fa-file text-secondary fa-lg' }    // ash/gray file
        },
      checkbox: {
          keep_selected_style: false,
          cascade: 'none',
          three_state: false
        },
      search: {
        case_sensitive: false,
        show_only_matches: true
      }
    });

    treeElement.on(
      'changed.jstree',
      (e: JQuery.Event, data: { node: any; instance: any }) => {
        const selectedNodes: any[] = data?.instance?.get_selected(true) || [];
        if (!selectedNodes.length) {
          this.glAccountForm.patchValue({ parentCode: null });
          this.parentTextPath = '';
          return;
        }

        const pathsWithIds = selectedNodes.map((n: any) => data.instance.get_path(n, '/', true));
        const pathsWithText = selectedNodes.map((n: any) => data.instance.get_path(n, ' / '));

        this.glAccountForm.patchValue({ parentCode: pathsWithIds.join(',') });
        this.parentTextPath = pathsWithText.join(' , ');
      }
    );
  }, 0);
}




  onTreeSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchString = input.value;
    const tree = $('#jstreeForm').jstree(true);
    if (tree) {
      tree.search(searchString);
    }
  }


  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      this.getFormDatabyId(event.row.accountCode, 'view');
    } else if (event.action === 'onEditInfo') {
      this.getFormDatabyId(event.row.accountCode, 'edit');
    }
  }



  printExcel(): void {
    this.spinnerService.show();
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.glAccountService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse[0]?.rowsCount || initialResponse?.data?.length || 0;

          this.glAccountService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('glAccountResourceName.title'),
                  reportTitle: this.translate.instant('glAccountResourceName.title'),
                  fileName: `${this.translate.instant('glAccountResourceName.title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('glAccountResourceName.accountCode'), value: this.searchParams.accountCode },
                    { label: this.translate.instant('glAccountResourceName.PaymentNumber'), value: this.searchParams.accountDescription }],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('glAccountResourceName.accountCode'), key: 'accountCode' },
                    { label: this.translate.instant('glAccountResourceName.parentCode'), key: 'parentCode' },
                    { label: this.translate.instant('glAccountResourceName.accountDescription'), key: 'accountDescription' },
                    { label: this.translate.instant('glAccountResourceName.arabicDescription'), key: 'arabicDescription' },
                    { label: this.translate.instant('glAccountResourceName.natureOfAccount'), key: 'natureOfAccount' },
                    { label: this.translate.instant('glAccountResourceName.isDisabled'), key: 'isDisabled' },
                    { label: this.translate.instant('glAccountResourceName.trialBalance'), key: 'trialBalance' },
                    { label: this.translate.instant('glAccountResourceName.profitLoss'), key: 'profitLoss' },
                    { label: this.translate.instant('glAccountResourceName.balanceSheet'), key: 'balanceSheet' }
                  ],
                  data: data.map((item: any, index: number) => ({
                    ...item,
                    rowNo: index + 1
                  })),
                  totalLabel: this.translate.instant('Common.Total'),
                  totalKeys: []
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

