import { ComponentFixture, TestBed } from '@angular/core/testing';
import { caseAidEntitiesRptComponent } from './caseAidEntitiesRpt.component';


describe('caseAidEntitiesRptComponent', () => {
  let component: caseAidEntitiesRptComponent;
  let fixture: ComponentFixture<caseAidEntitiesRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [caseAidEntitiesRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(caseAidEntitiesRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
