import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipModuleScreen } from './ship-module-screen';

describe('ShipModuleScreen', () => {
  let component: ShipModuleScreen;
  let fixture: ComponentFixture<ShipModuleScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipModuleScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipModuleScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
