import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getTotlaBenDonationsRPTComponent } from './getTotlaBenDonationsRPT.component';

describe('getTotlaBenDonationsRPTComponent', () => {
  let component: getTotlaBenDonationsRPTComponent;
  let fixture: ComponentFixture<getTotlaBenDonationsRPTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTotlaBenDonationsRPTComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(getTotlaBenDonationsRPTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
