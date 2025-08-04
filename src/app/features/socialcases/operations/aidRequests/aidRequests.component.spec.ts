import { ComponentFixture, TestBed } from '@angular/core/testing';

import { aidRequestsComponent } from './aidRequests.component';

describe('aidRequestsComponent', () => {
  let component: aidRequestsComponent;
  let fixture: ComponentFixture<aidRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [aidRequestsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(aidRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
