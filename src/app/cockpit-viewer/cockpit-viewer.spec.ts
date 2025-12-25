import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CockpitViewer } from './cockpit-viewer';

describe('CockpitViewer', () => {
  let component: CockpitViewer;
  let fixture: ComponentFixture<CockpitViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CockpitViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CockpitViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
