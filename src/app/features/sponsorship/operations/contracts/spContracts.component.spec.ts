import { ComponentFixture, TestBed } from '@angular/core/testing';

import { spContractsComponent } from './spContracts.component';

describe('spContractsComponent', () => {
  let component: spContractsComponent;
  let fixture: ComponentFixture<spContractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [spContractsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(spContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
