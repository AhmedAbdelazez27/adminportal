import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpCasesComponent } from './spCases.component';

describe('SpCasesComponent', () => {
  let component: SpCasesComponent;
  let fixture: ComponentFixture<SpCasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpCasesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpCasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});



