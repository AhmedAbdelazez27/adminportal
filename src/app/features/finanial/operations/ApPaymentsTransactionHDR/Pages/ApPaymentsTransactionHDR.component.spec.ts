import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApPaymentsTransactionHDRComponent } from './ApPaymentsTransactionHDR.component';

describe('ApPaymentsTransactionHDRComponent', () => {
  let component: ApPaymentsTransactionHDRComponent;
  let fixture: ComponentFixture<ApPaymentsTransactionHDRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApPaymentsTransactionHDRComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ApPaymentsTransactionHDRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
