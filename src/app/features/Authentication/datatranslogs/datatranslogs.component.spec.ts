import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTransLogsComponent } from './datatranslogs.component';

describe('DataTransLogsComponent', () => {
  let component: DataTransLogsComponent;
  let fixture: ComponentFixture<DataTransLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTransLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTransLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
