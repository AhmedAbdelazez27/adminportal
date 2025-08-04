import { ComponentFixture, TestBed } from '@angular/core/testing';
import { benifcientTotalRptComponent } from './benifcientTotalRpt.component';


describe('benifcientTotalRptComponent', () => {
  let component: benifcientTotalRptComponent;
  let fixture: ComponentFixture<benifcientTotalRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [benifcientTotalRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(benifcientTotalRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
