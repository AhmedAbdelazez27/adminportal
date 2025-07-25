import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, Subject, take } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { CustomTableComponent } from '../../../../../shared/custom-table/custom-table.component';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { openStandardReportService } from '../../../../core/services/openStandardReportService.service';
import { FndLookUpValuesSelect2RequestDto, Pagination, reportPrintConfig, Select2RequestDto, SelectdropdownResult, SelectdropdownResultResults } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { Select2Service } from '../../../../core/services/Select2.service';
import { beneficentDto, filterBeneficentByIdDto, filterBeneficentDto, loadBeneficentNameDto } from '../../../../core/dtos/sponsorship/operations/beneficent.dto';
import { beneficentService } from '../../../../core/services/sponsorship/operations/beneficent.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-beneficent',
    standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CustomTableComponent,NgSelectModule],
  templateUrl: './beneficent.component.html',
  styleUrls: ['./beneficent.component.scss']
})
export class BeneficentComponent {
   @ViewChild('filterForm') filterForm!: NgForm;
 private destroy$ = new Subject<void>();
 pagination = new Pagination();

 entitySelect2: SelectdropdownResultResults[] = [];
 beneficentNameSelect2: SelectdropdownResultResults[] = [];

 searchParams = new filterBeneficentDto();
 searchSelect2RequestDto = new FndLookUpValuesSelect2RequestDto();
 searchParamsById = new filterBeneficentByIdDto();

 loadgridData: beneficentDto[] = [];
 loadformData: beneficentDto = {} as beneficentDto;

 selectedbeneficentNameSelect2Obj: any = null;
 selectedentitySelect2Obj: any = null;
 userEntityForm: FormGroup;
 translatedHeaders$: Observable<string[]> | undefined;
 headerKeys: string[] = [];

 loadingEntity = false;
  entitySearchInput$ = new Subject<string>();
  entitysearchParams = new Select2RequestDto();
  
  loadingbeneficentName = false;
  beneficentNameSearchInput$ = new Subject<string>();
  beneficentNameSearchParams = new Select2RequestDto();
  loadBeneficentNameDto = new loadBeneficentNameDto();


 @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;


 constructor(
   private beneficentService: beneficentService,
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
     this.translate.get('beneficentResourceName.beneficentNumber'),
     this.translate.get('beneficentResourceName.beneficentName'),
     this.translate.get('beneficentResourceName.beneficentAddress'),
     this.translate.get('beneficentResourceName.mobile'),
     this.translate.get('beneficentResourceName.homeTel'),
     this.translate.get('beneficentResourceName.workTel'),
   ]).pipe(
     map(translations => translations)
   );

   this.headerKeys = [
     'beneficenT_NO',
     'beneficentname',
     'address',
     'beneficentmobile',
     'mobilE2',
     'mobilE3'
   ];
   this.entitySearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchEntitySelect2());

     
      
     this.beneficentNameSearchInput$
  .pipe(debounceTime(300), takeUntil(this.destroy$))
  .subscribe((searchTerm: string) => {
    if (this.searchParams.entityId) {
      this.beneficentNameSearchParams.skip = 0;
      this.beneficentNameSearchParams.searchValue = searchTerm?.trim() || null;
      this.beneficentNameSelect2 = [];
      this.fetchBeneficentNameSelect2(this.searchParams.entityId, this.beneficentNameSearchParams.searchValue);
    }
  });

    this.fetchEntitySelect2();
     if (this.searchParams.entityId) {
    this.fetchBeneficentNameSelect2(this.searchParams.entityId, this.beneficentNameSearchParams.searchValue);
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
      this.fetchBeneficentNameSelect2(this.searchParams.entityId);

    } else {
      this.searchParams.entityId = null;
      this.searchParams.entityIdstr = null;
    }
  }

  onBeneficentNameSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
        const searchVal = event.term?.trim() || null;
    this.beneficentNameSearchParams.skip = 0;
    this.beneficentNameSearchParams.searchValue = searchVal;
    this.beneficentNameSelect2 = [];
    this.beneficentNameSearchInput$.next(search);
  }

  loadMoreBeneficentName(): void {
    this.entitysearchParams.skip++;
    this.fetchBeneficentNameSelect2(this.searchParams.entityId);
  }

  fetchBeneficentNameSelect2(entityId: any, searchValue: string | null = null): void {
    if (!entityId) return;
    this.loadingbeneficentName = true;
    this.loadBeneficentNameDto.entityId = entityId;
      this.loadBeneficentNameDto.searchValue = searchValue;

    this.loadBeneficentNameDto.skip = this.beneficentNameSearchParams.skip;
    this.loadBeneficentNameDto.take = this.beneficentNameSearchParams.take;

    this.Select2Service.getBenNameSelect2(this.loadBeneficentNameDto)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.beneficentNameSelect2 = [...this.beneficentNameSelect2, ...newItems];
          this.loadingbeneficentName = false;
        },
        error: () => this.loadingbeneficentName = false
      });
  }

  onBeneficentNameSelect2Change(selectedVendor: any): void {
    if (selectedVendor) {
      this.searchParams.beneficentName = selectedVendor.id;
      this.searchParams.beneficentNamestr = selectedVendor.text;

    } else {
      this.searchParams.beneficentName = null;
      this.searchParams.beneficentNamestr = null;
    }
  }
 
 onSearch(): void {
   this.getLoadDataGrid(1);
 }

 getLoadDataGrid(page: number): void {
   if (!this.searchParams.entityId) {
     this.translate.get(['beneficentResourceName.EntityId', 'Common.Required'])
       .subscribe(translations => {
         this.toastr.warning(`${translations['beneficentResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
       });
     return;
   }
   const skip = (page - 1) * this.pagination.take;
   this.searchParams.skip = skip;
   this.searchParams.take = this.pagination.take;

   const cleanedFilters = this.cleanFilterObject(this.searchParams);
   this.spinnerService.show();
  

   this.beneficentService.getAll(cleanedFilters)
     .pipe(takeUntil(this.destroy$)).subscribe({
       next: (response: any) => {
         this.loadgridData = response || [];
         this.pagination = {...this.pagination,totalCount: response.totalCount || 0};
         this.spinnerService.hide();
       },
       error: () => {
         this.spinnerService.hide();
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
   this.searchParams = new filterBeneficentDto();
   this.loadgridData = [];
this.selectedentitySelect2Obj  = null;
   if (this.filterForm) {
     this.filterForm.resetForm();
   }
 }

 getFormDatabyId(beneficenT_ID: any, entitY_ID: any): void {
   const params: filterBeneficentByIdDto = {
     entityId: entitY_ID,
     beneficenT_ID: beneficenT_ID
   };
   this.spinnerService.show();
   forkJoin({
     beneficentHeaderData: this.beneficentService.getDetailById(params) as Observable<
       beneficentDto | beneficentDto[]>,
   })
     .pipe(takeUntil(this.destroy$)).subscribe({
     next: (result) => {
      debugger;
      console.log("detail ID",result);
       this.loadformData = Array.isArray(result.beneficentHeaderData)
         ? result.beneficentHeaderData[0] ?? ({} as beneficentDto)
         : result.beneficentHeaderData;
         this.spinnerService.hide();
     },
       error: (err) => {
         this.spinnerService.hide();
     }
   });
 }

 printExcel(): void {
   if (!this.searchParams.entityId) {
     this.translate.get(['beneficentResourceName.EntityId', 'Common.Required'])
       .subscribe(translations => {
         this.toastr.warning(`${translations['beneficentResourceName.EntityId']} ${translations['Common.Required']}`, 'Warning');
       });
     return;
   }
   this.spinnerService.show();
   const cleanedFilters = this.cleanFilterObject(this.searchParams);

   this.beneficentService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
     .pipe(takeUntil(this.destroy$))
     .subscribe({
       next: (initialResponse: any) => {
         const totalCount = initialResponse?.totalCount || initialResponse?.data?.length || 0;

         this.beneficentService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
           .pipe(takeUntil(this.destroy$))
           .subscribe({
             next: (response: any) => {
               const data = response|| [];

               const reportConfig: reportPrintConfig = {
                 title: this.translate.instant('beneficentResourceName.Title'),
                 reportTitle: this.translate.instant('beneficentResourceName.Title'),
                 fileName: `${this.translate.instant('beneficentResourceName.Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                 fields: [
                   { label: this.translate.instant('beneficentResourceName.EntityId'), value: this.searchParams.entityIdstr },
                   { label: this.translate.instant('beneficentResourceName.beneficentName'), value: this.searchParams.beneficentNamestr },
                   { label: this.translate.instant('beneficentResourceName.beneficentNumber'), value: this.searchParams.beneficentName },
                   { label: this.translate.instant('beneficentResourceName.phoneNumber'), value: this.searchParams.phoneNumber },                                   
                 ],
                 columns: [
                   { label: '#', key: 'rowNo', title: '#' },
                   { label: this.translate.instant('beneficentResourceName.beneficentNumber'), key: 'beneficenT_NO' },
                   { label: this.translate.instant('beneficentResourceName.beneficentName'), key: 'beneficentname' },
                   { label: this.translate.instant('beneficentResourceName.beneficentAddress'), key: 'address' },
                   { label: this.translate.instant('beneficentResourceName.mobile'), key: 'beneficentmobile' },
                   { label: this.translate.instant('beneficentResourceName.homeTel'), key: 'mobilE2' },
                   { label: this.translate.instant('beneficentResourceName.workTel'), key: 'mobilE3' },
                 ],
                             
                 data: data.map((item: any, index: number) => ({
                   ...item,
                   rowNo: index + 1
                 })),                 
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
