import { ComponentFixture, TestBed } from '@angular/core/testing';

import { casesEntitiesRptComponent } from './casesEntitiesRpt.component';

describe('casesEntitiesRptComponent', () => {
  let component: casesEntitiesRptComponent;
  let fixture: ComponentFixture<casesEntitiesRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [casesEntitiesRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(casesEntitiesRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
