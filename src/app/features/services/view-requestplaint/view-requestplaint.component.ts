import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MainApplyService } from '../../../core/services/mainApplyService/mainApplyService.service';
import { WorkFlowCommentsService } from '../../../core/services/mainApplyService/workFlowComments.service';
import { AttachmentService } from '../../../core/services/attachments/attachment.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { AttachmentDto, AttachmentsConfigDto, CharityEventPermitDto, PartnerDto, UpdateStatusDto, WorkFlowCommentDto, WorkFlowStepDto, mainApplyServiceDto } from '../../../core/dtos/mainApplyService/mainApplyService.dto';
import { ServiceStatus } from '../view-requesteventpermit/view-requesteventpermit.component';
import { ColDef } from 'ag-grid-community';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { Observable, tap, catchError, throwError, EMPTY, Subscription, of } from 'rxjs';
import { SpinnerService } from '../../../core/services/spinner.service';
import { openStandardReportService } from '../../../core/services/openStandardReportService.service';
import { AuthService } from '../../../core/services/auth.service';
import { MainApplyServiceReportService } from '../../../core/services/mainApplyService/mainApplyService.reports';

declare var bootstrap: any;


type MainApplyServiceView = {
  id: number;
  userId: string;
  serviceId: number;
  applyDate: string;
  applyNo: string;
  lastStatus: string;
  lastStatusEN?: string;
  lastModified: string;
  permitNumber?: string;
  service?: { serviceId: number; serviceName: string; serviceNameEn?: string; descriptionAr?: string | null; descriptionEn?: string | null; serviceType?: number };
  workFlowSteps: WorkFlowStepDto[];
  attachments: AttachmentDto[];
  partners: PartnerDto[];
  charityEventPermit: CharityEventPermitDto | null;
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


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule,RouterLink],
  selector: 'app-view-requestplaint',
  templateUrl: './view-requestplaint.component.html',
  styleUrls: ['./view-requestplaint.component.scss']
})
export class ViewRequestplaintComponent implements OnInit {

// Tabs: 1 Basic, 2 Event, 3 Dates, 4 Contacts, 5 Advertisements, 6 Partners, 7 Attachments, 8 Workflow
  currentTab = 1;
  totalTabs = 8;

  // Data
  mainApplyService: any | null = null;
  charityEventPermit: CharityEventPermitDto | null = null;
  workFlowSteps: WorkFlowStepDto[] = [];
  partners: PartnerDto[] = [];
  attachments: AttachmentDto[] = [];

  // Workflow comments (view)
  targetWorkFlowStep: WorkFlowStepDto | null = null;
  allWorkFlowComments: any[] = [];
  commentsColumnDefs: ColDef[] = [];
  commentsColumnHeaderMap: { [k: string]: string } = {};
  isLoadingComments = false;

  // Modals: attachments (comments / partners)
  showAttachmentModal = false;
  selectedCommentAttachments: AttachmentDto[] = [];
  isLoadingAttachments = false;

  showPartnerAttachmentModal = false;
  selectedPartner: PartnerDto | null = null;
  selectedPartnerAttachments: AttachmentDto[] = [];
  isLoadingPartnerAttachments = false;

  // Optional add comment form (disabled by default visually)
  commentForm!: FormGroup;
  newCommentText = '';
  isSavingComment = false;

  // Comment attachment properties
  commentAttachmentConfigs: AttachmentsConfigDto[] = [];
  commentAttachments: { [key: number]: { fileBase64: string; fileName: string; attConfigID: number } } = {};
  commentSelectedFiles: { [key: number]: File } = {};
  commentFilePreviews: { [key: number]: string } = {};
  isCommentDragOver = false;
  commentValidationSubmitted = false;
  selectedFiles: File[] = [];


  submitted = false;
  isSaving = false;
  isFormInitialized = false;
  workFlowQuery: any;
  originalNotes: string | null = null;
  rejectResonsForm: FormGroup;
  returnModificationForm: FormGroup;
  addReason = new mainApplyServiceDto();
  originalworkFlowId: number | null | undefined;
  firstLevel: boolean = false;
  screenMode: 'edit' | 'view' = 'view';
  isEditMode: boolean = false;
  serviceDepartmentActions: number[] = [];
  private subscriptions: Subscription[] = [];
  allApproved: boolean = false;
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private mainApplyServiceService: MainApplyService,
    private workFlowCommentsService: WorkFlowCommentsService,
    private attachmentService: AttachmentService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private spinnerService: SpinnerService,
    private openStandardReportService: openStandardReportService,
    private authService: AuthService,
    private mainApplyServiceReportService: MainApplyServiceReportService
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
    this.loadMainApplyServiceData();
    // this.loadCommentAttachmentConfigs()
  }
  // ngOnDestroy(): void {
  //   this.subscriptions.forEach(s => s.unsubscribe());
  // }

  ngAfterViewInit(): void {
    const modalEl = document.getElementById('addcommentsModal');
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.resetForm();
      });
    }

    const modalReturnModificationEl = document.getElementById('myModalReturnModification');
    if (modalReturnModificationEl) {
      modalReturnModificationEl.addEventListener('hidden.bs.modal', () => {
        this.resetModificationForm();
      });
    }
  }

  resetForm(): void {
    this.userForm.reset();
    this.submitted = false;
  }

  resetModificationForm(): void {
    this.returnModificationForm.reset();
    this.submitted = false;
  }


  // ===== Load =====
  private loadMainApplyServiceData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const mode = sessionStorage.getItem('screenmode');
    this.screenMode = mode === 'edit' ? 'edit' : 'view';
    this.isEditMode = this.screenMode === 'edit';
    if (!id) {
      this.toastr.error(this.translate.instant('COMMON.INVALID_ID'));
      this.router.navigate(['/']);
      return;
    }

    const sub = this.mainApplyServiceService.getDetailById({ id }).subscribe({
      next: (resp: any) => {

        this.mainApplyService = resp;
        this.charityEventPermit = resp.charityEventPermit || null;
        this.workFlowSteps = resp.workFlowSteps || [];
        this.partners = resp.partners || [];
        this.attachments = resp.attachments || [];

        //  let storeddepartmentId = localStorage.getItem('departmentId') ?? '';

        let profile = this.authService.snapshot;
        let storeddepartmentId = profile?.departmentId ?? '';

        const storedDeptIds = storeddepartmentId
          .replace(/"/g, '')
          .split(',')
          .map(x => x.trim())
          .filter(x => x !== '');

        storeddepartmentId = storeddepartmentId.replace(/"/g, '').trim();

        this.workFlowSteps = this.workFlowSteps.map((step: any) => ({
          ...step,
          isMatched: storedDeptIds.includes(String(step?.deptId).trim())
        }));

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
        this.workFlowQuery[0].serviceDepartmentActions = 1;
        this.serviceDepartmentActions = (this.workFlowQuery ?? [])
          .map((s: any) => s.serviceDepartmentActions)
          .filter((x: any): x is number => typeof x === 'number');

        this.originalworkFlowId = this.workFlowQuery?.[0]?.id ?? null;

        this.allApproved = this.workFlowSteps.length > 0 &&
          this.workFlowSteps.every(step => step.serviceStatus === 1);
        this.findTargetWorkFlowStep();
        if (this.targetWorkFlowStep) {
          this.loadWorkFlowComments();
        } else {
          this.initializeCommentsTable([]);
        }
      },
      error: () => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_LOADING_DATA'));
        this.router.navigate(['/']);
      }
    });
    this.subscriptions.push(sub);
  }

  get hasActionButtons(): boolean {
    return this.serviceDepartmentActions?.some(x => [1, 2, 3].includes(x)) ?? false;
  }

  private findTargetWorkFlowStep(): void {
    if (this.workFlowSteps?.length) {
      const sorted = this.workFlowSteps
        .filter(s => s.stepOrder !== null && s.stepOrder !== undefined)
        .sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));
      this.targetWorkFlowStep = sorted.find(s => s.serviceStatus === ServiceStatus.Wait) || null;
    }
  }

  private loadWorkFlowComments(): void {
    const rows: any[] = [];
    (this.workFlowSteps || []).forEach(step => {
      const comments = step.workFlowComments || [];
      comments.forEach(c => {
        rows.push({
          ...c,
          stepDepartmentName: step.departmentName,
          stepServiceStatus: step.serviceStatusName
        });
      });
    });

    rows.sort((a, b) => {
      const A = new Date(a.lastModified || 0).getTime();
      const B = new Date(b.lastModified || 0).getTime();
      return B - A;
    });

    this.allWorkFlowComments = rows;
    this.initializeCommentsTable(rows);
    this.isLoadingComments = false;
  }

  private initializeCommentsTable(_: any[]): void {
    this.commentsColumnDefs = [
      {
        headerName: this.translate.instant('COMMON.COMMENT'),
        field: 'comment',
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: any) => {
          const txt = params.value || '-';
          const meta = `
            <small class="text-muted">
              <i class="fas fa-user me-1"></i>${params.data.employeeDepartmentName || 'N/A'}
              <span class="ms-2">
                <i class="fas fa-calendar me-1"></i>${this.formatDateTime(params.data.lastModified)}
              </span>
            </small>`;
          return `<div class="comment-cell"><div class="comment-text">${txt}</div><div class="comment-meta">${meta}</div></div>`;
        }
      },
      { headerName: this.translate.instant('COMMON.DEPARTMENT'), field: 'stepDepartmentName', flex: 1.2, minWidth: 150 },
      { headerName: this.translate.instant('COMMON.STATUS'), field: 'stepServiceStatus', flex: 1, minWidth: 120 },
      {
        headerName: this.translate.instant('COMMON.FILES'),
        field: 'id',
        flex: 0.8,
        minWidth: 100,
        cellRenderer: (p: any) => {
          const id = p.value;
          return id
            ? `<button class="btn btn-next-style attachment-btn" data-comment-id="${id}" data-row-index="${p.node.rowIndex}">
                 <i class="fas fa-eye me-1"></i><span>${this.translate.instant('COMMON.VIEW')}</span>
               </button>`
            : '-';
        },
        cellClass: 'text-center'
      }
    ];

    this.commentsColumnHeaderMap = {
      comment: this.translate.instant('COMMON.COMMENT'),
      stepDepartmentName: this.translate.instant('COMMON.DEPARTMENT'),
      stepServiceStatus: this.translate.instant('COMMON.STATUS'),
      attachments: this.translate.instant('COMMON.FILES')
    };
  }

  // ===== Tabs =====
  goToTab(n: number) { if (n >= 1 && n <= this.totalTabs) this.currentTab = n; }
  nextTab() { if (this.currentTab < this.totalTabs) this.currentTab++; }
  previousTab() { if (this.currentTab > 1) this.currentTab--; }
  isTabActive(n: number) { return this.currentTab === n; }

  // ===== Helpers =====
  formatDate(d: string | Date | null | undefined): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString();
  }
  formatDateTime(d: string | Date | null | undefined): string {
    if (!d) return '-';
    return new Date(d).toLocaleString();
  }

  getAttachmentUrl(imgPath: string): string {
    if (!imgPath) return '';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    const clean = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
    return `${environment.apiBaseUrl}/files/${clean}`;
  }
  viewAttachment(a: AttachmentDto) {
    if (!a?.imgPath) return;
    window.open(this.getAttachmentUrl(a.imgPath), '_blank');
  }
  downloadAttachment(a: AttachmentDto) {
    if (!a?.imgPath) return;
    const url = this.getAttachmentUrl(a.imgPath);
    const link = document.createElement('a');
    link.href = url;
    link.download = a.attachmentTitle || a.imgPath;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Advertisements helpers
  adLangLabel(code?: string | null): string {
    if (!code) return '-';
    const map: Record<string, string> = { ar: this.translate.instant('COMMON.ARABIC') || 'Arabic', en: this.translate.instant('COMMON.ENGLISH') || 'English' };
    return map[code.toLowerCase()] || code;
  }

  // Donation channel display (AR/EN بحسب لغة الواجهة)
  channelName(ch: any): string {
    const isAr = (this.translate.currentLang || '').toLowerCase().startsWith('ar');
    return (isAr ? (ch.nameAr || ch.nameEn) : (ch.nameEn || ch.nameAr)) || '-';
  }

  // Workflow comment attachments
  onTableCellClick(event: any, id: any) {
    // const btn = event.event?.target?.closest?.('.attachment-btn');
    // if (btn) {
    //   const id = parseInt(btn.getAttribute('data-comment-id'), 10);
    //   if (id) this.fetchAndViewCommentAttachments(id);
    // }
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
      // this.subscriptions.push(sub);
    }
    closeAttachmentModal() {
      this.showAttachmentModal = false;
      this.selectedCommentAttachments = [];
      this.isLoadingAttachments = false;
    }
  
    // Workflow visuals
    getStatusColor(statusId: number | null): string {
      if (statusId === null) return '#6c757d';
      switch (statusId) {
        case ServiceStatus.Accept: return '#28a745';
        case ServiceStatus.Reject: return '#dc3545';
        case ServiceStatus.RejectForReason: return '#fd7e14';
        case ServiceStatus.Wait: return '#ffc107';
        case ServiceStatus.Received: return '#17a2b8';
        case ServiceStatus.ReturnForModifications: return '#6f42c1';
        default: return '#6c757d';
      }
    }
    getStatusIcon(statusId: number | null): string {
      if (statusId === null) return 'fas fa-question-circle';
      switch (statusId) {
        case ServiceStatus.Accept: return 'fas fa-check-circle';
        case ServiceStatus.Reject: return 'fas fa-times-circle';
        case ServiceStatus.RejectForReason: return 'fas fa-exclamation-triangle';
        case ServiceStatus.Wait: return 'fas fa-clock';
        case ServiceStatus.Received: return 'fas fa-inbox';
        case ServiceStatus.ReturnForModifications: return 'fas fa-edit';
        default: return 'fas fa-question-circle';
      }
    }
    getStatusLabel(statusId: number | null): string {
      if (statusId === null) return 'WORKFLOW.STATUS_UNKNOWN';
      switch (statusId) {
        case ServiceStatus.Accept: return 'WORKFLOW.STATUS_ACCEPT';
        case ServiceStatus.Reject: return 'WORKFLOW.STATUS_REJECT';
        case ServiceStatus.RejectForReason: return 'WORKFLOW.STATUS_REJECT_FOR_REASON';
        case ServiceStatus.Wait: return 'WORKFLOW.STATUS_WAITING';
        case ServiceStatus.Received: return 'WORKFLOW.STATUS_RECEIVED';
        case ServiceStatus.ReturnForModifications: return 'WORKFLOW.STATUS_RETURN_FOR_MODIFICATIONS';
        default: return 'WORKFLOW.STATUS_UNKNOWN';
      }
    }
    isStepCompleted(s: number | null) { return s === ServiceStatus.Accept || s === ServiceStatus.Received; }
    isStepRejected(s: number | null) { return s === ServiceStatus.Reject || s === ServiceStatus.RejectForReason; }
    isStepPending(s: number | null) { return s === ServiceStatus.Wait; }
    trackByStepId(i: number, step: WorkFlowStepDto) { return step.id ?? i; }
  
    // Navigation
    goBack() { this.router.navigate(['/mainApplyService']); }
  
  
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
      this.commentForm.markAllAsTouched();
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
        this.spinnerService.hide();
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
    this.spinnerService.show();

    this.submitModficationReasonComment().subscribe({
      next: () => {
        this.returnModificationForm.reset();
        this.submitted = false;

        const modalElement = document.getElementById('myModalReturnModification');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modal.hide();
        }

        // Wait for updateStatus to complete before hiding spinner
        this.updateStatus("7", formData.returnModificationreasonTxt).subscribe({
          next: () => {
            this.spinnerService.hide();
          },
          error: () => {
            this.spinnerService.hide();
            this.toastr.error(this.translate.instant('TOAST.SAVE_FAILED'));
          }
        });
      },
      error: () => {
        this.spinnerService.hide();
        this.toastr.error(this.translate.instant('TOAST.SAVE_FAILED'));
      }
    });
  }

  onNotesChange(newValue: string) {
    this.originalNotes = newValue;
  }

  updateStatus(status: string, reason: string): Observable<any> {
    const tentDate = this.openStandardReportService.formatDate(this.mainApplyService?.fastingTentService?.tentDate ?? null);
    const startDate = this.openStandardReportService.formatDate(this.mainApplyService?.fastingTentService?.startDate ?? null);
    const endDate = this.openStandardReportService.formatDate(this.mainApplyService?.fastingTentService?.endDate ?? null);

    if (status === "1" && !endDate && this.mainApplyService?.serviceId === 1) {
      this.toastr.warning(this.translate.instant('VALIDATION.END_DATE_REQUIRED'));
      return of(null); // return empty observable to keep signature consistent
    }

    if (status === "1" && !startDate && this.mainApplyService?.serviceId === 1) {
      this.toastr.warning(this.translate.instant('VALIDATION.START_DATE_REQUIRED'));
      return of(null);
    }

    this.spinnerService.show();

    return new Observable((observer) => {
      this.saveNotesForApproving().subscribe({
        next: () => {
          const param: UpdateStatusDto = {
            mainApplyServiceId: Number(this.mainApplyService?.id),
            workFlowId: this.originalworkFlowId,
            serviceStatus: Number(status),
            userId: localStorage.getItem('userId'),
            reason: reason,
            notesForApproving: this.originalNotes,
            tentConstructDate: this.addReason.fastingTentService?.tentConstructDate ?? null,
            startDate: this.addReason.fastingTentService?.startDate ?? null,
            endDate: this.addReason.fastingTentService?.endDate ?? null
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

                if (status != "5") {
                  this.loadMainApplyServiceData();
                } else {
                  this.handleStatus5();
                  this.loadMainApplyServiceData();
                }

                observer.next(res);
                observer.complete();
              } else {
                this.toastr.warning(this.translate.instant('Common.ERROR'));
                observer.error(res);
              }
              this.spinnerService.hide();
            },
            error: (err) => {
              this.toastr.error(this.translate.instant('Common.ERROR_SAVING_DATA'));
              observer.error(err);
            },
            complete: () => this.spinnerService.hide()
          });
        },
        error: (err) => {
          this.spinnerService.hide();
          this.toastr.error(this.translate.instant('Common.ERROR_SAVING_DATA'));
          observer.error(err);
        }
      });
    });
  }


  saveNotesForApproving(): Observable<any> {
    this.submitted = true;

    const params: WorkFlowCommentDto = {
      id: 0,
      empId: localStorage.getItem('userId'),
      workFlowStepsId: this.originalworkFlowId,
      comment: "ملاحظات: " + this.originalNotes,
      commentTypeId: 2,
    };

    return this.mainApplyServiceService.saveComment(params).pipe(
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


  submitRejectComment(): Observable<any> {
    this.submitted = true;

    if (this.rejectResonsForm.invalid) {
      this.commentForm.markAllAsTouched();
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

    return this.mainApplyServiceService.saveComment(params).pipe(
      tap({
        next: (res) => {
          this.spinnerService.hide();
          this.toastr.success(this.translate.instant('TOAST.TITLE.SUCCESS'));
        },
        error: () => {
          this.spinnerService.hide();
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
          this.spinnerService.hide();
          this.toastr.success(this.translate.instant('TOAST.TITLE.SUCCESS'));
        },
        error: () => {
          this.spinnerService.hide();
          this.toastr.error(this.translate.instant('Common.ERROR_SAVING_DATA'));
        },
        complete: () => this.spinnerService.hide()
      })
    );
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
        this.userForm.reset();
        const modalElement = document.getElementById('addcommentsModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance?.hide();
      },
      error: (err) => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_SAVING_DATA'));
        this.spinnerService.hide();
      },
      complete: () => this.spinnerService.hide(),
    });
  }

  get isApproved(): boolean {
    const lang = (this.translate?.currentLang || localStorage.getItem('lang') || 'ar').toLowerCase();

    if (lang.startsWith('ar')) {
      return this.mainApplyService?.serviceStatusName?.includes('معتمد') ?? false;
    }
    else {
      return this.mainApplyService?.serviceStatusName?.includes('Approved') ?? false;
    }
  }


  printReport(): void {
    const serviceId = this.mainApplyService?.serviceId ?? 0;
    const id = this.mainApplyService?.id ?? '';
    var serviceStatusName = null
    const lang = (this.translate?.currentLang || localStorage.getItem('lang') || 'ar').toLowerCase();
    if (lang.startsWith('ar')) {
      serviceStatusName =
        (this.mainApplyService?.serviceStatusName?.includes("معتمد") ?? false)
          ? 'final'
          : 'initial';
    }
    else {
      serviceStatusName =
        (this.mainApplyService?.serviceStatusName?.includes("Approved") ?? false)
          ? 'final'
          : 'initial';
    }

    this.mainApplyServiceReportService.printDatabyId(id.toString(), serviceId, serviceStatusName)
  }
}
