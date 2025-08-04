import { ComponentFixture, TestBed } from '@angular/core/testing';

import { orderListBranchRptComponent } from './orderListBranchRpt.component';

describe('orderListBranchRptComponent', () => {
  let component: orderListBranchRptComponent;
  let fixture: ComponentFixture<orderListBranchRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [orderListBranchRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(orderListBranchRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
