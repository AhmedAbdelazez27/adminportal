import { ComponentFixture, TestBed } from '@angular/core/testing';

import { projectTypeListRptComponent } from './projectTypeListRpt.component';

describe('projectTypeListRptComponent', () => {
  let component: projectTypeListRptComponent;
  let fixture: ComponentFixture<projectTypeListRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [projectTypeListRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(projectTypeListRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
