import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject } from 'rxjs';
import {ArMiscReceiptDetailsDto, ArMiscReceiptHeaderDto, ArMiscReceiptLinesDto, FilterArMiscReceiptHeaderByIdDto,FilterArMiscReceiptHeaderDto} from '../../../core/dtos/ArMiscReceiptHeaderdtos/ArMiscReceiptHeader.dto';
import { ArMiscReceiptHeaderService } from '../../../core/services/ArMiscReceiptHeader.service';
import {FndLookUpValuesSelect2RequestDto,SelectdropdownResult,SelectdropdownResultResults} from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';

@Component({
  selector: 'app-ArMiscReceiptHeader',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ArMiscReceiptHeader.component.html',
  styleUrls: ['./ArMiscReceiptHeader.component.scss']
})

export class ArMiscReceiptHeaderComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  ArMiscReceiptHeaderListData: ArMiscReceiptHeaderDto[] = [];
  totalCount = 0;
  currentPage = 1;
  itemsPerPage = 2;
  pages: number[] = [];
  searchValue = '';

  apiService: any;

  arMiscReceiptHeaderData: ArMiscReceiptHeaderDto = {} as ArMiscReceiptHeaderDto;
  arMiscReceiptLineData: ArMiscReceiptLinesDto[] = [];
  arMiscReceiptDetailsData: ArMiscReceiptDetailsDto[] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  EntityList: SelectdropdownResultResults[] = [];
  StatusList: SelectdropdownResultResults[] = [];
  ProjectNameList: SelectdropdownResultResults[] = [];
  BenNameList: SelectdropdownResultResults[] = [];

  entityIdError = false;
  statusError = false;
  projectNameError = false;
  benNameError = false;

  FilterArMiscReceiptHeaderObj = new FilterArMiscReceiptHeaderDto();
  SearchFndLookUpValuesSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
  FilterArMiscReceiptHeaderByIdObj = new FilterArMiscReceiptHeaderByIdDto();

  constructor(
    private ArMiscReceiptHeaderService: ArMiscReceiptHeaderService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.ArMiscReceiptHeaderService.GetEntityList(this.SearchFndLookUpValuesSelect2RequestDto).subscribe({
      next: (response: SelectdropdownResult) => {
        this.EntityList = response?.results || [];
      },
      error: (err) => {
        console.error('Entity list load error', err);
      }
    });

    this.ArMiscReceiptHeaderService.GetStatusList(this.SearchFndLookUpValuesSelect2RequestDto).subscribe({
      next: (response: SelectdropdownResult) => {
        this.StatusList = response?.results || [];
      },
      error: (err) => {
        console.error('Status list load error', err);
      }
    });

    this.ArMiscReceiptHeaderService.GetProjectNameList(this.SearchFndLookUpValuesSelect2RequestDto).subscribe({
      next: (response: SelectdropdownResult) => {
        this.ProjectNameList = response?.results || [];
      },
      error: (err) => {
        console.error('Project name list load error', err);
      }
    });

    this.ArMiscReceiptHeaderService.GetBenNameList(this.SearchFndLookUpValuesSelect2RequestDto).subscribe({
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
    const skip = (page - 1) * this.itemsPerPage;
    if (!this.FilterArMiscReceiptHeaderObj.EntityId) return;

    this.ArMiscReceiptHeaderService.getArMiscReceiptHeaders(this.FilterArMiscReceiptHeaderObj).subscribe({
      next: (response: any) => {
        this.ArMiscReceiptHeaderListData = response || [];
        this.totalCount = response?.totalCount || 0;
        this.calculatePages();
      },
      error: (error) => {
        console.error('Error fetching ArMiscReceiptHeaders:', error);
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
    this.getArMiscReceiptHeader(event, this.searchValue);
  }

  changePerPage(event: any): void {
    const perPage = parseInt(event.target.value, 10);
    if (!isNaN(perPage)) {
      this.itemsPerPage = perPage;
      this.calculatePages();
      this.getArMiscReceiptHeader(1, this.searchValue);
    }
  }


  onSearch(): void {
    this.currentPage = 1;

    if (!this.FilterArMiscReceiptHeaderObj.EntityId) {
      this.toastr.warning('Please Select EntityID', 'Warning');
      return;
    }

    const cleanedFilters = this.cleanFilterObject(this.FilterArMiscReceiptHeaderObj);
    this.ArMiscReceiptHeaderService.getArMiscReceiptHeaders(cleanedFilters).subscribe({
      next: (response: any) => {
        this.ArMiscReceiptHeaderListData = response || [];
        this.totalCount = response?.totalCount || 0;
        this.calculatePages();
      },
      error: (error) => {
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
    this.FilterArMiscReceiptHeaderObj = new FilterArMiscReceiptHeaderDto();
    this.ArMiscReceiptHeaderListData = [];

    if (this.filterForm) {
      this.filterForm.resetForm();
    }
  }

  getArMiscReceiptHeaderDetailById(tr_Id: string, entitY_ID: string): void {
    const params: FilterArMiscReceiptHeaderByIdDto = {
      EntityId: entitY_ID,
      MiscReciptId: tr_Id
    };
    forkJoin({
      mischeaderdata: this.ArMiscReceiptHeaderService.getArMiscReceiptHeaderDatabyId(params) as Observable<
        ArMiscReceiptHeaderDto | ArMiscReceiptHeaderDto[]
      >,
      miscdetaildata: this.ArMiscReceiptHeaderService.getArMiscReceiptDetailDatabyId(params) as Observable<
        ArMiscReceiptDetailsDto[]
      >,
      misclinedata: this.ArMiscReceiptHeaderService.getArMiscReceiptLineDatabyId(params) as Observable<ArMiscReceiptLinesDto[]>
    }).subscribe({
      next: (result) => {
        this.arMiscReceiptDetailsData = result.miscdetaildata ?? [];
        this.arMiscReceiptLineData = result.misclinedata ?? [];
        this.arMiscReceiptHeaderData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as ArMiscReceiptHeaderDto)
          : result.mischeaderdata;
      },
      error: (err) => {
        console.error('Error fetching invoice details:', err);
      }
    });
  }
}

