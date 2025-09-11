
import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, of, Subject } from 'rxjs';
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
  reportPrintConfig,
  FndLookUpValuesSelect2RequestbyIdDto
} from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { GlAccountEntityService } from '../../../../core/services/Financial/Operation/glAccountEntity.service';
import {
  CreateGlAccountEntityDto,
  FilterGlAccountEntityByCodeDto,
  FilterGlAccountEntityByEntityIdDto,
  FilterGlAccountEntityDto,
  GlAccountEntityDto
} from '../../../../core/dtos/FinancialDtos/OperationDtos/glAccountEntity.dto';

import 'jquery';
import { isDisabledType } from '../../../../core/enum/user-type.enum';
import { GlAccountService } from '../../../../core/services/Financial/Operation/glAccount.service';
import { FilterGlAccountDto } from '../../../../core/dtos/FinancialDtos/OperationDtos/glAccount.dto';
declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-glAccountEntity',
  standalone: true,
  imports: [CommonModule,FormsModule,TranslateModule, NgSelectComponent,GenericDataTableComponent,ReactiveFormsModule,NgSelectModule],
  templateUrl: './glAccountEntity.component.html',
  styleUrls: ['./glAccountEntity.component.scss']
})
export class GlAccountEntityComponent implements OnInit, OnDestroy {
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

  searchParams = new FilterGlAccountEntityDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchSelect2ByIdParams = new FndLookUpValuesSelect2RequestbyIdDto();
  searchParamsById = new FilterGlAccountEntityDto();

  loadgridData: GlAccountEntityDto[] = [];
  loadformData: GlAccountEntityDto = {} as GlAccountEntityDto;
  createData: CreateGlAccountEntityDto = {} as CreateGlAccountEntityDto;

  accountCodeSelect2: SelectdropdownResultResults[] = [];
  loadingaccountCode = false;
  accountCodesearchParams = new Select2RequestDto();
  selectedaccountCodeSelect2Obj: any = null;
  accountCodeSearchInput$ = new Subject<string>();

  entityIdSelect2New: SelectdropdownResultResults[] = [];
  loadingentityIdNew = false;
  entityIdsearchParamsNew = new Select2RequestDto();
  selectedentityIdSelect2ObjNew: any = null;
  entityIdSearchInputNew$ = new Subject<string>();

  glAccountEntityIdSelect2: SelectdropdownResultResults[] = [];
  loadingglAccountEntityId = false;
  glAccountEntityIdsearchParams = new Select2RequestDto();
  selectedglAccountEntityIdSelect2Obj: any = null;
  glAccountEntityIdSearchInput$ = new Subject<string>();

  entityIdSelect2: SelectdropdownResultResults[] = [];
  loadingentityId = false;
  entityIdsearchParams = new Select2RequestDto();
  selectedentityIdSelect2Obj: any = null;
  entityIdSearchInput$ = new Subject<string>();

  accountIdSelect2: SelectdropdownResultResults[] = [];
  loadingaccountId = false;
  accountIdsearchParams = new Select2RequestDto();
  selectedaccountIdSelect2Obj: any = null;
  accountIdSearchInput$ = new Subject<string>();

  accountStatusSelect2: SelectdropdownResultResults[] = [];
  loadingaccountStatus = false;
  accountStatussearchParams = new Select2RequestDto();
  selectedaccountStatusSelect2Obj: any = null;
  accountStatusSearchInput$ = new Subject<string>();

  glAccountjstreeData: any[] = [];
  glAccountEntityjstreeData: any[] = [];
  glAccountshowTree = false;
  glAccountEntityshowTree = false;
  currentLang = 'en';
  glAccountparentTextPath:any;
  glAccountEntityparentTextPath:any;
  pendingItems: Array<{ entityId: any; entityIdText?: string | null; accountCode: string; accountCodeText?: string | null; parentCode: string; parentCodeText?: string | null; glAccountEntityId?: any }> = [];

  constructor(
    private glAccountEntityService: GlAccountEntityService,
    private glAccountService: GlAccountService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder
  ) {
    this.glAccountForm = this.fb.group({
      id: [null],
      glAccountEntityId: [null],
      entityId: [null, Validators.required],
      accountCode: [null, Validators.required],
      parentCode: [null, Validators.required],
    });
    
    console.log('Form initialized:', this.glAccountForm);
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'icon-frame-view', action: 'onViewInfo' },
      { label: this.translate.instant('Common.edit'), icon: 'icon-frame-edit', action: 'onEditInfo' },
      { label: this.translate.instant('Common.deletd'), icon: 'icon-frame-delete', action: 'onDeletdInfo' },
    ];

    this.accountCodeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchaccountCodeSelect2());

    this.entityIdSearchInputNew$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentityIdSelect2New());

    this.entityIdSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchentityIdSelect2());

    this.accountIdSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchaccountIdSelect2());

    this.accountStatusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchaccountStatusSelect2());

    this.fetchentityIdSelect2New();
    this.fetchaccountCodeSelect2();
    this.fetchentityIdSelect2();
    this.fetchaccountIdSelect2();
    this.fetchaccountStatusSelect2();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  onglAccountEntityIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.glAccountEntityIdsearchParams.skip = 0;
    this.glAccountEntityIdsearchParams.searchValue = search;
    this.glAccountEntityIdSelect2 = [];
    this.glAccountEntityIdSearchInput$.next(search);
  }

  loadMoreglAccountEntityId(): void {
    this.glAccountEntityIdsearchParams.skip++;
    this.fetchglAccountEntityIdSelect2();
  }

  fetchglAccountEntityIdSelect2(): void {
    this.loadingglAccountEntityId = true;
    this.searchSelect2ByIdParams.searchValue = this.glAccountEntityIdsearchParams.searchValue;
    this.searchSelect2ByIdParams.skip = this.glAccountEntityIdsearchParams.skip;
    this.searchSelect2ByIdParams.take = this.glAccountEntityIdsearchParams.take;
    this.searchSelect2ByIdParams.entityId = this.createData.entityId;

    this.Select2Service.getAccountStatusSelect2(this.searchSelect2ByIdParams)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.glAccountEntityIdSelect2 = [...this.glAccountEntityIdSelect2, ...newItems];
          this.loadingglAccountEntityId = false;
        },
        error: () => this.loadingglAccountEntityId = false
      });
  }

  onglAccountEntityIdSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.createData.glAccountEntityId = selectedvendor.id;
      this.createData.glAccountEntityIdstr = selectedvendor.text;
    } else {
      this.createData.glAccountEntityId = null;
      this.createData.glAccountEntityIdstr = null;
    }
  }


  onentityIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.entityIdsearchParams.skip = 0;
    this.entityIdsearchParams.searchValue = search;
    this.entityIdSelect2 = [];
    this.entityIdSearchInput$.next(search);
  }

  loadMoreentityId(): void {
    this.entityIdsearchParams.skip++;
    this.fetchentityIdSelect2();
  }

  fetchentityIdSelect2(): void {
    this.loadingentityId = true;
    this.searchSelect2Params.searchValue = this.entityIdsearchParams.searchValue;
    this.searchSelect2Params.skip = this.entityIdsearchParams.skip;
    this.searchSelect2Params.take = this.entityIdsearchParams.take;

    this.Select2Service.getEntitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.entityIdSelect2 = [...this.entityIdSelect2, ...newItems];
          this.loadingentityId = false;
        },
        error: () => this.loadingentityId = false
      });
  }

  onentityIdSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.entityId = selectedvendor.id;
      this.searchParams.entityIdstr = selectedvendor.text;
    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }

  onentityIdSearchNew(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.entityIdsearchParamsNew.skip = 0;
    this.entityIdsearchParamsNew.searchValue = search;
    this.entityIdSelect2New = [];
    this.entityIdSearchInputNew$.next(search);
  }

  loadMoreentityIdNew(): void {
    this.entityIdsearchParamsNew.skip++;
    this.fetchentityIdSelect2New();
  }

  fetchentityIdSelect2New(): void {
    this.loadingentityIdNew = true;
    this.searchSelect2Params.searchValue = this.entityIdsearchParamsNew.searchValue;
    this.searchSelect2Params.skip = this.entityIdsearchParamsNew.skip;
    this.searchSelect2Params.take = this.entityIdsearchParamsNew.take;

    this.Select2Service.getEntitySelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.entityIdSelect2New = [...this.entityIdSelect2New, ...newItems];
          this.loadingentityIdNew = false;
        },
        error: () => this.loadingentityIdNew = false
      });
  }

onentityIdSelect2ChangeNew(selected: any): void {
   if (selected) {
     this.createData.entityId = selected.id;
     this.createData.glAccountEntityId = null;
     this.createData.glAccountEntityIdstr = null;
     this.glAccountEntityIdsearchParams.searchValue = '';
     this.glAccountEntityIdsearchParams.skip = 0;
     this.glAccountEntityIdSelect2 = [];
     
     // Update the form control value
     this.glAccountForm.patchValue({ entityId: selected.id });
     
     this.spinnerService.show();
     const params = new FilterGlAccountEntityDto();
     params.entityId = selected.id;
     params.take = 10000000;
     params.skip = 0;
 
     this.glAccountEntityService.geGlAccountEntitysTree(params)
       .pipe(takeUntil(this.destroy$))
       .subscribe({
         next: (result) => {
           // ✅ map to jsTree format
           this.glAccountEntityjstreeData = this.mapToJsTreeDataByNumericId(result || []);
           this.glAccountEntityshowTree = true;
           this.glAccountEntitycreateJSTreeForm(this.glAccountEntityjstreeData);
           this.spinnerService.hide();
         },
         error: () => this.spinnerService.hide()
       });
   } else {
     this.createData.entityId = null;
     this.glAccountForm.patchValue({ entityId: null });
     this.glAccountEntityIdSelect2 = [];
     this.glAccountEntityshowTree = false;
   }
}
  onaccountStatusSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.accountStatussearchParams.skip = 0;
    this.accountStatussearchParams.searchValue = search;
    this.accountStatusSelect2 = [];
    this.accountStatusSearchInput$.next(search);
  }

  loadMoreaccountStatus(): void {
    this.accountStatussearchParams.skip++;
    this.fetchaccountStatusSelect2();
  }

  fetchaccountStatusSelect2(): void {
    this.loadingaccountStatus = true;
    this.searchSelect2Params.searchValue = this.accountStatussearchParams.searchValue;
    this.searchSelect2Params.skip = this.accountStatussearchParams.skip;
    this.searchSelect2Params.take = this.accountStatussearchParams.take;

    this.Select2Service.getAccountStatusSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.accountStatusSelect2 = [...this.accountStatusSelect2, ...newItems];
          this.loadingaccountStatus = false;
        },
        error: () => this.loadingaccountStatus = false
      });
  }

  onaccountStatusSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.accountStatus = selectedvendor.id;
      this.searchParams.accountStatusstr = selectedvendor.text;
    } else {
      this.searchParams.accountStatus = null;
      this.searchParams.accountStatusstr = null;
    }
  }


  onaccountIdSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    this.accountIdsearchParams.skip = 0;
    this.accountIdsearchParams.searchValue = search;
    this.accountIdSelect2 = [];
    this.accountIdSearchInput$.next(search);
  }

  loadMoreaccountId(): void {
    this.accountIdsearchParams.skip++;
    this.fetchaccountIdSelect2();
  }

  fetchaccountIdSelect2(): void {
    this.loadingaccountId = true;
    this.searchSelect2Params.searchValue = this.accountIdsearchParams.searchValue;
    this.searchSelect2Params.skip = this.accountIdsearchParams.skip;
    this.searchSelect2Params.take = this.accountIdsearchParams.take;

    this.Select2Service.getAccountSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.accountIdSelect2 = [...this.accountIdSelect2, ...newItems];
          this.loadingaccountId = false;
        },
        error: () => this.loadingaccountId = false
      });
  }

  onaccountIdSelect2Change(selectedvendor: any): void {
    if (selectedvendor) {
      this.searchParams.accountId = selectedvendor.id;
      this.searchParams.accountIdstr = selectedvendor.text;
    } else {
      this.searchParams.accountId = null;
      this.searchParams.accountIdstr = null;
    }
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
      this.searchParams.accountCode = selectedvendor.text;
    } else {
      this.searchParams.accountCode = null;
      this.searchParams.accountCode = null;
    }
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
    this.searchParams = new FilterGlAccountEntityDto();
    this.loadgridData = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
  }

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
     if (!this.searchParams.entityId) {
      this.loadgridData = [];
      this.pagination.totalCount = 0;
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    this.searchParams.take = event.pageSize;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();
    this.glAccountEntityService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          console.log("response", response);
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
     ;
    this.submitted = true;
    const formData = this.glAccountForm.value;
    if (!formData.glAccountEntityId && formData.parentCode) {
      const lastId = String(formData.parentCode).split(',').pop()?.split('/').pop();
      formData.glAccountEntityId = lastId ?? null;
    }
    const payload = (this.pendingItems && this.pendingItems.length > 0)
      ? this.pendingItems.map(item => ({
          entityId: item.entityId,
          accountCode: item.accountCode,
          parentCode: item.parentCode,
          glAccountEntityId: item.glAccountEntityId ?? (String(item.parentCode).split(',').pop()?.split('/').pop())
        }))
      : [{ ...formData }];
    this.spinnerService.show();
    if (this.modalMode === 'add') {
      this.glAccountEntityService.create(payload)
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
      this.glAccountEntityService.update(formData)
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
    this.pendingItems = [];
    const closeBtn = document.querySelector('#glAccountModal .btn-close') as HTMLElement;
    closeBtn?.click();
  }

getFormDatabyId(id: string, mode: 'edit' | 'view'): void {
   this.modalMode = mode;
   const params: FilterGlAccountEntityByCodeDto = { id };
   this.spinnerService.show();
   this.glAccountEntityService.getDetailById(params)
     .pipe(
       takeUntil(this.destroy$),
       switchMap((detail: GlAccountEntityDto) => {
         this.loadformData = detail;
         this.glAccountForm.patchValue(this.loadformData);
         if (this.modalMode === 'view') {
           this.glAccountForm.disable();
         } else {
           this.glAccountForm.enable();
         }
         const params = new FilterGlAccountEntityDto();
         params.entityId = null;
         params.take = 10000000;
         params.skip = 0;
         params.accountId = detail.id?.toString();
         
         const GlAccountparams = new FilterGlAccountDto();
         GlAccountparams.accountCode = detail.accountCode;
         return forkJoin({
           glAccountEntitytreeData: this.glAccountEntityService.geGlAccountEntitysTree(params),
           glAccounttreeData: this.glAccountService.geGlAccountsTree(GlAccountparams),
           detail: of(detail)
         });
       })
     )
     .subscribe({
       next: (result) => {
         // ✅ map to jsTree format
         this.glAccountjstreeData = this.mapToJsTreeDataByAccountCode(result.glAccounttreeData);
         this.glAccountshowTree = true;
         this.glAccountcreateJSTreeForm(this.glAccountjstreeData);
         this.glAccountEntityjstreeData = this.mapToJsTreeDataByNumericId(result.glAccountEntitytreeData);
         this.glAccountEntityshowTree = true;
         this.glAccountEntitycreateJSTreeForm(this.glAccountEntityjstreeData);
         setTimeout(() => {
           const glAccounttreeElement = $('#glAccountjstreeForm');
           const glAccountEntitytreeElement = $('#glAccountEntityjstreeForm');
         }, 200);
         const parentCodeIdPath = this.glAccountForm.get('parentCode')?.value;
         const accountCodeIdPath = this.glAccountForm.get('accountCode')?.value;
         if (parentCodeIdPath) {
           this.glAccountEntityparentTextPath = this.getTextPathFromIds(parentCodeIdPath, this.glAccountEntityjstreeData);
         }
         if (accountCodeIdPath) {
           this.glAccountparentTextPath = this.getTextPathFromIds(accountCodeIdPath, this.glAccountjstreeData);
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

  // ✅ Mapping function for jsTree - Account tree uses accountCode as id
  private mapToJsTreeDataByAccountCode(data: any[]): any[] {
    return data.map(item => ({
      id: item.accountCode,
      text: `${item.accountCode} / ${item.arabicDescription}`,
      // Preserve original fields for later access
      accountCode: item.accountCode,
      numericId: item.id,
      children: item.children ? this.mapToJsTreeDataByAccountCode(item.children) : []
    }));
  }

  // ✅ Mapping function for jsTree - GL Account Entity tree uses numeric id
  private mapToJsTreeDataByNumericId(data: any[]): any[] {
    return data.map(item => ({
      id: String(item.id),
      text: `${item.accountCode} / ${item.arabicDescription}`,
      // Preserve original fields for later access
      accountCode: item.accountCode,
      numericId: item.id,
      children: item.children ? this.mapToJsTreeDataByNumericId(item.children) : []
    }));
  }


  getFormDataWithDetailsbyId(id: string): void {
    const params: FilterGlAccountEntityByCodeDto = {
      id: id
    };
    this.spinnerService.show();
    forkJoin({
      returnData: this.glAccountEntityService.getWithDetailsById(params) as Observable<GlAccountEntityDto>,
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
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.pagination.currentPage - 1) * this.pagination.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('glAccountEntityResourceName.entityId'), field: 'entity.entitY_NAME', width: 200 },
      { headerName: this.translate.instant('glAccountEntityResourceName.accountCode'), field: 'accountCode', width: 200 },
      { headerName: this.translate.instant('glAccountEntityResourceName.parentCode'), field: 'mappedAccountCode', width: 200 },
  
    ];
  }

openAddNew(): void {
   this.modalMode = 'add';
   this.glAccountForm.reset();
   this.currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
   
   // Reset tree data
   this.glAccountjstreeData = [];
   this.glAccountEntityjstreeData = [];
   this.glAccountshowTree = false;
   this.glAccountEntityshowTree = false;
   this.glAccountparentTextPath = '';
   this.glAccountEntityparentTextPath = '';
   
   // Reset selected objects
   this.selectedentityIdSelect2ObjNew = null;
   
   console.log('Form after reset:', this.glAccountForm.value);
   
   this.spinnerService.show();
 
   // Initialize with default values to avoid 400 errors
   const params = new FilterGlAccountEntityDto();
   params.take = 10000000;
   params.skip = 0;
   params.entityId = '0';
   // Don't set entityId for initial load - let it be null
   
   const GlAccountparams = new FilterGlAccountDto();
   GlAccountparams.take = 10000000;
   GlAccountparams.skip = 0;
   forkJoin({
     glAccountEntityreturnData: this.glAccountEntityService.geGlAccountEntitysTree(params),
     glAccountreturnData: this.glAccountService.geGlAccountsTree(GlAccountparams)
   })
     .pipe(takeUntil(this.destroy$))
     .subscribe({
                next: (result) => {
         console.log('Tree data loaded successfully:', result);
         console.log('glAccount data:', result.glAccountreturnData);
         console.log('glAccountEntity data:', result.glAccountEntityreturnData);
         
         // ✅ map to jsTree format
         this.glAccountjstreeData = this.mapToJsTreeDataByAccountCode(result.glAccountreturnData);
         this.glAccountshowTree = true;
         this.glAccountcreateJSTreeForm(this.glAccountjstreeData);
         this.glAccountEntityjstreeData = this.mapToJsTreeDataByNumericId(result.glAccountEntityreturnData);
         this.glAccountEntityshowTree = true;
         this.glAccountEntitycreateJSTreeForm(this.glAccountEntityjstreeData);
         
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
  addCurrentToList(): void {
    const value = this.glAccountForm.value;
    if (!value?.entityId || !value?.accountCode || !value?.parentCode) {
      this.toastr.warning(this.translate.instant('COMMON.REQUIRED_FIELDS'));
      return;
    }
    const entityIdText = this.selectedentityIdSelect2ObjNew?.text || null;
    const accountCodeText = this.glAccountparentTextPath || null;
    const parentCodeText = this.glAccountEntityparentTextPath || null;

    this.pendingItems.push({
      entityId: value.entityId,
      entityIdText,
      accountCode: value.accountCode,
      accountCodeText,
      parentCode: value.parentCode,
      parentCodeText,
      glAccountEntityId: value.glAccountEntityId
    });
    // Clear selected paths for next add while keeping entityId
    this.glAccountForm.patchValue({
      accountCode: null,
      parentCode: null
    });
    this.glAccountparentTextPath = '';
    this.glAccountEntityparentTextPath = '';
  }

  removeItem(index: number): void {
    if (index > -1 && index < this.pendingItems.length) {
      this.pendingItems.splice(index, 1);
    }
  }


  glAccountcreateJSTreeForm(data: any): void {
    setTimeout(() => {
      const treeElement = $('#glAccountjstreeForm');

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
            this.glAccountForm.patchValue({ accountCode: null });
            this.glAccountparentTextPath = '';
            return;
          }

          const pathsWithIds = selectedNodes.map((n: any) => data.instance.get_path(n, '/', true));
          const pathsWithText = selectedNodes.map((n: any) => data.instance.get_path(n, ' / '));

          this.glAccountForm.patchValue({ accountCode: pathsWithIds.join(',') });
          this.glAccountparentTextPath = pathsWithText.join(' , ');
        }
      );
    }, 0);
  }


  glAccountEntitycreateJSTreeForm(data: any): void {
    setTimeout(() => {
      const treeElement = $('#glAccountEntityjstreeForm');

      if (treeElement && treeElement.jstree(true)) {
        treeElement.jstree('destroy');
      }

      treeElement.jstree({
        core: {
          check_callback: true,
          themes: { responsive: false },
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
            this.glAccountEntityparentTextPath = '';
            // Clear numeric id when nothing is selected
            this.glAccountForm.patchValue({ glAccountEntityId: null });
            return;
          }

          const pathsWithIds = selectedNodes.map((n: any) => data.instance.get_path(n, '/', true));
          const pathsWithText = selectedNodes.map((n: any) => data.instance.get_path(n, ' / '));

          this.glAccountForm.patchValue({ parentCode: pathsWithIds.join(',') });
          this.glAccountEntityparentTextPath = pathsWithText.join(' , ');
          // Also store the last selected node's numeric id as glAccountEntityId
          const lastSelected = selectedNodes[selectedNodes.length - 1];
          const selectedNodeId = lastSelected?.id ? String(lastSelected.id).split('/').pop() : null;
          this.glAccountForm.patchValue({ glAccountEntityId: selectedNodeId });
        }
      );
    }, 0);
  }




  onglAccountTreeSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchString = input.value;
    const tree = $('#glAccountjstreeForm').jstree(true);
    if (tree) {
      tree.search(searchString);
    }
  }

  onglAccountEntityTreeSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchString = input.value;
    const tree = $('#glAccountEntityjstreeForm').jstree(true);
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
    this.glAccountEntityService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse[0]?.rowsCount || initialResponse?.data?.length || 0;

          this.glAccountEntityService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response || [];

                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('glAccountEntityResourceName.title'),
                  reportTitle: this.translate.instant('glAccountEntityResourceName.title'),
                  fileName: `${this.translate.instant('glAccountEntityResourceName.title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('glAccountEntityResourceName.accountCode'), value: this.searchParams.accountCodestr },
                    { label: this.translate.instant('glAccountEntityResourceName.accountDescription'), value: this.searchParams.accountDescription },
                    { label: this.translate.instant('glAccountEntityResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('glAccountEntityResourceName.accountStatus'), value: this.searchParams.accountStatusstr },
                    { label: this.translate.instant('glAccountEntityResourceName.accountId'), value: this.searchParams.accountIdstr }
                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('glAccountEntityResourceName.entityId'), key: 'entity.entitY_NAME' },
                    { label: this.translate.instant('glAccountEntityResourceName.accountCode'), key: 'accountCode' },
                    { label: this.translate.instant('glAccountEntityResourceName.parentCode'), key: 'parentCode' },
                    { label: this.translate.instant('glAccountEntityResourceName.accountDescription'), key: 'accountDescription' },
                    { label: this.translate.instant('glAccountEntityResourceName.arabicDescription'), key: 'arabicDescription' },
                    { label: this.translate.instant('glAccountEntityResourceName.natureOfAccount'), key: 'natureOfAccount' },
                    { label: this.translate.instant('glAccountEntityResourceName.accountStatus'), key: 'accountStatus' },
                    { label: this.translate.instant('glAccountEntityResourceName.isDisabled'), key: 'isDisabled' },
                    { label: this.translate.instant('glAccountEntityResourceName.trialBalance'), key: 'trailBalance' },
                    { label: this.translate.instant('glAccountEntityResourceName.profitLoss'), key: 'profitLoss' },
                    { label: this.translate.instant('glAccountEntityResourceName.balanceSheet'), key: 'balanceSheet' }
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

