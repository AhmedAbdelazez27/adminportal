import { ComponentFixture, TestBed } from '@angular/core/testing';

import { vendorsPayTransRPTComponent } from './vendorsPayTransRPT.component';

describe('vendorsPayTransRPTComponent', () => {
  let component: vendorsPayTransRPTComponent;
  let fixture: ComponentFixture<vendorsPayTransRPTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [vendorsPayTransRPTComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(vendorsPayTransRPTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
