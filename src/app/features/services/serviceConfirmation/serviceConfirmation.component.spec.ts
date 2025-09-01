import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceConfirmationComponent } from './serviceConfirmation.component';

describe('ServiceConfirmationComponent', () => {
  let component: ServiceConfirmationComponent;
  let fixture: ComponentFixture<ServiceConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceConfirmationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ServiceConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
