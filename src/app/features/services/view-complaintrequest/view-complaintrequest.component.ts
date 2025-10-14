import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MainApplyService } from '../../../core/services/mainApplyService/mainApplyService.service';
import { UpdateStatusDto, WorkFlowCommentDto, WorkFlowStepDto, mainApplyServiceDto } from '../../../core/dtos/mainApplyService/mainApplyService.dto';
import { Observable, tap, catchError, throwError, EMPTY } from 'rxjs';
import { SpinnerService } from '../../../core/services/spinner.service';
import { openStandardReportService } from '../../../core/services/openStandardReportService.service';

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



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mainApplyServiceService: MainApplyService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private spinnerService: SpinnerService,
    private openStandardReportService: openStandardReportService
  ) {
    this.rejectResonsForm = this.fb.group({
      reasonTxt: [[], Validators.required]
    });
    this.returnModificationForm = this.fb.group({
      returnModificationreasonTxt: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMainApplyServiceData();
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
        let storeddepartmentId = localStorage.getItem('departmentId') ?? '';
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
        console.log("workFlowSteps", this.workFlowSteps);
        console.log("storedDeptIds", storedDeptIds);
        console.log("matchedIndices", matchedIndices);
        console.log("storeddepartmentId", storeddepartmentId);
        console.log("workFlowQuery", this.workFlowQuery);
        console.log("serviceDepartmentActions", this.serviceDepartmentActions);
        console.log("originalworkFlowId", this.originalworkFlowId);
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

    const tentDate = this.openStandardReportService.formatDate(this.mainApplyService?.fastingTentService?.tentDate ?? null);
    const startDate = this.openStandardReportService.formatDate(this.mainApplyService?.fastingTentService?.startDate ?? null);
    const endDate = this.openStandardReportService.formatDate(this.mainApplyService?.fastingTentService?.endDate ?? null);

    //if (status === "1" && !tentDate && this.firstLevel && this.mainApplyService?.serviceId === 1) {
    //  this.toastr.warning(this.translate.instant('VALIDATION.TENT_DATE_REQUIRED'));
    //  return;
    //}

    if (status === "1" && !endDate && this.mainApplyService?.serviceId === 1) {
      this.toastr.warning(this.translate.instant('VALIDATION.END_DATE_REQUIRED'));
      return;
    }
    if (status === "1" && !startDate && this.mainApplyService?.serviceId === 1) {
      this.toastr.warning(this.translate.instant('VALIDATION.START_DATE_REQUIRED'));
      return;
    }
    this.spinnerService.show();

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
                this.loadMainApplyServiceData();
              } else {
                this.handleStatus5();
                this.loadMainApplyServiceData();
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

}

