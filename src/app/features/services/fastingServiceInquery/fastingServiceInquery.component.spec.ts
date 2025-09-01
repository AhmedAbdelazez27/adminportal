import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FastingServiceInqueryComponent } from './fastingServiceInquery.component';

describe('FastingServiceInqueryComponent', () => {
  let component: FastingServiceInqueryComponent;
  let fixture: ComponentFixture<FastingServiceInqueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FastingServiceInqueryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FastingServiceInqueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
