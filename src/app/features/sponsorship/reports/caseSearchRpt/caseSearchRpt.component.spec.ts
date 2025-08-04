import { ComponentFixture, TestBed } from '@angular/core/testing';
import { caseSearchRptComponent } from './caseSearchRpt.component';


describe('caseSearchRptComponent', () => {
  let component: caseSearchRptComponent;
  let fixture: ComponentFixture<caseSearchRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [caseSearchRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(caseSearchRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
