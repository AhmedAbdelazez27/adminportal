import { ComponentFixture, TestBed } from '@angular/core/testing';

import { totalRequestsEntitiesRPTComponent } from './totalRequestsEntitiesRPT.component';

describe('totalRequestsEntitiesRPTComponent', () => {
  let component: totalRequestsEntitiesRPTComponent;
  let fixture: ComponentFixture<totalRequestsEntitiesRPTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [totalRequestsEntitiesRPTComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(totalRequestsEntitiesRPTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
