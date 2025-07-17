import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GLJEComponent } from './gl-je.component';

describe('GLJEComponent', () => {
  let component: GLJEComponent;
  let fixture: ComponentFixture<GLJEComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GLJEComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GLJEComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
