import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceReviewRptComponent } from './balanceReviewRpt.component';

describe('BalanceReviewRptComponent', () => {
  let component: BalanceReviewRptComponent;
  let fixture: ComponentFixture<BalanceReviewRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceReviewRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BalanceReviewRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
