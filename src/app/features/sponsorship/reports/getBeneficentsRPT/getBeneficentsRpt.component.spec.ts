import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getBeneficentsRptComponent } from './getBeneficentsRpt.component';


describe('getBeneficentsRptComponent', () => {
  let component: getBeneficentsRptComponent;
  let fixture: ComponentFixture<getBeneficentsRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getBeneficentsRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(getBeneficentsRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
