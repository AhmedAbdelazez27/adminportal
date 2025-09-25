import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ColDef } from 'ag-grid-community';
import { NgSelectModule } from '@ng-select/ng-select';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { AttachmentGalleryComponent } from '../../../../shared/attachment-gallery/attachment-gallery.component';
import { InitiativeService } from '../../../core/services/UserSetting/initiative.service';
import { AttachmentService } from '../../../core/services/attachments/attachment.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { environment } from '../../../../environments/environment';
import {
  InitiativeDto,
  CreateInitiativeDto,
  UpdateInitiativeDto,
  GetAllInitiativeParameter,
  InitiativeDetailsDto,
  CreateInitiativeDetailsDto,
  UpdateInitiativeDetailsDto,
  FilterById,
} from '../../../core/dtos/UserSetting/initiatives/initiative.dto';
import {
  AttachmentBase64Dto,
  AttachmentDto,
} from '../../../core/dtos/attachments/attachment.dto';
import { AttachmentDto as MainApplyServiceAttachmentDto } from '../../../core/dtos/mainApplyService/mainApplyService.dto';
import {
  AttachmentsConfigType,
  AttachmentsConfigDto,
} from '../../../core/dtos/attachments/attachments-config.dto';
import { UpdateAttachmentBase64Dto } from '../../../core/dtos/attachments/attachment.dto';
import * as L from 'leaflet';
import { QuillModule } from 'ngx-quill';
import Quill from 'quill';
import { Subscription } from 'rxjs';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-initiative-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
    GenericDataTableComponent,
    AttachmentGalleryComponent,
    QuillModule,
    AngularEditorModule 
  ],
  templateUrl: './initiative-component.component.html',
  styleUrl: './initiative-component.component.scss',
})
export class InitiativeComponentComponent implements OnInit, OnDestroy {
  initiatives: InitiativeDto[] = [];
  totalCount: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  searchValue: string = '';
  initiativeForm: FormGroup;
  submitted: boolean = false;
  mode: 'add' | 'edit' | 'view' = 'add';
  editingInitiativeId: number | null = null;
  selectedInitiativeToDelete: InitiativeDto | null = null;
  currentViewInitiative: InitiativeDto | null = null;
  isLoading: boolean = false;
  selectedAttachmentToDelete: AttachmentDto | null = null;

  // Attachment config and file upload
  attachmentConfigs: AttachmentsConfigDto[] = [];
  isLoadingDropdowns: boolean = false;
  selectedFile: File | null = null;
  filePreview: string | null = null;
  existingAttachment: AttachmentDto | null = null;
  existingImageUrl: string | null = null;
  isDragOver: boolean = false;
  uploadProgress: number = 0;
  fileValidationErrors: string[] = [];
  fileValidationSuccess: boolean = false;
  attachmentsForGallery: AttachmentDto[] = [];

  // Initiative Details variables (as FormArray within main form)
  initiativeDetails: CreateInitiativeDetailsDto[] = [];
  showDetailsSection: boolean = true;
  detailsForm: FormGroup;
  detailsMode: 'add' | 'edit' | 'view' = 'add';
  editingDetailIndex: number | null = null;
  selectedDetailToDelete: CreateInitiativeDetailsDto | null = null;
  selectedDetailIndex: number = -1;

  // Map variables for details
  detailsMap: any;
  detailsMarker: any;
  selectedCoordinates: { lat: number; lng: number } | null = null;
  customIcon: any;
  isMapLoading: boolean = false;
  addressFromCoordinates: string = '';

  // Modal instance
  initiativeModalInstance: any;

  // AG Grid column definitions
  columnDefs: ColDef[] = [];

  rowActions: any[] = [];

  // Details grid columns
  detailsColumnDefs: ColDef[] = [];

  detailsRowActions: any[] = [];

  private quill?: Quill;
  private langSub?: Subscription;

  quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      [{ direction: 'rtl' }],
      ['link', 'clean'],
    ],
  };

  constructor(
    private initiativeService: InitiativeService,
    private attachmentService: AttachmentService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    public translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.initiativeForm = this.fb.group({
      nameAr: ['', [Validators.required, Validators.minLength(2)]],
      nameEn: ['', [Validators.required, Validators.minLength(2)]],
      descriptionAr: ['', [Validators.required]],
      descriptionEn: ['', [Validators.required]],
      initiativeDate: ['', [Validators.required]],
      isActive: [true],
      targetGroup: ['', [Validators.required]],
      targetGroupEn: ['', [Validators.required]],
      initiativeDetails: this.fb.array([]),
    });

    this.detailsForm = this.fb.group({
      locationNameAr: ['', [Validators.required, Validators.minLength(2)]],
      locationNameEn: ['', [Validators.required, Validators.minLength(2)]],
      region: ['', [Validators.required, Validators.minLength(2)]],
      locationCoordinates: ['', [Validators.required]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.applyEditorDir();
    });

    this.initializeColumnDefinitions();
    this.loadInitiatives();
    this.loadAttachmentsConfig();
    this.fixLeafletIcons();
  }
  onQuillCreated(q: Quill) {
    this.quill = q;
    this.applyEditorDir();
  }

  private applyEditorDir() {
    if (!this.quill) return;
    const isAr = this.translate.currentLang === 'ar';
    const editorEl = this.quill.root as HTMLElement;
    editorEl.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    editorEl.style.textAlign = isAr ? 'right' : 'left';
  }

  private initializeColumnDefinitions(): void {
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
        field: 'nameAr',
        headerName:
          this.translate.instant('INITIATIVE.NAME_AR') ||
          'Initiative Name (Arabic)',
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        field: 'nameEn',
        headerName:
          this.translate.instant('INITIATIVE.NAME_EN') ||
          'Initiative Name (English)',
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        field: 'targetGroup',
        headerName:
          this.translate.instant('INITIATIVE.TARGET_GROUP_AR') ||
          'Target Group (Arabic)',
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        field: 'targetGroupEn',
        headerName:
          this.translate.instant('INITIATIVE.TARGET_GROUP_EN') ||
          'Target Group (English)',
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        field: 'initiativeDate',
        headerName:
          this.translate.instant('INITIATIVE.DATE') || 'Initiative Date',
        sortable: true,
        filter: true,
        width: 130,
        cellRenderer: (params: any) => {
          if (params.value) {
            const date = new Date(params.value);
            return date.toLocaleDateString();
          }
          return '';
        },
      },
      {
        field: 'isActive',
        headerName: this.translate.instant('COMMON.STATUS') || 'Status',
        width: 100,
        sortable: true,
        cellRenderer: (params: any) => {
          return params.value
            ? '<span class="status-active">' +
            (this.translate.instant('COMMON.ACTIVE') || 'Active') +
            '</span>'
            : '<span class="status-inactive">' +
            (this.translate.instant('COMMON.INACTIVE') || 'Inactive') +
            '</span>';
        },
      },
    ];

    this.detailsColumnDefs = [
      {
        headerName: '#',
        width: 80,
        sortable: false,
        valueGetter: (params: any) => params.node.rowIndex + 1,
      },
      {
        field: 'locationNameAr',
        headerName:
          this.translate.instant('INITIATIVE.LOCATION_NAME_AR') ||
          'Location Name (Arabic)',
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        field: 'locationNameEn',
        headerName:
          this.translate.instant('INITIATIVE.LOCATION_NAME_EN') ||
          'Location Name (English)',
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        field: 'region',
        headerName:
          this.translate.instant('INITIATIVE.RegionName') ||
          'Region Name',
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        field: 'locationCoordinates',
        headerName:
          this.translate.instant('INITIATIVE.COORDINATES') || 'Coordinates',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'isActive',
        headerName: this.translate.instant('COMMON.STATUS') || 'Status',
        width: 100,
        sortable: true,
        cellRenderer: (params: any) => {
          return params.value
            ? '<span class="status-active">' +
            (this.translate.instant('COMMON.ACTIVE') || 'Active') +
            '</span>'
            : '<span class="status-inactive">' +
            (this.translate.instant('COMMON.INACTIVE') || 'Inactive') +
            '</span>';
        },
      },
    ];

    this.rowActions = [
      {
        label: this.translate.instant('COMMON.VIEW') || 'View',
        action: 'view',
        icon: 'icon-frame-view',
      },
      {
        label: this.translate.instant('COMMON.EDIT') || 'Edit',
        action: 'edit',
        icon: 'icon-frame-edit',
      },
      {
        label: this.translate.instant('COMMON.DELETE') || 'Delete',
        action: 'delete',
        icon: 'icon-frame-delete',
      },
    ];


    this.detailsRowActions = [
      {
        label: this.translate.instant('COMMON.VIEW') || 'View',
        action: 'view',
        icon: 'icon-frame-view',
      },
      {
        label: this.translate.instant('COMMON.EDIT') || 'Edit',
        action: 'edit',
        icon: 'icon-frame-edit',
      },
      {
        label: this.translate.instant('COMMON.DELETE') || 'Delete',
        action: 'delete',
        icon: 'icon-frame-delete',
      },
    ];
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    // Reset loading state
    this.isMapLoading = false;

    if (this.detailsMap) {
      this.detailsMap.remove();
    }
  }

  fixLeafletIcons(): void {
    try {
      const iconDefault = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      L.Marker.prototype.options.icon = iconDefault;

      this.customIcon = L.icon({
        iconUrl:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
            <path d="M12,2A10,10 0 0,0 2,12C2,16.5 6,22.22 12,34C18,22.22 22,16.5 22,12A10,10 0 0,0 12,2Z" fill="#dc3545" stroke="#fff" stroke-width="2"/>
            <circle cx="12" cy="12" r="6" fill="#fff"/>
            <circle cx="12" cy="12" r="3" fill="#dc3545"/>
          </svg>
        `),
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36],
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [12, 41],
      });
    } catch (error) {
      // Error fixing Leaflet icons
    }
  }

  loadInitiatives(): void {
    this.isLoading = true;
    this.spinnerService.show();

    const params: GetAllInitiativeParameter = {
      skip: this.currentPage * this.pageSize,
      take: this.pageSize,
      searchValue: this.searchValue,
    };

    this.initiativeService.getAllAsync(params).subscribe({
      next: (data: any) => {
        const { items, totalCount } = this.normalizeResponse(data);
        this.initiatives = items;
        this.totalCount = totalCount;
        this.isLoading = false;
        this.spinnerService.hide();
      },
      error: (error: any) => {
        this.toastr.error(
          this.translate.instant(
            'INITIATIVE.MESSAGES.ERROR_LOADING_INITIATIVES'
          ) || 'Error loading initiatives'
        );
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }

  private loadAttachmentsConfig(): void {
    this.attachmentService
      .getAttachmentsConfigByType(AttachmentsConfigType.Initiative)
      .subscribe({
        next: (result: AttachmentsConfigDto[]) => {
          this.attachmentConfigs = result || [];
        },
        error: (error) => {
          this.toastr.error(
            this.translate.instant(
              'INITIATIVE.MESSAGES.ERROR_LOADING_ATTACHMENT_CONFIG'
            ) || 'Error loading attachment configuration'
          );
          this.attachmentConfigs = [];
        },
      });
  }

  private normalizeResponse(data: any): { items: any[]; totalCount: number } {
    if (data?.data) {
      return {
        items: data.data,
        totalCount: data.totalCount || data.total || data.data.length,
      };
    }
    if (data?.items) {
      return { items: data.items, totalCount: data.totalCount || 0 };
    }
    if (Array.isArray(data)) {
      return { items: data, totalCount: data.length };
    }
    if (data?.results) {
      return {
        items: data.results,
        totalCount: data.total || data.results.length,
      };
    }
    return { items: [], totalCount: 0 };
  }

  onPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.currentPage = event.pageNumber - 1;
    this.pageSize = event.pageSize;
    this.loadInitiatives();
  }

  onSearch(searchText?: string): void {
    if (searchText !== undefined) {
      this.searchValue = searchText;
    }
    this.currentPage = 0;
    this.loadInitiatives();
  }

  clear(): void {
    this.searchValue = '';
    this.currentPage = 0;
    this.loadInitiatives();
  }

  onActionClick(event: { action: string; row: any }): void {
    if (!event) {
      return;
    }

    const initiative = event.row as InitiativeDto;
   
    switch (event.action) {
      case 'view':
        this.openViewModal(initiative);
        break;
      case 'edit':
        this.openEditModal(initiative);
        break;
      case 'delete':
        this.selectInitiativeToDelete(initiative);
        break;
      default:
        console.warn('⚠️ Unknown action:', event.action);
    }
  }

  openAddModal(): void {
    this.resetModalState('add').then(() => {
      this.initiativeForm.enable();
      this.showModal();
    });
  }

  openEditModal(initiative: InitiativeDto): void {
    const params: FilterById = {
      id: initiative.id,
      regionName: null,
    };
    this.initiativeService.getById(params).subscribe({
      next: async (fullInitiative: InitiativeDto) => {
        await this.resetModalState('edit', fullInitiative);

        if (!fullInitiative.attachment && initiative.id) {
          this.fetchAttachmentData(initiative.id);
        }

        this.populateForm(fullInitiative);
        this.initiativeForm.enable();
        this.showModal();
      },
      error: async (error) => {
        this.toastr.error(
          this.translate.instant(
            'INITIATIVE.MESSAGES.ERROR_LOADING_INITIATIVE_DETAILS'
          ) || 'Error loading initiative details'
        );
        await this.resetModalState('edit', initiative);

        if (!initiative.attachment && initiative.id) {
          this.fetchAttachmentData(initiative.id);
        }

        this.populateForm(initiative);
        this.initiativeForm.enable();
        this.showModal();
      },
    });
  }

  openViewModal(initiative: InitiativeDto): void {
    const params: FilterById = {
      id: initiative.id,
      regionName: null,
    };
    this.initiativeService.getById(params).subscribe({
      next: async (fullInitiative: InitiativeDto) => {
        await this.resetModalState('view', fullInitiative);

        if (initiative.id) {
          this.fetchAttachmentData(initiative.id);
        }

        this.populateForm(fullInitiative);
        this.initiativeForm.disable();
        this.showModal();
      },
      error: async (error) => {
        this.toastr.error(
          this.translate.instant(
            'INITIATIVE.MESSAGES.ERROR_LOADING_INITIATIVE_DETAILS'
          ) || 'Error loading initiative details'
        );
        await this.resetModalState('view', initiative);

        if (initiative.id) {
          this.fetchAttachmentData(initiative.id);
        }

        this.populateForm(initiative);
        this.initiativeForm.disable();
        this.showModal();
      },
    });
  }

  private async resetModalState(
    mode: 'add' | 'edit' | 'view',
    initiative?: InitiativeDto
  ): Promise<void> {
    this.mode = mode;
    this.editingInitiativeId = initiative?.id || null;
    this.currentViewInitiative = initiative || null;
    this.submitted = false;
    this.selectedFile = null;
    this.filePreview = null;
    this.existingAttachment = initiative?.attachment || null;
    this.existingImageUrl = null;
    this.selectedAttachmentToDelete = null;
    this.isDragOver = false;
    this.uploadProgress = 0;
    this.fileValidationErrors = [];
    this.fileValidationSuccess = false;
    this.attachmentsForGallery = [];

    if (mode === 'add') {
      this.initiativeForm.reset({ isActive: true });
      // Clear initiative details FormArray
      while (this.initiativeDetailsFormArray.length !== 0) {
        this.initiativeDetailsFormArray.removeAt(0);
      }
    }

    if (this.existingAttachment?.imgPath) {
      const imageUrl = this.constructImageUrl(this.existingAttachment.imgPath);
      const isValid = await this.validateImageUrl(imageUrl);
      if (isValid) {
        this.existingImageUrl = imageUrl;
      } else {
        this.existingImageUrl = null;
      }
    }
  }

  private constructImageUrl(imgPath: string): string {
    if (!imgPath) {
      return '';
    }

    const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;

    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }

    let fullUrl: string;

    if (cleanPath.startsWith('Uploads/')) {
      const baseUrl = environment.apiBaseUrl.replace('/api', '');
      fullUrl = `${baseUrl}/${cleanPath}`;
    } else {
      fullUrl = `${environment.apiBaseUrl}/${cleanPath}`;
    }

    const cacheBuster = `?t=${Date.now()}`;
    const finalUrl = `${fullUrl}${cacheBuster}`;

    return finalUrl;
  }

  private validateImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  private fetchAttachmentData(initiativeId: number): void {
    if (!initiativeId) return;

    this.attachmentService
      .getListByMasterId(initiativeId, AttachmentsConfigType.Initiative)
      .subscribe({
        next: async (attachments: AttachmentDto[]) => {
          if (attachments && attachments.length > 0) {
            this.existingAttachment = attachments[0];
            this.attachmentsForGallery = attachments;

            if (this.existingAttachment?.imgPath) {
              this.forceRefreshImage();
            }
          } else {
            this.existingAttachment = null;
            this.existingImageUrl = null;
            this.attachmentsForGallery = [];
          }
        },
        error: (error) => {
          this.attachmentsForGallery = [];
        },
      });
  }

  private forceRefreshImage(): void {
    if (this.existingAttachment?.imgPath) {
      const oldUrl = this.existingImageUrl;
      this.existingImageUrl = null;

      if (oldUrl) {
        this.clearImageCache(oldUrl);
      }

      setTimeout(() => {
        const imageUrl = this.constructImageUrl(
          this.existingAttachment!.imgPath!
        );
        this.existingImageUrl = imageUrl;
      }, 200);
    }
  }

  private clearImageCache(imageUrl: string): void {
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.open(cacheName).then((cache) => {
            cache.delete(imageUrl);
          });
        });
      });
    }
  }

  private convertToMainApplyServiceAttachmentDto(
    attachment: AttachmentDto
  ): MainApplyServiceAttachmentDto {
    return {
      id: attachment.id,
      masterId: attachment.masterId,
      imgPath: attachment.imgPath,
      masterType: attachment.masterType,
      attachmentTitle: attachment.attachmentTitle,
      lastModified: attachment.lastModified || null,
      lastModifiedstr: attachment.lastModified
        ? attachment.lastModified.toISOString()
        : null,
      attConfigID: attachment.attConfigID,
      attachmentBinary: null,
    };
  }

  private convertToGalleryAttachmentDto(
    attachment: MainApplyServiceAttachmentDto
  ): AttachmentDto {
    return {
      id: attachment.id || 0, // Ensure id is always a number
      masterId: attachment.masterId || undefined,
      imgPath: attachment.imgPath || undefined,
      masterType: attachment.masterType || undefined,
      attachmentTitle: attachment.attachmentTitle || undefined,
      lastModified: attachment.lastModified || undefined,
      attConfigID: attachment.attConfigID || undefined,
    };
  }

  private populateForm(initiative: InitiativeDto): void {
    this.initiativeForm.patchValue({
      nameAr: initiative.nameAr,
      nameEn: initiative.nameEn,
      descriptionAr: initiative.descriptionAr,
      descriptionEn: initiative.descriptionEn,
      initiativeDate: initiative.initiativeDate
        ? new Date(initiative.initiativeDate).toISOString().split('T')[0]
        : '',
      isActive: initiative.isActive,
      targetGroup: initiative.targetGroup,
      targetGroupEn: initiative.targetGroupEn,
    });

    // Clear existing initiative details
    while (this.initiativeDetailsFormArray.length !== 0) {
      this.initiativeDetailsFormArray.removeAt(0);
    }

    // Populate initiative details if available
    if (
      initiative.initiativeDetails &&
      initiative.initiativeDetails.length > 0
    ) {
      initiative.initiativeDetails.forEach((detail) => {
        const detailForm = this.fb.group({
          locationNameAr: [
            detail.locationNameAr,
            [Validators.required, Validators.minLength(2)],
          ],
          locationNameEn: [
            detail.locationNameEn,
            [Validators.required, Validators.minLength(2)],
          ],
          region: [
            detail.region,
            [Validators.required, Validators.minLength(2)],
          ],
          locationCoordinates: [
            detail.locationCoordinates,
            [Validators.required],
          ],
          isActive: [detail.isActive],
        });
        this.initiativeDetailsFormArray.push(detailForm);
      });
    }
  }

  private showModal(): void {
    const modal = document.getElementById('initiativeModal');
    if (modal) {
      this.initiativeModalInstance = new (window as any).bootstrap.Modal(modal);
      this.initiativeModalInstance.show();
    }
  }

  closeModal(): void {
    this.resetModalState('add').then(() => {
      this.initiativeForm.enable();
    });

    // Close the main initiative modal using stored instance
    if (this.initiativeModalInstance) {
      this.initiativeModalInstance.hide();
      this.initiativeModalInstance = null;
    } else {
      // Fallback: try to get instance from DOM
      const initiativeModal = document.getElementById('initiativeModal');
      if (initiativeModal) {
        const modal = (window as any).bootstrap.Modal.getInstance(
          initiativeModal
        );
        if (modal) {
          modal.hide();
        }
      }
    }
  }

  closeDeleteAttachmentModal(): void {
    // Close only the delete attachment modal
    const deleteAttachmentModal = document.getElementById(
      'deleteAttachmentModal'
    );
    if (deleteAttachmentModal) {
      const modal = new (window as any).bootstrap.Modal(deleteAttachmentModal);
      modal.hide();
    }
  }

  // File upload methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.validateAndSetFile(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
    this.fileValidationErrors = [];
    this.fileValidationSuccess = false;
    this.uploadProgress = 0;
    const fileInput = document.getElementById(
      'initiativeImage'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  removeExistingImage(): void {
    this.selectedAttachmentToDelete = this.existingAttachment;
    const deleteModal = document.getElementById('deleteAttachmentModal');
    if (deleteModal) {
      const modal = new (window as any).bootstrap.Modal(deleteModal);
      modal.show();
    }
  }

  confirmDeleteAttachment(): void {
    if (!this.selectedAttachmentToDelete) return;

    this.spinnerService.show();
    this.attachmentService
      .deleteAsync(this.selectedAttachmentToDelete.id)
      .subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('INITIATIVE.MESSAGES.ATTACHMENT_DELETED') ||
            'Attachment deleted successfully'
          );
          this.existingAttachment = null;
          this.existingImageUrl = null;
          this.selectedAttachmentToDelete = null;
          this.closeDeleteAttachmentModal();
          this.loadInitiatives();
          this.spinnerService.hide();
        },
        error: (error) => {
          this.toastr.error(
            this.translate.instant(
              'INITIATIVE.MESSAGES.ERROR_DELETING_ATTACHMENT'
            ) || 'Error deleting attachment'
          );
          this.spinnerService.hide();
        },
      });
  }

  cancelDeleteAttachment(): void {
    this.selectedAttachmentToDelete = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.validateAndSetFile(file);
    }
  }

  private validateAndSetFile(file: File): void {
    this.fileValidationErrors = [];
    this.fileValidationSuccess = false;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      this.fileValidationErrors.push(
        this.translate.instant('INITIATIVE.FILE_UPLOAD.INVALID_FILE_TYPE') ||
        'Invalid file type. Only PDF, JPG, and PNG files are allowed.'
      );
      return;
    }

    if (file.size > maxSize) {
      this.fileValidationErrors.push(
        this.translate.instant('INITIATIVE.FILE_UPLOAD.FILE_SIZE_ERROR') ||
        'File size must be less than 2MB.'
      );
      return;
    }

    this.selectedFile = file;
    this.fileValidationSuccess = true;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.filePreview = null;
    }

    if (this.mode === 'edit' && this.existingImageUrl) {
      this.toastr.info(
        this.translate.instant('INITIATIVE.FILE_UPLOAD.NEW_IMAGE_SELECTED') ||
        'New image selected. This will replace the current image when you save.'
      );
    }
  }

  onImageLoad(event: any): void {
    // Image loaded successfully
  }

  onImageError(event: any): void {
    const imgElement = event.target;
    if (imgElement) {
      imgElement.style.display = 'none';
      this.existingImageUrl = null;
    }
    this.toastr.error(
      this.translate.instant('INITIATIVE.FILE_UPLOAD.IMAGE_LOAD_ERROR') ||
      'Failed to load image. The image file may not exist or the server may be unavailable.',
      'Image Load Error'
    );
  }

  openImageInNewTab(): void {
    if (this.existingImageUrl) {
      window.open(this.existingImageUrl, '_blank');
    }
  }

  // Continue with submit and other methods...
  async submit(): Promise<void> {
    this.submitted = true;

    if (this.initiativeForm.invalid) return;

    const initiativeImageConfig = this.getInitiativeImageConfig();
    const hasExistingAttachment = !!this.existingAttachment;
    const hasNewFile = this.selectedFile;

    if (initiativeImageConfig) {
      if (this.mode === 'add' && !hasNewFile) {
        this.toastr.error(
          this.translate.instant('INITIATIVE.FILE_UPLOAD.IMAGE_REQUIRED') ||
          'Initiative image is required'
        );
        return;
      }
      if (this.mode === 'edit' && !hasExistingAttachment && !hasNewFile) {
        this.toastr.error(
          this.translate.instant('INITIATIVE.FILE_UPLOAD.IMAGE_REQUIRED') ||
          'Initiative image is required'
        );
        return;
      }
    }

    this.spinnerService.show();

    try {
      let attachmentDto: AttachmentBase64Dto | null = null;

      if (this.selectedFile && initiativeImageConfig) {
        const fileBase64 = await this.fileToBase64(this.selectedFile);
        attachmentDto = {
          fileBase64,
          fileName: this.selectedFile.name,
          masterId:
            this.mode === 'edit' && this.editingInitiativeId
              ? this.editingInitiativeId
              : 0,
          attConfigID: initiativeImageConfig.id,
        };
      }

      if (this.mode === 'add') {
        const formValue = this.initiativeForm.value;
        const createDto: CreateInitiativeDto = {
          nameAr: formValue.nameAr,
          nameEn: formValue.nameEn,
          descriptionAr: formValue.descriptionAr,
          descriptionEn: formValue.descriptionEn,
          initiativeDate: formValue.initiativeDate,
          isActive: formValue.isActive,
          targetGroup: formValue.targetGroup,
          targetGroupEn: formValue.targetGroupEn,
          attachment: attachmentDto || undefined,
          initiativeDetails: formValue.initiativeDetails || [],
        };

        this.initiativeService.createAsync(createDto).subscribe({
          next: () => {
            this.toastr.success(
              this.translate.instant(
                'INITIATIVE.MESSAGES.INITIATIVE_CREATED'
              ) || 'Initiative created successfully'
            );
            this.closeModal();
            this.loadInitiatives();
            this.spinnerService.hide();
          },
          error: (error) => {
            this.toastr.error(
              this.translate.instant(
                'INITIATIVE.MESSAGES.ERROR_CREATING_INITIATIVE'
              ) || 'Error creating initiative'
            );
            this.spinnerService.hide();
          },
        });
      } else if (this.mode === 'edit' && this.editingInitiativeId) {
        const formValue = this.initiativeForm.value;
        const updateDto: UpdateInitiativeDto = {
          id: this.editingInitiativeId,
          nameAr: formValue.nameAr,
          nameEn: formValue.nameEn,
          descriptionAr: formValue.descriptionAr,
          descriptionEn: formValue.descriptionEn,
          initiativeDate: formValue.initiativeDate,
          isActive: formValue.isActive,
          targetGroup: formValue.targetGroup,
          targetGroupEn: formValue.targetGroupEn,
          attachment: undefined,
          initiativeDetails: formValue.initiativeDetails || [],
        };

        this.initiativeService.updateAsync(updateDto).subscribe({
          next: () => {
            this.toastr.success(
              this.translate.instant(
                'INITIATIVE.MESSAGES.INITIATIVE_UPDATED'
              ) || 'Initiative updated successfully'
            );

            if (attachmentDto && this.existingAttachment) {
              this.updateAttachmentSeparately(attachmentDto);
            } else if (attachmentDto) {
              this.createAttachmentSeparately(attachmentDto);
            } else {
              this.refreshImageAfterUpdate();
              this.closeModal();
              this.loadInitiatives();
              this.spinnerService.hide();
            }
          },
          error: (error) => {
            this.toastr.error(
              this.translate.instant(
                'INITIATIVE.MESSAGES.ERROR_UPDATING_INITIATIVE'
              ) || 'Error updating initiative'
            );
            this.spinnerService.hide();
          },
        });
      }
    } catch (error) {
      this.toastr.error(
        this.translate.instant('INITIATIVE.MESSAGES.ERROR_PROCESSING_FILE') ||
        'Error processing file'
      );
      this.spinnerService.hide();
    }
  }

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
        this.toastr.success(
          this.translate.instant('INITIATIVE.MESSAGES.IMAGE_UPDATED') ||
          'Image updated successfully'
        );
        this.refreshImageAfterUpdate();
        this.closeModal();
        this.loadInitiatives();
        this.spinnerService.hide();
      },
      error: (error) => {
        this.toastr.error(
          this.translate.instant('INITIATIVE.MESSAGES.ERROR_UPDATING_IMAGE') ||
          'Error updating image'
        );
        this.spinnerService.hide();
      },
    });
  }

  private createAttachmentSeparately(attachmentDto: AttachmentBase64Dto): void {
    this.attachmentService.saveAttachmentFileBase64(attachmentDto).subscribe({
      next: (response) => {
        this.toastr.success(
          this.translate.instant('INITIATIVE.MESSAGES.IMAGE_UPLOADED') ||
          'Image uploaded successfully'
        );
        this.refreshImageAfterUpdate();
        this.closeModal();
        this.loadInitiatives();
        this.spinnerService.hide();
      },
      error: (error) => {
        this.toastr.error(
          this.translate.instant('INITIATIVE.MESSAGES.ERROR_UPLOADING_IMAGE') ||
          'Error uploading image'
        );
        this.spinnerService.hide();
      },
    });
  }

  private refreshImageAfterUpdate(): void {
    if (this.editingInitiativeId) {
      this.existingImageUrl = null;

      this.attachmentService
        .getListByMasterId(
          this.editingInitiativeId,
          AttachmentsConfigType.Initiative
        )
        .subscribe({
          next: (attachments: AttachmentDto[]) => {
            if (attachments && attachments.length > 0) {
              this.existingAttachment = attachments[0];
              this.attachmentsForGallery = attachments;
              if (this.existingAttachment?.imgPath) {
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

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  private getInitiativeImageConfig(): any {
    return this.attachmentConfigs.find(
      (config) =>
        config.attachmentsConfigType === AttachmentsConfigType.Initiative
    );
  }

  selectInitiativeToDelete(initiative: InitiativeDto): void {
    try {
      this.selectedInitiativeToDelete = initiative;

      // Directly call delete without confirm or modal
      this.deleteInitiative();
    } catch (error) {
      console.error('💥 Error in selectInitiativeToDelete:', error);
    }
  }

  deleteInitiative(): void {

    if (!this.selectedInitiativeToDelete) {
      console.error('❌ No initiative selected for deletion');
      return;
    }
    this.spinnerService.show();
    this.initiativeService
      .deleteAsync(this.selectedInitiativeToDelete.id)
      .subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('INITIATIVE.MESSAGES.INITIATIVE_DELETED') ||
            'Initiative deleted successfully'
          );
          this.selectedInitiativeToDelete = null;
          this.loadInitiatives();
          this.spinnerService.hide();
        },
        error: (error) => {
          console.error('❌ Delete failed:', error);
          this.toastr.error(
            this.translate.instant(
              'INITIATIVE.MESSAGES.ERROR_DELETING_INITIATIVE'
            ) || 'Error deleting initiative'
          );
          this.spinnerService.hide();
        },
      });
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.initiativeForm.get(fieldName);
    return field
      ? field.invalid && (field.dirty || field.touched || this.submitted)
      : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.initiativeForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required'])
        return (
          this.translate.instant('INITIATIVE.MESSAGES.FIELD_REQUIRED') ||
          'This field is required'
        );
      if (field.errors['minlength'])
        return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    }
    return '';
  }

  hasFormErrors(): boolean {
    return this.initiativeForm.invalid && this.submitted;
  }

  getTotalErrors(): number {
    let errorCount = 0;
    Object.keys(this.initiativeForm.controls).forEach((key) => {
      const control = this.initiativeForm.get(key);
      if (control?.errors) {
        errorCount++;
      }
    });
    return errorCount;
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.initiativeForm.get(fieldName);
    return field ? field.valid && field.touched && !field.pristine : false;
  }

  onFieldBlur(fieldName: string): void {
    const field = this.initiativeForm.get(fieldName);
    if (field) {
      field.markAsTouched();
    }
  }

  // FormArray helper methods
  get initiativeDetailsFormArray(): FormArray {
    return this.initiativeForm.get('initiativeDetails') as FormArray;
  }

  addInitiativeDetail(): void {
    const detailForm = this.fb.group({
      locationNameAr: ['', [Validators.required, Validators.minLength(2)]],
      locationNameEn: ['', [Validators.required, Validators.minLength(2)]],
      region: ['', [Validators.required, Validators.minLength(2)]],
      locationCoordinates: ['', [Validators.required]],
      isActive: [true],
    });
    this.initiativeDetailsFormArray.push(detailForm);
  }

  removeInitiativeDetail(index: number): void {
    this.initiativeDetailsFormArray.removeAt(index);
  }

  editInitiativeDetail(index: number): void {
    this.detailsMode = 'edit';
    this.editingDetailIndex = index;
    const detail = this.initiativeDetailsFormArray.at(index).value;
    this.detailsForm.patchValue(detail);

    if (detail.locationCoordinates) {
      this.parseCoordinates(detail.locationCoordinates);
    }

    this.showDetailModal();
  }

  saveInitiativeDetail(): void {
    if (this.detailsForm.invalid) return;

    const detailValue = this.detailsForm.value;

    if (this.editingDetailIndex !== null) {
      // Update existing detail
      this.initiativeDetailsFormArray
        .at(this.editingDetailIndex)
        .patchValue(detailValue);
      this.editingDetailIndex = null;
    } else {
      // Add new detail
      const detailForm = this.fb.group({
        locationNameAr: [
          detailValue.locationNameAr,
          [Validators.required, Validators.minLength(2)],
        ],
        locationNameEn: [
          detailValue.locationNameEn,
          [Validators.required, Validators.minLength(2)],
        ],
        region: [
          detailValue.region,
          [Validators.required, Validators.minLength(2)],
        ],
        locationCoordinates: [
          detailValue.locationCoordinates,
          [Validators.required],
        ],
        isActive: [detailValue.isActive],
      });
      this.initiativeDetailsFormArray.push(detailForm);
    }

    this.closeDetailModal();
  }

  openAddDetailModal(): void {
    this.detailsMode = 'add';
    this.editingDetailIndex = null;
    this.selectedCoordinates = null;
    this.detailsForm.reset({ isActive: true });
    this.detailsForm.enable();
    this.showDetailModal();
  }

  private showDetailModal(): void {
    const modal = document.getElementById('detailModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();

      modal.addEventListener(
        'shown.bs.modal',
        () => {
          setTimeout(() => this.initDetailsMap(), 200);
        },
        { once: true }
      );

      // Reset loading state when modal is hidden
      modal.addEventListener(
        'hidden.bs.modal',
        () => {
          this.isMapLoading = false;
        },
        { once: true }
      );
    }
  }

  // Map functionality for details
  private parseCoordinates(coordinates: string): void {
    if (!coordinates) return;

    try {
      const coords = JSON.parse(coordinates);
      this.selectedCoordinates = coords;
    } catch {
      try {
        const [lat, lng] = coordinates.split('/').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          this.selectedCoordinates = { lat, lng };
        }
      } catch {
        // Invalid coordinates format
      }
    }
  }

  initDetailsMap(): void {
    try {
      if (typeof L === 'undefined') {
        this.toastr.error(
          this.translate.instant('INITIATIVE.MAP.MAP_LIBRARY_ERROR') ||
          'Map library not loaded. Please refresh the page.'
        );
        return;
      }

      // Set loading state to true when starting map initialization
      this.isMapLoading = true;

      setTimeout(() => {
        const mapElement = document.getElementById('detailsMap');
        if (!mapElement) {
          this.isMapLoading = false;
          return;
        }

        if (this.detailsMap) {
          try {
            this.detailsMap.remove();
          } catch (e) {
            // Error removing map
          }
          this.detailsMap = null;
        }

        const defaultLat = 25.2048;
        const defaultLng = 55.2708;

        this.detailsMap = L.map('detailsMap', {
          center: [defaultLat, defaultLng],
          zoom: 13,
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          touchZoom: true,
          maxZoom: 18,
          minZoom: 3,
        });

        const tileLayer = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            minZoom: 3,
            subdomains: ['a', 'b', 'c'],
            errorTileUrl:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          }
        );

        tileLayer.addTo(this.detailsMap);

        if (this.selectedCoordinates) {
          this.addMarkerToDetailsMap(
            this.selectedCoordinates.lat,
            this.selectedCoordinates.lng
          );
          this.detailsMap.setView(
            [this.selectedCoordinates.lat, this.selectedCoordinates.lng],
            15
          );
        }

        if (this.detailsMode !== 'view') {
          this.detailsMap.on('click', (e: any) => {
            const lat = parseFloat(e.latlng.lat.toFixed(6));
            const lng = parseFloat(e.latlng.lng.toFixed(6));
            this.addMarkerToDetailsMap(lat, lng);
            this.updateDetailsCoordinates(lat, lng);
          });
        }

        setTimeout(() => {
          if (this.detailsMap) {
            this.detailsMap.invalidateSize();
          }
        }, 100);

        this.detailsMap.whenReady(() => {
          setTimeout(() => {
            if (this.detailsMap) {
              this.detailsMap.invalidateSize();
            }
            // Set loading to false when map is ready
            this.isMapLoading = false;
          }, 50);
        });

        // Add a timeout to ensure loading state doesn't get stuck
        setTimeout(() => {
          if (this.isMapLoading) {
            this.isMapLoading = false;
          }
        }, 10000); // 10 seconds timeout
      }, 200);
    } catch (error) {
      this.isMapLoading = false;
    }
  }

  private addMarkerToDetailsMap(lat: number, lng: number): void {
    if (!this.detailsMap) {
      return;
    }

    if (this.detailsMarker) {
      try {
        this.detailsMap.removeLayer(this.detailsMarker);
      } catch (e) {
        // Error removing marker
      }
      this.detailsMarker = null;
    }

    try {
      this.detailsMarker = L.marker([lat, lng], {
        icon: this.customIcon,
        draggable: this.detailsMode !== 'view',
        title:
          this.detailsMode === 'view'
            ? this.translate.instant('INITIATIVE.MAP.LOCATION_MARKER') ||
            'Location marker'
            : this.translate.instant('INITIATIVE.MAP.DRAG_MARKER') ||
            'Click and drag to move the marker',
      }).addTo(this.detailsMap);

      if (this.detailsMode !== 'view') {
        this.detailsMarker.on('dragend', (e: any) => {
          const position = e.target.getLatLng();
          const newLat = parseFloat(position.lat.toFixed(6));
          const newLng = parseFloat(position.lng.toFixed(6));
          this.updateDetailsCoordinates(newLat, newLng);
        });
      }

      const popupContent = `
        <div style="font-family: inherit; font-size: 14px;">
          <strong>📍 ${this.detailsMode === 'view'
          ? this.translate.instant('INITIATIVE.MAP.LOCATION_MARKER') ||
          'Location'
          : this.translate.instant('INITIATIVE.MAP.SELECTED_LOCATION') ||
          'Selected Location'
        }</strong><br/>
          <strong>Lat:</strong> ${lat.toFixed(6)}<br/>
          <strong>Lng:</strong> ${lng.toFixed(6)}<br/>
          ${this.detailsMode !== 'view'
          ? '<small style="color: #666;">Drag marker to adjust position</small>'
          : ''
        }
        </div>
      `;

      this.detailsMarker.bindPopup(popupContent, {
        offset: [0, -30],
        closeButton: true,
        autoClose: false,
      });

      if (this.detailsMode !== 'view') {
        this.detailsMarker.openPopup();
        this.toastr.success(
          this.translate.instant('INITIATIVE.MAP.LOCATION_SELECTED') ||
          'Location selected! You can drag the marker to adjust the position.'
        );
      }
    } catch (error) {
      // Error adding marker
    }
  }

  private updateDetailsCoordinates(lat: number, lng: number): void {
    this.selectedCoordinates = { lat, lng };
    this.detailsForm.patchValue({
      locationCoordinates: `${lat}/${lng}`,
    });
    // Get address from coordinates
    this.getAddressFromCoordinates(lat, lng);
  }

  // New method to handle manual coordinate input
  onManualCoordinateInput(): void {
    const coordinatesValue = this.detailsForm.get('locationCoordinates')?.value;
    if (!coordinatesValue) return;

    try {
      // Try to parse as lat/lng format
      const [latStr, lngStr] = coordinatesValue.split('/');
      const lat = parseFloat(latStr.trim());
      const lng = parseFloat(lngStr.trim());

      if (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        this.selectedCoordinates = { lat, lng };
        this.addMarkerToDetailsMap(lat, lng);
        if (this.detailsMap) {
          this.detailsMap.setView([lat, lng], 15);
        }
        this.getAddressFromCoordinates(lat, lng);
        this.toastr.success(
          this.translate.instant('INITIATIVE.MAP.COORDINATES_SET') ||
          'Coordinates set successfully'
        );
      } else {
        this.toastr.error(
          this.translate.instant('INITIATIVE.MAP.INVALID_COORDINATES') ||
          'Invalid coordinates. Please use format: latitude/longitude (e.g., 25.2048/55.2708)'
        );
      }
    } catch (error) {
      this.toastr.error(
        this.translate.instant('INITIATIVE.MAP.INVALID_COORDINATES_FORMAT') ||
        'Invalid coordinates format. Please use: latitude/longitude'
      );
    }
  }

  // Enhanced method to get address from coordinates (reverse geocoding) with English/Arabic mapping
  getAddressFromCoordinates(lat: number, lng: number): Promise<void> {
    this.isMapLoading = true;
    this.addressFromCoordinates = '';

    // Get English address first
    const englishUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`;

    // Add a timeout to the fetch request
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 seconds timeout
    });

    return Promise.race([fetch(englishUrl), timeoutPromise])
      .then((response: Response) => response.json())
      .then((englishData) => {
        if (englishData && englishData.display_name) {
          this.addressFromCoordinates =
            typeof englishData.display_name === 'string'
              ? englishData.display_name
              : JSON.stringify(englishData.display_name);

          // Get Arabic address
          const arabicUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`;

          return Promise.race([fetch(arabicUrl), timeoutPromise])
            .then((response: Response) => response.json())
            .then((arabicData) => {
              this.isMapLoading = false;

              // Map the address data to location names
              this.mapAddressToLocationNames(englishData, arabicData);
              return Promise.resolve();
            });
        } else {
          this.isMapLoading = false;
          return Promise.resolve();
        }
      })
      .catch((error) => {
        this.isMapLoading = false;
        this.toastr.error(
          this.translate.instant('INITIATIVE.MAP.ERROR_GETTING_ADDRESS') ||
          'Error getting address from coordinates'
        );
        return Promise.reject(error);
      });
  }

  // New method to map address data to English and Arabic location names
  private mapAddressToLocationNames(englishData: any, arabicData: any): void {
    const currentLocationNameEn = this.detailsForm.get('locationNameEn')?.value;
    const currentLocationNameAr = this.detailsForm.get('locationNameAr')?.value;
    const currentRegion = this.detailsForm.get('region')?.value;

    // Build English location name
    let englishLocationName = '';
    let englishRegion = '';
    if (englishData.address) {
      const englishParts = [];
      if (englishData.address.road) englishParts.push(englishData.address.road);
      if (englishData.address.suburb) englishParts.push(englishData.address.suburb);
      if (englishData.address.city) englishParts.push(englishData.address.city);

      // Region (choose whichever matches your business logic best)
      if (englishData.address.state_district) {
        englishParts.push(englishData.address.state_district);
        englishRegion = englishData.address.state_district;
      } else if (englishData.address.county) {
        englishParts.push(englishData.address.county);
        englishRegion = englishData.address.county;
      }

      if (englishData.address.state) englishParts.push(englishData.address.state);
      if (englishData.address.country) englishParts.push(englishData.address.country);

      if (englishParts.length > 0) {
        englishLocationName = englishParts.join(', ');
      }
    }

    // Build Arabic location name
    let arabicLocationName = '';
    let arabicRegion = '';
    if (arabicData.address) {
      const arabicParts = [];
      if (arabicData.address.road) arabicParts.push(arabicData.address.road);
      if (arabicData.address.suburb) arabicParts.push(arabicData.address.suburb);
      if (arabicData.address.city) arabicParts.push(arabicData.address.city);

      // Region (Arabic)
      if (arabicData.address.state_district) {
        arabicParts.push(arabicData.address.state_district);
        arabicRegion = arabicData.address.state_district;
      } else if (arabicData.address.county) {
        arabicParts.push(arabicData.address.county);
        arabicRegion = arabicData.address.county;
      }

      if (arabicData.address.state) arabicParts.push(arabicData.address.state);
      if (arabicData.address.country) arabicParts.push(arabicData.address.country);

      if (arabicParts.length > 0) {
        arabicLocationName = arabicParts.join(', ');
      }
    }

    const updates: any = {};

    if (!currentLocationNameEn && englishLocationName) {
      updates.locationNameEn = englishLocationName;
    }
    if (!currentLocationNameAr && arabicLocationName) {
      updates.locationNameAr = arabicLocationName;
    }
    if (!currentRegion && (englishRegion || arabicRegion)) {
      updates.region = englishRegion || arabicRegion;
    }

    if (Object.keys(updates).length > 0) {
      this.detailsForm.patchValue(updates);

      const updateMessages = [];
      if (updates.locationNameEn) updateMessages.push('English location name');
      if (updates.locationNameAr) updateMessages.push('Arabic location name');
      if (updates.region) updateMessages.push('Region');

      this.toastr.success(
        this.translate.instant('INITIATIVE.MAP.LOCATION_NAMES_UPDATED') ||
        `Updated: ${updateMessages.join(', ')}`
      );
    }
  }

  // Enhanced method to get coordinates from address (supports both English and Arabic)
  public async getCoordinatesFromDetailAddress(): Promise<void> {
    const locationNameEn = this.detailsForm.get('locationNameEn')?.value;
    const locationNameAr = this.detailsForm.get('locationNameAr')?.value;
    const region = this.detailsForm.get('region')?.value;

    if (!locationNameEn && !locationNameAr) {
      this.toastr.warning(
        this.translate.instant('INITIATIVE.MAP.ENTER_LOCATION_FIRST') ||
        'Please enter a location name first (English or Arabic)'
      );
      return;
    }

    this.spinnerService.show();
    this.isMapLoading = true;

    // Build queries: with region first, then fallback without region
    const baseQuery = locationNameEn || locationNameAr;

    const queries = region ? [`${baseQuery}, ${region}`, baseQuery] : [baseQuery];

    let foundResult: any = null;

    for (const query of queries) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1`;
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data?.length > 0) {
          foundResult = data[0];
          break; // ✅ found something, stop trying
        }
      } catch (err) {
        console.error("Nominatim fetch error:", err);
      }
    }

    this.spinnerService.hide();
    this.isMapLoading = false;

    if (foundResult) {
      const lat = parseFloat(foundResult.lat);
      const lng = parseFloat(foundResult.lon);

      this.addMarkerToDetailsMap(lat, lng);
      this.updateDetailsCoordinates(lat, lng);

      if (this.detailsMap) {
        this.detailsMap.setView([lat, lng], 15);
      }

      // After getting coordinates, also get the full address details
      this.getAddressFromCoordinates(lat, lng);

      this.toastr.success(
        this.translate.instant('INITIATIVE.MAP.COORDINATES_FOUND') ||
        'Coordinates found and set on map'
      );
    } else {
      this.toastr.warning(
        this.translate.instant('INITIATIVE.MAP.NO_COORDINATES_FOUND') ||
        'No coordinates found for this location'
      );
    }
  }

  // Method to use current location
  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.toastr.error(
        this.translate.instant('INITIATIVE.MAP.GEOLOCATION_NOT_SUPPORTED') ||
        'Geolocation is not supported by this browser'
      );
      return;
    }

    this.spinnerService.show();
    this.isMapLoading = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.spinnerService.hide();
        this.isMapLoading = false;
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.addMarkerToDetailsMap(lat, lng);
        this.updateDetailsCoordinates(lat, lng);

        if (this.detailsMap) {
          this.detailsMap.setView([lat, lng], 15);
        }

        this.toastr.success(
          this.translate.instant('INITIATIVE.MAP.CURRENT_LOCATION_SET') ||
          'Current location set successfully'
        );
      },
      (error) => {
        this.spinnerService.hide();
        this.isMapLoading = false;
        let errorMessage =
          this.translate.instant('INITIATIVE.MAP.ERROR_GETTING_LOCATION') ||
          'Error getting current location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              this.translate.instant(
                'INITIATIVE.MAP.LOCATION_PERMISSION_DENIED'
              ) || 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              this.translate.instant('INITIATIVE.MAP.LOCATION_UNAVAILABLE') ||
              'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage =
              this.translate.instant('INITIATIVE.MAP.LOCATION_TIMEOUT') ||
              'Location request timed out';
            break;
        }

        this.toastr.error(errorMessage);
      }
    );
  }

  // Method to handle Enter key press on coordinate input
  onCoordinateInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onManualCoordinateInput();
    }
  }

  clearDetailsCoordinates(): void {
    this.selectedCoordinates = null;
    this.detailsForm.patchValue({ locationCoordinates: '' });
    if (this.detailsMarker && this.detailsMap) {
      this.detailsMap.removeLayer(this.detailsMarker);
      this.detailsMarker = null;
    }

    if (this.detailsMap) {
      const defaultLat = 25.2048;
      const defaultLng = 55.2708;
      this.detailsMap.setView([defaultLat, defaultLng], 13);
    }
  }

  closeDetailModal(): void {
    this.detailsMode = 'add';
    this.editingDetailIndex = null;
    this.selectedCoordinates = null;
    this.detailsForm.reset({ isActive: true });

    // Reset loading state
    this.isMapLoading = false;

    if (this.detailsMap) {
      this.detailsMap.remove();
      this.detailsMap = null;
    }

    // Dismiss the modal
    const modal = document.getElementById('detailModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }

  // Detail form validation helpers
  isDetailFieldInvalid(fieldName: string): boolean {
    const field = this.detailsForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getDetailFieldError(fieldName: string): string {
    const field = this.detailsForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required'])
        return (
          this.translate.instant('INITIATIVE.MESSAGES.FIELD_REQUIRED') ||
          'This field is required'
        );
      if (field.errors['minlength'])
        return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    }
    return '';
  }

  isDetailFieldValid(fieldName: string): boolean {
    const field = this.detailsForm.get(fieldName);
    return field ? field.valid && field.touched && !field.pristine : false;
  }

  // Additional method for deleting individual initiative details
  selectDetailToDelete(
    detail: CreateInitiativeDetailsDto,
    index: number
  ): void {
    this.selectedDetailToDelete = detail;
    this.selectedDetailIndex = index;
    const deleteModal = document.getElementById('deleteDetailModal');
    if (deleteModal) {
      const modal = new (window as any).bootstrap.Modal(deleteModal);
      modal.show();
    }
  }

  deleteDetail(): void {
    if (this.selectedDetailIndex >= 0) {
      this.removeInitiativeDetail(this.selectedDetailIndex);
      this.selectedDetailToDelete = null;
      this.selectedDetailIndex = -1;
      this.toastr.success(
        this.translate.instant('INITIATIVE.MESSAGES.DETAIL_DELETED') ||
        'Initiative detail deleted successfully'
      );
    }
  }

  // Helper method to safely display address text
  getAddressDisplayText(): string {
    if (!this.addressFromCoordinates) {
      return '';
    }

    if (typeof this.addressFromCoordinates === 'string') {
      return this.addressFromCoordinates;
    }

    if (typeof this.addressFromCoordinates === 'object') {
      return JSON.stringify(this.addressFromCoordinates);
    }

    return String(this.addressFromCoordinates);
  }
}
