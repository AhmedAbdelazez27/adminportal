import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollsComponentComponent } from './polls-component.component';

describe('PollsComponentComponent', () => {
  let component: PollsComponentComponent;
  let fixture: ComponentFixture<PollsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollsComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PollsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
