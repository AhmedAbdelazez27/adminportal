import { ComponentFixture, TestBed } from '@angular/core/testing';

import { receiptRPTComponent } from './receiptRPT.component';

describe('receiptRPTComponent', () => {
  let component: receiptRPTComponent;
  let fixture: ComponentFixture<receiptRPTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [receiptRPTComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(receiptRPTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
