import { ComponentFixture, TestBed } from '@angular/core/testing';

import { casePaymentComponent } from './casePayment.component';

describe('casePaymentComponent', () => {
  let component: casePaymentComponent;
  let fixture: ComponentFixture<casePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [casePaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(casePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
