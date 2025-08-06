import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceSettingService } from '../../../../core/services/serviceSetting.service';
import { AttachmentsConfigService } from '../../../../core/services/attachments/attachments-config.service';
import {
  ServiceDto,
  UpdateServiceDto,
} from '../../../../core/dtos/serviceSetting/serviceSetting.dto';
import {
  AttachmentsConfigDto,
  CreateAttachmentsConfigDto,
  UpdateAttachmentsConfigDto,
} from '../../../../core/dtos/attachments/attachments-config.dto';
import { GenericDataTableComponent } from '../../../../../shared/generic-data-table/generic-data-table.component';
import { ColDef } from 'ag-grid-community';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../../../core/services/spinner.service';

@Component({
  selector: 'app-attachments-list',
  standalone: true,
  imports: [
    CommonModule,
    GenericDataTableComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  templateUrl: './attachments-list.component.html',
  styleUrls: ['./attachments-list.component.scss'],
})
export class AttachmentsListComponent implements OnInit, OnDestroy {
  serviceId!: number;
  serviceDetails!: ServiceDto;
  attachments: AttachmentsConfigDto[] = [];
  @Input() isEditMode: boolean = true;
  configTypeMap: { [key: number]: string } = {};

  columnDefs: ColDef[] = [];
  rowActions: Array<{ label: string; icon?: string; action: string }> = [];

  // Modal properties
  showAttachmentModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selectedAttachment?: AttachmentsConfigDto;
  attachmentForm!: FormGroup;
  attachmentModal: any;
  submitted: boolean = false;
  selectedAttachmentToDelete: AttachmentsConfigDto | null = null;
  private deleteModal: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceSettingService: ServiceSettingService,
    private attachmentsConfigService: AttachmentsConfigService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    this.serviceId = +this.route.snapshot.paramMap.get('id')!;
    this.initColumns();
    this.initActions();
    this.loadServiceDetails();
    this.buildForm();
    this.initializeModal();
  }

  ngOnDestroy(): void {
    this.cleanupModal();
  }

  private initializeModal(): void {
    const modalElement = document.getElementById('AttachmentModal');
    if (modalElement) {
      this.attachmentModal = new (window as any).bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
      });

      modalElement.addEventListener('hidden.bs.modal', () => {
        this.onModalHidden();
      });
    }

    // Initialize delete modal
    const deleteModalElement = document.getElementById('deleteAttachmentModal');
    if (deleteModalElement) {
      this.deleteModal = new (window as any).bootstrap.Modal(
        deleteModalElement,
        {
          backdrop: true,
          keyboard: true,
        }
      );
    }
  }

  private cleanupModal(): void {
    if (this.attachmentModal) {
      this.attachmentModal.dispose();
      this.attachmentModal = null;
    }
    if (this.deleteModal) {
      this.deleteModal.dispose();
      this.deleteModal = null;
    }
  }

  private onModalHidden(): void {
    this.showAttachmentModal = false;
    this.resetForm();
  }

  private buildForm() {
    this.attachmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      nameEn: ['', [Validators.maxLength(200)]],
      mendatory: [false],
      active: [true],
    });
  }

  private resetForm() {
    this.attachmentForm.reset({
      name: '',
      nameEn: '',
      mendatory: false,
      active: true,
    });
    this.submitted = false;
  }

  private initColumns() {
    this.columnDefs = [
      {
        field: 'name',
        headerName: this.translate.instant(
          'SERVICE_SETTING.ATTACHMENT_NAME_AR'
        ),
        width: 200,
        sortable: true,
        filter: true,
      },
      {
        field: 'nameEn',
        headerName: this.translate.instant(
          'SERVICE_SETTING.ATTACHMENT_NAME_EN'
        ),
        width: 200,
        sortable: true,
        filter: true,
      },
      {
        field: 'mendatory',
        headerName: this.translate.instant('SERVICE_SETTING.MANDATORY'),
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: (params: any) => {
          const isMandatory = params.value;
          return `<span class="badge ${
            isMandatory ? 'status-waiting' : 'status-rejected'
          }">${isMandatory ? 'Mandatory' : 'Optional'}</span>`;
        },
      },
      {
        field: 'active',
        headerName: this.translate.instant('SERVICE_SETTING.ACTIVE'),
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params: any) => {
          const isActive = params.value;
          return `<span class="badge ${
            isActive ? 'status-approved' : 'status-rejected'
          }">${isActive ? 'Active' : 'Inactive'}</span>`;
        },
      },
    ];
  }

  private initActions() {
    if (!this.isEditMode) {
      this.rowActions = [
        {
          label: this.translate.instant('COMMON.VIEW'),
          icon: 'fas fa-eye',
          action: 'view',
        },
      ];
      return;
    }
    this.rowActions = [
      {
        label: this.translate.instant('COMMON.VIEW'),
        icon: 'fas fa-eye',
        action: 'view',
      },
      {
        label: this.translate.instant('COMMON.UPDATE'),
        icon: 'fas fa-edit',
        action: 'edit',
      },
      {
        label: this.translate.instant('COMMON.DELETE'),
        icon: 'fas fa-trash',
        action: 'delete',
      },
    ];
  }

  private loadServiceDetails() {
    this.serviceSettingService.getById(this.serviceId).subscribe({
      next: (res: any) => {
        this.serviceDetails = res;
        this.attachments = res.attachmentsConfigs || [];
      },
    });
  }

  onActionClick(event: { action: string; row: any }) {
    switch (event.action) {
      case 'view':
        this.openViewAttachmentModal(event.row);
        break;
      case 'edit':
        this.openEditAttachmentModal(event.row);
        break;
      case 'delete':
        this.selectAttachmentToDelete(event.row);
        break;
    }
  }

  addAttachment() {
    this.modalMode = 'add';
    this.selectedAttachment = undefined;
    this.resetForm();
    this.showAttachmentModal = true;
    this.attachmentModal?.show();
  }

  openViewAttachmentModal(attachment: AttachmentsConfigDto) {
    this.modalMode = 'view';
    this.selectedAttachment = attachment;
    this.resetForm();
    this.attachmentForm.patchValue({
      name: attachment.name,
      nameEn: attachment.nameEn,
      mendatory: attachment.mendatory,
      active: attachment.active,
    });
    this.attachmentForm.disable();
    this.showAttachmentModal = true;
    this.attachmentModal?.show();
  }

  openEditAttachmentModal(attachment: AttachmentsConfigDto) {
    this.modalMode = 'edit';
    this.selectedAttachment = attachment;
    this.resetForm();
    this.attachmentForm.patchValue({
      name: attachment.name,
      nameEn: attachment.nameEn,
      mendatory: attachment.mendatory,
      active: attachment.active,
    });
    this.attachmentForm.enable();
    this.showAttachmentModal = true;
    this.attachmentModal?.show();
  }

  submitAttachment() {
    this.submitted = true;

    if (this.attachmentForm.invalid || this.modalMode === 'view') return;

    this.spinnerService.show();
    const formVal = this.attachmentForm.value;

    if (this.modalMode === 'edit' && this.selectedAttachment) {
      const updateDto: UpdateAttachmentsConfigDto = {
        id: this.selectedAttachment.id,
        name: formVal.name,
        nameEn: formVal.nameEn,
        attachmentsConfigType: this.serviceId,
        mendatory: formVal.mendatory,
        active: formVal.active,
      };

      this.attachmentsConfigService.updateAsync(updateDto).subscribe({
        next: (response) => {
          this.toastr.success(this.translate.instant('COMMON.UPDATE_SUCCESS'));
          this.loadServiceDetails();
          this.attachmentModal?.hide();
          this.spinnerService.hide();
        },
        error: (error) => {
          this.toastr.error(
            this.translate.instant('COMMON.UPDATE_ERROR') +
              ': ' +
              (error.error?.message || error.message || 'Unknown error')
          );
          this.spinnerService.hide();
        },
      });
    } else if (this.modalMode === 'add') {
      const createDto: CreateAttachmentsConfigDto = {
        name: formVal.name,
        nameEn: formVal.nameEn,
        attachmentsConfigType: this.serviceId,
        mendatory: formVal.mendatory,
        active: formVal.active,
      };

      this.attachmentsConfigService.createAsync(createDto).subscribe({
        next: (response) => {
          this.toastr.success(this.translate.instant('COMMON.CREATE_SUCCESS'));
          this.loadServiceDetails();
          this.attachmentModal?.hide();
          this.spinnerService.hide();
        },
        error: (error) => {
          this.toastr.error(
            this.translate.instant('COMMON.CREATE_ERROR') +
              ': ' +
              (error.error?.message || error.message || 'Unknown error')
          );
          this.spinnerService.hide();
        },
      });
    }
  }

  closeAttachmentModal() {
    this.attachmentModal?.hide();
  }

  selectAttachmentToDelete(attachment: AttachmentsConfigDto): void {
    this.selectedAttachmentToDelete = attachment;
    // Show delete confirmation modal
    this.deleteModal?.show();
  }

  deleteAttachment(): void {
    if (this.selectedAttachmentToDelete) {
      this.spinnerService.show();
      this.attachmentsConfigService
        .deleteAsync(this.selectedAttachmentToDelete.id)
        .subscribe({
          next: () => {
            this.toastr.success(
              this.translate.instant('COMMON.DELETE_SUCCESS')
            );
            this.selectedAttachmentToDelete = null;
            this.deleteModal?.hide();
            this.loadServiceDetails();
            this.spinnerService.hide();
          },
          error: (error) => {
            this.toastr.error(
              this.translate.instant('COMMON.DELETE_ERROR') +
                ': ' +
                (error.error?.message || error.message || 'Unknown error')
            );
            this.spinnerService.hide();
          },
        });
    }
  }

  cancelDelete(): void {
    this.selectedAttachmentToDelete = null;
    this.deleteModal?.hide();
  }

  // Form validation methods
  getFieldError(fieldName: string): string {
    const control = this.attachmentForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) {
        return this.translate.instant('VALIDATION.REQUIRED');
      }
      if (control.errors['maxlength']) {
        return this.translate.instant('VALIDATION.MAX_LENGTH', {
          max: control.errors['maxlength'].requiredLength,
        });
      }
    }
    return '';
  }

  onFieldBlur(fieldName: string): void {
    const control = this.attachmentForm.get(fieldName);
    if (control) {
      control.markAsTouched();
    }
  }

  hasFormErrors(): boolean {
    return this.submitted && this.attachmentForm.invalid;
  }

  getTotalErrors(): number {
    let errorCount = 0;
    Object.keys(this.attachmentForm.controls).forEach((key) => {
      const control = this.attachmentForm.get(key);
      if (control?.errors) {
        errorCount += Object.keys(control.errors).length;
      }
    });
    return errorCount;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.attachmentForm.get(fieldName);
    return !!(
      control &&
      control.invalid &&
      (control.touched || this.submitted)
    );
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.attachmentForm.get(fieldName);
    return !!(control && control.valid && (control.touched || this.submitted));
  }
}
