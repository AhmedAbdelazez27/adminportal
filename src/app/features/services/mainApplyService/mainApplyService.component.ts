import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, forkJoin, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { FiltermainApplyServiceDto, FiltermainApplyServiceByIdDto, mainApplyServiceDto, AppUserDto, AttachmentDto, RequestAdvertisementTargetDto, RequestAdvertisementAdLocationDto, RequestAdvertisementAdMethodDto, RequestPlaintEvidenceDto, RequestPlaintJustificationDto, RequestPlaintReasonDto, WorkFlowCommentDto, UpdateStatusDto, DonationCollectionChannelDto, printResultDto } from '../../../core/dtos/mainApplyService/mainApplyService.dto';
import { SpinnerService } from '../../../core/services/spinner.service';
import { Select2Service } from '../../../core/services/Select2.service';
import { openStandardReportService } from '../../../core/services/openStandardReportService.service';
import { Pagination, FndLookUpValuesSelect2RequestDto, SelectdropdownResultResults, Select2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { MainApplyService } from '../../../core/services/mainApplyService/mainApplyService.service';
import { ServiceDataType, serviceIdEnum } from '../../../core/enum/user-type.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityService } from '../../../core/services/entit.service';
import { AttachmentGalleryComponent } from '../../../../shared/attachment-gallery/attachment-gallery.component';
import { environment } from '../../../../environments/environment';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeComponent } from 'angularx-qrcode';
import QRCode from 'qrcode';
import { AuthService } from '../../../core/services/auth.service';

enum ServiceStatus {
  Accept = 1,
  Reject = 2,
  New = 3,
  Wait = 4,
  Draft = 5,
  ReturnForModifications = 7
}

declare var bootstrap: any;

@Component({
  selector: 'app-mainApplyService',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgSelectComponent, GenericDataTableComponent, NgSelectModule,
    ReactiveFormsModule, QRCodeComponent],
  templateUrl: './mainApplyService.component.html',
  styleUrls: ['./mainApplyService.component.scss']
})

export class MainApplyServiceComponent {
  @ViewChild('filterForm') filterForm!: NgForm;
  @ViewChild(GenericDataTableComponent) genericTable!: GenericDataTableComponent;
  userForm: FormGroup;
  submitted: boolean = false;
  firstLevel: boolean = false;
  hasServicePermission: boolean = false;
  lang: any;
  modalMode: 'addNew' | 'returnModificationReasontext' | 'reasontext' = 'addNew';
  private destroy$ = new Subject<void>();
  rejectResonsForm: FormGroup;
  returnModificationForm: FormGroup;
  searchInput$ = new Subject<string>();
  translatedHeaders: string[] = [];
  pagination = new Pagination();
  paginationrequestAdvertisementTarget = new Pagination();
  paginationrequestAdvertisementAdMethod = new Pagination();
  paginationrequestAdvertisementAdLocation = new Pagination();
  paginationrequestPlaintReason = new Pagination();
  paginationrequestPlaintevidence = new Pagination();
  paginationrequestPlaintJustification = new Pagination();
  paginationworkFlowComment = new Pagination();

  columnDefs: ColDef[] = [];
  requestAdvertisementTargetcolumnDefs: ColDef[] = [];
  requestAdvertisementAdMethodcolumnDefs: ColDef[] = [];
  requestAdvertisementAdLocationcolumnDefs: ColDef[] = [];
  requestPlaintReasoncolumnDefs: ColDef[] = [];
  requestPlaintevidencecolumnDefs: ColDef[] = [];
  requestPlaintJustificationcolumnDefs: ColDef[] = [];
  workFlowCommentcolumnDefs: ColDef[] = [];

  gridOptions: GridOptions = { pagination: false };
  searchText: string = '';
  columnHeaderMap: { [key: string]: string } = {};
  rowActions: Array<{ label: string, icon?: string, action: string }> = [];


  searchParams = new FiltermainApplyServiceDto();
  addComment = new WorkFlowCommentDto();
  searchSelect2Params = new FndLookUpValuesSelect2RequestDto();
  searchParamsById = new FiltermainApplyServiceByIdDto();
  addReason = new mainApplyServiceDto();

  loadgridData: mainApplyServiceDto[] = [];
  loadexcelData: mainApplyServiceDto[] = [];
  loadformData: mainApplyServiceDto = {} as mainApplyServiceDto;
  reportData: mainApplyServiceDto = {} as mainApplyServiceDto;
  loaduserformData: AppUserDto = {} as AppUserDto;
  loaduserattachmentsListformData: AttachmentDto[] = [];
  loaduserattachmentsListServiceformData: AttachmentDto[] = [];
  loadRequestAdvertisementTargetListformData: RequestAdvertisementTargetDto[] = [];
  loadRequestAdvertisementAdMethodListformData: RequestAdvertisementAdMethodDto[] = [];
  loadRequestAdvertisementAdLocationListformData: RequestAdvertisementAdLocationDto[] = [];
  loadRequestPlaintReasonListformData: RequestPlaintReasonDto[] = [];
  loadRequestPlaintevidenceListformData: RequestPlaintEvidenceDto[] = [];
  loadRequestPlaintJustificationListformData: RequestPlaintJustificationDto[] = [];
  loadWorkFlowCommentListformData: WorkFlowCommentDto[] = [];
  workFlowQuery: any;
  refuseReasonMsg: any;

  serviceSelect2: SelectdropdownResultResults[] = [];
  loadingservice = false;
  servicesearchParams = new Select2RequestDto();
  selectedserviceSelect2Obj: any = null;
  serviceSearchInput$ = new Subject<string>();

  statusSelect2: SelectdropdownResultResults[] = [];
  loadingstatus = false;
  statussearchParams = new Select2RequestDto();
  selectedstatusSelect2Obj: any = null;
  statusSearchInput$ = new Subject<string>();

  serviceTypeSelect2: SelectdropdownResultResults[] = [];
  loadingserviceType = false;
  serviceTypesearchParams = new Select2RequestDto();
  selectedserviceTypeSelect2Obj: any = null;
  serviceTypeSearchInput$ = new Subject<string>();

  userNameSelect2: SelectdropdownResultResults[] = [];
  loadinguserName = false;
  userNamesearchParams = new Select2RequestDto();
  selecteduserNameSelect2Obj: any = null;
  userNameSearchInput$ = new Subject<string>();

  originalNotes: string | null = null;
  originalworkFlowId: number | null | undefined;
  showReport: boolean = false;
  qrCodeUrl: string | null = null;
  currecntDept: string | null = null;
  constructor(
    private mainApplyService: MainApplyService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private authService: AuthService,
    private Select2Service: Select2Service,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private entityService: EntityService,

  ) {
    this.rejectResonsForm = this.fb.group({
      reasonTxt: [[], Validators.required]
    });
    this.returnModificationForm = this.fb.group({
      returnModificationreasonTxt: [[], Validators.required]
    });
    this.userForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(1)]],
      commentTypeId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.lang = this.translate.currentLang;
   // let storeddepartmentId = localStorage.getItem('departmentId') ?? '';
    let profile = this.authService.snapshot;
    let storeddepartmentId = profile?.departmentId ?? '';

    const storedDeptIds = storeddepartmentId
      .replace(/"/g, '')
      .split(',')
      .map(x => x.trim())
      .filter(x => x !== '');

    this.currecntDept = storeddepartmentId.replace(/"/g, '').trim();

    this.rowActions = [
      { label: this.translate.instant('Common.applicantData'), icon: 'fas fa-address-card', action: 'onViewApplicantData' },
      //{ label: this.translate.instant('Common.serviceData'), icon: 'icon-frame-view', action: 'onViewServiceConfirmationData' },
      //{ label: this.translate.instant('Common.serviceData'), icon: 'icon-frame-view', action: 'onViewServiceInqueryData' },
      { label: this.translate.instant('Common.serviceData'), icon: 'icon-frame-edit', action: 'oneditServiceData' },
      { label: this.translate.instant('Common.serviceData'), icon: 'icon-frame-view', action: 'onViewServiceData' },
      { label: this.translate.instant('Common.Print'), icon: 'fa fa-print', action: 'onPrintPDF' },
    ];

    this.serviceSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchserviceSelect2());

    this.statusSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchstatusSelect2());

    this.serviceTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchserviceTypeSelect2());

    this.userNameSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.fetchuserNameSelect2());

    this.fetchserviceSelect2();
    this.fetchstatusSelect2();
    this.fetchuserNameSelect2();
    this.fetchserviceTypeSelect2();
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
  }


  onserviceSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;

    this.servicesearchParams.skip = 0;
    this.servicesearchParams.searchValue = searchVal;
    this.serviceSelect2 = [];
    this.serviceSearchInput$.next(search);
  }

  loadMoreservice(): void {
    this.servicesearchParams.skip++;
    this.fetchserviceSelect2();
  }

  fetchserviceSelect2(): void {
    this.loadingservice = true;
    this.searchSelect2Params.searchValue = this.servicesearchParams.searchValue;
    this.searchSelect2Params.skip = this.servicesearchParams.skip;
    this.searchSelect2Params.take = this.servicesearchParams.take;

    this.Select2Service.getServiceSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          const newItems = response?.results || [];
          this.serviceSelect2 = [...this.serviceSelect2, ...newItems];
          this.loadingservice = false;
        },
        error: () => this.loadingservice = false
      });
  }

  onserviceSelect2Change(slelectedservice: any): void {
    if (slelectedservice) {
      this.searchParams.serviceId = slelectedservice.id;
      this.searchParams.serviceIdstr = slelectedservice.text;
    } else {
      this.searchParams.serviceId = null;
      this.searchParams.serviceIdstr = null;
    }
  }


  onstatusSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.statussearchParams.skip = 0;
    this.statussearchParams.searchValue = searchVal;
    this.statusSelect2 = [];
    this.statusSearchInput$.next(search);
  }

  loadMorestatus(): void {
    this.statussearchParams.skip++;
    this.fetchstatusSelect2();
  }

  fetchstatusSelect2(): void {
    this.loadingstatus = true;
    this.searchSelect2Params.searchValue = this.statussearchParams.searchValue;
    this.searchSelect2Params.skip = this.statussearchParams.skip;
    this.searchSelect2Params.take = this.statussearchParams.take;

    this.Select2Service.getMainServiceStatusSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.statusSelect2 = response;
          this.loadingstatus = false;
        },
        error: () => this.loadingstatus = false
      });
  }

  onstatusSelect2Change(selectedstatus: any[]): void {
    if (selectedstatus && selectedstatus.length > 0) {
      // Extract only the IDs into an array
      this.searchParams.ServiceStatusIds = selectedstatus.map(s => s.id);

      // Optional: join text for display
      this.searchParams.serviceStatusstr = selectedstatus.map(s => s.text).join(', ');
    } else {
      this.searchParams.ServiceStatusIds = [];
      this.searchParams.serviceStatusstr = null;
    }
  }

  onserviceTypeSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
    this.serviceTypesearchParams.skip = 0;
    this.serviceTypesearchParams.searchValue = search;
    this.serviceTypeSelect2 = [];
    this.serviceTypeSearchInput$.next(search);
  }

  loadMoreserviceType(): void {
    this.serviceTypesearchParams.skip++;
    this.fetchserviceTypeSelect2();
  }

  fetchserviceTypeSelect2(): void {
    this.loadingserviceType = true;
    this.searchSelect2Params.searchValue = this.serviceTypesearchParams.searchValue;
    this.searchSelect2Params.skip = this.serviceTypesearchParams.skip;
    this.searchSelect2Params.take = this.serviceTypesearchParams.take;
    this.Select2Service.getServiceTypeSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.serviceTypeSelect2 = response?.results || [];
          this.loadingserviceType = false;
        },
        error: () => this.loadingserviceType = false
      });
  }

  onserviceTypeSelect2Change(selectedserviceType: any): void {
    if (selectedserviceType) {
      this.searchParams.serviceType = selectedserviceType.id;
      this.searchParams.serviceTypestr = selectedserviceType.text;
    } else {
      this.searchParams.serviceType = null;
      this.searchParams.serviceTypestr = null;
    }
  }

  onuserNameSearch(event: { term: string; items: any[] }): void {
    const search = event.term;
    const searchVal = event.term?.trim() || null;
    this.searchSelect2Params.searchValue = searchVal;
    this.userNamesearchParams.skip = 0;
    this.userNamesearchParams.searchValue = search;
    this.userNameSelect2 = [];
    this.userNameSearchInput$.next(search);
  }

  loadMoreuserName(): void {
    this.userNamesearchParams.skip++;
    this.fetchuserNameSelect2();
  }

  fetchuserNameSelect2(): void {
    this.loadinguserName = true;
    this.searchSelect2Params.searchValue = this.userNamesearchParams.searchValue;
    this.searchSelect2Params.skip = this.userNamesearchParams.skip;
    this.searchSelect2Params.take = this.userNamesearchParams.take;

    this.Select2Service.getUsersSelect2(this.searchSelect2Params)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: SelectdropdownResult) => {
          this.userNameSelect2 = response?.results || [];
          this.loadinguserName = false;
        },
        error: () => this.loadinguserName = false
      });
  }

  onuserNameSelect2Change(selectuserName: any): void {
    if (selectuserName) {
      this.searchParams.userId = selectuserName.id;
      this.searchParams.userIdstr = selectuserName.text;
    } else {
      this.searchParams.userId = null;
      this.searchParams.userIdstr = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  onPageChangerequestAdvertisementTarget(event: { pageNumber: number; pageSize: number }): void {
    this.paginationrequestAdvertisementTarget.currentPage = event.pageNumber;
    this.paginationrequestAdvertisementTarget.take = event.pageSize;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestAdvertisementTarget.take }, id);
  }

  onTableSearchrequestAdvertisementTarget(text: string): void {
    this.searchText = text;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestAdvertisementTarget.take }, id);
  }

  onPageChangerequestAdvertisementAdMethod(event: { pageNumber: number; pageSize: number }): void {
    this.paginationrequestAdvertisementAdMethod.currentPage = event.pageNumber;
    this.paginationrequestAdvertisementAdMethod.take = event.pageSize;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestAdvertisementAdMethod.take }, id);
  }

  onTableSearchrequestAdvertisementAdMethod(text: string): void {
    this.searchText = text;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestAdvertisementAdMethod.take }, id);
  }

  onPageChangerequestAdvertisementAdLocation(event: { pageNumber: number; pageSize: number }): void {
    this.paginationrequestAdvertisementAdLocation.currentPage = event.pageNumber;
    this.paginationrequestAdvertisementAdLocation.take = event.pageSize;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestAdvertisementAdLocation.take }, id);
  }

  onTableSearchrequestAdvertisementAdLocation(text: string): void {
    this.searchText = text;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestAdvertisementAdLocation.take }, id);
  }

  onPageChangerequestPlaintReason(event: { pageNumber: number; pageSize: number }): void {
    this.paginationrequestPlaintReason.currentPage = event.pageNumber;
    this.paginationrequestPlaintReason.take = event.pageSize;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestPlaintReason.take }, id);
  }

  onTableSearchrequestPlaintReason(text: string): void {
    this.searchText = text;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestPlaintReason.take }, id);
  }

  onPageChangerequestPlaintevidence(event: { pageNumber: number; pageSize: number }): void {
    this.paginationrequestPlaintevidence.currentPage = event.pageNumber;
    this.paginationrequestPlaintevidence.take = event.pageSize;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestPlaintevidence.take }, id);
  }

  onTableSearchrequestPlaintevidence(text: string): void {
    this.searchText = text;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestPlaintevidence.take }, id);
  }

  onPageChangerequestPlaintJustification(event: { pageNumber: number; pageSize: number }): void {
    this.paginationrequestPlaintJustification.currentPage = event.pageNumber;
    this.paginationrequestPlaintJustification.take = event.pageSize;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestPlaintJustification.take }, id);
  }

  onTableSearchrequestPlaintJustification(text: string): void {
    this.searchText = text;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationrequestPlaintJustification.take }, id);
  }

  onPageChangeworkFlowComment(event: { pageNumber: number; pageSize: number }): void {
    this.paginationworkFlowComment.currentPage = event.pageNumber;
    this.paginationworkFlowComment.take = event.pageSize;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationworkFlowComment.take }, id);
  }

  onTableSearchworkFlowComment(text: string): void {
    this.searchText = text;
    const id = this.searchParamsById.id || '';
    this.getServiceFormDatabyId({ pageNumber: 1, pageSize: this.paginationworkFlowComment.take }, id);
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
    this.searchParams = new FiltermainApplyServiceDto();
    if (this.filterForm) {
      this.filterForm.resetForm();
    }
    this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
  }

  openCommenttxt(): void {
    this.addComment = new WorkFlowCommentDto();

    const modalElement = document.getElementById('addcomments');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement, { backdrop: 'static' });
      modal.show();
    }
  }



  getLoadDataGrid(event: { pageNumber: number; pageSize: number }): void {
    this.pagination.currentPage = event.pageNumber;
    this.pagination.take = event.pageSize;
    const skip = (event.pageNumber - 1) * event.pageSize;
    this.searchParams.skip = skip;

    const cleanedFilters = this.cleanFilterObject(this.searchParams);
    this.spinnerService.show();

    this.mainApplyService.getAll(cleanedFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.totalCount > 0) {
            const rows = response.data || [];
            const entityRequests = rows.map((c: any) => {
              c.applyDate = this.openStandardReportService.formatDate(c.applyDate);

              if (c.user?.entityId != null) {
                return this.entityName(c.user.entityId).pipe(
                  map((name) => {
                    c.entityName = name;
                    return c;
                  })
                );
              } else {
                c.entityName = "";
                return of(c);
              }
            });

            forkJoin(entityRequests)
              .pipe(takeUntil(this.destroy$))
              .subscribe((resolvedRows) => {
                this.loadgridData = resolvedRows as any[];
                this.pagination.totalCount = response.totalCount || 0;
                this.spinnerService.hide();
              });
          }
          else {
            this.loadgridData = [];
            this.pagination.totalCount = response.totalCount || 0;
            this.spinnerService.hide();
          }
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
  }


  getRowActions(row: any): Array<{ label: string, icon?: string, action: string }> {
    if (row.serviceId === "1") {
      return [
        { label: this.translate.instant('Common.applicantData'), icon: 'fas fa-address-card', action: 'onViewApplicantData' },
        { label: this.translate.instant('Common.serviceData'), icon: 'icon-frame-view', action: 'onViewServiceData' }
      ];
    } else {
      return [
        { label: this.translate.instant('Common.applicantData'), icon: 'fas fa-address-card', action: 'onViewApplicantData' }
      ];
    }
  }

  getuserFormDatabyId(id: string): void {
    const params: FiltermainApplyServiceByIdDto = {
      id: id
    };
    this.spinnerService.show();;
    forkJoin({
      headerdata: this.mainApplyService.getuserDetailById(params) as Observable<AppUserDto | AppUserDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        let headerRecord: AppUserDto;

        if (Array.isArray(result.headerdata)) {
          headerRecord = result.headerdata[0] ?? ({} as AppUserDto);
        } else {
          headerRecord = result.headerdata ?? ({} as AppUserDto);
        }

        this.loaduserformData = headerRecord;

        this.loaduserattachmentsListformData = headerRecord.attachments ?? [];

        const modalElement = document.getElementById('viewdetails');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        };
        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();;
      }
    });
  }

  getAttachmentUrl(imgPath: string): string {
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
    return `${environment.apiBaseUrl}/files/${cleanPath}`;
  }

  viewAttachment(attachment: AttachmentDto | any): void {
    if (attachment.imgPath) {
      const fileUrl = this.getAttachmentUrl(attachment.imgPath);
      window.open(fileUrl, '_blank');
    }
  }

  downloadAttachment(attachment: AttachmentDto | any): void {
    if (attachment.imgPath) {
      const fileUrl = this.getAttachmentUrl(attachment.imgPath);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = attachment.attachmentTitle || attachment.imgPath;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  getFormDatabyId(id: string, serviceId: string): void {
    const params: FiltermainApplyServiceByIdDto = {
      id: id
    };
    this.spinnerService.show();
    forkJoin({
      mischeaderdata: this.mainApplyService.getDetailById(params) as Observable<mainApplyServiceDto | mainApplyServiceDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {

        this.loadformData = Array.isArray(result.mischeaderdata)
          ? result.mischeaderdata[0] ?? ({} as mainApplyServiceDto)
          : result.mischeaderdata;

        this.spinnerService.hide();
        if (serviceId == serviceIdEnum.serviceId7) {
          this.router.navigate(['/request-plaint'], {
            state: { loadformData: this.loadformData }
          });
        }
        if (serviceId == serviceIdEnum.serviceId1002) {
          this.router.navigate([`/view-services-requests/complaint-request/${params.id}`], {
            state: { loadformData: this.loadformData }
          });
        }
        if (serviceId == serviceIdEnum.serviceId2) {
          sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
          window.open(`/mainServices/services/charity-event-permit/${params.id}`, '_blank');
        }
        if (serviceId == serviceIdEnum.serviceId6) {
          sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
          window.open(`/mainServices/services/request-event-permit/${params.id}`, '_blank');
        }
        if (serviceId == serviceIdEnum.serviceId5) {
          sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
          window.open(`/mainServices/services/advertisement/${params.id}`, '_blank');
        }

        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();;
      }
    });
  }


  getServiceFormDatabyId(event: { pageNumber: number; pageSize: number }, id: string): void {
    const params: FiltermainApplyServiceByIdDto = {
      id: id
    };
    this.spinnerService.show();;
    forkJoin({
      headerdata: this.mainApplyService.getDetailById(params) as Observable<mainApplyServiceDto | mainApplyServiceDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {

        let headerRecord: mainApplyServiceDto;

        if (Array.isArray(result.headerdata)) {
          headerRecord = result.headerdata[0] ?? ({} as mainApplyServiceDto);
        } else {
          headerRecord = result.headerdata ?? ({} as mainApplyServiceDto);
        }

        this.loadformData = headerRecord;

        if (Array.isArray(this.loadformData)) {
          this.loaduserformData = this.loadformData[0] ?? ({} as AppUserDto);
        }
        this.loaduserattachmentsListServiceformData = this.loadformData.attachments ?? [];
        this.loadRequestAdvertisementTargetListformData = this.loadformData.requestAdvertisementTargets ?? [];
        this.loadRequestAdvertisementAdMethodListformData = this.loadformData.requestAdvertisementAdMethods ?? [];
        this.loadRequestAdvertisementAdLocationListformData = this.loadformData.requestAdvertisementAdLocations ?? [];
        this.loadRequestPlaintReasonListformData = this.loadformData.requestPlaintReasons ?? [];
        this.loadRequestPlaintevidenceListformData = this.loadformData.requestPlaintEvidences ?? [];
        this.loadRequestPlaintJustificationListformData = this.loadformData.requestPlaintJustifications ?? [];
        this.loadWorkFlowCommentListformData = this.loadformData.workFlowSteps?.flatMap(ws => ws.workFlowComments || []) ?? [];
        this.workFlowQuery = this.loadformData?.workFlowSteps?.find(q => q.id == this.loadformData.workFlowSteps) ?? null;
        this.setRefuseReason();

        const modalElement = document.getElementById('viewservicedetails');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        };
        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();;
      }
    });
  }




  getServiceConfirmationFormDatabyId(event: { pageNumber: number; pageSize: number }, id: string): void {
    const params: FiltermainApplyServiceByIdDto = {
      id: id
    };
    this.spinnerService.show();;
    forkJoin({
      headerdata: this.mainApplyService.getDetailById(params) as Observable<mainApplyServiceDto | mainApplyServiceDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {

        let headerRecord: mainApplyServiceDto;

        if (Array.isArray(result.headerdata)) {
          headerRecord = result.headerdata[0] ?? ({} as mainApplyServiceDto);
        } else {
          headerRecord = result.headerdata ?? ({} as mainApplyServiceDto);
        }

        this.loadformData = headerRecord;

        if (Array.isArray(this.loadformData)) {
          this.loaduserformData = this.loadformData[0] ?? ({} as AppUserDto);
        }
        this.originalworkFlowId = this.loadformData?.workFlowSteps?.[0]?.id;
        this.originalNotes = this.loadformData.notesForApproving ?? '';

        this.loaduserattachmentsListServiceformData = this.loadformData.attachments ?? [];
        this.loadRequestAdvertisementTargetListformData = this.loadformData.requestAdvertisementTargets ?? [];
        this.loadRequestAdvertisementAdMethodListformData = this.loadformData.requestAdvertisementAdMethods ?? [];
        this.loadRequestAdvertisementAdLocationListformData = this.loadformData.requestAdvertisementAdLocations ?? [];
        this.loadRequestPlaintReasonListformData = this.loadformData.requestPlaintReasons ?? [];
        this.loadRequestPlaintevidenceListformData = this.loadformData.requestPlaintEvidences ?? [];
        this.loadRequestPlaintJustificationListformData = this.loadformData.requestPlaintJustifications ?? [];
        this.loadWorkFlowCommentListformData = this.loadformData.workFlowSteps?.flatMap(ws => ws.workFlowComments || []) ?? [];
        this.loadWorkFlowCommentListformData.forEach((c) => {
          if (c.commentTypeId === 1) {
            c.commentTypeName = "internal";
          } else {
            c.commentTypeName = "external";
          }
        });
        this.workFlowQuery = this.loadformData?.workFlowSteps?.find(q => q.id == this.loadformData.workFlowSteps) ?? null;
        this.setRefuseReason();

        const modalElement = document.getElementById('viewserviceconfirmationdetails');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        };
        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();;
      }
    });
  }


  getServiceInqueryFormDatabyId(event: { pageNumber: number; pageSize: number }, id: string): void {
    const params: FiltermainApplyServiceByIdDto = {
      id: id
    };
    this.spinnerService.show();;
    forkJoin({
      headerdata: this.mainApplyService.getDetailById(params) as Observable<mainApplyServiceDto | mainApplyServiceDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {

        let headerRecord: mainApplyServiceDto;

        if (Array.isArray(result.headerdata)) {
          headerRecord = result.headerdata[0] ?? ({} as mainApplyServiceDto);
        } else {
          headerRecord = result.headerdata ?? ({} as mainApplyServiceDto);
        }

        this.loadformData = headerRecord;

        if (Array.isArray(this.loadformData)) {
          this.loaduserformData = this.loadformData[0] ?? ({} as AppUserDto);
        }
        this.loaduserattachmentsListServiceformData = this.loadformData.attachments ?? [];
        this.originalworkFlowId = this.loadformData?.workFlowSteps?.[0]?.id;
        this.originalNotes = this.loadformData.notesForApproving ?? '';
        this.loadRequestAdvertisementTargetListformData = this.loadformData.requestAdvertisementTargets ?? [];
        this.loadRequestAdvertisementAdMethodListformData = this.loadformData.requestAdvertisementAdMethods ?? [];
        this.loadRequestAdvertisementAdLocationListformData = this.loadformData.requestAdvertisementAdLocations ?? [];
        this.loadRequestPlaintReasonListformData = this.loadformData.requestPlaintReasons ?? [];
        this.loadRequestPlaintevidenceListformData = this.loadformData.requestPlaintEvidences ?? [];
        this.loadRequestPlaintJustificationListformData = this.loadformData.requestPlaintJustifications ?? [];
        this.loadWorkFlowCommentListformData = this.loadformData.workFlowSteps?.flatMap(ws => ws.workFlowComments || []) ?? [];
        this.workFlowQuery = this.loadformData?.workFlowSteps?.find(q => q.id == this.loadformData.workFlowSteps) ?? null;
        this.setRefuseReason();

        const modalElement = document.getElementById('viewserviceinquerydetails');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        };
        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();;
      }
    });
  }



  getFastingServiceInqueryFormDatabyId(event: { pageNumber: number; pageSize: number }, id: string): void {
    const params: FiltermainApplyServiceByIdDto = {
      id: id
    };
    this.spinnerService.show();;
    forkJoin({
      headerdata: this.mainApplyService.getDetailById(params) as Observable<mainApplyServiceDto | mainApplyServiceDto[]>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {

        let headerRecord: mainApplyServiceDto;

        if (Array.isArray(result.headerdata)) {
          headerRecord = result.headerdata[0] ?? ({} as mainApplyServiceDto);
        } else {
          headerRecord = result.headerdata ?? ({} as mainApplyServiceDto);
        }

        this.loadformData = headerRecord;

        if (Array.isArray(this.loadformData)) {
          this.loaduserformData = this.loadformData[0] ?? ({} as AppUserDto);
        }
        this.loaduserattachmentsListServiceformData = this.loadformData.attachments ?? [];
        this.originalworkFlowId = this.loadformData?.workFlowSteps?.[0]?.id;
        this.originalNotes = this.loadformData.notesForApproving ?? '';
        this.loadRequestAdvertisementTargetListformData = this.loadformData.requestAdvertisementTargets ?? [];
        this.loadRequestAdvertisementAdMethodListformData = this.loadformData.requestAdvertisementAdMethods ?? [];
        this.loadRequestAdvertisementAdLocationListformData = this.loadformData.requestAdvertisementAdLocations ?? [];
        this.loadRequestPlaintReasonListformData = this.loadformData.requestPlaintReasons ?? [];
        this.loadRequestPlaintevidenceListformData = this.loadformData.requestPlaintEvidences ?? [];
        this.loadRequestPlaintJustificationListformData = this.loadformData.requestPlaintJustifications ?? [];
        this.loadWorkFlowCommentListformData = this.loadformData.workFlowSteps?.flatMap(ws => ws.workFlowComments || []) ?? [];
        this.workFlowQuery = this.loadformData?.workFlowSteps?.find(q => q.id == this.loadformData.workFlowSteps) ?? null;
        this.setRefuseReason();

        const modalElement = document.getElementById('viewfastingserviceinquerydetails');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        };
        this.spinnerService.hide();
      },
      error: (err) => {
        this.spinnerService.hide();;
      }
    });
  }

  submitComment(): void {
    this.submitted = true;

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return;
    }

    const formData = this.userForm.value;

    const params: WorkFlowCommentDto = {
      id: null,
      empId: localStorage.getItem('userId'),
      workFlowStepsId: this.originalworkFlowId,
      comment: formData.comment,
      commentTypeId: formData.commentTypeId,
    };

    this.spinnerService.show();
    this.mainApplyService.saveComment(params).subscribe({
      next: (res) => {
        this.toastr.success(this.translate.instant('TOAST.TITLE.SUCCESS'));
        this.spinnerService.hide();
        var pagination = this.paginationrequestAdvertisementTarget.take || this.paginationrequestAdvertisementAdMethod.take || this.paginationrequestAdvertisementAdLocation.take || this.paginationrequestPlaintReason.take || this.paginationrequestPlaintevidence.take || this.paginationrequestPlaintJustification.take;
        var id = this.loadformData.id || '';
        this.getServiceConfirmationFormDatabyId({ pageNumber: 1, pageSize: pagination }, id);
      },
      error: (err) => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
        this.spinnerService.hide();
      },
      complete: () => this.spinnerService.hide(),
    });
  }

  submitRejectComment(): Observable<any> {
    this.submitted = true;

    if (this.rejectResonsForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return EMPTY;
    }

    const formData = this.rejectResonsForm.value;

    const params: Partial<WorkFlowCommentDto> = {
      id: null,
      empId: localStorage.getItem('userId'),
      workFlowStepsId: this.originalworkFlowId,
      comment: "ملاحظات: " + this.originalNotes,
      commentTypeId: 2,
    };

    this.spinnerService.show();

    return this.mainApplyService.saveComment(params).pipe(
      tap({
        next: (res) => {
          this.toastr.success(this.translate.instant('TOAST.TITLE.SUCCESS'));
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
        },
        complete: () => this.spinnerService.hide()
      })
    );
  }

  submitModficationReasonComment(): Observable<any> {
    this.submitted = true;

    if (this.returnModificationForm.invalid) {
      this.returnModificationForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return EMPTY;
    }

    const formData = this.returnModificationForm.value;

    const params: WorkFlowCommentDto = {
      id: null,
      empId: localStorage.getItem('userId'),
      workFlowStepsId: this.originalworkFlowId,
      comment: "سبب ارجاع الطلب للتعديل : " + formData.returnModificationreasonTxt,
      commentTypeId: 2,
    };

    this.spinnerService.show();

    return this.mainApplyService.saveComment(params).pipe(
      tap({
        next: (res) => {
          this.toastr.success(this.translate.instant('TOAST.TITLE.SUCCESS'));
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
        },
        complete: () => this.spinnerService.hide()
      })
    );
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  }

  entityName(id: any): Observable<string> {
    return this.entityService.getEntityById(id ?? "0").pipe(
      takeUntil(this.destroy$),
      map((entityResp: any) => {
        return this.lang == 'ar' ? entityResp.entitY_NAME : entityResp.entitY_NAME_EN;
      })
    );
  }






  formatDateTime(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString();
  }

  // getStatusClassForGrid(serviceStatus: any): string {
  //   switch (serviceStatus) {
  //     case 1: // Accept
  //       return 'status-approved';
  //     case 2: // Reject
  //       return 'status-rejected';
  //     case 3: // Reject For Reason
  //       return 'status-new';
  //     case 4: // Waiting
  //       return 'status-waiting';
  //     case 5: // Received
  //       return 'status-received';
  //     case 7: // Return For Modifications
  //       return 'status-return-for-modification';
  //     default:
  //       return 'status-waiting';
  //   }
  // }
  getStatusClassForGrid(serviceStatus: any): string {
    switch (serviceStatus) {
      case ServiceStatus.Accept: 
        return 'status-approved';
      case ServiceStatus.Reject: 
        return 'status-rejected';
      case ServiceStatus.New: 
        return 'status-new';
      case ServiceStatus.Wait: 
        return 'status-waiting';
      case ServiceStatus.Draft:
        return 'status-draft';
      case ServiceStatus.ReturnForModifications: 
        return 'status-return-for-modification';
      default:
        return 'status-inactive'; 
    }
  }


  public buildColumnDefs(): void {
    this.columnDefs = [
      { headerName: this.translate.instant('mainApplyServiceResourceName.RequestNo'), field: 'applyNo', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.applydate'), field: 'applyDate', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.sevicet'), field: this.lang == 'ar' ? 'service.serviceName' : 'service.serviceNameEn', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.username'), field: this.lang == 'ar' ? 'user.nameEn' : 'user.name', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.userName'), field: 'entityName', width: 200 },
      {
        headerName: this.translate.instant('mainApplyServiceResourceName.statues'),
        field: this.lang == 'ar' ? 'lastStatus' : 'lastStatusEN',
        width: 200,
        cellRenderer: (params: any) => {
          const statusClass = this.getStatusClassForGrid(params.data.serviceStatus);
          return `<div class="${statusClass}">${params.data.serviceStatusName || ''}</div>`;
        }
      },
      { headerName: this.translate.instant('mainApplyServiceResourceName.desc'), field: 'description', width: 200 },
    ];


    this.requestAdvertisementTargetcolumnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationrequestAdvertisementTarget.currentPage - 1) * this.paginationrequestAdvertisementTarget.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('mainApplyServiceResourceName.TargerType'), field: 'lkpTargetTypeId', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.Othertxt'), field: 'othertxt', width: 200 },
    ];

    this.requestAdvertisementAdMethodcolumnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationrequestAdvertisementAdMethod.currentPage - 1) * this.paginationrequestAdvertisementAdMethod.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('mainApplyServiceResourceName.AdMethod'), field: 'lkpAdMethodId', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.Othertxt'), field: 'othertxt', width: 200 },
    ];

    this.requestAdvertisementAdLocationcolumnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationrequestAdvertisementAdLocation.currentPage - 1) * this.paginationrequestAdvertisementAdLocation.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('mainApplyServiceResourceName.Location'), field: 'location', width: 200 },
    ];

    this.requestPlaintReasoncolumnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationrequestPlaintReason.currentPage - 1) * this.paginationrequestPlaintReason.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('mainApplyServiceResourceName.requestPlaintReason'), field: 'lkpPlaintReasonsName', width: 200 },
    ];

    this.requestPlaintevidencecolumnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationrequestPlaintevidence.currentPage - 1) * this.paginationrequestPlaintevidence.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('mainApplyServiceResourceName.requestPlaintevidence'), field: 'evidence', width: 200 },
    ];

    this.requestPlaintJustificationcolumnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationrequestPlaintJustification.currentPage - 1) * this.paginationrequestPlaintJustification.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('mainApplyServiceResourceName.requestPlaintJustification'), field: 'justification', width: 200 },
    ];

    this.workFlowCommentcolumnDefs = [
      {
        headerName: '#',
        valueGetter: (params) =>
          (params?.node?.rowIndex ?? 0) + 1 + ((this.paginationworkFlowComment.currentPage - 1) * this.paginationworkFlowComment.take),
        width: 60,
        colId: 'serialNumber'
      },
      { headerName: this.translate.instant('mainApplyServiceResourceName.Dept'), field: 'employeeDepartmentName', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.name'), field: 'empName', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.commet'), field: 'comment', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.commentType'), field: 'commentTypeName', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.commentDate'), field: 'lastModifiedstr', width: 200 },
    ];
  }

  //onTableAction(event: { action: string, row: any }) {
  //  if (event.action === 'onViewApplicantData') {
  //    this.getuserFormDatabyId(event.row.userId);
  //  }

  //  if (event.action === 'onViewServiceData') {
  //    var pagination = this.paginationrequestAdvertisementTarget.take || this.paginationrequestAdvertisementAdMethod.take || this.paginationrequestAdvertisementAdLocation.take || this.paginationrequestPlaintReason.take || this.paginationrequestPlaintevidence.take || this.paginationrequestPlaintJustification.take;
  //    this.getServiceConfirmationFormDatabyId({ pageNumber: 1, pageSize: pagination }, event.row.id);
  //  }

  //  if (event.action === 'onViewServiceConfirmationData') {
  //    window.open(`/mainServices/services/serviceconfirmation/${event.row.id}`, '_blank');
  //  }

  //  if (event.action === 'onViewServiceInqueryData') {
  //    window.open(`/mainServices/services/serviceinquery/${event.row.id}`, '_blank');
  //  }

  //  if (event.action === 'onViewFastingServiceInqueryData') {
  //    window.open(`/mainServices/services/fastingserviceinquery/${event.row.id}`, '_blank');
  //  }
  //}


  onTableAction(event: { action: string, row: any }) {
    if (event.action === 'onViewApplicantData') {
      this.getuserFormDatabyId(event.row.userId);
    }

    if (event.action === 'onPrintPDF') {

      if (!event?.row) return;

      const serviceName = event.row.service?.serviceName ?? '';
      const lastStatus = event.row.lastStatus ?? '';
      const permitNumber = event.row.permitNumber ?? '';
      const serviceId = event.row.serviceId ?? '';
      const id = event.row.id ?? '';

      if (serviceName === "تصريح خيمة / موقع إفطار" && lastStatus.includes("تمت الموافقة")) {
        this.printDatabyId(id, serviceId, 'final');
      }
      else if (
        serviceName === "تصريح خيمة / موقع إفطار" &&
        permitNumber.trim() !== '' &&
        ['2009', '2010', '2011'].some(d => this.currecntDept?.includes(d))
      ) {
        this.printDatabyId(id, serviceId, 'initial');
      }
      else if (lastStatus.includes("تمت الموافقة")) {
        this.printDatabyId(id, serviceId, 'initial');
      }
      else {
        this.printDatabyId(id, serviceId, 'initial');

        //this.translate
        //  .get(['mainApplyServiceResourceName.NoPermission', 'Common.Required'])
        //  .subscribe(translations => {
        //    this.toastr.error(
        //      `${translations['mainApplyServiceResourceName.NoPermission']}`,
        //    );
        //  });
        //return;
      }
    }

    
    else if (event.action === 'onViewServiceConfirmationData') {
      window.open(`/mainServices/services/serviceconfirmation/${event.row.id}`, '_blank');
    }

    else  if (event.action === 'onViewServiceInqueryData') {
      window.open(`/mainServices/services/serviceinquery/${event.row.id}`, '_blank');
    }

    else if (event.action === 'onViewFastingServiceInqueryData') {
      window.open(`/mainServices/services/fastingserviceinquery/${event.row.id}`, '_blank');
    }

    else if (event.action === 'oneditServiceData') {
      if (event.row.serviceStatus != 1) {
        if (event.row.serviceId === 1) {
          sessionStorage.setItem("screenmode", 'edit');
          window.open(`/mainServices/services/view-fasting-tent-request/${event.row.id}`, '_blank');
        }
        else if (event.row.serviceId === 1001) {
          sessionStorage.setItem("screenmode", 'edit');
          window.open(`/mainServices/services/view-distribution-site-permit/${event.row.id}`, '_blank');
        }
        else if (event.row.serviceId == serviceIdEnum.serviceId2) {
          sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
          sessionStorage.setItem("screenmode", 'edit');
          window.open(`/mainServices/services/charity-event-permit/${event.row.id}`, '_blank');
        }
        else if (event.row.serviceId == serviceIdEnum.serviceId6) {
          sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
          sessionStorage.setItem("screenmode", 'edit');
          window.open(`/mainServices/services/request-event-permit/${event.row.id}`, '_blank');
        }
        else if (event.row.serviceId == serviceIdEnum.serviceId7) {
          sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
          sessionStorage.setItem("screenmode", 'edit');
          window.open(`/mainServices/services/plaint-request/${event.row.id}`, '_blank');
        }
        else if (event.row.serviceId == serviceIdEnum.serviceId1002) {
          sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
          sessionStorage.setItem("screenmode", 'edit');
          window.open(`/mainServices/services/complaint-request/${event.row.id}`, '_blank');
        }
        else if (event.row.serviceId == serviceIdEnum.serviceId5) {
          sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
          sessionStorage.setItem("screenmode", 'edit');
          window.open(`/mainServices/services/advertisement/${event.row.id}`, '_blank');
        }
      }
      else {
        this.translate
          .get(['mainApplyServiceResourceName.NoPermission', 'Common.Required'])
          .subscribe(translations => {
            this.toastr.error(
              `${translations['mainApplyServiceResourceName.NoPermission']}`,
            );
          });
        return;
      }
    }
   
    if (event.action === 'onViewServiceData') {
      if (event.row.serviceId === 1) {
        sessionStorage.setItem("screenmode", 'view');
        window.open(`/mainServices/services/view-fasting-tent-request/${event.row.id}`, '_blank');
      }
      else if (event.row.serviceId == serviceIdEnum.serviceId2) {
        sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
        sessionStorage.setItem("screenmode", 'view');
        window.open(`/mainServices/services/charity-event-permit/${event.row.id}`, '_blank');
      }
      else if (event.row.serviceId == serviceIdEnum.serviceId5) {
        sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
        sessionStorage.setItem("screenmode", 'view');
        window.open(`/mainServices/services/advertisement/${event.row.id}`, '_blank');
      }
      else if (event.row.serviceId == serviceIdEnum.serviceId6) {
        sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
        sessionStorage.setItem("screenmode", 'view');
        window.open(`/mainServices/services/request-event-permit/${event.row.id}`, '_blank');
      }
      else if (event.row.serviceId == serviceIdEnum.serviceId7) {
        sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
        sessionStorage.setItem("screenmode", 'view');
        window.open(`/mainServices/services/plaint-request/${event.row.id}`, '_blank');
      }
      else if (event.row.serviceId == serviceIdEnum.serviceId1002) {
        sessionStorage.setItem("loadformData", JSON.stringify(this.loadformData));
        sessionStorage.setItem("screenmode", 'view');
        window.open(`/mainServices/services/complaint-request/${event.row.id}`, '_blank');
      }
      else if (event.row.serviceId === 1001) {
        sessionStorage.setItem("screenmode", 'view');
        window.open(`/mainServices/services/view-distribution-site-permit/${event.row.id}`, '_blank');
      }
      else {
        this.translate
          .get(['mainApplyServiceResourceName.NoPermission', 'Common.Required'])
          .subscribe(translations => {
            this.toastr.error(
              `${translations['mainApplyServiceResourceName.NoPermission']}`,
            );
          });
        return;
      }
    }

    if (event.action === 'onRequestComplaint') {
      if (event.row.serviceId == serviceIdEnum.serviceId1002) {
        this.getFormDatabyId(event.row.id, event.row.serviceId);
      }
      else {
        this.translate
          .get(['mainApplyServiceResourceName.NoPermission', 'Common.Required'])
          .subscribe(translations => {
            this.toastr.error(
              `${translations['mainApplyServiceResourceName.NoPermission']}`,
            );
          });
        return;
      }
    }
  }

  setRefuseReason() {
    if (this.loadformData?.workFlowSteps?.length) {
      const stepWithReason = this.loadformData.workFlowSteps.find(
        (q: any) => q.refuseReason && q.refuseReason.trim() !== ''
      );
      this.refuseReasonMsg = stepWithReason ? stepWithReason.refuseReason : null;
    }
  }


  getStatusClass(serviceStatus: number | null | undefined, i: number | null | undefined, count: number): string {
    if (i == null || serviceStatus == null) return '';
    if (this.translate.currentLang == 'ar') {
      return serviceStatus == 1
        ? 'done'
        : (serviceStatus == 2 || serviceStatus == 3)
          ? 'error'
          : serviceStatus == 5
            ? 'first'
            : '';
    } else {
      return serviceStatus == 1
        ? 'done'
        : (serviceStatus == 2 || serviceStatus == 3)
          ? 'error'
          : serviceStatus == 5
            ? 'last'
            : '';
    }
  }


  getFirstClass(i: number | null | undefined): string {
    if (i == null) return '';
    const steps = this.loadformData?.workFlowSteps;
    if (!steps) return '';
    this.firstLevel = true;

    return this.translate.currentLang == 'ar'
      ? (i == 0 ? 'first' : '')
      : (i == 0 ? 'last' : '');
  }

  getLastClass(i: number | null | undefined, count: number): string {
    if (i == null) return '';
    const steps = this.loadformData?.workFlowSteps;
    if (!steps) return '';
    this.firstLevel = true;

    return this.translate.currentLang == 'ar'
      ? (count - 1 == i ? 'last' : '')
      : (count - 1 == i ? 'first' : '');
  }

  getColClass(i: number | null | undefined, count: number): string {
    let colSize = Math.floor(12 / count);
    if (count === 7 && (i === 3 || i === 5)) {
      colSize = 1;
    }

    return `col-md-${colSize}`;
  }



  acceptbtn(): void {
    this.updateStatus("1", '');
  }

  rejectbtn(): void {
    this.updateStatus("2", '');
  }

  cancelcustombtn(): void {
    this.updateStatus("4", '');
  }

  custombtn(): void {
    this.updateStatus("5", '');
  }

  rejectWithReasonbtn(): void {
    this.addReason.reasonForModification = ''
    const modalElement = document.getElementById('myModalReject');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    };
  }

  rejectReasonSave(): void {
    this.submitted = true;

    if (this.rejectResonsForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return;
    }

    const formData = this.rejectResonsForm.value;

    const modalElement = document.getElementById('myModalReject');
    const modal = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;

    this.submitRejectComment().subscribe({
      next: () => {
        this.rejectResonsForm.reset();
        this.submitted = false;

        if (modal) {
          modal.hide();
        }

        this.updateStatus("7", formData.reasonTxt);
        this.spinnerService.hide();
      },
      error: () => {
        this.toastr.error(this.translate.instant('TOAST.SAVE_FAILED'));
      }
    });
  }



  returnForModificationsbtn(): void {
    const modalElement = document.getElementById('myModalReturnModification');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    };
  }

  returnModficationReasonSave(): void {
    this.submitted = true;

    if (this.returnModificationForm.invalid) {
      this.returnModificationForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return;
    }

    const formData = this.returnModificationForm.value;

    this.submitModficationReasonComment().subscribe({
      next: () => {
        this.returnModificationForm.reset();
        this.submitted = false;
        const modalElement = document.getElementById('myModalReturnModification');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modal.hide();
        }
        this.updateStatus("7", formData.returnModificationreasonTxt);
        this.spinnerService.hide();
      },
      error: () => {
        this.toastr.error(this.translate.instant('TOAST.SAVE_FAILED'));
      }
    });
  }


  onNotesChange(newValue: string) {
    this.originalNotes = newValue;
  }

  updateStatus(status: string, reason: string): void {

    const tentDate = this.openStandardReportService.formatDate(this.loadexcelData[0].fastingTentService?.tentDate ?? null);
    const startDate = this.openStandardReportService.formatDate(this.loadexcelData[0].fastingTentService?.startDate ?? null);
    const endDate = this.openStandardReportService.formatDate(this.loadexcelData[0].fastingTentService?.endDate ?? null);

    if (status === "1" && !endDate && this.loadexcelData[0].serviceId === 1) {
      this.toastr.warning(this.translate.instant('VALIDATION.END_DATE_REQUIRED'));
      return;
    }
    if (status === "1" && !startDate && this.loadexcelData[0].serviceId === 1) {
      this.toastr.warning(this.translate.instant('VALIDATION.START_DATE_REQUIRED'));
      return;
    }
    this.spinnerService.show();

    this.saveNotesForApproving().subscribe({
      next: () => {
        const param: UpdateStatusDto = {
          mainApplyServiceId: Number(this.loadformData.id),
          workFlowId: this.originalworkFlowId,
          serviceStatus: Number(status),
          userId: localStorage.getItem('userId'),
          reason: reason,
          notesForApproving: '',
          tentConstructDate: this.addReason.fastingTentService?.tentConstructDate ?? null,
          startDate: this.addReason.fastingTentService?.startDate ?? null,
          endDate: this.addReason.fastingTentService?.endDate ?? null
        };

        this.mainApplyService.update(param).subscribe({
          next: (res: any) => {
            if (res == "UpdateServiceStatusSuccess") {
              let msg = '';
              switch (res.name) {
                case '1': msg = this.translate.instant('mainApplyServiceResourceName.agree'); break;
                case '2': msg = this.translate.instant('mainApplyServiceResourceName.disagree'); break;
                case '3': msg = this.translate.instant('mainApplyServiceResourceName.disagreereas'); break;
                case '7': msg = this.translate.instant('mainApplyServiceResourceName.ReturnForModifications'); break;
                case '4': msg = this.translate.instant('mainApplyServiceResourceName.can'); break;
                case '5': msg = this.translate.instant('mainApplyServiceResourceName.res'); break;
                default: msg = this.translate.instant('mainApplyServiceResourceName.uploadsuccess');
              }

              this.toastr.success(msg);

              if (status != "5") {
                this.spinnerService.hide();
                this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
              } else {
                this.handleStatus5();
                this.getLoadDataGrid({ pageNumber: 1, pageSize: this.pagination.take });
              }
            } else {
              this.toastr.warning(this.translate.instant('COMMON.ERROR'));
              this.spinnerService.hide();
            }
          },
          error: (err) => {
            this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
            this.spinnerService.hide();
          },
          complete: () => this.spinnerService.hide()
        });
      },
      error: () => {
        this.spinnerService.hide();
        this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
      }
    });
  }

  saveNotesForApproving(): Observable<any> {
    this.submitted = true;

    const params: WorkFlowCommentDto = {
      id: null,
      empId: localStorage.getItem('userId'),
      workFlowStepsId: this.originalworkFlowId,
      comment: "ملاحظات: " + this.originalNotes,
      commentTypeId: 2,
    };

    return this.mainApplyService.saveComment(params).pipe(
      tap(() => {
        this.toastr.success(this.translate.instant('TOAST.TITLE.SUCCESS'));
      }),
      catchError(err => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
        return throwError(() => err);
      })
    );
  }

  private handleStatus5(): void {

  }


  //async printDatabyIdModule(id: string, serviceId: string, status: string): Promise<void> {
  //  const params: FiltermainApplyServiceByIdDto = { id };
  //  this.spinnerService.show();

  //  forkJoin({
  //    mischeaderdata: this.mainApplyService.getDetailById(params) as Observable<mainApplyServiceDto | mainApplyServiceDto[]>,
  //  })
  //    .pipe(takeUntil(this.destroy$))
  //    .subscribe({
  //      next: async (result) => {
  //        try {
  //          // ✅ Get report data
  //          const data = Array.isArray(result.mischeaderdata)
  //            ? result.mischeaderdata[0] ?? ({} as mainApplyServiceDto)
  //            : result.mischeaderdata;

  //          // ✅ Generate QR code as Base64
  //          const qrUrl = `${environment.apiBaseUrl}login/PrintD?no=${id}&status=${status}`;
  //          const qrCodeBase64 = await QRCode.toDataURL(qrUrl, {
  //            errorCorrectionLevel: 'M',
  //            width: 120,
  //          });

  //          // ✅ Build HTML manually with your data injected
  //          const baseUrl = window.location.origin;
  //          const imageUrl = `${baseUrl}/assets/images/mainApplyServiceReports.png`;

  //          const reportHtml = `
  //          <html dir="rtl" lang="ar">
  //            <head>
  //              <title>تقرير تصريح ميداني</title>
  //              <style>
  //                body {
  //                  font-family: 'Arial', sans-serif;
  //                  background: #fff;
  //                  direction: rtl;
  //                  margin: 0;
  //                  padding: 20px;
  //                  text-align: center;
  //                }
  //                .report-wrapper {
  //                  position: relative;
  //                  width: 800px;
  //                  height: 1130px;
  //                  margin: auto;
  //                  border: 1px solid #ccc;
  //                  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  //                  overflow: hidden;
  //                }
  //                .report-wrapper img.bg {
  //                  position: absolute;
  //                  top: 0;
  //                  left: 0;
  //                  width: 100%;
  //                  height: 100%;
  //                  z-index: 0;
  //                }
  //                .text-field {
  //                  position: absolute;
  //                  color: brown;
  //                  font-size: 13px;
  //                  z-index: 2;
  //                }
  //                .qr-code {
  //                  position: absolute;
  //                  top: 70px;
  //                  left: 90px;
  //                  width: 100px;
  //                  height: 100px;
  //                  z-index: 2;
  //                }
  //                .print-btn {
  //                  position: fixed;
  //                  top: 10px;
  //                  left: 10px;
  //                  background-color: #007bff;
  //                  color: white;
  //                  border: none;
  //                  border-radius: 5px;
  //                  padding: 6px 12px;
  //                  cursor: pointer;
  //                  font-size: 14px;
  //                }
  //                .print-btn:hover {
  //                  background-color: #0056b3;
  //                }
  //              </style>
  //            </head>
  //            <body>
  //              <button class="print-btn" onclick="window.print()">🖨️ طباعة</button>
  //              <div class="report-wrapper">
  //                <img src="${imageUrl}" class="bg" alt="Report Background"/>

  //                <div class="text-field" style="top: 180px; right: 180px; font-weight: bold; font-size: 14px;">
  //                  ${data?.permitNumber ?? ''}
  //                </div>
  //                <div class="text-field" style="top: 260px; right: 330px;">
  //                  ${data?.user?.foundationName ?? ''}
  //                </div>
  //                <div class="text-field" style="top: 290px; right: 330px;">
  //                  ${data?.fastingTentService?.address ?? ''}
  //                </div>
  //                <div class="text-field" style="top: 320px; right: 330px;">
  //                  ${data?.requestEventPermit?.lkpRequestTypeName ?? ''}
  //                </div>
  //                <div class="text-field" style="top: 350px; right: 330px;">
  //                  ${data?.user?.telNumber ?? ''}
  //                </div>
  //                <div class="text-field" style="top: 380px; right: 330px;">
  //                  ${data?.fastingTentService?.startDate
  //              ? new Date(data.fastingTentService.startDate).toLocaleDateString('ar-EG')
  //              : ''}
  //                </div>
  //                <div class="text-field" style="top: 410px; right: 330px;">
  //                  ${data?.fastingTentService?.endDate
  //              ? new Date(data.fastingTentService.endDate).toLocaleDateString('ar-EG')
  //              : ''}
  //                </div>

  //                <img src="${qrCodeBase64}" class="qr-code" alt="QR Code"/>
  //              </div>
  //            </body>
  //          </html>
  //        `;

  //          // ✅ Open in new tab
  //          const newWin = window.open('', '_blank', 'width=900,height=1200,scrollbars=yes');
  //          if (!newWin) {
  //            throw new Error('Popup blocked — please allow popups for this site.');
  //          }
  //          newWin.document.open();
  //          newWin.document.write(reportHtml);
  //          newWin.document.close();
  //        } catch (error) {
  //          console.error('Error showing report:', error);
  //        } finally {
  //          this.spinnerService.hide();
  //        }
  //      },
  //      error: (err) => {
  //        console.error('Error fetching data:', err);
  //        this.spinnerService.hide();
  //      },
  //    });
  //}


  async printDatabyId(id: string, serviceId: number, status: string): Promise<void> {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      alert('Please allow pop-ups for this site.');
      return;
    }

    // Show loading message immediately
    reportWindow.document.write('<p style="font-family:Arial">Loading report...</p>');

    this.spinnerService.show();

    const params: FiltermainApplyServiceByIdDto = { id };
    const qrUrl = `${environment.apiBaseUrl}login/PrintD?no=${id}&status=${status}`;

    let qrCodeBase64 = '';

    try {
      // Try to generate QR with retry and timeout
      qrCodeBase64 = await this.generateQRCodeWithRetry(qrUrl, 2, 3000); // 2 retries, 3s timeout each
    } catch {
      console.warn('QR generation failed, using fallback QR');
      qrCodeBase64 = await QRCode.toDataURL('Fallback QR', { width: 120 });
    }

    forkJoin({
      mischeaderdata: this.mainApplyService.getDetailById(params) as Observable<mainApplyServiceDto | mainApplyServiceDto[]>,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          try {
            const reportDatas = Array.isArray(result.mischeaderdata)
              ? result.mischeaderdata[0] ?? ({} as mainApplyServiceDto)
              : result.mischeaderdata;

            const baseUrl = window.location.origin;

           //const reportHeader = `${baseUrl}/assets/images/reportHeader.png`;
            const reportHeader = `${baseUrl}/assets/images/council-logo.png`;
            const reportFooter = `${baseUrl}/assets/images/reportFooter.png`;
            const reportHeaderIcon = `${baseUrl}/assets/images/reportHeaderIcon.png`;

            const params: printResultDto =
            {
              id:id,
              responseData: reportDatas,
              reportHeader: reportHeader,
              reportFooter: reportFooter,
              reportWindow: reportWindow,
              qrCodeBase64: qrCodeBase64 
            }
            if (serviceId === 1) {
              if (status === 'final') {
                this.finalReportHtml(params);
              } else if (status === 'initial') {
                this.initialreportHtml(params);
              }
            } else {
              params.reportHeader = reportHeaderIcon;
              this.reportHtml(params);
            }
          } catch (error) {
            console.error('Error showing report:', error);
          } finally {
            this.spinnerService.hide();
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          this.spinnerService.hide();
        },
      });
  }

  // Helper function to retry QR generation
  private async generateQRCodeWithRetry(url: string, retries: number, timeout: number): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const qrPromise = QRCode.toDataURL(url, {
          errorCorrectionLevel: 'M',
          width: 120,
        });

        const result = await Promise.race<string>([
          qrPromise as Promise<string>, // ✅ Explicitly tell TS it's a string promise
          new Promise<string>((_, reject) => setTimeout(() => reject('timeout'), timeout)),
        ]);

        return result; // ✅ Type is now known as string
      } catch (error) {
        console.warn(`QR generation attempt ${attempt + 1} failed:`, error);
        if (attempt === retries) throw error;
      }
    }
    throw new Error('QR generation failed after retries');
  }



  finalReportHtml(data: any) {

    this.reportData = data.responseData;

    const reportHtml = `
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${this.translate.instant('mainApplyServiceResourceName.report.title')}</title>
  <style>
    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; }
    #report { width: 800px; margin: auto; border: 1px solid #ccc; background: #fff; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    td { border: 1px solid #ccc; padding: 5px; vertical-align: top; }
    strong { color: #000; }
    span { color: brown; }
  </style>
</head>
<body>
  <div id="report">
    <!-- Header -->
    <div style="width: 100%; text-align: center;">
      <img src="${data.reportHeader}" alt="Header" style="width: 90%; height: auto;">
    </div>

    <!-- QR Code -->
    <div style="width: 90%; text-align: left; padding: 10px 30px;">
      <img src="${data.qrCodeBase64}" alt="QR Code" style="width: 100px; height: 100px;">
    </div>

    <div style="padding: 10px 50px 10px 50px;">

      <!-- Application Info -->
      <table>
        <tr>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.requestDate')} :
            <span style="color:black;">${this.openStandardReportService.formatDate(this.reportData?.applyDate ?? null)}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.requestNo')} :
            <span style="color:black;">${this.reportData?.applyNo ?? ''}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.permitNo')} :
            <span style="color:black;">${this.reportData?.applyNo ?? ''}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.permitType')}</td>
        </tr>
      </table>

      <div style="padding: 10px; text-align: left;">
  <span style="background:#28a745;color:#fff;padding:3px 10px;border-radius:5px;font-weight:bold;">
    ${this.translate.instant('mainApplyServiceResourceName.report.finalPermit')}
  </span>
</div>


      <div style="text-align:center;background:#f5f5f5;border:1px solid #ccc;padding:6px;font-weight:bold;font-size:15px;margin-top:5px;">
        ${this.translate.instant('mainApplyServiceResourceName.report.fastingTentPermit')}
      </div>

      <!-- Foundation Info -->
      <table>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.foundationName')} : </strong>
          <span style="color:black;">${this.reportData?.user?.foundationName ?? ''}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.foundationAddress')} : </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.address ?? ''}</span></td>
        </tr>
      </table>

      <table>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitType')} : </strong>
          <span style="color:black;">${this.reportData?.requestEventPermit?.lkpRequestTypeName ?? ''}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.contactNumber')} : </strong>
          <span style="color:black;">${this.reportData?.user?.telNumber ?? ''}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitEnd')} : </strong>
          <span style="color:black;">${this.openStandardReportService.formatDate(this.reportData?.fastingTentService?.endDate ?? null)}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitStart')} : </strong>
          <span style="color:black;">${this.openStandardReportService.formatDate(this.reportData?.fastingTentService?.startDate ?? null)}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.region')}: </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.regionName ?? ''}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.streetName')} : </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.streetName ?? ''}</span></td>
        </tr>
      </table>

      <div style="border:1px solid #ccc;border-top:none;padding:6px;font-size:13px;">
        <strong>${this.translate.instant('mainApplyServiceResourceName.report.locationDetails')} : </strong>
        <span style="color:black;">${this.reportData?.fastingTentService?.streetName ?? ''}</span>
      </div>

      <p style="color:red;font-weight:bold;font-size:12px;margin-top:10px;">
        *${this.translate.instant('mainApplyServiceResourceName.report.noteInsideTent')}
      </p>

      <!-- Rules -->
      <h4>${this.translate.instant('mainApplyServiceResourceName.report.ruleTitle')}</h4>
      <ol style="font-size:13px;line-height:1.6;padding-right:20px;color:#333;">
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule1')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule2')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule3')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule4')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule5')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule6')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule7')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule8')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule9')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule10')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule11')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule12')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule13')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule14')}</li>
      </ol>
    </div>

    <!-- Footer -->
    <div style="width:100%;">
      <img src="${data.reportFooter}" alt="Footer" style="width:100%;height:auto;">
    </div>
  </div>
</body>
</html>
`;


    // ✅ Write and open the new tab content
    data.reportWindow.document.open();
    data.reportWindow.document.write(reportHtml);
    data.reportWindow.document.close();
  }

  initialreportHtml(data: any) {

    this.reportData = data.responseData;

    const reportHtml = `
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${this.translate.instant('mainApplyServiceResourceName.report.title')}</title>
  <style>
    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; }
    #report { width: 800px; margin: auto; border: 1px solid #ccc; background: #fff; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    td { border: 1px solid #ccc; padding: 5px; vertical-align: top; }
    strong { color: #000; }
    span { color: brown; }
  </style>
</head>
<body>
  <div id="report">
    <!-- Header -->
    <div style="width: 90%; text-align: center;">
      <img src="${data.reportHeader}" alt="Header" style="width: 90%; height: auto;">
    </div>

    <!-- QR Code -->
    <div style="width: 90%; text-align: left; padding: 10px 30px;">
      <img src="${data.qrCodeBase64}" alt="QR Code" style="width: 100px; height: 100px;">
    </div>

    <div style="padding: 10px 50px 10px 50px;">

      <!-- Application Info -->
      <table>
        <tr>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.requestDate')} :
            <span style="color:black;">${this.openStandardReportService.formatDate(this.reportData?.applyDate ?? null)}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.requestNo')} :
            <span style="color:black;">${this.reportData?.applyNo ?? ''}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.permitNo')} :
            <span style="color:black;">${this.reportData?.applyNo ?? ''}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.permitType')}</td>
        </tr>
      </table>

          <div style="padding: 10px; text-align: left;">
          <span style="background:#d8b45b;color:#fff;padding:3px 10px;border-radius:5px;font-weight:bold;">
        ${this.translate.instant('mainApplyServiceResourceName.report.fieldPermit')}
      </span>
            </div>

      <div style="text-align:center;background:#f5f5f5;border:1px solid #ccc;padding:6px;font-weight:bold;font-size:15px;margin-top:5px;">
        ${this.translate.instant('mainApplyServiceResourceName.report.fastingTentPermit')}
      </div>

      <!-- Foundation Info -->
      <table>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.foundationName')} : </strong>
          <span style="color:black;">${this.reportData?.user?.foundationName ?? ''}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.foundationAddress')} : </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.address ?? ''}</span></td>
        </tr>
      </table>

      <table>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitType')} : </strong>
          <span style="color:black;">${this.reportData?.requestEventPermit?.lkpRequestTypeName ?? ''}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.contactNumber')} : </strong>
          <span style="color:black;">${this.reportData?.user?.telNumber ?? ''}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitEnd')} : </strong>
          <span style="color:black;">${this.openStandardReportService.formatDate(this.reportData?.fastingTentService?.endDate ?? null)}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitStart')} : </strong>
          <span style="color:black;">${this.openStandardReportService.formatDate(this.reportData?.fastingTentService?.startDate ?? null)}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.region')}: </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.regionName ?? ''}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.streetName')} : </strong>
          <span style="color:black;">${this.reportData?.fastingTentService?.streetName ?? ''}</span></td>
        </tr>
      </table>

      <div style="border:1px solid #ccc;border-top:none;padding:6px;font-size:13px;">
        <strong>${this.translate.instant('mainApplyServiceResourceName.report.locationDetails')} : </strong>
        <span style="color:black;">${this.reportData?.fastingTentService?.streetName ?? ''}</span>
      </div>

      <p style="color:red;font-weight:bold;font-size:12px;margin-top:10px;">
        *${this.translate.instant('mainApplyServiceResourceName.report.noteInsideTent')}
      </p>

      <!-- Rules -->
      <h4>${this.translate.instant('mainApplyServiceResourceName.report.ruleTitle')}</h4>
      <ol style="font-size:13px;line-height:1.6;padding-right:20px;color:#333;">
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule1')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule2')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule3')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule4')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule5')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule6')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule7')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule8')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule9')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule10')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule11')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule12')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule13')}</li>
        <li>${this.translate.instant('mainApplyServiceResourceName.report.rule14')}</li>
      </ol>
    </div>

    <!-- Footer -->
    <div style="width:100%;">
      <img src="${data.reportFooter}" alt="Footer" style="width:100%;height:auto;">
    </div>
  </div>
</body>
</html>
`;


    // ✅ Write and open the new tab content
    data.reportWindow.document.open();
    data.reportWindow.document.write(reportHtml);
    data.reportWindow.document.close();
  }

  reportHtml(data: any) {

    this.reportData = data.responseData;

    const reportHtml = `
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${this.translate.instant('mainApplyServiceResourceName.report.title')}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
    }
    #report {
      width: 800px;
      margin: auto;
      border: 1px solid #ccc;
      background: #fff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    td {
      border: 1px solid #ccc;
      padding: 5px;
      vertical-align: top;
    }
    strong {
      color: #000;
    }
    span {
      color: brown;
    }
    .event-name {
      text-align: center;
      padding: 35px;
      font-size: 16px;
      font-weight: bold;
    }
    .event-id {
      text-align: right;
      padding-right: 35px;
      padding-top: 20px;  /* creates gap above ID */
      font-size: 14px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div id="report">
    <!-- Header -->
    <div style="width: 100%; text-align: center;">
      <img src="${data.reportHeader}" alt="Header" style="width: 50%; height: 50%;">
    </div>

    <!-- Event Name -->
    <div class="event-name">
      <p id="eventName">${this.reportData?.requestEventPermit?.eventName ?? ''}</p>
    </div>

    <!-- Gap (approx 2-row space) -->
    <div style="height: 30px;"></div>

    <!-- Event ID -->
    <div class="event-id">
      <p id="eventId">${data.id}</p>
    </div>

      <table>
        <tr>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.requestDate')} :
            <span style="color:black;">${this.openStandardReportService.formatDate(this.reportData?.applyDate ?? null)}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.requestNo')} :
            <span style="color:black;">${this.reportData?.applyNo ?? ''}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.permitNo')} :
            <span style="color:black;">${this.reportData?.applyNo ?? ''}</span>
          </td>
          <td>${this.translate.instant('mainApplyServiceResourceName.report.permitType')}</td>
        </tr>
      </table>


      <div style="text-align:center;background:#f5f5f5;border:1px solid #ccc;padding:6px;font-weight:bold;font-size:15px;margin-top:5px;">
        ${this.translate.instant('mainApplyServiceResourceName.report.fastingTentPermit')}
      </div>

      <!-- Foundation Info -->
      <table>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.foundationName')} : </strong>
          <span style="color:black;">${this.reportData?.user?.foundationName ?? ''}</span></td>
        </tr>
      </table>

      <table>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitType')} : </strong>
          <span style="color:black;">${this.reportData?.requestEventPermit?.lkpRequestTypeName ?? ''}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.contactNumber')} : </strong>
          <span style="color:black;">${this.reportData?.user?.telNumber ?? ''}</span></td>
        </tr>
        <tr>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitEnd')} : </strong>
          <span style="color:black;">${this.openStandardReportService.formatDate(this.reportData?.requestEventPermit?.endDate ?? null)}</span></td>
          <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.permitStart')} : </strong>
          <span style="color:black;">${this.openStandardReportService.formatDate(this.reportData?.requestEventPermit?.startDate ?? null)}</span></td>
        </tr>
       
      </table>
      <table>
       <tr>
       <td><strong>${this.translate.instant('mainApplyServiceResourceName.report.region')}: </strong>
       <span style="color:black;">${this.reportData?.requestEventPermit?.eventLocation ?? ''}</span></td>
       </tr>
      </table>
  </div>
</body>
</html>
`;



    // ✅ Write and open the new tab content
    data.reportWindow.document.open();
    data.reportWindow.document.write(reportHtml);
    data.reportWindow.document.close();
  }

  downloadPDF() {

    const DATA: any = document.getElementById('report');
    html2canvas(DATA).then(canvas => {
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      const width = PDF.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      PDF.addImage(FILEURI, 'PNG', 0, 0, width, height);
      PDF.save('report.pdf');
    });
  }

  printExcel(): void {
    this.spinnerService.show();;
    const cleanedFilters = this.cleanFilterObject(this.searchParams);

    this.mainApplyService.getAll({ ...cleanedFilters, skip: 0, take: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialResponse: any) => {
          const totalCount = initialResponse.totalCount || 0;

          this.mainApplyService.getAll({ ...cleanedFilters, skip: 0, take: totalCount })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                const data = response?.data || [];
                const entityRequests = data.map((c: any) => {
                  c.applyDate = this.openStandardReportService.formatDate(c.applyDate);

                  if (c.user?.entityId != null) {
                    return this.entityName(c.user.entityId).pipe(
                      map((name) => {
                        c.entityName = name;
                        return c;
                      })
                    );
                  } else {
                    c.entityName = "";
                    return of(c);
                  }
                });

                forkJoin(entityRequests)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe((resolvedRows) => {
                    this.loadexcelData = resolvedRows as any[];
                  });
                const reportConfig: reportPrintConfig = {
                  title: this.translate.instant('mainApplyServiceResourceName.mainApplyService_Title'),
                  reportTitle: this.translate.instant('mainApplyServiceResourceName.mainApplyService_Title'),
                  fileName: `${this.translate.instant('mainApplyServiceResourceName.mainApplyService_Title')}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                  fields: [
                    { label: this.translate.instant('mainApplyServiceResourceName.serviceId'), value: this.searchParams.serviceIdstr },
                    { label: this.translate.instant('mainApplyServiceResourceName.userId'), value: this.searchParams.userIdstr },
                    { label: this.translate.instant('mainApplyServiceResourceName.serviceType'), value: this.searchParams.serviceTypestr },
                    { label: this.translate.instant('mainApplyServiceResourceName.serviceStatus'), value: this.searchParams.serviceStatusstr },
                    { label: this.translate.instant('mainApplyServiceResourceName.applyDate'), value: this.searchParams.applyDatestr },
                    { label: this.translate.instant('mainApplyServiceResourceName.applyNo'), value: this.searchParams.applyNo },
                  ],

                  columns: [
                    { label: '#', key: 'rowNo', title: '#' },
                    { label: this.translate.instant('mainApplyServiceResourceName.RequestNo'), key: 'applyNo' },
                    { label: this.translate.instant('mainApplyServiceResourceName.applydate'), key: 'applyDate' },
                    { label: this.translate.instant('mainApplyServiceResourceName.sevicet'), key: this.lang == 'ar' ? 'service.serviceName' : 'service.serviceNameEn' },
                    { label: this.translate.instant('mainApplyServiceResourceName.username'), key: this.lang == 'ar' ? 'user.nameEn' : 'user.name' },
                    { label: this.translate.instant('mainApplyServiceResourceName.userName'), key: 'entityName' },
                    { label: this.translate.instant('mainApplyServiceResourceName.statues'), key: this.lang == 'ar' ? 'lastStatus' : 'lastStatusEN' },
                    { label: this.translate.instant('mainApplyServiceResourceName.desc'), key: 'description' },
                  ],
                  data: this.loadexcelData.map((item: any, index: number) => ({
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






