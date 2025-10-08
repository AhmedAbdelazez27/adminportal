import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, forkJoin, Observable, Subject, Subscription, throwError } from 'rxjs';
import { catchError, debounceTime, takeUntil, tap } from 'rxjs/operators';
import { NgSelectModule } from '@ng-select/ng-select';
import { ColDef, GridOptions } from 'ag-grid-community';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { FiltermainApplyServiceDto, FiltermainApplyServiceByIdDto, mainApplyServiceDto, AppUserDto, AttachmentDto, RequestAdvertisementTargetDto, RequestAdvertisementAdLocationDto, RequestAdvertisementAdMethodDto, RequestPlaintEvidenceDto, RequestPlaintJustificationDto, RequestPlaintReasonDto, WorkFlowCommentDto, UpdateStatusDto, WorkFlowStepDto, CharityEventPermitDto, DonationCollectionChannelDto, PartnerDto } from '../../../core/dtos/mainApplyService/mainApplyService.dto';
import { SpinnerService } from '../../../core/services/spinner.service';
import { Select2Service } from '../../../core/services/Select2.service';
import { openStandardReportService } from '../../../core/services/openStandardReportService.service';
import { Pagination, FndLookUpValuesSelect2RequestDto, SelectdropdownResultResults, Select2RequestDto, SelectdropdownResult, reportPrintConfig } from '../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { MainApplyService } from '../../../core/services/mainApplyService/mainApplyService.service';
import { ServiceDataType, ServiceStatus } from '../../../core/enum/user-type.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import L from 'leaflet';
import { AttachmentService } from '../../../core/services/attachments/attachment.service';

declare var bootstrap: any;

@Component({
  selector: 'app-serviceConfirmation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GenericDataTableComponent, NgSelectModule, ReactiveFormsModule
  ],
  templateUrl: './serviceConfirmation.component.html',
  styleUrls: ['./serviceConfirmation.component.scss']
})

export class ServiceConfirmationComponent {
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
  loadformData: mainApplyServiceDto = {} as mainApplyServiceDto;
  loaduserformData: AppUserDto = {} as AppUserDto;
  loadCharityEventPermitformData: CharityEventPermitDto = {} as CharityEventPermitDto;
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
  workFlowSteps: WorkFlowStepDto[] = [];
  targetWorkFlowStep: WorkFlowStepDto | null = null;

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
  allWorkFlowComments: any[] = [];
  commentsColumnDefs: ColDef[] = [];
  commentsColumnHeaderMap: { [key: string]: string } = {};
  currentTab: number = 1;
  totalTabs: number = 7;

  selectedCommentAttachments: AttachmentDto[] = [];
  isLoadingAttachments: boolean = false;

  isLoadingPartnerAttachments: boolean = false;

  isLoading = false;
  isLoadingComments = false;
  isSavingComment = false;

  hasError = false;
  errorMessage = '';
  errorDetails = '';

  map: any;
  markers: any[] = [];
  customIcon: any;
  mapLoadError: boolean = false;

  commentForm!: FormGroup;
  newCommentText: string = '';
  selectedFiles: File[] = [];

  commentAttachments: { [key: number]: { fileBase64: string; fileName: string; attConfigID: number } } = {};
  commentSelectedFiles: { [key: number]: File } = {};
  commentFilePreviews: { [key: number]: string } = {};
  isCommentDragOver = false;
  commentValidationSubmitted = false;

  showPartnerAttachmentModal = false;
  selectedPartner: PartnerDto | null = null;
  selectedPartnerAttachments: AttachmentDto[] = [];
  private subscriptions: Subscription[] = [];
  showAttachmentModal = false;


  constructor(
    private mainApplyService: MainApplyService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private openStandardReportService: openStandardReportService,
    private spinnerService: SpinnerService,
    private Select2Service: Select2Service,
    private fb: FormBuilder,
    private router: Router,
    private attachmentService: AttachmentService,
    private route: ActivatedRoute
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
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    this.getFormDatabyId(id)

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.loadgridData = response.data || [];
          this.pagination.totalCount = response.totalCount || 0;

          this.loadgridData = response.data.map((row: any) => {
            return {
              ...row,
              rowActions: this.getRowActions(row) 
            };
          });

          this.spinnerService.hide();
        },
        error: (error) => {
          this.spinnerService.hide();;
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

  getFormDatabyId(id: string): void {

    if (id) {
      const params: FiltermainApplyServiceByIdDto = {
        id: id
      };
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

          if (Array.isArray(this.loadformData)) {
            this.loadCharityEventPermitformData = this.loadformData[0].charityEventPermit ?? ({} as CharityEventPermitDto);
          }
          this.loaduserattachmentsListServiceformData = this.loadformData.attachments ?? [];
          this.loadRequestAdvertisementTargetListformData = this.loadformData.requestAdvertisementTargets ?? [];
          this.loadRequestAdvertisementAdMethodListformData = this.loadformData.requestAdvertisementAdMethods ?? [];
          this.loadRequestAdvertisementAdLocationListformData = this.loadformData.requestAdvertisementAdLocations ?? [];
          this.loadRequestPlaintReasonListformData = this.loadformData.requestPlaintReasons ?? [];
          this.loadRequestPlaintevidenceListformData = this.loadformData.requestPlaintEvidences ?? [];
          this.loadRequestPlaintJustificationListformData = this.loadformData.requestPlaintJustifications ?? [];
          this.loadWorkFlowCommentListformData = this.loadformData.workFlowSteps?.flatMap(ws => ws.workFlowComments || []) ?? [];
          this.workFlowSteps = this.loadformData.workFlowSteps || [];

          this.loadWorkFlowCommentListformData.forEach((c) => {
            if (c.commentTypeId === 1) {
              c.commentTypeName = "internal";
            } else {
              c.commentTypeName = "external";
            }
          });

          this.workFlowQuery = this.loadformData?.workFlowSteps?.find(q => q.id == this.loadformData?.workFlowSteps) ?? null;
          this.setRefuseReason();

          this.findTargetWorkFlowStep();
          if (this.targetWorkFlowStep) {
            this.loadWorkFlowComments();
          }

          if (this.loadformData?.fastingTentService?.distributionSiteCoordinators) {
            setTimeout(() => this.initializeMap(), 500);
          }

          if (this.loadformData?.fastingTentService?.locationPhotoPath) {
            setTimeout(() => this.initializeMap1(), 500);
          }

          this.isLoading = false;
        },
        error: (error) => {
          this.hasError = true;
          this.errorMessage = this.getErrorMessage(error);
          if (this.isAuthenticationError(error)) {
            this.errorDetails = this.getErrorGuidance(error);
          } else if (this.isErrorRecoverable(error)) {
            this.errorDetails = this.getErrorGuidance(error);
          } else {
            this.errorDetails = this.getErrorGuidance(error);
          }

          this.isLoading = false;
        }
      });
    }
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
        this.getServiceFormDatabyId({ pageNumber: 1, pageSize: pagination }, id);
      },
      error: (err) => {
        this.toastr.error(this.translate.instant('Common.ERROR_SAVING_DATA'));
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
          this.toastr.error(this.translate.instant('Common.ERROR_SAVING_DATA'));
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
          this.toastr.error(this.translate.instant('Common.ERROR_SAVING_DATA'));
        },
        complete: () => this.spinnerService.hide()
      })
    );
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
      { headerName: this.translate.instant('mainApplyServiceResourceName.ordername'), field: 'user.name', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.ServiceType'), field: 'service.serviceTypeName', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.sevicet'), field: 'service.serviceName', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.RefNo'), field: 'applyNo', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.statues'), field: 'lastStatus', width: 200 },
      { headerName: this.translate.instant('mainApplyServiceResourceName.applydate'), field: 'applyDate', width: 200 },
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

  showMapPopup(photoPath: string | null | undefined) {
    photoPath = 'https://ccc.ajman.ae/ServiceAPI/AttachmentsFiles/e998dfce-946d-4ae6-99dc-fe85d88815de.png';
    if (photoPath) {
      window.open(photoPath, '_blank');
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

        this.updateStatus("3", formData.reasonTxt);
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
        this.updateStatus("3", formData.returnModificationreasonTxt);
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

    const tentDate = this.openStandardReportService.formatDate(this.loadgridData[0].fastingTentService?.tentDate ?? null);
    const startDate = this.openStandardReportService.formatDate(this.loadgridData[0].fastingTentService?.startDate ?? null);
    const endDate = this.openStandardReportService.formatDate(this.loadgridData[0].fastingTentService?.endDate ?? null);

    //if (status === "1" && !tentDate && this.firstLevel && this.mainApplyService?.serviceId === 1) {
    //  this.toastr.warning(this.translate.instant('VALIDATION.TENT_DATE_REQUIRED'));
    //  return;
    //}

    if (status === "1" && !endDate && this.loadgridData[0].serviceId === 1) {
      this.toastr.warning(this.translate.instant('VALIDATION.END_DATE_REQUIRED'));
      return;
    }
    if (status === "1" && !startDate && this.loadgridData[0].serviceId === 1) {
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
              this.toastr.warning(this.translate.instant('Common.ERROR'));
              this.spinnerService.hide();
            }
          },
          error: (err) => {
            this.toastr.error(this.translate.instant('Common.ERROR_SAVING_DATA'));
            this.spinnerService.hide();
          },
          complete: () => this.spinnerService.hide()
        });
      },
      error: () => {
        this.spinnerService.hide();
        this.toastr.error(this.translate.instant('Common.ERROR_SAVING_DATA'));
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
        this.toastr.error(this.translate.instant('Common.ERROR_SAVING_DATA'));
        return throwError(() => err);
      })
    );
  }

  private handleStatus5(): void {

  }

  retryLoadingData(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.errorDetails = '';
  }

  refreshPage(): void {
    window.location.reload();
  }

  checkServiceAvailability(): void {
    this.toastr.info('Checking service availability...');
    setTimeout(() => {
      this.retryLoadingData();
    }, 1000);
  }

  contactSupport(): void {
    this.router.navigate(['/contact-us']);
    this.router.navigate(['/contact-us']);
    this.router.navigate(['/contact-us']);
  }

  copyErrorDetails(): void {
    const errorInfo = `Error: ${this.errorMessage}\nDetails: ${this.errorDetails}\nURL: ${window.location.href}\nTime: ${new Date().toISOString()}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(errorInfo).then(() => {
        this.toastr.success(this.translate.instant('Common.ERROR_DETAILS_COPIED'));
      }).catch(() => {
        this.toastr.error(this.translate.instant('Common.FAILED_COPY_ERROR'));
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = errorInfo;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.toastr.success(this.translate.instant('Common.ERROR_DETAILS_COPIED'));
      } catch (err) {
        this.toastr.error(this.translate.instant('Common.FAILED_COPY_ERROR'));
      }
      document.body.removeChild(textArea);
    }
  }

  goBack(): void {
    if (this.hasError) {
      this.router.navigate(['/mainServices/services']);
    } else {
      this.router.navigate(['/mainServices/services']);
    }
  }

  trackByStepId(index: number, step: WorkFlowStepDto): number {
    return step.id || index;
  }

  isStepCompleted(statusId: number | null | undefined): boolean {
    if (statusId === null) return false;
    return statusId === ServiceStatus.Accept || statusId === ServiceStatus.Received;
  }

  isStepRejected(statusId: number | null | undefined): boolean {
    if (statusId === null) return false;
    return statusId === ServiceStatus.Reject || statusId === ServiceStatus.RejectForReason;
  }

  isStepPending(statusId: number | null | undefined): boolean {
    if (statusId === null) return false;
    return statusId === ServiceStatus.Wait;
  }

  viewAttachment(attachment: AttachmentDto | any): void {
    if (attachment.imgPath) {
      const fileUrl = this.getAttachmentUrl(attachment.imgPath);
      window.open(fileUrl, '_blank');
    }
  }

  getAttachmentUrl(imgPath: string): string {
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
    return `${environment.apiBaseUrl}/files/${cleanPath}`;
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  }

  formatDateTime(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString();
  }

  getStatusColor(statusId: number | null | undefined): string {
    if (statusId === null) return '#6c757d';

    switch (statusId) {
      case ServiceStatus.Accept:
        return '#28a745'; 
      case ServiceStatus.Reject:
        return '#dc3545';
      case ServiceStatus.RejectForReason:
        return '#fd7e14'; 
      case ServiceStatus.Wait:
        return '#ffc107';
      case ServiceStatus.Received:
        return '#17a2b8';
      case ServiceStatus.ReturnForModifications:
        return '#6f42c1'; 
      default:
        return '#6c757d';
    }
  }

  getStatusIcon(statusId: number | null | undefined): string {
    if (statusId === null) return 'fas fa-question-circle';

    switch (statusId) {
      case ServiceStatus.Accept:
        return 'fas fa-check-circle';
      case ServiceStatus.Reject:
        return 'fas fa-times-circle';
      case ServiceStatus.RejectForReason:
        return 'fas fa-exclamation-triangle';
      case ServiceStatus.Wait:
        return 'fas fa-clock';
      case ServiceStatus.Received:
        return 'fas fa-inbox';
      case ServiceStatus.ReturnForModifications:
        return 'fas fa-edit';
      default:
        return 'fas fa-question-circle';
    }
  }

  getStatusLabel(statusId: number | null | undefined): string {
    if (statusId === null) return 'WORKFLOW.STATUS_UNKNOWN';

    switch (statusId) {
      case ServiceStatus.Accept:
        return 'WORKFLOW.STATUS_ACCEPT';
      case ServiceStatus.Reject:
        return 'WORKFLOW.STATUS_REJECT';
      case ServiceStatus.RejectForReason:
        return 'WORKFLOW.STATUS_REJECT_FOR_REASON';
      case ServiceStatus.Wait:
        return 'WORKFLOW.STATUS_WAITING';
      case ServiceStatus.Received:
        return 'WORKFLOW.STATUS_RECEIVED';
      case ServiceStatus.ReturnForModifications:
        return 'WORKFLOW.STATUS_RETURN_FOR_MODIFICATIONS';
      default:
        return 'WORKFLOW.STATUS_UNKNOWN';
    }
  }

  getErrorContext(): string {
    if (this.isAuthenticationError({ status: 401 })) {
      return this.translate.instant('Common.LOGIN_AGAIN_SESSION_EXPIRED');
    } else if (this.isErrorRecoverable({ status: 500 })) {
      return this.translate.instant('Common.TEMPORARY_ISSUE_TRY_AGAIN');
    } else if (this.isErrorRecoverable({ status: 0 })) {
      return this.translate.instant('Common.CHECK_INTERNET_CONNECTION');
    } else {
      return this.translate.instant('Common.CONTACT_SUPPORT_IF_PERSISTS');
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.status === 0 || error?.status === 500) {
      return this.translate.instant('Common.NETWORK_ERROR');
    } else if (error?.status === 404) {
      return this.translate.instant('Common.DATA_NOT_FOUND');
    } else if (error?.status === 401 || error?.status === 403) {
      return this.translate.instant('Common.UNAUTHORIZED_ACCESS');
    } else {
      return this.translate.instant('Common.ERROR_LOADING_DATA');
    }
  }

  private isErrorRecoverable(error: any): boolean {
    return error?.status === 0 || error?.status >= 500;
  }

  private isAuthenticationError(error: any): boolean {
    return error?.status === 401 || error?.status === 403;
  }

  private getErrorGuidance(error: any): string {
    if (this.isAuthenticationError(error)) {
      return this.translate.instant('Common.LOGIN_AGAIN_ACCESS_SERVICE');
    } else if (error?.status === 404) {
      return this.translate.instant('Common.PERMIT_NOT_FOUND_VERIFY_ID');
    } else if (error?.status === 0) {
      return this.translate.instant('Common.UNABLE_CONNECT_SERVER');
    } else if (error?.status >= 500) {
      return this.translate.instant('Common.SERVER_ISSUES_TRY_LATER');
    } else {
      return this.translate.instant('Common.UNEXPECTED_ERROR_TRY_AGAIN');
    }
  }

  private findTargetWorkFlowStep(): void {
    if (this.workFlowSteps && this.workFlowSteps.length > 0) {
      const sortedSteps = this.workFlowSteps
        .filter(step => step.stepOrder !== null)
        .sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));

      this.targetWorkFlowStep = sortedSteps.find(step => step.serviceStatus === 4) || null;
    }
  }

  private loadWorkFlowComments(): void {
    this.allWorkFlowComments = [];

    if (this.workFlowSteps && Array.isArray(this.workFlowSteps)) {
      this.workFlowSteps.forEach(step => {
        if (step.workFlowComments && Array.isArray(step.workFlowComments)) {
          step.workFlowComments.forEach(comment => {
            this.allWorkFlowComments.push({
              ...comment,
              stepDepartmentName: step.departmentName,
              stepServiceStatus: step.serviceStatusName
            });
          });
        }
      });
    }

    this.allWorkFlowComments.sort((a, b) => {
      const dateA = new Date(a.lastModified || 0);
      const dateB = new Date(b.lastModified || 0);
      return dateB.getTime() - dateA.getTime();
    });



    if (this.targetWorkFlowStep && Array.isArray(this.targetWorkFlowStep.workFlowComments)) {
      this.loadWorkFlowCommentListformData = this.targetWorkFlowStep.workFlowComments;
    } else {
      this.loadWorkFlowCommentListformData = [];
    }

    this.initializeCommentsTable();
    this.isLoadingComments = false;
  }


  private initializeCommentsTable(): void {

    this.commentsColumnDefs = [
      {
        headerName: this.translate.instant('Common.COMMENT'),
        field: 'comment',
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: any) => {
          const comment = params.value;
          if (comment) {
            return `<div class="comment-cell">
                      <div class="comment-text">${comment}</div>
                      <div class="comment-meta">
                        <small class="text-muted">
                          <i class="fas fa-user me-1"></i>${params.data.employeeDepartmentName || 'N/A'}
                          <span class="ms-2">
                            <i class="fas fa-calendar me-1"></i>${this.formatDateTime(params.data.lastModified)}
                          </span>
                        </small>
                      </div>
                    </div>`;
          }
          return '-';
        }
      },
      {
        headerName: this.translate.instant('Common.DEPARTMENT'),
        field: 'stepDepartmentName',
        flex: 1.2,
        minWidth: 150
      },
      {
        headerName: this.translate.instant('Common.STATUS'),
        field: 'stepServiceStatus',
        flex: 1,
        minWidth: 120
      },
      {
        headerName: this.translate.instant('Common.FILES'),
        field: 'id',
        flex: 0.8,
        minWidth: 100,
        cellRenderer: (params: any) => {
          const commentId = params.value;

          if (commentId) {
            return `<button class="btn btn-next-style attachment-btn" data-comment-id="${commentId}" data-row-index="${params.node.rowIndex}">
                      <i class="fas fa-eye me-1"></i>
                      <span>${this.translate.instant('Common.VIEW')}</span>
                    </button>`;
          }
          return '-';
        },
        cellClass: 'text-center'
      }
    ];

    this.commentsColumnHeaderMap = {
      'comment': this.translate.instant('Common.COMMENT'),
      'stepDepartmentName': this.translate.instant('Common.DEPARTMENT'),
      'stepServiceStatus': this.translate.instant('Common.STATUS'),
      'attachments': this.translate.instant('Common.FILES')
    };
  }

  refreshMap(): void {
    if (this.loadformData?.fastingTentService?.distributionSiteCoordinators) {
      this.cleanupMap();
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  private initializeMap(): void {
    if (!this.loadformData.fastingTentService?.distributionSiteCoordinators) {
      this.toastr.warning(this.translate.instant('Common.NO_COORDINATES_AVAILABLE'));
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const checkAndInitialize = () => {
      const mapElement = document.getElementById('viewMap');
      attempts++;

      if (mapElement) {
        if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
          setTimeout(() => this.initializeMap(), 500);
          return;
        }

        this.setupViewMap();
      } else if (attempts < maxAttempts) {
        setTimeout(checkAndInitialize, 200);
      } else {
        this.toastr.error('Failed to initialize map: map container not found');
      }
    };

    setTimeout(checkAndInitialize, 100);
  }

  private setupViewMap(): void {
    try {
      const mapElement = document.getElementById('viewMap');
      if (!mapElement) {
        this.toastr.error(this.translate.instant('Common.MAP_CONTAINER_NOT_FOUND'));
        this.mapLoadError = true;
        return;
      }

      if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
        this.toastr.error(this.translate.instant('Common.MAP_CONTAINER_NO_DIMENSIONS'));
        this.mapLoadError = true;
        return;
      }

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      if (!this.loadformData.fastingTentService?.distributionSiteCoordinators) {
        this.toastr.error(this.translate.instant('Common.NO_LOCATION_COORDINATES'));
        this.mapLoadError = true;
        return;
      }

      let coordinates: string[] = [];
      const coordString = this.loadformData?.fastingTentService?.distributionSiteCoordinators ?? '';

      try {
        const jsonCoords = JSON.parse(coordString);
        if (jsonCoords && typeof jsonCoords === 'object') {
          if (jsonCoords.lat !== undefined && jsonCoords.lng !== undefined) {
            coordinates = [jsonCoords.lat.toString(), jsonCoords.lng.toString()];
          } else if (jsonCoords.latitude !== undefined && jsonCoords.longitude !== undefined) {
            coordinates = [jsonCoords.latitude.toString(), jsonCoords.longitude.toString()];
          } else if (jsonCoords.x !== undefined && jsonCoords.y !== undefined) {
            coordinates = [jsonCoords.x.toString(), jsonCoords.y.toString()];
          }
        }
      } catch (jsonError) {
      }

      if (coordinates.length === 0) {
        if (coordString.includes(',')) {
          coordinates = coordString.split(',');
        } else if (coordString.includes(';')) {
          coordinates = coordString.split(';');
        } else if (coordString.includes(' ')) {
          coordinates = coordString.split(' ');
        } else if (coordString.includes('/')) {
          coordinates = coordString.split('/');
        } else if (coordString.includes('|')) {
          coordinates = coordString.split('|');
        } else if (coordString.includes('\t')) {
          coordinates = coordString.split('\t');
        } else {
          this.toastr.error(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_SEPARATOR', { 0: coordString }));
          this.mapLoadError = true;
          return;
        }
      }

      if (coordinates.length !== 2) {
        this.toastr.error(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_COUNT', { 0: coordinates.length }));
        this.mapLoadError = true;
        return;
      }

      const lat = parseFloat(coordinates[0].trim());
      const lng = parseFloat(coordinates[1].trim());



      if (isNaN(lat) || isNaN(lng)) {

        this.toastr.error(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_NUMBERS'));
        this.mapLoadError = true;
        return;
      }

      if (lat === 0 && lng === 0) {

        this.toastr.warning(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_ZERO'));
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {

        this.toastr.error(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_RANGE'));
        this.mapLoadError = true;
        return;
      }

      if (lat < 22 || lat > 27 || lng < 51 || lng > 57) {

        this.toastr.warning(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_UAE'));
      }

      try {
        this.map = L.map('viewMap').setView([lat, lng], 15);
      } catch (mapError) {
        this.toastr.error(this.translate.instant('mainApplyServiceResourceName.MAP_CREATION_FAILED'));
        this.mapLoadError = true;
        return;
      }

      try {
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 5,
          crossOrigin: true,
        });

        tileLayer.on('tileerror', (error) => {
          this.addFallbackTileLayer();
        });

        tileLayer.addTo(this.map);
      } catch (tileError) {
        this.toastr.error(this.translate.instant('mainApplyServiceResourceName.MAP_TILES_FAILED'));
        this.mapLoadError = true;
        return;
      }

      try {
        const marker = L.marker([lat, lng], { icon: this.customIcon })
          .addTo(this.map)
          .bindPopup(this.loadformData.fastingTentService.address || this.translate.instant('mainApplyServiceResourceName.SELECTED_LOCATION'))
          .openPopup();

        this.markers = [marker];
      } catch (markerError) {
        this.toastr.error(this.translate.instant('Common.FAILED_ADD_MARKER'));
        this.mapLoadError = true;
        return;
      }

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          const tileLayersLoaded = this.checkTileLayersLoaded();
          if (!tileLayersLoaded) {
            this.addFallbackTileLayer();
          }
        }
      }, 1000);

      this.mapLoadError = false;

    } catch (error) {
      this.toastr.error(this.translate.instant('Common.FAILED_INITIALIZE_MAP'));
      this.mapLoadError = true;
    }
  }


  refreshMap1(): void {
    if (this.loadformData?.fastingTentService?.locationPhotoPath) {
      this.cleanupMap();
      setTimeout(() => this.initializeMap1(), 100);
    }
  }

  private initializeMap1(): void {
    if (!this.loadformData.fastingTentService?.locationPhotoPath) {
      this.toastr.warning(this.translate.instant('Common.NO_COORDINATES_AVAILABLE'));
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const checkAndInitialize = () => {
      const mapElement = document.getElementById('viewMap');
      attempts++;

      if (mapElement) {
        if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
          setTimeout(() => this.initializeMap1(), 500);
          return;
        }

        this.setupViewMap1();
      } else if (attempts < maxAttempts) {
        setTimeout(checkAndInitialize, 200);
      } else {
        this.toastr.error('Failed to initialize map: map container not found');
      }
    };

    setTimeout(checkAndInitialize, 100);
  }

  private setupViewMap1(): void {
    try {
      const mapElement = document.getElementById('viewMap');
      if (!mapElement) {
        this.toastr.error(this.translate.instant('Common.MAP_CONTAINER_NOT_FOUND'));
        this.mapLoadError = true;
        return;
      }

      if (mapElement.offsetWidth === 0 || mapElement.offsetHeight === 0) {
        this.toastr.error(this.translate.instant('Common.MAP_CONTAINER_NO_DIMENSIONS'));
        this.mapLoadError = true;
        return;
      }

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      if (!this.loadformData.fastingTentService?.locationPhotoPath) {
        this.toastr.error(this.translate.instant('Common.NO_LOCATION_COORDINATES'));
        this.mapLoadError = true;
        return;
      }
      let coordinates: string[] = [];
      const coordString = this.loadformData?.fastingTentService?.locationPhotoPath ?? '';
      try {
        const jsonCoords = JSON.parse(coordString);
        if (jsonCoords && typeof jsonCoords === 'object') {
          if (jsonCoords.lat !== undefined && jsonCoords.lng !== undefined) {
            coordinates = [jsonCoords.lat.toString(), jsonCoords.lng.toString()];
          } else if (jsonCoords.latitude !== undefined && jsonCoords.longitude !== undefined) {
            coordinates = [jsonCoords.latitude.toString(), jsonCoords.longitude.toString()];
          } else if (jsonCoords.x !== undefined && jsonCoords.y !== undefined) {
            coordinates = [jsonCoords.x.toString(), jsonCoords.y.toString()];
          }
        }
      } catch (jsonError) {
      }

      if (coordinates.length === 0) {
        if (coordString.includes(',')) {
          coordinates = coordString.split(',');
        } else if (coordString.includes(';')) {
          coordinates = coordString.split(';');
        } else if (coordString.includes(' ')) {
          coordinates = coordString.split(' ');
        } else if (coordString.includes('/')) {
          coordinates = coordString.split('/');
        } else if (coordString.includes('|')) {
          coordinates = coordString.split('|');
        } else if (coordString.includes('\t')) {
          coordinates = coordString.split('\t');
        } else {
          this.toastr.error(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_SEPARATOR', { 0: coordString }));
          this.mapLoadError = true;
          return;
        }
      }

      if (coordinates.length !== 2) {
        this.toastr.error(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_COUNT', { 0: coordinates.length }));
        this.mapLoadError = true;
        return;
      }

      const lat = parseFloat(coordinates[0].trim());
      const lng = parseFloat(coordinates[1].trim());

      if (isNaN(lat) || isNaN(lng)) {

        this.toastr.error(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_NUMBERS'));
        this.mapLoadError = true;
        return;
      }
      if (lat === 0 && lng === 0) {

        this.toastr.warning(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_ZERO'));
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {

        this.toastr.error(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_RANGE'));
        this.mapLoadError = true;
        return;
      }
      if (lat < 22 || lat > 27 || lng < 51 || lng > 57) {

        this.toastr.warning(this.translate.instant('mainApplyServiceResourceName.INVALID_COORDINATES_UAE'));
      }

      try {
        this.map = L.map('viewMap').setView([lat, lng], 15);
      } catch (mapError) {
        this.toastr.error(this.translate.instant('mainApplyServiceResourceName.MAP_CREATION_FAILED'));
        this.mapLoadError = true;
        return;
      }
      try {
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 5,
          crossOrigin: true,
        });
        tileLayer.on('tileerror', (error) => {
          this.addFallbackTileLayer();
        });

        tileLayer.addTo(this.map);
      } catch (tileError) {
        this.toastr.error(this.translate.instant('mainApplyServiceResourceName.MAP_TILES_FAILED'));
        this.mapLoadError = true;
        return;
      }
      try {
        const marker = L.marker([lat, lng], { icon: this.customIcon })
          .addTo(this.map)
          .bindPopup(this.loadformData.fastingTentService.address || this.translate.instant('mainApplyServiceResourceName.SELECTED_LOCATION'))
          .openPopup();

        this.markers = [marker];
      } catch (markerError) {
        this.toastr.error(this.translate.instant('Common.FAILED_ADD_MARKER'));
        this.mapLoadError = true;
        return;
      }
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          const tileLayersLoaded = this.checkTileLayersLoaded();
          if (!tileLayersLoaded) {
            this.addFallbackTileLayer();
          }
        }
      }, 1000);

      this.mapLoadError = false;

    } catch (error) {
      this.toastr.error(this.translate.instant('Common.FAILED_INITIALIZE_MAP'));
      this.mapLoadError = true;
    }
  }

  private addFallbackTileLayer(): void {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        this.map.removeLayer(layer);
      }
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors (fallback)',
      maxZoom: 19,
      minZoom: 5,
    }).addTo(this.map);

    this.toastr.info(this.translate.instant('Common.USING_FALLBACK_TILES'));
  }

  private checkTileLayersLoaded(): boolean {
    try {
      const mapContainer = document.getElementById('viewMap');
      if (!mapContainer) return false;

      const leafletTiles = mapContainer.querySelectorAll('.leaflet-tile');
      const loadedTiles = mapContainer.querySelectorAll('.leaflet-tile-loaded');


      return leafletTiles.length > 0 && (loadedTiles.length / leafletTiles.length) >= 0.5;
    } catch (error) {
      return false;
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

 

  private cleanupMap(): void {
    if (this.map) {
      this.markers.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      this.markers = [];

      this.map.remove();
      this.map = null;
    }
    this.mapLoadError = false;
  }

  //For ServiceId = "2"
  channelName(ch: DonationCollectionChannelDto): string {
    const isAr = (this.translate.currentLang || '').toLowerCase().startsWith('ar');
    return (isAr ? (ch.nameAr || ch.nameEn) : (ch.nameEn || ch.nameAr)) || '-';
  }

  viewPartnerAttachments(partner: PartnerDto) {
    if (partner.attachments?.length) {
      this.selectedPartner = partner;
      this.selectedPartnerAttachments = partner.attachments;
      this.showPartnerAttachmentModal = true;
    } else {
      this.fetchPartnerAttachments(partner);
    }
  }


  fetchPartnerAttachments(partner: PartnerDto) {
    if (!partner?.id) {
      this.toastr.warning(this.translate.instant('COMMON.INVALID_PARTNER_ID'));
      return;
    }
    this.selectedPartner = partner;
    this.isLoadingPartnerAttachments = true;
    this.selectedPartnerAttachments = [];
    this.showPartnerAttachmentModal = true;

    const parameters = { skip: 0, take: 100, masterIds: [partner.id], masterType: 1004 };
    const sub = this.attachmentService.getList(parameters).subscribe({
      next: (res: any) => {
        const items = res.data || res.items || [];
        this.selectedPartnerAttachments = items.map((x: any) => ({
          id: x.id,
          masterId: x.masterId,
          imgPath: x.imgPath,
          masterType: x.masterType,
          attachmentTitle: x.attachmentTitle,
          lastModified: x.lastModified,
          attConfigID: x.attConfigID
        }));
        this.isLoadingPartnerAttachments = false;
        if (this.selectedPartnerAttachments.length === 0) {
          this.toastr.info(this.translate.instant('COMMON.NO_ATTACHMENTS_FOUND'));
        }
      },
      error: () => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_LOADING_ATTACHMENTS'));
        this.isLoadingPartnerAttachments = false;
      }
    });
    this.subscriptions.push(sub);
  }

  closePartnerAttachmentModal() {
    this.showPartnerAttachmentModal = false;
    this.selectedPartner = null;
    this.selectedPartnerAttachments = [];
    this.isLoadingPartnerAttachments = false;
  }

  onTableCellClick(event: any, id: any) {
    if (id) this.fetchAndViewCommentAttachments(id);
  }
  onCommentsTableAction(_: { action: string; row: any }) { /* hook جاهز */ }

  fetchAndViewCommentAttachments(commentId: number) {
    this.isLoadingAttachments = true;
    this.selectedCommentAttachments = [];
    this.showAttachmentModal = true;

    const parameters = { skip: 0, take: 100, masterIds: [commentId], masterType: 1003 };
    const sub = this.attachmentService.getList(parameters).subscribe({
      next: (res: any) => {
        this.selectedCommentAttachments = res.data || res.items || [];
        this.isLoadingAttachments = false;
        if (this.selectedCommentAttachments.length === 0) {
          this.toastr.info(this.translate.instant('COMMON.NO_ATTACHMENTS_FOUND'));
        }
      },
      error: () => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_LOADING_ATTACHMENTS'));
        this.isLoadingAttachments = false;
      }
    });
    this.subscriptions.push(sub);
  }
  closeAttachmentModal() {
    this.showAttachmentModal = false;
    this.selectedCommentAttachments = [];
    this.isLoadingAttachments = false;
  }
}
