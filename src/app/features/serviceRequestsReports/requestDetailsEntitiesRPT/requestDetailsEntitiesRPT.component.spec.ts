import { ComponentFixture, TestBed } from '@angular/core/testing';

import { requestDetailsEntitiesRPTComponent } from './requestDetailsEntitiesRPT.component';

describe('requestDetailsEntitiesRPTComponent', () => {
  let component: requestDetailsEntitiesRPTComponent;
  let fixture: ComponentFixture<requestDetailsEntitiesRPTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [requestDetailsEntitiesRPTComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(requestDetailsEntitiesRPTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
