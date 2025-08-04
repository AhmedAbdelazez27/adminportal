import { ComponentFixture, TestBed } from '@angular/core/testing';
import { caseSearchListRptComponent } from './caseSearchListRpt.component';


describe('caseSearchListRptComponent', () => {
  let component: caseSearchListRptComponent;
  let fixture: ComponentFixture<caseSearchListRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [caseSearchListRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(caseSearchListRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
