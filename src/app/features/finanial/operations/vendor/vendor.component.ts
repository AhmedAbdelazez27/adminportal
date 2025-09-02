import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm } from '@angular/forms';
import { count, forkJoin, Observable, skip, Subject, take } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { FndLookUpValuesSelect2RequestDto, Pagination, Select2RequestDto, SelectdropdownResult, SelectdropdownResultResults, reportPrintConfig } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { vendorHeaderDto, filterVendorHeaderDto, filtervendorHeaderByIDDto, loadVendorNameDto } from '../../../../core/dtos/FinancialDtos/OperationDtos/vendor.models';
import { vendorService } from '../../../../core/services/Financial/Operation/vendor.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';

declare var bootstrap: any;

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent],
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})

export class VendorComponent implements OnInit {

  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;

  private destroy$ = new Subject<void>();
  userEntityForm!: FormGroup;
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();

  columnDefs: ColDef[] = [];
  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];


  loadformData: vendorHeaderDto = {} as vendorHeaderDto;
  loadgridData: vendorHeaderDto[] = [];

  entitySelect2: SelectdropdownResultResults[] = [];
  statusSelect2: SelectdropdownResultResults[] = [];
  vendorIDSelect2: SelectdropdownResultResults[] = [];

  loadVendorNameDto = new loadVendorNameDto();
  searchFndLookUpValuesSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  searchParams = new filterVendorHeaderDto();
  selectedentitySelect2Obj: any = null;
  selectedstatusSelect2Obj: any = null;
  selectedVendorNameSelect2Obj: any = null;

  loadingEntity = false;
  entitySearchInput$ = new Subject<string>();
  entitysearchParams = new Select2RequestDto();
  loadingStatus = false;
  statusSearchInput$ = new Subject<string>();
  statussearchParams = new Select2RequestDto();
  loadingVendor = false;
  vendorSearchInput$ = new Subject<string>();
  vendorsearchParams = new Select2RequestDto();
  searchSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();



  constructor(private vendorService: vendorService,
    private toastr: ToastrService,
    private translate: TranslateService,
    public openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder,
    public cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.rowActions = [
      { label: this.translate.instant('Common.ViewInfo'), icon: 'icon-frame-view', action: 'onViewInfo' },
    ];

    this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchEntitySelect2());

    this.statusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchStatusSelect2());

    this.vendorSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((searchTerm: string) => {
        if (this.searchParams.entityId) {
          this.vendorsearchParams.skip = 0;
          this.vendorsearchParams.searchValue = searchTerm?.trim() || null;
          this.vendorIDSelect2 = [];
          this.fetchVendorNameSelect2(this.searchParams.entityId, this.vendorsearchParams.searchValue);
        }
      });

    this.fetchEntitySelect2();
    this.fetchStatusSelect2();
    if (this.searchParams.entityId) {
      this.fetchVendorNameSelect2(this.searchParams.entityId, this.vendorsearchParams.searchValue);
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  onEntitySearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.entitysearchParams.skip = 0;
    this.entitysearchParams.searchValue = searchVal;
    this.entitySelect2 = [];
    this.entitySearchInput$.next(search);
  }

  loadMoreEntity(): void {
    this.entitysearchParams.skip++;
    this.fetchEntitySelect2();

  }

  fetchEntitySelect2(): void {
    this.loadingEntity = true;
    this.searchSelect2RequestDto.searchValue = this.entitysearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.entitysearchParams.skip;
    this.searchSelect2RequestDto.take = this.entitysearchParams.take;

    this.Select2Service.getEntitySelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.entitySelect2 = [...this.entitySelect2, ...newItems];
          this.loadingEntity = false;
        },
        error: () => this.loadingEntity = false
      });
  }

  onentitySelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.entityId = selectedVendor.id;
      this.searchParams.entityIdstr = selectedVendor.text;
      this.fetchVendorNameSelect2(this.searchParams.entityId);

    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }

  onStatusSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.statussearchParams.skip = 0;
    this.statussearchParams.searchValue = searchVal;
    this.statusSelect2 = [];
    this.statusSearchInput$.next(search);
  }

  loadMoreStatus(): void {
    this.statussearchParams.skip++;
    this.fetchStatusSelect2();

  }

  fetchStatusSelect2(): void {
    this.loadingStatus = true;
    this.searchSelect2RequestDto.searchValue = this.statussearchParams.searchValue;
    this.searchSelect2RequestDto.skip = this.statussearchParams.skip;
    this.searchSelect2RequestDto.take = this.statussearchParams.take;

    this.Select2Service.getVendorStatusSelect2(this.searchSelect2RequestDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.statusSelect2 = [...this.statusSelect2, ...newItems];
          this.loadingStatus = false;
        },
        error: () => this.loadingStatus = false
      });
  }

  onStatusSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.status = selectedVendor.id;
      this.searchParams.statusStr = selectedVendor.text;

    } else {
      this.searchParams.status = null;
      this.searchParams.statusStr = null;
    }
  }

  onVendorNameSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.vendorsearchParams.skip = 0;
    this.vendorsearchParams.searchValue = searchVal;
    this.vendorIDSelect2 = [];
    this.vendorSearchInput$.next(search);
  }

  loadMoreVendorName(): void {
    this.entitysearchParams.skip++;
    this.fetchVendorNameSelect2(this.searchParams.entityId);
  }

  fetchVendorNameSelect2(entityId: any, searchValue: string | null = null): void {
    if (!entityId) return;
    this.loadingVendor = true;
    this.loadVendorNameDto.entityId = entityId;
    this.loadVendorNameDto.searchValue = searchValue;

    this.loadVendorNameDto.skip = this.vendorsearchParams.skip;
    this.loadVendorNameDto.take = this.vendorsearchParams.take;

    this.Select2Service.getVendorIDSelect2(this.loadVendorNameDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.vendorIDSelect2 = [...this.vendorIDSelect2, ...newItems];
          this.loadingVendor = false;
        },
        error: () => this.loadingVendor = false
      });
  }

  onVendorNameSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.VendorName = selectedVendor.id;
      this.searchParams.VendorNameStr = selectedVendor.text;

    } else {
      this.searchParams.VendorName = null;
      this.searchParams.VendorNameStr = null;
    }
  }

  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    if (!this.searchParams.entityId) {
      this.translate
        .get(['ApPaymentsTransactionHDRResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['ApPaymentsTransactionHDRResourceName.EntityId']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;
    const params: filterVendorHeaderDto = {
      entityId: this.searchParams.entityId,
      VendorName: this.searchParams.VendorName,
      status: this.searchParams.status,
      OrderbyValue: this.searchParams.OrderbyValue,
      take: event.pageSize,
      skip: skip,
      entityIdstr: null,
      benificaryNamestr: null,
      VendorNameStr: null,
      statusStr: null,
    };
    const cleanedFilters = this.cleanFilterObject(params);
    this.vendorService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.loadgridData = response || [];
          this.pagination.totalCount = response[0]?.rowsCount || 0;
          this.spinnerService.hide();

        },
        error: (error) => {
          this.spinnerService.hide();
        }
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
    this.searchParams = new filterVendorHeaderDto();
    this.loadgridData = [];
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  getFormDatabyId(vendoR_ID: any, entitY_ID: any): void {
    const params: filtervendorHeaderByIDDto = {
      entityId: entitY_ID,
      vendorId: vendoR_ID
    };
    this.spinnerService.show();

    forkJoin({
      vendorHeaderData: this.vendorService.getDetailById(params) as Observable<vendorHeaderDto | vendorHeaderDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loadformData = Array.isArray(result.vendorHeaderData)
          ? result.vendorHeaderData[0] ?? ({} as vendorHeaderDto)
          : result.vendorHeaderData;
        const modalElement = document.getElementById('viewdetails');;
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
      { headerName: this.translate.instant('vendorResourceName.vendorNo'), field: 'vendoR_NUMBER', width: 200 },
      { headerName: this.translate.instant('vendorResourceName.vendorName'), field: 'vendoR_NAME', width: 200 },
      { headerName: this.translate.instant('vendorResourceName.status'), field: 'statuS_DESC', width: 200 },
      { headerName: this.translate.instant('vendorResourceName.category'), field: 'categorY_DESC', width: 200 },
      { headerName: this.translate.instant('vendorResourceName.address'), field: 'address', width: 200 },
    ];
  }

  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewInfo') {
      this.getFormDatabyId(event.row.vendoR_ID, event.row.entitY_ID);
    }
    if (event.action === 'edit') {
    }
  }


  printExcel(): void {
    if (!this.searchParams.entityId) {
      this.translate
        .get(['ApPaymentsTransactionHDRResourceName.EntityId', 'Common.Required'])
        .subscribe(translations => {
          this.toastr.warning(
            `${translations['ApPaymentsTransactionHDRResourceName.EntityId']} ${translations['Common.Required']}`,
            'Warning'
          );
        });
      return;
    }
    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();

    this.vendorService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse[0]?.rowsCount || 0;

          this.vendorService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response || [];

                const reportConfig: reportPrintConfig = {

                  title: this.translate.instant('vendorResourceName.title'),
                  reportTitle: this.translate.instant('vendorResourceName.title'),
                  fileName: `${this.translate.instant('vendorResourceName.title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('vendorResourceName.entityId'), value: this.searchParams.entityIdstr },
                    { label: this.translate.instant('vendorResourceName.vendorName'), value: this.searchParams.VendorName },
                    { label: this.translate.instant('vendorResourceName.status'), value: this.searchParams.status },

                  ],
                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('vendorResourceName.vendorNo'), key: 'vendoR_NUMBER' },
                    { label: this.translate.instant('vendorResourceName.vendorName'), key: 'vendoR_NAME' },
                    { label: this.translate.instant('vendorResourceName.status'), key: 'statuS_DESC' },
                    { label: this.translate.instant('vendorResourceName.category'), key: 'categorY_DESC' },
                    { label: this.translate.instant('vendorResourceName.address'), key: 'address' },
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
