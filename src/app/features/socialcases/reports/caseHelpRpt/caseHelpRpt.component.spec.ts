import { ComponentFixture, TestBed } from '@angular/core/testing';

import { caseHelpRptComponent } from './caseHelpRpt.component';

describe('caseHelpRptComponent', () => {
  let component: caseHelpRptComponent;
  let fixture: ComponentFixture<caseHelpRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [caseHelpRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(caseHelpRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
