import { ComponentFixture, TestBed } from '@angular/core/testing';

import { caseSearchComponent } from './caseSearch.component';

describe('caseSearchComponent', () => {
  let component: caseSearchComponent;
  let fixture: ComponentFixture<caseSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [caseSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(caseSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
