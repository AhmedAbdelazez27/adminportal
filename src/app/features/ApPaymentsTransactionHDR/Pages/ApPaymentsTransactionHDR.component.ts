import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject } from 'rxjs';
import { ApPaymentsTransactionHDRDto, FilterApPaymentsTransactionHDRByIdDto, FilterApPaymentsTransactionHDRDto } from '../../../core/dtos/ApPaymentsTransactionHDRdtos/ApPaymentsTransactionHDR.dto';
import { ApPaymentsTransactionHDRService } from '../../../core/services/ApPaymentsTransactionHDR.service';
import { FndLookUpValuesSelect2RequestDto, SelectdropdownResult, SelectdropdownResultResults } from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';

@Component({
  selector: 'app-ApPaymentsTransactionHDR',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ApPaymentsTransactionHDR.component.html',
  styleUrls: ['./ApPaymentsTransactionHDR.component.scss']
})

export class ApPaymentsTransactionHDRComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  apPaymentsTransactionHDRListData: ApPaymentsTransactionHDRDto[] = [];
  totalCount = 0;
  currentPage = 1;
  itemsPerPage = 2;
  pages: number[] = [];
  searchValue = '';

  apPaymentsTransactionHDRData: ApPaymentsTransactionHDRDto = {} as ApPaymentsTransactionHDRDto;

  destroy$: Subject<boolean> = new Subject<boolean>();

  EntityList: SelectdropdownResultResults[] = [];
  VendorNameList: SelectdropdownResultResults[] = [];
  PaymentTypeDescList: SelectdropdownResultResults[] = [];

  filterApPaymentsTransactionHDRObj = new FilterApPaymentsTransactionHDRDto();
  searchFndLookUpValuesSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  filterApPaymentsTransactionHDRByIdObj = new FilterApPaymentsTransactionHDRByIdDto();

  constructor(
    private apPaymentsTransactionHDRService: ApPaymentsTransactionHDRService,
    private toastr: ToastrService,
    private translate: TranslateService
  )
  {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.apPaymentsTransactionHDRService.getEntityList(this.searchFndLookUpValuesSelect2RequestDto).subscribe({
      next: (response: SelectdropdownResult) => {
        debugger;
        this.EntityList = response?.results || [];
      },
      error: (err) => {
        console.error('Entity list load error', err);
      }
    });

    this.apPaymentsTransactionHDRService.getApVendorList(this.searchFndLookUpValuesSelect2RequestDto).subscribe({
      next: (response: SelectdropdownResult) => {
        debugger;
        this.VendorNameList = response?.results || [];
      },
      error: (err) => {
        console.error('Status list load error', err);
      }
    });

    this.apPaymentsTransactionHDRService.getPaymentTypeList(this.searchFndLookUpValuesSelect2RequestDto).subscribe({
      next: (response: SelectdropdownResult) => {
        debugger;
        this.PaymentTypeDescList = response?.results || [];
      },
      error: (err) => {
        console.error('Project name list load error', err);
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

  getApPaymentsTransactionHDR(page: number, searchValue: string = ''): void {
    const skip = (page - 1) * this.itemsPerPage;
    if (!this.filterApPaymentsTransactionHDRObj.EntityId) return;
    debugger;

    this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRs(this.filterApPaymentsTransactionHDRObj).subscribe({
      next: (response: any) => {
        debugger;

        this.apPaymentsTransactionHDRListData = response || [];
        this.totalCount = response?.totalCount || 0;
        this.calculatePages();
      },
      error: (error) => {
        console.error('Error fetching ApPaymentsTransactionHDRs:', error);
      }
    });
  }

  calculatePages(): void {
    const totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(event: any): void {
    if (event < 1) event = 1;
    if (event > this.pages.length) event = this.pages.length;
    this.currentPage = event;
    this.getApPaymentsTransactionHDR(event, this.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.itemsPerPage = perPage;
      this.calculatePages();
      this.getApPaymentsTransactionHDR(1, this.searchValue);
    }
  }


  onSearch(): void {
    this.currentPage = 1;

    if (!this.filterApPaymentsTransactionHDRObj.EntityId) {
      this.toastr.warning('Please Select EntityID', 'Warning');
      return;
    }

    const cleanedFilters = this.cleanFilterObject(this.filterApPaymentsTransactionHDRObj);
    this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRs(cleanedFilters).subscribe({
      next: (response: any) => {
        this.apPaymentsTransactionHDRListData = response || [];
        this.totalCount = response?.totalCount || 0;
        this.calculatePages();
      },
      error: (error) => {
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

  getApPaymentsTransactionHDRDetailById(tr_Id: string, entitY_ID: string): void {
    const params: FilterApPaymentsTransactionHDRByIdDto = {
      EntityId: entitY_ID,
      PaymentId: tr_Id
    };
    forkJoin({
      mischeaderdata: this.apPaymentsTransactionHDRService.getApPaymentsTransactionHDRDatabyId(params) as Observable<
        ApPaymentsTransactionHDRDto | ApPaymentsTransactionHDRDto[]>,
    }).subscribe({
      next: (result) => {
        this.apPaymentsTransactionHDRData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as ApPaymentsTransactionHDRDto)
          : result.mischeaderdata;
      },
      error: (err) => {
        console.error('Error fetching invoice details:', err);
      }
    });
  }
}

