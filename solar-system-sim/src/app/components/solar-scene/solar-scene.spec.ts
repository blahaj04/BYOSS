import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarScene } from './solar-scene';

describe('SolarScene', () => {
  let component: SolarScene;
  let fixture: ComponentFixture<SolarScene>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolarScene]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolarScene);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
