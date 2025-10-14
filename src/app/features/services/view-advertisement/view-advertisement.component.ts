import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, forkJoin, Observable, Subscription, tap, throwError } from 'rxjs';
import { ColDef } from 'ag-grid-community';
import { MainApplyService } from '../../../core/services/mainApplyService/mainApplyService.service';
import { WorkFlowCommentsService } from '../../../core/services/mainApplyService/workFlowComments.service';
import { AttachmentService } from '../../../core/services/attachments/attachment.service';
import { UpdateStatusDto, mainApplyServiceDto, WorkFlowStepDto, WorkFlowCommentDto } from '../../../core/dtos/mainApplyService/mainApplyService.dto';
import { AttachmentsConfigDto } from '../../../core/dtos/attachments/attachments-config.dto';
import { AttachmentBase64Dto, CreateWorkFlowCommentDto, WorkflowCommentsType } from '../../../core/dtos/service/workFlowComments/workFlowComments.dto';
import { AttachmentsConfigType } from '../../../core/dtos/attachments/attachments-config.dto';
import { RequestPlaintAttachmentDto } from '../../../core/dtos/service/RequestPlaint/request-plaint.dto';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdvertisementsService } from '../../../core/services/mainApplyService/advertisement.service';
import { environment } from '../../../../environments/environment';
import { arrayMinLength, dateRangeValidator } from '../../../shared/customValidators';
import { SpinnerService } from '../../../core/services/spinner.service';

declare var bootstrap: any;

// Service Status Enum (matching backend enum)
export enum ServiceStatus {
  Accept = 1,
  Reject = 2,
  RejectForReason = 3,
  Wait = 4,
  Received = 5,
  ReturnForModifications = 7
}

type AttachmentState = {
  configs: AttachmentsConfigDto[];
  items: RequestPlaintAttachmentDto[];
  selected: Record<number, File>;
  previews: Record<number, string>;
  sub?: Subscription;
};

type AttachmentDto = {
  id?: number;
  masterId?: number;
  imgPath: string;
  masterType?: number;
  attachmentTitle?: string;
  lastModified?: string | Date;
  attConfigID?: number;
};

type WorkFlowCommentDtos = {
  paymentId?: string | null;
  id?: number | null;
  empId?: string | null;
  empName?: string | null;
  employeeDepartmentName?: string | null;
  workFlowStepsId?: number | null;
  comment?: string | null;
  lastModified?: Date | null;
  lastModifiedstr?: string | null;
  commentTypeId?: number | null;
  commentTypeName?: string | null;
}

type RequestAdvertisementDto = {
  id?: number;
  mainApplyServiceId?: number;
  requestNo?: number;
  requestDate?: string | Date;
  provider?: string | null;
  adTitle?: string | null;
  adLang?: string | null;
  startDate?: string | Date;
  endDate?: string | Date;
  mobile?: string | null;
  supervisorName?: string | null;
  fax?: string | null;
  eMail?: string | null;
  targetedAmount?: number | null;
  newAd?: boolean | null;
  reNewAd?: boolean | null;
  oldPermNumber?: string | null;
  parentId?: number;
  requestEventPermitId?: number;
  charityEventPermitId?: number | null;
  advertisementStatus?: number;
  advertisementStatusName?: string | null;
  attachments?: AttachmentDto[];
  mainApplyService?: any;
  parentMainApplyService?: any;
  requestAdvertisementTargets?: RequestAdvertisementTargetDto[];
  requestAdvertisementAdLocations?: RequestAdvertisementAdLocationDto[];
  requestAdvertisementAdMethods?: RequestAdvertisementAdMethodDto[];
};

type RequestAdvertisementTargetDto = {
  id?: number;
  mainApplyServiceId?: number;
  lkpTargetTypeId?: number;
  lkpTargetTypeText?: string;
  othertxt?: string | null;
};

type RequestAdvertisementAdLocationDto = {
  id?: number;
  mainApplyServiceId?: number;
  lkpAdLocationId?: number;
  lkpAdLocationText?: string;
  othertxt?: string | null;
};

type RequestAdvertisementAdMethodDto = {
  id?: number;
  mainApplyServiceId?: number;
  lkpAdMethodId?: number;
  lkpAdMethodText?: string;
  othertxt?: string | null;
};

@Component({
  selector: 'app-view-advertisement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterLink,
    NgSelectModule
  ],
  templateUrl: './view-advertisement.component.html',
  styleUrls: ['./view-advertisement.component.scss']
})
export class ViewAdvertisementComponent implements OnInit, OnDestroy {
  // Data properties
  mainApplyService: mainApplyServiceDto | null = null;
  requestAdvertisement?: RequestAdvertisementDto;
  targets: any[] = [];
  methods: any[] = [];
  locations: any[] = [];
  workFlowSteps: WorkFlowStepDto[] = [];
  attachments: any[] = []; // Keep as any[] for main service attachments for 
  workFlowComments: WorkFlowCommentDto[] = [];
  
  // Generic table properties for workflow comments
  allWorkFlowComments: any[] = [];
  commentsColumnDefs: ColDef[] = [];
  commentsColumnHeaderMap: { [key: string]: string } = {};
  
  // Modal properties (using Bootstrap modals now)
  selectedCommentAttachments: AttachmentDto[] = [];
  isLoadingAttachments: boolean = false;


  // Loading states
  isLoading = false;
  isLoadingComments = false;
  isSavingComment = false;

  // Error handling states
  hasError = false;
  errorMessage = '';
  errorDetails = '';

  targetWorkFlowStep: WorkFlowStepDto | null = null;
  screenMode: 'edit' | 'view' = 'view';
  isEditMode: boolean = false;
  serviceDepartmentActions: number[] = [];
  
  commentForm!: FormGroup;
  
  // Comment attachment properties
  commentAttachmentConfigs: AttachmentsConfigDto[] = [];
  commentAttachments: { [key: number]: { fileBase64: string; fileName: string; attConfigID: number } } = {};
  commentSelectedFiles: { [key: number]: File } = {};
  commentFilePreviews: { [key: number]: string } = {};
  isCommentDragOver = false;
  commentValidationSubmitted = false;
  
  // Column definitions for data tables (kept for potential future use)
  workFlowCommentsColumns: ColDef[] = [];
  attachmentsColumns: ColDef[] = [];
  targetsColumns: ColDef[] = [];
  methodsColumns: ColDef[] = [];
  locationsColumns: ColDef[] = [];
  workFlowQuery: any;
  originalworkFlowId: number | null | undefined;
  originalNotes: string | null = null;
  userForm: FormGroup;
  submitted = false;
  rejectResonsForm: FormGroup;
  returnModificationForm: FormGroup;

  private subscriptions: Subscription[] = [];
  allApproved: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mainApplyServiceService: MainApplyService,
    private workFlowCommentsService: WorkFlowCommentsService,
    private attachmentService: AttachmentService,
    private advertisementService: AdvertisementsService,
    private authService: AuthService,
    private translationService: TranslationService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private spinnerService: SpinnerService
  ) {
    this.initializeCommentForm();
    this.userForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(1)]],
      commentTypeId: [null, Validators.required],
    });
    this.rejectResonsForm = this.fb.group({
      reasonTxt: [[], Validators.required]
    });
    this.returnModificationForm = this.fb.group({
      returnModificationreasonTxt: [[], Validators.required]
    });
  }

  private initializeCommentForm(): void {
    this.commentForm = this.fb.group({
      comment: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadMainApplyServiceData();
    this.loadCommentAttachmentConfigs();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  private initializeColumns(): void {
    this.workFlowCommentsColumns = [
      {
        headerName: '#',
        valueGetter: (params) => (params?.node?.rowIndex ?? 0) + 1,
        width: 60
      },
      {
        headerName: this.translate.instant('COMMON.EMPLOYEE'),
        field: 'empName',
        width: 150
      },
      {
        headerName: this.translate.instant('COMMON.DEPARTMENT'),
        field: 'employeeDepartmentName',
        width: 150
      },
      {
        headerName: this.translate.instant('COMMON.COMMENT'),
        field: 'comment',
        width: 300
      },
      {
        headerName: this.translate.instant('COMMON.DATE'),
        field: 'lastModifiedstr',
        width: 150
      }
    ];
    
    this.attachmentsColumns = [
      {
        headerName: '#',
        valueGetter: (params) => (params?.node?.rowIndex ?? 0) + 1,
        width: 60
      },
      {
        headerName: this.translate.instant('COMMON.TITLE'),
        field: 'attachmentTitle',
        width: 200
      },
      {
        headerName: this.translate.instant('COMMON.ACTIONS'),
        cellRenderer: (params: any) => {
          return `<button class="btn btn-sm btn-outline-primary" onclick="window.open('${params.data.imgPath}', '_blank')">
                    <i class="fas fa-eye"></i> ${this.translate.instant('COMMON.VIEW')}
                  </button>`;
        },
        width: 120
      }
    ];
    
    this.targetsColumns = [
      {
        headerName: '#',
        valueGetter: (params) => (params?.node?.rowIndex ?? 0) + 1,
        width: 60
      },
      {
        headerName: this.translate.instant('ADVERTISEMENT.TARGET_TYPE'),
        field: 'lkpTargetTypeText',
        width: 200
      },
      {
        headerName: this.translate.instant('COMMON.OTHER'),
        field: 'othertxt',
        width: 200
      }
    ];
    
    this.methodsColumns = [
      {
        headerName: '#',
        valueGetter: (params) => (params?.node?.rowIndex ?? 0) + 1,
        width: 60
      },
      {
        headerName: this.translate.instant('ADVERTISEMENT.METHOD'),
        field: 'lkpAdMethodText',
        width: 200
      },
      {
        headerName: this.translate.instant('COMMON.OTHER'),
        field: 'othertxt',
        width: 200
      }
    ];
    
    this.locationsColumns = [
      {
        headerName: '#',
        valueGetter: (params) => (params?.node?.rowIndex ?? 0) + 1,
        width: 60
      },
      {
        headerName: this.translate.instant('ADVERTISEMENT.LOCATION'),
        field: 'lkpAdLocationText',
        width: 200
      },
      {
        headerName: this.translate.instant('COMMON.OTHER'),
        field: 'othertxt',
        width: 200
      }
    ];
  }
  
  private loadMainApplyServiceData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const mode = sessionStorage.getItem('screenmode');
    this.screenMode = mode === 'edit' ? 'edit' : 'view';
    this.isEditMode = this.screenMode === 'edit';
    if (!id) {
      this.hasError = true;
      this.errorMessage = this.translate.instant('COMMON.INVALID_ID');
      this.errorDetails = this.translate.instant('COMMON.NO_VALID_ID_URL');
      return;
    }
    
    this.isLoading = true;
    const subscription = this.mainApplyServiceService.getDetailById({ id }).subscribe({
      next: (response) => {
        this.mainApplyService = response;
        // For advertisement service, the data comes from the main service object itself
        this.requestAdvertisement = this.processAdvertisementData(response);
        this.workFlowSteps = response.workFlowSteps || [];
        this.attachments = response.attachments || [];
        let storeddepartmentId = localStorage.getItem('departmentId') ?? '';

        const storedDeptIds = storeddepartmentId
          .replace(/"/g, '')
          .split(',')
          .map(x => x.trim())
          .filter(x => x !== '');

        storeddepartmentId = storeddepartmentId.replace(/"/g, '').trim();
        //this.workFlowSteps = this.workFlowSteps.map((step: any) => ({
        //  ...step,
        //  isMatched: step?.deptId?.toString() === storeddepartmentId.toString()
        //}));

        this.workFlowSteps = this.workFlowSteps.map((step: any) => ({
          ...step,
          isMatched: storedDeptIds.includes(String(step?.deptId).trim())
        }));

        //const matchedSteps = this.workFlowSteps.filter(
        //  (step: any) => String(step?.deptId).trim() === storeddepartmentId
        //);
        //const matchedIndices = this.workFlowSteps
        //  .map((s, i) => (String(s?.deptId).trim() === storeddepartmentId ? i : -1))
        //  .filter(i => i !== -1);

        const matchedSteps = this.workFlowSteps.filter(
          (step: any) => storedDeptIds.includes(String(step?.deptId).trim())
        );

        const matchedIndices = this.workFlowSteps
          .map((s, i) => (storedDeptIds.includes(String(s?.deptId).trim()) ? i : -1))
          .filter(i => i !== -1);

        let selectedStep: any = null;

        for (let idx of matchedIndices) {
          if (idx > 0) {
            const prevStep = this.workFlowSteps[idx - 1];
            if (
              String(prevStep?.deptId).trim() !== storeddepartmentId &&
              prevStep?.serviceStatus !== 1
            ) {
              selectedStep = null;
              break;
            }
          }
          if (this.workFlowSteps[idx].serviceStatus !== 1) {
            selectedStep = this.workFlowSteps[idx];
            break;
          }
        }

        for (let idx of matchedIndices) {
          if (idx > 0) {
            const prevStep = this.workFlowSteps[idx - 1];
            if (
              !storedDeptIds.includes(String(prevStep?.deptId).trim()) &&
              prevStep?.serviceStatus !== 1
            ) {
              selectedStep = null;
              break;
            }
          }
          if (this.workFlowSteps[idx].serviceStatus !== 1) {
            selectedStep = this.workFlowSteps[idx];
            break;
          }
        }

        this.workFlowQuery = selectedStep ? [selectedStep] : [];

        this.serviceDepartmentActions = (this.workFlowQuery ?? [])
          .map((s: any) => s.serviceDepartmentActions)
          .filter((x: any): x is number => typeof x === 'number');

        this.originalworkFlowId = this.workFlowQuery?.[0]?.id ?? null;

        this.allApproved = this.workFlowSteps.length > 0 &&
          this.workFlowSteps.every(step => step.serviceStatus === 1);

        // Extract targets, methods, and locations from the nested structure
        if ((response as any).requestAdvertisement) {
          this.targets = (response as any).requestAdvertisement.requestAdvertisementTargets || [];
          this.methods = (response as any).requestAdvertisement.requestAdvertisementAdMethods || [];
          this.locations = (response as any).requestAdvertisement.requestAdvertisementAdLocations || [];
        }

        this.findTargetWorkFlowStep();
        if (this.targetWorkFlowStep) {
          this.loadWorkFlowComments();
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.hasError = true;
        this.errorMessage = this.getErrorMessage(error);
        
        // Provide more detailed error information and guidance
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
    this.subscriptions.push(subscription);
  }

  get hasActionButtons(): boolean {
    return this.serviceDepartmentActions?.some(x => [1, 2, 3].includes(x)) ?? false;
  }

  private processAdvertisementData(response: any): RequestAdvertisementDto {
    // The advertisement data is nested under requestAdvertisement property
    const adData = response.requestAdvertisement || {};
    
    return {
      id: adData.id ? parseInt(adData.id) : undefined,
      mainApplyServiceId: response.id ? parseInt(response.id) : undefined,
      requestNo: adData.requestNo ? parseInt(adData.requestNo) : undefined,
      requestDate: adData.requestDate || undefined,
      provider: adData.provider,
      adTitle: adData.adTitle,
      adLang: adData.adLang,
      startDate: adData.startDate,
      endDate: adData.endDate,
      mobile: adData.mobile,
      supervisorName: adData.supervisorName,
      fax: adData.fax,
      eMail: adData.eMail,
      targetedAmount: adData.targetedAmount,
      newAd: adData.newAd,
      reNewAd: adData.reNewAd,
      oldPermNumber: adData.oldPermNumber,
      advertisementStatus: adData.advertisementStatus,
      advertisementStatusName: adData.advertisementStatusName,
      requestAdvertisementTargets: (adData.requestAdvertisementTargets || []) as any,
      requestAdvertisementAdLocations: (adData.requestAdvertisementAdLocations || []) as any,
      requestAdvertisementAdMethods: (adData.requestAdvertisementAdMethods || []) as any,
      parentMainApplyService: adData.parentMainApplyService || null
    };
  }

  // Retry loading data when there's an error
  retryLoadingData(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.errorDetails = '';
    this.loadMainApplyServiceData();
  }

  // Refresh the entire page as a last resort
  refreshPage(): void {
    window.location.reload();
  }

  // Contact support for persistent errors
  contactSupport(): void {
    // Navigate to contact us page or open support modal
    this.router.navigate(['/contact-us']);
  }

  // Check if the service is available (alternative to retry)
  checkServiceAvailability(): void {
    // This could be used to ping the service or check status
    // For now, we'll just show a message and then retry
    this.toastr.info('Checking service availability...');
    setTimeout(() => {
      this.retryLoadingData();
    }, 1000);
  }

  // Copy error details to clipboard for support
  copyErrorDetails(): void {
    const errorInfo = `Error: ${this.errorMessage}\nDetails: ${this.errorDetails}\nURL: ${window.location.href}\nTime: ${new Date().toISOString()}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(errorInfo).then(() => {
        this.toastr.success(this.translate.instant('COMMON.ERROR_DETAILS_COPIED'));
      }).catch(() => {
        this.toastr.error(this.translate.instant('COMMON.FAILED_COPY_ERROR'));
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = errorInfo;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.toastr.success(this.translate.instant('COMMON.ERROR_DETAILS_COPIED'));
      } catch (err) {
        this.toastr.error(this.translate.instant('COMMON.FAILED_COPY_ERROR'));
      }
      document.body.removeChild(textArea);
    }
  }

  // Get additional error context and suggestions
  getErrorContext(): string {
    if (this.isAuthenticationError({ status: 401 })) {
      return this.translate.instant('COMMON.LOGIN_AGAIN_SESSION_EXPIRED');
    } else if (this.isErrorRecoverable({ status: 500 })) {
      return this.translate.instant('COMMON.TEMPORARY_ISSUE_TRY_AGAIN');
    } else if (this.isErrorRecoverable({ status: 0 })) {
      return this.translate.instant('COMMON.CHECK_INTERNET_CONNECTION');
    } else {
      return this.translate.instant('COMMON.CONTACT_SUPPORT_IF_PERSISTS');
    }
  }

  // Helper method to determine error type and provide appropriate message
  private getErrorMessage(error: any): string {
    if (error?.status === 0 || error?.status === 500) {
      return this.translate.instant('COMMON.NETWORK_ERROR');
    } else if (error?.status === 404) {
      return this.translate.instant('COMMON.DATA_NOT_FOUND');
    } else if (error?.status === 401 || error?.status === 403) {
      return this.translate.instant('COMMON.UNAUTHORIZED_ACCESS');
    } else {
      return this.translate.instant('COMMON.ERROR_LOADING_DATA');
    }
  }

  // Check if error is recoverable (can be retried)
  private isErrorRecoverable(error: any): boolean {
    // Network errors and server errors are usually recoverable
    return error?.status === 0 || error?.status >= 500;
  }

  // Check if error requires authentication
  private isAuthenticationError(error: any): boolean {
    return error?.status === 401 || error?.status === 403;
  }

  // Get specific error guidance based on error type
  private getErrorGuidance(error: any): string {
    if (this.isAuthenticationError(error)) {
      return this.translate.instant('COMMON.LOGIN_AGAIN_ACCESS_SERVICE');
    } else if (error?.status === 404) {
      return this.translate.instant('COMMON.PERMIT_NOT_FOUND_VERIFY_ID');
    } else if (error?.status === 0) {
      return this.translate.instant('COMMON.UNABLE_CONNECT_SERVER');
    } else if (error?.status >= 500) {
      return this.translate.instant('COMMON.SERVER_ISSUES_TRY_LATER');
    } else {
      return this.translate.instant('COMMON.UNEXPECTED_ERROR_TRY_AGAIN');
    }
  }
  
  private findTargetWorkFlowStep(): void {
    if (this.workFlowSteps && this.workFlowSteps.length > 0) {
      // Sort by stepOrder ascending and find first with serviceStatus = 4
      const sortedSteps = this.workFlowSteps
        .filter(step => step.stepOrder !== null)
        .sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));
      
      this.targetWorkFlowStep = sortedSteps.find(step => step.serviceStatus === 4) || null;
    }
  }
  
  private loadWorkFlowComments(): void {
    // Collect all comments from all workflow steps
    this.allWorkFlowComments = [];
    
    if (this.workFlowSteps && Array.isArray(this.workFlowSteps)) {
      this.workFlowSteps.forEach(step => {
        if (step.workFlowComments && Array.isArray(step.workFlowComments)) {
          step.workFlowComments.forEach(comment => {
            this.allWorkFlowComments.push({
              ...comment,
              stepDepartmentName: step.departmentName, // Include step department info
              stepServiceStatus: step.serviceStatusName
            });
          });
        }
      });
    }
    
    // Sort comments by lastModified date (newest first)
    this.allWorkFlowComments.sort((a, b) => {
      const dateA = new Date(a.lastModified || 0);
      const dateB = new Date(b.lastModified || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Legacy: Use comments from targetWorkFlowStep for add comment functionality
    if (this.targetWorkFlowStep && Array.isArray(this.targetWorkFlowStep.workFlowComments)) {
      this.workFlowComments = this.targetWorkFlowStep.workFlowComments;
    } else {
      this.workFlowComments = [];
    }
    
    this.initializeCommentsTable(); // Initialize table after data is loaded
    this.isLoadingComments = false;
  }

  // Comment attachment configuration loading
  loadCommentAttachmentConfigs(): void {
    const sub = this.attachmentService.getAttachmentsConfigByServiceType(
      AttachmentsConfigType.Comment,
      true,
      null
    ).subscribe({
      next: (configs) => {
        this.commentAttachmentConfigs = configs || [];
        this.initializeCommentAttachments();
      },
      error: (error) => {
        // Handle error silently
      }
    });
    this.subscriptions.push(sub);
  }

  initializeCommentAttachments(): void {
    this.commentAttachments = {};
    this.commentSelectedFiles = {};
    this.commentFilePreviews = {};
    
    this.commentAttachmentConfigs.forEach(config => {
      if (config.id) {
        this.commentAttachments[config.id] = {
          fileBase64: '',
          fileName: '',
          attConfigID: config.id
        };
      }
    });
  }

  private initializeCommentsTable(): void {
    this.commentsColumnDefs = [
      {
        headerName: this.translate.instant('COMMON.COMMENT'),
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
        headerName: this.translate.instant('COMMON.DEPARTMENT'),
        field: 'stepDepartmentName',
        flex: 1.2,
        minWidth: 150
      },
      {
        headerName: this.translate.instant('COMMON.STATUS'),
        field: 'stepServiceStatus',
        flex: 1,
        minWidth: 120
      },
      {
        headerName: this.translate.instant('COMMON.FILES'),
        field: 'id',
        flex: 0.8,
        minWidth: 100,
        cellRenderer: (params: any) => {
          const commentId = params.value;
          
          if (commentId) {
            return `<button class="btn btn-next-style attachment-btn" data-comment-id="${commentId}" data-row-index="${params.node.rowIndex}">
                      <i class="fas fa-eye me-1"></i>
                      <span>${this.translate.instant('COMMON.VIEW')}</span>
                    </button>`;
          }
          return '-';
        },
        cellClass: 'text-center'
      }
    ];
    
    this.commentsColumnHeaderMap = {
      'comment': this.translate.instant('COMMON.COMMENT'),
      'stepDepartmentName': this.translate.instant('COMMON.DEPARTMENT'),
      'stepServiceStatus': this.translate.instant('COMMON.STATUS'),
      'attachments': this.translate.instant('COMMON.FILES')
    };
  }
  
  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }
  
  formatDateTime(date: string | Date | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }

  // Helper method to get localized status based on current language
  getLocalizedStatus(arabicStatus: string | null, englishStatus: string | null): string {
    const currentLang = this.translate.currentLang || this.translate.defaultLang;
    if (currentLang === 'ar' && arabicStatus) {
      return arabicStatus;
    } else if (currentLang === 'en' && englishStatus) {
      return englishStatus;
    }
    // Fallback to available status
    return arabicStatus || englishStatus || '-';
  }

  // Helper method to get localized service name based on current language
  getLocalizedServiceName(arabicName: string | null, englishName: string | null): string {
    const currentLang = this.translate.currentLang || this.translate.defaultLang;
    if (currentLang === 'ar' && arabicName) {
      return arabicName;
    } else if (currentLang === 'en' && englishName) {
      return englishName;
    }
    // Fallback to available name
    return arabicName || englishName || '-';
  }

  // Workflow Steps Helper Methods
  getStatusColor(statusId: number | null): string {
    if (statusId === null) return '#6c757d';
    
    switch (statusId) {
      case ServiceStatus.Accept:
        return '#28a745'; // Green
      case ServiceStatus.Reject:
        return '#dc3545'; // Red
      case ServiceStatus.RejectForReason:
        return '#fd7e14'; // Orange
      case ServiceStatus.Wait:
        return '#ffc107'; // Yellow/Amber
      case ServiceStatus.Received:
        return '#17a2b8'; // Cyan/Teal
      case ServiceStatus.ReturnForModifications:
        return '#6f42c1'; // Purple
      default:
        return '#6c757d'; // Gray
    }
  }

  getStatusIcon(statusId: number | null): string {
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

  getStatusLabel(statusId: number | null): string {
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

  isStepCompleted(statusId: number | null): boolean {
    if (statusId === null) return false;
    return statusId === ServiceStatus.Accept || statusId === ServiceStatus.Received;
  }

  isStepRejected(statusId: number | null): boolean {
    if (statusId === null) return false;
    return statusId === ServiceStatus.Reject || statusId === ServiceStatus.RejectForReason;
  }

  isStepPending(statusId: number | null): boolean {
    if (statusId === null) return false;
    return statusId === ServiceStatus.Wait;
  }

  // TrackBy function for workflow steps
  trackByStepId(index: number, step: WorkFlowStepDto): number {
    return step.id || index;
  }
  
  acceptbtn(): void {
    this.updateStatus("1", '');
  }

  rejectbtn(): void {
    this.updateStatus("2", '');
  }

  custombtn(): void {
    this.updateStatus("5", '');
  }

  rejectWithReasonbtn(): void {
    const modalElement = document.getElementById('myModalReject');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    };
  }

  returnForModificationsbtn(): void {
    const modalElement = document.getElementById('myModalReturnModification');
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

        this.updateStatus("2", formData.reasonTxt);
        this.spinnerService.hide();
      },
      error: () => {
        this.toastr.error(this.translate.instant('TOAST.SAVE_FAILED'));
      }
    });
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
      comment: "ملاحظات    : " + this.originalNotes,
      commentTypeId: 2,
    };

    this.spinnerService.show();

    return this.mainApplyServiceService.saveComment(params).pipe(
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

    return this.mainApplyServiceService.saveComment(params).pipe(
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


  updateStatus(status: string, reason: string): void {
    this.spinnerService.show();

    const param: UpdateStatusDto = {
      mainApplyServiceId: Number(this.mainApplyService?.id),
      workFlowId: this.targetWorkFlowStep?.id,
      serviceStatus: Number(status),
      userId: localStorage.getItem('userId'),
      reason: reason,
      notesForApproving: this.originalNotes,
      tentConstructDate: null,
      startDate: null,
      endDate: null
    };

    this.mainApplyServiceService.update(param).subscribe({
      next: (res: any) => {
        if (res == "UpdateServiceStatusSuccess") {
          let msg = '';
          switch (status) {
            case '1': msg = this.translate.instant('mainApplyServiceResourceName.agree'); break;
            case '2': msg = this.translate.instant('mainApplyServiceResourceName.disagree'); break;
            case '3': msg = this.translate.instant('mainApplyServiceResourceName.disagreereas'); break;
            case '7': msg = this.translate.instant('mainApplyServiceResourceName.ReturnForModifications'); break;
            case '4': msg = this.translate.instant('mainApplyServiceResourceName.can'); break;
            case '5': msg = this.translate.instant('mainApplyServiceResourceName.res'); break;
            default: msg = this.translate.instant('mainApplyServiceResourceName.uploadsuccess');
          }

          this.toastr.success(msg);
          this.loadMainApplyServiceData();
        } else {
          this.toastr.warning(this.translate.instant('Common.ERROR'));
        }
        this.spinnerService.hide();
      },
      error: (err) => {
        this.toastr.error(this.translate.instant('Common.ERROR_SAVING_DATA'));
        this.spinnerService.hide();
      }
    });
  }
  
  // Comment management methods
  addWorkFlowComment(): void {
    if (!this.commentForm.get('comment')?.value?.trim() || !this.targetWorkFlowStep?.id) {
      this.toastr.warning(this.translate.instant('COMMENTS.ENTER_COMMENT'));
      return;
    }

    // Set validation flag to show validation errors
    this.commentValidationSubmitted = true;

    // Check if required attachments are uploaded
    const requiredAttachments = this.commentAttachmentConfigs.filter(config => config.mendatory);
    const missingRequiredAttachments = requiredAttachments.filter(config => 
      !this.commentSelectedFiles[config.id!] && !this.commentFilePreviews[config.id!]
    );

    if (missingRequiredAttachments.length > 0) {
      this.toastr.warning(this.translate.instant('VALIDATION.PLEASE_UPLOAD_REQUIRED_ATTACHMENTS'));
      return;
    }

    this.isSavingComment = true;
    
    // Prepare attachments for the comment
    const attachments: AttachmentBase64Dto[] = [];
    
    // Process attachments from attachment configs
    Object.values(this.commentAttachments).forEach(attachment => {
      if (attachment.fileBase64 && attachment.fileName) {
        attachments.push({
          fileName: attachment.fileName,
          fileBase64: attachment.fileBase64,
          attConfigID: attachment.attConfigID
        });
      }
    });
    
    const createDto: CreateWorkFlowCommentDto = {
      empId: null,
      workFlowStepsId: this.targetWorkFlowStep.id,
      comment: this.commentForm.get('comment')?.value?.trim(),
      lastModified: new Date(),
      commentTypeId: WorkflowCommentsType.External,
      attachments: attachments
    };

    const subscription = this.workFlowCommentsService.create(createDto).subscribe({
      next: (response) => {
        this.toastr.success(this.translate.instant('COMMENTS.COMMENT_ADDED'));
        this.commentForm.reset();
        // Clear comment attachments
        this.clearCommentAttachments();
        this.closeCommentModal(); // Close the modal
        // Reload main data to get updated comments
        this.loadMainApplyServiceData();
        this.isSavingComment = false;
      },
      error: (error) => {
        this.toastr.error(this.translate.instant('COMMENTS.ERROR_ADDING_COMMENT'));
        this.isSavingComment = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  clearCommentAttachments(): void {
    this.commentSelectedFiles = {};
    this.commentFilePreviews = {};
    this.commentAttachments = {};
    this.commentValidationSubmitted = false;
    // Reinitialize comment attachments structure
    this.initializeCommentAttachments();
  }

  getCommentAttachmentName(config: AttachmentsConfigDto): string {
    return config.nameEn || config.name || this.translate.instant('COMMON.ATTACHMENT');
  }

  isCommentAttachmentMandatory(configId: number): boolean {
    const config = this.commentAttachmentConfigs.find(c => c.id === configId);
    return config?.mendatory || false;
  }
  
  // File handling methods for comment attachments
  onCommentFileSelected(event: Event, configId: number): void {
    const target = event.target as HTMLInputElement;
    if (target?.files?.[0]) {
      this.handleCommentFileUpload(target.files[0], configId);
    }
  }

  onCommentDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isCommentDragOver = true;
  }

  onCommentDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isCommentDragOver = false;
  }

  onCommentDrop(event: DragEvent, configId: number): void {
    event.preventDefault();
    this.isCommentDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files?.[0]) {
      this.handleCommentFileUpload(files[0], configId);
    }
  }

  handleCommentFileUpload(file: File, configId: number): void {
    if (!this.validateCommentFile(file)) {
      return;
    }

    this.commentSelectedFiles[configId] = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.commentFilePreviews[configId] = e.target?.result as string;
      
      // Ensure the attachment object exists
      if (!this.commentAttachments[configId]) {
        this.commentAttachments[configId] = {
          fileBase64: '',
          fileName: '',
          attConfigID: configId
        };
      }
      
      const base64String = (e.target?.result as string).split(',')[1];
      this.commentAttachments[configId] = {
        ...this.commentAttachments[configId],
        fileBase64: base64String,
        fileName: file.name
      };
      
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  validateCommentFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (file.size > maxSize) {
      this.toastr.error(this.translate.instant('VALIDATION.FILE_TOO_LARGE'));
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error(this.translate.instant('VALIDATION.INVALID_FILE_TYPE'));
      return false;
    }
    
    return true;
  }

  removeCommentFile(configId: number): void {
    delete this.commentSelectedFiles[configId];
    delete this.commentFilePreviews[configId];
    
    if (this.commentAttachments[configId]) {
      this.commentAttachments[configId] = {
        ...this.commentAttachments[configId],
        fileBase64: '',
        fileName: ''
      };
    }
    
    this.cdr.detectChanges();
  }

  // Modal management methods
  openCommentModal(): void {
    // Ensure comment attachments are properly initialized when modal opens
    this.initializeCommentAttachments();
    const modal = document.getElementById('commentModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  closeCommentModal(): void {
    const modal = document.getElementById('commentModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }

  // Utility methods
  getAttachmentUrl(imgPath: string): string {
    // If imgPath is already a full URL, return it as is
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    
    // If imgPath is a relative path, construct the full URL
    // Remove leading slash if present
    const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
    
    // For regular file paths, use the files endpoint
    return `${environment.apiBaseUrl}/files/${cleanPath}`;
  }

  viewAttachment(attachment: AttachmentDto | any): void {
    if (attachment.imgPath) {
      // Construct the full URL for the file
      const fileUrl = this.getAttachmentUrl(attachment.imgPath);
      window.open(fileUrl, '_blank');
    }
  }

  downloadAttachment(attachment: AttachmentDto | any): void {
    if (attachment.imgPath) {
      // Construct the full URL for the file
      const fileUrl = this.getAttachmentUrl(attachment.imgPath);
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = attachment.attachmentTitle || attachment.imgPath;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }


  // Comments table event handlers
  onTableCellClick(event: any, id: any) {
    if (id) this.fetchAndViewCommentAttachments(id);
  }

  fetchAndViewCommentAttachments(commentId: number): void {
    this.isLoadingAttachments = true;
    this.selectedCommentAttachments = [];
    this.openAttachmentModal();
    
    // Master type for comments is 1003
    const masterType = 1003;
    
    // Prepare parameters for getList method
    const parameters: any = {
      skip: 0,
      take: 100, // Get up to 100 attachments
      masterIds: [commentId], // Array of master IDs
      masterType: masterType
    };
    
    const subscription = this.attachmentService.getList(parameters).subscribe({
      next: (result: any) => {
        // Handle different response structures
        this.selectedCommentAttachments = result.data || result.items || [];
        this.isLoadingAttachments = false;
        
        if (this.selectedCommentAttachments.length === 0) {
          this.toastr.info(this.translate.instant('COMMON.NO_ATTACHMENTS_FOUND'));
        }
      },
      error: (error) => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_LOADING_ATTACHMENTS'));
        this.isLoadingAttachments = false;
        this.selectedCommentAttachments = [];
      }
    });
    
    this.subscriptions.push(subscription);
  }

  openAttachmentModal(): void {
    const modal = document.getElementById('attachmentModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  closeAttachmentModal(): void {
    this.selectedCommentAttachments = [];
    this.isLoadingAttachments = false;
    const modal = document.getElementById('attachmentModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }


  // Navigation methods
  goBack(): void {
    // If there's an error, go back to the main request page
    // If no error, go back to the previous page
    if (this.hasError) {
      this.router.navigate(['/mainServices/services']);
    } else {
      // Use browser history to go back
      window.history.back();
    }
  }


  onNotesChange(newValue: string) {
    this.originalNotes = newValue;
  }

  submitComment(): void {
    this.submitted = true;

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return;
    }

    const formData = this.userForm.value;

    const params: WorkFlowCommentDtos = {
      id: null,
      empId: localStorage.getItem('userId'),
      workFlowStepsId: this.originalworkFlowId,
      comment: formData.comment,
      commentTypeId: formData.commentTypeId,
    };

    this.spinnerService.show();
    this.mainApplyServiceService.saveComment(params).subscribe({
      next: (res) => {
        this.toastr.success(this.translate.instant('TOAST.TITLE.SUCCESS'));
        this.spinnerService.hide();
        this.loadMainApplyServiceData();
      },
      error: (err) => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
        this.spinnerService.hide();
      },
      complete: () => this.spinnerService.hide(),
    });
  }

  historyForModal: any[] = [];
  private historyModalInstance: any = null;

  openHistoryModal(history: any[] = []): void {
    this.historyForModal = (history || []).slice().sort((a, b) =>
      new Date(b.historyDate).getTime() - new Date(a.historyDate).getTime()
    );

    const el = document.getElementById('historyModal');
    if (el) {
      if (this.historyModalInstance) {
        this.historyModalInstance.dispose();
      }
      this.historyModalInstance = new (window as any).bootstrap.Modal(el, {
        backdrop: 'static',
        keyboard: false
      });
      this.historyModalInstance.show();
    }
  }

  closeHistoryModal(): void {
    if (this.historyModalInstance) {
      this.historyModalInstance.hide();
    }
  }

  getHistoryNote(h: any): string {
    const lang = (this.translate?.currentLang || localStorage.getItem('lang') || 'ar').toLowerCase();
    if (lang.startsWith('ar')) {
      return h?.noteAr || h?.serviceStatusName || '';
    }
    return h?.noteEn || h?.serviceStatusName || '';
  }
}
