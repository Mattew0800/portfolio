import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CockpitScreenFrame } from './cockpit-screen-frame';

describe('CockpitScreenFrame', () => {
  let component: CockpitScreenFrame;
  let fixture: ComponentFixture<CockpitScreenFrame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CockpitScreenFrame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CockpitScreenFrame);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
