import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Invoice, InvoiceTransaction, InvoiceHeader, Vendor, Entity, InvoiceType, InvoiceFilter } from './models/invoice.models';
import { ToastrService } from 'ngx-toastr';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit, OnDestroy {
  public ApInvoiceList: Invoice[] = [];
  public ApInvoice_trList: InvoiceTransaction[] = [];
  public invoiceHeaderData: InvoiceHeader = {} as InvoiceHeader;
  public vendorList: Vendor[] = [];
  public entityList: Entity[] = [];
  public invoiceTypeList: InvoiceType[] = [];

  public filterModel: InvoiceFilter = this.createDefaultFilter();
  public loading = false;
  private destroy$ = new Subject<void>();

  public columnDefs: ColDef[] = [
    { headerName: 'Invoice Number', field: 'hD_INNO' },
    { headerName: 'Invoice Date', field: 'hD_DATE' },
    { headerName: 'Vendor Number', field: 'vendoR_NUMBER' },
    { headerName: 'Vendor Name', field: 'vendoR_NAME' },
    { headerName: 'Genre', field: 'hD_TYPE_DESC' },
    { headerName: 'Value', field: 'totalVal' },
  ];

  constructor(private apiService: InvoiceService, private toastr: ToastrService) {}

  ngOnInit(): void {
 
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public applyFilter(): void {
    this.getApInvoice();
  }

  public clearFilter(): void {
    this.filterModel = this.createDefaultFilter();
  }

  // TODO: Refactor filter to use FormGroup for better validation and control
  private createDefaultFilter(): InvoiceFilter {
    return {
      entityId: '',
      invoiceNo: '',
invoiceDate: null,
      vendorNo: '',
      vendorName: '',
      type: '',
      OrderbyValue: 'hd_id'
    };
  }

  public getApInvoice(): void {
    const filter: InvoiceFilter = { ...this.filterModel };
    if (!filter.entityId || filter.entityId.trim() === '') {
      this.toastr.warning('Please select an entity before searching.', 'Warning');
      return;
    }
  filter.invoiceDate = filter.invoiceDate && filter.invoiceDate.trim() !== '' 
    ? filter.invoiceDate 
    : null;
    this.loading = true;
    this.apiService.GetApInvoice(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: Invoice[]) => {
          this.ApInvoiceList = (response || []).map((item: Invoice) => {
            if (item.hD_DATE) {
              const date = new Date(item.hD_DATE);
              const day = ('0' + date.getDate()).slice(-2);
              const month = ('0' + (date.getMonth() + 1)).slice(-2);
              const year = date.getFullYear();
              item.hD_DATE = `${day}-${month}-${year}`;
            }
            return item;
          });
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.toastr.error('Failed to load invoices. Please try again.', 'Error');
          console.error('API error:', err);
        }
      });
  }

  public getApInvoice_tr(tr_Id: string, entitY_ID: string): void {
    const params = { tr_Id, entityId: entitY_ID };
    this.loading = true;
    forkJoin({
      trList: this.apiService.GetApInvoice_tr(params),
      header: this.apiService.GetInvoiceheaderDetails(params)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: { trList: InvoiceTransaction[]; header: InvoiceHeader[] | InvoiceHeader }) => {
          this.ApInvoice_trList = result.trList || [];
          this.invoiceHeaderData = Array.isArray(result.header)
            ? result.header[0] || ({} as InvoiceHeader)
            : result.header;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.toastr.error('Failed to fetch invoice details.', 'Error');
          console.error('Error fetching invoice details:', err);
        }
      });
  }

  public fetchVendors(): void {
    if (this.vendorList.length === 0) {
      const request = { searchTerm: '', take: 100, skip: 0 };
      this.apiService.getVendors(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: { results: Vendor[] }) => {
            this.vendorList = response?.results || [];
          },
          error: (err) => {
            this.toastr.error('Failed to load vendor list.', 'Error');
            console.error('Vendor list load error', err);
          }
        });
    }
  }

  public fetchEntities(): void {
    if (this.entityList.length === 0) {
      this.apiService.getEntities()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: { data: Entity[] }) => {
            this.entityList = response?.data || [];
          },
          error: (err) => {
            this.toastr.error('Failed to load entity list.', 'Error');
            console.error('Entity load error', err);
          }
        });
    }
  }

  public fetchInvoiceTypes(): void {
    if (this.invoiceTypeList.length === 0) {
      const request = { searchTerm: '', take: 100, skip: 0 };
      this.apiService.getInvoiceTypes(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: { results: InvoiceType[] }) => {
            this.invoiceTypeList = response?.results || [];
          },
          error: (err) => {
            this.toastr.error('Failed to load invoice type list.', 'Error');
            console.error('Invoice type list load error', err);
          }
        });
    }
  }

  onInvoiceRowClicked(event: any): void {
    const data = event?.data;
    if (data) {
      this.getApInvoice_tr(data.hd_id ?? '', data.entitY_ID ?? '');
    }
  }

  // trackBy functions for *ngFor performance
  public trackByInvoice = (_: number, item: Invoice) => item.hd_id;
  public trackByVendor = (_: number, item: Vendor) => item.text;
  public trackByEntity = (_: number, item: Entity) => item.entitY_ID;
  public trackByInvoiceType = (_: number, item: InvoiceType) => item.id;
}
