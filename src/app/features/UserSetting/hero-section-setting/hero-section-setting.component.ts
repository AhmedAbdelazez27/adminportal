import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ColDef } from 'ag-grid-community';
import { NgSelectModule } from '@ng-select/ng-select';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { HeroSectionSettingService } from '../../../core/services/UserSetting/hero-section-setting.service';
import { AttachmentService } from '../../../core/services/attachments/attachment.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { environment } from '../../../../environments/environment';
import {
  HeroSectionSettingDto,
  CreateHeroSectionSettingDto,
  UpdateHeroSectionSettingDto,
  GetAllHeroSectionSettingRequestDto,
} from '../../../core/dtos/UserSetting/hero-section-setting.dto';
import { AttachmentBase64Dto, AttachmentDto, UpdateAttachmentBase64Dto } from '../../../core/dtos/attachments/attachment.dto';
import { AttachmentsConfigType } from '../../../core/dtos/attachments/attachments-config.dto';
import { AttachmentsConfigDto } from '../../../core/dtos/attachments/attachments-config.dto';
// import { QuillModule } from 'ngx-quill';
// import Quill from 'quill';
import { Subscription } from 'rxjs'; 
import { AngularEditorModule } from '@kolkov/angular-editor';

@Component({
  selector: 'app-hero-section-setting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
    GenericDataTableComponent,
    // QuillModule,
    AngularEditorModule
  ],
  templateUrl: './hero-section-setting.component.html',
  styleUrl: './hero-section-setting.component.scss',
})
export class HeroSectionSettingComponent implements OnInit, OnDestroy {
  heroSectionSettings: HeroSectionSettingDto[] = [];
  totalCount: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  searchValue: string = '';
  heroSectionForm: FormGroup;
  submitted: boolean = false;
  mode: 'add' | 'edit' | 'view' = 'add';
  editingHeroSectionId: number | null = null;
  selectedHeroSectionToDelete: HeroSectionSettingDto | null = null;
  currentViewHeroSection: HeroSectionSettingDto | null = null;
  isLoading: boolean = false;
  selectedAttachmentToDelete: AttachmentDto | null = null;

  // File upload
  selectedFile: File | null = null;
  filePreview: string | null = null;
  existingAttachment: AttachmentDto | null = null;
  existingImageUrl: string | null = null;
  isDragOver: boolean = false;
  uploadProgress: number = 0;
  fileValidationErrors: string[] = [];
  fileValidationSuccess: boolean = false;

  // AG Grid column definitions
  columnDefs: ColDef[] = [];
  rowActions: Array<{ label: string; icon?: string; action: string }> = [];

  // Dropdown data
  attachmentConfigs: AttachmentsConfigDto[] = [];
  isLoadingDropdowns: boolean = false;

    // private quill?: Quill;
  private langSub?: Subscription;

  // quillModules = {
  //   toolbar: [
  //     [{ header: [1, 2, 3, false] }],
  //     ['bold', 'italic', 'underline', 'strike'],
  //     [{ list: 'ordered' }, { list: 'bullet' }],
  //     [{ align: [] }],            
  //     [{ direction: 'rtl' }],     
  //     ['link', 'clean']
  //   ]
  // };

  constructor(
    private heroSectionSettingService: HeroSectionSettingService,
    private attachmentService: AttachmentService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.heroSectionForm = this.fb.group({
      titleAr: ['', [Validators.required, Validators.maxLength(1000)]],
      titleEn: ['', [Validators.required, Validators.maxLength(1000)]],
      descriptionAr: ['', [Validators.required ]],
      descriptionEn: ['', [Validators.required ]],
      link: ['', [Validators.maxLength(500), Validators.pattern('https?://.+')]],
      isActive: [true],
      viewOrder: [0, [Validators.required, Validators.min(0)]],
    });

    this.initializeColumnDefs();
    this.initializeRowActions();
    this.loadAttachmentsConfig();
  }

  ngOnInit(): void {
        this.langSub = this.translate.onLangChange.subscribe(() => {
      // this.applyEditorDir();
    });
    this.loadHeroSectionSettings();
  }
  // onQuillCreated(q: Quill) {
  //   this.quill = q;
  //   this.applyEditorDir();
  // }

  // private applyEditorDir() {
  //   if (!this.quill) return;
  //   const isAr = this.translate.currentLang === 'ar';
  //   const editorEl = this.quill.root as HTMLElement;
  //   editorEl.setAttribute('dir', isAr ? 'rtl' : 'ltr');
  //   editorEl.style.textAlign = isAr ? 'right' : 'left';
  // }

  private initializeColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: '#',
        width: 80,
        sortable: false,
        valueGetter: (params: any) => {
          return this.currentPage * this.pageSize + params.node.rowIndex + 1;
        },
      },
      {
        headerName: this.translate.instant('HERO_SECTION_SETTING.TITLE_AR'),
        field: 'titleAr',
        sortable: true,
        filter: true,
        width: 200,
      },
      {
        headerName: this.translate.instant('HERO_SECTION_SETTING.TITLE_EN'),
        field: 'titleEn',
        sortable: true,
        filter: true,
        width: 200,
      },
      {
        headerName: this.translate.instant('HERO_SECTION_SETTING.DESCRIPTION_AR'),
        field: 'descriptionAr',
        sortable: true,
        filter: true,
        width: 250,
        cellRenderer: (params: any) => {
          const text = params.value || '';
          return text.length > 50 ? text.substring(0, 50) + '...' : text;
        },
      },
      {
        headerName: this.translate.instant('HERO_SECTION_SETTING.DESCRIPTION_EN'),
        field: 'descriptionEn',
        sortable: true,
        filter: true,
        width: 250,
        cellRenderer: (params: any) => {
          const text = params.value || '';
          return text.length > 50 ? text.substring(0, 50) + '...' : text;
        },
      },
      {
        headerName: this.translate.instant('HERO_SECTION_SETTING.LINK'),
        field: 'link',
        sortable: true,
        filter: true,
        width: 150,
        cellRenderer: (params: any) => {
          const link = params.value;
          return link ? `<a href="${link}" target="_blank">${link}</a>` : '-';
        },
      },
      {
        headerName: this.translate.instant('HERO_SECTION_SETTING.VIEW_ORDER'),
        field: 'viewOrder',
        sortable: true,
        filter: true,
        width: 120,
      },
      {
        headerName: this.translate.instant('HERO_SECTION_SETTING.STATUS'),
        field: 'isActive',
        sortable: true,
        filter: true,
        width: 100,
        cellRenderer: (params: any) => {
          return params.value ? 
            '<span class="badge status-approved">' + this.translate.instant('HERO_SECTION_SETTING.ACTIVE') + '</span>' :
            '<span class="badge status-rejected">' + this.translate.instant('HERO_SECTION_SETTING.INACTIVE') + '</span>';
        },
      },
    ];
  }

  private initializeRowActions(): void {
    this.rowActions = [
      {
        label: this.translate.instant('COMMON.VIEW'),
        icon: 'icon-frame-view',
        action: 'view',
      },
      {
        label: this.translate.instant('COMMON.EDIT'),
        icon: 'icon-frame-edit',
        action: 'edit',
      },
      {
        label: this.translate.instant('COMMON.DELETE'),
        icon: 'icon-frame-delete',
        action: 'delete',
      },
    ];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    // Cleanup if needed
  }

  loadHeroSectionSettings(): void {
    this.isLoading = true;
    this.spinnerService.show();

    const request: GetAllHeroSectionSettingRequestDto = {
      skip: this.currentPage * this.pageSize,
      take: this.pageSize,
      searchValue: this.searchValue,
    };

    this.heroSectionSettingService.getAll(request).subscribe({
      next: (response) => {
        this.heroSectionSettings = response.data || [];
        this.totalCount = response.totalCount || 0;
        this.isLoading = false;
        this.spinnerService.hide();
      },
      error: (error) => {
        console.error('Error loading hero section settings:', error);
        this.toastr.error(this.translate.instant('TOAST.FETCH_HERO_SECTION_SETTINGS'));
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }

  onSearch(searchText: string): void {
    this.searchValue = searchText;
    this.currentPage = 0;
    this.loadHeroSectionSettings();
  }

  onPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.currentPage = event.pageNumber - 1;
    this.pageSize = event.pageSize;
    this.loadHeroSectionSettings();
  }

  onActionClick(event: { action: string; row: any }): void {
    const heroSection = event.row as HeroSectionSettingDto;

    switch (event.action) {
      case 'view':
        this.openViewModal(heroSection);
        break;
      case 'edit':
        this.openEditModal(heroSection);
        break;
      case 'delete':
        this.deleteHeroSection(heroSection);
        break;
    }
  }

  openAddModal(): void {
    this.resetModalState('add').then(() => {
      this.heroSectionForm.enable();
      this.showModal();
    });
  }

  openEditModal(heroSection: HeroSectionSettingDto): void {
    // Fetch full hero section details including attachments
    this.heroSectionSettingService.getById(heroSection.id).subscribe({
      next: async (fullHeroSection: HeroSectionSettingDto) => {
        await this.resetModalState('edit', fullHeroSection);

        // If no attachment data, try to fetch it separately
        if (!fullHeroSection.attachment && heroSection.id) {
          this.fetchAttachmentData(heroSection.id);
        }

        this.populateForm(fullHeroSection);
        this.heroSectionForm.enable();
        this.showModal();
      },
      error: async (error) => {
        this.toastr.error(this.translate.instant('TOAST.FETCH_HERO_SECTION_SETTINGS'));
        // Fallback to using the hero section from the list
        await this.resetModalState('edit', heroSection);

        // If no attachment data, try to fetch it separately
        if (!heroSection.attachment && heroSection.id) {
          this.fetchAttachmentData(heroSection.id);
        }

        this.populateForm(heroSection);
        this.heroSectionForm.enable();
        this.showModal();
      },
    });
  }

  openViewModal(heroSection: HeroSectionSettingDto): void {
    // Fetch full hero section details including attachments
    this.heroSectionSettingService.getById(heroSection.id).subscribe({
      next: async (fullHeroSection: HeroSectionSettingDto) => {
        await this.resetModalState('view', fullHeroSection);

        // Always fetch fresh attachment data to ensure we get the latest image
        if (heroSection.id) {
          this.fetchAttachmentData(heroSection.id);
        }

        this.populateForm(fullHeroSection);
        this.heroSectionForm.disable();
        this.showModal();
      },
      error: async (error) => {
        this.toastr.error(this.translate.instant('TOAST.FETCH_HERO_SECTION_SETTINGS'));
        // Fallback to using the hero section from the list
        await this.resetModalState('view', heroSection);

        // Always fetch fresh attachment data even in fallback
        if (heroSection.id) {
          this.fetchAttachmentData(heroSection.id);
        }

        this.populateForm(heroSection);
        this.heroSectionForm.disable();
        this.showModal();
      },
    });
  }

  deleteHeroSection(heroSection: HeroSectionSettingDto): void {
    this.selectedHeroSectionToDelete = heroSection;
    this.showDeleteModal();
  }

  async submit(): Promise<void> {
    this.submitted = true;

    if (this.heroSectionForm.invalid) {
      this.toastr.error(this.translate.instant('TOAST.VALIDATION_ERROR'));
      return;
    }

    const heroSectionImageConfig = this.getHeroSectionImageConfig();
    const hasExistingAttachment = !!this.existingAttachment;
    const hasNewFile = this.selectedFile;

    if (heroSectionImageConfig) {
      if (this.mode === 'add' && !hasNewFile) {
        this.toastr.error(this.translate.instant('TOAST.HERO_SECTION_IMAGE_REQUIRED'));
        return;
      }
      if (this.mode === 'edit' && !hasExistingAttachment && !hasNewFile) {
        this.toastr.error(this.translate.instant('TOAST.HERO_SECTION_IMAGE_REQUIRED'));
        return;
      }
    }

    this.spinnerService.show();

    try {
      let attachmentDto: AttachmentBase64Dto | null = null;

      if (this.selectedFile && heroSectionImageConfig) {
        const fileBase64 = await this.fileToBase64(this.selectedFile);
        attachmentDto = {
          fileBase64,
          fileName: this.selectedFile.name,
          masterId:
            this.mode === 'edit' && this.editingHeroSectionId
              ? this.editingHeroSectionId
              : 0,
          attConfigID: heroSectionImageConfig.id,
        };
      }

      if (this.mode === 'add') {
        const createDto: CreateHeroSectionSettingDto = {
          ...this.heroSectionForm.value,
          attachment: attachmentDto,
        };

        this.heroSectionSettingService.create(createDto).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('TOAST.HERO_SECTION_CREATED'));
            this.hideModal();
            this.loadHeroSectionSettings();
            this.spinnerService.hide();
          },
          error: (error) => {
            console.error('Error creating hero section setting:', error);
            this.toastr.error(this.translate.instant('TOAST.CREATE_ERROR'));
            this.spinnerService.hide();
          },
        });
      } else if (this.mode === 'edit' && this.editingHeroSectionId) {
        const updateDto: UpdateHeroSectionSettingDto = {
          id: this.editingHeroSectionId,
          ...this.heroSectionForm.value,
          // Don't send attachment in hero section update since backend doesn't handle it
          attachment: undefined,
        };

        this.heroSectionSettingService.update(updateDto).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('TOAST.HERO_SECTION_UPDATED'));

            // Handle attachment update separately
            if (attachmentDto && this.existingAttachment) {
              this.updateAttachmentSeparately(attachmentDto);
            } else if (attachmentDto) {
              // Create new attachment
              this.createAttachmentSeparately(attachmentDto);
            } else {
              // No attachment change, just refresh the image
             // this.refreshImageAfterUpdate();
              this.hideModal();
              this.loadHeroSectionSettings();
              this.spinnerService.hide();
            }
          },
          error: (error) => {
            console.error('Error updating hero section setting:', error);
            this.toastr.error(this.translate.instant('TOAST.UPDATE_ERROR'));
            this.spinnerService.hide();
          },
        });
      }
    } catch (error) {
      console.error('Error in submit:', error);
      this.toastr.error(this.translate.instant('TOAST.ERROR_PROCESSING_FILE'));
      this.spinnerService.hide();
    }
  }



  confirmDelete(): void {
    if (!this.selectedHeroSectionToDelete) return;

    this.spinnerService.show();
    this.heroSectionSettingService.delete(this.selectedHeroSectionToDelete.id).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('TOAST.HERO_SECTION_DELETED'));
        this.hideDeleteModal();
        this.loadHeroSectionSettings();
        this.spinnerService.hide();
      },
      error: (error) => {
        console.error('Error deleting hero section setting:', error);
        this.toastr.error(this.translate.instant('TOAST.DELETE_ERROR'));
        this.spinnerService.hide();
      },
    });
  }

  deleteAttachment(): void {
    if (!this.existingAttachment) {
      this.toastr.warning(this.translate.instant('TOAST.NO_ATTACHMENT_TO_DELETE'));
      return;
    }

    this.selectedAttachmentToDelete = this.existingAttachment;
    this.showDeleteAttachmentModal();
  }

  showDeleteAttachmentModal(): void {
    const deleteAttachmentModal = document.getElementById(
      'deleteAttachmentModal'
    );
    if (deleteAttachmentModal) {
      const modal = new (window as any).bootstrap.Modal(deleteAttachmentModal);
      modal.show();
    }
  }

  closeDeleteAttachmentModal(): void {
    const deleteAttachmentModal = document.getElementById('deleteAttachmentModal');
    if (deleteAttachmentModal) {
      const modal = (window as any).bootstrap.Modal.getInstance(deleteAttachmentModal);
      if (modal) {
        modal.hide();
      }
    }
    this.selectedAttachmentToDelete = null;
  }

  confirmDeleteAttachment(): void {
    if (!this.selectedAttachmentToDelete) return;

    this.spinnerService.show();
    this.attachmentService
      .deleteAsync(this.selectedAttachmentToDelete.id)
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('TOAST.ATTACHMENT_DELETED_SUCCESSFULLY'));
          this.existingAttachment = null;
          this.existingImageUrl = null;
          this.selectedAttachmentToDelete = null;
          this.closeDeleteAttachmentModal();
          this.loadHeroSectionSettings();
          this.spinnerService.hide();
        },
        error: (error) => {
          this.toastr.error(this.translate.instant('TOAST.ERROR_DELETING_ATTACHMENT'));
          this.spinnerService.hide();
        },
      });
  }

  cancelDeleteAttachment(): void {
    this.selectedAttachmentToDelete = null;
  }

  clear(): void {
    this.searchValue = '';
    this.currentPage = 0;
    this.loadHeroSectionSettings();
  }

  // File upload methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    this.fileValidationErrors = [];
    this.fileValidationSuccess = false;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.fileValidationErrors.push(this.translate.instant('VALIDATION.INVALID_FILE_TYPE'));
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.fileValidationErrors.push(this.translate.instant('VALIDATION.FILE_TOO_LARGE'));
      return;
    }

    this.selectedFile = file;
    this.fileValidationSuccess = true;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.filePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
    this.fileValidationErrors = [];
    this.fileValidationSuccess = false;
  }

  removeExistingImage(): void {
    this.existingAttachment = null;
    this.existingImageUrl = null;
  }

  onImageError(event: any): void {
    console.error('Image load error:', event);
    // You can add error handling logic here
  }

  onImageLoad(event: any): void {
    // You can add success handling logic here
  }

  openImageInNewTab(): void {
    if (this.existingImageUrl) {
      window.open(this.existingImageUrl, '_blank');
    }
  }

  confirmFileSelection(): void {
    // This method can be used to confirm the file selection
    // For now, it just validates the file
    if (this.selectedFile && this.fileValidationSuccess) {
      this.toastr.success(this.translate.instant('TOAST.FILE_SELECTED_SUCCESSFULLY'));
    }
  }

  private prepareAttachmentForCreate(): AttachmentBase64Dto | undefined {
    if (!this.selectedFile || !this.filePreview) return undefined;

    // Get the hero section image config to get the correct attConfigID
    const heroSectionConfig = this.getHeroSectionImageConfig();
    const attConfigID = heroSectionConfig?.id || AttachmentsConfigType.HeroSection;

    return {
      fileName: this.selectedFile.name,
      fileBase64: this.filePreview.split(',')[1], // Remove data:image/...;base64, prefix
      masterId: 0, // This will be set by the backend
      attConfigID: attConfigID,
    };
  }

  private prepareAttachmentForUpdate(): AttachmentBase64Dto | undefined {
    if (!this.selectedFile || !this.filePreview) return undefined;

    // Get the hero section image config to get the correct attConfigID
    const heroSectionConfig = this.getHeroSectionImageConfig();
    const attConfigID = heroSectionConfig?.id || AttachmentsConfigType.HeroSection;

    return {
      fileName: this.selectedFile.name,
      fileBase64: this.filePreview.split(',')[1], // Remove data:image/...;base64, prefix
      masterId: this.editingHeroSectionId || 0,
      attConfigID: attConfigID,
    };
  }

  /**
   * Updates an existing attachment separately from the hero section update
   */
  private updateAttachmentSeparately(attachmentDto: AttachmentBase64Dto): void {
    if (!this.existingAttachment?.masterId) {
      this.spinnerService.hide();
      return;
    }

    const updateAttachmentDto: UpdateAttachmentBase64Dto = {
      id: this.existingAttachment.id,
      fileBase64: attachmentDto.fileBase64,
      fileName: attachmentDto.fileName,
      masterId: attachmentDto.masterId,
      attConfigID: attachmentDto.attConfigID,
    };

    this.attachmentService.updateAsync(updateAttachmentDto).subscribe({
      next: (response) => {
        this.toastr.success(this.translate.instant('TOAST.IMAGE_UPDATED_SUCCESSFULLY'));
      //  this.refreshImageAfterUpdate();
        this.hideModal();
        this.loadHeroSectionSettings();
        this.spinnerService.hide();
      },
      error: (error) => {
        this.toastr.error(this.translate.instant('TOAST.ERROR_UPDATING_IMAGE'));
        this.spinnerService.hide();
      },
    });
  }

  /**
   * Creates a new attachment separately from the hero section update
   */
  private createAttachmentSeparately(attachmentDto: AttachmentBase64Dto): void {
    this.attachmentService.saveAttachmentFileBase64(attachmentDto).subscribe({
      next: (response) => {
        this.toastr.success(this.translate.instant('TOAST.IMAGE_UPLOADED_SUCCESSFULLY'));
      //  this.refreshImageAfterUpdate();
        this.hideModal();
        this.loadHeroSectionSettings();
        this.spinnerService.hide();
      },
      error: (error) => {
        this.toastr.error(this.translate.instant('TOAST.ERROR_UPLOADING_IMAGE'));
        this.spinnerService.hide();
      },
    });
  }

  /**
   * Manually refreshes the image display after updates
   */
  private refreshImageAfterUpdate(): void {
    if (this.editingHeroSectionId) {
      // Clear current image
      this.existingImageUrl = null;

      // Fetch fresh attachment data
      this.attachmentService
        .getListByMasterId(
          this.editingHeroSectionId,
          AttachmentsConfigType.HeroSection
        )
        .subscribe({
          next: (attachments: AttachmentDto[]) => {
            if (attachments && attachments.length > 0) {
              this.existingAttachment = attachments[0];
              if (this.existingAttachment?.imgPath) {
                // Force refresh with new timestamp
                this.forceRefreshImage();
              }
            }
          },
          error: (error) => {
            // Error refreshing image after update
          },
        });
    }
  }

  /**
   * Forces refresh of the image by adding a timestamp
   */
  private forceRefreshImage(): void {
    if (this.existingAttachment?.imgPath) {
      const imageUrl = this.constructImageUrl(this.existingAttachment.imgPath);
      this.existingImageUrl = imageUrl;
    }
  }

  /**
   * Converts a file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  private async resetModalState(
    mode: 'add' | 'edit' | 'view',
    heroSection?: HeroSectionSettingDto
  ): Promise<void> {
    this.mode = mode;
    this.editingHeroSectionId = heroSection?.id || null;
    this.currentViewHeroSection = heroSection || null;
    this.submitted = false;
    this.selectedFile = null;
    this.filePreview = null;
    this.existingAttachment = heroSection?.attachment || null;
    this.existingImageUrl = null;
    this.selectedAttachmentToDelete = null;
    this.isDragOver = false;
    this.uploadProgress = 0;
    this.fileValidationErrors = [];
    this.fileValidationSuccess = false;

    if (mode === 'add') {
      this.heroSectionForm.reset({ isActive: true, viewOrder: 0 });
    }

    if (this.existingAttachment?.imgPath) {
      // Improved image URL construction with validation
      const imageUrl = this.constructImageUrl(this.existingAttachment.imgPath);

      // Validate the image URL before setting it
      const isValid = await this.validateImageUrl(imageUrl);
      if (isValid) {
        this.existingImageUrl = imageUrl;
      } else {
        this.existingImageUrl = null;
      }
    }
  }

  private populateForm(heroSection: HeroSectionSettingDto): void {
    this.heroSectionForm.patchValue({
      titleAr: heroSection.titleAr,
      titleEn: heroSection.titleEn,
      descriptionAr: heroSection.descriptionAr,
      descriptionEn: heroSection.descriptionEn,
      link: heroSection.link,
      isActive: heroSection.isActive,
      viewOrder: heroSection.viewOrder,
    });
  }

  private fetchAttachmentData(heroSectionId: number): void {
    // This method can be implemented if you need to fetch attachment data separately
    // For now, we'll use the attachment data that comes with the hero section
  }

  private async validateImageUrl(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
  }

  private constructImageUrl(imgPath: string): string {
    if (!imgPath) return '';

    // Remove leading slash if present to avoid double slashes
    const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;

    // If the path already contains http/https, return as is
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }

    let fullUrl: string;

    // Check if the path starts with 'Uploads' - if so, construct URL without /api
    if (cleanPath.startsWith('Uploads/')) {
      const baseUrl = environment.apiBaseUrl.replace('/api', '');
      fullUrl = `${baseUrl}/${cleanPath}`;
    } else {
      // For other paths, use the full API base URL
      fullUrl = `${environment.apiBaseUrl}/${cleanPath}`;
    }

    // Add cache-busting parameter to prevent browser caching
    const cacheBuster = `?t=${Date.now()}`;
    const urlWithCacheBuster = `${fullUrl}${cacheBuster}`;

    return urlWithCacheBuster;
  }

  private resetFileUpload(): void {
    this.selectedFile = null;
    this.filePreview = null;
    this.existingAttachment = null;
    this.existingImageUrl = null;
    this.fileValidationErrors = [];
    this.fileValidationSuccess = false;
    this.isDragOver = false;
  }

  // Modal methods
  private showModal(): void {
    const modal = document.getElementById('heroSectionModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  private hideModal(): void {
    const modal = document.getElementById('heroSectionModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    this.heroSectionForm.enable();
    this.resetFileUpload();
  }

  private showDeleteModal(): void {
    const modal = document.getElementById('deleteModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  private hideDeleteModal(): void {
    const modal = document.getElementById('deleteModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    this.selectedHeroSectionToDelete = null;
  }

  getFieldError(fieldName: string): string {
    const field = this.heroSectionForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return this.translate.instant('VALIDATION.REQUIRED');
      if (field.errors['minlength'])
        return this.translate.instant('VALIDATION.MIN_LENGTH', { min: field.errors['minlength'].requiredLength });
      if (field.errors['maxlength'])
        return this.translate.instant('VALIDATION.MAX_LENGTH', { max: field.errors['maxlength'].requiredLength });
      if (field.errors['min'])
        return this.translate.instant('VALIDATION.MIN_VALUE', { min: field.errors['min'].min });
      if (field.errors['pattern'])
        return this.translate.instant('VALIDATION.INVALID_URL');
    }
    return '';
  }

  loadAttachmentsConfig(): void {
    this.isLoadingDropdowns = true;
    this.attachmentService
      .getAttachmentsConfigByType(AttachmentsConfigType.HeroSection)
      .subscribe({
        next: (result: AttachmentsConfigDto[]) => {
          this.attachmentConfigs = result || [];
          this.isLoadingDropdowns = false;
        },
        error: (error: any) => {
          this.toastr.error('Error loading attachment configuration');
          this.attachmentConfigs = [];
          this.isLoadingDropdowns = false;
        },
      });
  }

  private getHeroSectionImageConfig(): AttachmentsConfigDto | undefined {
    const config = this.attachmentConfigs.find(
      (config) =>
        config.attachmentsConfigType === AttachmentsConfigType.HeroSection
    );
    
    if (config) {
    }
    
    return config;
  }
}
