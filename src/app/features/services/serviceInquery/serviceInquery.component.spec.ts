import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceInqueryComponent } from './serviceInquery.component';

describe('ServiceInqueryComponent', () => {
  let component: ServiceInqueryComponent;
  let fixture: ComponentFixture<ServiceInqueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceInqueryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ServiceInqueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
