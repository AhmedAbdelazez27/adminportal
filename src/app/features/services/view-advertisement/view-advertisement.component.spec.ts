import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { ViewAdvertisementComponent } from './view-advertisement.component';
import { MainApplyService } from '../../../core/services/mainApplyService/mainApplyService.service';
import { WorkFlowCommentsService } from '../../../core/services/mainApplyService/workFlowComments.service';
import { AttachmentService } from '../../../core/services/attachments/attachment.service';
import { AdvertisementsService } from '../../../core/services/mainApplyService/advertisement.service';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { SpinnerService } from '../../../core/services/spinner.service';

describe('ViewAdvertisementComponent', () => {
  let component: ViewAdvertisementComponent;
  let fixture: ComponentFixture<ViewAdvertisementComponent>;
  let mockMainApplyService: jasmine.SpyObj<MainApplyService>;
  let mockWorkFlowCommentsService: jasmine.SpyObj<WorkFlowCommentsService>;
  let mockAttachmentService: jasmine.SpyObj<AttachmentService>;
  let mockAdvertisementService: jasmine.SpyObj<AdvertisementsService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockSpinnerService: jasmine.SpyObj<SpinnerService>;

  const mockServiceData = {
    id: 113090,
    userId: "95f7250d-9786-4a4c-8a07-afbeb195a74d",
    serviceId: 5,
    applyDate: "2025-09-03T17:26:16.0250205",
    applyNo: "24",
    parentId: 101929,
    lastStatus: "جديد",
    lastStatusEN: "New",
    lastModified: "2025-09-03T13:26:16.0283748",
    permitNumber: "",
    service: {
      serviceId: 5,
      serviceName: "طلب اعلان فعالية او حملة تبرع",
      serviceNameEn: "Request for advertisement of an event or a donation campaign"
    },
    workFlowSteps: [],
    attachments: [],
    requestAdvertisement: {
      id: 53,
      mainApplyServiceId: 113090,
      adTitle: "Test Advertisement",
      startDate: "2025-08-23T13:25:00",
      endDate: "2025-08-26T13:25:00",
      advertisementStatus: 4,
      advertisementStatusName: "Under Process",
      requestAdvertisementTargets: [],
      requestAdvertisementAdLocations: [],
      requestAdvertisementAdMethods: []
    }
  };

  beforeEach(async () => {
    const mainApplyServiceSpy = jasmine.createSpyObj('MainApplyService', ['getDetailById', 'updateStatus']);
    const workFlowCommentsServiceSpy = jasmine.createSpyObj('WorkFlowCommentsService', ['getWorkFlowComments', 'createWorkFlowComment']);
    const attachmentServiceSpy = jasmine.createSpyObj('AttachmentService', ['uploadAttachment']);
    const advertisementServiceSpy = jasmine.createSpyObj('AdvertisementsService', ['getAdvertisement']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const translationServiceSpy = jasmine.createSpyObj('TranslationService', ['getCurrentLanguage']);
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    const spinnerServiceSpy = jasmine.createSpyObj('SpinnerService', ['show', 'hide']);

    await TestBed.configureTestingModule({
      imports: [
        ViewAdvertisementComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        ToastrModule.forRoot()
      ],
      providers: [
        { provide: MainApplyService, useValue: mainApplyServiceSpy },
        { provide: WorkFlowCommentsService, useValue: workFlowCommentsServiceSpy },
        { provide: AttachmentService, useValue: attachmentServiceSpy },
        { provide: AdvertisementsService, useValue: advertisementServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TranslationService, useValue: translationServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
        { provide: SpinnerService, useValue: spinnerServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewAdvertisementComponent);
    component = fixture.componentInstance;

    mockMainApplyService = TestBed.inject(MainApplyService) as jasmine.SpyObj<MainApplyService>;
    mockWorkFlowCommentsService = TestBed.inject(WorkFlowCommentsService) as jasmine.SpyObj<WorkFlowCommentsService>;
    mockAttachmentService = TestBed.inject(AttachmentService) as jasmine.SpyObj<AttachmentService>;
    mockAdvertisementService = TestBed.inject(AdvertisementsService) as jasmine.SpyObj<AdvertisementsService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockTranslationService = TestBed.inject(TranslationService) as jasmine.SpyObj<TranslationService>;
    mockToastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    mockSpinnerService = TestBed.inject(SpinnerService) as jasmine.SpyObj<SpinnerService>;

    // Setup default return values
    mockMainApplyService.getDetailById.and.returnValue(of(mockServiceData));
    mockWorkFlowCommentsService.getWorkFlowComments.and.returnValue(of([]));
    mockAuthService.getCurrentUser.and.returnValue({ id: '1', name: 'Test User' });
    mockTranslationService.getCurrentLanguage.and.returnValue('en');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize columns on init', () => {
    component.ngOnInit();
    expect(component.workFlowCommentsColumns.length).toBeGreaterThan(0);
    expect(component.attachmentsColumns.length).toBeGreaterThan(0);
    expect(component.targetsColumns.length).toBeGreaterThan(0);
    expect(component.methodsColumns.length).toBeGreaterThan(0);
    expect(component.locationsColumns.length).toBeGreaterThan(0);
  });

  it('should load service data on init', () => {
    spyOn(component as any, 'loadServiceData');
    component.ngOnInit();
    expect(component['loadServiceData']).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const testDate = '2025-09-03T17:26:16.0250205';
    const result = component.formatDate(testDate);
    expect(result).toBeTruthy();
    expect(result).toContain('9/3/2025'); // Assuming US locale
  });

  it('should format datetime correctly', () => {
    const testDate = '2025-09-03T17:26:16.0250205';
    const result = component.formatDateTime(testDate);
    expect(result).toBeTruthy();
    expect(result).toContain('9/3/2025'); // Assuming US locale
  });

  it('should handle empty date gracefully', () => {
    expect(component.formatDate(undefined)).toBe('');
    expect(component.formatDate('')).toBe('');
    expect(component.formatDateTime(undefined)).toBe('');
    expect(component.formatDateTime('')).toBe('');
  });

  it('should initialize comment form with validators', () => {
    expect(component.commentForm).toBeTruthy();
    expect(component.commentForm.get('comment')?.hasError('required')).toBeTruthy();
  });

  it('should validate comment form correctly', () => {
    const commentControl = component.commentForm.get('comment');
    
    // Test required validation
    expect(commentControl?.hasError('required')).toBeTruthy();
    
    // Test minlength validation
    commentControl?.setValue('short');
    expect(commentControl?.hasError('minlength')).toBeTruthy();
    
    // Test valid input
    commentControl?.setValue('This is a valid comment with enough characters');
    expect(commentControl?.valid).toBeTruthy();
  });

  it('should call router.navigate on goBack', () => {
    spyOn(component['router'], 'navigate');
    component.goBack();
    expect(component['router'].navigate).toHaveBeenCalledWith(['/mainServices/services']);
  });

  it('should show spinner when loading data', () => {
    component['loadServiceData']();
    expect(mockSpinnerService.show).toHaveBeenCalled();
  });

  it('should process service data correctly', () => {
    component.mainApplyService = mockServiceData;
    component['processServiceData']();
    
    expect(component.requestAdvertisement).toBe(mockServiceData.requestAdvertisement);
    expect(component.workFlowSteps).toBe(mockServiceData.workFlowSteps);
    expect(component.attachments).toBe(mockServiceData.attachments);
  });
});
