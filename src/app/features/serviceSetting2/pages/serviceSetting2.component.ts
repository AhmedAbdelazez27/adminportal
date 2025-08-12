import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ServiceSettingService } from '../../../core/services/serviceSetting.service';
import { AttachmentsConfigService } from '../../../core/services/attachments/attachments-config.service';
import { AttachmentsConfigTypeService } from '../../../core/services/attachments/attachments-config-type.service';
import { DepartmentService } from '../../../core/services/department.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  ServiceDto,
  CreateServiceDto,
  UpdateServiceDto,
  GetAllServicesParameters,
  AttributeDto,
  ServiceDepartmentDto,
  SERVICE_TYPE_OPTIONS,
  ServiceType,
  ReferenceAttributeType,
  PagedResultDto,
} from '../../../core/dtos/serviceSetting/serviceSetting.dto';
import {
  AttachmentsConfigDto,
  CreateAttachmentsConfigDto,
  UpdateAttachmentsConfigDto,
} from '../../../core/dtos/attachments/attachments-config.dto';
import { GenericDataTableComponent } from '../../../../shared/generic-data-table/generic-data-table.component';
import { ColDef } from 'ag-grid-community';
import { Router } from '@angular/router';

/**
 * This component is an exact copy of `ServiceSettingComponent` but will be progressively
 * tailored based on the spec in `new edit for service action.txt`.
 * All plain HTML tables will gradually be replaced with the shared `GenericDataTableComponent`.
 */
@Component({
  selector: 'app-service-setting2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
    GenericDataTableComponent,
  ],
  templateUrl: './serviceSetting2.component.html',
  styleUrl: './serviceSetting2.component.scss',
})
export class ServiceSetting2Component {
  // Basic state for generic table
  services: ServiceDto[] = [];
  totalCount: number = 0;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  columnDefs: ColDef[] = [];
  rowActions: Array<{ label: string; icon?: string; action: string }> = [];
  columnHeaderMap: { [key: string]: string } = {};

  searchValue: string = '';

  constructor(
    private serviceSettingService: ServiceSettingService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.initializeColumnDefs();
    this.initializeRowActions();
    this.loadData();
  }

  // ---------------------------------------------
  // INITIALIZATION HELPERS
  // ---------------------------------------------
  private initializeColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: '#',
        field: 'index',
        width: 80,
        cellRenderer: (params: any) => {
          return (
            (this.currentPage - 1) * this.itemsPerPage +
            params.node.rowIndex +
            1
          );
        },
        sortable: false,
        filter: false,
      },
      {
        field: 'serviceName',
        headerName: this.translate.instant('SERVICE_SETTING.SERVICE_NAME'),
        width: 200,
        sortable: true,
        filter: true,
      },
      {
        field: 'serviceNameEn',
        headerName: this.translate.instant('SERVICE_SETTING.SERVICE_NAME_EN'),
        width: 200,
        sortable: true,
        filter: true,
      },
      {
        field: 'serviceRefrenceNo',
        headerName: this.translate.instant(
          'SERVICE_SETTING.SERVICE_REFERENCE_NO'
        ),
        width: 150,
        sortable: true,
        filter: true,
      },
      {
        field: 'serviceTypeName',
        headerName: this.translate.instant('SERVICE_SETTING.SERVICE_TYPE'),
        width: 150,
        sortable: true,
        filter: true,
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

    // Header map for translation (can be updated later)
    this.columnHeaderMap = {
      serviceId: this.translate.instant('SERVICE_SETTING.SERVICE_ID'),
      serviceName: this.translate.instant('SERVICE_SETTING.SERVICE_NAME'),
      serviceNameEn: this.translate.instant('SERVICE_SETTING.SERVICE_NAME_EN'),
      serviceRefrenceNo: this.translate.instant(
        'SERVICE_SETTING.SERVICE_REFERENCE_NO'
      ),
      serviceTypeName: this.translate.instant('SERVICE_SETTING.SERVICE_TYPE'),
      active: this.translate.instant('SERVICE_SETTING.ACTIVE'),
    };
  }

  private initializeRowActions(): void {
    this.rowActions = [
      {
        label: this.translate.instant('SERVICE_SETTING.VIEW'),
        icon: 'icon-frame-view',
        action: 'view',
      },
      {
        label: this.translate.instant('SERVICE_SETTING.EDIT'),
        icon: 'icon-frame-edit',
        action: 'edit',
      },
      {
        label: this.translate.instant('SERVICE_SETTING.ADD_WORKFLOW'),
        icon: 'icon-frame-entities',
        action: 'addWorkFlow',
      },
    ];
  }

  // ---------------------------------------------
  // DATA LOADING
  // ---------------------------------------------
  loadData(): void {
    this.getServices(this.currentPage);
  }

  getServices(page: number): void {
    const params = {
      Skip: (page - 1) * this.itemsPerPage,
      Take: this.itemsPerPage,
      SearchValue: this.searchValue,
    } as any as GetAllServicesParameters;

    this.serviceSettingService.getAll(params).subscribe({
      next: (res) => {
        this.services = res.data ?? [];
        this.totalCount = res.totalCount;
      },
      error: () => {
        // Handle later
      },
    });
  }

  // ---------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------
  onPageChange(event: { pageNumber: number; pageSize: number }): void {
    this.currentPage = event.pageNumber;
    this.itemsPerPage = event.pageSize;
    this.loadData();
  }

  onSearch(searchText: string): void {
    this.searchValue = searchText;
    this.loadData();
  }

  onActionClick(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'view':
        this.router.navigate([`/serviceSetting2/${event.row.serviceId}/view`]);
        break;
      case 'edit':
        this.router.navigate([`/serviceSetting2/${event.row.serviceId}/edit`]);
        break;
      case 'addWorkFlow':
        this.router.navigate([
          `/serviceSetting2/${event.row.serviceId}/workflow`,
        ]);
        break;
    }
  }
}
