import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CockpitViewerComponent } from './cockpit-viewer';

describe('CockpitViewer', () => {
  let component: CockpitViewerComponent;
  let fixture: ComponentFixture<CockpitViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CockpitViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CockpitViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
