import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DepartmentService } from '../../../../core/services/department.service';
import { Select2Service } from '../../../../core/services/Select2.service';
import { ServiceSettingService } from '../../../../core/services/serviceSetting.service';
import {
  ServiceDepartmentDto,
  ServiceDto,
  UpdateServiceDto,
} from '../../../../core/dtos/serviceSetting/serviceSetting.dto';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FndLookUpValuesSelect2RequestDto } from '../../../../core/dtos/FndLookUpValuesdtos/FndLookUpValues.dto';
import { environment } from '../../../../../environments/environment';

interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-service-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    TranslateModule,
  ],
  templateUrl: './service-department-form.component.html',
  styleUrls: ['./service-department-form.component.scss'],
})
export class ServiceDepartmentFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  serviceId!: number;
  deptIdParam?: number;

  serviceDetails!: ServiceDto;

  departmentOptions: SelectOption[] = [];
  departmentActionOptions: SelectOption[] = [];
  isLoadingDepartments = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private select2Service: Select2Service,
    private serviceSettingService: ServiceSettingService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.serviceId = +this.route.snapshot.paramMap.get('id')!;
    const deptIdSnapshot = this.route.snapshot.paramMap.get('deptId');
    this.deptIdParam = deptIdSnapshot ? +deptIdSnapshot : undefined;
    this.isEditMode = !!this.deptIdParam;

    this.buildForm();
    this.testApiConnectivity();
    // Remove automatic department loading - will load on dropdown click
    this.loadServiceDetails();
    this.initializeDepartmentActions();
  }

  // Method to load departments when dropdown is opened
  onDepartmentDropdownOpen(): void {
    if (this.departmentOptions.length === 0 && !this.isLoadingDepartments) {
      this.loadDepartments();
    }
  }

  // Method to manually refresh departments
  refreshDepartments(): void {
    this.departmentOptions = [];
    this.loadDepartments();
  }

  private testApiConnectivity(): void {
    // API connectivity test removed for production
  }

  private buildForm(): void {
    this.form = this.fb.group({
      deptId: [null, Validators.required],
      serviceLevel: [1, [Validators.required, Validators.min(1)]],
      departmentAction: [null, Validators.required],
      stepName: [''],
    });
  }

  private loadDepartments(): void {
    this.isLoadingDepartments = true;

    // Try using Select2Service first (recommended approach)
    const params = new FndLookUpValuesSelect2RequestDto();
    params.skip = 0;
    params.take = 1000;
    params.searchValue = '';

    this.select2Service.getDeptSelect2(params).subscribe({
      next: (res) => {
        if (res && res.results && res.results.length > 0) {
          this.departmentOptions = res.results.map((d: any) => ({
            value: d.id,
            label: d.text || `${d.aname || ''} / ${d.ename || ''}`,
          }));
        } else {
          // Fallback to DepartmentService if Select2Service doesn't work
          this.loadDepartmentsFallback();
        }
        this.isLoadingDepartments = false;
      },
      error: (error) => {
        // Fallback to DepartmentService
        this.loadDepartmentsFallback();
      },
    });
  }

  private loadDepartmentsFallback(): void {
    this.departmentService.getDepartments(0, 1000).subscribe({
      next: (res) => {
        if (res && (res.items || res.data || res.results)) {
          const departments = res.items || res.data || res.results || [];
          this.departmentOptions = departments.map((d: any) => ({
            value: d.dept_ID || d.id,
            label: `${d.aname || d.name || ''} / ${d.ename || d.nameEn || ''}`,
          }));
        } else {
          this.departmentOptions = [];
        }
        this.isLoadingDepartments = false;
      },
      error: (error) => {
        this.departmentOptions = [];
        this.isLoadingDepartments = false;
      },
    });
  }

  private loadServiceDetails(): void {
    this.serviceSettingService.getById(this.serviceId).subscribe({
      next: (res) => {
        this.serviceDetails = res;
        if (this.isEditMode) {
          const dept = (res.serviceDepartments || []).find(
            (d) => d.serviceDeptId === this.deptIdParam
          );
          if (dept) {
            this.form.patchValue({
              deptId: dept.deptId,
              serviceLevel: dept.serviceLevel,
              departmentAction: dept.departmentAction,
              stepName: dept.stepName,
            });
          }
        }
      },
    });
  }

  private initializeDepartmentActions(): void {
    this.departmentActionOptions = [
      {
        value: 1,
        label: this.translate.instant(
          'SERVICE_SETTING.DEPARTMENT_ACTION_APPROVE'
        ),
      },
      {
        value: 2,
        label: this.translate.instant(
          'SERVICE_SETTING.DEPARTMENT_ACTION_REJECT'
        ),
      },
      {
        value: 3,
        label: this.translate.instant(
          'SERVICE_SETTING.DEPARTMENT_ACTION_REVIEW'
        ),
      },
      {
        value: 4,
        label: this.translate.instant(
          'SERVICE_SETTING.DEPARTMENT_ACTION_RETURN'
        ),
      },
    ];
  }

  submit(): void {
    if (this.form.invalid || !this.serviceDetails) {
      return;
    }

    const formValue = this.form.value;

    const serviceDepartments: ServiceDepartmentDto[] = [
      ...(this.serviceDetails.serviceDepartments || []),
    ];

    if (this.isEditMode) {
      // update existing
      const index = serviceDepartments.findIndex(
        (d) => d.serviceDeptId === this.deptIdParam
      );
      if (index !== -1) {
        serviceDepartments[index] = {
          ...serviceDepartments[index],
          deptId: formValue.deptId,
          serviceLevel: formValue.serviceLevel,
          departmentAction: formValue.departmentAction,
          stepName: formValue.stepName,
        } as ServiceDepartmentDto;
      }
    } else {
      // add new department
      const newDept: ServiceDepartmentDto = {
        serviceDeptId: 0,
        serviceId: this.serviceId,
        deptId: formValue.deptId,
        serviceLevel: formValue.serviceLevel,
        departmentAction: formValue.departmentAction,
        stepName: formValue.stepName,
        departmentActionName: this.departmentActionOptions.find(
          (o) => o.value === formValue.departmentAction
        )?.label,
      } as ServiceDepartmentDto;
      serviceDepartments.push(newDept);
    }

    const updateDto: UpdateServiceDto = {
      serviceId: this.serviceId,
      serviceName: this.serviceDetails.serviceName,
      serviceNameEn: this.serviceDetails.serviceNameEn,
      descriptionAr: this.serviceDetails.descriptionAr,
      descriptionEn: this.serviceDetails.descriptionEn,
      mainServiceClassificationId:
        this.serviceDetails.mainServiceClassificationId,
      subServiceClassificationId:
        this.serviceDetails.subServiceClassificationId,
      serviceRefrenceNo: this.serviceDetails.serviceRefrenceNo,
      serviceType: this.serviceDetails.serviceType,
      active: this.serviceDetails.active,
      lastModified: this.serviceDetails.lastModified,
      attributes: this.serviceDetails.attributes,
      attachmentsConfigs: this.serviceDetails.attachmentsConfigs,
      serviceDepartments,
    } as UpdateServiceDto;

    this.serviceSettingService.updateAsync(updateDto).subscribe({
      next: () => {
        this.router.navigate([`/serviceSetting2/${this.serviceId}/workflow`]);
      },
    });
  }

  cancel(): void {
    this.router.navigate([`/serviceSetting2/${this.serviceId}/workflow`]);
  }
}
