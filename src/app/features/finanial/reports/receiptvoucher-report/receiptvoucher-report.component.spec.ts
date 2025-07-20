import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptvoucherReportComponent } from './receiptvoucher-report.component';

describe('ReceiptvoucherReportComponent', () => {
  let component: ReceiptvoucherReportComponent;
  let fixture: ComponentFixture<ReceiptvoucherReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptvoucherReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiptvoucherReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
