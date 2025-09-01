import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroSectionSettingComponent } from './hero-section-setting.component';

describe('HeroSectionSettingComponent', () => {
  let component: HeroSectionSettingComponent;
  let fixture: ComponentFixture<HeroSectionSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSectionSettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeroSectionSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
