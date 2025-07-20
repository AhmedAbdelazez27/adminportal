import { ComponentFixture, TestBed } from '@angular/core/testing';

import { generalLJournalRptComponent } from './generalLJournalRpt.component';

describe('generalLJournalRptComponent', () => {
  let component: generalLJournalRptComponent;
  let fixture: ComponentFixture<generalLJournalRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [generalLJournalRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(generalLJournalRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
