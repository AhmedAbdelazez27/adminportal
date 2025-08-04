import { ComponentFixture, TestBed } from '@angular/core/testing';

import { projectCountryListRptComponent } from './projectCountryListRpt.component';

describe('projectCountryListRptComponent', () => {
  let component: projectCountryListRptComponent;
  let fixture: ComponentFixture<projectCountryListRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [projectCountryListRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(projectCountryListRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
