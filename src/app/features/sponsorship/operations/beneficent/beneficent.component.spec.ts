import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficentComponent } from './beneficent.component';

describe('BeneficentComponent', () => {
  let component: BeneficentComponent;
  let fixture: ComponentFixture<BeneficentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
