import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ordersListCityRptComponent } from './ordersListCityRpt.component';

describe('ordersListCityRptComponent', () => {
  let component: ordersListCityRptComponent;
  let fixture: ComponentFixture<ordersListCityRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ordersListCityRptComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ordersListCityRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
