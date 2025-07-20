import { ComponentFixture, TestBed } from '@angular/core/testing';

import { catchReceiptRptComponent } from './catchReceiptRpt.component';

describe('catchReceiptRptComponent', () => {
  let component: catchReceiptRptComponent;
  let fixture: ComponentFixture<catchReceiptRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [catchReceiptRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(catchReceiptRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
