import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArMiscReceiptHeaderComponent } from './ArMiscReceiptHeader.component';

describe('ArMiscReceiptHeaderComponent', () => {
  let component: ArMiscReceiptHeaderComponent;
  let fixture: ComponentFixture<ArMiscReceiptHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArMiscReceiptHeaderComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ArMiscReceiptHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
