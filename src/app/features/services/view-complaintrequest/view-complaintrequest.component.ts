import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MainApplyService } from '../../../core/services/mainApplyService/mainApplyService.service';
import { UpdateStatusDto, WorkFlowCommentDto, WorkFlowStepDto, mainApplyServiceDto } from '../../../core/dtos/mainApplyService/mainApplyService.dto';
import { Observable, tap, catchError, throwError, EMPTY, Subscription, of } from 'rxjs';
import { SpinnerService } from '../../../core/services/spinner.service';
import { openStandardReportService } from '../../../core/services/openStandardReportService.service';
import { AuthService } from '../../../core/services/auth.service';
import { ColDef } from 'ag-grid-community';
import { AttachmentDto, GetAllAttachmentsParamters } from '../../../core/dtos/attachments/attachment.dto';
import { AttachmentService } from '../../../core/services/attachments/attachment.service';
import { MainApplyServiceReportService } from '../../../core/services/mainApplyService/mainApplyService.reports';

declare var bootstrap: any;

export enum ServiceStatus {
  Accept = 1,
  Reject = 2,
  RejectForReason = 3,
  Wait = 4,
  Received = 5,
  ReturnForModifications = 7
}

@Component({
  selector: 'app-view-complaintrequest',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,TranslateModule,RouterLink],
  templateUrl: './view-complaintrequest.component.html',
  styleUrls: ['./view-complaintrequest.component.scss']
})


export class ViewComplaintrequestComponent implements OnInit {

  // البيانات الخاصة بالطلب
  mainApplyService: any = null;
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
  workFlowSteps: WorkFlowStepDto[] = [];
  targetWorkFlowStep: WorkFlowStepDto | null = null;
  commentForm!: FormGroup;
  isLoading = false;
  submitted = false;
  allApproved: boolean = false;
  userForm: FormGroup;
  isLoadingComments = false;
  isSavingComment = false;
  allWorkFlowComments: any[] = [];
  workFlowComments: WorkFlowCommentDto[] = [];
  commentsColumnHeaderMap: { [key: string]: string } = {};
  commentsColumnDefs: ColDef[] = [];
  selectedCommentAttachments: AttachmentDto[] = [];
  isLoadingAttachments: boolean = false;

  private subscriptions: Subscription[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mainApplyServiceService: MainApplyService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private spinnerService: SpinnerService,
    private authService:AuthService,
    private openStandardReportService: openStandardReportService,
    private attachmentService: AttachmentService,
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
  }

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
        this.mainApplyService = resp;  // تخزين البيانات القادمة من الـ API في mainApplyService
        //  let storeddepartmentId = localStorage.getItem('departmentId') ?? '';

        let profile = this.authService.snapshot;
        let storeddepartmentId = profile?.departmentId ?? '';
        this.workFlowSteps = this.mainApplyService?.workFlowSteps ?? [];

        const storedDeptIds = storeddepartmentId
          .replace(/"/g, '')
          .split(',')
          .map(x => x.trim())
          .filter(x => x !== '');

        storeddepartmentId = storeddepartmentId.replace(/"/g, '').trim();

        this.workFlowSteps = (this.mainApplyService?.workFlowSteps ?? []).map((step: any) => ({
          ...step,
          isMatched: storedDeptIds.includes(String(step?.deptId ?? '').trim())
        }));

        const matchedIndices = this.workFlowSteps
          .map((s, i) => (storedDeptIds.includes(String(s?.deptId ?? '').trim()) ? i : -1))
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
      },
      error: () => {
        this.toastr.error(this.translate.instant('COMMON.ERROR_LOADING_DATA'));
        this.router.navigate(['/']);
      }
    });
  }

  get hasActionButtons(): boolean {
    return this.serviceDepartmentActions?.some(x => [1, 2, 3].includes(x)) ?? false;
  }

  // دالة لتنسيق التاريخ (على سبيل المثال)
  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();  // تحويل التاريخ إلى صيغة أكثر قابلية للعرض
  }

  // دالة لتنسيق التاريخ والوقت
  formatDateTime(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleString();  // تحويل التاريخ والوقت إلى صيغة أكثر قابلية للعرض
  }

  // Navigation
  goBack() { this.router.navigate(['/mainApplyService']); }

  trackByStepId(index: number, step: WorkFlowStepDto): number {
    return step.id || index;
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


  // step flow history start
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

    const params: WorkFlowCommentDto = {
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
    const parameters: GetAllAttachmentsParamters = {
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

