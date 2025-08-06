import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ServiceSettingService } from '../../../../core/services/serviceSetting.service';
import {
  ServiceDto,
  UpdateServiceDto,
} from '../../../../core/dtos/serviceSetting/serviceSetting.dto';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AttributesListComponent } from '../attributes/attributes-list.component';
import { AttachmentsListComponent } from '../attachments/attachments-list.component';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../../../core/services/spinner.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-service-main',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    AttributesListComponent,
    AttachmentsListComponent,
  ],
  templateUrl: './service-main.component.html',
  styleUrls: ['./service-main.component.scss'],
})
export class ServiceMainComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  serviceId!: number;
  serviceDetails!: ServiceDto;
  isSubmitting = false;

  // Collapse states
  attributesCollapsed = true;
  attachmentsCollapsed = true;

  private languageSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private serviceSettingService: ServiceSettingService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    this.serviceId = +this.route.snapshot.paramMap.get('id')!;
    this.isEditMode = this.route.snapshot.url.some((u) => u.path === 'edit');

    this.buildForm();
    this.loadServiceDetails();

    // Subscribe to language changes to update page title
    this.languageSubscription = this.translate.onLangChange.subscribe(() => {
      this.setPageTitle();
    });
  }

  private setPageTitle(): void {
    if (this.serviceDetails) {
      const currentLang = this.translate.currentLang;
      const serviceName =
        currentLang === 'ar'
          ? this.serviceDetails.serviceName
          : this.serviceDetails.serviceNameEn;
      const mode = this.isEditMode ? 'EDIT' : 'VIEW';
      const title = `${this.translate.instant(
        `SERVICE_SETTING.${mode}`
      )} - ${serviceName}`;
      this.titleService.setTitle(title);
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      serviceName: [{ value: '', disabled: true }],
      serviceNameEn: [{ value: '', disabled: true }],
      serviceRefrenceNo: [{ value: '', disabled: true }],
      serviceTypeName: [{ value: '', disabled: true }],
      descriptionAr: ['', [Validators.maxLength(500)]],
      descriptionEn: ['', [Validators.maxLength(500)]],
      active: [false],
    });

    if (!this.isEditMode) {
      this.form.get('descriptionAr')?.disable();
      this.form.get('descriptionEn')?.disable();
      this.form.get('active')?.disable();
    }

    // Mark all fields as touched when form is submitted
    this.form.valueChanges.subscribe(() => {
      if (this.form.touched) {
        Object.keys(this.form.controls).forEach((key) => {
          const control = this.form.get(key);
          if (control && control.enabled) {
            control.markAsTouched();
          }
        });
      }
    });
  }

  private loadServiceDetails(): void {
    this.spinnerService.show();
    this.serviceSettingService.getById(this.serviceId).subscribe({
      next: (res) => {
        this.serviceDetails = res;
        this.form.patchValue({
          serviceName: res.serviceName,
          serviceNameEn: res.serviceNameEn,
          serviceRefrenceNo: res.serviceRefrenceNo,
          serviceTypeName: res.serviceTypeName,
          descriptionAr: res.descriptionAr,
          descriptionEn: res.descriptionEn,
          active: res.active,
        });
        this.setPageTitle();
        this.spinnerService.hide();
      },
      error: (error: any) => {
        this.toastr.error(
          'Error loading service details: ' +
            (error.error?.message || error.message || 'Unknown error')
        );
        this.spinnerService.hide();
      },
    });
  }

  submit(): void {
    if (!this.isEditMode) {
      return;
    }

    // Mark all fields as touched to show validation errors
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control && control.enabled) {
        control.markAsTouched();
      }
    });

    if (this.form.valid) {
      this.isSubmitting = true;
      this.spinnerService.show();

      // Update existing service
      const updateDto: UpdateServiceDto = {
        serviceId: this.serviceId,
        serviceName: this.serviceDetails.serviceName,
        serviceNameEn: this.serviceDetails.serviceNameEn,
        serviceRefrenceNo: this.serviceDetails.serviceRefrenceNo,
        serviceType: this.serviceDetails.serviceType,
        descriptionAr: this.form.value.descriptionAr,
        descriptionEn: this.form.value.descriptionEn,
        active: this.form.value.active,
        attributes: this.serviceDetails.attributes,
        serviceDepartments: this.serviceDetails.serviceDepartments,
        attachmentsConfigs: this.serviceDetails.attachmentsConfigs,
      };

      this.serviceSettingService.updateAsync(updateDto).subscribe({
        next: (response: ServiceDto) => {
          this.toastr.success(
            this.translate.instant('SERVICE_SETTING.UPDATE_SUCCESS')
          );
          this.router.navigate(['/serviceSetting2']);
          this.spinnerService.hide();
          this.isSubmitting = false;
        },
        error: (error: any) => {
          this.toastr.error(
            'Error updating service: ' +
              (error.error?.message || error.message || 'Unknown error')
          );
          this.spinnerService.hide();
          this.isSubmitting = false;
        },
      });
    } else {
      this.toastr.error('Please fill all required fields correctly');
    }
  }

  back(): void {
    this.router.navigate(['/serviceSetting2']);
  }

  addAttribute(): void {
    // Navigate to attributes page with add mode
    this.router.navigate([`/serviceSetting2/${this.serviceId}/attributes`]);
  }

  addAttachmentConfig(): void {
    // Navigate to attachments page with add mode
    this.router.navigate([`/serviceSetting2/${this.serviceId}/attachments`]);
  }

  toggleAttributesCollapse(): void {
    this.attributesCollapsed = !this.attributesCollapsed;
  }

  toggleAttachmentsCollapse(): void {
    this.attachmentsCollapsed = !this.attachmentsCollapsed;
  }

  // Form validation helper methods
  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control && control.errors && control.touched) {
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

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.valid && control.touched);
  }
}
